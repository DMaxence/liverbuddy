import { getDeviceLanguage, getTranslation } from "@/constants/localization";
import { UserData } from "@/services/userDataService";

import { DrinkOptionKey, DrinkTypeKey } from "@/types";
import { getDrinkTypeEmoji } from "./drinks";

export interface DrinkLog {
  id: string;
  type: "beer" | "wine" | "cocktail" | "custom";
  name: string;
  amount: number;
  unit: string;
  timestamp: string;
  emoji: string;
}

// export interface UserData {
//   id: string;
//   name: string;
//   healthScore: number;
//   lastDrinkDate: string | null;
//   weeklyGoal: number;
//   weeklyDrinks: number;
//   recentLogs: DrinkLog[];
//   drinks: { [date: string]: DrinkLog[] };
//   dailyHealthScores: { [date: string]: number };
//   preferred_drink_type: DrinkTypeKey;
//   preferred_drink_option: DrinkOptionKey;
//   favorite_drink?: string; // User's favorite drink name
// }

const generateRandomHealthScore = () => {
  return Math.floor(Math.random() * 100);
};

// Drink types with their properties (using new system)
const drinkTypes = [
  {
    type: "beer" as DrinkTypeKey,
    option: "can" as DrinkOptionKey,
    name: "Beer",
    amount: 330,
    unit: "ml",
    emoji: "🍺",
  },
  {
    type: "beer" as DrinkTypeKey,
    option: "bottle" as DrinkOptionKey,
    name: "IPA",
    amount: 500,
    unit: "ml",
    emoji: "🍺",
  },
  {
    type: "wine" as DrinkTypeKey,
    option: "glass" as DrinkOptionKey,
    name: "Red Wine",
    amount: 5,
    unit: "oz",
    emoji: "🍷",
  },
  {
    type: "wine" as DrinkTypeKey,
    option: "glass" as DrinkOptionKey,
    name: "White Wine",
    amount: 5,
    unit: "oz",
    emoji: "🍷",
  },
  {
    type: "wine" as DrinkTypeKey,
    option: "glass" as DrinkOptionKey,
    name: "Rosé",
    amount: 5,
    unit: "oz",
    emoji: "🍷",
  },
  {
    type: "cocktail" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Margarita",
    amount: 1,
    unit: "drink",
    emoji: "🍹",
  },
  {
    type: "cocktail" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Mojito",
    amount: 1,
    unit: "drink",
    emoji: "🍹",
  },
  {
    type: "cocktail" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Martini",
    amount: 1,
    unit: "drink",
    emoji: "🍸",
  },
  {
    type: "cocktail" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Negroni",
    amount: 1,
    unit: "drink",
    emoji: "🍸",
  },
  {
    type: "cocktail" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Old Fashioned",
    amount: 1,
    unit: "drink",
    emoji: "🥃",
  },
  {
    type: "spirits" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Whiskey",
    amount: 1.5,
    unit: "oz",
    emoji: "🥃",
  },
  {
    type: "spirits" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Vodka",
    amount: 1.5,
    unit: "oz",
    emoji: "🥃",
  },
  {
    type: "spirits" as DrinkTypeKey,
    option: "standard" as DrinkOptionKey,
    name: "Gin",
    amount: 1.5,
    unit: "oz",
    emoji: "🥃",
  },
];

// Generate random drinks for the past 40 days
const generateDrinksForPastDays = (
  days: number = 40
): { [date: string]: DrinkLog[] } => {
  const drinks: { [date: string]: DrinkLog[] } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // 70% chance of having drinks on any given day
    if (Math.random() < 0.7) {
      const numDrinks = Math.floor(Math.random() * 6) + 1; // 1-6 drinks
      const dayDrinks: DrinkLog[] = [];

      for (let j = 0; j < numDrinks; j++) {
        const drinkType =
          drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
        const hour = Math.floor(Math.random() * 8) + 16; // 4 PM to 12 AM
        const minute = Math.floor(Math.random() * 60);

        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

        // Ensure timestamp is not in the future
        if (timestamp <= new Date()) {
          dayDrinks.push({
            id: `${dateString}-${j}`,
            type: drinkType.type as "beer" | "wine" | "cocktail" | "custom",
            name: drinkType.name,
            amount: drinkType.amount,
            unit: drinkType.unit,
            timestamp: timestamp.toISOString(),
            emoji: drinkType.emoji,
          });
        }
      }

      // Only add the day if we have drinks and they're not in the future
      if (dayDrinks.length > 0) {
        drinks[dateString] = dayDrinks;
      }
    }
  }

  return drinks;
};

// Generate health scores based on drink consumption
const generateHealthScoresFromDrinks = (drinks: {
  [date: string]: DrinkLog[];
}): { [date: string]: number } => {
  const healthScores: { [date: string]: number } = {};

  Object.entries(drinks).forEach(([date, dayDrinks]) => {
    const totalAmount = dayDrinks.reduce((sum, drink) => {
      // Convert all to mL for comparison
      if (drink.unit === "oz") {
        return sum + drink.amount * 29.5735; // Convert oz to mL
      }
      return sum + drink.amount;
    }, 0);

    // Calculate health score based on total alcohol consumption
    let healthScore = 100;
    if (totalAmount > 1000) healthScore = 20; // Very heavy drinking
    else if (totalAmount > 750) healthScore = 35; // Heavy drinking
    else if (totalAmount > 500) healthScore = 50; // Moderate-heavy drinking
    else if (totalAmount > 250) healthScore = 65; // Moderate drinking
    else if (totalAmount > 100) healthScore = 80; // Light drinking
    else if (totalAmount > 0) healthScore = 90; // Very light drinking

    // Add some randomness
    healthScore += Math.floor(Math.random() * 10) - 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    healthScores[date] = healthScore;
  });

  return healthScores;
};

