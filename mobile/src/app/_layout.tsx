import "../global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

<<<<<<< HEAD
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/context/AuthContext";
=======
import { AnimatedSplashOverlay } from "@/components/common/AnimatedIcon";
import { AuthProvider } from "@/context/AuthContext";
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AnimatedSplashOverlay />
<<<<<<< HEAD
            <RootNavigator />
=======
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="otp" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="checkout" options={{ headerShown: false }} />
              <Stack.Screen
                name="order-placed"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="orders" options={{ headerShown: false }} />
              <Stack.Screen
                name="personal-information"
                options={{ headerShown: false }}
              />
            </Stack>
>>>>>>> 601a3f3cda49a062698ae6911126951b6f3006b9
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const authenticated = status === "authenticated";

  return (
    <Stack>
      <Stack.Protected guard={authenticated}>
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
