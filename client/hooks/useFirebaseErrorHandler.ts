import { FirebaseError } from "firebase/app";
import Toast from "react-native-toast-message";

export const firebaseErrorMessages: Record<string, string> = {
  "auth/invalid-email": "The email address is invalid",
  "auth/user-not-found": "No user found with this email",
  "auth/invalid-credential": "Incorrect email or password entered",
  "auth/wrong-password": "Incorrect email or password entered",
  "auth/email-already-in-use": "Email is already in use",
  "auth/weak-password": "Password should be at least 6 characters",
  "auth/network-request-failed": "Network error. Please check network settings",
  "auth/internal-error": "An internal error occured",
};

export function useFirebaseErrorHandler() {
  const handleFirebaseError = (error: FirebaseError) => {
    const message = firebaseErrorMessages[error.code] || error.code;

    Toast.show({
      type: "error",
      text1: message,
    });
  };

  return { handleFirebaseError };
}
