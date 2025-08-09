import { View, Text, Pressable, ViewStyle, PressableProps } from "react-native";
import React from "react";
import theme from "@/styles/theme";
import * as Haptics from "expo-haptics";
import globalStyles from "@/styles/globalStyles";

type IconButtonProps = {
  icon: React.ReactElement;
  size?: number;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
} & Omit<PressableProps, "children" | "style" | "onPress" | "disabled">;

const IconButton = ({
  icon,
  size = 24,
  onPress,
  color,
  style,
  disabled = false,
  hapticFeedback = true,
  ...pressableProps
}: IconButtonProps) => {
  const handlePress = () => {
    if (disabled || !onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const iconElement = React.cloneElement(icon, {
    size,
    color: disabled ? theme.colors.textMuted : color,
  } as any);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          padding: theme.spacing.sm,
          borderRadius: theme.radii.md,
        //   backgroundColor: pressed ? theme.colors.bgLight : theme.colors.bg,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      {iconElement}
    </Pressable>
  );
};

export default IconButton;
