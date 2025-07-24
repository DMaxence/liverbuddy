import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "../ThemedText";
import { TimeMode } from "@/hooks/useNewDrinkForm";
import { useTranslation } from "@/hooks/useTranslation";

interface TimeSelectorProps {
  timeMode: TimeMode;
  useCustomTime: boolean;
  customTime: Date;
  onTimeModeChange: (mode: TimeMode) => void;
  onTimeChange: (date: Date) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  timeMode,
  useCustomTime,
  customTime,
  onTimeModeChange,
  onTimeChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{t("when")}</ThemedText>
      
      <View style={styles.timeContainer}>
        <TouchableOpacity
          style={[
            styles.timeOption,
            timeMode === "now" && styles.selectedTimeOption,
          ]}
          onPress={() => onTimeModeChange("now")}
        >
          <ThemedText
            style={[
              styles.timeText,
              timeMode === "now" && styles.selectedTimeText,
            ]}
          >
            {t("now")}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeOption,
            timeMode === "earlier" && styles.selectedTimeOption,
          ]}
          onPress={() => onTimeModeChange("earlier")}
        >
          <ThemedText
            style={[
              styles.timeText,
              timeMode === "earlier" && styles.selectedTimeText,
            ]}
          >
            {t("earlier")}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.timeOption,
            timeMode === "lastNight" && styles.selectedTimeOption,
          ]}
          onPress={() => onTimeModeChange("lastNight")}
        >
          <ThemedText
            style={[
              styles.timeText,
              timeMode === "lastNight" && styles.selectedTimeText,
            ]}
          >
            {t("lastNight")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Custom Time Display */}
      {useCustomTime && (
        <View style={styles.customTimeContainer}>
          <ThemedText style={styles.customTimeText}>
            {t("selectATime")}
          </ThemedText>
          <DateTimePicker
            mode="datetime"
            value={customTime}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onTimeChange(selectedDate);
              }
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
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
  customTimeText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
    marginBottom: 4,
  },
}); 