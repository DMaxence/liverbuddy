import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { drinkLogs, userPreferences } from "./schema";

// Open the database
const sqlite = SQLite.openDatabaseSync("liverbuddy.db");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema: { drinkLogs, userPreferences } });

// Initialize database with tables
export const initDatabase = async () => {
  try {
    // Create tables if they don't exist
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS drink_logs (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        drink_type TEXT NOT NULL CHECK (drink_type IN ('beer', 'wine', 'cocktail', 'spirits', 'other')),
        drink_option TEXT NOT NULL,
        drink_name TEXT,
        amount_ml REAL NOT NULL,
        timestamp TEXT NOT NULL,
        is_approximate INTEGER DEFAULT 0,
        alcohol_percentage REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL UNIQUE,
        preferred_drink_type TEXT NOT NULL CHECK (preferred_drink_type IN ('beer', 'wine', 'cocktail', 'spirits', 'other')),
        preferred_drink_option TEXT NOT NULL CHECK (preferred_drink_option IN ('can', 'bottle', 'pint', 'large', 'glass', 'large_glass', 'standard', 'strong', 'double', 'shot', 'tall', 'small', 'medium', 'extra_large')),
        favorite_drink TEXT,
        preferred_unit TEXT DEFAULT 'ml' CHECK (preferred_unit IN ('ml', 'oz')),
        weekly_goal INTEGER DEFAULT 7,
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
