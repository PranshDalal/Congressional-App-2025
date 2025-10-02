export type SensorReading = {
  light: number;
  sound: number;
  accel: { x: number; y: number; z: number };
  temp: number;
  humidity: number;
  timestamp: number;
};

export function parseSensorData(raw: string): SensorReading | null {
  console.log("Parsing raw JSON sensor data:", raw);
  
  try {
    const cleanRaw = raw.trim();
    
    // Parse JSON format: {"light":X,"sound":Y,"accel":{"x":X,"y":Y,"z":Z},"temp":T,"humidity":H}
    const json = JSON.parse(cleanRaw);
    
    if (typeof json.light !== 'number' || typeof json.sound !== 'number' || 
        typeof json.temp !== 'number' || typeof json.humidity !== 'number') {
      console.error("Missing or invalid required numeric fields in JSON:", json);
      return null;
    }

    if (!json.accel || typeof json.accel.x !== 'number' || 
        typeof json.accel.y !== 'number' || typeof json.accel.z !== 'number') {
      console.error("Missing or invalid accelerometer data in JSON:", json.accel);
      return null;
    }
    
    const result = {
      light: Math.max(0, Math.min(100, json.light)), 
      sound: Math.max(-120, Math.min(120, json.sound)), 
      accel: { 
        x: json.accel.x, 
        y: json.accel.y, 
        z: json.accel.z 
      },
      temp: Math.max(-40, Math.min(120, json.temp)), 
      humidity: Math.max(0, Math.min(100, json.humidity)),
      timestamp: Date.now(),
    };
    
    console.log("Successfully parsed JSON sensor data:", result);
    return result;
    
  } catch (err) {
    console.error("Failed to parse JSON sensor data:", raw, "Error:", err);
    return null;
  }
}
