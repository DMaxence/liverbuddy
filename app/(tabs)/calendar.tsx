import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/hooks/useUser";
import { DrinkLog } from "@/lib/database/schema";
import { getLocalizedLiverState } from "@/types";
import { getDayBackgroundColor, getLiverStateByScore } from "@/utils";
import { formatDrinkAmount } from "@/utils/formatDrinkAmount";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetSectionList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const shadow = require("@/assets/images/shadow.png");
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

interface YearMonth {
  month: number;
  year: number;
  monthName: string;
  totalDrinks: number;
  averageHealthScore: number;
  liverState: number;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
}

interface YearlySummary {
  totalDrinks: number;
  averagePerDay: number;
  worstMonth: { month: string; drinks: number };
  bestMonth: { month: string; score: number };
  topDrinkType: { type: string; count: number };
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const { t, language } = useTranslation();
  const { userData, isLoading } = useUser("local-user");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [isLiverDetailModalVisible, setIsLiverDetailModalVisible] =
    useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const { date } = useLocalSearchParams();

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

  const getMonthData = useCallback(
    (date: Date): CalendarDay[] => {
      if (!userData) return [];

      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
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

        const dateString = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        const drinks = userData.drinks[dateString] || [];

        const healthScore = userData.dailyHealthScores[dateString] ?? 100;
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
    },
    [userData, language]
  );

  const getYearData = (date: Date): YearMonth[] => {
    if (!userData) return [];

    const year = date.getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const months: YearMonth[] = [];

    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let totalDrinks = 0;
      let totalHealthScore = 0;
      let validHealthScoreDays = 0;
      const drinkTypeCount: { [key: string]: number } = {};

      // Calculate monthly totals
      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        const drinks = userData.drinks[dateString] || [];
        const healthScore = userData.dailyHealthScores[dateString];

        totalDrinks += drinks.length;

        if (healthScore !== undefined) {
          totalHealthScore += healthScore;
          validHealthScoreDays++;
        }

        drinks.forEach((drink) => {
          drinkTypeCount[drink.drink_type] =
            (drinkTypeCount[drink.drink_type] || 0) + 1;
        });
      }

      const averageHealthScore =
        validHealthScoreDays > 0
          ? totalHealthScore / validHealthScoreDays
          : 100;
      const liverState = getLiverStateByScore(averageHealthScore);

