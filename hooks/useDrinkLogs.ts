import { drinkLogs } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const useDrinkLogs = (userId: string = "local-user") => {
  const expo = openDatabaseSync("liverbuddy.db", {
    enableChangeListener: true,
  });
  const db = drizzle(expo);

  const { data, error } = useLiveQuery(
    db.select().from(drinkLogs).where(eq(drinkLogs.user_id, userId))
  );

  return {
    data,
    error,
  };
};
