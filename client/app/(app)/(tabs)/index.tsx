import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { getAuth } from "@react-native-firebase/auth";
import { useStartSession } from "@/hooks/useStartSession";
import SizedBox from "@/components/SizedBox";

import Toast from "react-native-toast-message";

const IndexScreen = () => {
  const user = getAuth().currentUser;
  const startSession = useStartSession();

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <Text style={[globalStyles.header1]}>
        Welcome back, {user?.displayName}
      </Text>
      <SizedBox height={25} />
      {/* <View style={{ alignItems: "center" }}> */}
      <Text style={globalStyles.bodyText}>Ready to lock in?</Text>
      <TextButton title="Start Session" onPress={startSession} />
      {/* </View> */}
    </BackgroundView>
  );
};

export default IndexScreen;
