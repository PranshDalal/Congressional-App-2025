import { View, Text, TextInput } from "react-native";
import React, { useRef, useState } from "react";
import BackgroundView from "@/components/BackgroundView";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/styles/globalStyles";
import StyledTextInput from "@/components/StyledTextInput";
import SizedBox from "@/components/SizedBox";
import TextButton from "@/components/TextButton";
import theme from "@/styles/theme";
import { Link } from "expo-router";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inputPasswordRef = useRef<TextInput>(null);

  return (
    <BackgroundView style={globalStyles.centered} withScreenPadding>
      <Text style={globalStyles.header1}>Welcome Back!</Text>
      <Text style={globalStyles.mutedText}>Please sign in to continue</Text>
      <SizedBox height={25} />
      <StyledTextInput
        onSubmitEditing={() => inputPasswordRef.current?.focus()}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        enterKeyHint="next"
        width="100%"
      />
      <SizedBox height={10} />
      <StyledTextInput
        ref={inputPasswordRef}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        enterKeyHint="done"
        width="100%"
      />
      <SizedBox height={5}/>
      <Link
        href="/(app)"
        style={[globalStyles.bodyText, { color: theme.colors.link, alignSelf: "flex-start" }]}
      >
        Forgot your password?
      </Link>
      <SizedBox height={20} />
      <TextButton
        title="Sign In"
        onPress={() => {}}
        width="100%"
        textStyle={{ fontWeight: theme.fontWeight.semibold }}
      />
      <SizedBox height={25} />
      <View style={{ flexDirection: "row" }}>
        <Text style={globalStyles.mutedText}>Don't have an account? </Text>
        <Link
          href="/(app)"
          style={[globalStyles.bodyText, { color: theme.colors.link }]}
        >
          Sign Up
        </Link>
      </View>
    </BackgroundView>
  );
};

export default SignUp;
