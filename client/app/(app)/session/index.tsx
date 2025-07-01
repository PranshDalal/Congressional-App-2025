import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { Link, useLocalSearchParams } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import BouncingCircles from "@/components/BouncingCircles";
import RNSoundLevel from "react-native-sound-level";

const SessionScreen = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isStopwatchRunning, setStopwatchRunning] = useState(true);
  const [dB, setDB] = useState(Number);
  const fakeConvertedDBRef = useRef(-1);
  const [fakeRenderDB, setFakeRenderDB] = useState(-1);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { "microphone-enabled": microphoneEnabled } = useLocalSearchParams();

  useEffect(() => {
    if (isStopwatchRunning) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStopwatchRunning]);

  // #region Microphone
  useEffect(() => {
    if (microphoneEnabled === "true" && isStopwatchRunning) {
      RNSoundLevel.start();

      RNSoundLevel.onNewFrame = (data) => {
        // console.log("Sound level:", data.value);
        setDB(data.value);
        const readableDB = Math.round(data.value + 110);
        fakeConvertedDBRef.current = readableDB;
      };

      const dBUpdateInterval = setInterval(() => {
        if (isStopwatchRunning) {
          setFakeRenderDB(fakeConvertedDBRef.current);
        } else {
          setFakeRenderDB(-1);
        }
      }, 1000);

      return () => {
        RNSoundLevel.stop();
        clearInterval(dBUpdateInterval);
      };
    }
  }, [microphoneEnabled, isStopwatchRunning]);

  // #endregion

  return (
    <BackgroundView style={styles.container}>
      <BouncingCircles />
      <View style={styles.content}>
        <Text style={[globalStyles.header1, styles.stopwatchText]}>
          {formatTime(elapsed)}
        </Text>
        <Text style={globalStyles.mutedText}>
          {isStopwatchRunning ? "Collecting ambient data..." : "Paused"}
        </Text>
        <Text style={globalStyles.mutedText}>
          {isStopwatchRunning && fakeRenderDB != -1
            ? "Sound level: " + fakeRenderDB + " dB"
            : ""}
        </Text>
      </View>

      <View style={styles.bottomStickyView}>
        <TextButton
          title=""
          icon={
            isStopwatchRunning ? (
              <Ionicons name="pause" size={18} color={theme.colors.text} />
            ) : (
              <Ionicons name="play" size={18} color={theme.colors.text} />
            )
          }
          variant="secondary"
          onPress={() => setStopwatchRunning((r) => !r)}
          width="45%"
        />
        <Link href="/session/survey" replace asChild>
          <TextButton title="End Session" onPress={() => {}} width="45%" />
        </Link>
      </View>
    </BackgroundView>
  );
};

export default SessionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    ...globalStyles.centered,
  },
  bottomStickyView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
  stopwatchText: {
    fontSize: theme.fontSize.bigBoy,
    color: theme.colors.text,
  },
});

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}
