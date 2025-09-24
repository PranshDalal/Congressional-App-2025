import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand/react";
import { zustandMMKVStorage } from "@/utils/mmkv";

type SessionSettingsState = {
  sessionType: "timed" | "untimed";
  sessionDuration: number | undefined;
  sessionDevice: "bluetooth" | "phone";
  setSessionType: (type: "timed" | "untimed") => void;
  setSessionDuration: (duration: number | undefined) => void;
  setSessionDevice: (device: "bluetooth" | "phone") => void;
  reset: () => void;
};

export const useSessionSettingsState = create(
  persist<SessionSettingsState>(
    (set) => ({
      sessionType: "timed",
      sessionDuration: 30,
      sessionDevice: "phone",
      setSessionType: (type) => set(() => ({ sessionType: type })),
      setSessionDuration: (duration) =>
        set(() => ({ sessionDuration: duration })),
      setSessionDevice: (device) => set(() => ({ sessionDevice: device })),
      reset: () =>
        set(() => ({
          sessionType: "timed",
          sessionDuration: 30,
          sessionDevice: "phone",
        })),
    }),
    {
      name: "sessionSettings",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
