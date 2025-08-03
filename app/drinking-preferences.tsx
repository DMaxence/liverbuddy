import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "@/services/userPreferencesService";
import { DrinkOptionKey, DrinkTypeKey } from "@/types";
import { getDrinkTypes } from "@/utils/drinks";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

type DrinkHabits = "rarely" | "occasionally" | "regularly" | "frequently";

export default function DrinkingPreferencesScreen() {
  const { t } = useTranslation();

  // Drinking Preferences
  const [drinkHabits, setDrinkHabits] = useState<DrinkHabits | undefined>(
    undefined
  );
  const [favoriteDrinkType, setFavoriteDrinkType] = useState<
    DrinkTypeKey | undefined
  >(undefined);
  const [favoriteDrinkOption, setFavoriteDrinkOption] = useState<
    DrinkOptionKey | undefined
  >(undefined);
  const [favoriteDrink, setFavoriteDrink] = useState<string>("");
  const [weeklyGoal, setWeeklyGoal] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);

  const drinkTypes = getDrinkTypes((key: string) => t(key as any));

  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await getUserPreferences("local-user");
      if (preferences) {
        setDrinkHabits(preferences.drink_habits);
        setFavoriteDrinkType(preferences.favorite_drink_type);
        setFavoriteDrinkOption(preferences.favorite_drink_option);
        setFavoriteDrink(preferences.favorite_drink || "");
        setWeeklyGoal(preferences.weekly_goal?.toString() || "7");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertUserPreferences("local-user", {
        drink_habits: drinkHabits,
        favorite_drink_type: favoriteDrinkType,
        favorite_drink_option: favoriteDrinkOption,
        favorite_drink: favoriteDrink || undefined,
        weekly_goal: weeklyGoal ? parseInt(weeklyGoal) : 7,
      });

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

  // Filter drink options based on selected drink type
  const getFilteredDrinkOptions = () => {
    if (!favoriteDrinkType) return [];
    const selectedDrinkType = drinkTypes.find(
      (type) => type.id === favoriteDrinkType
    );
    return selectedDrinkType?.options || [];
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

  const renderTextInputWithUnit = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    unit: string,
    keyboardType: "default" | "numeric" = "default"
  ) => (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
      <ThemedText style={styles.unitText}>{unit}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Drinking Preferences Section */}
        <View style={styles.section}>
          <View style={styles.settingGroup}>
            {renderSettingRow(
              t("drinkHabits"),
              renderPillSelector(
                [
                  {
                    value: "rarely" as DrinkHabits,
                    label: t("rarely"),
                    emoji: "🧘",
                  },
                  {
                    value: "occasionally" as DrinkHabits,
                    label: t("occasionally"),
                    emoji: "😊",
                  },
                  {
                    value: "regularly" as DrinkHabits,
                    label: t("regularly"),
                    emoji: "🍺",
                  },
                  {
                    value: "frequently" as DrinkHabits,
                    label: t("frequently"),
                    emoji: "🎉",
                  },
                ],
                drinkHabits,
                setDrinkHabits
              )
            )}
            {renderSettingRow(
              t("favoriteDrinkType"),
              renderPillSelector(
                drinkTypes.map((type) => ({
                  value: type.id,
                  label: t(type.name_key as any),
                  emoji: type.emoji,
                })),
                favoriteDrinkType,
                (value) => {
                  setFavoriteDrinkType(value);
                  setFavoriteDrinkOption(undefined); // Reset option when type changes
                }
              )
            )}
            {favoriteDrinkType &&
              renderSettingRow(
                t("favoriteDrinkOption"),
                renderPillSelector(
                  getFilteredDrinkOptions().map((option) => ({
                    value: option.key,
                    label: t(option.key as any),
                  })),
                  favoriteDrinkOption,
                  setFavoriteDrinkOption
                )
              )}
            {renderSettingRow(
              t("favoriteDrinkName"),
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Corona, Chardonnay, Margarita"
                value={favoriteDrink}
                onChangeText={setFavoriteDrink}
                placeholderTextColor="#999"
              />
            )}
            {renderSettingRow(
              t("weeklyGoal"),
              renderTextInputWithUnit(
                weeklyGoal,
                setWeeklyGoal,
                "7",
                t("drinksPerWeek"),
                "numeric"
              ),
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
  textInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#11181C",
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unitText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    minWidth: 50,
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
    color: "#fff",
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
