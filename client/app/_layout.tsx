import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Protected } from "expo-router/build/views/Protected";
import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>{/* value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Stack>
        <Protected guard={user === null}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Protected>
        <Protected guard={user !== null}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
