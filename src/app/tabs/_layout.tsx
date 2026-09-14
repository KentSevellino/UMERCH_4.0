import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}