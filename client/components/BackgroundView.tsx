import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";
import { View, ViewProps, StyleSheet, SafeAreaView } from "react-native";

type BackgroundViewProps = ViewProps & {
  withSafeArea?: boolean;
  withScreenPadding?: boolean;
};

export default function BackgroundView({
  children,
  withSafeArea,
  withScreenPadding,
  ...props
}: BackgroundViewProps) {
  return (
    <View
      style={[
        styles.background,
        withScreenPadding
          ? globalStyles.screenPadding
          : undefined,
      ]}
    >
      {withSafeArea ? (
        <SafeAreaView
          style={[
            { flex: 1 },
            // withScreenPadding ? globalStyles.screenPadding : undefined,
            props.style,
          ]}
        >
          {children}
        </SafeAreaView>
      ) : (
        <View style={[{ flex: 1 }, props.style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.bgDark,
  },
});
