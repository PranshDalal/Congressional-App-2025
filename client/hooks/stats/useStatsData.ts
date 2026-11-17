import { useState, useEffect, useCallback } from "react";
import auth from "@react-native-firebase/auth";
// import { getUserSessions } from '@/services/backendSessionService';
import { SessionData } from "@/types/types";
import { getSessions } from "@/services/firebaseSessionService";
import { Timestamp } from "@react-native-firebase/firestore";

// Older sessions stored end_time as an ISO string; newer ones use a Firestore Timestamp.
function toSeconds(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "string") {
    // Python writes microseconds; JS engines only reliably parse milliseconds
    const iso = value.replace(/(\.\d{3})\d+/, "$1");
    const ms = Date.parse(iso.endsWith("Z") || /[+-]\d\d:\d\d$/.test(iso) ? iso : iso + "Z");
    return isNaN(ms) ? null : ms / 1000;
  }
  const seconds = (value as { seconds?: number }).seconds;
  return typeof seconds === "number" ? seconds : null;
}

function longestDayStreak(dayKeys: string[]): number {
  const days = Array.from(new Set(dayKeys)).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of days) {
    const day = Date.parse(key) / 86400000;
    run = prev !== null && day - prev === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

export interface StatsData {
  totalSessions: number;
  totalHours: string;
  bestStreak: number;
  averageFocus: number;
}

export interface RecentSessionData {
  id: string;
  date: string;
  duration: string;
}

export interface UseStatsDataReturn {
  sessions: SessionData[];
  loading: boolean;
  error: string | null;
  stats: StatsData | null;
  recentSessions: RecentSessionData[];
  refreshData: () => Promise<void>;
}

export function useStatsData(): UseStatsDataReturn {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        setError("User not authenticated");
        return;
      }

      const sessionData = await getSessions();

      // Sort sessions by start time (most recent first)
      sessionData.sort((a, b) =>
        a.start_time > b.start_time ? -1 : b.start_time > a.start_time ? 1 : 0
      );

      setSessions(sessionData);
    } catch (err) {
      setError("Failed to load sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const computeStats = useCallback((): StatsData | null => {
    if (sessions.length === 0) return null;

    let totalMinutes = 0;
    let completed = 0;
    let focusSum = 0;
    const sessionDays: string[] = [];

    sessions.forEach((session) => {
      // console.log(session);
      if (
        session.status === "completed" &&
        session.start_time &&
        session.end_time
      ) {
        completed++;
        const start = toSeconds(session.start_time);
        const end = toSeconds(session.end_time);

        if (start !== null && end !== null) {
          const diff = (end - start) / 60;
          totalMinutes += diff;

          if (session.focus_rating) focusSum += Number(session.focus_rating);

          const sessionDate = session.start_time
            .toDate()
            .toISOString()
            .split("T")[0];
          sessionDays.push(sessionDate);
        }
      }
    });

    // console.log({ totalMinutes, completed, focusSum, streak });

    return {
      totalSessions: completed,
      totalHours: (totalMinutes / 60).toFixed(1),
      bestStreak: longestDayStreak(sessionDays),
      averageFocus: completed ? Math.round(focusSum / completed) : 0,
    };
  }, [sessions]);

  const getRecentSessions = useCallback((): RecentSessionData[] => {
    return sessions.slice(0, 5).map((session, index) => ({
      id: session.session_id || `session-${index}`,
      date: session.start_time.toDate().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      duration: (() => {
        const start = toSeconds(session.start_time);
        const end = toSeconds(session.end_time);
        return start !== null && end !== null
          ? `${Math.round((end - start) / 60)} min`
          : "N/A";
      })(),
    }));
  }, [sessions]);

  const refreshData = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const stats = computeStats();
  const recentSessions = getRecentSessions();

  return {
    sessions,
    loading,
    error,
    stats,
    recentSessions,
    refreshData,
  };
}
