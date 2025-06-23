import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import theme from "@/styles/theme";
import BackgroundView from "@/components/BackgroundView";
import TextButton from "@/components/TextButton";
import globalStyles from "@/styles/globalStyles";
import { Link, useRouter } from "expo-router";

const App = () => {
  const router = useRouter();

  return (
    <BackgroundView>
      <SafeAreaView>
        <View style={globalStyles.screenPadding}>
          <Text style={[globalStyles.header1]}>Welcome</Text>
          <Link href="./(session)" push asChild>
            <TextButton title="Start Session" onPress={() => {}} />
          </Link>
          <TextButton
            title="Sign in"
            onPress={() => {
              router.push("/sign-in");
            }}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
};

export default App;
