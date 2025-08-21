import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import ThemedText from '@/components/ThemedText';

interface StatsLoadingStateProps {
  loading: boolean;
  error: string | null;
}

export default function StatsLoadingState({ loading, error }: StatsLoadingStateProps) {
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
        <ActivityIndicator size="large" color="#bb86fc" />
        <ThemedText style={{ marginTop: 16, color: "#ccc" }}>Loading your stats...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
        <ThemedText style={{ color: "red", textAlign: 'center' }}>{error}</ThemedText>
      </View>
    );
  }

  return null;
}