      months.push({
        month,
        year,
        monthName: monthDate.toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US",
          {
            month: "short",
          }
        ),
        totalDrinks,
        averageHealthScore,
        liverState: liverState.level,
        isCurrentMonth: year === currentYear && month === currentMonth,
        isFutureMonth:
          year > currentYear || (year === currentYear && month > currentMonth),
      });
    }

    return months;
  };

  const getMonthlySummary = (date: Date): MonthlySummary => {
    if (!userData) {
      return {
        totalDrinks: 0,
        averagePerDay: 0,
        worstDay: { date: "", drinks: 0 },
        topDrinkType: { type: "None", count: 0 },
      };
    }

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
      const drinks = userData.drinks[dateString] || [];

      if (drinks.length > 0) {
        totalDrinks += drinks.length;
        totalDrinkingDays++;

        if (drinks.length > worstDay.drinks) {
          worstDay = { date: dateString, drinks: drinks.length };
        }

        drinks.forEach((drink) => {
          drinkTypeCount[drink.drink_type] =
            (drinkTypeCount[drink.drink_type] || 0) + 1;
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

  const getYearlySummary = (date: Date): YearlySummary => {
    if (!userData) {
      return {
        totalDrinks: 0,
        averagePerDay: 0,
        worstMonth: { month: "", drinks: 0 },
        bestMonth: { month: "", score: 0 },
        topDrinkType: { type: "None", count: 0 },
      };
    }

    const year = date.getFullYear();
    let totalDrinks = 0;
    let totalDays = 0;
    let worstMonth = { month: "", drinks: 0 };
    let bestMonth = { month: "", score: 0 };
    const drinkTypeCount: { [key: string]: number } = {};

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let monthDrinks = 0;
      let monthHealthScore = 0;
      let validHealthScoreDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        const drinks = userData.drinks[dateString] || [];
        const healthScore = userData.dailyHealthScores[dateString];

        monthDrinks += drinks.length;
        totalDays++;

        if (healthScore !== undefined) {
          monthHealthScore += healthScore;
          validHealthScoreDays++;
        }

        drinks.forEach((drink) => {
          drinkTypeCount[drink.drink_type] =
            (drinkTypeCount[drink.drink_type] || 0) + 1;
        });
      }

      totalDrinks += monthDrinks;

      // Check for worst month
      if (monthDrinks > worstMonth.drinks) {
        const monthName = new Date(year, month, 1).toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US",
          { month: "long" }
        );
        worstMonth = { month: monthName, drinks: monthDrinks };
      }

      // Check for best month (highest health score)
      const avgHealthScore =
        validHealthScoreDays > 0
          ? monthHealthScore / validHealthScoreDays
          : 100;
      if (avgHealthScore > bestMonth.score) {
        const monthName = new Date(year, month, 1).toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US",
          { month: "long" }
        );
        bestMonth = { month: monthName, score: Math.round(avgHealthScore) };
      }
    }

    const topDrinkType = Object.entries(drinkTypeCount).sort(
      ([, a], [, b]) => b - a
    )[0] || ["None", 0];

    return {
      totalDrinks,
      averagePerDay:
        totalDays > 0 ? Math.round((totalDrinks / totalDays) * 10) / 10 : 0,
      worstMonth,
      bestMonth,
      topDrinkType: { type: topDrinkType[0], count: topDrinkType[1] },
    };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "monthly") {
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else {
      // Yearly view
      if (direction === "prev") {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDay(day);
    bottomSheetRef.current?.present();
  };

  const handleMonthPress = (yearMonth: YearMonth) => {
    // Switch to monthly view and navigate to the selected month
    const newDate = new Date(yearMonth.year, yearMonth.month, 1);
    setCurrentDate(newDate);
    setViewMode("monthly");
  };

  const handleDismiss = useCallback(() => {
    // Modal dismiss handler
  }, []);

  // Handle date parameter from search params
  useEffect(() => {
    if (date && typeof date === "string" && userData) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          // Set current month to the date's month
          setCurrentDate(
            new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1)
          );

          // Find the day in the month data and open bottom sheet
          const monthData = getMonthData(
            new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1)
          );
          const targetDay = monthData.find(
            (day) => day.date.toDateString() === parsedDate.toDateString()
          );

          if (targetDay) {
            setSelectedDay(targetDay);
            // Use setTimeout to ensure the component is fully rendered
            setTimeout(() => {
              bottomSheetRef.current?.present();
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error parsing date parameter:", error);
      }
    }
  }, [date, userData, getMonthData]);

  useEffect(() => {
    return () => {
      router.setParams({ date: undefined });
    };
  }, [date]);

  const formatMonthYear = (date: Date): string => {
    if (viewMode === "monthly") {
      return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      return date.getFullYear().toString();
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const monthData = getMonthData(currentDate);
  const yearData = getYearData(currentDate);
  const summary =
    viewMode === "monthly"
      ? getMonthlySummary(currentDate)
      : getYearlySummary(currentDate);
  const weekDays =
    language === "fr"
      ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weeksToDisplay = monthData.slice(-7).every((day) => !day.isCurrentMonth)
    ? 5
    : 6;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            {t("loadingCalendar")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t("drinkingCalendar")}</ThemedText>
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
            <TouchableOpacity
              onPress={() =>
                setViewMode(viewMode === "monthly" ? "yearly" : "monthly")
              }
            >
              <ThemedText style={styles.monthYear}>
                {formatMonthYear(currentDate)}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth("next")}
              disabled={
                viewMode === "monthly"
                  ? today.getMonth() === currentDate.getMonth() &&
                    today.getFullYear() === currentDate.getFullYear()
                  : today.getFullYear() === currentDate.getFullYear()
              }
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
          {viewMode === "monthly" ? (
            <>
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
            </>
          ) : (
            <>
              {/* Yearly view - Months grid */}
              <View style={styles.yearlyGrid}>
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <View key={rowIndex} style={styles.monthRow}>
                    {Array.from({ length: 3 }, (_, colIndex) => {
                      const monthIndex = rowIndex * 3 + colIndex;
                      const month = yearData[monthIndex];
                      if (!month)
                        return <View key={colIndex} style={styles.monthCell} />;

                      return (
                        <TouchableOpacity
                          key={colIndex}
                          style={[
                            styles.monthCell,
                            month.isFutureMonth && styles.futureMonth,
                            !month.isFutureMonth && {
                              backgroundColor: getDayBackgroundColor(
                                month.liverState
                              ),
                            },
                          ]}
                          disabled={month.isFutureMonth}
                          onPress={() => handleMonthPress(month)}
                        >
                          <ThemedText style={styles.monthName}>
                            {month.monthName}
                          </ThemedText>
                          <ThemedText style={styles.monthDrinkCount}>
                            {month.totalDrinks} {t("drinks")}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryTitle}>
            {viewMode === "monthly" ? t("monthlySummary") : "Yearly Summary"}
          </ThemedText>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>🍺</ThemedText>
              <ThemedText style={styles.summaryLabel}>
                {t("totalDrinks")}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.totalDrinks} {t("drinks")}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>📊</ThemedText>
              <ThemedText style={styles.summaryLabel}>
                {t("averagePerDay")}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {summary.averagePerDay} {t("drinks")}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>
                {viewMode === "monthly" ? "🫠" : "🌪️"}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>
                {viewMode === "monthly" ? t("worstDay") : "Worst Month"}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {viewMode === "monthly"
                  ? (summary as MonthlySummary).worstDay.date
                    ? formatDate((summary as MonthlySummary).worstDay.date)
                    : t("never")
                  : (summary as YearlySummary).worstMonth.month || t("never")}
              </ThemedText>
            </View>

            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryEmoji}>
                {viewMode === "monthly" ? "🍷" : "💚"}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>
                {viewMode === "monthly" ? t("topDrinkType") : "Best Month"}
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {viewMode === "monthly"
                  ? ((summary as MonthlySummary).topDrinkType.type
                      ? (summary as MonthlySummary).topDrinkType.type
                          .charAt(0)
                          .toUpperCase() +
                        (summary as MonthlySummary).topDrinkType.type.slice(1)
                      : t("never")) +
                    " – " +
                    (summary as MonthlySummary).topDrinkType.count
                  : (summary as YearlySummary).bestMonth.month || t("never")}
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
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderContent}>
                <ThemedText style={styles.sectionHeaderText}>
                  {selectedDay.date.toLocaleDateString(
                    language === "fr" ? "fr-FR" : "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </ThemedText>
                {selectedDay && (
                  <TouchableOpacity
                    style={styles.liverScoreContainer}
                    onPress={() => setIsLiverDetailModalVisible(true)}
                  >
                    <Image
                      source={
                        liverImages[
                          selectedDay.liverState as keyof typeof liverImages
                        ]
                      }
                      style={styles.sectionLiverImage}
                      resizeMode="contain"
                    />
                    <ThemedText style={styles.liverScoreText}>
                      {selectedDay.healthScore ?? 100}/100
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.emptyStateContainer}>
              <ThemedText style={styles.noDrinksText}>
                {t("noDrinksLogged")}
              </ThemedText>
              {selectedDay && selectedDay.healthScore < 100 && (
                <ThemedText style={styles.liverRecoveringText}>
                  {t("liverRecovering")}
                </ThemedText>
              )}
            </View>
          </BottomSheetView>
        ) : (
          <BottomSheetSectionList
            style={styles.modalContent}
            sections={sectionData}
            keyExtractor={(item: DrinkLog) => item.id}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderContent}>
                  <ThemedText style={styles.sectionHeaderText}>
                    {section.title}
                  </ThemedText>
                  {selectedDay && (
                    <TouchableOpacity
                      style={styles.liverScoreContainer}
                      onPress={() => setIsLiverDetailModalVisible(true)}
                    >
                      <Image
                        source={
                          liverImages[
                            selectedDay.liverState as keyof typeof liverImages
                          ]
                        }
                        style={styles.sectionLiverImage}
                        resizeMode="contain"
                      />
                      <ThemedText style={styles.liverScoreText}>
                        {selectedDay.healthScore ?? 100}/100
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            renderItem={({ item }: { item: DrinkLog }) => {
              // Get drink type emoji and name
              const drinkEmojis = {
                beer: "🍺",
                wine: "🍷",
                cocktail: "🍹",
                spirits: "🥃",
                other: "🍺",
              };
              const drinkNames = {
                beer: t("beer"),
                wine: t("wine"),
                cocktail: t("cocktail"),
                spirits: t("spirits"),
                other: t("other"),
              };

              return (
                <View style={styles.drinkItem}>
                  <ThemedText style={styles.drinkIcon}>
                    {drinkEmojis[item.drink_type] || "🍺"}
                  </ThemedText>
                  <View style={styles.drinkDetails}>
                    <ThemedText style={styles.drinkName}>
                      {item.drink_name || drinkNames[item.drink_type]}
                    </ThemedText>
                    <ThemedText style={styles.drinkAmount}>
                      {formatDrinkAmount(
                        item.amount_cl,
                        userData?.preferred_unit || "cl"
                      )}{" "}
                      ({item.drink_option})
                    </ThemedText>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
        )}
      </BottomSheetModal>

      {/* Liver Detail Modal */}
      <Modal
        visible={isLiverDetailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLiverDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.miniModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("liverHealth")}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsLiverDetailModalVisible(false)}
              >
                <ThemedText style={styles.closeButtonText}>×</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {selectedDay && (
                <View style={styles.liverDetailContainer}>
                  <Image source={shadow} style={styles.shadow} />
                  <Image
                    source={
                      liverImages[
                        selectedDay.liverState as keyof typeof liverImages
                      ]
                    }
                    style={styles.liverDetailImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.liverDetailScoreText}>
                    {selectedDay.healthScore ?? 100}/100
                  </ThemedText>
                  <ThemedText style={styles.liverDetailText}>
                    {
                      getLocalizedLiverState(
                        getLiverStateByScore(selectedDay.healthScore),
                        t
                      ).description
                    }
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    textAlign: "center",
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
    width: 28,
    height: 28,
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
    backgroundColor: Colors.light.backgroundTint,
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
    backgroundColor: "rgba(0, 0, 0, 0.1)",
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
  miniModalContent: {
    width: Dimensions.get("window").width - 40,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  modalBody: {
    // maxHeight: 250,
    alignItems: "center",
    justifyContent: "center",
    // flex: 1,
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
  liverRecoveringText: {
    fontSize: 14,
    textAlign: "center",
    color: "#FF6B35",
    marginTop: 8,
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
  sectionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11181C",
  },
  liverScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionLiverImage: {
    width: 32,
    height: 32,
  },
  liverScoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  liverDetailText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  liverDetailContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  liverDetailImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  shadow: {
    width: 180,
    height: 180,
    top: 20,
    position: "absolute",
  },
  liverDetailScoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 16,
  },
  viewToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundTint,
  },
  viewToggleText: {
    fontSize: 16,
  },
  yearlyGrid: {
    gap: 8,
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  monthCell: {
    flex: 1,
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#efe6d2",
    minHeight: 80,
  },
  futureMonth: {
    opacity: 0.3,
  },
  monthName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 4,
  },
  monthDrinkCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
