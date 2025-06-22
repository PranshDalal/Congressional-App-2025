import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import React from "react";
import theme from "@/styles/theme";
import globalStyles from "@/styles/globalStyles";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary";
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        globalStyles.centered,
        variant === "primary" ? styles.primary : styles.primary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[globalStyles.bodyText, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    alignSelf: 'flex-start'
  },
  primary: {
    backgroundColor: theme.colors.bgLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.8
  },
});
