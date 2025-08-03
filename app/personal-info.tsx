import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "@/services/userPreferencesService";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

type GenderType = "male" | "female";
type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export default function PersonalInfoScreen() {
  const { t } = useTranslation();

  // Personal Info
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<GenderType | undefined>(undefined);
  const [weight, setWeight] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    undefined
  );
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  const [isSaving, setIsSaving] = useState(false);

  const loadUserPreferences = useCallback(async () => {
    try {
      const preferences = await getUserPreferences("local-user");
      if (preferences) {
        setAge(preferences.age?.toString() || "");
        if (preferences.gender === "male" || preferences.gender === "female") {
          setGender(preferences.gender);
        }
        setWeight(preferences.weight_kg?.toString() || "");
        setActivityLevel(preferences.activity_level);
        setWeightUnit(preferences.weight_unit || "kg");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  const validateForm = () => {
    if (age && (parseInt(age) < 1 || parseInt(age) > 120)) {
      Alert.alert(t("error"), t("pleaseEnterAge"));
      return false;
    }
    if (weight && (parseFloat(weight) < 1 || parseFloat(weight) > 500)) {
      Alert.alert(t("error"), t("pleaseEnterWeight"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await upsertUserPreferences("local-user", {
        age: age ? parseInt(age) : undefined,
        gender,
        weight_kg: weight ? parseFloat(weight) : undefined,
        activity_level: activityLevel,
        weight_unit: weightUnit,
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
        {/* Personal Info Section */}
        <View style={styles.section}>
          <View style={styles.settingGroup}>
            {renderSettingRow(
              t("age"),
              renderTextInputWithUnit(
                age,
                setAge,
                "25",
                t("ageYears"),
                "numeric"
              )
            )}
            {renderSettingRow(
              t("gender"),
              renderPillSelector(
                [
                  {
                    value: "male" as GenderType,
                    label: t("male"),
                    emoji: "👨",
                  },
                  {
                    value: "female" as GenderType,
                    label: t("female"),
                    emoji: "👩",
                  },
                ],
                gender,
                setGender
              )
            )}
            {renderSettingRow(
              t("weight"),
              renderTextInputWithUnit(
                weight,
                setWeight,
                "70",
                weightUnit === "kg" ? t("weightKg") : t("weightLbs"),
                "numeric"
              )
            )}
            {renderSettingRow(
              t("activityLevel"),
              renderPillSelector(
                [
                  {
                    value: "sedentary" as ActivityLevel,
                    label: t("sedentary"),
                    emoji: "🛋️",
                  },
                  {
                    value: "lightly_active" as ActivityLevel,
                    label: t("lightlyActive"),
                    emoji: "🚶",
                  },
                  {
                    value: "moderately_active" as ActivityLevel,
                    label: t("moderatelyActive"),
                    emoji: "🏃",
                  },
                  {
                    value: "very_active" as ActivityLevel,
                    label: t("veryActive"),
                    emoji: "💪",
                  },
                ],
                activityLevel,
                setActivityLevel
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
