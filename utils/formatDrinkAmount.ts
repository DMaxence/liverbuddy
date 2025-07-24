import { PreferredUnit } from "@/types";

// Unit conversion constants
const UNIT_CONVERSIONS = {
  ml: { to_ml: 1, to_oz: 0.033814, to_cl: 0.1 },
  oz: { to_ml: 29.5735, to_oz: 1, to_cl: 2.95735 },
  cl: { to_ml: 10, to_oz: 0.33814, to_cl: 1 },
  l: { to_ml: 1000, to_oz: 33.814, to_cl: 100 },
} as const;

/**
 * Format drink amount from mL to user's preferred unit
 * @param amountMl - Amount in milliliters (storage unit)
 * @param preferredUnit - User's preferred display unit
 * @returns Formatted string with amount and unit
 */
export const formatDrinkAmount = (
  amountMl: number,
  preferredUnit: PreferredUnit = "ml"
): string => {
  if (amountMl <= 0) return "0";

  let displayAmount: number;
  let displayUnit: string;

  switch (preferredUnit) {
    case "oz":
      displayAmount = amountMl * UNIT_CONVERSIONS.ml.to_oz;
      displayUnit = "oz";
      break;
    case "ml":
      // For display purposes, convert to cl since we don't want to show ml
      displayAmount = amountMl * UNIT_CONVERSIONS.ml.to_cl;
      displayUnit = "cl";
      break;
    default:
      displayAmount = amountMl * UNIT_CONVERSIONS.ml.to_cl;
      displayUnit = "cl";
  }

  // Format the number based on size
  if (displayAmount < 1) {
    // For small amounts, show 1 decimal place
    return `${displayAmount.toFixed(1)} ${displayUnit}`;
  } else if (displayAmount < 10) {
    // For medium amounts, show 1 decimal place
    return `${displayAmount.toFixed(1)} ${displayUnit}`;
  } else {
    // For larger amounts, round to whole number
    return `${Math.round(displayAmount)} ${displayUnit}`;
  }
};

/**
 * Convert amount from mL to preferred unit (without formatting)
 * @param amountMl - Amount in milliliters
 * @param preferredUnit - Target unit
 * @returns Amount in target unit
 */
export const convertFromMl = (
  amountMl: number,
  preferredUnit: PreferredUnit = "oz"
): number => {
  switch (preferredUnit) {
    case "oz":
      return amountMl * UNIT_CONVERSIONS.ml.to_oz;
    case "ml":
      // For display purposes, convert to cl since we don't want to show ml
      return amountMl * UNIT_CONVERSIONS.ml.to_cl;
    default:
      return amountMl * UNIT_CONVERSIONS.ml.to_oz;
  }
}; 