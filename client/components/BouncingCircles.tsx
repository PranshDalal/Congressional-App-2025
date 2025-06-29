import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

const colors = [
  "#D8B4F8", // Lavender
  "#CDB4DB", // Light Mauve
  "#E0BBE4", // Orchid Pink
  "#B28DFF", // Soft Violet
  "#DCC6E0", // Pastel Purple
];

const Circle = React.memo(({ index }: { index: number }) => {
  const size = useMemo(() => 120 - index * 10, [index]);

  const fromProps = useMemo(
    () => ({
      translateX: Math.random() * (width - size),
      translateY: Math.random() * (height - size),
    }),
    [size]
  );

  const animateProps = useMemo(
    () => ({
      translateX: Math.random() * (width - size),
      translateY: Math.random() * (height - size),
    }),
    [size]
  );

  const color = useMemo(() => colors[index % colors.length], [index]);

  return (
    <MotiView
      from={fromProps}
      animate={animateProps}
      transition={{
        loop: true,
        type: "timing",
        duration: 5000 + index * 500, 
        delay: index * 200, 
      }}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 50, 
          elevation: 5,
        },
      ]}
    />
  );
});

const BouncingCircles = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 10 }).map((_, index) => (
        <Circle key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: "absolute",
    opacity: 0.7, 
  },
});

export default BouncingCircles;
