import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import theme from '@/styles/theme';

interface CustomSliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  style?: any;
  showValue?: boolean;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  minimumValue,
  maximumValue,
  value,
  onValueChange,
  step = 1,
  minimumTrackTintColor = theme.colors.primary,
  maximumTrackTintColor = theme.colors.textMuted,
  style,
  showValue = true,
}) => {
  const SLIDER_WIDTH = Dimensions.get('window').width - 64;
  const THUMB_SIZE = 24;

  // Sync thumb position when `value` changes externally

  const calculateValueFromPosition = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, SLIDER_WIDTH - THUMB_SIZE));
    const percentage = clampedX / (SLIDER_WIDTH - THUMB_SIZE);
    const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
    const stepped = Math.round(rawValue / step) * step;
    return Math.max(minimumValue, Math.min(maximumValue, stepped));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Set the initial position based on where the user touched
        const locationX = evt.nativeEvent.locationX;
        const newValue = calculateValueFromPosition(locationX);
        onValueChange(newValue);
      },
      onPanResponderMove: (evt, gesture) => {
        // Calculate position based on the initial touch point plus the gesture movement
        const startPosition = (value - minimumValue) / (maximumValue - minimumValue) * (SLIDER_WIDTH - THUMB_SIZE);
        const newX = startPosition + gesture.dx;
        const newValue = calculateValueFromPosition(newX);
        onValueChange(newValue);
      },
    })
  ).current;

  const fillWidth = (value - minimumValue) / (maximumValue - minimumValue) * SLIDER_WIDTH;
  const thumbPosition = (value - minimumValue) / (maximumValue - minimumValue) * (SLIDER_WIDTH - THUMB_SIZE);

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={[styles.track, { width: SLIDER_WIDTH }]}
        onPress={(event) => {
          const locationX = event.nativeEvent.locationX;
          const newValue = calculateValueFromPosition(locationX);
          onValueChange(newValue);
        }}
      >
        <View style={[styles.trackBackground, { backgroundColor: maximumTrackTintColor }]} />
        <View style={[styles.trackFill, { backgroundColor: minimumTrackTintColor, width: fillWidth }]} />
        <View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              left: thumbPosition,
            },
          ]}
        >
          {showValue && (
            <Text style={styles.valueLabel}>{value}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: -10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  valueLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CustomSlider;
