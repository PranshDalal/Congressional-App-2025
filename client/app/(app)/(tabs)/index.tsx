import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { getAuth } from "@react-native-firebase/auth";
import { useStartSession } from "@/hooks/useStartSession";
import SizedBox from "@/components/SizedBox";
import ThemedText from "@/components/ThemedText";

const IndexScreen = () => {
  const user = getAuth().currentUser;
  const startSession = useStartSession();

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <ThemedText style={[globalStyles.header1]}>
        Welcome back, {user?.displayName}
      </ThemedText>
      <SizedBox height={25} />
      {/* <View style={{ alignItems: "center" }}> */}
      <ThemedText>Ready to lock in?</ThemedText>
      <TextButton title="Start Session" onPress={startSession} />
      {/* </View> */}
    </BackgroundView>
  );
};

export default IndexScreen;
