import { FirebaseError } from "firebase/app";
import { useRef, useState } from "react";
import { useFirebaseErrorHandler } from "../useFirebaseErrorHandler";
import { TextInput } from "react-native";
import { signUp } from "@/services/firebaseAuthService";
import Toast from "react-native-toast-message";

export function useSignUp(
  loading: boolean,
  setLoading: (loading: boolean) => void
) {
  const { handleFirebaseError } = useFirebaseErrorHandler();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVerification, setPasswordVerification] = useState("");
  const [passwordVerificationError, setPasswordVerificationError] =
    useState("");

  const inputEmailRef = useRef<TextInput>(null);
  const inputPasswordRef = useRef<TextInput>(null);
  const inputPasswordVerificationRef = useRef<TextInput>(null);

  const verifyName = (name: string) => {
    if (loading) return;
    clearErrors();
    if (!name.trim()) {
      setNameError("Please enter your name");
      return false;
    }

    return true;
  };

  const verifyEmail = (email: string) => {
    if (loading) return;
    clearErrors();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const verifyPassword = (pwd: string) => {
    if (loading) return;
    clearErrors();
    if (!password) {
      setPasswordError("You need a password!");
      return false;
    }
    if (pwd.length < 6) {
      setPasswordError("The password must be at least 6 characters long!");
      return false;
    }
    if (pwd.length > 4096) {
      setPasswordError("The password is too long!");
      return false;
    }
    return true;
  };

  const verifyPasswordVerification = (pwdVer: string) => {
    if (loading) return;
    clearErrors();
    if (pwdVer !== password) {
      setPasswordVerificationError("The passwords don't match!");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (loading) return;
    clearErrors();

    if (!name) return setNameError("This field is required");
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

    if (!passwordVerification)
      return setPasswordVerificationError("This field is required");
    if (passwordVerification !== password)
      return setPasswordVerificationError("The passwords don't match!");

    setLoading(true);

    try {
      await signUp(email, password, name);
      Toast.show({ type: "success", text1: "Signed up" });
    } catch (e) {
      handleFirebaseError(e as FirebaseError);
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setPasswordVerificationError("");
  };

  return {
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
    loading,
    handleSignUp,
    inputEmailRef,
    inputPasswordRef,
    inputPasswordVerificationRef,
    verifyName,
    verifyEmail,
    verifyPassword,
    verifyPasswordVerification,
  };
}
