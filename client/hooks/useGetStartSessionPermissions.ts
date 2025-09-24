import { usePermissionsStore } from "@/utils/permissionStore";
import { useSessionSettingsState } from "@/utils/sessionSettingsStore";
import { useRouter } from "expo-router";
import { useCallback } from "react";

export function useGetStartSessionPermissions() {
  const { requested } = usePermissionsStore();
  const { setSessionDevice } = useSessionSettingsState();
  const router = useRouter();

  return useCallback(async (deviceType: "phone" | "bluetooth") => {
    setSessionDevice(deviceType);

    if (deviceType === "bluetooth") {
      router.push("/session/connectingToBluetooth");
    } else if (deviceType === "phone") {
      if (requested.microphone && requested.camera && requested.motion) {
        router.push({
          pathname: "/session",
          params: { "microphone-enabled": "true", "device-type": deviceType },
        });
      } else {
        router.push("/session/permissionGate");
      }
    }
  }, []);
}
