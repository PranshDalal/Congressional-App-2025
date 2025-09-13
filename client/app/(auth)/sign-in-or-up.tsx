import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/view/BackgroundView";
import { StyleSheet } from "react-native";
import globalStyles from "@/styles/globalStyles";
import TextButton from "@/components/button/TextButton";
import { useRouter } from "expo-router";
import { theme } from "@/styles/theme";
import ThemedText from "@/components/ThemedText";
import BouncingCircles from "@/components/BouncingCircles";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

const SignInOrUpScreen = () => {
  const router = useRouter();
  return (
    <BackgroundView withSafeArea withScreenPadding>
      <BouncingCircles />
      <View style={{ flex: 1, alignItems: "center" }}>
        <Animated.View entering={FadeInUp.duration(2000).delay(200)}>
          <ThemedText style={styles.header}>Welcome to Ambien 👋</ThemedText>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(1700).delay(500)}>
          <ThemedText style={globalStyles.mutedText}>
            Sign in or create an account to continue
          </ThemedText>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.duration(2000).delay(800)}>
        <TextButton
          title="Create an Account"
          onPress={() => router.push("/sign-up")}
          style={{ marginBottom: 12 }}
          textStyle={{
            fontWeight: theme.fontWeight.bold,
            fontSize: theme.fontSize.lg,
          }}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.duration(2000).delay(1100)}>
        <TextButton
          title="Sign in"
          onPress={() => router.push("/sign-in")}
          variant="secondary"
          textStyle={{
            fontWeight: theme.fontWeight.bold,
            fontSize: theme.fontSize.lg,
          }}
        />
      </Animated.View>
    </BackgroundView>
  );
};

export default SignInOrUpScreen;

const styles = StyleSheet.create({
  header: {
    ...globalStyles.header1,
    fontSize: globalStyles.header1.fontSize * 1.5,
    paddingHorizontal: theme.spacing.xl,
    textAlign: "center",
    paddingTop: 200,
    paddingBottom: 20,
  },
});
