import { View, Text } from "react-native";
import React, { useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <BackgroundView>
      <SafeAreaView>
        <View style={globalStyles.centered}>
          <Text style={globalStyles.header1}>Welcome Back!</Text>
          <Text style={globalStyles.mutedText}>Please sign in to continue</Text>
          <SizedBox height={25} />
          <StyledTextInput
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <SizedBox height={10} />
          <StyledTextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <SizedBox height={20} />
          <TextButton
            title="Sign In"
            onPress={() => {}}
            width="75%"
            textStyle={{ fontWeight: theme.fontWeight.semibold }}
          />
        </View>
      </SafeAreaView>
    </BackgroundView>
  );
};

export default SignUp;
