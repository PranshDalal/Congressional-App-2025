// storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkv = new MMKV();

// Adapter so Zustand can use MMKV
export const zustandMMKVStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};
