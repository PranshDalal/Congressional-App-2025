import { NudgeData } from "@/types/types";
import firestore from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";

export const feedbackNudge = async (nudgeData: NudgeData) => {
  const userId = getAuth().currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const fbRef = firestore()
    .collection("users")
    .doc(userId)
    .collection("feedback")
    .doc(); 

  await fbRef.set({
    ...nudgeData
  });
};
