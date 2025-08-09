import { View, Text, TextProps, TextStyle } from "react-native";
import React from "react";
import globalStyles from "@/styles/globalStyles";
import theme from "@/styles/theme";

type ThemedTextProps = TextProps & {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[] | undefined;
};

const weightToFontFamilyMap: Record<string, string> = {
  "100": "Nunito_100Thin",
  "200": "Nunito_200ExtraLight",
  "300": "Nunito_300Light",
  "400": "Nunito_400Regular",
  "500": "Nunito_500Medium",
  "600": "Nunito_600SemiBold",
  "700": "Nunito_700Bold",
  "800": "Nunito_800ExtraBold",
  "900": "Nunito_900Black",
};

function getFontWeightFromStyle(
  style: TextStyle | TextStyle[] | undefined
): string {
  if (!style) return "400"; // default regular weight

  // style can be an array or object
  const stylesArray = Array.isArray(style) ? style : [style];

  // Create a copy before reversing to avoid mutating frozen objects
  for (const s of [...stylesArray].reverse()) {
    // check fontWeight property, React Native uses strings or numbers
    if (s && s.fontWeight) {
      return typeof s.fontWeight === "string"
        ? s.fontWeight
        : s.fontWeight.toString();
    }
  }
  return "400"; // fallback
}

const ThemedText = ({ children, style, ...rest }: ThemedTextProps) => {
  const fontWeight = getFontWeightFromStyle(style);
  const fontFamily = weightToFontFamilyMap[fontWeight] || "Nunito_400Regular";

  return (
    <Text
      style={[
        globalStyles.bodyText,
        { color: theme.colors.text, fontFamily },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
