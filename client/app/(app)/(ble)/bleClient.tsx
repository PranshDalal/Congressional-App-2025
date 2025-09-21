import { BleManager, Device } from "react-native-ble-plx";
import { parseSensorData, SensorReading } from "./sensorData";

declare global {
  var Toast: {
    show: (options: { type: string; text1: string }) => void;
  } | undefined;
}

const SERVICE_UUID        = "6e617468-616e-6973-636f-6f6c00000000"; // nathaniscool in hex
const CHARACTERISTIC_UUID = "7072616e-7368-6973-636f-6f6c0000";   // pranshiscool in hex
const DEVICE_NAME = "ADHD_Wearable";

const bleManager = new BleManager();

function btoa(str: string): string {
  if (typeof window !== "undefined" && window.btoa) return window.btoa(str);
  return Buffer.from(str, "binary").toString("base64");
}

function atob(str: string): string {
  if (typeof window !== "undefined" && window.atob) return window.atob(str);
  return Buffer.from(str, "base64").toString("binary");
}

export async function connectToWearable(onMessage: (reading: SensorReading) => void): Promise<Device> {
  return new Promise<Device>((resolve, reject) => {
    const subscription = bleManager.onStateChange(async (state) => {
      if (state === "PoweredOn") {
        subscription.remove();
        try {
          console.log("Scanning for all BLE devices...");
          global.Toast?.show({ type: "info", text1: "Scanning for ADHD_Wearable..." });

          const scannedDevice = await new Promise<Device>((res, rej) => {
            let timeout: NodeJS.Timeout | null = setTimeout(() => {
              bleManager.stopDeviceScan();
              console.log("Scan timeout");
              global.Toast?.show({ type: "error", text1: "Device not found" });
              rej(new Error("Device not found within timeout"));
            }, 15000);

            bleManager.startDeviceScan(null, null, (error, device) => {
              if (error) {
                if (timeout) clearTimeout(timeout);
                bleManager.stopDeviceScan();
                console.error("Scan error:", error.message);
                global.Toast?.show({ type: "error", text1: "Scan error: " + error.message });
                return rej(error);
              }

              if (device) {
                console.log("Discovered device:", device.name, device.localName, device.id);
                
                if (device.name === DEVICE_NAME || device.localName === DEVICE_NAME) {
                  if (timeout) clearTimeout(timeout);
                  bleManager.stopDeviceScan();
                  console.log("Found ADHD_Wearable:", device.id);
                  global.Toast?.show({ type: "success", text1: "Found ADHD_Wearable" });
                  res(device);
                }
              }
            });
          });

          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();

          const services = await connectedDevice.services();
          console.log("Discovered services:", services.map(s => s.uuid));

          const service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());
          if (!service) throw new Error("Service not found");

          const characteristics = await connectedDevice.characteristicsForService(service.uuid);
          console.log("Discovered characteristics:", characteristics.map(c => c.uuid));

          const characteristic = characteristics.find(c => c.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase());
          if (!characteristic) throw new Error("Characteristic not found");

          await connectedDevice.monitorCharacteristicForService(
            service.uuid,
            characteristic.uuid,
            (error, char) => {
              if (error) {
                console.error("Monitor error:", error);
                return;
              }
              if (char?.value) {
                const decoded = atob(char.value);
                const reading = parseSensorData(decoded);
                if (reading) onMessage(reading);
              }
            }
          );

          resolve(connectedDevice);
        } catch (err) {
          reject(err);
        }
      }
    }, true);
  });
}

export async function sendMessage(device: Device, msg: string): Promise<void> {
  const base64Msg = btoa(msg);
  const services = await device.services();
  const service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());
  if (!service) throw new Error("Service not found");

  const characteristics = await device.characteristicsForService(service.uuid);
  const characteristic = characteristics.find(c => c.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase());
  if (!characteristic) throw new Error("Characteristic not found");

  await device.writeCharacteristicWithResponseForService(service.uuid, characteristic.uuid, base64Msg);
}
