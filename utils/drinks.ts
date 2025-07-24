import {
  DrinkCalculation,
  DrinkLog,
  DrinkOption,
  DrinkOptionKey,
  DrinkType,
  DrinkTypeKey,
  UNIT_CONVERSIONS,
  UnitType,
} from "@/types";

// Unit conversion functions
export const convertUnit = (
  amount: number,
  fromUnit: UnitType,
  toUnit: UnitType
): number => {
  if (fromUnit === toUnit) return amount;

  // Convert to mL first, then to target unit
  const mlAmount = amount * UNIT_CONVERSIONS[fromUnit].to_ml;

  if (toUnit === "ml") return mlAmount;
  if (toUnit === "oz") return mlAmount * UNIT_CONVERSIONS.ml.to_oz;
  if (toUnit === "l") return mlAmount / 1000;
  if (toUnit === "drink") return mlAmount / UNIT_CONVERSIONS.drink.to_ml;

  return amount; // Fallback
};

// Calculate alcohol units (1 unit = 10g pure alcohol)
export const calculateAlcoholUnits = (
  amount: number,
  unit: UnitType,
  alcoholPercentage: number = 5
): number => {
  const mlAmount = convertUnit(amount, unit, "ml");
  const alcoholGrams = (mlAmount * alcoholPercentage * 0.789) / 100; // 0.789 is density of ethanol
  return alcoholGrams / 10; // Convert to standard units
};

// Get drink calculation for display and health scoring
export const getDrinkCalculation = (
  amount: number,
  unit: UnitType,
  alcoholPercentage?: number
): DrinkCalculation => {
  const amountMl = convertUnit(amount, unit, "ml");
  const amountOz = convertUnit(amount, unit, "oz");
  const alcoholUnits = calculateAlcoholUnits(amount, unit, alcoholPercentage);

  return {
    amount_ml: amountMl,
    amount_oz: amountOz,
    alcohol_units: alcoholUnits,
    display_amount: amount,
    display_unit: unit,
  };
};

// Drink type definitions with textual keys
export const DRINK_TYPES: Record<DrinkTypeKey, DrinkType> = {
  beer: {
    id: "beer",
    name_key: "beer",
    emoji: "🍺",
    default_option: "can",
    alcohol_percentage: 5,
    options: [
      { key: "can", amount: 330, unit: "ml" },
      { key: "bottle", amount: 500, unit: "ml" },
      { key: "pint", amount: 473, unit: "ml" },
      { key: "large", amount: 1000, unit: "ml" },
      { key: "tall", amount: 568, unit: "ml" },
    ],
  },
  wine: {
    id: "wine",
    name_key: "wine",
    emoji: "🍷",
    default_option: "glass",
    alcohol_percentage: 12,
    options: [
      { key: "glass", amount: 125, unit: "ml" }, // 5 oz in ml
      { key: "large_glass", amount: 180, unit: "ml" }, // 6 oz in ml
      { key: "bottle", amount: 750, unit: "ml" },
      { key: "small", amount: 80, unit: "ml" }, // 3 oz in ml
    ],
  },
  cocktail: {
    id: "cocktail",
    name_key: "cocktail",
    emoji: "🍸",
    default_option: "standard",
    alcohol_percentage: 15,
    options: [
      { key: "standard", amount: 1, unit: "drink" },
      { key: "strong", amount: 1.5, unit: "drink" },
      { key: "double", amount: 2, unit: "drink" },
      { key: "small", amount: 0.75, unit: "drink" },
    ],
  },
  spirits: {
    id: "spirits",
    name_key: "spirits",
    emoji: "🥃",
    default_option: "standard",
    alcohol_percentage: 40,
    options: [
      { key: "shot", amount: 30, unit: "ml" }, // 1 oz in ml
      { key: "standard", amount: 45, unit: "ml" }, // 1.5 oz in ml
      { key: "double", amount: 60, unit: "ml" }, // 2 oz in ml
      { key: "small", amount: 20, unit: "ml" }, // 0.75 oz in ml
    ],
  },
  other: {
    id: "other",
    name_key: "other",
    emoji: "🥤",
    default_option: "standard",
    alcohol_percentage: 5,
    options: [
      { key: "standard", amount: 1, unit: "drink" },
      { key: "strong", amount: 1.5, unit: "drink" },
      { key: "double", amount: 2, unit: "drink" },
    ],
  },
};

