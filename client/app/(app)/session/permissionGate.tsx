import { Platform, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { usePermissionsStore } from "@/utils/permissionStore";
import { useSessionSettingsState } from "@/utils/sessionSettingsStore";
import BackgroundView from "@/components/view/BackgroundView";
import Animated, { FadeIn } from "react-native-reanimated";
import globalStyles from "@/styles/globalStyles";
import ThemedText from "@/components/ThemedText";
import { theme } from "@/styles/theme";
import SizedBox from "@/components/SizedBox";
import { Accelerometer } from "expo-sensors";
import { request, PERMISSIONS } from "react-native-permissions";
import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import TextButton from "@/components/button/TextButton";

const PermissionRequest = ({
  title,
  description,
  onRequestPermission,
}: {
  title: string;
  description: string;
  onRequestPermission: () => void;
}) => (
  <Animated.View
    style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
    entering={FadeIn.duration(300)}
  >
    <ThemedText style={globalStyles.header1}>{title}</ThemedText>
    <SizedBox height={theme.spacing.md} />
    <ThemedText style={styles.paragraph}>{description}</ThemedText>
    <View style={styles.bottomStickyView}>
      <TextButton
        title="Continue"
        onPress={onRequestPermission}
        width="90%"
        style={{ borderRadius: theme.radii.full }}
      />
    </View>
  </Animated.View>
);

const getMicrophonePermissionType = () =>
  Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });

const PermissionGate = () => {
  const { requested, setRequested } = usePermissionsStore();
  const { sessionDevice } = useSessionSettingsState();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [currentPermission, setCurrentPermission] = useState<
    "camera" | "microphone" | "motion" | null
  >(() => {
    if (!requested.camera) return "camera";
    if (!requested.microphone) return "microphone";
    if (!requested.motion) return "motion";
    return null;
  });

  if (sessionDevice === "bluetooth") {
    router.push("/session/connectingToBluetooth");
    return null;
  }

  const permissionOrder: Array<"camera" | "microphone" | "motion"> = [
    "camera",
    "motion",
    "microphone",
  ];

  const permissionMeta: Record<
    "camera" | "microphone" | "motion",
    { title: string; description: string }
  > = {
    camera: {
      title: "Camera Access Required",
      description: "This app needs access to your camera to function properly.",
    },
    microphone: {
      title: "Microphone Access Required",
      description:
        "This app needs access to your microphone to function properly.",
    },
    motion: {
      title: "Motion Access Required",
      description:
        "This app needs access to your motion sensors to function properly.",
    },
  };

  const requestPermission = async (
    key: "camera" | "microphone" | "motion"
  ) => {
    switch (key) {
      case "camera":
        await requestCameraPermission();
        break;
      case "microphone":
        const micType = getMicrophonePermissionType();
        if (micType) await request(micType);
        break;
      case "motion":
        await Accelerometer.requestPermissionsAsync();
        break;
    }

    // Defer updating state to avoid React "update during render" warning
    setTimeout(() => {
      setRequested(key, true);

      // get the latest requested state from Zustand
      const latestRequested = usePermissionsStore.getState().requested;

      // find the next permission that still needs requesting
      const next = permissionOrder.find((p) => !latestRequested[p]);
      if (next) setCurrentPermission(next);
      else {
        // all done → navigate to session
        router.push({
          pathname: "/session",
          params: { "device-type": sessionDevice, "microphone-enabled": "true" },
        });
      }
    }, 0);
  };

  if (!currentPermission) return null;

  return (
    <BackgroundView withSafeArea pageHasHeader={false}>
      <PermissionRequest
        title={permissionMeta[currentPermission].title}
        description={permissionMeta[currentPermission].description}
        onRequestPermission={() => requestPermission(currentPermission)}
      />
    </BackgroundView>
  );
};

export default PermissionGate;

const styles = StyleSheet.create({
  paragraph: {
    textAlign: "center",
    lineHeight: globalStyles.bodyText.fontSize + 8,
    paddingHorizontal: theme.spacing.xl,
  },
  bottomStickyView: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
});
