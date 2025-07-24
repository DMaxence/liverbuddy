import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/hooks/useUser";
import { getDotColor, getLiverStateByScore } from "@/utils";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface MiniCalendarProps {
  onDayPress?: (date: string) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ onDayPress }) => {
  const { t, language } = useTranslation();
  const { userData } = useUser("local-user");

  const generateLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const isToday = date.toDateString() === today.toDateString();
      const healthScore = userData?.dailyHealthScores[dateString] || 100;
      const liverState = getLiverStateByScore(healthScore);

      days.push({
        date: dateString,
        dayName: date.toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US",
          { weekday: "short" }
        ),
        dayNumber: date.getDate(),
        isToday,
        liverState: liverState.level,
      });
    }

    return days;
  };

  const days = generateLast7Days();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{t("thisWeek")}</ThemedText>
      <View style={styles.calendarContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.date}
            style={styles.dayContainer}
            onPress={() => onDayPress?.(day.date)}
          >
            <ThemedText
              style={[styles.dayName, day.isToday && styles.todayText]}
            >
              {day.dayName}
            </ThemedText>
            <ThemedText
              style={[styles.dayNumber, day.isToday && styles.todayText]}
            >
              {day.dayNumber}
            </ThemedText>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: getDotColor(day.liverState),
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 12,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.light.backgroundTint,
    borderRadius: 12,
    padding: 12,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 6,
  },
  todayText: {
    color: "#0a7ea4",
    fontWeight: "bold",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
