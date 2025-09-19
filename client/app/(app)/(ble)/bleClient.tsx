import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform } from 'react-native';

declare global {
  var Toast: {
    show: (options: { type: string; text1: string }) => void;
  } | undefined;
}

const SERVICE_UUID = '180C';
const CHARACTERISTIC_UUID = '2A56';
const DEVICE_NAME = 'ADHD_Wearable';

const bleManager = new BleManager();

function btoa(str: string): string {
  if (typeof window !== 'undefined' && window.btoa) return window.btoa(str);
  return Buffer.from(str, 'binary').toString('base64');
}

function atob(str: string): string {
  if (typeof window !== 'undefined' && window.atob) return window.atob(str);
  return Buffer.from(str, 'base64').toString('binary');
}

export async function connectToWearable(onMessage: (msg: string) => void): Promise<Device> {
  return new Promise<Device>((resolve, reject) => {
    const subscription = bleManager.onStateChange(async (state) => {
      if (state === 'PoweredOn') {
        subscription.remove();
        try {
            console.log('Started scanning for ADHD_Wearable');
            if (typeof global !== 'undefined' && global.Toast) {
              global.Toast.show({ type: 'info', text1: 'Started scanning for ADHD_Wearable' });
            }
            const scannedDevice = await new Promise<Device>((res, rej) => {
              const scanSub = bleManager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                  bleManager.stopDeviceScan();
                  console.log('Stopped scanning for ADHD_Wearable');
                  if (typeof global !== 'undefined' && global.Toast) {
                    global.Toast.show({ type: 'info', text1: 'Stopped scanning for ADHD_Wearable' });
                  }
                  return rej(error);
                }
                if (device && device.name === DEVICE_NAME) {
                  bleManager.stopDeviceScan();
                  console.log('Stopped scanning for ADHD_Wearable');
                  if (typeof global !== 'undefined' && global.Toast) {
                    global.Toast.show({ type: 'success', text1: 'Stopped scanning for ADHD_Wearable' });
                  }
                  res(device);
                }
              });
            });

          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();

          const services = await connectedDevice.services();
          const service = services.find(s => s.uuid.toLowerCase().includes(SERVICE_UUID.toLowerCase()));
          if (!service) throw new Error('Service not found');

          const characteristics = await connectedDevice.characteristicsForService(service.uuid);
          const characteristic = characteristics.find(c => c.uuid.toLowerCase().includes(CHARACTERISTIC_UUID.toLowerCase()));
          if (!characteristic) throw new Error('Characteristic not found');

          await connectedDevice.monitorCharacteristicForService(
            service.uuid,
            characteristic.uuid,
            (error, char) => {
              if (error) return;
              if (char?.value) {
                const decoded = atob(char.value);
                onMessage(decoded);
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
  const service = services.find(s => s.uuid.toLowerCase().includes(SERVICE_UUID.toLowerCase()));
  if (!service) throw new Error('Service not found');
  const characteristics = await device.characteristicsForService(service.uuid);
  const characteristic = characteristics.find(c => c.uuid.toLowerCase().includes(CHARACTERISTIC_UUID.toLowerCase()));
  if (!characteristic) throw new Error('Characteristic not found');
  await device.writeCharacteristicWithResponseForService(service.uuid, characteristic.uuid, base64Msg);
}

export type { Device } from 'react-native-ble-plx';
