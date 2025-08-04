import {
  drinkTypeDefinitions,
  getDrinkOptionAmount,
  getDrinkTypeDefinition,
  getDrinkTypeOptions,
  isValidDrinkOption,
} from "@/constants/drinks";
import {
  DrinkCalculation,
  DrinkLog,
  DrinkOption,
  DrinkOptionKey,
  DrinkType,
  DrinkTypeKey,
  UNIT_CONVERSIONS,
  UnitTypeKey,
} from "@/types";

// Unit conversion functions
export const convertUnit = (
  amount: number,
  fromUnit: UnitTypeKey,
  toUnit: UnitTypeKey
): number => {
  if (fromUnit === toUnit) return amount;

  // Convert to cl first, then to target unit
  const clAmount = amount * UNIT_CONVERSIONS[fromUnit].to_cl;

  if (toUnit === "cl") return clAmount;
  if (toUnit === "oz") return clAmount * UNIT_CONVERSIONS.cl.to_oz;
  if (toUnit === "drink") return clAmount / UNIT_CONVERSIONS.drink.to_cl;

  return amount; // Fallback
};

// Calculate alcohol units (1 unit = 10g pure alcohol)
export const calculateAlcoholUnits = (
  amount: number,
  unit: UnitTypeKey,
  alcoholPercentage: number = 5
): number => {
  const clAmount = convertUnit(amount, unit, "cl");
  const alcoholGrams = (clAmount * alcoholPercentage * 0.789) / 10; // 0.789 is density of ethanol
  return alcoholGrams / 10; // Convert to standard units
};

// Get drink calculation for display and health scoring
export const getDrinkCalculation = (
  amount: number,
  unit: UnitTypeKey,
  alcoholPercentage?: number
): DrinkCalculation => {
  const amountCl = convertUnit(amount, unit, "cl");
  const amountOz = convertUnit(amount, unit, "oz");
  const alcoholUnits = calculateAlcoholUnits(amount, unit, alcoholPercentage);

  return {
    amount_cl: amountCl,
    amount_oz: amountOz,
    alcohol_units: alcoholUnits,
    display_amount: amount,
    display_unit: unit,
  };
};

// Get drink types with translations
export const getDrinkTypes = (t: (key: string) => string): DrinkType[] => {
  return Object.values(drinkTypeDefinitions).map((type) => ({
    ...type,
    name: t(type.name_key),
    options: type.options.map((optionKey) => ({
      key: optionKey,
      amount: getDrinkOptionAmount(optionKey, "eu").amount,
      unit: getDrinkOptionAmount(optionKey, "eu").unit,
    })),
  }));
};

export const getDrinkTypeEmoji = (typeKey: DrinkTypeKey): string => {
  return drinkTypeDefinitions[typeKey]?.emoji || "";
};

// Get drink option by key for a specific region
export const getDrinkOption = (
  typeKey: DrinkTypeKey,
  optionKey: DrinkOptionKey,
  region: "eu" | "us" = "eu"
): DrinkOption | undefined => {
  if (!isValidDrinkOption(typeKey, optionKey)) {
    return undefined;
  }

  const optionAmount = getDrinkOptionAmount(optionKey, region);
  return {
    key: optionKey,
    amount: optionAmount.amount,
    unit: optionAmount.unit,
  };
};

// Get default drink option for a type
export const getDefaultDrinkOption = (
  typeKey: DrinkTypeKey,
  region: "eu" | "us" = "eu"
): DrinkOption | undefined => {
  const type = drinkTypeDefinitions[typeKey];
  if (!type) return undefined;

  return getDrinkOption(typeKey, type.default_option, region);
};

// Format drink option for display
export const formatDrinkOption = (
  option: DrinkOption,
  t: (key: string) => string,
  showAmount: boolean = true,
  preferredUnit: "cl" | "oz" = "cl"
): string => {
  const optionName = t(option.key);

  if (!showAmount) return optionName;

  const amount = option.amount;
  const unit = option.unit;

  if (unit === "drink") {
    const drinkKey = amount === 1 ? "drink" : "drinks";
    return `${optionName} (${amount} ${t(drinkKey)})`;
  }
  if (unit === "cl" && amount >= 100) {
    const liters = amount / 100;
    // Only show decimal if there is one, otherwise show plain number
    return `${optionName} (${
      liters % 1 === 0 ? Math.round(liters) : liters.toFixed(1)
    }L)`;
  }

  // For cl units, convert to oz if preferred
  // if (unit === "oz") {
  //   const ozAmount = amount * 0.33814;
  //   return `${optionName} (${Math.round(ozAmount * 10) / 10}oz)`;
  // }

  return `${optionName} (${amount}${unit})`;
};

// Calculate total alcohol consumption from drink logs
export const calculateTotalAlcohol = (drinks: DrinkLog[]): DrinkCalculation => {
  let totalCl = 0;
  let totalOz = 0;
  let totalUnits = 0;

  drinks.forEach((drink) => {
    const alcoholPercentage =
      drink.alcohol_percentage ||
      drinkTypeDefinitions[drink.drink_type].alcohol_percentage ||
      5;

    totalCl += drink.amount_cl;
    totalOz += drink.amount_cl * 0.33814; // Convert to oz
    totalUnits += (drink.amount_cl * alcoholPercentage * 0.789) / 100; // Calculate alcohol units
  });

  return {
    amount_cl: totalCl,
    amount_oz: totalOz,
    alcohol_units: totalUnits,
    display_amount: totalCl,
    display_unit: "cl",
  };
};

// Validate drink log data
export const validateDrinkLog = (
  drinkLog: Partial<DrinkLog>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!drinkLog.drink_type || !drinkTypeDefinitions[drinkLog.drink_type]) {
    errors.push("Invalid drink type");
  }

  if (!drinkLog.drink_option) {
    errors.push("Missing drink option");
  } else if (drinkLog.drink_type && drinkLog.drink_option) {
    if (!isValidDrinkOption(drinkLog.drink_type, drinkLog.drink_option)) {
      errors.push("Invalid drink option for selected type");
    }
  }

  if (
    drinkLog.amount_cl !== undefined &&
    (isNaN(drinkLog.amount_cl) || drinkLog.amount_cl <= 0)
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

// Get all available drink options for a specific type
export const getAvailableDrinkOptions = (
  typeKey: DrinkTypeKey
): readonly DrinkOptionKey[] => {
  return getDrinkTypeOptions(typeKey);
};

// Get drink type definition
export const getDrinkType = (typeKey: DrinkTypeKey) => {
  return getDrinkTypeDefinition(typeKey);
};
