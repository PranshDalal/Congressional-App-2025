export interface CalibrationConfig {
  light: {
    arduino: {
      luxMax: number;        // Maximum expected lux value for 100% brightness
      luxMin: number;        // Minimum lux value for 0% brightness
    };
    phone: {
      brightnessScale: number; // Multiplier for phone brightness values
      brightnessOffset: number; // Offset for phone brightness values
    };
  };
  
  sound: {
    arduino: {
      dbMin: number;         // Minimum dB equivalent 
      dbMax: number;         // Maximum dB equivalent
      rmsToDB: boolean;      // Whether Arduino provides RMS that needs conversion
    };
    phone: {
      dbOffset: number;      // Offset applied to phone microphone readings
      dbScale: number;       // Scale factor for phone dB readings
    };
  };
  
  motion: {
    maxGForce: number;       // Maximum g-force for normal movement (clamp ceiling)
    sensitivity: number;     // Sensitivity multiplier for motion detection
  };
  
  environment: {
    temperature: {
      min: number;           // Minimum comfortable temperature (°C)
      max: number;           // Maximum comfortable temperature (°C)
    };
    humidity: {
      min: number;           // Minimum comfortable humidity (%)
      max: number;           // Maximum comfortable humidity (%)
    };
  };
}

// Partial configuration type for presets
type PartialCalibrationConfig = {
  light?: {
    arduino?: Partial<CalibrationConfig['light']['arduino']>;
    phone?: Partial<CalibrationConfig['light']['phone']>;
  };
  sound?: {
    arduino?: Partial<CalibrationConfig['sound']['arduino']>;
    phone?: Partial<CalibrationConfig['sound']['phone']>;
  };
  motion?: Partial<CalibrationConfig['motion']>;
  environment?: {
    temperature?: Partial<CalibrationConfig['environment']['temperature']>;
    humidity?: Partial<CalibrationConfig['environment']['humidity']>;
  };
};

// Default calibration values - adjust these based on testing
export const DEFAULT_CALIBRATION: CalibrationConfig = {
  light: {
    arduino: {
      luxMax: 1000,          // Typical bright indoor lighting
      luxMin: 0,
    },
    phone: {
      brightnessScale: 1.0,  // No scaling by default
      brightnessOffset: 0,
    },
  },
  
  sound: {
    arduino: {
      dbMin: 30,             // Quiet room
      dbMax: 90,             // Loud environment (but not harmful)
      rmsToDB: true,         // Arduino now outputs dB directly
    },
    phone: {
      dbOffset: 0,           // Phone already has +110 offset applied
      dbScale: 1.0,
    },
  },
  
  motion: {
    maxGForce: 2.0,          // Normal human movement range
    sensitivity: 1.0,
  },
  
  environment: {
    temperature: {
      min: 15,               // Cool but comfortable
      max: 35,               // Warm but comfortable
    },
    humidity: {
      min: 30,               // Not too dry
      max: 70,               // Not too humid
    },
  },
};

// Environment-specific calibrations (can be selected based on user preferences)
export const CALIBRATION_PRESETS: Record<string, PartialCalibrationConfig> = {
  // For very sensitive users who want early nudges
  'sensitive': {
    sound: {
      arduino: { dbMin: 25, dbMax: 75 },
      phone: { dbScale: 0.8 },
    },
    motion: {
      maxGForce: 1.5,
      sensitivity: 1.2,
    },
  },
  
  // For users in typically noisier environments
  'noisy_environment': {
    sound: {
      arduino: { dbMin: 40, dbMax: 100 },
      phone: { dbScale: 1.1 },
    },
  },
  
  // For users who prefer very stable lighting
  'light_sensitive': {
    light: {
      arduino: { luxMax: 800 },
      phone: { brightnessScale: 0.9 },
    },
  },
};

/**
 * Merge calibration preset with defaults
 */
export function getCalibrationConfig(preset?: string): CalibrationConfig {
  if (!preset || !CALIBRATION_PRESETS[preset]) {
    return DEFAULT_CALIBRATION;
  }
  
  // Deep merge preset with defaults
  const presetConfig = CALIBRATION_PRESETS[preset];
  
  return {
    ...DEFAULT_CALIBRATION,
    light: {
      arduino: { ...DEFAULT_CALIBRATION.light.arduino, ...presetConfig.light?.arduino },
      phone: { ...DEFAULT_CALIBRATION.light.phone, ...presetConfig.light?.phone },
    },
    sound: {
      arduino: { ...DEFAULT_CALIBRATION.sound.arduino, ...presetConfig.sound?.arduino },
      phone: { ...DEFAULT_CALIBRATION.sound.phone, ...presetConfig.sound?.phone },
    },
    motion: { ...DEFAULT_CALIBRATION.motion, ...presetConfig.motion },
    environment: {
      temperature: { ...DEFAULT_CALIBRATION.environment.temperature, ...presetConfig.environment?.temperature },
      humidity: { ...DEFAULT_CALIBRATION.environment.humidity, ...presetConfig.environment?.humidity },
    },
  };
}