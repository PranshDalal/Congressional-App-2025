import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
  PermissionStatus,
} from "react-native-permissions";

const getMicrophonePermissionType = () =>
  Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });

export function useGetStartSessionPermissions() {
  const router = useRouter();
  return useCallback(async (deviceType: "phone" | "bluetooth") => {
    const type = getMicrophonePermissionType();
    const result = await check(type!);

    if (result === RESULTS.GRANTED) {
      router.push({
        pathname: "/session",
        params: { 
          "microphone-enabled": "true",
          "device-type": deviceType 
        },
      });
    } else {
      router.push({
        pathname: "/session/request-microphone",
        params: { 
          "microphone-status": result,
          "device-type": deviceType 
        },
      });
    }
  }, []);
}
