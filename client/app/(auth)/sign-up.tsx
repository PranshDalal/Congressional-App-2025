import { View, Text, TextInput } from "react-native";
import React, { useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import DismissKeyboard from "@/components/DismissKeyboard";
import auth, { getAuth } from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [passwordVerification, setPasswordVerification] = useState("");
  const [passwordVerificationError, setPasswordVerificationError] =
    useState("");

  const [loading, setLoading] = useState(false);

  const inputEmailRef = useRef<TextInput>(null);
  const inputPasswordRef = useRef<TextInput>(null);
  const inputPasswordVerificationRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setPasswordVerificationError("");

    if (name.length == 0) {
      setNameError("This field is required");
      return;
    }
    if (email.length == 0) {
      setEmailError("This field is required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (password.length == 0) {
      setPasswordError("This field is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("The password must be at least 6 characters long");
      return;
    }
    if (password.length > 4096) {
      setPasswordError("The password is too long");
      return;
    }
    if (passwordVerification.length == 0) {
      setPasswordError("This field is required");
      return;
    }
    if (passwordVerification !== password) {
      setPasswordVerificationError("The passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const user = await getAuth().createUserWithEmailAndPassword(email, password);
      await user.user.updateProfile({ displayName: name });
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Registration failed: " + err.message);
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
        <Text style={globalStyles.header1}>Welcome!</Text>
        <Text style={globalStyles.mutedText}>Please sign up</Text>
        <SizedBox height={25} />
        <StyledTextInput
          value={name}
          onSubmitEditing={() => inputEmailRef.current?.focus()}
          placeholder="Name"
          onChangeText={setName}
          enterKeyHint="next"
          width="100%"
          error={nameError}
        />
        <SizedBox height={10} />
        <StyledTextInput
          value={email}
          ref={inputEmailRef}
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
          onSubmitEditing={() => inputPasswordVerificationRef.current?.focus()}
          ref={inputPasswordRef}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          enterKeyHint="next"
          width="100%"
          error={passwordError}
        />
        <SizedBox height={10} />
        <StyledTextInput
          value={passwordVerification}
          onSubmitEditing={handleSignUp}
          ref={inputPasswordVerificationRef}
          placeholder="Password Verification"
          secureTextEntry
          onChangeText={setPasswordVerification}
          enterKeyHint="done"
          width="100%"
          error={passwordVerificationError}
        />
        <SizedBox height={20} />
        <TextButton
          title="Sign Up"
          onPress={handleSignUp}
          width="100%"
          textStyle={{ fontWeight: theme.fontWeight.semibold }}
        />
        <SizedBox height={25} />
        <View style={{ flexDirection: "row" }}>
          <Text style={globalStyles.mutedText}>Already have an account? </Text>
          <Link href="/" style={globalStyles.linkText} replace>
            Sign In
          </Link>
        </View>
      </BackgroundView>
    </DismissKeyboard>
  );
};

export default SignupScreen;
