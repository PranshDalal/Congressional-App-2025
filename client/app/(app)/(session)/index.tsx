import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import BouncingCircles from "@/components/BouncingCircles";

const SessionScreen = () => {
  const [elapsed, setElapsed] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (stopwatchRunning) {
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
  }, [stopwatchRunning]);

  return (
    <BackgroundView style={styles.container}>
      <BouncingCircles />
      <View style={styles.content}>
        <Text style={[globalStyles.header1, styles.stopwatchText]}>
          {formatTime(elapsed)}
        </Text>
        <Text style={globalStyles.header2}>
          {stopwatchRunning ? "Collecting ambient data..." : "Paused"}
        </Text>
      </View>

      <View style={styles.bottomStickyView}>
        <TextButton
          title=""
          icon={
            stopwatchRunning ? (
              <Ionicons name="pause" size={18} color={theme.colors.text} />
            ) : (
              <Ionicons name="play" size={18} color={theme.colors.text} />
            )
          }
          variant="secondary"
          onPress={() => setStopwatchRunning((r) => !r)}
          width="45%"
        />
        <Link href="/survey" replace asChild>
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
    justifyContent: "center",
    alignItems: "center",
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