// Generate the drinks data
const generatedDrinks = generateDrinksForPastDays(40);
const generatedHealthScores = generateHealthScoresFromDrinks(generatedDrinks);

// Get recent logs (last 3 days with drinks)
const getRecentLogs = (drinks: { [date: string]: DrinkLog[] }): DrinkLog[] => {
  const allDrinks: DrinkLog[] = [];
  Object.values(drinks).forEach((dayDrinks) => {
    allDrinks.push(...dayDrinks);
  });

  // Sort by timestamp and get the most recent
  return allDrinks
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 3);
};

// Get last drink date
const getLastDrinkDate = (drinks: {
  [date: string]: DrinkLog[];
}): string | null => {
  const dates = Object.keys(drinks).sort().reverse();
  return dates.length > 0 ? dates[0] : null;
};

// Calculate weekly drinks
const getWeeklyDrinks = (drinks: { [date: string]: DrinkLog[] }): number => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  let weeklyCount = 0;
  Object.entries(drinks).forEach(([date, dayDrinks]) => {
    const drinkDate = new Date(date);
    if (drinkDate >= weekAgo && drinkDate <= today) {
      weeklyCount += dayDrinks.length;
    }
  });

  return weeklyCount;
};

// Mock user data
export const mockUserData: UserData = {
  id: "1",
  name: "Alex",
  healthScore: generateRandomHealthScore(),
  lastDrinkDate: getLastDrinkDate(generatedDrinks),
  weeklyGoal: 7,
  weeklyDrinks: getWeeklyDrinks(generatedDrinks),
  recentLogs: getRecentLogs(generatedDrinks),
  drinks: generatedDrinks,
  dailyHealthScores: generatedHealthScores,
  preferred_drink_type: "beer" as DrinkTypeKey,
  preferred_drink_option: "pint" as DrinkOptionKey,
  favorite_drink: "IPA", // User's favorite drink name
};

// Helper functions
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  const language = getDeviceLanguage();

  if (hour < 12) return getTranslation("morning", language);
  if (hour < 17) return getTranslation("afternoon", language);
  return getTranslation("evening", language);
};

export const formatDate = (date: Date, lang?: string): string => {
  const language = lang || getDeviceLanguage();
  return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  const language = getDeviceLanguage();

  if (diffInHours < 24) {
    if (diffInHours < 1) return getTranslation("justNow", language);
    if (diffInHours === 1) return `1 ${getTranslation("hourAgo", language)}`;
    return `${diffInHours} ${getTranslation("hoursAgo", language)}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return getTranslation("yesterday", language);
  if (diffInDays < 7)
    return `${diffInDays} ${getTranslation("daysAgo", language)}`;

  return formatDate(date);
};

export const formatTime = (timestamp: string, lang?: string): string => {
  const date = new Date(timestamp);
  const language = lang || getDeviceLanguage();
  return date.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getDaysSinceLastDrink = (lastDrinkDate: string | null): number => {
  if (!lastDrinkDate) return 0;

  const now = new Date();
  const lastDrink = new Date(lastDrinkDate);

  // Get local dates (year, month, day) to compare only the date part
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDrinkLocalDate = new Date(
    lastDrink.getFullYear(),
    lastDrink.getMonth(),
    lastDrink.getDate()
  );

  // Calculate difference in days
  const diffInMs = nowDate.getTime() - lastDrinkLocalDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays;
};

export const getQuickAddButtonText = (
  userData: UserData | null
): { text: string; mode: "normal" | "lastNight" } => {
  const hour = new Date().getHours();
  const language = getDeviceLanguage();

  if (hour >= 11 && hour < 16) {
    // 11 AM to 4 PM: show "add drink"
    return {
      text: getTranslation("addDrink", language),
      mode: "normal",
    };
  } else if (hour >= 2 && hour < 11) {
    // 2 AM to 11 AM: show "add last night drinks"
    return {
      text: getTranslation("addLastNightDrinks", language),
      mode: "lastNight",
    };
  } else {
    // 4 PM to 2 AM: show preferred drink
    const drinkTypeName = getTranslation(
      userData?.preferred_drink_type || "beer",
      language
    );
    const drinkOptionName = getTranslation(
      userData?.preferred_drink_option || "can",
      language
    );
    const drinkEmoji = getDrinkTypeEmoji(
      userData?.preferred_drink_type || "beer"
    );
    return {
      text: `${getTranslation(
        "add",
        language
      )} ${drinkOptionName.toLowerCase()} ${getTranslation(
        "of",
        language
      )} ${drinkTypeName.toLowerCase()} ${drinkEmoji}`,
      mode: "normal",
    };
  }
};
