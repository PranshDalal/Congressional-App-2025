import { View, Text, TextInput, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import DismissKeyboard from "@/components/DismissKeyboard";
import { getAuth, sendPasswordResetEmail } from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import Toast from "react-native-toast-message";
import { useFirebaseErrorHandler } from "@/hooks/useFirebaseErrorHandler";

const SigninScreen = () => {
  const { handleFirebaseError } = useFirebaseErrorHandler();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailResetCooldown, setEmailResetCooldown] = useState(Date.now());

  const inputPasswordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (loading) return;

    setEmailError("");
    setPasswordError("");

    if (email.length == 0) {
      setEmailError("This field is required");
      return;
    }
    if (password.length == 0) {
      setPasswordError("This field is required");
      return;
    }

    setLoading(true);
    try {
      await getAuth().signInWithEmailAndPassword(email, password);
      Toast.show({
        type: "success",
        text1: "Signed in",
      });
    } catch (e: any) {
      const err = e as FirebaseError;
      handleFirebaseError(err);
      return;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (loading) return;

    setEmailError("");
    setPasswordError("");

    if (emailResetCooldown - Date.now() > 0) {
      Toast.show({
        type: "error",
        text1:
          "Too fast! Try again in " +
          Math.floor((emailResetCooldown - Date.now()) / 1000) +
          " seconds",
      });
      return;
    }

    if (email.length == 0) {
      setEmailError("This field is required");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(getAuth(), email);
      Toast.show({
        text1: "Password reset email sent",
      });
      setEmailResetCooldown(Date.now() + 60000);
      // setTimeout(() => setEmailResetCooldown(false), 60000);
    } catch (e: any) {
      const err = e as FirebaseError;
      Toast.show({
        type: "error",
        text1: "Error sending email: " + err.code,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DismissKeyboard>
      <BackgroundView
        style={{ alignItems: "center" }}
        withSafeArea
        withScreenPadding
      >
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
          width="100%"
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
          width="100%"
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
      </BackgroundView>
    </DismissKeyboard>
  );
};

export default SigninScreen;
