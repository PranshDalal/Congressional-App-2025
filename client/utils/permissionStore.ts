// stores/permissionsStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "@/utils/mmkv";

type PermissionName = "camera" | "microphone" | "motion";


// NOTE: this doesn't guarentee that it works, just that the permission requested at some point
interface PermissionState {
  requested: Record<PermissionName, boolean>;
  setRequested: (name: PermissionName, granted: boolean) => void;
  reset: () => void;
}

export const usePermissionsStore = create<PermissionState>()(
  persist(
    (set) => ({
      requested: {
        // bluetooth: false,
        camera: false,
        microphone: false,
        motion: false,
      },
      setRequested: (name, granted) =>
        set((state) => ({
          requested: { ...state.requested, [name]: granted },
        })),
      reset: () =>
        set(() => ({
          requested: {
            // bluetooth: false,
            camera: false,
            microphone: false,
            motion: false,
          },
        })),
    }),
    {
      name: "permissions", // key in MMKV
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
