import { View, Text } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";
import TextButton from "@/components/TextButton";

const Session = () => {
  return (
    <BackgroundView>
      <SafeAreaView>
        <View style={globalStyles.screenPadding}>
          <Text style={globalStyles.header1}>Session</Text>
          <Link href="./(app)" asChild>
            <TextButton title="End Session" onPress={() => {}} />
          </Link>
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
};

export default Session;
