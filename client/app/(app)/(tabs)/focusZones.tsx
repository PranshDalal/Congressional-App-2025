import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import BackgroundView from "@/components/view/BackgroundView";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import { getAuth } from "@react-native-firebase/auth";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ThemedText from "@/components/ThemedText";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";

const getRecommendationDetails = (key: string, value: any) => {
  let icon: keyof typeof MaterialCommunityIcons.glyphMap =
    "information-outline";
  let displayValue = "";
  let description = "";

  switch (key) {
    case "noise_level":
      icon = "volume-medium";
      if (typeof value === "number") {
        displayValue = `${value.toFixed(0)} dB`;
        if (value < 40) description = "Quiet environment (like a library)";
        else if (value < 60)
          description = "Moderate noise (normal conversation)";
        else if (value < 80) description = "Noisy environment (busy office)";
        else description = "Very noisy environment";
      }
      break;
    case "light_level":
      icon = "lightbulb-on";
      if (typeof value === "number") {
        displayValue = `${value.toFixed(0)} lux`;
        if (value < 50) description = "Dim lighting";
        else if (value < 300) description = "Moderate lighting (typical home)";
        else if (value < 1000) description = "Bright lighting (office or classroom)";
        else description = "Very bright lighting (near daylight)";
      }
      break;
    case "motion_level":
      icon = "walk";
      if (typeof value === "number") {
        displayValue = value.toFixed(1);
        if (value < 1) description = "Minimal movement";
        else if (value < 3) description = "Some movement";
        else description = "Frequent movement";
      }
      break;
    case "headphones":
      icon = "headphones";
      if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
        description = value
          ? "Wearing headphones helps your focus"
          : "You focus better without headphones";
      } else {
        displayValue =
          typeof value === "number" ? value.toFixed(0) : String(value);
      }
      break;
    case "ventilation":
      icon = "fan";
      if (typeof value === "string") {
        displayValue = value;
        description = "Optimal air circulation for your focus";
      } else {
        displayValue =
          typeof value === "number" ? value.toFixed(0) : String(value);
      }
      break;
    default:
      if (typeof value === "number") {
        displayValue = value.toFixed(2);
      } else if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else if (typeof value === "string") {
        displayValue = value;
      } else {
        displayValue = "N/A";
      }
  }

  return { icon, displayValue, description };
};

type RecommendationsResponse = {
  message: string;
  recommendations?: {
    noise_level: number;
    light_level: number;
    motion_level: number;
    headphones: boolean | number;
    ventilation: string | number;
    [key: string]: any;
  };
  // Only statistically significant patterns; absent when there wasn't enough data to analyze.
  insights?: string[];
  sessions_analyzed?: number;
};

const FocusZonesScreen = () => {
  const [recommendationsData, setRecommendationsData] =
    useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFocusZones();
  }, []);

  const fetchFocusZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/recommendations/${currentUser.uid}`
        );
        setRecommendationsData(response.data);
      } else {
        setError("You must be logged in to view recommendations");
      }
    } catch (error: any) {
      console.error("Error fetching focus zones:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to fetch recommendations. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <ThemedText style={globalStyles.mutedText}>
        Your optimal environment conditions based on past high-focus sessions.
      </ThemedText>
      <SizedBox height={25} />
      <TextButton
        title="Refresh Recommendations"
        onPress={fetchFocusZones}
        showLoading={loading}
        textStyle={styles.buttonText}
      />

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      {recommendationsData && (
        <Animated.View
          style={styles.recommendationsContainer}
          entering={FadeInDown.duration(500)}
        >
          <Animated.View entering={FadeInDown.duration(500).delay(250)}>
            <ThemedText
              style={[globalStyles.header3, { marginBottom: theme.spacing.md }]}
            >
              {recommendationsData.message}
            </ThemedText>
          </Animated.View>

          {recommendationsData.insights && (
            <Animated.View
              style={styles.insightsCard}
              entering={FadeInDown.duration(500).delay(300)}
            >
              <ThemedText style={styles.insightsTitle}>What we learned</ThemedText>
              {recommendationsData.insights.length > 0 ? (
                recommendationsData.insights.map((insight) => (
                  <View key={insight} style={styles.insightRow}>
                    <MaterialCommunityIcons
                      name="chart-line"
                      size={18}
                      color={theme.colors.primary}
                      style={{ marginRight: 8, marginTop: 2 }}
                    />
                    <ThemedText style={styles.insightText}>{insight}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.infoText}>
                  No significant patterns yet
                  {recommendationsData.sessions_analyzed
                    ? ` across your last ${recommendationsData.sessions_analyzed} sessions`
                    : ""}
                  . None of your environment factors are clearly linked to
                  your focus so far. Keep tracking sessions and check back.
                </ThemedText>
              )}
            </Animated.View>
          )}

          {recommendationsData.recommendations ? (
            <ScrollView style={styles.recommendationsList}>
              {Object.entries(recommendationsData.recommendations)
                // updated_at is bookkeeping metadata, not an environment setting
                .filter(([key]) => key !== "updated_at")
                .map(
                ([key, value]) => {
                  const { icon, displayValue, description } =
                    getRecommendationDetails(key, value);

                  return (
                    <Animated.View
                      key={key}
                      style={styles.recommendationItem}
                      entering={FadeInDown.duration(500).delay(400)}
                    >
                      <MaterialCommunityIcons
                        name={icon}
                        size={24}
                        color={theme.colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <View>
                        <ThemedText style={styles.recommendationText}>
                          {key.replace(/_/g, " ")}: {displayValue}
                        </ThemedText>
                        {description && (
                          <ThemedText style={styles.recommendationDescription}>
                            {description}
                          </ThemedText>
                        )}
                      </View>
                    </Animated.View>
                  );
                }
              )}
            </ScrollView>
          ) : (
            <Animated.View entering={FadeInDown.duration(500).delay(400)}>
              <ThemedText style={styles.infoText}>
                No specific recommendations available.
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </BackgroundView>
  );
};

export default FocusZonesScreen;

const styles = StyleSheet.create({
  buttonText: {
    fontWeight: 700,
    fontSize: 16,
  },
  recommendationsContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radii.md,
  },
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  recommendationDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  errorText: {
    marginTop: 16,
    color: theme.colors.danger,
    fontSize: 16,
  },
  insightsCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  insightText: {
    fontSize: 15,
    flexShrink: 1,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
});
