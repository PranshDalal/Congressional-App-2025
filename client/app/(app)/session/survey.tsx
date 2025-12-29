import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import { useRouter } from "expo-router";
import TextButton from "@/components/button/TextButton";
import theme from "@/styles/theme";
import StyledModal from "@/components/view/StyledModal";
import Toast from "react-native-toast-message";
import SizedBox from "@/components/SizedBox";
import StyledTextInput from "@/components/StyledTextInput";
import { useLocalSearchParams } from "expo-router";
import { endSession } from "@/services/backendSessionService";
import StyledSlider from "@/components/StyledSlider";
import ChipRadioButtonGroup from "@/components/button/ChipRadioButtonGroup";
import ThemedText from "@/components/ThemedText";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StatCard } from "@/components/stats";

const SurveyScreen = () => {
  const router = useRouter();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { sessionData } = useLocalSearchParams();
  const [focusRating, setFocusRating] = useState(5);
  const [lightLevel, setLightLevel] = useState(5);
  const [hadMusicOrHeadphones, setHadMusicOrHeadphones] = useState<
    boolean | null
  >(null);
  const [musicHeadphonesIndex, setMusicHeadphonesIndex] = useState<
    number | null
  >(null);
  const [taskStatusIndex, setTaskStatusIndex] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>("");

  const [taskType, setTaskType] = useState("");
  const [location, setLocation] = useState("");
  const [ventilationStatusIndex, setVentilationStatusIndex] = useState<
    number | null
  >(null);
  const [ventilationStatus, setVentilationStatus] = useState<string | null>(
    null
  );

  const parsedSessionData = sessionData
    ? JSON.parse(sessionData as string)
    : {};

  const saveSession = async () => {
    if (
      focusRating === null ||
      hadMusicOrHeadphones === null ||
      ventilationStatus === null ||
      location.trim() === ""
    ) {
      Toast.show({
        type: "error",
        text1: "Missing required fields",
        text2: "Please answer all questions before saving."
      });
      return;
    }

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

      const response = await endSession(completeSessionData);

      Toast.show({
        type: "success",
        text1: "Saved session",
        text2: "Session data saved successfully",
      });

      router.push({ pathname: "/", params: { completed_session: "true" } });
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
      <KeyboardAwareScrollView
        bottomOffset={48}
        style={{ flex: 1, marginBottom: 48 }}
      >
        <View style={globalStyles.screenPadding}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <StatCard
              label="Duration"
              value={
                parsedSessionData.duration
                  ? `${Math.floor(
                      parsedSessionData.duration / 60000
                    )}m ${Math.floor(
                      (parsedSessionData.duration % 60000) / 1000
                    )}s`
                  : "N/A"
              }
            />
            <StatCard
              label="Session Type"
              value={parsedSessionData.sessionType || "N/A"}
            />
              {/* // NOTE: I haven't implemented this yet, this is just a placeholder */}
            <StatCard
              label="Number of Nudges"
              value={parsedSessionData.numberOfNudges || 0}
            />
            <StatCard
              label="Goal"
              value={
                parsedSessionData.goal?.length > 0
                  ? parsedSessionData.goal
                  : "N/A"
              }
            />
          </View>
          {/* Focus Rating Slider */}
          <ThemedText style={styles.sliderLabel}>
            Focus Rating: {focusRating}
          </ThemedText>
          <StyledSlider
            minimumValue={1}
            maximumValue={10}
            value={focusRating}
            onValueChange={setFocusRating}
            step={1}
            showBounds={true}
          />

          <SizedBox height={20} />

          {/* Music/Headphones Question */}
          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionLabel}>
              Did you have music or headphones on?
            </ThemedText>
            <ChipRadioButtonGroup
              labels={Object.values(HeadphonesStatus)}
              onSelect={(index) => {
                setMusicHeadphonesIndex(index);
                setHadMusicOrHeadphones(index === 0);
              }}
              selectedIndex={musicHeadphonesIndex}
            />
          </View>

          {/* Ventilation Question */}
          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionLabel}>
              What kind of ventilation was in the room?
            </ThemedText>
            <ChipRadioButtonGroup
              scrollable={true}
              labels={Object.values(VentilationStatus)}
              onSelect={(index) => {
                setVentilationStatus(Object.values(VentilationStatus)[index]);
                setVentilationStatusIndex(index);
              }}
              selectedIndex={ventilationStatusIndex}
            />
          </View>

          <SizedBox height={25} />

          {/* Task Type Question */}
          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionLabel}>Task Status</ThemedText>
            <ChipRadioButtonGroup
              labels={["Completed", "Incompleted"]}
              onSelect={(index) => {
                setTaskStatusIndex(index);
                setTaskStatus(index === 0 ? "Completed" : "Incompleted");
              }}
              selectedIndex={taskStatusIndex}
            />
          </View>
          {/* <View style={styles.questionContainer}>
            <ThemedText style={styles.questionLabel}>Task Type</ThemedText>
            <StyledTextInput
              placeholder="e.g., Studying, Work, Reading..."
              value={taskType}
              onChangeText={setTaskType}
              style={styles.textInput}
            />
          </View> */}

          <SizedBox height={20} />

          {/* Location Questions */}
          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionLabel}>Location</ThemedText>
            <StyledTextInput
              placeholder="Where did this take place?"
              value={location}
              onChangeText={setLocation}
              style={styles.textInput}
            />
          </View>
        </View>
        {/* <SizedBox height={500} /> */}
      </KeyboardAwareScrollView>

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
  questionContainer: {
    marginBottom: theme.spacing.md,
  },
  questionLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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

enum HeadphonesStatus {
  Yes = "Yes",
  No = "No",
}

enum VentilationStatus {
  ClosedRoom = "No Ventilation",
  AirConditioning = "Air Conditioning",
  Outside = "Outside",
  OpenWindow = "Open Window",
  FanOn = "Fan On",
  Other = "Other",
}
