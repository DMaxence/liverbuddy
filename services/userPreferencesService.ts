import { db } from "@/lib/database";
import { userPreferences } from "@/lib/database/schema";
import { DrinkOptionKey, DrinkTypeKey, PreferredUnit } from "@/types";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";

export interface UserPreferences {
  preferred_drink_type: DrinkTypeKey;
  preferred_drink_option: DrinkOptionKey;
  favorite_drink?: string;
  preferred_unit: PreferredUnit;
  weekly_goal: number;
}

// Get user preferences
export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.user_id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const prefs = result[0];
    return {
      preferred_drink_type: prefs.preferred_drink_type || "beer",
      preferred_drink_option: prefs.preferred_drink_option || "can",
      favorite_drink: prefs.favorite_drink || undefined,
      preferred_unit: (prefs.preferred_unit as PreferredUnit) || "ml",
      weekly_goal: prefs.weekly_goal || 7,
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
        .update(userPreferences)
        .set({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .where(eq(userPreferences.user_id, userId))
        .returning();

      const updated = result[0];
      return {
        preferred_drink_type: updated.preferred_drink_type || "beer",
        preferred_drink_option: updated.preferred_drink_option || "can",
        favorite_drink: updated.favorite_drink || undefined,
        preferred_unit: preferences.preferred_unit || "ml",
        weekly_goal: updated.weekly_goal || 7,
      };
    } else {
      // Create new preferences
      const newPrefs = {
        id: Crypto.randomUUID(),
        user_id: userId,
        preferred_drink_type: preferences.preferred_drink_type || "beer",
        preferred_drink_option: preferences.preferred_drink_option || "can",
        favorite_drink: preferences.favorite_drink,
        preferred_unit: preferences.preferred_unit || "ml",
        weekly_goal: preferences.weekly_goal || 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await db
        .insert(userPreferences)
        .values(newPrefs)
        .returning();
      const created = result[0];

      return {
        preferred_drink_type: created.preferred_drink_type || "beer",
        preferred_drink_option: created.preferred_drink_option || "can",
        favorite_drink: created.favorite_drink || undefined,
        preferred_unit: (created.preferred_unit as PreferredUnit) || "ml",
        weekly_goal: created.weekly_goal || 7,
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
    await upsertUserPreferences(userId, { preferred_drink_type: drinkType });
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
      preferred_drink_option: drinkOption,
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
