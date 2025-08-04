import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { drinkLogs, user } from "./schema";
import { drinkOptions, drinkTypes } from "@/constants/drinks";

// Open the database
const sqlite = SQLite.openDatabaseSync("liverbuddy.db", {
  enableChangeListener: true,
});

// Create Drizzle instance
export const db = drizzle(sqlite, { schema: { drinkLogs, user } });

// Initialize database with tables
export const initDatabase = async () => {
  try {
    // Create tables if they don't exist
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS drink_logs (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        drink_type TEXT NOT NULL CHECK (drink_type IN (${drinkTypes.map(t => `'${t}'`).join(', ')})),
        drink_option TEXT NOT NULL CHECK (drink_option IN (${drinkOptions.map(o => `'${o}'`).join(', ')})),
        drink_name TEXT,
        amount_cl REAL NOT NULL,
        timestamp TEXT NOT NULL,
        is_approximate INTEGER DEFAULT 0,
        alcohol_percentage REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL UNIQUE,
        favorite_drink_type TEXT NOT NULL CHECK (favorite_drink_type IN (${drinkTypes.map(t => `'${t}'`).join(', ')})),
        favorite_drink_option TEXT NOT NULL CHECK (favorite_drink_option IN (${drinkOptions.map(o => `'${o}'`).join(', ')})),
        favorite_drink TEXT,
        preferred_unit TEXT DEFAULT 'cl' CHECK (preferred_unit IN ('cl', 'oz')),
        weekly_goal INTEGER DEFAULT 7,
        weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
        app_language TEXT DEFAULT 'en' CHECK (app_language IN ('en', 'fr')),
        age INTEGER,
        weight_kg REAL,
        gender TEXT CHECK (gender IN ('male', 'female')),
        activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
        drink_habits TEXT CHECK (drink_habits IN ('rarely', 'occasionally', 'regularly', 'frequently')),
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_drink_logs_user_id ON drink_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_drink_logs_timestamp ON drink_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_drink_logs_user_timestamp ON drink_logs(user_id, timestamp);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Export the SQLite instance for direct access if needed
export { sqlite };