// Get drink types with translations
export const getDrinkTypes = (t: (key: string) => string): DrinkType[] => {
  return Object.values(DRINK_TYPES).map((type) => ({
    ...type,
    name: t(type.name_key),
  }));
};

export const getDrinkTypeEmoji = (typeKey: DrinkTypeKey): string => {
  return DRINK_TYPES[typeKey]?.emoji || "";
};

// Get drink option by key
export const getDrinkOption = (
  typeKey: DrinkTypeKey,
  optionKey: DrinkOptionKey
): DrinkOption | undefined => {
  return DRINK_TYPES[typeKey]?.options.find(
    (option) => option.key === optionKey
  );
};

// Get default drink option for a type
export const getDefaultDrinkOption = (
  typeKey: DrinkTypeKey
): DrinkOption | undefined => {
  const type = DRINK_TYPES[typeKey];
  if (!type) return undefined;

  return type.options.find((option) => option.key === type.default_option);
};

// Format drink option for display
export const formatDrinkOption = (
  option: DrinkOption,
  t: (key: string) => string,
  showAmount: boolean = true,
  preferredUnit: "ml" | "oz" = "ml"
): string => {
  const optionName = t(option.key);

  if (!showAmount) return optionName;

  const amount = option.amount;
  const unit = option.unit;

  if (unit === "drink") {
    const drinkKey = amount === 1 ? "drink" : "drinks";
    return `${optionName} (${amount} ${t(drinkKey)})`;
  }

  // For ml units, convert to oz if preferred
  if (unit === "ml" && preferredUnit === "oz") {
    const ozAmount = amount * 0.033814;
    return `${optionName} (${Math.round(ozAmount)}oz)`;
  }

  return `${optionName} (${amount}${unit})`;
};

// Calculate total alcohol consumption from drink logs
export const calculateTotalAlcohol = (drinks: DrinkLog[]): DrinkCalculation => {
  let totalMl = 0;
  let totalOz = 0;
  let totalUnits = 0;

  drinks.forEach((drink) => {
    const alcoholPercentage =
      drink.alcohol_percentage ||
      DRINK_TYPES[drink.drink_type].alcohol_percentage ||
      5;

    totalMl += drink.amount_ml;
    totalOz += drink.amount_ml * 0.033814; // Convert to oz
    totalUnits += (drink.amount_ml * alcoholPercentage * 0.789) / 1000; // Calculate alcohol units
  });

  return {
    amount_ml: totalMl,
    amount_oz: totalOz,
    alcohol_units: totalUnits,
    display_amount: totalMl,
    display_unit: "ml",
  };
};

// Validate drink log data
export const validateDrinkLog = (
  drinkLog: Partial<DrinkLog>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!drinkLog.drink_type || !DRINK_TYPES[drinkLog.drink_type]) {
    errors.push("Invalid drink type");
  }

  if (!drinkLog.drink_option) {
    errors.push("Missing drink option");
  } else if (drinkLog.drink_type && drinkLog.drink_option) {
    const option = getDrinkOption(drinkLog.drink_type, drinkLog.drink_option);
    if (!option) {
      errors.push("Invalid drink option for selected type");
    }
  }

  if (
    drinkLog.amount_ml !== undefined &&
    (isNaN(drinkLog.amount_ml) || drinkLog.amount_ml <= 0)
  ) {
    errors.push("Amount must be a positive number");
  }

  if (
    drinkLog.alcohol_percentage !== undefined &&
    (isNaN(drinkLog.alcohol_percentage) ||
      drinkLog.alcohol_percentage < 0 ||
      drinkLog.alcohol_percentage > 100)
  ) {
    errors.push("Alcohol percentage must be between 0 and 100");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
