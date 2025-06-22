import { StyleSheet } from "react-native";
import theme from "./theme";

const globalStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  screenPadding: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },

  header1: {
    fontSize: theme.fontSize.h1,
    // fontWeight: "bold",
    color: theme.colors.text,
  },
  header2: {
    fontSize: theme.fontSize.h2,
    // fontWeight: "600",
    color: theme.colors.text,
  },
  header3: {
    fontSize: theme.fontSize.h3,
    // fontWeight: "400",
    color: theme.colors.text,
  },
  bodyText: {
    fontSize: theme.fontSize.default,
    color: theme.colors.text,
  },
  mutedText: {
    fontSize: theme.fontSize.default,
    color: theme.colors.textMuted,
  },
});

export default globalStyles;
