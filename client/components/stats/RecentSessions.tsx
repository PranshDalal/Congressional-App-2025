import React from "react";
import { View } from "react-native";
import ThemedText from "@/components/ThemedText";
import { RecentSessionData } from "@/hooks/stats/useStatsData";
import theme from "@/styles/theme";

interface RecentSessionsProps {
  recentSessions: RecentSessionData[];
}

export default function RecentSessions({
  recentSessions,
}: RecentSessionsProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.bg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        padding: 16,
      }}
    >
      {recentSessions.length === 0 ? (
        <ThemedText style={{ color: "#ccc" }}>No sessions yet.</ThemedText>
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
            <ThemedText>{session.date}</ThemedText>
            <ThemedText style={{ color: theme.colors.textMuted }}>
              {session.duration}
            </ThemedText>
          </View>
        ))
      )}
    </View>
  );
}
