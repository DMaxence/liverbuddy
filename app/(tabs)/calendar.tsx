import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "@/hooks/useTranslation";
import { getDayBackgroundColor, getLiverStateByScore } from "@/utils";
import { DrinkLog, mockUserData } from "@/utils/mockData";
import {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Import all liver images statically
const liverImages = {
  1: require("@/assets/images/liver-level-1.png"),
  2: require("@/assets/images/liver-level-2.png"),
  3: require("@/assets/images/liver-level-3.png"),
  4: require("@/assets/images/liver-level-4.png"),
  5: require("@/assets/images/liver-level-5.png"),
  6: require("@/assets/images/liver-level-6.png"),
};

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  drinks: DrinkLog[];
  healthScore: number;
  liverState: number;
}

interface MonthlySummary {
  totalDrinks: number;
  averagePerDay: number;
  worstDay: { date: string; drinks: number };
  topDrinkType: { type: string; count: number };
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Bottom sheet ref and snap points
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    // Calculate dynamic snap points based on content
    const maxDrinks = selectedDay?.drinks.length || 0;
    if (maxDrinks === 0) return ["30%"]; // Empty state
    return ["40%"]; // Many drinks - max height with scroll
  }, [selectedDay?.drinks.length]);

  // Prepare section data for BottomSheetSectionList
  const sectionData = useMemo(() => {
    if (!selectedDay) return [];

    if (selectedDay.drinks.length === 0) {
      return [
        {
          title: "No Drinks",
          data: [],
        },
      ];
    }

    return [
      {
        title: selectedDay.date.toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        data: selectedDay.drinks,
      },
    ];
  }, [selectedDay, language]);

  const today = new Date();

  const getMonthData = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Adjust start date based on language - French starts with Monday (1), English with Sunday (0)
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract =
      language === "fr"
        ? firstDayOfWeek === 0
          ? 6
          : firstDayOfWeek - 1 // Monday = 1, Sunday = 0 becomes 6
        : firstDayOfWeek; // English keeps Sunday = 0
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = currentDate.toISOString().split("T")[0];
      const drinks = mockUserData.drinks[dateString] || [];

      // Get health score for this day (default to 100 if no data)
      const healthScore = mockUserData.dailyHealthScores[dateString] || 100;
      const liverState = getLiverStateByScore(healthScore);

      days.push({
        date: currentDate,
        dayNumber: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        drinks,
        healthScore,
        liverState: liverState.level,
      });
    }

    return days;
  };

  const getMonthlySummary = (date: Date): MonthlySummary => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalDrinks = 0;
    let totalDrinkingDays = 0;
    let worstDay = { date: "", drinks: 0 };
    const drinkTypeCount: { [key: string]: number } = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const drinks = mockUserData.drinks[dateString] || [];

      if (drinks.length > 0) {
        totalDrinks += drinks.length;
        totalDrinkingDays++;

        if (drinks.length > worstDay.drinks) {
          worstDay = { date: dateString, drinks: drinks.length };
        }

        drinks.forEach((drink) => {
          drinkTypeCount[drink.type] = (drinkTypeCount[drink.type] || 0) + 1;
        });
      }
    }

    const topDrinkType = Object.entries(drinkTypeCount).sort(
      ([, a], [, b]) => b - a
    )[0] || ["None", 0];

    return {
      totalDrinks,
      averagePerDay:
        totalDrinkingDays > 0
          ? Math.round((totalDrinks / totalDrinkingDays) * 10) / 10
          : 0,
      worstDay,
      topDrinkType: { type: topDrinkType[0], count: topDrinkType[1] },
    };
  };

  

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDay(day);
    bottomSheetRef.current?.present();
  };

  const handleDismiss = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const monthData = getMonthData(currentDate);
  const summary = getMonthlySummary(currentDate);
  const weekDays =
    language === "fr"
      ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weeksToDisplay = monthData.slice(-7).every((day) => !day.isCurrentMonth)
    ? 5
    : 6;
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Drinking Calendar</ThemedText>
          <View style={styles.monthNavigator}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth("prev")}
            >
              <IconSymbol
                size={24}
                name="chevron.left"
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
            <ThemedText style={styles.monthYear}>
              {formatMonthYear(currentDate)}
            </ThemedText>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth("next")}
              disabled={today.getMonth() === currentDate.getMonth()}
            >
              <IconSymbol
                size={24}
                name="chevron.right"
                color={Colors[colorScheme ?? "light"].tint}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Week day headers */}
          <View style={styles.weekDaysHeader}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDayHeader}>
                <ThemedText style={styles.weekDayText}>{day}</ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: weeksToDisplay }, (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = monthData[weekIndex * 7 + dayIndex];
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.dayCell,
                        !day.isCurrentMonth && styles.otherMonthDay,
                        // day.isToday && styles.todayCell,
                        day.date <= today
                          ? {
                              backgroundColor: day.isCurrentMonth
                                ? getDayBackgroundColor(day.liverState)
                                : "transparent",
                            }
                          : {
                              backgroundColor: "#efe6d2",
                            },
                      ]}
                      disabled={day.date > today}
                      onPress={() => handleDayPress(day)}
                    >
                      {day.isCurrentMonth && (
                        <>
                          <ThemedText
                            style={[
                              styles.dayNumber,
                              //   day.isToday && styles.todayText,
                            ]}
                          >
                            {day.dayNumber}
                          </ThemedText>
                          {day.date <= today ? (
                            <Image
                              source={
                                liverImages[
                                  day.liverState as keyof typeof liverImages
                                ]
                              }
                              style={styles.liverImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={styles.liverImage} />
                          )}
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Summary Cards */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryTitle}>Monthly Summary</ThemedText>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>🍺</ThemedText>
              <ThemedText style={styles.summaryLabel}>Total drinks</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.totalDrinks} drinks
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>📊</ThemedText>
              <ThemedText style={styles.summaryLabel}>
                Average per day
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.averagePerDay} drinks
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>🫠</ThemedText>
              <ThemedText style={styles.summaryLabel}>Worst day</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.worstDay.date
                  ? formatDate(summary.worstDay.date)
                  : "None"}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>🍷</ThemedText>
              <ThemedText style={styles.summaryLabel}>
                Top drink type
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.topDrinkType.type
                  ? summary.topDrinkType.type.charAt(0).toUpperCase() +
                    summary.topDrinkType.type.slice(1)
                  : "None"}{" "}
                – {summary.topDrinkType.count}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing={true}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        backgroundStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
      >
        {selectedDay?.drinks.length === 0 ? (
          <BottomSheetView style={styles.modalContent}>
            <View style={styles.emptyStateContainer}>
              <ThemedText style={styles.noDrinksText}>
                No drinks logged for this day! 🧠
              </ThemedText>
            </View>
          </BottomSheetView>
        ) : (
          <BottomSheetSectionList
            style={styles.modalContent}
            sections={sectionData}
            keyExtractor={(item: DrinkLog) => item.id}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionHeaderText}>
                  {section.title}
                </ThemedText>
              </View>
            )}
            renderItem={({ item }: { item: DrinkLog }) => (
              <View style={styles.drinkItem}>
                <ThemedText style={styles.drinkIcon}>{item.emoji}</ThemedText>
                <View style={styles.drinkDetails}>
                  <ThemedText style={styles.drinkName}>{item.name}</ThemedText>
                  <ThemedText style={styles.drinkAmount}>
                    {item.amount} {item.unit}
                  </ThemedText>
                </View>
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        )}
      </BottomSheetModal>
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
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 16,
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    // maxWidth: 200,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: "#11181C",
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  weekDaysHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  calendarGrid: {
    backgroundColor: "transparent",
    gap: 4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 4,
  },
  dayCell: {
    flex: 1,
    // aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
    borderRadius: 12,
    marginHorizontal: 1,
  },
  otherMonthDay: {
    opacity: 0.1,
  },
  todayCell: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 2,
  },
  otherMonthText: {
    color: "#999",
  },
  todayText: {
    color: "#fff",
  },
  liverImage: {
    width: 24,
    height: 24,
  },
  drinkIcon: {
    fontSize: 20,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  summaryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    paddingTop: 0,
    flex: 1,
    minHeight: 200,
  },
  modalHeaderBar: {
    width: 50,
    height: 4,
    backgroundColor: "#11181C",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "red",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11181C",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  modalBody: {
    maxHeight: 300,
  },
  emptyStateContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  noDrinksText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  flatListContent: {
    paddingHorizontal: 0,
    paddingBottom: 20,
    flexGrow: 1,
  },
  drinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  drinkDetails: {
    marginLeft: 12,
    flex: 1,
  },
  drinkName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
  drinkAmount: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  sectionHeader: {
    backgroundColor: Colors.light.background,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11181C",
  },
});
