import React from "react";
import { ScrollView } from "react-native";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import { useStatsData } from "@/hooks/stats/useStatsData";
import {
  StatsLoadingState,
  StatsOverview,
  RecentSessions,
  WeeklyFocusChart
} from "@/components/stats";

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
            <StatsOverview stats={stats} />
            
            <SizedBox height={30} />
            
            <RecentSessions recentSessions={recentSessions} />
            
            <SizedBox height={40} />
            
            <WeeklyFocusChart sessions={sessions} />
            
            <SizedBox height={60} />
          </>
        )}
      </ScrollView>
    </BackgroundView>
  );
};

export default StatsScreen;
