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

// Import Expo UI DateTimePicker
// import { DateTimePicker } from "@expo/ui/swift-ui";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Slider } from "@expo/ui/swift-ui";

export interface DrinkType {
  id: string;
  name: string;
  emoji: string;
  defaultAmount: number;
  defaultUnit: string;
  options: { amount: number; unit: string; label: string }[];
}

const getDrinkTypes = (t: any): DrinkType[] => [
  {
    id: "beer",
    name: t("beer"),
    emoji: "🍺",
    defaultAmount: 330,
    defaultUnit: "mL",
    options: [
      { amount: 330, unit: "mL", label: `${t("can")} (330mL)` },
      { amount: 500, unit: "mL", label: `${t("bottle")} (500mL)` },
      { amount: 473, unit: "mL", label: `${t("pint")} (473mL)` },
      { amount: 1, unit: "L", label: `${t("large")} (1L)` },
    ],
  },
  {
    id: "wine",
    name: t("wine"),
    emoji: "🍷",
    defaultAmount: 5,
    defaultUnit: "oz",
    options: [
      { amount: 5, unit: "oz", label: `${t("glass")} (5oz)` },
      { amount: 6, unit: "oz", label: `${t("largeGlass")} (6oz)` },
      { amount: 750, unit: "mL", label: `${t("bottle")} (750mL)` },
    ],
  },
  {
    id: "cocktail",
    name: t("cocktail"),
    emoji: "🍸",
    defaultAmount: 1,
    defaultUnit: "drink",
    options: [
      { amount: 1, unit: "drink", label: `${t("standard")} (1 ${t("drink")})` },
      {
        amount: 1.5,
        unit: "drink",
        label: `${t("strong")} (1.5 ${t("drinks")})`,
      },
      { amount: 2, unit: "drink", label: `${t("double")} (2 ${t("drinks")})` },
    ],
  },
  {
    id: "spirits",
    name: t("spirits"),
    emoji: "🥃",
    defaultAmount: 1.5,
    defaultUnit: "oz",
    options: [
      { amount: 1, unit: "oz", label: `${t("shot")} (1oz)` },
      { amount: 1.5, unit: "oz", label: `${t("standard")} (1.5oz)` },
      { amount: 2, unit: "oz", label: `${t("double")} (2oz)` },
    ],
  },
  {
    id: "other",
    name: t("other"),
    emoji: "🥤",
    defaultAmount: 1,
    defaultUnit: "drink",
    options: [
      { amount: 1, unit: "drink", label: `${t("standard")} (1 ${t("drink")})` },
      {
        amount: 1.5,
        unit: "drink",
        label: `${t("strong")} (1.5 ${t("drinks")})`,
      },
      { amount: 2, unit: "drink", label: `${t("double")} (2 ${t("drinks")})` },
    ],
  },
];

interface NewDrinkModalProps {
  visible: boolean;
  onClose: () => void;
  onLogDrink: (drink: {
    type: string;
    name: string;
    amount: number;
    unit: string;
    emoji: string;
    timestamp?: Date;
    isApproximate?: boolean;
  }) => void;
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
  visible,
  onClose,
  onLogDrink,
}) => {
  const { t } = useTranslation();
  const drinkTypes = getDrinkTypes(t);

  const [selectedType, setSelectedType] = useState<DrinkType>(drinkTypes[0]);
  const [selectedOption, setSelectedOption] = useState(
    drinkTypes[0].options[0]
  );
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
    "now"
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

  const handleTypeSelect = (type: DrinkType) => {
    setSelectedType(type);
    setSelectedOption(type.options[0]);
    setCustomAmount("");
    setCustomUnit("");
  };

  const handleOptionSelect = (option: {
    amount: number;
    unit: string;
    label: string;
  }) => {
    setSelectedOption(option);
    setCustomAmount("");
    setCustomUnit("");
  };

  const handleLogDrink = () => {
    if (timeMode === "lastNight") {
      // Handle Last Night mode
      const lastNightTime = new Date();
      lastNightTime.setHours(23, 0, 0, 0); // Set to 11 PM last night
      lastNightTime.setDate(lastNightTime.getDate() - 1);

      onLogDrink({
        type: "approximate",
        name: isUncertain ? "Unknown drinks" : `${sliderValue} drinks`,
        amount: sliderValue,
        unit: "drinks",
        emoji: "🍺",
        timestamp: lastNightTime,
        isApproximate: true,
      });
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

      onLogDrink({
        type: selectedType.id,
        name: selectedType.name,
        amount,
        unit,
        emoji: selectedType.emoji,
        timestamp: useCustomTime ? customTime : undefined,
        isApproximate: false,
      });
    }

    // Reset form
    setSelectedType(drinkTypes[0]);
    setSelectedOption(drinkTypes[0].options[0]);
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

  const handleCancel = () => {
    // Reset form
    setSelectedType(drinkTypes[0]);
    setSelectedOption(drinkTypes[0].options[0]);
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
                        {type.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                        {option.label}
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
