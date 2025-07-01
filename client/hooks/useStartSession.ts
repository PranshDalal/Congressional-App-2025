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

export function useStartSession() {
  const router = useRouter();
  return useCallback(async () => {
    const type = getMicrophonePermissionType();
    const result = await check(type!);

    if (result === RESULTS.GRANTED) {
      router.replace({
        pathname: "/session",
        params: { "microphone-enabled": "true" },
      });
    } else {
      router.replace({
        pathname: "/session/request-microphone",
        params: { "microphone-status": result },
      });
    }
  }, []);
}
