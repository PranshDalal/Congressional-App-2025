import React from "react";
import { View } from "react-native";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: "#1e1e2f",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <ThemedText style={{ color: "#bb86fc" }}>{label}</ThemedText>
      <ThemedText
        style={[globalStyles.header3, { marginTop: 4, color: "#ffffff" }]}
      >
        {value}
      </ThemedText>
    </View>
  );
}
