# ==============================
# Importuri de biblioteci
# ==============================

import time
import board
import adafruit_dht                      # Pentru senzorul DHT11 (temperatură și umiditate aer)
import serial                            # Pentru comunicarea cu Arduino
from datetime import datetime, timedelta
from gpiozero import OutputDevice        # Pentru controlul pompei
import smbus                             # Pentru citirea senzorului de lumină BH1750 (I2C)

# Firebase Admin SDK pentru Firestore
import firebase_admin
from firebase_admin import credentials, firestore

# Pyrebase pentru Realtime Database
import pyrebase

# ==============================
# Configurări Firebase
# ==============================

FIREBASE_CONFIG = {
    "apiKey": "XXX",
    "authDomain": "XXX",
    "databaseURL": "XXX",
    "storageBucket": "XXX"
}

SERVICE_ACCOUNT_PATH = "serviceAccountKey.json"   # Cheia pentru Firestore Admin
DEVICE_CODE = "PFID155736"                        # Cod unic al plantei/senzorului

# ==============================
# Inițializări Firebase și senzori
# ==============================

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)
fs = firestore.client()

firebase = pyrebase.initialize_app(FIREBASE_CONFIG)
rtdb = firebase.database()

# Inițializare senzori fizici
dht_sensor = adafruit_dht.DHT11(board.D27)      # DHT11 pe pinul GPIO27
light_sensor = smbus.SMBus(1)                   # BH1750 pe I2C
BH1750_ADDR = 0x23
CMD_READ = 0x10

pump = OutputDevice(17, active_high=True, initial_value=False)   # Pompa pe pinul GPIO17

ser = serial.Serial('/dev/ttyACM0', 9600)       # Conectare la Arduino prin USB (serial)
time.sleep(2)                                   # Pauză pentru stabilizarea conexiunii

# ==============================
# Găsește utilizatorul și planta după codul unic
# ==============================

def find_user_and_plant(device_code):
    users = fs.collection("users").stream()
    for user in users:
        uid = user.id
        data = user.to_dict()
        for plant in data.get("plants", []):
            if plant.get("deviceCode") == device_code:
                print(f"Găsit: planta {plant['name']} pentru user {uid}")
                return uid, plant["id"], plant
    print("Plantă cu acest deviceCode nu a fost găsită.")
    return None, None, None

USER_UID, PLANT_ID, PLANT_DATA = find_user_and_plant(DEVICE_CODE)
if not USER_UID:
    exit(1)

# ==============================
# Funcții utile pentru citiri și logica de udare
# ==============================

def read_light():
    # Citește valoarea în lux de la BH1750
    data = light_sensor.read_i2c_block_data(BH1750_ADDR, CMD_READ)
    lux = (data[1] + (256 * data[0])) / 1.2
    return round(lux)

def convert_to_percent(raw_value, min_val=300, max_val=800):
    # Conversie valoare brută în procent (calibrare între 0% și 100%)
    percent = 100 - ((raw_value - min_val) * 100 / (max_val - min_val))
    return max(0, min(100, round(percent)))

def send_notification(message, notif_type="auto_watering"):
    # Trimite notificare în Realtime DB
    timestamp = datetime.utcnow().isoformat().replace(":", "-").split(".")[0]
    path = f"realtime_data/{USER_UID}/{PLANT_ID}/notifications/{timestamp}"
    notif = {
        "type": notif_type,
        "message": message,
        "timestamp": timestamp
    }
    rtdb.child(path).set(notif)

def check_water_command():
    # Verifică dacă a fost trimisă o comandă manuală de udare
    path = f"realtime_data/{USER_UID}/{PLANT_ID}/command"
    command = rtdb.child(path).get().val()
    if command and command.get("waterPlant"):
        print("🔔 Comandă manuală primită!")
        pump.on()
        time.sleep(2)
        pump.off()
        rtdb.child(path).remove()
        send_notification("Planta a fost udată manual din aplicație.", "manual_watering")

def deduce_soil_threshold(freq):
    # Prag de umiditate sol în funcție de frecvența aleasă de utilizator
    return {
        "zilnic": 60,
        "3/săpt": 50,
        "2/săpt": 40,
        "1/săpt": 30
    }.get(freq, 35)

