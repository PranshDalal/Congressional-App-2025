import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import theme from "@/styles/theme";
import globalStyles from "@/styles/globalStyles";
import * as Haptics from "expo-haptics";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  width?: any;
  icon?: React.ReactNode;
};

export default function TextButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  width = undefined,
  icon,
}: ButtonProps) {
  function buttonPressed() {
    if (variant === "primary") {
      Haptics.selectionAsync();
    }
    onPress();
  }
  return (
    <Pressable
      onPress={buttonPressed}
      style={({ pressed }) => [
        styles.base,
        { width: width },
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && (
          <View style={{ marginRight: title.length != 0 ? 8 : 0 }}>{icon}</View>
        )}
        <Text style={[globalStyles.bodyText, textStyle]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    alignItems: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.bgLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md-1,
    paddingHorizontal: theme.spacing.lg-1,
  },
  pressed: {
    opacity: 0.8,
  },
});
