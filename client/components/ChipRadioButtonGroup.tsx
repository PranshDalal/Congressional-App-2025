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

  return (
    <>
      {scrollable ? (
        <ScrollView
          style={{ paddingBottom: theme.spacing.sm }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", gap: 12 }}
        >
          {labels.map((label, index) => (
            <Pressable
              key={index}
              style={[
                styles.radioOption,
                selectedIndex === index && styles.radioSelected,
              ]}
              onPress={() => onPress(index)}
            >
              <ThemedText
                style={[
                  styles.radioText,
                  selectedIndex === index && styles.radioTextSelected,
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.radioGroup}>
          {labels.map((label, index) => (
            <Pressable
              key={index}
              style={[
                styles.radioOption,
                selectedIndex === index && styles.radioSelected,
              ]}
              onPress={() => onPress(index)}
            >
              <ThemedText
                style={[
                  styles.radioText,
                  selectedIndex === index && styles.radioTextSelected,
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          ))}
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
    // borderWidth: 2,
    // borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgLight,
  },
  radioSelected: {
    // borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
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
