import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

import DateTimePicker from "@react-native-community/datetimepicker";

import { DrinkOption, DrinkType, DrinkTypeKey, DrinkOptionKey } from "@/types";
import { formatDrinkOption, getDrinkTypes } from "@/utils";
import { convertUnit } from "@/utils/drinks";
import { createBulkDrinkLogs, createDrinkLog } from "@/services/drinkService";
import { Slider } from "@expo/ui/swift-ui";
import { UserData } from "@/services/userDataService";

interface NewDrinkModalProps {
  userData: UserData;
  visible: boolean;
  onClose: () => void;
  initialMode?: "normal" | "lastNight";
  onDrinkLogged?: () => void; // Optional callback to refresh data
}

// Custom Slider Component
const CustomSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
}> = ({ value, onValueChange, min, max }) => {
  return (
    <View style={styles.sliderContainer}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        steps={max}
      />
      <View style={styles.sliderLabels}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <ThemedText key={i} style={styles.sliderLabel}>
            {i === max ? "15+" : i.toString()}
          </ThemedText>
        ))}
      </View>
    </View>
  );
};

// Get slider label based on value
const getSliderLabel = (value: number): { text: string; emoji: string } => {
  if (value === 0) return { text: "Stone-cold sober", emoji: "🧘" };
  if (value <= 2) return { text: "Barely a buzz", emoji: "😌" };
  if (value <= 5) return { text: "Feeling tipsy", emoji: "😏" };
  if (value <= 9) return { text: "The night got interesting", emoji: "🍻" };
  if (value <= 12) return { text: "Who bought the last round?", emoji: "🤔" };
  return {
    text: "Bro, I don't even remember...\nhell of a hangover",
    emoji: "🤯",
  };
};

