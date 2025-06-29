import { View, Text } from "react-native";
import React, { useEffect } from "react";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";
import auth from "@react-native-firebase/auth";

const IndexScreen = () => {
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  useEffect(() => {
    setDisplayName(auth().currentUser?.displayName ?? null);
  }, []);

  const signOut = async () => {
    await auth().signOut();
  };

  return (
    <BackgroundView withSafeArea withScreenPadding>
      <Text style={[globalStyles.header1]}>Welcome, {displayName}</Text>
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
