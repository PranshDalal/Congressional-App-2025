import React from 'react';
import { View } from 'react-native';
import ThemedText from '@/components/ThemedText';
import globalStyles from '@/styles/globalStyles';
import { RecentSessionData } from '@/hooks/stats/useStatsData';

interface RecentSessionsProps {
  recentSessions: RecentSessionData[];
}

export default function RecentSessions({ recentSessions }: RecentSessionsProps) {
  return (
    <View>
      <ThemedText
        style={[
          globalStyles.header2,
          { marginBottom: 10, color: "#bb86fc" },
        ]}
      >
        Recent Sessions
      </ThemedText>
      <View
        style={{
          backgroundColor: "#1e1e2f",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {recentSessions.length === 0 ? (
          <ThemedText style={{ color: "#ccc" }}>
            No sessions yet.
          </ThemedText>
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
              <ThemedText style={{ color: "#fff" }}>
                {session.date}
              </ThemedText>
              <ThemedText style={{ color: "#bb86fc" }}>
                {session.duration}
              </ThemedText>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
