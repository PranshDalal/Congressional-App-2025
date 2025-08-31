import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import { Link, useRouter } from "expo-router";
import { useSignUp } from "@/hooks/auth/useSignUp";
import { useState, useRef } from "react";
import ThemedText from "@/components/ThemedText";
import * as Animatable from "react-native-animatable";

const SignupScreen = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const viewRef = useRef<Animatable.View & View>(null);
  const totalSteps = 4;

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

  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert("Wait a second", "Please enter your name.");
      return;
    }
    if (step === 2 && !email.trim()) {
      Alert.alert("Wait a second", "Please enter your email.");
      return;
    }
    if (step === 3 && !password.trim()) {
      Alert.alert("Wait a second", "Please enter a password.");
      return;
    }

    if (step < totalSteps) {
      viewRef.current?.fadeOut(300).then(() => {
        setStep(step + 1);
        viewRef.current?.fadeIn(300);
      });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      viewRef.current?.fadeOut(300).then(() => {
        setStep(step - 1);
        viewRef.current?.fadeIn(300);
      });
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View
        style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]}
      />
    </View>
  );

  return (
    <BackgroundView withSafeArea>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <ProgressBar />
          <SizedBox height={50} />
        </View>

        <Animatable.View ref={viewRef} style={styles.contentContainer}>
          {step === 1 && (
            <>
              <ThemedText style={globalStyles.header1}>
                What's your name?
              </ThemedText>
              <SizedBox height={theme.spacing.xl} />
              <StyledTextInput
                value={name}
                onSubmitEditing={nextStep}
                placeholder="Your name"
                onChangeText={setName}
                enterKeyHint="next"
                error={nameError}
                autoFocus
              />
            </>
          )}
          {step === 2 && (
            <>
              <ThemedText style={globalStyles.header1}>
                And your email?
              </ThemedText>
              <SizedBox height={theme.spacing.xl} />
              <StyledTextInput
                value={email}
                ref={inputEmailRef}
                onSubmitEditing={nextStep}
                placeholder="Your email"
                keyboardType="email-address"
                onChangeText={setEmail}
                enterKeyHint="next"
                error={emailError}
                autoFocus
              />
            </>
          )}
          {step === 3 && (
            <>
              <ThemedText style={globalStyles.header1}>
                Create a password
              </ThemedText>
              <SizedBox height={theme.spacing.xl} />
              <StyledTextInput
                value={password}
                onSubmitEditing={nextStep}
                ref={inputPasswordRef}
                placeholder="Your password"
                secureTextEntry
                onChangeText={setPassword}
                enterKeyHint="next"
                error={passwordError}
                autoFocus
              />
            </>
          )}
          {step === 4 && (
            <>
              <ThemedText style={globalStyles.header1}>
                Confirm your password
              </ThemedText>
              <SizedBox height={theme.spacing.xl} />
              <StyledTextInput
                value={passwordVerification}
                onSubmitEditing={handleSignUp}
                ref={inputPasswordVerificationRef}
                placeholder="Confirm your password"
                secureTextEntry
                onChangeText={setPasswordVerification}
                enterKeyHint="done"
                error={passwordVerificationError}
                autoFocus
              />
            </>
          )}
        </Animatable.View>

        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.navButton} onPress={prevStep}>
                <ThemedText style={styles.buttonText}>Back</ThemedText>
              </TouchableOpacity>
            )}
            {step < totalSteps && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={nextStep}
              >
                <ThemedText style={[styles.buttonText, { color: "white" }]}>
                  Next
                </ThemedText>
              </TouchableOpacity>
            )}
            {step === totalSteps && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleSignUp}
              >
                <ThemedText style={[styles.buttonText, { color: "white" }]}>
                  Create Account
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <SizedBox height={25} />
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <ThemedText style={globalStyles.mutedText}>
              Already have an account?{" "}
            </ThemedText>
            <Link href="/sign-in" style={globalStyles.linkText} replace>
              Sign In
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BackgroundView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  header: {
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    paddingBottom: 20,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flex: 1,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});