import { getDeviceLanguage, getTranslation } from "@/constants/localization";
import { UserData } from "@/services/userDataService";

import { AppLanguage } from "@/types";
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

// Helper functions
export const getGreeting = (language: AppLanguage): string => {
  const hour = new Date().getHours();

  if (hour < 12) return getTranslation("morning", language);
  if (hour < 17) return getTranslation("afternoon", language);
  return getTranslation("evening", language);
};

export const formatDate = (date: Date, language: AppLanguage): string => {
  return date.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeTime = (
  timestamp: string,
  language: AppLanguage
): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 24) {
    if (diffInMinutes < 1) return getTranslation("justNow", language);
    if (diffInMinutes < 60) {
      if (diffInMinutes === 1)
        return `1 ${getTranslation("minuteAgo", language)}`;
      return `${diffInMinutes} ${getTranslation("minutesAgo", language)}`;
    }
    if (diffInHours === 1) return `1 ${getTranslation("hourAgo", language)}`;
    return `${diffInHours} ${getTranslation("hoursAgo", language)}`;
  }

  // Calculate calendar day difference instead of 24-hour periods
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateLocal = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffInDays = Math.floor(
    (nowDate.getTime() - dateLocal.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 1) return getTranslation("yesterday", language);
  if (diffInDays < 7)
    return `${diffInDays} ${getTranslation("daysAgo", language)}`;

  return formatDate(date, language);
};

export const formatTime = (
  timestamp: string,
  language: AppLanguage
): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: language === "fr" ? false : true,
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
  userData: UserData | null,
  language: AppLanguage
): { text: string; mode: "normal" | "lastNight" } => {
  const hour = new Date().getHours();

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
      userData?.favorite_drink_type || "beer",
      language
    );
    const drinkOptionName = getTranslation(
      userData?.favorite_drink_option || "can",
      language
    );
    const drinkEmoji = getDrinkTypeEmoji(
      userData?.favorite_drink_type || "beer"
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