export const NewDrinkModal: React.FC<NewDrinkModalProps> = ({
  userData,
  visible,
  onClose,
  initialMode = "normal",
  onDrinkLogged,
}) => {
  const { t } = useTranslation();
  const drinkTypes = getDrinkTypes((key: string) => t(key as any));

  // Find the selected drink type by key
  const getSelectedDrinkType = () => {
    return (
      drinkTypes.find((type) => type.id === userData.preferred_drink_type) ||
      drinkTypes[0]
    );
  };

  const [selectedType, setSelectedType] = useState<DrinkType>(
    getSelectedDrinkType()
  );

  // Find the selected option by key
  const getSelectedOption = () => {
    const type = getSelectedDrinkType();
    return (
      type.options.find(
        (option) => option.key === userData.preferred_drink_option
      ) || type.options[0]
    );
  };

  const [selectedOption, setSelectedOption] = useState(getSelectedOption());
  const [drinkName, setDrinkName] = useState(userData?.favorite_drink || "");
  const [customAmount, setCustomAmount] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [canHandleDateSelection, setCanHandleDateSelection] = useState(false);
  const [canHandleTimeSelection, setCanHandleTimeSelection] = useState(false);

  // New state for Last Night mode
  const [timeMode, setTimeMode] = useState<"now" | "earlier" | "lastNight">(
    initialMode === "lastNight" ? "lastNight" : "now"
  );
  const [sliderValue, setSliderValue] = useState(0);
  const [isUncertain, setIsUncertain] = useState(false);

  // Handle date picker initialization
  useEffect(() => {
    if (showDatePicker) {
      const timer = setTimeout(() => {
        setCanHandleDateSelection(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCanHandleDateSelection(false);
    }
  }, [showDatePicker]);

  // Handle time picker initialization
  useEffect(() => {
    if (showTimePicker) {
      const timer = setTimeout(() => {
        setCanHandleTimeSelection(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCanHandleTimeSelection(false);
    }
  }, [showTimePicker]);

  // Reset mode when modal opens
  useEffect(() => {
    if (visible) {
      setTimeMode(initialMode === "lastNight" ? "lastNight" : "now");
    }
  }, [visible, initialMode]);

  const handleTypeSelect = (type: DrinkType) => {
    setSelectedType(type);
    setSelectedOption(type.options[0]);
    setCustomAmount("");
    setCustomUnit("");
  };

  const handleOptionSelect = (option: DrinkOption) => {
    setSelectedOption(option);
    setCustomAmount("");
    setCustomUnit("");
  };

  const handleLogDrink = async () => {
    try {
      if (timeMode === "lastNight") {
        // Handle Last Night mode - create bulk approximate drinks
        const lastNightTime = new Date();
        lastNightTime.setHours(23, 0, 0, 0); // Set to 11 PM last night
        lastNightTime.setDate(lastNightTime.getDate() - 1);

        // Create bulk drink logs for last night
        await createBulkDrinkLogs(
          userData?.id || "",
          sliderValue,
          lastNightTime.toISOString(),
          true
        );
      } else {
        // Handle normal mode
        const amount = customAmount
          ? parseFloat(customAmount)
          : selectedOption.amount;
        const unit = customUnit || selectedOption.unit;

        if (customAmount && (isNaN(amount) || amount <= 0)) {
          Alert.alert(t("invalidAmount"), t("invalidAmountMessage"));
          return;
        }

        // Validate that the amount is positive (for both custom and predefined options)
        if (amount <= 0) {
          Alert.alert(t("invalidAmount"), t("invalidAmountMessage"));
          return;
        }

        // Convert to mL for database storage
        const amountMl = convertUnit(amount, unit as any, "ml");

        await createDrinkLog({
          drink_type: selectedType.id as DrinkTypeKey,
          drink_option: selectedOption.key as DrinkOptionKey,
          drink_name: drinkName || undefined,
          amount_ml: amountMl,
          timestamp: useCustomTime ? customTime.toISOString() : undefined,
          is_approximate: false,
          alcohol_percentage: selectedType.alcohol_percentage,
        });
      }

      // Reset form
      setSelectedType(getSelectedDrinkType());
      setSelectedOption(getSelectedOption());
      setCustomAmount("");
      setCustomUnit("");
      setUseCustomTime(false);
      setCustomTime(new Date());
      setShowDatePicker(false);
      setShowTimePicker(false);
      setCanHandleDateSelection(false);
      setCanHandleTimeSelection(false);
      setTimeMode("now");
      setSliderValue(0);
      setIsUncertain(false);

      // Call the callback to refresh data
      onDrinkLogged?.();

      onClose();
    } catch (error) {
      console.error("Error logging drink:", error);
      Alert.alert("Error", "Failed to log drink. Please try again.");
    }
  };

  const handleCancel = () => {
    // Reset form
    setSelectedType(getSelectedDrinkType());
    setSelectedOption(getSelectedOption());
    setDrinkName(userData?.favorite_drink || "");
    setCustomAmount("");
    setCustomUnit("");
    setUseCustomTime(false);
    setCustomTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
    setCanHandleDateSelection(false);
    setCanHandleTimeSelection(false);
    setTimeMode("now");
    setSliderValue(0);
    setIsUncertain(false);
    onClose();
  };

  const handleTimeModeChange = (mode: "now" | "earlier" | "lastNight") => {
    setTimeMode(mode);
    if (mode === "earlier") {
      setUseCustomTime(true);
      setShowDatePicker(true);
    } else if (mode === "now") {
      setUseCustomTime(false);
      setCustomTime(new Date());
    } else if (mode === "lastNight") {
      setUseCustomTime(false);
      setCustomTime(new Date());
    }
  };

  const handleDateSelected = (date: Date) => {
    if (!canHandleDateSelection) {
      return;
    }

    setCustomTime(date);
    // setShowDatePicker(false);
    // setShowTimePicker(true);
  };

  const handleTimeSelected = (date: Date) => {
    if (!canHandleTimeSelection) {
      return;
    }

    setCustomTime(date);
    setShowTimePicker(false);
  };

  const formatCustomTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return `${Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      )} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  const isFormValid =
    timeMode === "lastNight"
      ? true // Always valid in Last Night mode
      : selectedType && (customAmount ? parseFloat(customAmount) > 0 : true);

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
          {/* Last Night Quick Mode */}
          {timeMode === "lastNight" && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                How heavy was last night?
              </ThemedText>

              {/* Slider Label */}
              <View style={styles.sliderLabelContainer}>
                <ThemedText style={styles.sliderMainLabel}>
                  {getSliderLabel(sliderValue).text}
                </ThemedText>
                <ThemedText style={styles.sliderEmoji}>
                  {getSliderLabel(sliderValue).emoji}
                </ThemedText>
              </View>

              {/* Custom Slider */}
              <CustomSlider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={0}
                max={15}
              />
            </View>
          )}

          {/* Normal Mode - Drink Type and Amount Selectors */}
          {timeMode !== "lastNight" && (
            <>
              {/* Drink Type Selector - Horizontal Scrollable */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {t("whatDidYouDrink")}
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeScrollContainer}
                >
                  {drinkTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typePill,
                        selectedType.id === type.id && styles.selectedTypePill,
                      ]}
                      onPress={() => handleTypeSelect(type)}
                    >
                      <ThemedText style={styles.typeEmoji}>
                        {type.emoji}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.typeName,
                          selectedType.id === type.id &&
                            styles.selectedTypeName,
                        ]}
                      >
                        {t(type.name_key as any)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Drink Name Input */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {t("drinkName")}
                </ThemedText>
                <TextInput
                  style={styles.drinkNameInput}
                  placeholder={t("drinkNamePlaceholder")}
                  value={drinkName}
                  onChangeText={setDrinkName}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Amount Selector */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {t("howMuch")}
                </ThemedText>

                {/* Quick Presets */}
                <View style={styles.presetsContainer}>
                  {selectedType.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.presetButton,
                        selectedOption === option &&
                          styles.selectedPresetButton,
                      ]}
                      onPress={() => handleOptionSelect(option)}
                    >
                      <ThemedText
                        style={[
                          styles.presetText,
                          selectedOption === option &&
                            styles.selectedPresetText,
                        ]}
                      >
                        {formatDrinkOption(option, (key: string) =>
                          t(key as any)
                        )}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
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
                      onChangeText={setCustomAmount}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={styles.unitInput}
                      placeholder={t("unit")}
                      value={customUnit}
                      onChangeText={setCustomUnit}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Time Selector */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>When?</ThemedText>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  timeMode === "now" && styles.selectedTimeOption,
                ]}
                onPress={() => handleTimeModeChange("now")}
              >
                <ThemedText
                  style={[
                    styles.timeText,
                    timeMode === "now" && styles.selectedTimeText,
                  ]}
                >
                  Now
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  timeMode === "earlier" && styles.selectedTimeOption,
                ]}
                onPress={() => handleTimeModeChange("earlier")}
              >
                <ThemedText
                  style={[
                    styles.timeText,
                    timeMode === "earlier" && styles.selectedTimeText,
                  ]}
                >
                  Earlier
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  timeMode === "lastNight" && styles.selectedTimeOption,
                ]}
                onPress={() => handleTimeModeChange("lastNight")}
              >
                <ThemedText
                  style={[
                    styles.timeText,
                    timeMode === "lastNight" && styles.selectedTimeText,
                  ]}
                >
                  Last Night
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Custom Time Display */}
            {useCustomTime && (
              <View style={styles.customTimeContainer}>
                <ThemedText style={styles.customTimeText}>
                  Select a time
                </ThemedText>
                <DateTimePicker
                  mode="datetime"
                  value={customTime}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      handleDateSelected(selectedDate);
                    }
                  }}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Primary Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logButton, !isFormValid && styles.logButtonDisabled]}
            onPress={handleLogDrink}
            disabled={!isFormValid}
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
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  typeScrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  typePill: {
    backgroundColor: "#F8F8F8",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 6,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
  },
  selectedTypePill: {
    borderColor: Colors.light.tint,
    backgroundColor: "#E3F2FD",
    transform: [{ scale: 1.05 }],
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  selectedTypeName: {
    color: Colors.light.tint,
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
  drinkNameInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "left",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  timeOption: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTimeOption: {
    borderColor: Colors.light.tint,
    backgroundColor: "#E3F2FD",
  },
  timeText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  selectedTimeText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  customTimeContainer: {
    marginTop: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customTimeButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  customTimeText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  customTimeSubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  customTimeHint: {
    fontSize: 12,
    color: Colors.light.tint,
    fontStyle: "italic",
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
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: "90%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  pickerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCloseText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  dateTimePicker: {
    height: 200,
  },
  sliderContainer: {
    marginTop: 12,
    // alignItems: "center",
  },
  sliderTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
    position: "absolute",
    top: 0,
    left: 0,
  },
  sliderThumb: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    position: "absolute",
    top: -15,
    zIndex: 1,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
  },
  sliderLabelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderMainLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  sliderEmoji: {
    fontSize: 32,
  },
  uncertainButton: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  uncertainButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
});
