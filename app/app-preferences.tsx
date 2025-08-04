import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "@/services/userPreferencesService";
import { useLanguage, useSetLanguage, useAccurate, useSetAccurate } from "@/stores/uiStore";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

type WeightUnit = "kg" | "lbs";
type QuantityUnit = "cl" | "oz";

export default function AppPreferencesScreen() {
  const { t } = useTranslation();
  const currentLanguage = useLanguage();
  const setLanguage = useSetLanguage();
  const accurateCalculations = useAccurate();
  const setAccurateCalculations = useSetAccurate();

  // App Preferences
  const [appLanguage, setAppLanguage] = useState<"en" | "fr">(currentLanguage);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>("cl");

  const [isSaving, setIsSaving] = useState(false);

  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await getUserPreferences("local-user");
      if (preferences) {
        setAppLanguage(preferences.app_language || currentLanguage);
        setWeightUnit(preferences.weight_unit || "kg");
        setQuantityUnit(preferences.preferred_unit || "cl");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, [currentLanguage]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertUserPreferences("local-user", {
        app_language: appLanguage,
        weight_unit: weightUnit,
        preferred_unit: quantityUnit,
      });

      // Update app language if changed
      if (appLanguage !== currentLanguage) {
        setLanguage(appLanguage);
      }

      toast.success(t("settingsSaved"), {
        description: t("saved"),
      });
      router.back();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(t("settingsError"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderPillSelector = <T extends string>(
    options: { value: T; label: string; emoji?: string }[],
    selectedValue: T | undefined,
    onSelect: (value: T) => void
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillContainer}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.pill,
            selectedValue === option.value && styles.selectedPill,
          ]}
          onPress={() => onSelect(option.value)}
        >
          {option.emoji && (
            <ThemedText style={styles.pillEmoji}>{option.emoji}</ThemedText>
          )}
          <ThemedText
            style={[
              styles.pillText,
              selectedValue === option.value && styles.selectedPillText,
            ]}
          >
            {option.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSettingRow = (
    label: string,
    content: React.ReactNode,
    isLast = false
  ) => (
    <View style={[styles.settingRow, isLast && styles.lastSettingRow]}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <View style={styles.settingContent}>{content}</View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* App Preferences Section */}
        <View style={styles.section}>
          <View style={styles.settingGroup}>
            {renderSettingRow(
              t("language"),
              renderPillSelector(
                [
                  { value: "en" as const, label: t("english"), emoji: "🇺🇸" },
                  { value: "fr" as const, label: t("french"), emoji: "🇫🇷" },
                ],
                appLanguage,
                setAppLanguage
              )
            )}
            {renderSettingRow(
              t("weightUnit"),
              renderPillSelector(
                [
                  { value: "kg" as WeightUnit, label: t("kilograms") },
                  { value: "lbs" as WeightUnit, label: t("pounds") },
                ],
                weightUnit,
                setWeightUnit
              )
            )}
            {renderSettingRow(
              t("quantityUnit"),
              renderPillSelector(
                [
                  { value: "cl" as QuantityUnit, label: t("centiliters") },
                  { value: "oz" as QuantityUnit, label: t("ounces") },
                ],
                quantityUnit,
                setQuantityUnit
              )
            )}
            {renderSettingRow(
              t("accurateCalculations"),
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.pill,
                    accurateCalculations && styles.selectedPill,
                  ]}
                  onPress={() => setAccurateCalculations(true)}
                >
                  <ThemedText style={styles.pillEmoji}>🧮</ThemedText>
                  <ThemedText
                    style={[
                      styles.pillText,
                      accurateCalculations && styles.selectedPillText,
                    ]}
                  >
                    {t("advanced")}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pill,
                    !accurateCalculations && styles.selectedPill,
                  ]}
                  onPress={() => setAccurateCalculations(false)}
                >
                  <ThemedText style={styles.pillEmoji}>🎯</ThemedText>
                  <ThemedText
                    style={[
                      styles.pillText,
                      !accurateCalculations && styles.selectedPillText,
                    ]}
                  >
                    {t("simple")}
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>,
              true
            )}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? t("saved") : t("save")} {isSaving ? "✅" : "💾"}
          </ThemedText>
        </TouchableOpacity>
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
  section: {
    marginTop: 20,
    marginBottom: 32,
  },
  settingGroup: {
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
  settingRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  lastSettingRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#11181C",
    marginBottom: 12,
  },
  settingContent: {
    flex: 1,
  },
  pillContainer: {
    paddingVertical: 4,
  },
  pill: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedPill: {
    backgroundColor: Colors.light.good.color,
    borderColor: Colors.light.good.color,
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#11181C",
  },
  selectedPillText: {
    // color: "#11181C",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
    marginHorizontal: 16,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#A8D5AA",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
