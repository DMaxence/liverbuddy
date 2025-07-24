import {
  calculateDailyConsumption,
  calculateDrinkStatistics,
} from "@/lib/database/calculations";
import { DrinkLog } from "@/lib/database/schema";
import { DrinkOptionKey, DrinkTypeKey, PreferredUnit } from "@/types";
import { getDrinkLogs } from "./drinkService";
import { getUserPreferences } from "./userPreferencesService";

export interface UserData {
  id: string;
  name: string;
  healthScore: number;
  lastDrinkDate: string | null;
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

// Get user data from local database
export const getUserData = async (userId: string): Promise<UserData> => {
  try {
    // Get user preferences
    const preferences = (await getUserPreferences(userId)) || {
      preferred_drink_type: "beer" as DrinkTypeKey,
      preferred_drink_option: "can" as DrinkOptionKey,
      favorite_drink: undefined,
      preferred_unit: "ml",
      weekly_goal: 7,
    };

    // Get all drink logs
    const allLogs = await getDrinkLogs(userId);

    // Group drinks by date
    const drinksByDate: { [date: string]: DrinkLog[] } = {};
    allLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          })()
        : null;

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
      weeklyGoal: preferences.weekly_goal,
      weeklyDrinks: weeklyCount,
      recentLogs,
      drinks: drinksByDate,
      dailyHealthScores,
      preferred_drink_type: preferences.preferred_drink_type,
      preferred_drink_option: preferences.preferred_drink_option,
      favorite_drink: preferences.favorite_drink,
      preferred_unit: preferences.preferred_unit,
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    // Return default data if there's an error
    return {
      id: userId,
      name: "User",
      healthScore: 100,
      lastDrinkDate: null,
      weeklyGoal: 7,
      weeklyDrinks: 0,
      recentLogs: [],
      drinks: {},
      dailyHealthScores: {},
      preferred_drink_type: "beer" as DrinkTypeKey,
      preferred_drink_option: "can" as DrinkOptionKey,
      favorite_drink: undefined,
      preferred_unit: "ml" as PreferredUnit,
    };
  }
};

// Get user data with caching (for performance)
let cachedUserData: UserData | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedUserData = async (userId: string): Promise<UserData> => {
  const now = Date.now();

  if (cachedUserData && now - lastCacheTime < CACHE_DURATION) {
    return cachedUserData;
  }

  cachedUserData = await getUserData(userId);
  lastCacheTime = now;
  return cachedUserData;
};

// Clear cache (call this when data changes)
export const clearUserDataCache = () => {
  cachedUserData = null;
  lastCacheTime = 0;
};
