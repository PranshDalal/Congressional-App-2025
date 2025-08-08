import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import { useSignIn } from "@/hooks/auth/useSignIn";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

const SigninScreen = () => {
  const [loading, setLoading] = useState(false);

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
    <BackgroundView withSafeArea withScreenPadding>
      <View style={{ flex: 1, alignItems: "center" }}>
        <SizedBox height={100} />
        <Text style={globalStyles.header1}>Welcome Back!</Text>
        <Text style={globalStyles.mutedText}>Please sign in to continue</Text>
        <SizedBox height={25} />
        <StyledTextInput
          value={email}
          onSubmitEditing={() => inputPasswordRef.current?.focus()}
          placeholder="Email"
          keyboardType="email-address"
          onChangeText={setEmail}
          enterKeyHint="next"
          error={emailError}
        />
        <SizedBox height={10} />
        <StyledTextInput
          value={password}
          onSubmitEditing={handleSignIn}
          ref={inputPasswordRef}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          enterKeyHint="done"
          error={passwordError}
        />
        <SizedBox height={5} />
        <Pressable onPress={forgotPassword} style={{ alignSelf: "flex-start" }}>
          <Text style={globalStyles.linkText}>Forgot your password?</Text>
        </Pressable>
        <SizedBox height={20} />
        <TextButton
          title="Sign In"
          onPress={handleSignIn}
          width="100%"
          textStyle={{ fontWeight: theme.fontWeight.semibold }}
          showLoading={loading}
        />
        <SizedBox height={25} />
        <View style={{ flexDirection: "row" }}>
          <Text style={globalStyles.mutedText}>Don't have an account? </Text>
          <Link href="/sign-up" style={globalStyles.linkText} replace>
            Sign Up
          </Link>
        </View>
      </View>
    </BackgroundView>
  );
};

export default SigninScreen;
