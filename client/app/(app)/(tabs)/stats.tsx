import React from "react";
import { ScrollView } from "react-native";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import { useStatsData } from "@/hooks/stats/useStatsData";
import {
  StatsLoadingState,
  StatsOverview,
  RecentSessions,
  WeeklyFocusChart,
} from "@/components/stats";
import ThemedText from "@/components/ThemedText";
import theme from "@/styles/theme";
import { StyleSheet } from "react-native";

const StatsScreen = () => {
  const { sessions, loading, error, stats, recentSessions } = useStatsData();

  return (
    <BackgroundView withSafeArea disableDismiss>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: globalStyles.screenPadding.paddingHorizontal,
        }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={true}
      >
        <StatsLoadingState loading={loading} error={error} />

        {!loading && !error && (
          <>
            <ThemedText style={styles.headerText}>Overview</ThemedText>
            <StatsOverview stats={stats} />

            <ThemedText style={styles.headerText}>Recent Sessions</ThemedText>
            <RecentSessions recentSessions={recentSessions} />

            <ThemedText style={styles.headerText}>Weekly Focus</ThemedText>
            <WeeklyFocusChart sessions={sessions} />

            <SizedBox height={30} />
          </>
        )}
      </ScrollView>
    </BackgroundView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  headerText: {
    ...globalStyles.header2,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
  },
});
