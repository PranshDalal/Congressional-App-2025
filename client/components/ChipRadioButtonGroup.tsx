import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import theme from "@/styles/theme";
import { StyleSheet } from "react-native";
import globalStyles from "@/styles/globalStyles";
import ThemedText from "./ThemedText";
import * as Haptics from 'expo-haptics';

type ChipRadioButtonGroupProps = {
  labels: string[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  scrollable?: boolean;
};

const ChipRadioButtonGroup = ({
  labels,
  selectedIndex,
  scrollable = false,
  onSelect,
}: ChipRadioButtonGroupProps) => {
  const onPress = (index: number) => {
    Haptics.selectionAsync();
    onSelect?.(index);
  };

  const getChipStyle = (index: number, pressed: boolean) => [
    styles.radioOption,
    selectedIndex === index && styles.radioSelected,
    pressed && selectedIndex !== index && styles.radioPressed, // Add pressed state
  ];

  const getTextStyle = (index: number) => [
    styles.radioText,
    selectedIndex === index && styles.radioTextSelected,
  ];

  const renderChip = (label: string, index: number) => (
    <Pressable
      key={index}
      style={({ pressed }) => getChipStyle(index, pressed)}
      onPress={() => onPress(index)}
    >
      <ThemedText style={getTextStyle(index)}>
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <>
      {scrollable ? (
        <ScrollView
          style={{ paddingBottom: theme.spacing.sm }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", gap: 12 }}
        >
          {labels.map((label, index) => renderChip(label, index))}
        </ScrollView>
      ) : (
        <View style={styles.radioGroup}>
          {labels.map((label, index) => renderChip(label, index))}
        </View>
      )}
    </>
  );
};

export default ChipRadioButtonGroup;

const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  radioOption: {
    paddingVertical: theme.spacing.sm * 1.5,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.bgLight,
    // Add transition properties for smooth hover
    transitionDuration: "150ms",
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
  },
  // Add pressed/hover state
  radioPressed: {
    // backgroundColor: theme.colors.bgDark,
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  radioText: {
    // fontSize: theme.fontSize.base,
    // color: theme.colors.text,
    // textAlign: "center",
  },
  radioTextSelected: {
    // color: "#fff",
    // fontWeight: theme.fontWeight.semibold,
  },
});
