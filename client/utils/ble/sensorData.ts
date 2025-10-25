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
