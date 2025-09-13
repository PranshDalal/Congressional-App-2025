import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const useKeyboardGradualAnimation = () => {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: event => {
        'worklet';
        keyboardHeight.value = Math.max(event.height, 0);
      },
    },
    []
  );
  return { keyboardHeight };
};

export default useKeyboardGradualAnimation;