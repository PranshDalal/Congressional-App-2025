import {
  View,
  StyleSheet,
  Keyboard,
} from "react-native";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSignUp } from "@/hooks/auth/useSignUp";
import { useState, useCallback } from "react";
import ThemedText from "@/components/ThemedText";
import Animated, {
  FadeOut,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
} from "react-native-reanimated";
import useKeyboardGradualAnimation from "@/hooks/useKeyboardGradualAnimation";

const SignupScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [currentDirection, setCurrentDirection] = useState<"left" | "right">(
    "right"
  );

  const { keyboardHeight } = useKeyboardGradualAnimation();
  
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(keyboardHeight.value),
    };
  }, []);

  // Dismiss keyboard when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, [])
  );

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
    verifyName,
    verifyEmail,
    verifyPassword,
    verifyPasswordVerification,
  } = useSignUp(loading, setLoading);

  const nextStep = () => {
    if (step === 1 && !verifyName(name)) {
      return;
    }
    if (step === 2 && !verifyEmail(email)) {
      return;
    }
    if (step === 3 && !verifyPassword(password)) {
      return;
    }
    if (step === 4 && !verifyPasswordVerification(passwordVerification)) {
      return;
    }

    if (step < totalSteps) {
      setCurrentDirection("right");
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setCurrentDirection("left");
      setStep(step - 1);
    }
  };

  const determineAnimation = (
    type: "entering" | "exiting",
    direction: "left" | "right"
  ) => {
    const enteringAnimationDuration = 300;
    const exitingAnimationDuration = 200;

    if (type === "entering") {
      return direction === "right"
        ? SlideInRight.duration(enteringAnimationDuration)
        : SlideInLeft.duration(enteringAnimationDuration);
    } else {
      return FadeOut.duration(exitingAnimationDuration);
      // return direction === "right"
      //   ? SlideOutLeft.duration(animationDuration)
      //   : SlideOutRight.duration(animationDuration);
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
    <BackgroundView withSafeArea pageHasHeader={false}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      > */}
      <View style={styles.header}>
        <ProgressBar />
        <SizedBox height={50} />
      </View>

      <View style={styles.contentContainer}>
        {step === 1 && (
          <>
            <Animated.View
              style={styles.questionContainer}
              entering={determineAnimation("entering", currentDirection)}
              exiting={determineAnimation("exiting", currentDirection)}
            >
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
                autoCapitalize="words"
                // autoFocus
              />
            </Animated.View>
          </>
        )}
        {step === 2 && (
          <>
            <Animated.View
              style={styles.questionContainer}
              entering={determineAnimation("entering", currentDirection)}
              exiting={determineAnimation("exiting", currentDirection)}
            >
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
            </Animated.View>
          </>
        )}
        {step === 3 && (
          <>
            <Animated.View
              style={styles.questionContainer}
              entering={determineAnimation("entering", currentDirection)}
              exiting={determineAnimation("exiting", currentDirection)}
            >
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
            </Animated.View>
          </>
        )}
        {step === 4 && (
          <>
            <Animated.View
              style={styles.questionContainer}
              entering={determineAnimation("entering", currentDirection)}
              exiting={determineAnimation("exiting", currentDirection)}
            >
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
            </Animated.View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TextButton
              title="Back"
              onPress={prevStep}
              variant="secondary"
              width="48%"
              style={{ borderRadius: theme.radii.full }}
            />
            // <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            //   <ThemedText style={styles.buttonText}>Back</ThemedText>
            // </TouchableOpacity>
          )}
          {step < totalSteps && (
            <TextButton
              title="Next"
              onPress={nextStep}
              width={step == 1 ? "100%" : "48%"}
              style={{ borderRadius: theme.radii.full }}
            />
          )}
          {step === totalSteps && (
            <TextButton
              title="Create Account"
              showLoading={loading}
              onPress={handleSignUp}
              width={"48%"}
              style={{ borderRadius: theme.radii.full }}
            />
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
      {/* </KeyboardAvoidingView> */}
      <Animated.View style={fakeView} />
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
    paddingHorizontal: theme.spacing.md,
  },
  questionContainer: {
    width: "100%",
    alignItems: "center",
  },
});
