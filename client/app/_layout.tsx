import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/theme/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Protected } from "expo-router/build/views/Protected";
import { useCallback, useEffect, useState } from "react";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";

import * as SplashScreen from "expo-splash-screen";

import Toast from "react-native-toast-message";
import toastConfig from "@/components/toast/ToastConfig";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (!initializing) {
      hideSplash();
    }
  }, [initializing, hideSplash]);

  if (initializing) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      {/* value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Stack>
        <Protected guard={user === null}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Protected>
        <Protected guard={user !== null}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} topOffset={55} />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
