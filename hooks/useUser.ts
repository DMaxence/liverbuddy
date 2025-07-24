import { db } from "@/lib/database";
import {
  calculateDailyConsumption,
  calculateDrinkStatistics,
} from "@/lib/database/calculations";
import { DrinkLog, drinkLogs, userPreferences } from "@/lib/database/schema";
import { DrinkOptionKey, DrinkTypeKey, PreferredUnit } from "@/types";
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
  preferred_drink_type: DrinkTypeKey;
  preferred_drink_option: DrinkOptionKey;
  favorite_drink?: string;
  preferred_unit: PreferredUnit;
}

export const useUser = (userId: string = "local-user") => {
  // Get user preferences with live query
  const { data: preferencesData, error: preferencesError } = useLiveQuery(
    db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.user_id, userId))
      .limit(1)
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
      preferred_drink_type: "beer" as DrinkTypeKey,
      preferred_drink_option: "can" as DrinkOptionKey,
      favorite_drink: undefined,
      preferred_unit: "ml" as PreferredUnit,
      weekly_goal: 7,
    };

    const userPrefs = preferences
      ? {
          preferred_drink_type:
            preferences.preferred_drink_type ||
            defaultPreferences.preferred_drink_type,
          preferred_drink_option:
            preferences.preferred_drink_option ||
            defaultPreferences.preferred_drink_option,
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

    // Calculate daily health scores
    const dailyHealthScores: { [date: string]: number } = {};
    Object.entries(drinksByDate).forEach(([date, dayLogs]) => {
      const consumption = calculateDailyConsumption(allLogs, date);
      // Calculate health score based on alcohol units
      let healthScore = 100;
      if (consumption.total_alcohol_units > 8)
        healthScore = 20; // Very heavy drinking
      else if (consumption.total_alcohol_units > 6)
        healthScore = 35; // Heavy drinking
      else if (consumption.total_alcohol_units > 4)
        healthScore = 50; // Moderate-heavy drinking
      else if (consumption.total_alcohol_units > 2)
        healthScore = 65; // Moderate drinking
      else if (consumption.total_alcohol_units > 1)
        healthScore = 80; // Light drinking
      else if (consumption.total_alcohol_units > 0) healthScore = 90; // Very light drinking

      dailyHealthScores[date] = healthScore;
    });

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

    // Calculate overall health score
    const stats = calculateDrinkStatistics(allLogs, 30);
    const healthScore = Math.max(
      0,
      Math.min(100, 100 - stats.averageDailyUnits * 10)
    );

    return {
      id: userId,
      name: "User", // TODO: Get from user profile
      healthScore,
      lastDrinkDate,
      lastDrinkTimestamp,
      weeklyGoal: userPrefs.weekly_goal,
      weeklyDrinks: weeklyCount,
      recentLogs,
      drinks: drinksByDate,
      dailyHealthScores,
      preferred_drink_type: userPrefs.preferred_drink_type,
      preferred_drink_option: userPrefs.preferred_drink_option,
      favorite_drink: userPrefs.favorite_drink,
      preferred_unit: userPrefs.preferred_unit,
    };
  };

  const userData = processUserData();

  // More precise loading state - check if data is actually loaded
  const isLoading =
    preferencesData === undefined || drinkLogsData === undefined;
  const error = preferencesError || drinkLogsError;

  return {
    userData,
    isLoading,
    error,
  };
};
