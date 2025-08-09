import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/button/TextButton";
import { useStartSession } from "@/hooks/useStartSession";
import SizedBox from "@/components/SizedBox";
import ThemedText from "@/components/ThemedText";

const IndexScreen = () => {
  const startSession = useStartSession();

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <SizedBox height={25} />
      {/* <View style={{ alignItems: "center" }}> */}
      <ThemedText>Ready to lock in?</ThemedText>
      <TextButton title="Start Session" onPress={startSession} />
      {/* </View> */}
    </BackgroundView>
  );
};

export default IndexScreen;
