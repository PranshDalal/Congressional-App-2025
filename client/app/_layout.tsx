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

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useFonts } from "expo-font";
import { Nunito_200ExtraLight } from "@expo-google-fonts/nunito/200ExtraLight";
import { Nunito_300Light } from "@expo-google-fonts/nunito/300Light";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_500Medium } from "@expo-google-fonts/nunito/500Medium";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { Nunito_900Black } from "@expo-google-fonts/nunito/900Black";
import { Nunito_200ExtraLight_Italic } from "@expo-google-fonts/nunito/200ExtraLight_Italic";
import { Nunito_300Light_Italic } from "@expo-google-fonts/nunito/300Light_Italic";
import { Nunito_400Regular_Italic } from "@expo-google-fonts/nunito/400Regular_Italic";
import { Nunito_500Medium_Italic } from "@expo-google-fonts/nunito/500Medium_Italic";
import { Nunito_600SemiBold_Italic } from "@expo-google-fonts/nunito/600SemiBold_Italic";
import { Nunito_700Bold_Italic } from "@expo-google-fonts/nunito/700Bold_Italic";
import { Nunito_800ExtraBold_Italic } from "@expo-google-fonts/nunito/800ExtraBold_Italic";
import { Nunito_900Black_Italic } from "@expo-google-fonts/nunito/900Black_Italic";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();

  let [fontsLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light_Italic,
    Nunito_400Regular_Italic,
    Nunito_500Medium_Italic,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black_Italic,
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    // console.log("onAuthStateChanged", user);
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

  if (!fontsLoaded) return null;

  if (initializing) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
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
            <Toast config={toastConfig} topOffset={safeAreaInsets.top} />
            <StatusBar style="light" />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
