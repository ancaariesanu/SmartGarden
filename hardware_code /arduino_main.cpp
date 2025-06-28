// Include biblioteca de bază Arduino (opțional în multe cazuri, dar utilă în platforme mai complexe)
#include <Arduino.h>

// Funcția care se execută o singură dată la pornirea plăcii
void setup() {
  // Inițializează comunicarea serială la 9600 baud (viteza trebuie să corespundă cu Raspberry Pi)
  Serial.begin(9600);
}

// Funcția care se repetă la nesfârșit
void loop() {
  // Citește o valoare analogică de la senzorul de umiditate (de pe pinul A0)
  // Valoarea va fi între 0 (umed) și 1023 (uscat), în funcție de senzor
  int moisture = analogRead(A0);

  // Trimite valoarea citită prin portul serial către Raspberry Pi
  Serial.println(moisture);

  // Așteaptă 1000 milisecunde (1 secundă) înainte de următoarea citire
  delay(1000);
}
