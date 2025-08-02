import { db } from "@/lib/database";
import { user } from "@/lib/database/schema";
import { DrinkOptionKey, DrinkTypeKey, PreferredUnit } from "@/types";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";

export interface UserPreferences {
  favorite_drink_type: DrinkTypeKey;
  favorite_drink_option: DrinkOptionKey;
  favorite_drink?: string;
  preferred_unit: PreferredUnit;
  weekly_goal: number;
  weight_unit?: "kg" | "lbs";
  app_language?: "en" | "fr";
  // New user profile fields
  age?: number;
  weight_kg?: number;
  gender?: "male" | "female";
  activity_level?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active";
  drink_habits?: "rarely" | "occasionally" | "regularly" | "frequently";
}

// Get user preferences
export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.user_id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const prefs = result[0];
    return {
      favorite_drink_type: prefs.favorite_drink_type || "beer",
      favorite_drink_option: prefs.favorite_drink_option || "can",
      favorite_drink: prefs.favorite_drink || undefined,
      preferred_unit: (prefs.preferred_unit as PreferredUnit) || "ml",
      weekly_goal: prefs.weekly_goal || 7,
      weight_unit: (prefs.weight_unit as "kg" | "lbs") || "kg",
      app_language: (prefs.app_language as "en" | "fr") || "en",
      // New user profile fields
      age: prefs.age || undefined,
      weight_kg: prefs.weight_kg || undefined,
      gender: (prefs.gender as UserPreferences["gender"]) || undefined,
      activity_level:
        (prefs.activity_level as UserPreferences["activity_level"]) ||
        undefined,
      drink_habits:
        (prefs.drink_habits as UserPreferences["drink_habits"]) || undefined,
    };
  } catch (error) {
    console.error("Error getting user preferences:", error);
    throw error;
  }
};

// Create or update user preferences
export const upsertUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> => {
  try {
    const existing = await getUserPreferences(userId);

    if (existing) {
      // Update existing preferences
      const result = await db
        .update(user)
        .set({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .where(eq(user.user_id, userId))
        .returning();

      const updated = result[0];
      return {
        favorite_drink_type: updated.favorite_drink_type || "beer",
        favorite_drink_option: updated.favorite_drink_option || "can",
        favorite_drink: updated.favorite_drink || undefined,
        preferred_unit: preferences.preferred_unit || "ml",
        weekly_goal: updated.weekly_goal || 7,
        weight_unit: (updated.weight_unit as "kg" | "lbs") || "kg",
        app_language: (updated.app_language as "en" | "fr") || "en",
        age: updated.age || undefined,
        weight_kg: updated.weight_kg || undefined,
        gender: updated.gender as UserPreferences["gender"],
        activity_level: updated.activity_level as UserPreferences["activity_level"],
        drink_habits: updated.drink_habits as UserPreferences["drink_habits"],
      };
    } else {
      // Create new preferences
      const newPrefs = {
        id: Crypto.randomUUID(),
        user_id: userId,
        favorite_drink_type: preferences.favorite_drink_type || "beer",
        favorite_drink_option: preferences.favorite_drink_option || "can",
        favorite_drink: preferences.favorite_drink,
        preferred_unit: preferences.preferred_unit || "ml",
        weekly_goal: preferences.weekly_goal || 7,
        weight_unit: preferences.weight_unit || "kg",
        app_language: preferences.app_language || "en",
        age: preferences.age,
        weight_kg: preferences.weight_kg,
        gender: preferences.gender,
        activity_level: preferences.activity_level,
        drink_habits: preferences.drink_habits,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await db.insert(user).values(newPrefs).returning();
      const created = result[0];

      return {
        favorite_drink_type: created.favorite_drink_type || "beer",
        favorite_drink_option: created.favorite_drink_option || "can",
        favorite_drink: created.favorite_drink || undefined,
        preferred_unit: (created.preferred_unit as PreferredUnit) || "ml",
        weekly_goal: created.weekly_goal || 7,
        weight_unit: (created.weight_unit as "kg" | "lbs") || "kg",
        app_language: (created.app_language as "en" | "fr") || "en",
        age: created.age || undefined,
        weight_kg: created.weight_kg || undefined,
        gender: created.gender as UserPreferences["gender"],
        activity_level: created.activity_level as UserPreferences["activity_level"],
        drink_habits: created.drink_habits as UserPreferences["drink_habits"],
      };
    }
  } catch (error) {
    console.error("Error upserting user preferences:", error);
    throw error;
  }
};

// Update preferred drink type
export const updatePreferredDrinkType = async (
  userId: string,
  drinkType: DrinkTypeKey
): Promise<void> => {
  try {
    await upsertUserPreferences(userId, { favorite_drink_type: drinkType });
  } catch (error) {
    console.error("Error updating preferred drink type:", error);
    throw error;
  }
};

// Update preferred drink option
export const updatePreferredDrinkOption = async (
  userId: string,
  drinkOption: DrinkOptionKey
): Promise<void> => {
  try {
    await upsertUserPreferences(userId, {
      favorite_drink_option: drinkOption,
    });
  } catch (error) {
    console.error("Error updating preferred drink option:", error);
    throw error;
  }
};

// Update favorite drink
export const updateFavoriteDrink = async (
  userId: string,
  favoriteDrink: string
): Promise<void> => {
  try {
    await upsertUserPreferences(userId, { favorite_drink: favoriteDrink });
  } catch (error) {
    console.error("Error updating favorite drink:", error);
    throw error;
  }
};

// Update preferred unit
export const updatePreferredUnit = async (
  userId: string,
  unit: PreferredUnit
): Promise<void> => {
  try {
    await upsertUserPreferences(userId, { preferred_unit: unit });
  } catch (error) {
    console.error("Error updating preferred unit:", error);
    throw error;
  }
};

// Update weekly goal
export const updateWeeklyGoal = async (
  userId: string,
  goal: number
): Promise<void> => {
  try {
    await upsertUserPreferences(userId, { weekly_goal: goal });
  } catch (error) {
    console.error("Error updating weekly goal:", error);
    throw error;
  }
};
