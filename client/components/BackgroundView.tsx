import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import DismissKeyboard from "./DismissKeyboard";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type ContentProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundViewPadding: {
    paddingHorizontal: number;
    paddingTop: number;
    paddingBottom: number;
  };
} & Omit<ViewProps, "style" | "children">;

const Content = ({
  children,
  style,
  backgroundViewPadding,
  ...props
}: ContentProps) => {
  return (
    <View style={[styles.background, backgroundViewPadding, style]} {...props}>
      {children}
    </View>
  );
};

type BackgroundViewProps = ViewProps & {
  withSafeArea?: boolean;
  withScreenPadding?: boolean;
  disableDismiss?: boolean;
};

export default function BackgroundView({
  children,
  withSafeArea,
  withScreenPadding,
  disableDismiss = false,
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

  if (disableDismiss) {
    return (
      <Content backgroundViewPadding={backgroundViewPadding} {...props}>
        {children}
      </Content>
    );
  }

  return (
    <DismissKeyboard>
      <Content backgroundViewPadding={backgroundViewPadding} {...props}>
        {children}
      </Content>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
});
