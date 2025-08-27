import { SessionData } from '@/types/types';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface StartSessionRequest {
  user_id: string;
}

export interface StartSessionResponse {
  session_id: string;
}

export interface EndSessionRequest {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  focus_rating: number;
  sensor_data?: any[];
  [key: string]: any; // For additional session data
}

// Session management functions
export async function startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
  const response = await axios.post(`${API_BASE_URL}/api/start_session`, data);
  return response.data;
}

export async function endSession(data: EndSessionRequest) {
  return axios.post(`${API_BASE_URL}/api/end_session`, data, {
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Session data retrieval functions
// export async function getUserSessions(userId: string): Promise<SessionData[]> {
//   const response = await axios.get(`${API_BASE_URL}/api/session/${userId}`);
//   return Object.values(response.data) as SessionData[];
// }
