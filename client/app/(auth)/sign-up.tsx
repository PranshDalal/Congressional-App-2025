import { View, Text } from "react-native";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import { useSignUp } from "@/hooks/auth/useSignUp";
import { useState } from "react";

const SignupScreen = () => {
  const [loading, setLoading] = useState(false);

  const {
    name,
    setName,
    nameError,
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    passwordVerification,
    setPasswordVerification,
    passwordVerificationError,
    handleSignUp,
    inputEmailRef,
    inputPasswordRef,
    inputPasswordVerificationRef,
  } = useSignUp(loading, setLoading);

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <View style={{ flex: 1, alignItems: "center" }}>
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
          error={passwordVerificationError}
        />
        <SizedBox height={20} />
        <TextButton
          title="Sign Up"
          onPress={handleSignUp}
          textStyle={{ fontWeight: theme.fontWeight.semibold }}
          width={"100%"}
        />
        <SizedBox height={25} />
        <View style={{ flexDirection: "row" }}>
          <Text style={globalStyles.mutedText}>Already have an account? </Text>
          <Link href="/sign-in" style={globalStyles.linkText} replace>
            Sign In
          </Link>
        </View>
      </View>
    </BackgroundView>
  );
};

export default SignupScreen;
