// rnfe

import { View, Text } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/view/BackgroundView";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/button/TextButton";
import { getAuth } from "@react-native-firebase/auth";
import StyledModal from "@/components/view/StyledModal";
import Toast from "react-native-toast-message";
import ThemedText from "@/components/ThemedText";

const settings = () => {
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

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
    </BackgroundView>
  );
};

export default settings;
