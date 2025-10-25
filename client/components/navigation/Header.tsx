import theme from "@/styles/theme";
import ThemedText from "../ThemedText";
import globalStyles from "@/styles/globalStyles";
import { View } from "react-native";

export const headerPreset = {
  headerStyle: {
    backgroundColor: theme.colors.bgDark,
  },
  headerShadowVisible: false,
  headerTitleAlign: "left" as const,
  headerTitle: (props: any) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
      <ThemedText style={globalStyles.header1}>{props.children}</ThemedText>
    </View>
  ),
};
