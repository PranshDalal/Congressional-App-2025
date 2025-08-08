import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { useRouter } from "expo-router";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import StyledModal from "@/components/StyledModal";
import Toast from "react-native-toast-message";
import SizedBox from "@/components/SizedBox";
import StyledTextInput from "@/components/StyledTextInput";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import StyledSlider from "@/components/StyledSlider";
import KeyboardAvoidingScrollView from "@/components/KeyboardAvoidingScrollView";

const SurveyScreen = () => {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { sessionData } = useLocalSearchParams();
  const [focusRating, setFocusRating] = useState(5);
  const [lightLevel, setLightLevel] = useState(5);
  const [hadMusicOrHeadphones, setHadMusicOrHeadphones] = useState<
    boolean | null
  >(null);
  const [taskType, setTaskType] = useState("");
  const [location, setLocation] = useState("");
  const [ventilationStatus, setVentilationStatus] = useState<string | null>(
    null
  );

  const parsedSessionData = sessionData
    ? JSON.parse(sessionData as string)
    : {};

  const saveSession = async () => {
    try {
      const completeSessionData = {
        ...parsedSessionData,
        focus_rating: focusRating,
        headphones: hadMusicOrHeadphones,
        ventilation: ventilationStatus,
        location: location,
        task_type: taskType,
        completed_at: new Date().toISOString(),
      };

      if (!completeSessionData.session_id) {
        Toast.show({
          type: "error",
          text1: "No session ID found",
          text2: "Cannot save session without ID",
        });
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/end_session`,
        completeSessionData,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Saved session",
        text2: "Session data saved successfully",
      });

      router.push("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to save session",
      });

      router.push("/");
    }
  };

  const deleteSession = () => {
    Toast.show({
      type: "error",
      text1: "Deleted session",
    });
    router.push("/");
  };

  return (
    <BackgroundView withSafeArea>
      <KeyboardAvoidingScrollView>
        <View style={globalStyles.screenPadding}>
          <Text style={[globalStyles.header1]}>Survey</Text>
          <SizedBox height={30} />

          {/* Focus Rating Slider */}
          <Text style={styles.sliderLabel}>Focus Rating: {focusRating}</Text>
          <StyledSlider
            minimumValue={1}
            maximumValue={10}
            value={focusRating}
            onValueChange={setFocusRating}
            step={1}
            showBounds={true}
          />
          {/* <View style={styles.sliderLabels}>
              <Text style={styles.sliderEndLabel}>1</Text>
              <Text style={styles.sliderEndLabel}>10</Text>
            </View> */}

          <SizedBox height={20} />

          <SizedBox height={20} />

          <SizedBox height={30} />

          {/* Music/Headphones Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>
              Did you have music or headphones on?
            </Text>
            <View style={styles.radioGroup}>
              <Pressable
                style={[
                  styles.radioOption,
                  hadMusicOrHeadphones === true && styles.radioSelected,
                ]}
                onPress={() => setHadMusicOrHeadphones(true)}
              >
                <Text
                  style={[
                    styles.radioText,
                    hadMusicOrHeadphones === true && styles.radioTextSelected,
                  ]}
                >
                  Yes
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.radioOption,
                  hadMusicOrHeadphones === false && styles.radioSelected,
                ]}
                onPress={() => setHadMusicOrHeadphones(false)}
              >
                <Text
                  style={[
                    styles.radioText,
                    hadMusicOrHeadphones === false && styles.radioTextSelected,
                  ]}
                >
                  No
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Ventilation Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>
              What kind of ventilation was in the room?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row", gap: 12 }}
            >
              {[
                "Closed room (no ventilation)",
                "Air conditioning (AC)",
                "Open window",
                "Fan on",
                "Other",
              ].map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.radioOption,
                    ventilationStatus === option && styles.radioSelected,
                  ]}
                  onPress={() => setVentilationStatus(option)}
                >
                  <Text
                    style={[
                      styles.radioText,
                      ventilationStatus === option && styles.radioTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <SizedBox height={25} />

          <SizedBox height={25} />

          {/* Task Type Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Task Type</Text>
            <StyledTextInput
              placeholder="e.g., Studying, Work, Reading..."
              value={taskType}
              onChangeText={setTaskType}
              style={styles.textInput}
            />
          </View>

          <SizedBox height={20} />

          {/* Location Questions */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Location</Text>
            <StyledTextInput
              placeholder="Where did this take place?"
              value={location}
              onChangeText={setLocation}
              style={styles.textInput}
            />
          </View>
        </View>
        {/* <SizedBox height={500} /> */}
      </KeyboardAvoidingScrollView>

      <View style={styles.bottomStickyView}>
        <TextButton
          title="Delete"
          variant="secondary"
          onPress={() => setDeleteModalVisible(true)}
          width="45%"
        />
        <TextButton title="Save" onPress={saveSession} width="45%" />
      </View>
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
  scrollContent: {
    // paddingBottom: 120,
  },
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
  questionContainer: {
    marginBottom: theme.spacing.md,
  },
  questionLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  radioGroup: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  radioOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    backgroundColor: "transparent",
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    textAlign: "center",
  },
  radioTextSelected: {
    color: "#fff",
    fontWeight: theme.fontWeight.semibold,
  },
  checkboxGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  checkboxOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  checkboxTextSelected: {
    color: "#fff",
    fontWeight: theme.fontWeight.semibold,
  },
  textInput: {
    width: "100%",
  },
});
