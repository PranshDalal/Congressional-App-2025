import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";
import auth from "@react-native-firebase/auth";

const IndexScreen = () => {
  const signOut = async () => {
    // console.log(auth().currentUser);
    await auth().signOut();
    console.log(auth().currentUser);
  };

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <Text style={[globalStyles.header1]}>Welcome</Text>
      <View style={{ alignItems: "center" }}>
        <Link href="./(session)" replace asChild>
          <TextButton title="Start Session" onPress={() => {}} />
        </Link>
        <TextButton title="Sign Out" onPress={signOut} variant="secondary" />
      </View>
    </BackgroundView>
  );
};

export default IndexScreen;
