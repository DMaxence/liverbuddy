export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  full_name?: string;
  xp: number;
  level: number;
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
  nb_spots?: number;
  app_lang?: string;
  app_notif_new_follower?: boolean;
  app_notif_new_comment?: boolean;
  app_notif_friend_new_spot?: boolean;
  preferred_drink_type: DrinkTypeKey;
  preferred_drink_option: DrinkOptionKey;
  favorite_drink?: string; // User's favorite drink name (e.g., "IPA", "Merlot")
}

export type LiverState = {
  level: number;
  name: string;
  emoji: string;
  color: string;
  description: string;
  scoreRange: [number, number];
};

export const liverStates: LiverState[] = [
  {
    level: 1,
    name: "Perfectly Healthy",
    emoji: "🧘",
    color: "#4CAF50",
    description: "I’m basically a green smoothie with legs.",
    scoreRange: [85, 100],
  },
  {
    level: 2,
    name: "Kinda Vibing",
    emoji: "😎",
    color: "#8BC34A",
    description: "One drink won't hurt… right?",
    scoreRange: [70, 84],
  },
  {
    level: 3,
    name: "Lowkey Struggling",
    emoji: "😬",
    color: "#FFEB3B",
    description: "We're still fine. Technically.",
    scoreRange: [55, 69],
  },
  {
    level: 4,
    name: "Running on Regret",
    emoji: "🫠",
    color: "#FF9800",
    description: "The liver is working overtime with no union rights.",
    scoreRange: [40, 54],
  },
  {
    level: 5,
    name: "Deeply Concerned",
    emoji: "😵",
    color: "#F44336",
    description: "You’ve turned your liver into a part-time bartender.",
    scoreRange: [25, 39],
  },
  {
    level: 6,
    name: "Legally Deceased",
    emoji: "💀",
    color: "#9E9E9E",
    description: "Not a liver. Just emotional baggage in organ form.",
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
export type PreferredUnit = "ml" | "oz";

// Unit conversion constants
export const UNIT_CONVERSIONS = {
  ml: { to_ml: 1, to_oz: 0.033814 },
  oz: { to_ml: 29.5735, to_oz: 1 },
  l: { to_ml: 1000, to_oz: 33.814 },
  drink: { to_ml: 200, to_oz: 6.76 }, // Standard drink = 200ml (6.76 oz)
} as const;

export type UnitType = keyof typeof UNIT_CONVERSIONS;

// Drink option keys for better maintainability
export type DrinkOptionKey = 
  | 'can' 
  | 'bottle' 
  | 'pint' 
  | 'large' 
  | 'glass' 
  | 'large_glass' 
  | 'standard' 
  | 'strong' 
  | 'double' 
  | 'shot'
  | 'tall'
  | 'small'
  | 'medium'
  | 'extra_large';

// Drink type keys
export type DrinkTypeKey = 'beer' | 'wine' | 'cocktail' | 'spirits' | 'other';

// Generic drink option structure
export interface DrinkOption {
  key: DrinkOptionKey;
  amount: number;
  unit: UnitType;
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
  amount_ml: number; // Always stored in mL for consistency
  timestamp: string;
  is_approximate?: boolean;
  alcohol_percentage?: number;
  created_at: string;
  updated_at?: string;
}

// Helper type for drink calculations
export interface DrinkCalculation {
  amount_ml: number;
  amount_oz: number;
  alcohol_units: number; // Standard alcohol units (10g pure alcohol)
  display_amount: number;
  display_unit: UnitType;
}
