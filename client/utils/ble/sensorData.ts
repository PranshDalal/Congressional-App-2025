export type SensorReading = {
  light: number;
  sound: number;
  accel: { x: number; y: number; z: number; magnitude?: number };
  temp: number;
  humidity: number;
  timestamp: number;
};

export function parseSensorData(raw: string): SensorReading | null {
  try {
    const cleanRaw = raw.trim();

    const repairedRaw = cleanRaw
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/(\r\n|\n|\r)/gm, "");

    const json = JSON.parse(repairedRaw);

    if (
      typeof json.light !== "number" ||
      typeof json.sound !== "number" ||
      typeof json.temp !== "number" ||
      typeof json.humidity !== "number"
    ) {
      return null;
    }

    if (
      !json.accel ||
      typeof json.accel.x !== "number" ||
      typeof json.accel.y !== "number" ||
      typeof json.accel.z !== "number"
    ) {
      return null;
    }

    const timestamp =
      typeof json.timestamp === "number" ? json.timestamp : Date.now();

    const result: SensorReading = {
      light: json.light,
      sound: json.sound,
      accel: { 
        x: json.accel.x, 
        y: json.accel.y, 
        z: json.accel.z,
        magnitude: typeof json.accel.magnitude === "number" ? json.accel.magnitude : undefined
      },
      temp: json.temp,
      humidity: json.humidity,
      timestamp,
    };

    return result;
  } catch {
    return null;
  }
}

/**
 * Converts the wearable's light value (a luminance-weighted sum of raw APDS-9960
 * R/G/B counts) to lux.
 *
 * Uses the counts-per-lux model from the ams/TAOS DN40 lux application note for
 * this sensor family:
 *
 *     lux = counts * (GA * DF) / (integration_ms * gain)
 *
 * with the Arduino_APDS9960 library defaults the firmware runs on
 * (ATIME = 252 -> 4 cycles x 2.78 ms = 11.12 ms, ALS gain 16x), the device
 * factor DF = 310, and glass attenuation GA = 1 (the sensor has no cover).
 *
 * At these settings the sensor saturates at about 4,100 counts, roughly 7,000 lux,
 * so readings in direct sunlight top out there.
 */
const APDS_INTEGRATION_MS = 4 * 2.78;
const APDS_GAIN = 16;
const DN40_DEVICE_FACTOR = 310;
const GLASS_ATTENUATION = 1;

export const APDS_LUX_PER_COUNT =
  (GLASS_ATTENUATION * DN40_DEVICE_FACTOR) / (APDS_INTEGRATION_MS * APDS_GAIN);

export function wearableLightToLux(raw: number): number {
  return Math.round(raw * APDS_LUX_PER_COUNT);
}
