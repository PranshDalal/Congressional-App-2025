import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import BackgroundView from "@/components/view/BackgroundView";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { connectToWearable } from "../(ble)/bleClient";

const ConnectingToBluetoothScreen = () => {
  const [connected, setIsConnected] = React.useState(false);

  const cancelConnection = () => {
    router.back();
  };

  const continueToNextScreen = () => {
    router.push("/session");
  };

  useEffect(() => {
    connectToWearable((msg) => {
      setIsConnected(true);
      Toast.show({ type: "success", text1: `Received: ${msg}` });
    });
  }, []);

  return (
    <BackgroundView
      withSafeArea
      pageHasHeader={false}
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText style={globalStyles.header1}>
        Connecting to Bluetooth...
      </ThemedText>
      <ThemedText>Please ensure your device is nearby.</ThemedText>

      {!connected && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}
      <View style={styles.bottomStickyView}>
        <TextButton
          title={connected ? "Connected! Continue" : "Cancel"}
          width={"90%"}
          onPress={connected ? continueToNextScreen : cancelConnection}
        />
      </View>
    </BackgroundView>
  );
};

export default ConnectingToBluetoothScreen;

const styles = StyleSheet.create({
  bottomStickyView: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
});
