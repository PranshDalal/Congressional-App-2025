import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/styles/globalStyles";
import { Link, useRouter } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import StyledModal from "@/components/StyledModal";
import Toast from "react-native-toast-message";
import CustomSlider from "@/components/CustomSlider";
import SizedBox from "@/components/SizedBox";

const SurveyScreen = () => {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const [focusRating, setFocusRating] = useState(5);
  const [noiseLevel, setNoiseLevel] = useState(5);
  const [lightLevel, setLightLevel] = useState(5);
  const [motionLevel, setMotionLevel] = useState(5);

  const saveSession = () => {
    Toast.show({
      type: "success",
      text1: "Saved session",
    });
    router.push("/");
  };

  const deleteSession = () => {
    Toast.show({
      type: "error",
      text1: "Deleted session",
    });
    router.push("/");
  };

  return (
    <BackgroundView>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={globalStyles.screenPadding}>
          <Text style={[globalStyles.header1]}>Survey</Text>
          <SizedBox height={30} />
          
          {/* Focus Rating Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Focus Rating: {focusRating}</Text>
            <CustomSlider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={focusRating}
              onValueChange={setFocusRating}
              step={1}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textMuted}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderEndLabel}>1</Text>
              <Text style={styles.sliderEndLabel}>10</Text>
            </View>
          </View>

          <SizedBox height={20} />


          <SizedBox height={20} />

          {/* Light Level Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Light Level: {lightLevel}</Text>
            <CustomSlider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={lightLevel}
              onValueChange={setLightLevel}
              step={1}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textMuted}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderEndLabel}>Dark</Text>
              <Text style={styles.sliderEndLabel}>Bright</Text>
            </View>
          </View>

          <SizedBox height={20} />

        </View>

        <View style={styles.bottomStickyView}>
          <TextButton
            title="Delete"
            variant="secondary"
            onPress={() => setDeleteModalVisible(true)}
            width="45%"
          />
          <TextButton title="Save" onPress={saveSession} width="45%" />
        </View>
      </SafeAreaView>
      <StyledModal
        title="Delete Session"
        body="Are you sure you want to delete this session?"
        type="ask"
        submitButtonText="Delete Session"
        visible={deleteModalVisible}
        onSubmit={deleteSession}
        setModalVisibleCallback={setDeleteModalVisible}
      />
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
  },
  sliderContainer: {
    marginBottom: theme.spacing.md,
  },
  sliderLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  sliderEndLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
