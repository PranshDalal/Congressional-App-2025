import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import { StyleSheet } from "react-native";
import globalStyles from "@/styles/globalStyles";
import TextButton from "@/components/TextButton";
import { useRouter } from "expo-router";
import { theme } from "@/styles/theme";
import ThemedText from "@/components/ThemedText";


const SignInOrUpScreen = () => {
  const router = useRouter();
  return (
    <BackgroundView withSafeArea withScreenPadding>
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText style={styles.header}>Welcome to Ambien 👋</ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          Sign in or create an account to continue
        </ThemedText>
      </View>
      <TextButton
        title="Create an Account"
        onPress={() => router.push("/sign-up")}
        style={{ marginBottom: 12 }}
        textStyle={{ fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.lg }}
      />
      <TextButton
        title="Sign in"
        onPress={() => router.push("/sign-in")}
        variant="secondary"
        textStyle={{ fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.lg }}
      />
    </BackgroundView>
  );
};

export default SignInOrUpScreen;

const styles = StyleSheet.create({
  header: {
    ...globalStyles.header1,
    fontSize: globalStyles.header1.fontSize * 1.5,
    paddingHorizontal: "20%",
    textAlign: "center",
    paddingTop: 200,
    paddingBottom: 20,
  },
});
