import { TextInput, StyleSheet, TextInputProps } from "react-native";
import React from "react";
import theme from "@/styles/theme";

type StyledTextInputProps = TextInputProps & {
  width?: any;
};

export default function StyledTextInput({
  style,
  width = "75%",
  ...rest
}: StyledTextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[styles.base, styles.default, { width }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
  },
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgLight,
  },
});
