import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import { getUserSessions, SessionData as BackendSessionData } from '@/services/sessionService';

export interface SessionData {
  session_id: string;
  start_time: string;
  end_time?: string;
  status: string;
  focus_rating?: number;
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

      const sessionData = await getUserSessions(currentUser.uid);

      // Sort sessions by start time (most recent first)
      sessionData.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      
      setSessions(sessionData);
    } catch (err) {
      setError("Failed to load sessions");
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const computeStats = useCallback((): StatsData | null => {
    if (sessions.length === 0) return null;

    let totalMinutes = 0;
    let completed = 0;
    let focusSum = 0;
    let streak = 0;
    let lastSessionDate: string | null = null;

    sessions.forEach((session) => {
      if (session.status === "completed" && session.start_time && session.end_time) {
        completed++;
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += diff;

        if (session.focus_rating) focusSum += Number(session.focus_rating);

        const sessionDate = session.start_time.split("T")[0];
        if (sessionDate !== lastSessionDate) {
          streak++;
          lastSessionDate = sessionDate;
        }
      }
    });

    return {
      totalSessions: completed,
      totalHours: (totalMinutes / 60).toFixed(1),
      bestStreak: streak,
      averageFocus: completed ? Math.round(focusSum / completed) : 0,
    };
  }, [sessions]);

  const getRecentSessions = useCallback((): RecentSessionData[] => {
    return sessions.slice(0, 5).map((session, index) => ({
      id: session.session_id || `session-${index}`,
      date: new Date(session.start_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      duration: session.end_time
        ? `${Math.round(
            (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) /
              (1000 * 60)
          )} min`
        : "N/A",
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
