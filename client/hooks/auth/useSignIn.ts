import { FirebaseError } from "firebase/app";
import { useRef, useState } from "react";
import { useFirebaseErrorHandler } from "../useFirebaseErrorHandler";
import { TextInput } from "react-native";
import { signIn, signUp } from "@/services/authService";
import Toast from "react-native-toast-message";

export function useSignIn(
  loading: boolean,
  setLoading: (loading: boolean) => void
) {
  const { handleFirebaseError } = useFirebaseErrorHandler();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const inputEmailRef = useRef<TextInput>(null);
  const inputPasswordRef = useRef<TextInput>(null);
  const inputPasswordVerificationRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (loading) return;
    clearErrors();

    if (!email) return setEmailError("This field is required");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email))
      return setEmailError("Please enter a valid email address");

    if (!password) return setPasswordError("This field is required");
    if (password.length < 6)
      return setPasswordError(
        "The password must be at least 6 characters long"
      );
    if (password.length > 4096)
      return setPasswordError("The password is too long");

    setLoading(true);

    try {
      await signIn(email, password);
      Toast.show({ type: "success", text1: "Signed in" });
    } catch (e) {
      handleFirebaseError(e as FirebaseError);
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  return {
    email,
    setEmail,
    emailError,
    setEmailError,
    password,
    setPassword,
    passwordError,
    loading,
    handleSignIn,
    inputEmailRef,
    inputPasswordRef,
    inputPasswordVerificationRef,
    clearErrors,
  };
}
