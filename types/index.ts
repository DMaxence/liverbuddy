import { drinkOptions, drinkTypes, unitTypes } from "@/constants/drinks";

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at?: string;
  version?: string;
  os?: string;
  os_version?: string;
  device?: string;
  language?: string;
  region?: string;
  timezone?: string;
  last_active_at?: string;
  deleted?: boolean;
  app_lang?: string;
  favorite_drink_type: DrinkTypeKey;
  favorite_drink_option: DrinkOptionKey;
  favorite_drink?: string; // User's favorite drink name (e.g., "IPA", "Merlot")
}

export type LiverState = {
  level: number;
  nameKey: string; // Translation key for the name
  emoji: string;
  color: string;
  descriptionKey: string; // Translation key for the description
  scoreRange: [number, number];
};

export const liverStates: LiverState[] = [
  {
    level: 1,
    nameKey: "perfectlyHealthy",
    emoji: "🧘",
    color: "#4CAF50",
    descriptionKey: "perfectlyHealthyDescription",
    scoreRange: [85, 100],
  },
  {
    level: 2,
    nameKey: "kindaVibing",
    emoji: "😎",
    color: "#8BC34A",
    descriptionKey: "kindaVibingDescription",
    scoreRange: [70, 84],
  },
  {
    level: 3,
    nameKey: "lowkeyStruggling",
    emoji: "😬",
    color: "#FFEB3B",
    descriptionKey: "lowkeyStrugglingDescription",
    scoreRange: [55, 69],
  },
  {
    level: 4,
    nameKey: "runningOnRegret",
    emoji: "🫠",
    color: "#FF9800",
    descriptionKey: "runningOnRegretDescription",
    scoreRange: [40, 54],
  },
  {
    level: 5,
    nameKey: "deeplyConcerned",
    emoji: "😵",
    color: "#F44336",
    descriptionKey: "deeplyConcernedDescription",
    scoreRange: [25, 39],
  },
  {
    level: 6,
    nameKey: "legallyDeceased",
    emoji: "💀",
    color: "#9E9E9E",
    descriptionKey: "legallyDeceasedDescription",
    scoreRange: [0, 24],
  },
];

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: "drinks_consumed";
  requirement_value: number;
  xp_reward: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export type AppLanguage = "en" | "fr";
export type PreferredUnit = "cl" | "oz";

// Unit conversion constants (updated to use cl instead of ml)
export const UNIT_CONVERSIONS = {
  cl: { to_cl: 1, to_oz: 0.33814 },
  oz: { to_cl: 2.95735, to_oz: 1 },
  drink: { to_cl: 20, to_oz: 6.76 }, // Standard drink = 20cl (6.76 oz)
} as const;

export type UnitType = keyof typeof UNIT_CONVERSIONS;

// Drink option keys for better maintainability
export type DrinkOptionKey = (typeof drinkOptions)[number];

// Drink type keys
export type DrinkTypeKey = (typeof drinkTypes)[number];

// Unit type keys
export type UnitTypeKey = (typeof unitTypes)[number];

// Generic drink option structure
export interface DrinkOption {
  key: DrinkOptionKey;
  amount: number;
  unit: UnitTypeKey;
  alcohol_percentage?: number; // Optional for more accurate calculations
}

// Generic drink type structure
export interface DrinkType {
  id: DrinkTypeKey;
  name_key: string; // Translation key for the name
  emoji: string;
  default_option: DrinkOptionKey;
  options: DrinkOption[];
  alcohol_percentage?: number; // Default alcohol percentage for this type
}

// Database-ready drink log structure
export interface DrinkLog {
  id: string;
  user_id: string;
  drink_type: DrinkTypeKey;
  drink_option: DrinkOptionKey;
  drink_name?: string; // Optional specific drink name (e.g., "IPA", "Merlot", "Margarita")
  amount_cl: number; // Always stored in cl for consistency
  timestamp: string;
  is_approximate?: boolean;
  alcohol_percentage?: number;
  created_at: string;
  updated_at?: string;
}

// Helper type for drink calculations
export interface DrinkCalculation {
  amount_cl: number;
  amount_oz: number;
  alcohol_units: number; // Standard alcohol units (10g pure alcohol)
  display_amount: number;
  display_unit: UnitTypeKey;
}

// User profile for medical calculations
export interface UserProfile {
  age: number;
  weight_kg: number;
  gender: "male" | "female";
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active";
  drink_habits: "rarely" | "occasionally" | "regularly" | "frequently";
  favorite_drink_type?: DrinkTypeKey;
  favorite_drink_option?: DrinkOptionKey;
  favorite_drink?: string;
}

// Helper function to get localized liver state
export const getLocalizedLiverState = (
  liverState: LiverState,
  getTranslation: (
    key: keyof typeof import("@/constants/localization").translations.en
  ) => string
) => {
  return {
    ...liverState,
    name: getTranslation(liverState.nameKey as any),
    description: getTranslation(liverState.descriptionKey as any),
  };
};
