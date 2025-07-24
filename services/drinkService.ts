import { db } from "@/lib/database";
import {
  calculateAlcoholUnits,
  calculateDailyConsumption,
  calculateDrinkStatistics,
  calculateWeeklyConsumption,
} from "@/lib/database/calculations";
import { drinkLogs, type DrinkLog } from "@/lib/database/schema";
import { DrinkOptionKey, DrinkTypeKey } from "@/types";
import { validateDrinkLog } from "@/utils/drinks";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import * as Crypto from "expo-crypto";

export interface CreateDrinkLogData {
  drink_type: DrinkTypeKey;
  drink_option: DrinkOptionKey;
  drink_name?: string; // Optional specific drink name
  amount_ml: number; // Always in mL
  timestamp?: string;
  is_approximate?: boolean;
  alcohol_percentage?: number;
}

export interface DrinkLogWithCalculations extends DrinkLog {
  amount_ml: number;
  amount_oz: number;
  alcohol_units: number;
}

export interface DailyConsumption {
  total_ml: number;
  total_oz: number;
  total_alcohol_units: number;
  drink_count: number;
}

export interface WeeklyConsumption {
  date: string;
  total_ml: number;
  total_oz: number;
  total_alcohol_units: number;
  drink_count: number;
}

// Create a new drink log
export const createDrinkLog = async (
  data: CreateDrinkLogData
): Promise<DrinkLog | null> => {
  try {
    // Validate the data
    const validation = validateDrinkLog(data);
    if (!validation.valid) {
      console.error("Invalid drink log data:", validation.errors);
      throw new Error(
        `Invalid drink log data: ${validation.errors.join(", ")}`
      );
    }

    const newDrinkLog = {
      id: Crypto.randomUUID(),
      user_id: "local-user", // TODO: Get from auth context
      drink_type: data.drink_type,
      drink_option: data.drink_option,
      drink_name: data.drink_name,
      amount_ml: data.amount_ml,
      timestamp: data.timestamp || new Date().toISOString(),
      is_approximate: data.is_approximate || false,
      alcohol_percentage: data.alcohol_percentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await db.insert(drinkLogs).values(newDrinkLog).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error in createDrinkLog:", error);
    throw error;
  }
};

// Get drink logs for a user with calculations
export const getDrinkLogs = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<DrinkLogWithCalculations[]> => {
  try {
    const conditions = [eq(drinkLogs.user_id, userId)];

    if (startDate) {
      conditions.push(gte(drinkLogs.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(drinkLogs.timestamp, endDate));
    }

    const logs = await db
      .select()
      .from(drinkLogs)
      .where(and(...conditions))
      .orderBy(desc(drinkLogs.timestamp));

    // Add calculated fields
    return logs.map((log) => ({
      ...log,
      amount_ml: log.amount_ml,
      amount_oz: log.amount_ml * 0.033814,
      alcohol_units: calculateAlcoholUnits(log),
    }));
  } catch (error) {
    console.error("Error in getDrinkLogs:", error);
    throw error;
  }
};

// Get drink logs for a specific date
export const getDrinkLogsForDate = async (
  userId: string,
  date: string
): Promise<DrinkLogWithCalculations[]> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await getDrinkLogs(
      userId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );
  } catch (error) {
    console.error("Error in getDrinkLogsForDate:", error);
    throw error;
  }
};

// Get daily alcohol consumption
export const getDailyConsumption = async (
  userId: string,
  date: string = new Date().toISOString().split("T")[0]
): Promise<DailyConsumption> => {
  try {
    const logs = await getDrinkLogs(userId);
    return calculateDailyConsumption(logs, date);
  } catch (error) {
    console.error("Error in getDailyConsumption:", error);
    throw error;
  }
};

// Get weekly alcohol consumption
export const getWeeklyConsumption = async (
  userId: string,
  startDate?: string
): Promise<WeeklyConsumption[]> => {
  try {
    const logs = await getDrinkLogs(userId);
    const start =
      startDate ||
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    return calculateWeeklyConsumption(logs, start);
  } catch (error) {
    console.error("Error in getWeeklyConsumption:", error);
    throw error;
  }
};

// Update a drink log
export const updateDrinkLog = async (
  logId: string,
  updates: Partial<CreateDrinkLogData>
): Promise<DrinkLog | null> => {
  try {
    // Validate the updates
    const validation = validateDrinkLog(updates);
    if (!validation.valid) {
      console.error("Invalid drink log updates:", validation.errors);
      throw new Error(
        `Invalid drink log updates: ${validation.errors.join(", ")}`
      );
    }

    const result = await db
      .update(drinkLogs)
      .set({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .where(eq(drinkLogs.id, logId))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error in updateDrinkLog:", error);
    throw error;
  }
};

// Delete a drink log
export const deleteDrinkLog = async (logId: string): Promise<void> => {
  try {
    await db.delete(drinkLogs).where(eq(drinkLogs.id, logId));
  } catch (error) {
    console.error("Error in deleteDrinkLog:", error);
    throw error;
  }
};

// Get drink statistics for a user
export const getDrinkStatistics = async (
  userId: string,
  days: number = 30
): Promise<{
  totalDrinks: number;
  totalAlcoholUnits: number;
  averageDailyUnits: number;
  mostCommonType: DrinkTypeKey | null;
  streakDays: number;
}> => {
  try {
    const logs = await getDrinkLogs(userId);
    return calculateDrinkStatistics(logs, days);
  } catch (error) {
    console.error("Error in getDrinkStatistics:", error);
    throw error;
  }
};

// Bulk create drink logs (for "last night" mode)
export const createBulkDrinkLogs = async (
  userId: string,
  drinkCount: number,
  timestamp: string,
  isApproximate: boolean = true
): Promise<DrinkLog[]> => {
  try {
    const bulkDrinkLogs = Array.from({ length: drinkCount }, (_, index) => ({
      id: Crypto.randomUUID(),
      user_id: userId,
      drink_type: "other" as DrinkTypeKey,
      drink_option: "standard" as DrinkOptionKey,
      amount_ml: 200, // Default amount for bulk drinks
      timestamp,
      is_approximate: isApproximate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const result = await db.insert(drinkLogs).values(bulkDrinkLogs).returning();
    return result;
  } catch (error) {
    console.error("Error in createBulkDrinkLogs:", error);
    throw error;
  }
};
