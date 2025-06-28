import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";

const IndexScreen = () => {
  return (
    <BackgroundView withSafeArea withScreenPadding>
      <Text style={[globalStyles.header1]}>Welcome</Text>
      <View style={{ alignItems: "center" }}>
        <Link href="./(session)" replace asChild>
          <TextButton title="Start Session" onPress={() => {}} />
        </Link>
        <Link href="/sign-in" push asChild>
          <TextButton title="Sign in" onPress={() => {}} variant="secondary" />
        </Link>
      </View>
    </BackgroundView>
  );
};

export default IndexScreen;
