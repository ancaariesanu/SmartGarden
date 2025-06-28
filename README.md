# 🌱 SmartGarden

Un sistem inteligent de monitorizare și întreținere a plantelor, ce combină senzori fizici, analiză AI și o interfață web modernă pentru a-ți menține grădina sănătoasă – chiar și de la distanță!

---

## 🧠 Funcționalități

- 📷 **Analiză AI a plantelor** – identifică boli din imagini folosind HuggingFace și MobileNet.
- 🌡️ **Monitorizare senzori** – temperatură, umiditate aer, umiditate sol, lumină.
- 💧 **Control automat al udării** – prin Arduino, senzor de sol și releu pentru pompă.
- 📊 **Grafic evolutiv** – date istorice de la senzori pentru fiecare plantă.
- 🔐 **Autentificare și securizare** – Firebase Auth + rute private.
- 🪴 **Interfață intuitivă** – adaugă, editează și personalizează plantele tale.

---

## 🖼️ Arhitectură

```
Raspberry Pi + Arduino ↔ Firebase ↔ React Frontend ↔ Express.js Server ↔ AI Model (HuggingFace)
```

---

## 🔧 Tehnologii folosite

### 🖥️ Frontend
- React.js
- React Router
- Tailwind CSS (cu dark mode)
- React Toastify

### 🧠 Backend AI
- Node.js (Express)
- HuggingFace API (`mobilenet_v2_plant-disease-identification`)
- .env pentru token API securizat

### 🔌 Dispozitive hardware
- Arduino UNO
- Raspberry Pi 5
- Senzor umiditate sol (analogic)
- DHT11 – temperatură și umiditate aer
- BH1750 – senzor lumină
- Releu + pompă de apă

### ☁️ Baze de date & autentificare
- Firebase Firestore
- Firebase Auth
- Firebase Realtime Database
---

## 🚀 Instalare locală

### 1. Clonare proiect
git clone https://github.com/ancaariesanu/SmartGarden.git
cd SmartGarden

### 2. Frontend
cd frontend
npm install
npm start

### 3. Backend AI
cd backend
npm install
# Adaugă fișier .env cu:
# HF_API_TOKEN=tokenul_tău_HuggingFace
node server.js

### 4. Raspberry Pi
- Rulează `smartgarden_final.py` pentru citirea senzorilor și comunicarea cu Firebase.
- Asigură-te că ai:
  pip install firebase-admin RPi.GPIO smbus2 adafruit-circuitpython-bh1750

### 5. Arduino
- Deschide `arduino_main.cpp` în Arduino IDE.
- Selectează portul și plăcuța, apoi încarcă codul.
- Arduino transmite valori senzorului de sol prin Serial către Raspberry Pi.

---

## 🧪 Testare AI
1. În interfața web, adaugă o imagine a plantei.
2. Apasă „🧠 Analizează” – imaginea va fi procesată de AI și returnează un mesaj prietenos.
3. Rezultatul este salvat în istoricul plantei.

---

## 📊 Date și grafic
- Dacă planta are un `deviceCode` (ex: ESP123456), datele live de la senzori sunt afișate.
- Poți accesa și istoricul în format grafic.

---
## 👩‍💻 Autori

- 👩‍💻 Anca Arieșanu – [@ancaariesanu](https://github.com/ancaariesanu)

---
