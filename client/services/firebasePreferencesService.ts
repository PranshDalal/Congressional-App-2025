import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, addDoc } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const preferencesCollection = "preferences";

export const PreferencesService = {
    setNudgeFrequency: async (frequency: "Low" | "Mid" | "High") => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        const db = getFirestore();
        const freqDocRef = doc(collection(doc(collection(db, "users"), userId), preferencesCollection), "frequency");
        await setDoc(freqDocRef, { nudgeFrequency: frequency }, { merge: true });
    },

    getNudgeFrequency: async () => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        const db = getFirestore();
        const freqDocRef = doc(collection(doc(collection(db, "users"), userId), preferencesCollection), "frequency");
        
        const freqDoc = await getDoc(freqDocRef);

        return freqDoc.data()?.nudgeFrequency;
    }
}

