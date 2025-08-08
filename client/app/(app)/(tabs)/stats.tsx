import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import axios from "axios";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import auth from "@react-native-firebase/auth";
import { LineChart } from "react-native-chart-kit";

const WeeklyFocusChart = ({ sessions }: { sessions: any[] }) => {
  const screenWidth = Dimensions.get("window").width - 32;

  const focusByDay: Record<string, number[]> = {};

  sessions.forEach((s) => {
    if (s.status === "completed" && s.focus_rating && s.start_time) {
      const date = new Date(s.start_time).toISOString().split("T")[0];
      if (!focusByDay[date]) focusByDay[date] = [];
      focusByDay[date].push(Number(s.focus_rating));
    }
  });

  const days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const labels = days.map((d) =>
    new Date(d).toLocaleDateString(undefined, { weekday: "short" })
  );

  const data = days.map((d) => {
    const ratings = focusByDay[d];
    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return parseFloat(avg.toFixed(1));
    }
    return 0;
  });

  return (
    <LineChart
      data={{ labels, datasets: [{ data }] }}
      width={screenWidth}
      height={220}
      yAxisSuffix="/10"
      chartConfig={{
        backgroundColor: "#1e1e2f",
        backgroundGradientFrom: "#1e1e2f",
        backgroundGradientTo: "#1e1e2f",
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(187, 134, 252, ${opacity})`,
        labelColor: () => "#fff",
        propsForDots: {
          r: "5",
          strokeWidth: "2",
          stroke: "#bb86fc",
        },
      }}
      style={{ borderRadius: 12, marginVertical: 8 }}
    />
  );
};

const StatsScreen = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const USER_ID = currentUser.uid;
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/session/${USER_ID}`);
        const sessionData = Object.values(response.data);

        sessionData.sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        setSessions(sessionData);
      } catch (err) {
        setError("Failed to load sessions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const computeStats = () => {
    if (sessions.length === 0) return null;

    let totalMinutes = 0;
    let completed = 0;
    let focusSum = 0;
    let streak = 0;
    let lastSessionDate: string | null = null;

    sessions.forEach((s) => {
      if (s.status === "completed" && s.start_time && s.end_time) {
        completed++;
        const start = new Date(s.start_time);
        const end = new Date(s.end_time);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += diff;

        if (s.focus_rating) focusSum += Number(s.focus_rating);

        const sessionDate = s.start_time.split("T")[0];
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
  };

  const stats = computeStats();

  const recentSessions = sessions.slice(0, 5).map((s, i) => ({
    id: s.session_id || `session-${i}`,
    date: new Date(s.start_time).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    duration: s.end_time
      ? `${Math.round(
          (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60)
        )} min`
      : "N/A",
  }));

  return (
    <BackgroundView withSafeArea withScreenPadding disableDismiss>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#121212" }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={true}
      >

        {loading ? (
          <ActivityIndicator size="large" color="#bb86fc" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <StatCard label="Total Sessions" value={stats?.totalSessions || 0} />
              <StatCard label="Focus Hours" value={`${stats?.totalHours || 0}h`} />
              <StatCard label="Best Streak" value={`${stats?.bestStreak || 0} days`} />
              <StatCard label="Avg Focus" value={`${stats?.averageFocus || 0}/10`} />
            </View>

            <SizedBox height={30} />

            <Text style={[globalStyles.header2, { marginBottom: 10, color: "#bb86fc" }]}>
              Recent Sessions
            </Text>
            <View
              style={{
                backgroundColor: "#1e1e2f",
                borderRadius: 12,
                padding: 16,
              }}
            >
              {recentSessions.length === 0 ? (
                <Text style={[globalStyles.bodyText, { color: "#ccc" }]}>No sessions yet.</Text>
              ) : (
                recentSessions.map((session) => (
                  <View
                    key={session.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={[globalStyles.bodyText, { color: "#fff" }]}>{session.date}</Text>
                    <Text style={[globalStyles.bodyText, { color: "#bb86fc" }]}>{session.duration}</Text>
                  </View>
                ))
              )}
            </View>

            <SizedBox height={40} />

            <Text style={[globalStyles.header2, { marginBottom: 10, color: "#bb86fc" }]}>
              Weekly Focus
            </Text>
            <View
              style={{
                backgroundColor: "#1e1e2f",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <WeeklyFocusChart sessions={sessions} />
            </View>

            <SizedBox height={60} />
          </>
        )}
      </ScrollView>
    </BackgroundView>
  );
};

export default StatsScreen;

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <View
    style={{
      width: "48%",
      backgroundColor: "#1e1e2f",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}
  >
    <Text style={[globalStyles.bodyText, { color: "#bb86fc" }]}>{label}</Text>
    <Text style={[globalStyles.header3, { marginTop: 4, color: "#ffffff" }]}>{value}</Text>
  </View>
);
