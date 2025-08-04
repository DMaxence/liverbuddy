// Unit types
export const unitTypes = ["cl", "oz", "drink"] as const;

// Drink option definitions with both European (cl) and US (oz) amounts
export const drinkOptionDefinitions = {
  can: {
    eu: { amount: 33, unit: "cl" },
    us: { amount: 12, unit: "oz" },
  },
  bottle: {
    eu: { amount: 75, unit: "cl" },
    us: { amount: 25.4, unit: "oz" },
  },
  pint: {
    eu: { amount: 50, unit: "cl" },
    us: { amount: 16, unit: "oz" },
  },
  large: {
    eu: { amount: 100, unit: "cl" },
    us: { amount: 33.8, unit: "oz" },
  },
  glass: {
    eu: { amount: 12.5, unit: "cl" },
    us: { amount: 5, unit: "oz" },
  },
  large_glass: {
    eu: { amount: 18, unit: "cl" },
    us: { amount: 6, unit: "oz" },
  },
  standard: {
    eu: { amount: 1, unit: "drink" },
    us: { amount: 1, unit: "drink" },
  },
  strong: {
    eu: { amount: 1.5, unit: "drink" },
    us: { amount: 1.5, unit: "drink" },
  },
  double: {
    eu: { amount: 2, unit: "drink" },
    us: { amount: 2, unit: "drink" },
  },
  shot: {
    eu: { amount: 3, unit: "cl" },
    us: { amount: 1, unit: "oz" },
  },
  tall: {
    eu: { amount: 40, unit: "cl" },
    us: { amount: 13.5, unit: "oz" },
  },
  small: {
    eu: { amount: 8, unit: "cl" },
    us: { amount: 3, unit: "oz" },
  },
  medium: {
    eu: { amount: 25, unit: "cl" },
    us: { amount: 8, unit: "oz" },
  },
  extra_large: {
    eu: { amount: 150, unit: "cl" },
    us: { amount: 50.7, unit: "oz" },
  },
} as const;

// Drink type definitions
export const drinkTypeDefinitions = {
  beer: {
    id: "beer",
    name_key: "beer",
    emoji: "🍺",
    default_option: "medium",
    alcohol_percentage: 5,
    options: ["medium", "can", "pint", "large"] as const,
  },
  wine: {
    id: "wine",
    name_key: "wine",
    emoji: "🍷",
    default_option: "glass",
    alcohol_percentage: 12,
    options: ["glass", "large_glass", "bottle", "small"] as const,
  },
  cocktail: {
    id: "cocktail",
    name_key: "cocktail",
    emoji: "🍸",
    default_option: "standard",
    alcohol_percentage: 15,
    options: ["standard", "strong", "double", "small"] as const,
  },
  spirits: {
    id: "spirits",
    name_key: "spirits",
    emoji: "🥃",
    default_option: "shot",
    alcohol_percentage: 40,
    options: ["shot", "standard", "double", "small"] as const,
  },
  other: {
    id: "other",
    name_key: "other",
    emoji: "🥤",
    default_option: "standard",
    alcohol_percentage: 5,
    options: ["standard", "strong", "double"] as const,
  },
} as const;

export const drinkOptions = Object.keys(drinkOptionDefinitions) as (keyof typeof drinkOptionDefinitions)[];

export const drinkTypes = Object.keys(drinkTypeDefinitions) as (keyof typeof drinkTypeDefinitions)[];

// Helper function to get drink option amount for a specific region
export const getDrinkOptionAmount = (
  optionKey: (typeof drinkOptions)[number],
  region: "eu" | "us" = "eu"
) => {
  return drinkOptionDefinitions[optionKey][region];
};

// Helper function to get drink type options
export const getDrinkTypeOptions = (typeKey: (typeof drinkTypes)[number]) => {
  return drinkTypeDefinitions[typeKey].options;
};

// Helper function to get drink type definition
export const getDrinkTypeDefinition = (
  typeKey: (typeof drinkTypes)[number]
) => {
  return drinkTypeDefinitions[typeKey];
};

// Helper function to check if an option is valid for a drink type
export const isValidDrinkOption = (
  typeKey: (typeof drinkTypes)[number],
  optionKey: (typeof drinkOptions)[number]
) => {
  const options = drinkTypeDefinitions[typeKey].options;
  return (options as readonly string[]).includes(optionKey);
};
