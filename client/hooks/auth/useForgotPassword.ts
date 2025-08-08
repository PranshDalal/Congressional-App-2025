import { FirebaseError } from "firebase/app";
import { useRef, useState } from "react";
import { useFirebaseErrorHandler } from "../useFirebaseErrorHandler";
import { TextInput } from "react-native";
import { sendResetPasswordEmail, signIn, signUp } from "@/services/authService";
import Toast from "react-native-toast-message";

export const useForgotPassword = (
  email: string,
  setEmailError: (msg: string) => void,
  loading: boolean,
  setLoading: (loading: boolean) => void
) => {
  const [emailResetCooldown, setEmailResetCooldown] = useState(0);

  const forgotPassword = async () => {
    if (loading) return;

    setEmailError("");

    if (emailResetCooldown - Date.now() > 0) {
      Toast.show({
        type: "error",
        text1: `Too fast! Try again in ${Math.floor(
          (emailResetCooldown - Date.now()) / 1000
        )} seconds`,
      });
      return;
    }

    if (!email) {
      setEmailError("This field is required");
      return;
    }

    setLoading(true);
    try {
      await sendResetPasswordEmail(email);
      Toast.show({ text1: "Password reset email sent" });
      setEmailResetCooldown(Date.now() + 60000);
    } catch (e) {
      const err = e as FirebaseError;
      Toast.show({
        type: "error",
        text1: "Error sending email: " + err.code,
      });
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
};