# Attune

Attune helps people with ADHD find the environment they focus best in. A wearable necklace measures your surroundings while you work: sound, light, temperature, humidity and movement. After each session you rate your focus, and the app learns which conditions help you focus. It then nudges you when your environment drifts away from them.

Built by Pransh Dalal and Nathan Apte for the 2025 Congressional App Challenge.

## Features

- **Wearable sensing.** An Arduino Nano 33 BLE Sense streams sound, light, temperature, humidity and motion to the app over Bluetooth Low Energy once a second.
- **Works without the wearable.** If no necklace is connected, the app uses the phone's microphone, accelerometer and camera instead. Light is estimated from the camera's exposure settings.
- **Focus sessions.** Start a timer, work, and then rate your focus from 1 to 10 and answer a short survey (headphones or music, ventilation, location, task type).
- **Focus Zones.** Learns your ideal noise, light, temperature, humidity and motion from your best sessions, and explains which factors correlate with better focus.
- **Adaptive nudges.** During a session, the app checks your environment against your ideal and suggests one short fix when something drifts. Your Yes / Snooze / Not Now answers shape future nudges.
- **Stats.** Weekly focus chart, recent sessions and overall trends.

## How it works

```
Necklace (Arduino Nano 33 BLE Sense)
        │  BLE notify: JSON every second (light, sound, motion, temperature, humidity)
        ▼
Mobile app (Expo / React Native) ──► Firebase Auth + Firestore (sessions, preferences, nudges)
        │  HTTPS
        ▼
Flask API ──► Focus Zones analysis (weighted medians + correlations)
          └─► Nudges (drift detection → Perplexity Sonar)
```

- **Wearable** (`arduino_code/main.cpp`): reads the board's PDM microphone (RMS → approximate dB), APDS-9960 color sensor (luminance-weighted RGB), HS300x temperature/humidity sensor and BMI270 accelerometer, then notifies a custom BLE characteristic with a JSON payload.
- **App** (`client/`): connects with `react-native-ble-plx`, converts the light counts to lux using the ams DN40 application-note formula, and averages every reading over the session.
- **Focus Zones** (`server/routes/analysis_routes.py`): takes your last 20 sessions, keeps the ones rated 7 or higher, and computes a focus-weighted median for each sensor. It also correlates focus with each factor to generate insights.
- **Nudges** (`server/routes/nudge_routes.py`): compares current readings to your ideal with sensor-specific tolerances. When something drifts, it sends the drift and your recent nudge feedback to Perplexity's Sonar model for one short tip.

## Hardware

- Arduino Nano 33 BLE Sense Rev2 (onboard PDM microphone, APDS-9960, HS300x, BMI270), worn as a necklace

All the sensors are built into the board, so the firmware needs no external sensor wiring.

## Repository layout

```
arduino_code/
  main.cpp                 Wearable firmware (sensors + BLE)
client/                    Expo / React Native app (TypeScript)
  app/                     Screens (expo-router): auth, tabs, session flow
  components/              UI, stats and navigation components
  hooks/                   Session, stats, auth and theme hooks
  services/                Firebase and backend API clients
  utils/ble/               BLE client and sensor-data parsing
  utils/lightMeter.ts      Camera-based lux estimate
server/
  app.py                   Flask entry point
  routes/                  session_routes, analysis_routes, nudge_routes
utils/
  icon_wrapper_generator.py  Generates React components for the Heroicons SVGs
```

## Getting started

### Wearable

1. In the Arduino IDE, install the **Arduino Mbed OS Nano Boards** package and the libraries **ArduinoBLE**, **Arduino_APDS9960**, **Arduino_HS300x** and **Arduino_BMI270_BMM150**.
2. Open `arduino_code/main.cpp` (rename it to an `.ino` sketch if your IDE needs one), select the Nano 33 BLE board, and upload.

### Server

Requires Python 3.9+.

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # http://localhost:5000
```

Put a Firebase service account in `server/service_acc.json` and `PERPLEXITY_API_KEY` in `server/.env`. Neither is committed.

### Mobile app

The app uses native modules (BLE, Firebase, MMKV), so it needs a development build rather than Expo Go.

```bash
cd client
npm install
npx expo run:ios         # or: npx expo run:android
```

Set `EXPO_PUBLIC_API_BASE_URL` in `client/.env` to your server's address.

## Tech stack

**Wearable:** Arduino (C++), ArduinoBLE, Arduino sensor libraries
**App:** React Native 0.79, Expo 53, TypeScript, expo-router, react-native-ble-plx, Skia, Victory Native, Zustand, MMKV
**API:** Python, Flask, pandas, NumPy
**Data:** Firebase Auth, Firestore
**AI:** Perplexity Sonar API (nudges)

## Credits

- **Heroicons** by Tailwind Labs ([heroicons.com](https://heroicons.com)), MIT License.
- **Nunito** font by Vernon Adams, via Google Fonts, SIL Open Font License 1.1.
- Started from the `create-expo-app` template (MIT).

## AI disclosure

AI assistance (Claude) was used in this project for documentation, testing, and debugging.