def auto_water():
    # Logica de udare automată pe baza datelor din Firebase
    path_sens = f"realtime_data/{USER_UID}/{PLANT_ID}/sensors"
    all_data = rtdb.child(path_sens).get().val()
    if not all_data:
        return

    latest_ts = sorted(all_data.keys())[-1]
    sensor_data = all_data[latest_ts]

    soil = sensor_data.get("SoilMoisture")
    air = sensor_data.get("Humidity")
    temp = sensor_data.get("Temperature")
    light = sensor_data.get("LightLevel")

    now = datetime.utcnow()
    last_auto = rtdb.child(f"realtime_data/{USER_UID}/{PLANT_ID}/last_auto_watering").get().val()
    if last_auto:
        try:
            last_time = datetime.strptime(last_auto, "%Y-%m-%dT%H-%M-%S")
            if now - last_time < timedelta(hours=6):
                return  # Nu uda dacă au trecut mai puțin de 6h
        except:
            pass

    should_water = False

    # Intervalele recomandate pentru fiecare parametru
    thresholds = {
        "airHumidity": {"scăzută": (0, 40), "moderată": (40, 60), "ridicată": (60, 100)},
        "temp": {"scăzută": (0, 18), "medie": (18, 25), "ridicată": (25, 35)},
        "light": {"scăzut": (0, 300), "moderat": (300, 800), "ridicat": (800, 2000)}
    }

    def check_mismatch(value, expected_level, thresh):
        if value is None or expected_level not in thresh:
            return False
        min_val, max_val = thresh[expected_level]
        return not (min_val <= value <= max_val)

    soil_threshold = deduce_soil_threshold(PLANT_DATA.get("waterFreq", ""))
    if soil is not None and soil < soil_threshold:
        should_water = True
        print(f"Sol prea uscat: {soil}% < {soil_threshold}%")

    if check_mismatch(air, PLANT_DATA.get("airHumidity"), thresholds["airHumidity"]):
        should_water = True
        print(f"Umiditatea aerului NU este în parametri: {air}%")

    if check_mismatch(temp, PLANT_DATA.get("temp"), thresholds["temp"]):
        should_water = True
        print(f"Temperatura NU este în parametri: {temp}°C")

    if check_mismatch(light, PLANT_DATA.get("light"), thresholds["light"]):
        should_water = True
        print(f"Lumina NU este în parametri: {light} lux")

    if should_water:
        print("Udare automată...")
        pump.on()
        time.sleep(2)
        pump.off()
        timestamp = now.isoformat().replace(":", "-").split(".")[0]
        rtdb.child(f"realtime_data/{USER_UID}/{PLANT_ID}/last_auto_watering").set(timestamp)
        send_notification("Planta a fost udată automat.")

# ==============================
# Loop principal – se execută continuu
# ==============================

try:
    while True:
        try:
            temp = dht_sensor.temperature
            hum = dht_sensor.humidity
            lux = read_light()

            soil_percent = None

            # Citire de la Arduino (umiditate sol) dacă sunt date disponibile
            if ser.in_waiting > 0:
                raw = ser.readline().decode('utf-8').strip()
                try:
                    soil_raw = int(raw)
                    soil_percent = convert_to_percent(soil_raw)
                except ValueError:
                    pass

            # Afișează datele în consolă
            print(f"T={temp}°C | H={hum}% | Soil={soil_percent}% | Light={lux} lux")

            # Trimite datele în Firebase Realtime Database
            timestamp = datetime.utcnow().isoformat().replace(":", "-").replace(".", "_")
            data = {
                "Temperature": temp,
                "Humidity": hum,
                "SoilMoisture": soil_percent,
                "LightLevel": lux
            }

            rtdb.child("realtime_data").child(USER_UID).child(PLANT_ID).child("sensors").child(timestamp).set(data)

            check_water_command()
            auto_water()

        except Exception as e:
            print("Eroare în buclă:", e)

        # Reset variabilă sol brut
        soil_raw = 0
        time.sleep(5)  # Așteaptă 5 secunde între cicluri

except KeyboardInterrupt:
    print("Oprire manuală.")
    pump.off()
    ser.close()
