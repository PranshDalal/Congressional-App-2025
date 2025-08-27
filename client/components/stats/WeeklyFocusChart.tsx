import React from "react";
import { View, Dimensions } from "react-native";
import { CartesianChart, Bar } from "victory-native";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import { SessionData } from "@/hooks/stats/useStatsData";
import { LineChart } from "react-native-chart-kit";
import { theme } from "@/styles/theme";

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
    <View
      style={{
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.sm,
      }}
    >
      {/* <CartesianChart data={focusByDay}>
        
      </CartesianChart> */}
      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth}
        height={220}
        yAxisSuffix="/10"
        chartConfig={{
          backgroundColor: theme.colors.bg,
          backgroundGradientFrom: theme.colors.bg,
          backgroundGradientTo: theme.colors.bg,
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
  );
}
