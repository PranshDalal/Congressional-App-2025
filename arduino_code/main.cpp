#include <ArduinoBLE.h>
#include <Arduino_BMI270_BMM150.h>
#include <Arduino_HS300x.h>
#include <Arduino_APDS9960.h>
#include <PDM.h>

#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-5678-90ab-cdef-1234567890ab"
#define PAYLOAD_BUFFER_SIZE 128

BLEService envService(SERVICE_UUID);
BLECharacteristic dataChar(
    CHARACTERISTIC_UUID,
    BLERead | BLENotify,
    PAYLOAD_BUFFER_SIZE
);

volatile int samplesRead = 0;
short sampleBuffer[256];
float soundLevel = 0.0;

float luxHistory[5] = {0};
int luxIndex = 0;
float lastLux = 0.0; 

void onPDMdata() {
    int bytesAvailable = PDM.available();
    PDM.read(sampleBuffer, bytesAvailable);
    samplesRead = bytesAvailable / 2;
}

float smoothLux(float lux) {
    luxHistory[luxIndex] = lux;
    luxIndex = (luxIndex + 1) % 5;
    float sum = 0;
    for (int i = 0; i < 5; i++) sum += luxHistory[i];
    return sum / 5.0;
}

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 3000);

    if (!BLE.begin()) {
        Serial.println("BLE failed to start!");
        while (1);
    }

    if (!IMU.begin()) {
        Serial.println("Failed to initialize IMU!");
        while (1);
    }

    if (!HS300x.begin()) {
        Serial.println("Failed to start HS300x sensor!");
        while (1);
    }

    if (!APDS.begin()) {
        Serial.println("Failed to start APDS9960 sensor!");
        while (1);
    }

    APDS.setGestureSensitivity(80);
    delay(100);

    PDM.onReceive(onPDMdata);
    if (!PDM.begin(1, 16000)) {
        Serial.println("Failed to start PDM microphone!");
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
        float x = 0.0, y = 0.0, z = 0.0;
        float motionMagnitude = 0.0;
        if (IMU.accelerationAvailable()) {
            IMU.readAcceleration(x, y, z);
            
            motionMagnitude = sqrt(x*x + y*y + z*z);
            
            Serial.print("Motion - X: "); Serial.print(x);
            Serial.print(" Y: "); Serial.print(y);
            Serial.print(" Z: "); Serial.print(z);
            Serial.print(" Magnitude: "); Serial.println(motionMagnitude);
        }

        float temperature = HS300x.readTemperature();
        float humidity = HS300x.readHumidity();

        if (APDS.colorAvailable()) {
            int r = 0, g = 0, b = 0;
            APDS.readColor(r, g, b);
            
            float lux = (0.2126*r + 0.7152*g + 0.0722*b);
            
            if (lux >= 0 && lux <= 10000) { 
                lastLux = smoothLux(lux);
            }
            
            Serial.print("R: "); Serial.print(r);
            Serial.print(" G: "); Serial.print(g);
            Serial.print(" B: "); Serial.print(b);
            Serial.print(" Lux: "); Serial.println(lastLux);
        }

        if (samplesRead) {
            long sumSquares = 0;
            for (int i = 0; i < samplesRead; i++) {
                sumSquares += (long)sampleBuffer[i] * (long)sampleBuffer[i];
            }
            
            float rms = sqrt((float)sumSquares / samplesRead);
            
            if (rms > 0) {
                soundLevel = 20 * log10(rms / 32768.0) + 90; 
                soundLevel = constrain(soundLevel, 30.0, 90.0); // i am clamping here but this might need to change
            } else {
                soundLevel = 30.0;
            }
            
            samplesRead = 0;
            
            Serial.print("Sound RMS: "); Serial.print(rms);
            Serial.print(" dB: "); Serial.println(soundLevel);
        }

        char payload[PAYLOAD_BUFFER_SIZE];
        int len = snprintf(
            payload,
            PAYLOAD_BUFFER_SIZE,
            "{\"light\":%.2f,\"sound\":%.2f,\"accel\":{\"x\":%.2f,\"y\":%.2f,\"z\":%.2f,\"magnitude\":%.3f},\"temp\":%.2f,\"humidity\":%.2f}",
            lastLux, 
            soundLevel,
            x,
            y,
            z,
            motionMagnitude,
            temperature,
            humidity
        );

        dataChar.writeValue((const void*)payload, len);
        Serial.println("Sent: " + String(payload));

        delay(1000);
    }
}