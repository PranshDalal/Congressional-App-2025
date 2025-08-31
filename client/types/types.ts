import { Timestamp } from "@react-native-firebase/firestore";

export interface SessionData {
  session_id?: string;
//   user_id?: string;
  start_time: Timestamp;
  end_time?: Timestamp;
  headphones?: string;
  lightLevel?: number;
  location?: string;
  noise_level?: number;
  status?: string;
  task_type?: string;
  ventilation?: string;
  focus_rating?: number;
}

export interface NudgeData {
  nudge_text: string;
  response: string;
  timestamp: Timestamp;
}