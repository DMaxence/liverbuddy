import { DrinkLog } from './schema';
import { DRINK_TYPES } from '@/utils/drinks';
import { DrinkTypeKey } from '@/types';

// Calculate alcohol units for a single drink
export const calculateAlcoholUnits = (drink: DrinkLog): number => {
  const alcoholPercentage = drink.alcohol_percentage || 
    DRINK_TYPES[drink.drink_type]?.alcohol_percentage || 5;
  
  // Formula: (amount_ml * alcohol_percentage * 0.789) / 1000
  // 0.789 is the density of ethanol in g/ml
  // Divide by 1000 to convert to standard alcohol units (10g pure alcohol)
  return (drink.amount_ml * alcoholPercentage * 0.789) / 1000;
};

// Calculate total alcohol consumption for a list of drinks
export const calculateTotalConsumption = (drinks: DrinkLog[]) => {
  let totalMl = 0;
  let totalOz = 0;
  let totalAlcoholUnits = 0;

  drinks.forEach(drink => {
    totalMl += drink.amount_ml;
    totalOz += drink.amount_ml * 0.033814; // Convert to oz
    totalAlcoholUnits += calculateAlcoholUnits(drink);
  });

  return {
    total_ml: totalMl,
    total_oz: totalOz,
    total_alcohol_units: totalAlcoholUnits,
    drink_count: drinks.length,
  };
};

// Get drinks for a specific date
export const getDrinksForDate = (drinks: DrinkLog[], date: string): DrinkLog[] => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const nextDate = new Date(targetDate);
  nextDate.setDate(targetDate.getDate() + 1);

  return drinks.filter(drink => {
    const drinkDate = new Date(drink.timestamp);
    return drinkDate >= targetDate && drinkDate < nextDate;
  });
};

// Get drinks for a date range
export const getDrinksForDateRange = (
  drinks: DrinkLog[], 
  startDate: string, 
  endDate: string
): DrinkLog[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return drinks.filter(drink => {
    const drinkDate = new Date(drink.timestamp);
    return drinkDate >= start && drinkDate <= end;
  });
};

// Calculate daily consumption
export const calculateDailyConsumption = (drinks: DrinkLog[], date: string) => {
  const dayDrinks = getDrinksForDate(drinks, date);
  return calculateTotalConsumption(dayDrinks);
};

// Calculate weekly consumption
export const calculateWeeklyConsumption = (
  drinks: DrinkLog[], 
  startDate: string
): { date: string; total_ml: number; total_oz: number; total_alcohol_units: number; drink_count: number }[] => {
  const results = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const dayConsumption = calculateDailyConsumption(drinks, dateString);
    results.push({
      date: dateString,
      ...dayConsumption,
    });
  }
  
  return results;
};

// Calculate drink statistics
export const calculateDrinkStatistics = (
  drinks: DrinkLog[], 
  days: number = 30
) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const periodDrinks = getDrinksForDateRange(
    drinks, 
    startDate.toISOString().split('T')[0], 
    endDate.toISOString().split('T')[0]
  );

  const totalDrinks = periodDrinks.length;
  const totalAlcoholUnits = periodDrinks.reduce((sum, drink) => sum + calculateAlcoholUnits(drink), 0);
  const averageDailyUnits = totalAlcoholUnits / days;

  // Find most common drink type
  const typeCounts = periodDrinks.reduce((counts, drink) => {
    counts[drink.drink_type] = (counts[drink.drink_type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(typeCounts).reduce(
    (max, [type, count]) => count > (max?.count || 0) ? { type: type as DrinkTypeKey, count } : max,
    null as { type: DrinkTypeKey; count: number } | null
  )?.type || null;

  // Calculate streak (consecutive days with drinks)
  const datesWithDrinks = new Set(
    periodDrinks.map(drink => new Date(drink.timestamp).toDateString())
  );

  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toDateString();

    if (datesWithDrinks.has(dateString)) {
      streakDays++;
    } else {
      break;
    }
  }

  return {
    totalDrinks,
    totalAlcoholUnits,
    averageDailyUnits,
    mostCommonType,
    streakDays,
  };
}; 