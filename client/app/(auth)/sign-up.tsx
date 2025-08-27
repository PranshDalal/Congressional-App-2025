import { View, Text } from "react-native";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";
import { useSignUp } from "@/hooks/auth/useSignUp";
import { useState } from "react";
import { StyleSheet } from "react-native";
import ThemedText from "@/components/ThemedText";

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
        <ThemedText style={globalStyles.header1}>Welcome!</ThemedText>
        <ThemedText style={globalStyles.mutedText}>Please create an account to continue</ThemedText>
        <SizedBox height={theme.spacing.xl} />
        <ThemedText style={styles.inputTitle}>Your Name</ThemedText>
        <StyledTextInput
          value={name}
          onSubmitEditing={() => inputEmailRef.current?.focus()}
          placeholder="Your name"
          onChangeText={setName}
          enterKeyHint="next"
          error={nameError}
        />
        <SizedBox height={theme.spacing.md} />
        <ThemedText style={styles.inputTitle}>Email</ThemedText>
        <StyledTextInput
          value={email}
          ref={inputEmailRef}
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
          onSubmitEditing={() => inputPasswordVerificationRef.current?.focus()}
          ref={inputPasswordRef}
          placeholder="Your password"
          secureTextEntry
          onChangeText={setPassword}
          enterKeyHint="next"
          error={passwordError}
        />
        <SizedBox height={theme.spacing.md} />
        <ThemedText style={styles.inputTitle}>Confirm Password</ThemedText>
        <StyledTextInput
          value={passwordVerification}
          onSubmitEditing={handleSignUp}
          ref={inputPasswordVerificationRef}
          placeholder="Confirm your password"
          secureTextEntry
          onChangeText={setPasswordVerification}
          enterKeyHint="done"
          error={passwordVerificationError}
        />
        <SizedBox height={20} />
        <TextButton
          title="Create Account"
          onPress={handleSignUp}
          textStyle={{
            fontSize: theme.fontSize.lg,
          }}
          width={"100%"}
        />
        <SizedBox height={25} />
        <View style={{ flexDirection: "row" }}>
          <ThemedText style={globalStyles.mutedText}>
            Already have an account?{" "}
          </ThemedText>
          <Link href="/sign-in" style={globalStyles.linkText} replace>
            Sign In
          </Link>
        </View>
      </View>
    </BackgroundView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  inputTitle: {
    fontSize: theme.fontSize.lg,
    alignSelf: "flex-start",
    paddingBottom: theme.spacing.sm,
    fontWeight: 500,
  },
});
