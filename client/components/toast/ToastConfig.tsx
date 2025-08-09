import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { JSX } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from "react-native-toast-message";
import ThemedText from "../ThemedText";

// type CustomToastProps = {
//   title: string;
// };

type CustomToastProps = BaseToastProps & {
  props?: Record<string, any>;
};

// const ToastView = (text) => {
//     return (

//     );
// };

export const toastConfig = {
  success: ({ text1, props }: CustomToastProps) => (
    <View style={styles.toast}>
      <ThemedText style={styles.text}>{text1}</ThemedText>
      <Ionicons size={20} name="checkmark-circle-outline" color="#00ff00" />
    </View>
  ),
  error: ({ text1, props }: CustomToastProps) => (
    <View style={styles.toast}>
      <ThemedText style={styles.text}>{text1}</ThemedText>
      <Ionicons size={20} name="close-circle-outline" color="#ff0000" />
    </View>
  ),
  //   loading: ({ text1, props }: CustomToastProps) =>
  //     props?.isLoading ? (
  //       <View style={styles.toast}>
  //         <ThemedText>{text1}</ThemedText>
  //         <ActivityIndicator size="small" style={{ marginLeft: 8 }} />
  //       </View>
  //     ) : (
  //       <View style={styles.toast}>
  //         <ThemedText>{props?.loadedText}</ThemedText>
  //       </View>
  //     ),
};

export default toastConfig;

const styles = StyleSheet.create({
  toast: {
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.bgLight,
    flexDirection: "row",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
  },
  text: {
    paddingRight: theme.spacing.sm,
  },
});
