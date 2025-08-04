import { drinkOptions, drinkTypes } from "@/constants/drinks";
import { DrinkOptionKey, DrinkTypeKey } from "@/types";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Drink logs table
export const drinkLogs = sqliteTable("drink_logs", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  drink_type: text("drink_type", {
    enum: drinkTypes as [DrinkTypeKey, ...DrinkTypeKey[]],
  }).notNull(),
  drink_option: text("drink_option", {
    enum: drinkOptions as [DrinkOptionKey, ...DrinkOptionKey[]],
  }).notNull(),
  drink_name: text("drink_name"), // Optional specific drink name
  amount_cl: real("amount_cl").notNull(), // Always stored in cl for consistency
  timestamp: text("timestamp").notNull(), // ISO string
  is_approximate: integer("is_approximate", { mode: "boolean" }).default(false),
  alcohol_percentage: real("alcohol_percentage"), // Optional, for more accurate calculations
  created_at: text("created_at").notNull(), // ISO string
  updated_at: text("updated_at"), // ISO string
});

// User table (for storing favorite drink, unit preferences, etc.)
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().unique(),
  favorite_drink_type: text("favorite_drink_type", {
    enum: drinkTypes as [DrinkTypeKey, ...DrinkTypeKey[]],
  }).default("beer"),
  favorite_drink_option: text("favorite_drink_option", {
    enum: drinkOptions as [DrinkOptionKey, ...DrinkOptionKey[]],
  }).default("can"),
  favorite_drink: text("favorite_drink"), // User's favorite drink name
  preferred_unit: text("preferred_unit", { enum: ["cl", "oz"] }).default("cl"),
  weekly_goal: integer("weekly_goal").default(7),
  weight_unit: text("weight_unit", { enum: ["kg", "lbs"] }).default("kg"),
  app_language: text("app_language", { enum: ["en", "fr"] }).default("en"),
  // New user profile fields
  age: integer("age"),
  weight_kg: real("weight_kg"),
  gender: text("gender", {
    enum: ["male", "female"],
  }),
  activity_level: text("activity_level", {
    enum: ["sedentary", "lightly_active", "moderately_active", "very_active"],
  }),
  drink_habits: text("drink_habits", {
    enum: ["rarely", "occasionally", "regularly", "frequently"],
  }),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
});

// Export types for use in the application
export type DrinkLog = typeof drinkLogs.$inferSelect;
export type NewDrinkLog = typeof drinkLogs.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
