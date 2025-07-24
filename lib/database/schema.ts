import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

// Drink logs table
export const drinkLogs = sqliteTable("drink_logs", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  drink_type: text("drink_type", {
    enum: ["beer", "wine", "cocktail", "spirits", "other"],
  }).notNull(),
  drink_option: text("drink_option").notNull(),
  drink_name: text("drink_name"), // Optional specific drink name
  amount_ml: real("amount_ml").notNull(), // Always stored in mL for consistency
  timestamp: text("timestamp").notNull(), // ISO string
  is_approximate: integer("is_approximate", { mode: "boolean" }).default(false),
  alcohol_percentage: real("alcohol_percentage"), // Optional, for more accurate calculations
  created_at: text("created_at").notNull(), // ISO string
  updated_at: text("updated_at"), // ISO string
});

// User preferences table (for storing favorite drink, unit preferences, etc.)
export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().unique(),
  preferred_drink_type: text("preferred_drink_type", {
    enum: ["beer", "wine", "cocktail", "spirits", "other"],
  }).default("beer"),
  preferred_drink_option: text("preferred_drink_option", {
    enum: [
      "can",
      "bottle",
      "pint",
      "large",
      "glass",
      "large_glass",
      "standard",
      "strong",
      "double",
      "shot",
      "tall",
      "small",
      "medium",
      "extra_large",
    ],
  }).default("can"),
  favorite_drink: text("favorite_drink"), // User's favorite drink name
  preferred_unit: text("preferred_unit", { enum: ["ml", "oz"] }).default("ml"),
  weekly_goal: integer("weekly_goal").default(7),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
});

// Export types for use in the application
export type DrinkLog = typeof drinkLogs.$inferSelect;
export type NewDrinkLog = typeof drinkLogs.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
