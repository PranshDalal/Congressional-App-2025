import { SessionData } from "@/types/types";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

const db = getFirestore();

const SESSIONS_COLLECTION = "sessions";

export async function getSession(sessionId: string) {
  const user = getAuth().currentUser;;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const sessionDoc = await db
    .collection("users")
    .doc(user.uid)
    .collection("sessions")
    .doc(sessionId)
    .get();

  if (!sessionDoc.exists) {
    throw new Error("Session not found");
  }

  const sessionData = sessionDoc.data() as SessionData;

  return sessionData;
}

export async function getSessions() {
  const user = getAuth().currentUser;;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const ref = db.collection("users").doc(user.uid).collection("sessions");
  const querySnapshot = await ref.orderBy('start_time', 'desc').get();
  const sessions: SessionData[] = [];

  querySnapshot.forEach((doc) => {
    sessions.push({ ...doc.data() } as SessionData);
  });

  return sessions;
}

export async function createSession(sessionData: SessionData) {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const ref = db.collection("users").doc(user.uid).collection("sessions");
  const docRef = await ref.add(sessionData);

  return { id: docRef.id, ...sessionData };
}
