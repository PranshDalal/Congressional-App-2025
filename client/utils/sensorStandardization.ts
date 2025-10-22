/**
 * Sensor Data Standardization Utility
 * 
 * This module standardizes sensor data from different sources (Arduino BLE vs Phone sensors)
 * to ensure consistent ranges and comparable values for environment analysis.
 */

import { CalibrationConfig, DEFAULT_CALIBRATION, getCalibrationConfig } from './calibrationConfig';

export interface StandardizedSensorData {
  light_level: number;      // 0-100 (standardized brightness percentage)
  noise_level: number;      // 30-90 dB (realistic indoor sound range)
  motion_level: number;     // 0-2 (g-force magnitude, clamped for normal movement)
  temp_level: number | null;    // 15-35°C (comfortable indoor temperature range)
  humidity_level: number | null; // 30-70% (comfortable indoor humidity range)
}

export interface RawSensorData {
  light: number;
  sound: number;
  motion: number;
  temp?: number | null;
  humidity?: number | null;
  source: 'bluetooth' | 'phone';
}

/**
 * Standardizes sensor data from different sources to consistent ranges
 */
export function standardizeSensorData(raw: RawSensorData, calibrationPreset?: string): StandardizedSensorData {
  const calibration = getCalibrationConfig(calibrationPreset);
  const { light, sound, motion, temp, humidity, source } = raw;

  // Light Level Standardization (0-100)
  let standardizedLight: number;
  if (source === 'bluetooth') {
    // Arduino: Raw lux values, normalize using calibration
    const range = calibration.light.arduino.luxMax - calibration.light.arduino.luxMin;
    const normalizedLux = (light - calibration.light.arduino.luxMin) / range;
    standardizedLight = Math.max(0, Math.min(100, normalizedLux * 100));
  } else {
    // Phone: Apply calibration scale and offset
    standardizedLight = Math.max(0, Math.min(100, 
      (light * calibration.light.phone.brightnessScale) + calibration.light.phone.brightnessOffset
    ));
  }

  // Sound Level Standardization (30-90 dB realistic range)
  let standardizedSound: number;
  if (source === 'bluetooth') {
    if (calibration.sound.arduino.rmsToDB) {
      // Arduino now outputs dB directly, just clamp to range
      standardizedSound = Math.max(calibration.sound.arduino.dbMin, 
        Math.min(calibration.sound.arduino.dbMax, sound));
    } else {
      // Legacy: Convert RMS to dB equivalent using calibration
      const range = calibration.sound.arduino.dbMax - calibration.sound.arduino.dbMin;
      standardizedSound = Math.max(calibration.sound.arduino.dbMin, 
        Math.min(calibration.sound.arduino.dbMax, 
          calibration.sound.arduino.dbMin + (sound / 100) * range));
    }
  } else {
    // Phone: Apply calibration and clamp to range
    const scaledSound = (sound + calibration.sound.phone.dbOffset) * calibration.sound.phone.dbScale;
    standardizedSound = Math.max(calibration.sound.arduino.dbMin, 
      Math.min(calibration.sound.arduino.dbMax, scaledSound));
  }

  // Motion Level Standardization (0-maxGForce)
  let standardizedMotion: number;
  const motionWithSensitivity = Math.abs(motion) * calibration.motion.sensitivity;
  standardizedMotion = Math.max(0, Math.min(calibration.motion.maxGForce, motionWithSensitivity));

  // Temperature Standardization using calibration
  let standardizedTemp: number | null = null;
  if (temp !== null && temp !== undefined && !isNaN(temp)) {
    standardizedTemp = Math.max(calibration.environment.temperature.min, 
      Math.min(calibration.environment.temperature.max, temp));
  }

  // Humidity Standardization using calibration
  let standardizedHumidity: number | null = null;
  if (humidity !== null && humidity !== undefined && !isNaN(humidity)) {
    standardizedHumidity = Math.max(calibration.environment.humidity.min, 
      Math.min(calibration.environment.humidity.max, humidity));
  }

  return {
    light_level: Math.round(standardizedLight * 10) / 10, // Round to 1 decimal
    noise_level: Math.round(standardizedSound * 10) / 10,
    motion_level: Math.round(standardizedMotion * 1000) / 1000, // Round to 3 decimals
    temp_level: standardizedTemp ? Math.round(standardizedTemp * 10) / 10 : null,
    humidity_level: standardizedHumidity ? Math.round(standardizedHumidity * 10) / 10 : null,
  };
}

