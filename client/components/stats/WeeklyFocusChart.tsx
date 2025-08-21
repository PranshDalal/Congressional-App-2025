import React from "react";
import { View, Dimensions } from "react-native";
import { CartesianChart, Bar } from "victory-native";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import { SessionData } from "@/hooks/stats/useStatsData";
import { LineChart } from "react-native-chart-kit";

interface WeeklyFocusChartProps {
  sessions: SessionData[];
}

export default function WeeklyFocusChart({ sessions }: WeeklyFocusChartProps) {
  const screenWidth = Dimensions.get("window").width - 32;

  const focusByDay: Record<string, number[]> = {};

  sessions.forEach((session) => {
    if (
      session.status === "completed" &&
      session.focus_rating &&
      session.start_time
    ) {
      const date = new Date(session.start_time).toISOString().split("T")[0];
      if (!focusByDay[date]) focusByDay[date] = [];
      focusByDay[date].push(Number(session.focus_rating));
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
    <View>
      <ThemedText
        style={[globalStyles.header2, { marginBottom: 10, color: "#bb86fc" }]}
      >
        Weekly Focus
      </ThemedText>
      <View
        style={{
          backgroundColor: "#1e1e2f",
          borderRadius: 12,
          padding: 8,
        }}
      > 
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
      </View>
    </View>
  );
}
