import React from "react";
import { View } from "react-native";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: theme.colors.bg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
      }}
    >
      <ThemedText style={{ color: theme.colors.text }}>{label}</ThemedText>
      <ThemedText
        style={[
          globalStyles.bodyText,
          { marginTop: 4, color: theme.colors.textMuted },
        ]}
      >
        {value}
      </ThemedText>
    </View>
  );
}
