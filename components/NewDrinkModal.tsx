import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useCallback } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

import { createBulkDrinkLogs, createDrinkLog } from "@/services/drinkService";
import { DrinkOptionKey, DrinkTypeKey } from "@/types";
import { convertUnit } from "@/utils/drinks";

import { UserData } from "@/services/userDataService";

// Import the extracted components and hooks
import { useNewDrinkForm } from "@/hooks/useNewDrinkForm";
import { DrinkAmountSelector } from "./NewDrinkModal/DrinkAmountSelector";
import { DrinkTypeSelector } from "./NewDrinkModal/DrinkTypeSelector";
import { LastNightSlider } from "./NewDrinkModal/LastNightSlider";
import { TimeSelector } from "./NewDrinkModal/TimeSelector";

interface NewDrinkModalProps {
  userData: UserData;
  visible: boolean;
  onClose: () => void;
  initialMode?: "normal" | "lastNight";
  onDrinkLogged?: () => void;
}

export const NewDrinkModal: React.FC<NewDrinkModalProps> = ({
  userData,
  visible,
  onClose,
  initialMode = "normal",
  onDrinkLogged,
}) => {
  const { t } = useTranslation();

  const { formState, actions, validation, resetForm } = useNewDrinkForm(
    userData,
    initialMode,
    visible
  );

  const handleLogDrink = useCallback(async () => {
    try {
      if (formState.timeMode === "lastNight") {
        const lastNightTime = new Date();
        lastNightTime.setHours(23, 0, 0, 0);
        lastNightTime.setDate(lastNightTime.getDate() - 1);

        await createBulkDrinkLogs(
          userData?.id || "",
          formState.sliderValue,
          lastNightTime.toISOString(),
          true
        );
      } else {
        const amount = formState.customAmount
          ? parseFloat(formState.customAmount)
          : formState.selectedOption.amount;
        const unit = formState.customUnit || formState.selectedOption.unit;

        if (!validation.isAmountValid(amount)) {
          Alert.alert(t("invalidAmount"), t("invalidAmountMessage"));
          return;
        }

        const amountMl = convertUnit(amount, unit as any, "ml");

        await createDrinkLog({
          drink_type: formState.selectedType.id as DrinkTypeKey,
          drink_option: formState.selectedOption.key as DrinkOptionKey,
          drink_name: formState.drinkName || undefined,
          amount_ml: amountMl,
          timestamp: formState.useCustomTime
            ? formState.customTime.toISOString()
            : undefined,
          is_approximate: false,
          alcohol_percentage: formState.selectedType.alcohol_percentage,
        });
      }

      resetForm();
      onDrinkLogged?.();
      onClose();
    } catch (error) {
      console.error("Error logging drink:", error);
      Alert.alert(t("error"), t("drinkAddError"));
    }
  }, [formState, validation, userData, t, onDrinkLogged, onClose, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t("logADrink")}</ThemedText>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <ThemedText style={styles.closeText}>×</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Last Night Mode */}
          {formState.timeMode === "lastNight" && (
            <LastNightSlider
              value={formState.sliderValue}
              onChange={actions.setSliderValue}
            />
          )}

          {/* Normal Mode */}
          {formState.timeMode !== "lastNight" && (
            <>
              <DrinkTypeSelector
                selectedType={formState.selectedType}
                onTypeSelect={actions.handleTypeSelect}
              />

              <DrinkAmountSelector
                selectedType={formState.selectedType}
                selectedOption={formState.selectedOption}
                drinkName={formState.drinkName}
                customAmount={formState.customAmount}
                customUnit={formState.customUnit}
                onOptionSelect={actions.handleOptionSelect}
                onDrinkNameChange={actions.setDrinkName}
                onCustomAmountChange={actions.setCustomAmount}
                onCustomUnitChange={actions.setCustomUnit}
              />
            </>
          )}

          {/* Time Selector */}
          <TimeSelector
            timeMode={formState.timeMode}
            useCustomTime={formState.useCustomTime}
            customTime={formState.customTime}
            onTimeModeChange={actions.handleTimeModeChange}
            onTimeChange={actions.handleTimeChange}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.logButton,
              !validation.isFormValid && styles.logButtonDisabled,
            ]}
            onPress={handleLogDrink}
            disabled={!validation.isFormValid}
          >
            <ThemedText style={styles.logButtonText}>{t("logIt")}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D0",
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E8E0D0",
  },
  logButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
