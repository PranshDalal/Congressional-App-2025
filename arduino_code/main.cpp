#include <ArduinoBLE.h>
#include <Arduino_BMI270_BMM150.h>

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

    // I couldn't figure out the accelerometer so its a dummy one for now 
    // float x = 0.01, y = 0.02, z = 0.98;
    float x = 0.0, y = 0.0, z = 0.0;

    if (IMU.accelerationAvailable()) {
      IMU.readAcceleration(x, y, z);
    }

    String payload = "light:" + String(lightLevel) +
                     ",sound:" + String(soundLevel) +
                     ",accel:" + String(x, 2) + "|" + String(y, 2) + "|" + String(z, 2);

    dataChar.writeValue(payload.c_str());
    Serial.println("Sent: " + payload);

    delay(1000);
  }
}
