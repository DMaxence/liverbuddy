import { PreferredUnit } from "@/types";

// Unit conversion constants
const UNIT_CONVERSIONS = {
  oz: { to_oz: 1, to_cl: 2.95735 },
  cl: { to_oz: 0.33814, to_cl: 1 },
  l: { to_oz: 33.814, to_cl: 100 },
} as const;

/**
 * Format drink amount from cl to user's preferred unit
 * @param amountCl - Amount in centiliters (storage unit)
 * @param preferredUnit - User's preferred display unit
 * @returns Formatted string with amount and unit
 */
export const formatDrinkAmount = (
  amountCl: number,
  preferredUnit: PreferredUnit = "cl"
): string => {
  if (amountCl <= 0) return "0";

  let displayAmount: number;
  let displayUnit: string;

  switch (preferredUnit) {
    case "oz":
      displayAmount = amountCl * UNIT_CONVERSIONS.cl.to_oz;
      displayUnit = "oz";
      break;
    default:
      displayAmount = amountCl;
      displayUnit = "cl";
  }

  // Format the number based on size
  if (displayAmount < 1) {
    // For small amounts, show 1 decimal place
    return `${displayAmount.toFixed(1)} ${displayUnit}`;
  } else if (displayAmount < 10) {
    // For medium amounts, show 1 decimal place
    return `${displayAmount.toFixed(1)} ${displayUnit}`;
  } else if (displayAmount >= 10 && displayAmount < 100) {
    // For medium amounts, show 1 decimal place
    return `${Math.round(displayAmount)} ${displayUnit}`;
  } else {
    // For larger amounts, round to whole number
    const liters = amountCl / 100;
    // Only show decimal if there is one, otherwise show plain number
    return `${liters % 1 === 0 ? Math.round(liters) : liters.toFixed(1)} L`;
  }
};

/**
 * Convert amount from cl to preferred unit (without formatting)
 * @param amountCl - Amount in centiliters
 * @param preferredUnit - Target unit
 * @returns Amount in target unit
 */
export const convertFromCl = (
  amountCl: number,
  preferredUnit: PreferredUnit = "oz"
): number => {
  switch (preferredUnit) {
    case "oz":
      return amountCl * UNIT_CONVERSIONS.cl.to_oz;
    default:
      return amountCl;
  }
};
