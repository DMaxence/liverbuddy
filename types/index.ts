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

export interface DrinkType {
  id: string;
  name: string;
  emoji: string;
  defaultAmount: number;
  defaultUnit: string;
  options: { amount: number; unit: string; label: string }[];
}
