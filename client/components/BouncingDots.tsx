import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import theme from "@/styles/theme";

export default function BouncingDots({ color = theme.colors.text, size = 8 }) {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{ translateY: 0, opacity: 0.5 }}
          animate={{ translateY: -6, opacity: 1 }}
          transition={{
            type: "timing",
            duration: 400,
            delay: index * 150,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    marginHorizontal: 2,
  },
});
