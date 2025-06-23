import { TextInput, StyleSheet, TextInputProps } from "react-native";
import React, { forwardRef } from "react";
import theme from "@/styles/theme";

type StyledTextInputProps = TextInputProps & {
  width?: any;
};

const StyledTextInput = forwardRef<TextInput, StyledTextInputProps>(
  ({ style, width = "90%", ...rest }, ref) => {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.base, styles.default, { width }, style]}
        {...rest}
      />
    );
  }
);

export default StyledTextInput;

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
