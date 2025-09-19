import { View, Text, TextStyle, ViewStyle } from "react-native";
import React from "react";
import { theme } from "@/styles/theme";
import { StyleSheet } from "react-native";
import ThemedText from "../ThemedText";
import globalStyles from "@/styles/globalStyles";
import {
  ArrowLongRightOutline,
  ChevronRightOutline,
} from "@/assets/icons/heroicons";
import { MotiPressable } from "moti/interactions";

import * as Haptics from "expo-haptics";
import SizedBox from "../SizedBox";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  rightVariant?: "none" | "arrow" | "custom";
  rightCustomComponent?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  width?: any;
  icon?: React.ReactNode;
  showLoading?: boolean;
  stopPressIfLoading?: boolean;
};

const SettingsButton = ({
  title,
  onPress = () => {},
  rightVariant = "arrow",
  rightCustomComponent,
  style,
  textStyle,
  width = undefined,
  icon,
  showLoading = false,
  stopPressIfLoading = true,
}: ButtonProps) => {
  const isInteractable = () =>
    rightVariant !== "custom" && (!showLoading || !stopPressIfLoading);

  //   const customRightComponentWithoutVariantSet =
  //     rightVariant === "custom" && rightCustomComponent == null;
  //   if (customRightComponentWithoutVariantSet) {
  //     console.warn(
  //       "SettingsButton: rightVariant is set to 'custom' but no rightCustomComponent is provided."
  //     );
  //   }

  const buttonPressed = () => {
    if (isInteractable()) {
      Haptics.selectionAsync();
      //   if (rightVariant === "arrow" || rightVariant === "none") {
      //   }

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

          const interactable =
            rightVariant !== "custom" && (!showLoading || !stopPressIfLoading);

          return {
            scale: (hovered || pressed) && interactable ? 0.95 : 1,
            opacity: (hovered || pressed) && interactable ? 0.8 : 1,
          };
        }}
        style={styles.container}
      >
        <ThemedText style={[styles.title]}>{title}</ThemedText>

        {rightVariant === "arrow" && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {rightCustomComponent ? rightCustomComponent : <View />}
            <SizedBox width={8} />
            <ChevronRightOutline color={theme.colors.textMuted} size={22} />
          </View>
        )}

        {rightVariant === "custom" &&
          (rightCustomComponent ? rightCustomComponent : <View />)}
      </MotiPressable>
    </View>
  );
};

export default SettingsButton;

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    // alignItems: "center",
    backgroundColor: theme.colors.bgLight,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    height: 56,
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: "700",
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
