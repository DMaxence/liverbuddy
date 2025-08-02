import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Toaster } from "sonner-native";
import "react-native-reanimated";

import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useDatabase } from "@/hooks/useDatabase";
import { QueryProvider } from "@/providers/QueryProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "@/hooks/useTranslation";
import { Colors } from "@/constants/Colors";
import { TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";

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
  const { t } = useTranslation();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AppInitializer />
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="app-preferences"
                options={{
                  title: t("appPreferences"),
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={() => router.back()}
                    >
                      <IconSymbol name="chevron.left" size={24} color="black" />
                      <ThemedText style={{ color: Colors.light.tint }}>
                        {t("back")}
                      </ThemedText>
                    </TouchableOpacity>
                  ),
                  headerTitleStyle: {
                    color: Colors.light.tint,
                  },
                  headerStyle: {
                    backgroundColor: Colors.light.background,
                  },
                }}
              />
              <Stack.Screen
                name="drinking-preferences"
                options={{
                  title: t("drinkingPreferences"),
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={() => router.back()}
                    >
                      <IconSymbol name="chevron.left" size={24} color="black" />
                      <ThemedText style={{ color: Colors.light.tint }}>
                        {t("back")}
                      </ThemedText>
                    </TouchableOpacity>
                  ),
                  headerTitleStyle: {
                    color: Colors.light.tint,
                  },
                  headerStyle: {
                    backgroundColor: Colors.light.background,
                  },
                }}
              />
              <Stack.Screen
                name="personal-info"
                options={{
                  title: t("personalInfo"),
                  headerLeft: () => (
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={() => router.back()}
                    >
                      <IconSymbol name="chevron.left" size={24} color="black" />
                      <ThemedText style={{ color: Colors.light.tint }}>
                        {t("back")}
                      </ThemedText>
                    </TouchableOpacity>
                  ),
                  headerTitleStyle: {
                    color: Colors.light.tint,
                  },
                  headerStyle: {
                    backgroundColor: Colors.light.background,
                  },
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
            <Toaster />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootLayoutContent />
    </QueryProvider>
  );
}
