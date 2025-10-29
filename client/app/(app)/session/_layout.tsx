import { headerPreset } from "@/components/navigation/Header";
import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        ...headerPreset,
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="request-microphone" />
      <Stack.Screen
        name="survey"
        options={{
          title: "Session Recap & Survey",
          headerShown: true,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
