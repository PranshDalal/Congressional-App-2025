import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import theme from "@/styles/theme";
import { StyleSheet } from "react-native";
import globalStyles from "@/styles/globalStyles";

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
  return (
    <>
      {scrollable ? (
        <ScrollView
          style={{ paddingBottom: theme.spacing.sm }}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ flexDirection: "row", gap: 12 }}
        >
          {labels.map((label, index) => (
            <Pressable
              key={index}
              style={[
                styles.radioOption,
                selectedIndex === index && styles.radioSelected,
              ]}
              onPress={() => onSelect?.(index)}
            >
              <Text
                style={[
                  styles.radioText,
                  selectedIndex === index && styles.radioTextSelected,
                ]}
              >
                {label}
              </Text>
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
              onPress={() => onSelect?.(index)}
            >
              <Text
                style={[
                  styles.radioText,
                  selectedIndex === index && styles.radioTextSelected,
                ]}
              >
                {label}
              </Text>
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    backgroundColor: "transparent",
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    ...globalStyles.bodyText,
    // fontSize: theme.fontSize.base,
    // color: theme.colors.text,
    // textAlign: "center",
  },
  radioTextSelected: {
    ...globalStyles.bodyText,
    // color: "#fff",
    // fontWeight: theme.fontWeight.semibold,
  },
});
