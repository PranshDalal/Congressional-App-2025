import { getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth";

export async function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(getAuth(), email, password);
}

export async function sendResetPasswordEmail(email: string) {
    return getAuth().sendPasswordResetEmail(email);
}

export async function signUp(email: string, password: string, name: string) {
  const userCredential = await getAuth().createUserWithEmailAndPassword(email, password);
  await userCredential.user.updateProfile({ displayName: name });
  return userCredential;
}