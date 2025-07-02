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

const SurveyScreen = () => {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
});
