import { db } from "@/lib/database";
import { calculateMedicalHealthScore, calculateLiverHealth, DayLog } from "@/lib/database/calculations";
import { DrinkLog, drinkLogs, user } from "@/lib/database/schema";
import { useLanguage, useAccurate } from "@/stores/uiStore";
import { DrinkOptionKey, DrinkTypeKey, PreferredUnit, UserProfile } from "@/types";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

export interface UserData {
  id: string;
  name: string;
  healthScore: number;
  lastDrinkDate: string | null;
  lastDrinkTimestamp: string | null;
  weeklyGoal: number;
  weeklyDrinks: number;
  recentLogs: DrinkLog[];
  drinks: { [date: string]: DrinkLog[] };
  dailyHealthScores: { [date: string]: number };
  favorite_drink_type: DrinkTypeKey;
  favorite_drink_option: DrinkOptionKey;
  favorite_drink?: string;
  preferred_unit: PreferredUnit;
}

export const useUser = (userId: string = "local-user") => {
  const language = useLanguage();
  const accurateCalculations = useAccurate();

  // Get user preferences with live query
  const { data: preferencesData, error: preferencesError } = useLiveQuery(
    db.select().from(user).where(eq(user.user_id, userId)).limit(1)
  );

  // Get all drink logs with live query
  const { data: drinkLogsData, error: drinkLogsError } = useLiveQuery(
    db.select().from(drinkLogs).where(eq(drinkLogs.user_id, userId))
  );

  // Process the data when both queries are loaded
  const processUserData = (): UserData | null => {
    if (!preferencesData || !drinkLogsData) return null;

    // Get preferences with defaults
    const preferences = preferencesData.length > 0 ? preferencesData[0] : null;
    const allLogs = drinkLogsData || [];

    const defaultPreferences = {
      favorite_drink_type: "beer" as DrinkTypeKey,
      favorite_drink_option: "can" as DrinkOptionKey,
      favorite_drink: undefined,
      preferred_unit: (language === "en" ? "oz" : "ml") as PreferredUnit,
      weekly_goal: 7,
    };

    const userPrefs = preferences
      ? {
          favorite_drink_type:
            preferences.favorite_drink_type ||
            defaultPreferences.favorite_drink_type,
          favorite_drink_option:
            preferences.favorite_drink_option ||
            defaultPreferences.favorite_drink_option,
          favorite_drink:
            preferences.favorite_drink || defaultPreferences.favorite_drink,
          preferred_unit:
            (preferences.preferred_unit as PreferredUnit) ||
            defaultPreferences.preferred_unit,
          weekly_goal:
            preferences.weekly_goal || defaultPreferences.weekly_goal,
        }
      : defaultPreferences;

    // Group drinks by date
    const drinksByDate: { [date: string]: DrinkLog[] } = {};
    allLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const dateString = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!drinksByDate[dateString]) {
        drinksByDate[dateString] = [];
      }
      drinksByDate[dateString].push(log);
    });

    // Calculate daily health scores using selected algorithm (accurate or simple)
    const dailyHealthScores: { [date: string]: number } = {};

    // Default user profile for calculations (can be enhanced later with actual user data)
    const defaultUserProfile: UserProfile = {
      age: 30,
      weight_kg: 70,
      gender: "male",
      activity_level: "moderately_active",
      drink_habits: "occasionally"
    };

    // Prepare day logs for the calculation methods
    const dayLogs: DayLog[] = [];
    // Create day logs for the last 30 days for context in calculations
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = `${checkDate.getFullYear()}-${String(
        checkDate.getMonth() + 1
      ).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      
      dayLogs.push({
        date: checkDate,
        drinks: drinksByDate[dateString] || []
      });
    }

    // Calculate scores for all recent days (last 30 days)
    const currentDate = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      const dateString = `${checkDate.getFullYear()}-${String(
        checkDate.getMonth() + 1
      ).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

      let score: number;
      
      console.log(`Calculating for ${dateString}, accurateCalculations: ${accurateCalculations}`);
      
      if (accurateCalculations) {
        // Use existing accurate calculation method (legacy medical health score)
        score = calculateMedicalHealthScore(allLogs, dateString);
      } else {
        // Use new simple calculation method
        const liverHealth = calculateLiverHealth(dayLogs, defaultUserProfile, checkDate, false);
        score = liverHealth.daily_score * 10; // Convert 0-10 scale to 0-100 for display
      }
      
      dailyHealthScores[dateString] = score;

      const drinkCount = drinksByDate[dateString]?.length || 0;
      if (drinkCount > 0) {
        console.log(`Health score for ${dateString}: ${score} (${drinkCount} drinks) - Mode: ${accurateCalculations ? 'Accurate' : 'Simple'}`);
      }
    }

    // Get recent logs (last 3 days)
    const recentLogs = allLogs
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 3);

    // Get last drink date
    const lastDrinkDate =
      allLogs.length > 0
        ? (() => {
            const date = new Date(allLogs[0].timestamp);
            return `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          })()
        : null;
    const lastDrinkTimestamp = allLogs.length > 0 ? allLogs[0].timestamp : null;

    // Calculate weekly drinks
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    let weeklyCount = 0;
    Object.entries(drinksByDate).forEach(([date, dayLogs]) => {
      const drinkDate = new Date(date);
      if (drinkDate >= weekAgo && drinkDate <= today) {
        weeklyCount += dayLogs.length;
      }
    });

    // Calculate overall health score (simplified and accurate)
    const recentScores = Object.entries(dailyHealthScores)
      .filter(([date]) => {
        const scoreDate = new Date(date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return scoreDate >= thirtyDaysAgo;
      })
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()) // Most recent first
      .map(([date, score], index) => ({ date, score, daysAgo: index }));

    // Calculate weighted average with exponential decay for recent days
    let healthScore: number;

    if (recentScores.length === 0) {
      healthScore = 100;
    } else {
      let weightedSum = 0;
      let totalWeight = 0;

      recentScores.forEach(({ score, daysAgo }) => {
        // Exponential decay: recent days have much higher weight
        const weight = Math.exp(-daysAgo * 0.1); // 0.1 is decay factor
        weightedSum += score * weight;
        totalWeight += weight;
      });

      healthScore = Math.round(weightedSum / totalWeight);
    }

    return {
      id: userId,
      name: "User",
      healthScore,
      lastDrinkDate,
      lastDrinkTimestamp,
      weeklyGoal: userPrefs.weekly_goal,
      weeklyDrinks: weeklyCount,
      recentLogs,
      drinks: drinksByDate,
      dailyHealthScores,
      favorite_drink_type: userPrefs.favorite_drink_type,
      favorite_drink_option: userPrefs.favorite_drink_option,
      favorite_drink: userPrefs.favorite_drink,
      preferred_unit: userPrefs.preferred_unit,
    };
  };

  const userData = processUserData();

  // More precise loading state
  const isLoading =
    preferencesData === undefined || drinkLogsData === undefined;
  const error = preferencesError || drinkLogsError;

  return {
    userData,
    isLoading,
    error,
  };
};
