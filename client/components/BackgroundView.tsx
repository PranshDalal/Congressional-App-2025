import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";
import { View, ViewProps, StyleSheet } from "react-native";
import DismissKeyboard from "./DismissKeyboard";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type BackgroundViewProps = ViewProps & {
  withSafeArea?: boolean;
  withScreenPadding?: boolean;
  disableDismiss?: boolean;
};

export default function BackgroundView({
  children,
  withSafeArea,
  withScreenPadding,
  disableDismiss,
  ...props
}: BackgroundViewProps) {
  const insets = useSafeAreaInsets();

  const screenPaddingHorizontal = withScreenPadding
    ? globalStyles.screenPadding.paddingHorizontal
    : 0;
  const screenPaddingTop = withScreenPadding
    ? globalStyles.screenPadding.paddingTop
    : 0;
  const safeAreaPaddingTop = withSafeArea ? insets.top : 0;

  const backgroundViewPadding = {
    paddingHorizontal: withSafeArea
      ? screenPaddingHorizontal + insets.left + insets.right
      : screenPaddingHorizontal,
    paddingTop: screenPaddingTop + safeAreaPaddingTop,
    paddingBottom: withSafeArea ? insets.bottom : 0,
  };

  const Content = () => (
    <View
      style={[styles.background, backgroundViewPadding, props.style]}
      {...props}
    >
      {children}
    </View>
  );

  if (disableDismiss) {
    return <Content />;
  }

  return (
    <DismissKeyboard>
      <Content />
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
});
