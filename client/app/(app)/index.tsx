import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";

const app = () => {
  return (
    <SafeAreaView>
      <View>
        <Text style={styles.text}>
          HLESKJLKHLESKJLKFDJSLKFJDLHLESKJLKFDJSLKFJDLFDJSLKFJDL
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default app;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    color: "#333",
  },
});
