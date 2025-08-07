import React, { useState } from "react";
import Slider, { SliderProps } from "@react-native-community/slider";
import theme from "@/styles/theme";
import { StyleSheet, View, ViewStyle, Text } from "react-native";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "./SizedBox";

type StyledSliderProps = SliderProps & {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  style?: ViewStyle;
  onValueChange?: (value: number) => void;
  showBounds?: boolean;
};

const StyledSlider = ({
  value = 0.5,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.01,
  onValueChange,
  style,
  showBounds = false,
  ...props
}: StyledSliderProps) => {
  const [currentValue, setValue] = useState(value);

  const handleValueChange = (val: number) => {
    setValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <View style={[styles.slider, styles.viewStyle, style]}>
      {/* {showBounds && <Text style={globalStyles.mutedText}>{minimumValue}</Text>} */}
      <Slider
        style={[styles.slider, style]}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        step={step}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.textMuted}
        thumbTintColor={theme.colors.text}
        onValueChange={handleValueChange}
        {...props}
      />

      {/* {showBounds && <Text style={globalStyles.mutedText}>{maximumValue}</Text>} */}

      {showBounds && (
        <View style={{ width: "100%", flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={globalStyles.mutedText}>{minimumValue}</Text>
          <Text style={globalStyles.mutedText}>{maximumValue}</Text>
        </View>
      )}
    </View>
  );
};

export default StyledSlider;

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    // height: 40,
  },
  viewStyle: {
    flex: 1,
    // height: 40 + theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
    // flexDirection: "row",
  },
});
