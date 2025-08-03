import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Constants from "expo-constants";

export default function SettingsScreen() {
  const { t } = useTranslation();

  const personalSettings = [
    {
      id: "personal-info",
      title: t("personalInfo"),
      subtitle: t("personalInfoSubtitle"),
      icon: "person.fill",
      emoji: "👤",
      route: "/personal-info",
    },
    {
      id: "drinking-preferences",
      title: t("drinkingPreferences"),
      subtitle: t("drinkingPreferencesSubtitle"),
      icon: "wineglass.fill",
      emoji: "🍻",
      route: "/drinking-preferences",
    },
  ];

  const appSettings = [
    {
      id: "app-preferences",
      title: t("appPreferences"),
      subtitle: t("appPreferencesSubtitle"),
      icon: "gear",
      emoji: "📱",
      route: "/app-preferences",
    },
  ];

  const supportSettings = [
    {
      id: "support",
      title: t("support"),
      subtitle: t("supportSubtitle"),
      icon: "questionmark.circle.fill",
      emoji: "❓",
      route: "/support",
    },
  ];

  const settingsOptions = [
    {
      id: "personal-settings",
      title: t("personalSettings"),
      options: personalSettings,
    },
    {
      id: "app-settings",
      title: t("appSettings"),
      options: appSettings,
    },
    {
      id: "support-settings",
      title: t("supportSettings"),
      options: supportSettings,
    },
  ];

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t("settings")} ⚙️</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t("customizeExperience")}
          </ThemedText>
        </View>

        {/* Settings Options */}
        {settingsOptions.map((option, index) => (
          <View key={option.id} style={styles.settingsContainer}>
            <View style={styles.settingOptionContainer}>
              <ThemedText style={styles.settingTitle}>
                {option.title}
              </ThemedText>
              {option.options.map((setting, index) => (
                <TouchableOpacity
                  key={setting.id}
                  style={[
                    styles.settingOption,
                    index === option.options.length - 1 &&
                      styles.lastSettingOption,
                  ]}
                  onPress={() => handleOptionPress(setting.route)}
                >
                  <View style={styles.settingContent}>
                    <View style={styles.settingLeft}>
                      <View style={styles.iconContainer}>
                        <ThemedText style={styles.settingEmoji}>
                          {setting.emoji}
                        </ThemedText>
                      </View>
                      <View style={styles.settingTextContainer}>
                        <ThemedText style={styles.settingTitle}>
                          {setting.title}
                        </ThemedText>
                        <ThemedText style={styles.settingSubtitle}>
                          {setting.subtitle}
                        </ThemedText>
                      </View>
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color="#C7C7CC"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>{t("credits")}</ThemedText>
          <ThemedText style={styles.footerText}>
            {t("version")} {Constants.expoConfig?.version}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  settingsContainer: {
    marginBottom: 16,
    backgroundColor: Colors.light.backgroundTint,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingOptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  settingOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  lastSettingOption: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundTint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
});
