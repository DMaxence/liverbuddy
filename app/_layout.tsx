import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useDatabase } from "@/hooks/useDatabase";
import { QueryProvider } from "@/providers/QueryProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppInitializer() {
  const { initializeAuth } = useAuth();
  const { isLoading: isDBLoading, error: dbError } = useDatabase();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading state while database is initializing
  if (isDBLoading) {
    return null; // You could show a loading screen here
  }

  // Show error state if database failed to initialize
  if (dbError) {
    console.error("Database initialization failed:", dbError);
    // You could show an error screen here
  }

  return null;
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AppInitializer />
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootLayoutContent />
    </QueryProvider>
  );
}
