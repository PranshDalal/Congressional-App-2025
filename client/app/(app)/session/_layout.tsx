import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      {/* <Stack.Screen name="check-microphone" /> */}
      <Stack.Screen name="request-microphone" />
      <Stack.Screen name="survey" />
    </Stack>
  );
}
