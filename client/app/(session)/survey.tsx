import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";

const SurveyScreen = () => {
  return (
    <BackgroundView>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={globalStyles.screenPadding}>
          <Text style={[globalStyles.header1]}>Survey</Text>
        </View>

        <View style={styles.bottomStickyView}>
          <Link href="/(app)" asChild>
            <TextButton
              title="Delete"
              variant="secondary"
              onPress={() => {}}
              width="45%"
            />
          </Link>
          <Link href="/(app)" asChild>
            <TextButton title="Save" onPress={() => {}} width="45%" />
          </Link>
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
};

export default SurveyScreen;

const styles = StyleSheet.create({
  bottomStickyView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  }
});
