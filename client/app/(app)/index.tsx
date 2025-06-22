import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import theme from "@/styles/theme";
import BackgroundView from "@/components/BackgroundView";
import Button from "@/components/Button";
import globalStyles from "@/styles/globalStyles";
import { Link } from "expo-router";

const App = () => {
  return (
    <BackgroundView>
      <SafeAreaView>
        <View style={globalStyles.screenPadding}>
          <Text style={[globalStyles.header1]}>Welcome</Text>
          <Link href="./(session)" push asChild>
            <Button title="Start Session" onPress={() => {}} />
          </Link>
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    color: "#333",
  },
});
