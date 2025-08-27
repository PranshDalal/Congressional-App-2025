import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export function HapticTab(props: BottomTabBarButtonProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handlePressIn = (ev: any) => {
    "worklet";
    opacity.value = withTiming(0.5, { duration: 100 });

    // Call original onPressIn
    if (props.onPressIn) {
      runOnJS(props.onPressIn)(ev);
    }
  };

  const handlePressOut = (ev: any) => {
    "worklet";
    opacity.value = withTiming(1, { duration: 100 });

    if (props.onPressOut) {
      runOnJS(props.onPressOut)(ev);
    }
  };

  const handlePress = (ev: any) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    props.onPress?.(ev);
  };

  return (
    <Animated.View style={animatedStyle}>
      {/* NOTE: can replace this with normal pressable */}
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      />
    </Animated.View>
  );
}
