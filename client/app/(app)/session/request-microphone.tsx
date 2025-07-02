import { View, Text, Platform } from "react-native";
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

const getMicrophonePermissionType = () =>
  Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });

const AskMicrophonePermissionScreen = () => {
  const router = useRouter();

  const { "microphone-status": microphoneStatus } = useLocalSearchParams();

  const requestPermission = async () => {
    const type = getMicrophonePermissionType();
    const result = await request(type!);

    router.navigate({
      pathname: "./",
      params: { "microphone-enabled": "true" },
    });
  };

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <Text style={globalStyles.header1}>
        Turning on microphone services allows us to:
      </Text>
      <Text style={globalStyles.header3}>analyze ambient sound levels</Text>

      {microphoneStatus === RESULTS.BLOCKED ? (
        <TextButton title="Open Settings" onPress={openSettings} />
      ) : microphoneStatus === RESULTS.DENIED ? (
        <TextButton title="Next" onPress={requestPermission} />
      ) : null}
    </BackgroundView>
  );
};

export default AskMicrophonePermissionScreen;
