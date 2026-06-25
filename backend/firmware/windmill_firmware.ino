const int ledPin = 13;
const int relayPin = 7;
const int fanPin = 8;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(relayPin, OUTPUT);
  pinMode(fanPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  float voltage = analogRead(A0) * (5.0 / 1023.0) * 2.0;
  float current = analogRead(A1) * (5.0 / 1023.0) * 0.2;
  float rpm = analogRead(A2) * 0.95;
  float temperature = 25.0 + (analogRead(A3) * (5.0 / 1023.0)) * 10.0;
  float windSpeed = analogRead(A4) * (5.0 / 1023.0) * 2.5;

  Serial.print(millis() / 1000);
  Serial.print(',');
  Serial.print(voltage, 2);
  Serial.print(',');
  Serial.print(current, 2);
  Serial.print(',');
  Serial.print(rpm, 0);
  Serial.print(','); 
  Serial.print(temperature, 1);
  Serial.print(',');
  Serial.println(windSpeed, 1);

  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "LED_ON") digitalWrite(ledPin, HIGH);
    if (command == "LED_OFF") digitalWrite(ledPin, LOW);
    if (command == "RELAY_ON") digitalWrite(relayPin, HIGH);
    if (command == "RELAY_OFF") digitalWrite(relayPin, LOW);
    if (command == "FAN_ON") digitalWrite(fanPin, HIGH);
    if (command == "FAN_OFF") digitalWrite(fanPin, LOW);
  }

  delay(1000);
}
