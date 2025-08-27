import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

const currentUser = getAuth().currentUser;

const db = getFirestore();

const SESSIONS_COLLECTION = "sessions";

export interface SessionData {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  headphones?: string;
  lightLevel?: number;
  location?: string;
  noiseLevel?: number;
  status?: string;
  taskType?: string;
  ventilation?: string;
}

export async function getSession(sessionId: string) {
  const user = currentUser;

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
