import React from 'react';
import { View } from 'react-native';
import { StatsData } from '@/hooks/stats/useStatsData';
import StatCard from './StatCard';

interface StatsOverviewProps {
  stats: StatsData | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <StatCard
        label="Total Sessions"
        value={stats?.totalSessions || 0}
      />
      <StatCard
        label="Focus Hours"
        value={`${stats?.totalHours || 0}h`}
      />
      <StatCard
        label="Longest Streak"
        value={`${stats?.bestStreak || 0} days`}
      />
      <StatCard
        label="Avg Focus"
        value={`${stats?.averageFocus || 0}/10`}
      />
    </View>
  );
}
