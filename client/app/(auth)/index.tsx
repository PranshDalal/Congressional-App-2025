import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import DismissKeyboard from "@/components/DismissKeyboard";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

const SigninScreen = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const inputPasswordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
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
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const forgotPassword = () => {
    setEmailError("");
    setPasswordError("");

    if (email.length == 0) {
      setEmailError("This field is required");
      return;
    }
  }

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
        <Pressable
          onPress={forgotPassword}
          style={{ alignSelf: "flex-start" }}
        >
          <Text style={globalStyles.linkText}>
            Forgot your password?
          </Text>
        </Pressable>
        <SizedBox height={20} />
        <TextButton
          title="Sign In"
          onPress={handleSignIn}
          width="100%"
          textStyle={{ fontWeight: theme.fontWeight.semibold }}
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