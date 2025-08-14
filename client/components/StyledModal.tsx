import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import React from "react";
import globalStyles from "@/styles/globalStyles";
import SizedBox from "./SizedBox";
import TextButton from "./button/TextButton";
import theme from "@/styles/theme";
import { BlurView } from "expo-blur";
import ThemedText from "./ThemedText";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";

type StyledModalProps = {
  title: string;
  body?: string;
  visible: boolean;
  type: "alert" | "ask";
  submitButtonText?: string;
  cancelButtonText?: string;
  onSubmit?: () => void;
  setModalVisibleCallback: (visible: boolean) => void;
};

const StyledModal = ({
  title,
  visible,
  body = "",
  type,
  submitButtonText = "",
  cancelButtonText = "Cancel",
  onSubmit = () => {},
  setModalVisibleCallback,
}: StyledModalProps) => {
  const submitCallback = () => {
    setModalVisibleCallback(false);
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setModalVisibleCallback(false)}
      animationType="fade"
      transparent
    >
      <TouchableWithoutFeedback
        onPress={() => setModalVisibleCallback(false)}
        accessible={false}
      >
        <BlurView
          intensity={20}
          style={[globalStyles.centered, { flex: 1 }]}
          experimentalBlurMethod="dimezisBlurView"
        >
          <Animated.View style={styles.background} entering={FadeInUp.duration(150).springify()} exiting={FadeOutDown.duration(150)}>
            <View style={globalStyles.centered}>
              <ThemedText style={globalStyles.header2}>{title}</ThemedText>
              <SizedBox height={theme.spacing.sm} />
              <ThemedText style={globalStyles.mutedText}>{body}</ThemedText>
            </View>
            <View>
              <SizedBox height={theme.spacing.lg} />

              {type === "ask" ? (
                <React.Fragment>
                  <TextButton
                    title={submitButtonText}
                    onPress={submitCallback}
                  />
                  <SizedBox height={theme.spacing.sm} />
                </React.Fragment>
              ) : null}
              <TextButton
                title={type === "ask" ? cancelButtonText : "Ok"}
                onPress={() => setModalVisibleCallback(false)}
                variant="secondary"
              />
            </View>
          </Animated.View>
        </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.bg,
    width: "92%",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.bgLight,
  },
});

export default StyledModal;
