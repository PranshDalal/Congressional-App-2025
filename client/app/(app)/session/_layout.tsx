import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="request-microphone" />
      <Stack.Screen name="survey" />
    </Stack>
  );
}
