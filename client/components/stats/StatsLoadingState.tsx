import React from "react";
import { ActivityIndicator, View } from "react-native";
import ThemedText from "@/components/ThemedText";
import { StyleSheet } from "react-native";
import theme from "@/styles/theme";

interface StatsLoadingStateProps {
  loading: boolean;
  error: string | null;
}

export default function StatsLoadingState({
  loading,
  error,
}: StatsLoadingStateProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>Loading your stats...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
  },
});
