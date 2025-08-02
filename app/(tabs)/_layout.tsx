import { Tabs, usePathname } from "expo-router";
import React from "react";

import { DrinkModal } from "@/components/DrinkModal";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "@/hooks/useTranslation";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const currentRoute = usePathname();

  const routesToExclude = [
    "/",
    "/settings",
    "/app-preferences",
    "/drinking-preferences",
    "/personal-info",
  ];

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("home"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t("calendar"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="calendar" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: t("listDrinks"),
            headerTitleAlign: "center",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="list.bullet" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape" color={color} />
            ),
          }}
        />
      </Tabs>
      {/* Only show DrinkModal on non-index routes */}
      {!routesToExclude.includes(currentRoute) && <DrinkModal />}
    </>
  );
}
