import { View } from "react-native";
import React, { useState, useEffect } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import { getAuth } from "@react-native-firebase/auth";
import StyledModal from "@/components/view/StyledModal";
import Toast from "react-native-toast-message";
import ThemedText from "@/components/ThemedText";
import { PreferencesService } from "@/services/firebasePreferencesService";
import { connectToWearable } from "../(ble)/bleClient";

const settings = () => {
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [nudgeFrequency, setNudgeFrequency] = useState<"Low" | "Mid" | "High">("Mid");
  
  useEffect(() => {
    const fetchNudgeFrequency = async () => {
      try {
        const frequency = await PreferencesService.getNudgeFrequency();
        if (frequency) {
          setNudgeFrequency(frequency);
        }
      } catch (error) {
        console.error("Failed to get nudge frequency:", error);
      }
    };
    
    fetchNudgeFrequency();
  }, []);

  const updateNudgeFrequency = async (frequency: "Low" | "Mid" | "High") => {
    try {
      await PreferencesService.setNudgeFrequency(frequency);
      setNudgeFrequency(frequency);
      Toast.show({
        type: "success",
        text1: "Nudge frequency updated",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update nudge frequency",
      });
    }
  };  

  const signOut = async () => {
    await getAuth().signOut();

    Toast.show({
      type: "success",
      text1: "Signed out",
    });
  };

  return (
    <BackgroundView withScreenPadding withSafeArea>
      <SizedBox height={50} />
      <View style={{ marginBottom: 30 }}>
        <ThemedText style={{ fontSize: 16, marginBottom: 10 }}>
          Nudge Frequency
        </ThemedText>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {["Low", "Mid", "High"].map((level) => (
            <TextButton
              key={level}
              title={level}
              onPress={() => updateNudgeFrequency(level as "Low" | "Mid" | "High")}
              variant={nudgeFrequency === level ? "primary" : "secondary"}
            />
          ))}
        </View>
        <SizedBox height={10} />
        <ThemedText>Current: {nudgeFrequency}</ThemedText>
      </View>


      {/* <TextButton
        title="Connect to Wearable"
        onPress={() => setConnectModalVisible(true)}
        variant="primary"
      /> */}

      <SizedBox height={10} />

      <TextButton
        title="Sign Out"
        onPress={() => setSignOutModalVisible(true)}
        variant="danger"
      />

      <StyledModal
        title="Sign Out"
        body="Are you sure you want to sign out?"
        type="ask"
        submitButtonText="Sign Out"
        visible={signOutModalVisible}
        onSubmit={signOut}
        setModalVisibleCallback={setSignOutModalVisible}
      />

      <StyledModal
        title="Connect to Wearable"
        body="Are you sure you want to connect to the wearable device?"
        type="ask"
        submitButtonText="Connect"
        visible={connectModalVisible}
        onSubmit={() => {
          // connectToWearable((msg) => {
          //   Toast.show({ type: "success", text1: `Received: ${msg}` });
          // });
          console.log("I commented the code to connect to wearable. please reenable in settings.tsx");
          setConnectModalVisible(false);
        }}
        setModalVisibleCallback={setConnectModalVisible}
      />
    </BackgroundView>
  );
};

export default settings;
