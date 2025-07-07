import { View, Text, Platform, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
  PermissionStatus,
} from "react-native-permissions";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import TextButton from "@/components/TextButton";
import BouncingCircles from "@/components/BouncingCircles";
import SizedBox from "@/components/SizedBox";
import theme from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const getMicrophonePermissionType = () =>
  Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });

const AskMicrophonePermissionScreen = () => {
  const router = useRouter();

  const { "microphone-status": microphoneStatus } = useLocalSearchParams();

  const [openedSettings, setOpenedSettings] = useState(false);

  const requestPermission = async () => {
    const type = getMicrophonePermissionType();
    const result = await request(type!);

    router.navigate({
      pathname: "./",
      params: {
        "microphone-enabled":
          result === RESULTS.GRANTED || result === RESULTS.LIMITED
            ? "true"
            : "false",
      },
    });
  };

  const requestPermissionThroughSettings = async () => {
    setOpenedSettings(true);
    await openSettings();

    // const type = getMicrophonePermissionType();
    // const result = await check(type!);

    // routeToSession(result);
  };

  const routeToSession = (result: string) => {
    router.navigate({
      pathname: "./",
      params: {
        "microphone-enabled":
          result === RESULTS.GRANTED || result === RESULTS.LIMITED
            ? "true"
            : "false",
      },
    });
  };

  return (
    <BackgroundView style={globalStyles.centered}>
      <View style={styles.circle}>
        <Ionicons name="mic" size={100} color={theme.colors.primary} />
      </View>
      <SizedBox height={50} />
      <Text style={globalStyles.header3}>MICROPHONE</Text>
      <SizedBox height={25} />
      <Text style={styles.paragraph}>
        Enable microphone access so we can analyze ambient noise during your
        focus session. This allows us to create more accurate focus
        reccomendations.
      </Text>
      <SafeAreaView style={styles.bottomStickyView} edges={["bottom"]}>
        {microphoneStatus === RESULTS.BLOCKED && !openedSettings ? (
          <TextButton
            title="Open Settings"
            onPress={requestPermissionThroughSettings}
            width={"90%"}
          />
        ) : microphoneStatus === RESULTS.DENIED && !openedSettings ? (
          <TextButton
            title="Continue"
            onPress={requestPermission}
            width={"90%"}
          />
        ) : (
          <TextButton
            title="Continue"
            onPress={() => routeToSession("false")}
            width={"90%"}
          />
        )}
      </SafeAreaView>
    </BackgroundView>
  );
};

export default AskMicrophonePermissionScreen;

const styles = StyleSheet.create({
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.bgLight,
    alignItems: "center",
    justifyContent: "center",
  },
  paragraph: {
    ...globalStyles.bodyText,
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
