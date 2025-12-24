import React, { useEffect, useRef, useState } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import TextButton from "@/components/button/TextButton";
import { useGetStartSessionPermissions } from "@/hooks/useGetStartSessionPermissions";
import SizedBox from "@/components/SizedBox";
import ThemedText from "@/components/ThemedText";
import globalStyles from "@/styles/globalStyles";
import { View, Image, Dimensions, StyleSheet } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PlayOutline, PlaySolid } from "@/assets/icons/heroicons";
import { Confetti, ConfettiMethods } from "react-native-fast-confetti";
import { useLocalSearchParams } from "expo-router";
import theme from "@/styles/theme";
import StyledBottomSheet from "@/components/StyledBottomSheet";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import SettingsButton from "@/components/button/SettingsButton";
import TimeRangePicker from "@/components/TimeRangePicker";
import { usePermissionsStore } from "@/utils/permissionStore";
import { useSessionSettingsState } from "@/utils/sessionSettingsStore";
// import StyledTextInput from "@/components/StyledTextInput";
// import { TextInput } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const IndexScreen = () => {
  const startSession = useGetStartSessionPermissions();
  const searchParams = useLocalSearchParams();
  const completedSession = searchParams["completed_session"] === "true";

  // const [deviceType, setDeviceType] = useState<"phone" | "bluetooth">("phone");
  // const [sessionType, setSessionType] = useState<"timed" | "untimed">("timed");
  // const [durationInMinutes, setDurationInMinutes] = useState<number>(30);

  const { requested, setRequested } = usePermissionsStore();
  const { sessionGoalText, setSessionGoalText, sessionDevice, setSessionDevice, sessionType, setSessionType, sessionDuration, setSessionDuration } =
    useSessionSettingsState();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  // const bottomSheetTextInputRef = useRef<TextInput>(null);

  const openSessionStartSheet = () => {
    bottomSheetRef.current?.present();
  };

  const startSessionButtonPressed = () => {
    bottomSheetRef.current?.dismiss();
    console.log("Session Device: ", sessionDevice);
    startSession(sessionDevice);
  };

  useEffect(() => { setSessionGoalText("") }, [setSessionGoalText]);

  return (
    <>
      <BackgroundView withSafeArea withScreenPadding style={{ justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("@/assets/icons/ios-dark.png")}
          style={{ width: 120, height: 120, resizeMode: "contain" }}
        />
        <SizedBox height={16} />
        <ThemedText
          style={[
            globalStyles.header1,
            { textAlign: "center" },
          ]}
        >
          Ready to focus?
        </ThemedText>
        <SizedBox height={24} />
        <TextButton
          textStyle={{ fontSize: theme.fontSize.lg }}
          icon={<PlaySolid size={20} color="white" />}
          title="Start Session"
          style={{ borderRadius: theme.radii.full }}
          width={"100%"}
          onPress={openSessionStartSheet}
        />
        <StyledBottomSheet
          ref={bottomSheetRef}
<<<<<<< HEAD
          snapPoints={["50%"]}
          enableDynamicSizing={false}
          onSheetChange={() => { }}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              marginBottom: 20,
              justifyContent: "space-around",
            }}
          >
            <ThemedText style={[globalStyles.header3]}>
              New Focus Session
            </ThemedText>
            <BottomSheetTextInput
              // ref={bottomSheetTextInputRefs}
              value={sessionGoalText || ""}
              onChangeText={setSessionGoalText}
              placeholder="What do you want to accomplish? (optional)"
              style={styles.bottomSheetTextInput}
            />
            <SizedBox height={8} />
            <SettingsButton
              title="Input Device"
              rightVariant="arrow"
              rightCustomComponent={
                <ThemedText style={{ color: theme.colors.textMuted }}>
                  {sessionDevice === "phone" ? "Phone" : "Bluetooth"}
                </ThemedText>
              }
              onPress={() =>
                setSessionDevice(
                  sessionDevice === "phone" ? "bluetooth" : "phone"
                )
              }
            />
            <SizedBox height={8} />
            <SettingsButton
              title="Session Type"
              rightVariant="arrow"
              rightCustomComponent={
                <ThemedText style={{ color: theme.colors.textMuted }}>
                  {sessionType === "timed" ? "Timed" : "Untimed"}
                </ThemedText>
              }
              onPress={() =>
                setSessionType(sessionType === "timed" ? "untimed" : "timed")
              }
            />
            {sessionType === "timed" && (
              <>
                <SizedBox height={8} />
                <SettingsButton
                  title="Duration"
                  rightVariant="custom"
                  rightCustomComponent={
                    <TimeRangePicker
                      value={sessionDuration || 30}
                      onChange={(newValue) => {
                        const value = typeof newValue === 'function' ? newValue(sessionDuration || 30) : newValue;
                        setSessionDuration(value);
                      }}
                      minDurationInMinutes={5}
                      maxDurationInMinutes={300}
                      stepInMinutes={5}
                    />
                  }
                />
              </>
            )}
            <SizedBox height={20} />
            <TextButton
              textStyle={{ fontSize: theme.fontSize.lg }}
              style={{ borderRadius: theme.radii.full }}
              width={"100%"}
              title="Start"
              onPress={startSessionButtonPressed}
            />
          </View>
        </StyledBottomSheet>
        {completedSession && (
          <Confetti isInfinite={false} fadeOutOnEnd={true} count={100} />
        )}
      </BackgroundView>
    </>
  );

  // return (
  //   <>
  //     <BackgroundView
  //       withSafeArea
  //       withScreenPadding
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         // backgroundColor: "#121126",
  //         paddingHorizontal: 25,
  //       }}
  //     >
  //       <View style={{ alignItems: "center", marginBottom: 40 }}>
  //         <Image
  //           source={require("@/assets/images/hero.png")}
  //           style={{
  //             width: width * 0.7,
  //             height: width * 0.5,
  //             resizeMode: "contain",
  //             marginBottom: 30,
  //             borderRadius: 20,
  //             shadowColor: "#8a7fe8",
  //             shadowOffset: { width: 0, height: 6 },
  //             shadowOpacity: 0.5,
  //             shadowRadius: 10,
  //           }}
  //         />

  //         <ThemedText
  //           style={[
  //             globalStyles.header2,
  //             {
  //               textAlign: "center",
  //               color: theme.colors.primary,
  //               fontWeight: "bold",
  //               fontSize: 28,
  //               textShadowColor: "rgba(138, 127, 232, 0.3)",
  //               textShadowOffset: { width: 1, height: 1 },
  //               textShadowRadius: 5,
  //             },
  //           ]}
  //         >
  //           Personalized Environmental Focus Insights for ADHD
  //         </ThemedText>

  //         <SizedBox height={12} />

  //         <ThemedText
  //           style={{
  //             textAlign: "center",
  //             color: theme.colors.textMuted,
  //             fontSize: 18,
  //             marginHorizontal: 10,
  //             fontWeight: "600",
  //             lineHeight: 24,
  //           }}
  //         >
  //           Understand how noise, light, movement, and more affect your focus —
  //           personalized for you.
  //         </ThemedText>

  //         <SizedBox height={30} />

  //         <View
  //           style={{
  //             flexDirection: "row",
  //             justifyContent: "space-around",
  //             width: "90%",
  //             marginBottom: 40,
  //           }}
  //         >
  //           <View style={{ alignItems: "center", width: 60 }}>
  //             <SunOutline
  //               size={45}
  //               color={theme.colors.textMuted}
  //               style={{
  //                 opacity: 0.7,
  //               }}
  //             />
  //             <ThemedText
  //               style={{
  //                 color: theme.colors.textMuted,
  //                 fontSize: 12,
  //                 marginTop: 6,
  //                 fontWeight: "600",
  //                 textAlign: "center",
  //               }}
  //             >
  //               Light
  //             </ThemedText>
  //           </View>
  //           <View style={{ alignItems: "center", width: 60 }}>
  //             <SpeakerWaveOutline
  //               size={45}
  //               color={theme.colors.textMuted}
  //               style={{
  //                 opacity: 0.7,
  //               }}
  //             />
  //             <ThemedText
  //               style={{
  //                 color: theme.colors.textMuted,
  //                 fontSize: 12,
  //                 marginTop: 6,
  //                 fontWeight: "600",
  //                 textAlign: "center",
  //               }}
  //             >
  //               Noise
  //             </ThemedText>
  //           </View>
  //           {/* <View style={{ alignItems: "center", width: 60 }}>
  //           <Icon
  //             name={"run"}
  //             size={45}
  //             color="#b3afdb"
  //             style={{
  //               opacity: 0.7,
  //               textShadowColor: "rgba(179, 175, 219, 0.15)",
  //               textShadowOffset: { width: 0, height: 0 },
  //               textShadowRadius: 4,
  //             }}
  //           />
  //           <ThemedText
  //             style={{
  //               color: "#b3afdb",
  //               fontSize: 12,
  //               marginTop: 6,
  //               fontWeight: "600",
  //               textAlign: "center",
  //             }}
  //           >
  //             Movement
  //           </ThemedText>
  //         </View>
  //         <View style={{ alignItems: "center", width: 60 }}>
  //           <Icon
  //             name={"fan"}
  //             size={45}
  //             color="#b3afdb"
  //             style={{
  //               opacity: 0.7,
  //               textShadowColor: "rgba(179, 175, 219, 0.15)",
  //               textShadowOffset: { width: 0, height: 0 },
  //               textShadowRadius: 4,
  //             }}
  //           />
  //           <ThemedText
  //             style={{
  //               color: "#b3afdb",
  //               fontSize: 12,
  //               marginTop: 6,
  //               fontWeight: "600",
  //               textAlign: "center",
  //             }}
  //           >
  //             Airflow
  //           </ThemedText>
  //         </View> */}

  //           {/* {[
  //           { name: "weather-sunny", label: "Light" },
  //           { name: "volume-high", label: "Noise" },
  //           { name: "run", label: "Movement" },
  //           { name: "fan", label: "Airflow" },
  //         ].map(({ name, label }) => (
  //           <View key={name} style={{ alignItems: "center", width: 60 }}>
  //             <Icon
  //               name={name}
  //               size={45}
  //               color="#b3afdb"
  //               style={{
  //                 opacity: 0.7,
  //                 textShadowColor: "rgba(179, 175, 219, 0.15)",
  //                 textShadowOffset: { width: 0, height: 0 },
  //                 textShadowRadius: 4,
  //               }}
  //             />
  //             <ThemedText
  //               style={{
  //                 color: "#b3afdb",
  //                 fontSize: 12,
  //                 marginTop: 6,
  //                 fontWeight: "600",
  //                 textAlign: "center",
  //               }}
  //             >
  //               {label}
  //             </ThemedText>
  //           </View>
  //         ))} */}
  //         </View>

  //         <TextButton
  //           title="Start Session"
  //           textStyle={{
  //             fontWeight: 700,
  //             fontSize: theme.fontSize.xl,
  //             color: theme.colors.text,
  //           }}
  //           onPress={startSession}
  //           style={{
  //             paddingHorizontal: 60,
  //             borderRadius: theme.radii.full,
  //             backgroundColor: theme.colors.primary,
  //             shadowColor: theme.colors.primary,
  //             shadowOffset: { width: 0, height: 5 },
  //             shadowOpacity: 0.4,
  //             shadowRadius: 8,
  //             elevation: 7,
  //           }}
  //         />
  //       </View>
  //     </BackgroundView>
  //     {completedSession && (
  //       <Confetti isInfinite={false} fadeOutOnEnd={true} count={100} />
  //     )}
  //   </>
  // );
};

export default IndexScreen;

const styles = StyleSheet.create({
  bottomSheetTextInput: {
    ...globalStyles.bodyText,
    fontWeight: theme.fontWeight.semibold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.bgLight,
  },
})