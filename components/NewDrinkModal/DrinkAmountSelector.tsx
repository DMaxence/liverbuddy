import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { DrinkType, DrinkOption, PreferredUnit } from "@/types";
import { formatDrinkOption, getDrinkOption } from "@/utils";
import { ThemedText } from "../ThemedText";

interface DrinkAmountSelectorProps {
  selectedType: DrinkType;
  selectedOption: DrinkOption;
  drinkName: string;
  customAmount: string;
  customUnit: string;
  onOptionSelect: (option: DrinkOption) => void;
  onDrinkNameChange: (name: string) => void;
  onCustomAmountChange: (amount: string) => void;
  onCustomUnitChange: (unit: string) => void;
  preferredUnit: PreferredUnit;
}

export const DrinkAmountSelector: React.FC<DrinkAmountSelectorProps> = ({
  selectedType,
  selectedOption,
  drinkName,
  customAmount,
  customUnit,
  onOptionSelect,
  onDrinkNameChange,
  onCustomAmountChange,
  onCustomUnitChange,
  preferredUnit,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Drink Name Input */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("drinkName")}</ThemedText>
        <TextInput
          style={styles.drinkNameInput}
          placeholder={t("drinkNamePlaceholder")}
          value={drinkName}
          onChangeText={onDrinkNameChange}
          placeholderTextColor="#999"
        />
      </View>

      {/* Amount Selector */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t("howMuch")}</ThemedText>

        {/* Quick Presets */}
        <View style={styles.presetsContainer}>
          {selectedType.options.map((option, index) => {
            const drinkOption = getDrinkOption(
              selectedType.id,
              option.key,
              preferredUnit === "cl" ? "eu" : "us"
            );
            console.log("drinkop", drinkOption);
            if (!drinkOption) return null;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetButton,
                  selectedOption.key === option.key &&
                    styles.selectedPresetButton,
                ]}
                onPress={() => onOptionSelect(drinkOption)}
              >
                <ThemedText
                  style={[
                    styles.presetText,
                    selectedOption.key === option.key &&
                      styles.selectedPresetText,
                  ]}
                >
                  {/* {t(drinkOption.key)} ({drinkOption.amount} {drinkOption.unit}) */}
                  {formatDrinkOption(
                    drinkOption,
                    (key: string) => t(key as any),
                    true,
                    preferredUnit
                  )}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customContainer}>
          <ThemedText style={styles.customLabel}>
            {t("orEnterCustom")}
          </ThemedText>
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder={t("amount")}
              value={customAmount}
              onChangeText={onCustomAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.unitInput}
              placeholder={t("unit")}
              value={customUnit}
              onChangeText={onCustomUnitChange}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  drinkNameInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "left",
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedPresetButton: {
    borderColor: Colors.light.tint,
    backgroundColor: "#E3F2FD",
  },
  presetText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  selectedPresetText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  customContainer: {
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
  },
  customLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  customInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
  },
  unitInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
  },
});