/**
 * Calibration constants for fine-tuning standardization
 * Adjust these based on real-world testing
 */
export const CALIBRATION_CONSTANTS = {
  // Light calibration
  ARDUINO_LUX_MAX: 1000,  // Max expected lux for 100% brightness
  PHONE_BRIGHTNESS_SCALE: 1.0, // Multiplier for phone brightness
  
  // Sound calibration  
  ARDUINO_SOUND_DB_MIN: 30,   // Minimum dB equivalent
  ARDUINO_SOUND_DB_MAX: 90,   // Maximum dB equivalent
  PHONE_DB_OFFSET: 110,       // Offset applied to phone microphone
  
  // Motion calibration
  MAX_MOTION_G: 2.0,          // Maximum g-force for normal movement
  
  // Environmental limits
  TEMP_MIN: 15,               // Minimum comfortable temperature
  TEMP_MAX: 35,               // Maximum comfortable temperature
  HUMIDITY_MIN: 30,           // Minimum comfortable humidity
  HUMIDITY_MAX: 70,           // Maximum comfortable humidity
};

/**
 * Advanced standardization with configurable calibration
 */
export function standardizeSensorDataAdvanced(
  raw: RawSensorData, 
  calibration = CALIBRATION_CONSTANTS
): StandardizedSensorData {
  const { light, sound, motion, temp, humidity, source } = raw;

  // Light with calibration
  let standardizedLight: number;
  if (source === 'bluetooth') {
    standardizedLight = Math.max(0, Math.min(100, 
      (light / calibration.ARDUINO_LUX_MAX) * 100
    ));
  } else {
    standardizedLight = Math.max(0, Math.min(100, 
      light * calibration.PHONE_BRIGHTNESS_SCALE
    ));
  }

  // Sound with calibration
  let standardizedSound: number;
  if (source === 'bluetooth') {
    const range = calibration.ARDUINO_SOUND_DB_MAX - calibration.ARDUINO_SOUND_DB_MIN;
    standardizedSound = Math.max(calibration.ARDUINO_SOUND_DB_MIN, 
      Math.min(calibration.ARDUINO_SOUND_DB_MAX, 
        calibration.ARDUINO_SOUND_DB_MIN + (sound / 100) * range
      )
    );
  } else {
    standardizedSound = Math.max(calibration.ARDUINO_SOUND_DB_MIN, 
      Math.min(calibration.ARDUINO_SOUND_DB_MAX, sound)
    );
  }

  // Motion with calibration
  const standardizedMotion = Math.max(0, Math.min(calibration.MAX_MOTION_G, Math.abs(motion)));

  // Temperature with calibration
  let standardizedTemp: number | null = null;
  if (temp !== null && temp !== undefined && !isNaN(temp)) {
    standardizedTemp = Math.max(calibration.TEMP_MIN, 
      Math.min(calibration.TEMP_MAX, temp)
    );
  }

  // Humidity with calibration
  let standardizedHumidity: number | null = null;
  if (humidity !== null && humidity !== undefined && !isNaN(humidity)) {
    standardizedHumidity = Math.max(calibration.HUMIDITY_MIN, 
      Math.min(calibration.HUMIDITY_MAX, humidity)
    );
  }

  return {
    light_level: Math.round(standardizedLight * 10) / 10,
    noise_level: Math.round(standardizedSound * 10) / 10,
    motion_level: Math.round(standardizedMotion * 1000) / 1000,
    temp_level: standardizedTemp ? Math.round(standardizedTemp * 10) / 10 : null,
    humidity_level: standardizedHumidity ? Math.round(standardizedHumidity * 10) / 10 : null,
  };
}