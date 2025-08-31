import firestore from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const preferencesCollection = "preferences";

export const PreferencesService = {
    setNudgeFrequency: async (frequency: "Low" | "Mid" | "High") => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        await firestore()
            .collection("users")
            .doc(userId)
            .collection(preferencesCollection)
            .doc("frequency")
            .set({ nudgeFrequency: frequency }, { merge: true });
    },

    getNudgeFrequency: async () => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        const doc = await firestore()
            .collection("users")
            .doc(userId)
            .collection(preferencesCollection)
            .doc("frequency")
            .get();

        return doc.data()?.nudgeFrequency;
    }
}

