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
import TextButton from "./TextButton";
import theme from "@/styles/theme";
import { BlurView } from "expo-blur";

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
        <BlurView intensity={20} style={[globalStyles.centered, { flex: 1 }]}>
          <View style={styles.background}>
            <View style={globalStyles.centered}>
              <Text style={globalStyles.header2}>{title}</Text>
              <SizedBox height={theme.spacing.sm} />
              <Text style={globalStyles.mutedText}>{body}</Text>
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
          </View>
        </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.bg,
    width: "90%",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.lg,
  },
});

export default StyledModal;
