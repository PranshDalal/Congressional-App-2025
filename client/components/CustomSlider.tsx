import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native';
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
}) => {
  const SLIDER_WIDTH = Dimensions.get('window').width - 64; 
  const THUMB_SIZE = 20;

  const percentage = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = percentage * (SLIDER_WIDTH - THUMB_SIZE);
  const fillWidth = percentage * SLIDER_WIDTH;

  const handlePress = (event: any) => {
    const locationX = event.nativeEvent.locationX;
    const newPercentage = locationX / SLIDER_WIDTH;
    const newValue = minimumValue + newPercentage * (maximumValue - minimumValue);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    onValueChange(clampedValue);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable style={styles.track} onPress={handlePress}>
        <View style={[styles.trackBackground, { backgroundColor: maximumTrackTintColor }]} />
        <View style={[styles.trackFill, { backgroundColor: minimumTrackTintColor, width: fillWidth }]} />
        <View style={[styles.thumb, { left: thumbPosition }]} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: 'transparent',
    position: 'relative',
    width: '100%',
  },
  trackBackground: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CustomSlider;
