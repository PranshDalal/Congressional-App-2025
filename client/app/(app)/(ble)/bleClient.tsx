import { BleManager, Device } from "react-native-ble-plx";
import { parseSensorData, SensorReading } from "./sensorData";

declare global {
  var Toast: {
    show: (options: { type: string; text1: string }) => void;
  } | undefined;
}

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-5678-90ab-cdef-1234567890ab";
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

export async function connectToWearable(
  onMessage: (reading: SensorReading) => void,
  retries = 3
): Promise<Device> {
  return new Promise<Device>((resolve, reject) => {
    const tryScan = (attempt: number) => {
      console.log(`Scan attempt ${attempt + 1}/${retries}`);
      global.Toast?.show({ type: "info", text1: `Scanning (try ${attempt + 1})...` });

      let timeout: NodeJS.Timeout | null = setTimeout(() => {
        bleManager.stopDeviceScan();
        console.warn("Scan timeout");
        if (attempt + 1 < retries) {
          tryScan(attempt + 1);
        } else {
          reject(new Error("Device not found after retries"));
        }
      }, 10000);

      bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
        if (error) {
          if (timeout) clearTimeout(timeout);
          bleManager.stopDeviceScan();
          console.error("❌ Scan error:", error.message);
          global.Toast?.show({ type: "error", text1: "Scan error: " + error.message });
          return reject(error);
        }

        if (!device) return;

        console.log("Discovered:", {
          id: device.id,
          name: device.name,
          localName: device.localName,
          serviceUUIDs: device.serviceUUIDs,
        });

        const matches =
          (device.name && device.name.includes(DEVICE_NAME)) ||
          (device.localName && device.localName.includes(DEVICE_NAME)) ||
          (device.serviceUUIDs?.some(
            uuid => uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
          ));

        if (matches) {
          if (timeout) clearTimeout(timeout);
          bleManager.stopDeviceScan();

          console.log("Found ADHD_Wearable:", device.id);
          global.Toast?.show({ type: "success", text1: "Found ADHD_Wearable" });

          try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();

            const services = await connected.services();
            console.log("Services:", services.map(s => s.uuid));

            const service = services.find(
              s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
            );
            if (!service) throw new Error("Service not found");

            const characteristics = await connected.characteristicsForService(service.uuid);
            console.log("Characteristics:", characteristics.map(c => c.uuid));

            const characteristic = characteristics.find(c =>
              c.uuid.toLowerCase().includes(
                CHARACTERISTIC_UUID.replace(/^0000/, "").toLowerCase()
              )
            );
            if (!characteristic) throw new Error("Characteristic not found");

            connected.monitorCharacteristicForService(
              service.uuid,
              characteristic.uuid,
              (err, char) => {
                if (err) {
                  console.error("Monitor error:", err);
                  return;
                }
                if (char?.value) {
                  const decoded = atob(char.value);
                  const reading = parseSensorData(decoded);
                  if (reading) onMessage(reading);
                }
              }
            );

            resolve(connected);
          } catch (err) {
            reject(err);
          }
        }
      });
    };

    const subscription = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        subscription.remove();
        tryScan(0);
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
  const characteristic = characteristics.find(c =>
    c.uuid.toLowerCase().includes(
      CHARACTERISTIC_UUID.replace(/^0000/, "").toLowerCase()
    )
  );
  if (!characteristic) throw new Error("Characteristic not found");

  await device.writeCharacteristicWithResponseForService(
    service.uuid,
    characteristic.uuid,
    base64Msg
  );
}
