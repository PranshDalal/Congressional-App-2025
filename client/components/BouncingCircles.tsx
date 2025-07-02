import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, View, Text } from "react-native";
import { MotiView, useAnimationState } from "moti";
import { BlurView } from "expo-blur";
import { Easing } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const SPEED = 10;

const oldColors = [
  "#D8B4F8", // Lavender
  "#CDB4DB", // Light Mauve
  "#E0BBE4", // Orchid Pink
  "#B28DFF", // Soft Violet
  "#DCC6E0", // Pastel Purple
];

// NEW COLORS BEING USED
const colors = [
  "#A084CA", // Darker Lavender
  "#8A6BB8", // Darker Mauve
  "#9A6EA3", // Darker Orchid Pink
  "#7C5DAA", // Darker Violet
  "#8B7CA7", // Darker Pastel Purple
  "#6CA08C", // Muted Green
  "#6A7CA7", // Muted Blue
];

const getRandomPosition = (size: number) => ({
  translateX: Math.random() * (width - size),
  translateY: Math.random() * (height - size),
});

const Circle = React.memo(({ index }: { index: number }) => {
  const size = useMemo(() => 120 - index * 10, [index]);
  const color = useMemo(() => colors[index % colors.length], [index]);

  // Calculate initial positions
  const initialFrom = useMemo(() => getRandomPosition(size), [size]);
  const initialTarget = useMemo(() => getRandomPosition(size), [size]);
  const dx = (initialTarget.translateX ?? 0) - (initialFrom.translateX ?? 0);
  const dy = (initialTarget.translateY ?? 0) - (initialFrom.translateY ?? 0);
  const initialDistance = Math.sqrt(dx * dx + dy * dy);
  const initialDuration = (initialDistance / SPEED) * 1000;

  const [target, setTarget] = useState(() => getRandomPosition(size));
  const [duration, setDuration] = useState(initialDuration + index * 200);

  const lastTargetRef = React.useRef(target);

  return (
    <MotiView
      from={getRandomPosition(size)}
      animate={target}
      transition={{
        loop: false,
        type: "timing",
        // duration: 500,
        // delay: 10,
        duration: duration,
        easing: Easing.inOut(Easing.ease),
        // delay: index * 200,
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
      onDidAnimate={(key, finished) => {
        if (finished && (key === "translateX" || key === "translateY")) {
          const prev = lastTargetRef.current;
          const next = getRandomPosition(size);

          const dx = (next.translateX ?? 0) - (prev.translateX ?? 0);
          const dy = (next.translateY ?? 0) - (prev.translateY ?? 0);
          const distance = Math.sqrt(dx * dx + dy * dy);
          // Duration in ms
          const newDuration = (distance / SPEED) * 1000;
          setTarget(next);
          setDuration(newDuration);
          lastTargetRef.current = next;
        }
      }}
    />
  );
});

type BouncingCirclesProps = {
  paused?: boolean;
};

const BouncingCircles = ({ paused = false }: BouncingCirclesProps) => {
  return (
    <React.Fragment>
      <MotiView
        animate={{ opacity: paused ? 0 : 1 }}
        transition={{ type: "timing", duration: 5000 }}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.container} pointerEvents="none">
          {Array.from({ length: 10 }).map((_, index) => (
            <Circle key={index} index={index} />
          ))}
        </View>
      </MotiView>

      {Platform.OS === "ios" ? (
        <BlurView
          intensity={40}
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod="dimezisBlurView" // NOTE: BLUR DOESN'T WORK WITH ANDROID, THIS IS NEEDED TO GET IT TO WORK (but looks a bit strange)
        />
      ) : null}
      <View style={styles.blurOverlay} />
    </React.Fragment>
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
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});

export default BouncingCircles;
