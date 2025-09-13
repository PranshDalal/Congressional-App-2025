import { View, Pressable } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import { useSignIn } from "@/hooks/auth/useSignIn";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { StyleSheet } from "react-native";
import ThemedText from "@/components/ThemedText";
import useKeyboardGradualAnimation from "@/hooks/useKeyboardGradualAnimation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const SigninScreen = () => {
  const [loading, setLoading] = useState(false);

  const { keyboardHeight } = useKeyboardGradualAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(keyboardHeight.value),
    };
  }, []);

  const {
    email,
    setEmail,
    emailError,
    setEmailError,
    password,
    setPassword,
    passwordError,
    handleSignIn,
    inputEmailRef,
    inputPasswordRef,
    inputPasswordVerificationRef,
    clearErrors,
  } = useSignIn(loading, setLoading);

  const { forgotPassword } = useForgotPassword(
    email,
    setEmailError,
    loading,
    setLoading
  );

  return (
    <BackgroundView withSafeArea withScreenPadding pageHasHeader={false}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ThemedText style={globalStyles.header1}>Welcome Back!</ThemedText>
        <ThemedText style={globalStyles.mutedText}>
          Please sign in to continue
        </ThemedText>
        {/* <SizedBox height={25} /> */}
        <SizedBox height={theme.spacing.lg} />
        <ThemedText style={styles.inputTitle}>Email</ThemedText>
        <StyledTextInput
          value={email}
          onSubmitEditing={() => inputPasswordRef.current?.focus()}
          placeholder="Your email"
          keyboardType="email-address"
          onChangeText={setEmail}
          enterKeyHint="next"
          error={emailError}
        />
        <SizedBox height={theme.spacing.md} />
        <ThemedText style={styles.inputTitle}>Password</ThemedText>
        <StyledTextInput
          value={password}
          onSubmitEditing={handleSignIn}
          ref={inputPasswordRef}
          placeholder="Your password"
          secureTextEntry
          onChangeText={setPassword}
          enterKeyHint="done"
          error={passwordError}
        />
        <SizedBox height={5} />
        <Pressable onPress={forgotPassword} style={{ alignSelf: "flex-start" }}>
          <ThemedText style={globalStyles.linkText}>
            Forgot your password?
          </ThemedText>
        </Pressable>
        <SizedBox height={theme.spacing.md} />
        <TextButton
          title="Sign In"
          onPress={handleSignIn}
          width="100%"
          textStyle={{ fontSize: theme.fontSize.lg }}
          showLoading={loading}
        />
        <SizedBox height={25} />
        <View style={{ flexDirection: "row" }}>
          <ThemedText style={globalStyles.mutedText}>
            Don't have an account?{" "}
          </ThemedText>
          <Link href="/sign-up" style={globalStyles.linkText} replace>
            Sign Up
          </Link>
        </View>
      </View>
      <Animated.View style={fakeView} />
    </BackgroundView>
  );
};

export default SigninScreen;

const styles = StyleSheet.create({
  inputTitle: {
    fontSize: theme.fontSize.lg,
    alignSelf: "flex-start",
    paddingBottom: theme.spacing.sm,
    fontWeight: 500,
  },
});
