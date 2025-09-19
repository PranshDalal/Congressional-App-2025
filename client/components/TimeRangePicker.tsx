import { StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import ThemedText from "./ThemedText";
import theme from "@/styles/theme";
import { MotiPressable } from "moti/interactions";
import { MinusOutline, PlusOutline } from "@/assets/icons/heroicons";
import * as Haptics from "expo-haptics";

type TimeRangePickerProps = {
  value: number;
  onChange: (newValue: number | ((prevValue: number) => number)) => void; // Updated type
  minDurationInMinutes?: number;
  maxDurationInMinutes?: number;
  stepInMinutes?: number;
  holdDelay?: number; // Delay before hold starts repeating
  holdInterval?: number; // Interval between repeats while holding
};

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  onChange,
  minDurationInMinutes = 5,
  maxDurationInMinutes = 300,
  stepInMinutes = 5,
  holdDelay = 500, // Start repeating after 500ms
  holdInterval = 100, // Repeat every 100ms while holding
}) => {
  const decreaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const increaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decreaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const increaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDecrease = () => {
    onChange((prevValue) => {
      const newValue = prevValue - stepInMinutes;
      if (newValue >= minDurationInMinutes) {
        Haptics.selectionAsync();
        return newValue;
      }
      return prevValue;
    });
  };

  const handleIncrease = () => {
    onChange((prevValue) => {
      const newValue = prevValue + stepInMinutes;
      if (newValue <= maxDurationInMinutes) {
        Haptics.selectionAsync();
        return newValue;
      }
      return prevValue;
    });
  };

  const startDecreasing = () => {
    // Immediate action
    handleDecrease();

    // Start repeating after delay
    decreaseTimeoutRef.current = setTimeout(() => {
      decreaseIntervalRef.current = setInterval(() => {
        handleDecrease();
      }, holdInterval);
    }, holdDelay);
  };

  const stopDecreasing = () => {
    if (decreaseTimeoutRef.current) {
      clearTimeout(decreaseTimeoutRef.current);
      decreaseTimeoutRef.current = null;
    }
    if (decreaseIntervalRef.current) {
      clearInterval(decreaseIntervalRef.current);
      decreaseIntervalRef.current = null;
    }
  };

  const startIncreasing = () => {
    // Immediate action
    handleIncrease();

    // Start repeating after delay
    increaseTimeoutRef.current = setTimeout(() => {
      increaseIntervalRef.current = setInterval(() => {
        handleIncrease();
      }, holdInterval);
    }, holdDelay);
  };

  const stopIncreasing = () => {
    if (increaseTimeoutRef.current) {
      clearTimeout(increaseTimeoutRef.current);
      increaseTimeoutRef.current = null;
    }
    if (increaseIntervalRef.current) {
      clearInterval(increaseIntervalRef.current);
      increaseIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <MotiPressable
        style={[styles.button, styles.minusButton]}
        onPressIn={startDecreasing}
        onPressOut={stopDecreasing}
        disabled={value <= minDurationInMinutes}
      >
        <MinusOutline
          color={
            value <= minDurationInMinutes
              ? theme.colors.textMuted
              : theme.colors.text
          }
        />
      </MotiPressable>

      <ThemedText style={styles.valueText}>{value}m</ThemedText>

      <MotiPressable
        style={[styles.button, styles.plusButton]}
        onPressIn={startIncreasing}
        onPressOut={stopIncreasing}
        disabled={value >= maxDurationInMinutes}
      >
        <PlusOutline
          color={
            value >= maxDurationInMinutes
              ? theme.colors.textMuted
              : theme.colors.text
          }
        />
      </MotiPressable>
    </View>
  );
};

export default TimeRangePicker;

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.bg,
    paddingVertical: theme.spacing.sm / 2,
    paddingHorizontal: theme.spacing.sm / 2,
  },
  minusButton: {
    borderTopLeftRadius: theme.radii.md,
    borderBottomLeftRadius: theme.radii.md,
  },
  plusButton: {
    borderTopRightRadius: theme.radii.md,
    borderBottomRightRadius: theme.radii.md,
  },
  valueText: {
    marginHorizontal: 10,
    color: theme.colors.textMuted,
    width: 40,
    textAlign: "center",
  },
});
