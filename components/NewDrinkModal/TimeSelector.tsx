import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface TimeSelectorProps {
  customTime: Date;
  onTimeChange: (date: Date) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  customTime,
  onTimeChange,
}) => {
  const { t, language } = useTranslation();

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{t("date")}</ThemedText>
      <DateTimePicker
        mode="datetime"
        value={customTime}
        themeVariant="light"
        locale={language}
        maximumDate={new Date()}
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            onTimeChange(selectedDate);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "bold",
    color: Colors.light.text,
  },
});
