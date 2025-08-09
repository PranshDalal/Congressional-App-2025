import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
} from "react-native";
import React, { forwardRef } from "react";
import theme from "@/styles/theme";
import SizedBox from "./SizedBox";
import globalStyles from "@/styles/globalStyles";
import ThemedText from "./ThemedText";

type StyledTextInputProps = TextInputProps & {
  width?: any;
  error?: string;
};

const StyledTextInput = forwardRef<TextInput, StyledTextInputProps>(
  ({ style, width = "100%", error, ...rest }, ref) => {
    return (
      <View style={{ width }}>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.base, styles.default, style]}
          keyboardAppearance="dark"
          
          {...rest}
        />
        {error ? (
          <><SizedBox height={5} /><ThemedText style={{ color: theme.colors.danger }}>{error}</ThemedText></>
        ) : null}
      </View>
    );
  }
);

export default StyledTextInput;

const styles = StyleSheet.create({
  base: {
    ...globalStyles.bodyText,
    fontWeight: theme.fontWeight.semibold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
  },
  default: {
    // borderWidth: 1,
    // borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgLight,
  },
});
