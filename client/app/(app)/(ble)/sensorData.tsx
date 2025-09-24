export type SensorReading = {
  light: number;
  sound: number;
  accel: { x: number; y: number; z: number };
  timestamp: number;
};

export function parseSensorData(raw: string): SensorReading | null {
  console.log("Raw sensor data:", raw);
  try {
    const json = JSON.parse(raw);
    
    const parts = raw.split(",");
    const light = parseFloat(parts[0].split(":")[1]);
    const sound = parseFloat(parts[1].split(":")[1]);
    const [x, y, z] = parts[2].split(":")[1].split("|").map(Number);

    return {
      light: json.light,
      sound: json.sound,
      accel: { x: json.accel.x, y: json.accel.y, z: json.accel.z },
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error("Failed to parse sensor data:", raw, err);
    return null;
  }
}
