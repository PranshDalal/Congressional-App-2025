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
import BouncingDots from "../BouncingDots";
import ThemedText from "../ThemedText";

import { MotiPressable } from "moti/interactions";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  textStyle?: TextStyle;
  width?: any;
  icon?: React.ReactNode;
  showLoading?: boolean;
  stopPressIfLoading?: boolean;
};

export default function TextButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  width = undefined,
  icon,
  showLoading = false,
  stopPressIfLoading = true,
}: ButtonProps) {
  const isInteractable = () => !showLoading || !stopPressIfLoading;

  const buttonPressed = () => {
    if (isInteractable()) {
      if (variant === "primary" || variant === "danger") {
        Haptics.selectionAsync();
      }

      onPress();
    }
  };
  return (
    <View style={{ width: width }}>
      <MotiPressable
        onPress={buttonPressed}
        onPressIn={() => {
          if (isInteractable()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        animate={({ hovered, pressed }) => {
          "worklet";

          return {
            scale: hovered || pressed ? 0.95 : 1,
            opacity: hovered || pressed ? 0.8 : 1,
          };
        }}
        style={[
          styles.base,
          { justifyContent: "center" },
          variant === "primary" ? styles.primary : variant === "secondary" ? styles.secondary : styles.danger,
          style,
        ]}
      >
        <View style={styles.buttonContentView}>
          {icon && (
            <View style={{ marginRight: title.length != 0 ? 8 : 0 }}>
              {icon}
            </View>
          )}
          <View style={{ position: "relative" }}>
            <ThemedText
              style={[
                { fontWeight: theme.fontWeight.bold },
                textStyle ?? {},
                { opacity: showLoading ? 0 : 1 },
              ]}
            >
              {title}
            </ThemedText>
            {showLoading && (
              <View style={styles.bouncingDotsView}>
                <BouncingDots />
              </View>
            )}
          </View>
        </View>
      </MotiPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    alignItems: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.bgLight,
    // borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md, // - 1,
    paddingHorizontal: theme.spacing.lg, // - 1,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  pressed: {
    opacity: 0.8,
  },
  bouncingDotsView: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContentView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
