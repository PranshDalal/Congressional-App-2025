#include <ArduinoBLE.h>
#include <Arduino_BMI270_BMM150.h>
#include <Arduino_HS300x.h>

#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-5678-90ab-cdef-1234567890ab"

BLEService envService(SERVICE_UUID);
BLECharacteristic dataChar(
  CHARACTERISTIC_UUID,
  BLERead | BLENotify | BLEWrite | BLEWriteWithoutResponse,
  128
);

const int lightPin = A1;  
const int micPin   = A0; 

void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (!BLE.begin()) {
    Serial.println("BLE failed to start!");
    while (1);
  }

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  if (!HS300x.begin()) {
    Serial.println("Failed to start temperature and humidity sensor");
    while (1);
  }

  BLE.setLocalName("ADHD_Wearable");
  BLE.setAdvertisedService(envService);

  envService.addCharacteristic(dataChar);
  BLE.addService(envService);

  dataChar.writeValue("Ready");

  BLE.advertise();
  Serial.println("BLE device advertising...");
}

void loop() {
  BLE.poll();

  BLEDevice central = BLE.central();

  if (central && central.connected()) {
    int lightLevel = analogRead(lightPin);
    int soundLevel = analogRead(micPin);

    float x = 0.0, y = 0.0, z = 0.0;

    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(x, y, z);
    }

    float temperature = HS300x.readTemperature();
    float humidity = HS300x.readHumidity();


    // String oldPayload = "light:" + String(lightLevel) +
    //                  ",sound:" + String(soundLevel) +
    //                  ",accel:" + String(x, 2) + "|" + String(y, 2) + "|" + String(z, 2);

    String payload = "{";
    payload += "\"light\":" + String(lightLevel) + ",";
    payload += "\"sound\":" + String(soundLevel) + ",";
    payload += "\"accel\":{";
    payload += "\"x\":" + String(x, 2) + ",";
    payload += "\"y\":" + String(y, 2) + ",";
    payload += "\"z\":" + String(z, 2);
    payload += "},";
    payload += "\"temp\":" + String(temperature, 2) + ",";
    payload += "\"humidity\":" + String(humidity, 2);
    payload += "}";


    dataChar.writeValue(payload.c_str());
    Serial.println("Sent: " + payload);

    delay(1000);
  }
}
