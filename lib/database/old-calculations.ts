import { DrinkLog } from "./schema";
import { DRINK_TYPES } from "@/utils/drinks";
import { DrinkTypeKey, UserProfile } from "@/types";

// User profile interface for health calculations

// Default profile for current user (will be configurable in future)
const DEFAULT_USER_PROFILE: UserProfile = {
  age: 25,
  weight_kg: 75,
  gender: "male",
  activity_level: "lightly_active",
  drink_habits: "occasionally",
};

// Calculate alcohol units for a single drink
export const calculateAlcoholUnits = (drink: DrinkLog): number => {
  const alcoholPercentage =
    drink.alcohol_percentage ||
    DRINK_TYPES[drink.drink_type]?.alcohol_percentage ||
    5;

  // Formula: (amount_ml * alcohol_percentage * 0.789) / 1000
  // 0.789 is the density of ethanol in g/ml
  // Divide by 1000 to convert to standard alcohol units (10g pure alcohol)
  return (drink.amount_ml * alcoholPercentage * 0.789) / 1000;
};

// Calculate alcohol processing rate based on user profile (grams per hour)
export const calculateAlcoholProcessingRate = (
  profile: UserProfile = DEFAULT_USER_PROFILE
): number => {
  // Base rate: 10g/hour for average person
  let baseRate = 10;

  // Gender factor: males typically process ~15% faster than females
  if (profile.gender === "male") {
    baseRate *= 1.15;
  }

  // Weight factor: heavier individuals process alcohol faster
  const baseWeight = profile.gender === "male" ? 70 : 60;
  if (profile.weight_kg > baseWeight) {
    baseRate += (profile.weight_kg - baseWeight) * 0.1;
  }

  // Age factor: metabolism slows with age
  if (profile.age > 30) {
    const ageFactor = 1 - (profile.age - 30) * 0.01;
    baseRate *= Math.max(0.8, ageFactor);
  }

  // Fitness factor
  const fitnessMultipliers = {
    sedentary: 0.9,
    lightly_active: 0.95,
    moderately_active: 1.05,
    very_active: 1.1,
  };
  baseRate *= fitnessMultipliers[profile.activity_level];

  return Math.max(8, Math.min(15, baseRate));
};

// Calculate Blood Alcohol Content (BAC) estimation
export const calculateEstimatedBAC = (
  drinks: DrinkLog[],
  timePoint: Date,
  profile: UserProfile = DEFAULT_USER_PROFILE
): number => {
  const processingRate = calculateAlcoholProcessingRate(profile);
  let totalAlcoholGrams = 0;

  drinks.forEach((drink) => {
    const drinkTime = new Date(drink.timestamp);
    const hoursElapsed = Math.max(
      0,
      (timePoint.getTime() - drinkTime.getTime()) / (1000 * 60 * 60)
    );

    const alcoholInDrink = calculateAlcoholUnits(drink) * 10;
    const alcoholRemaining = Math.max(
      0,
      alcoholInDrink - hoursElapsed * processingRate
    );

    totalAlcoholGrams += alcoholRemaining;
  });

  // Widmark formula: BAC = (grams alcohol / (body weight * r)) * 100
  const r = profile.gender === "male" ? 0.68 : 0.55;
  const bacPercentage =
    (totalAlcoholGrams / (profile.weight_kg * 1000 * r)) * 100;

  return Math.max(0, bacPercentage);
};

// Get drinks for a specific date (fixed timezone handling)
export const getDrinksForDate = (
  drinks: DrinkLog[],
  date: string
): DrinkLog[] => {
  return drinks.filter((drink) => {
    const drinkDate = new Date(drink.timestamp);
    // Use local date to avoid timezone issues
    const year = drinkDate.getFullYear();
    const month = String(drinkDate.getMonth() + 1).padStart(2, "0");
    const day = String(drinkDate.getDate()).padStart(2, "0");
    const drinkDateString = `${year}-${month}-${day}`;
    return drinkDateString === date;
  });
};

// Get drinks for a date range
export const getDrinksForDateRange = (
  drinks: DrinkLog[],
  startDate: string,
  endDate: string
): DrinkLog[] => {
  const start = new Date(startDate + "T00:00:00.000Z");
  const end = new Date(endDate + "T23:59:59.999Z");

  return drinks.filter((drink) => {
    const drinkDate = new Date(drink.timestamp);
    return drinkDate >= start && drinkDate <= end;
  });
};

// Calculate total alcohol consumption for a list of drinks
export const calculateTotalConsumption = (drinks: DrinkLog[]) => {
  let totalMl = 0;
  let totalOz = 0;
  let totalAlcoholUnits = 0;

  drinks.forEach((drink) => {
    totalMl += drink.amount_ml;
    totalOz += drink.amount_ml * 0.033814;
    totalAlcoholUnits += calculateAlcoholUnits(drink);
  });

  return {
    total_ml: totalMl,
    total_oz: totalOz,
    total_alcohol_units: totalAlcoholUnits,
    drink_count: drinks.length,
  };
};

// Calculate daily consumption
export const calculateDailyConsumption = (drinks: DrinkLog[], date: string) => {
  const dayDrinks = getDrinksForDate(drinks, date);
  return calculateTotalConsumption(dayDrinks);
};

// Medical risk assessment based on consumption patterns
export const assessMedicalRisk = (
  dailyUnits: number,
  weeklyUnits: number,
  bingeDays: number,
  consecutiveDays: number
): "very_low" | "low" | "moderate" | "high" | "very_high" => {
  // Very high risk indicators
  if (dailyUnits >= 10 || weeklyUnits >= 50 || bingeDays >= 3) {
    return "very_high";
  }

  // High risk indicators
  if (
    dailyUnits >= 8 ||
    weeklyUnits >= 35 ||
    (bingeDays >= 2 && consecutiveDays >= 3)
  ) {
    return "high";
  }

  // Moderate risk indicators
  if (
    dailyUnits >= 6 ||
    weeklyUnits >= 21 ||
    bingeDays >= 1 ||
    consecutiveDays >= 5
  ) {
    return "moderate";
  }

  // Low risk
  if (dailyUnits >= 3 || weeklyUnits >= 14) {
    return "low";
  }

  return "very_low";
};

// Calculate liver recovery score based on recent drinking history
export const calculateLiverRecoveryScore = (
  allLogs: DrinkLog[],
  targetDate: string,
  profile: UserProfile = DEFAULT_USER_PROFILE
): number => {
  // Check if this is a recovery day (no drinks today)
  const dayLogs = getDrinksForDate(allLogs, targetDate);
  if (dayLogs.length > 0) {
    return -1; // Not a recovery day, use normal calculation
  }

  // Calculate cumulative liver stress from recent drinking
  let cumulativeStress = 0;
  const recoveryDays = 7; // Look back 7 days for cumulative effect

  for (let i = 1; i <= recoveryDays; i++) {
    const checkDate = new Date(targetDate);
    checkDate.setDate(checkDate.getDate() - i);
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, "0");
    const day = String(checkDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const dayConsumption = calculateDailyConsumption(allLogs, dateStr);
    const units = dayConsumption.total_alcohol_units;

    if (units > 0) {
      // Calculate stress based on units and days ago (exponential decay)
      const daysAgo = i;
      const stressMultiplier = Math.exp(-daysAgo * 0.3); // Stress decreases exponentially

      let dailyStress = 0;
      if (units >= 10) {
        dailyStress = 40; // Extreme binge stress
      } else if (units >= 8) {
        dailyStress = 30; // Heavy binge stress
      } else if (units >= 6) {
        dailyStress = 25; // Binge stress
      } else if (units >= 4) {
        dailyStress = 15; // Heavy drinking stress
      } else if (units >= 2) {
        dailyStress = 8; // Moderate drinking stress
      } else {
        dailyStress = 3; // Light drinking stress
      }

      cumulativeStress += dailyStress * stressMultiplier;
    }
  }

  // Calculate recovery score (100 - cumulative stress)
  const recoveryScore = Math.max(60, 100 - cumulativeStress);

  // console.log(`\n=== LIVER RECOVERY SCORE for ${targetDate} ===`);
  // console.log(`Cumulative liver stress: ${cumulativeStress.toFixed(1)}`);
  // console.log(`Recovery score: ${recoveryScore.toFixed(1)}`);
  // console.log(`==========================================\n`);

  return Math.round(recoveryScore);
};

// Calculate medically accurate daily health score
export const calculateMedicalHealthScore = (
  allLogs: DrinkLog[],
  targetDate: string,
  profile: UserProfile = DEFAULT_USER_PROFILE
): number => {
  const dayLogs = getDrinksForDate(allLogs, targetDate);
  const consumption = calculateDailyConsumption(allLogs, targetDate);
  const units = consumption.total_alcohol_units;

  // Check if this is a recovery day (no drinks today)
  if (units === 0) {
    const recoveryScore = calculateLiverRecoveryScore(
      allLogs,
      targetDate,
      profile
    );
    if (recoveryScore > 0) {
      return recoveryScore; // Return liver recovery score
    }
    // If not a recovery day or no recent drinking, return perfect score
    return 100;
  }

  // Debug logging
  // console.log(`\n=== HEALTH SCORE DEBUG for ${targetDate} ===`);
  // console.log(`Day logs found: ${dayLogs.length}`);
  // console.log(`Total units: ${units}`);

  // Calculate weekly context for risk assessment
  const weekStart = new Date(targetDate);
  weekStart.setDate(weekStart.getDate() - 6);
  // Use local date formatting to avoid timezone issues
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  const weekStartString = `${year}-${month}-${day}`;
  const weekLogs = getDrinksForDateRange(allLogs, weekStartString, targetDate);
  const weeklyUnits = weekLogs.reduce(
    (sum, log) => sum + calculateAlcoholUnits(log),
    0
  );

  // console.log(`Weekly units: ${weeklyUnits}`);

  // Count binge days in past week (6+ units in a day)
  const bingeDays = Array.from(
    new Set(
      weekLogs
        .map((log) => {
          const logDate = new Date(log.timestamp);
          // Use local date formatting to avoid timezone issues
          const year = logDate.getFullYear();
          const month = String(logDate.getMonth() + 1).padStart(2, "0");
          const day = String(logDate.getDate()).padStart(2, "0");
          const logDateString = `${year}-${month}-${day}`;
          const dayConsumption = calculateDailyConsumption(
            allLogs,
            logDateString
          );
          return dayConsumption.total_alcohol_units >= 6 ? logDateString : null;
        })
        .filter(Boolean)
    )
  ).length;

  // console.log(`Binge days: ${bingeDays}`);

  // Count consecutive drinking days
  let consecutiveDays = 0;
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(targetDate);
    checkDate.setDate(checkDate.getDate() - i);
    // Use local date formatting to avoid timezone issues
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, "0");
    const day = String(checkDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const dayConsumption = calculateDailyConsumption(allLogs, dateStr);
    if (dayConsumption.total_alcohol_units > 0) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  // console.log(`Consecutive days: ${consecutiveDays}`);

  // Base score from medical risk assessment
  const risk = assessMedicalRisk(
    units,
    weeklyUnits,
    bingeDays,
    consecutiveDays
  );
  const riskScores = {
    very_low: 90,
    low: 75,
    moderate: 55,
    high: 30,
    very_high: 10,
  };

  let score = riskScores[risk];
  // console.log(`Risk: ${risk}, Base score: ${score}`);

  // Apply additional penalties

  // 1. Binge drinking pattern penalty (drinking too fast)
  let bingePenalty = 0;
  if (dayLogs.length >= 2) {
    const sortedLogs = dayLogs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const drinkingDurationHours =
      (new Date(sortedLogs[sortedLogs.length - 1].timestamp).getTime() -
        new Date(sortedLogs[0].timestamp).getTime()) /
      (1000 * 60 * 60);

    if (drinkingDurationHours < 2 && units >= 4) {
      bingePenalty = 15; // Fast binge drinking
    } else if (drinkingDurationHours < 4 && units >= 6) {
      bingePenalty = 10; // Rapid heavy drinking
    }
  }
  score -= bingePenalty;
  // console.log(`After binge penalty (-${bingePenalty}): ${score}`);

  // 2. Peak BAC estimation penalty
  let bacPenalty = 0;
  if (dayLogs.length > 0) {
    const peakBAC = Math.max(
      ...dayLogs.map((log) =>
        calculateEstimatedBAC(
          dayLogs.filter(
            (l) => new Date(l.timestamp) <= new Date(log.timestamp)
          ),
          new Date(log.timestamp),
          profile
        )
      )
    );

    if (peakBAC >= 0.15) {
      bacPenalty = 20; // Dangerous BAC level
    } else if (peakBAC >= 0.1) {
      bacPenalty = 15; // High BAC level
    } else if (peakBAC >= 0.08) {
      bacPenalty = 10; // Legal intoxication level
    }
  }
  score -= bacPenalty;
  // console.log(`After BAC penalty (-${bacPenalty}): ${score}`);

  // 3. Cumulative liver stress (consecutive days penalty)
  let consecutivePenalty = 0;
  if (consecutiveDays >= 7) {
    consecutivePenalty = 15; // Week+ of continuous drinking
  } else if (consecutiveDays >= 3) {
    consecutivePenalty = 8; // Multiple consecutive days
  }
  score -= consecutivePenalty;
  // console.log(`After consecutive penalty (-${consecutivePenalty}): ${score}`);

  // 4. Bonus for responsible drinking patterns
  let bonus = 0;
  if (units <= 2 && dayLogs.length <= 2) {
    bonus = 5; // Moderate, spaced drinking
  }
  score += bonus;
  // console.log(`After bonus (+${bonus}): ${score}`);

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  // console.log(`Final clamped score: ${finalScore}`);
  // console.log(`=====================================\n`);

  return finalScore;
};

// Calculate recovery time needed after drinking session
export const calculateRecoveryTime = (
  totalAlcoholUnits: number,
  profile: UserProfile = DEFAULT_USER_PROFILE
): number => {
  const processingRate = calculateAlcoholProcessingRate(profile);
  const totalGrams = totalAlcoholUnits * 10;

  // Base recovery time: time to process all alcohol
  const processingHours = totalGrams / processingRate;

  // Add additional recovery time based on liver stress
  let additionalRecovery = 0;
  if (totalAlcoholUnits >= 10) {
    additionalRecovery = 24; // Extreme binge
  } else if (totalAlcoholUnits >= 8) {
    additionalRecovery = 16; // Heavy binge
  } else if (totalAlcoholUnits >= 6) {
    additionalRecovery = 12; // Binge
  } else if (totalAlcoholUnits >= 4) {
    additionalRecovery = 6; // Heavy
  } else if (totalAlcoholUnits >= 2) {
    additionalRecovery = 2; // Moderate
  }

  return processingHours + additionalRecovery;
};

// Calculate weekly consumption
export const calculateWeeklyConsumption = (
  drinks: DrinkLog[],
  startDate: string
): {
  date: string;
  total_ml: number;
  total_oz: number;
  total_alcohol_units: number;
  drink_count: number;
}[] => {
  const results = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateString = currentDate.toISOString().split("T")[0];

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
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
  );

  const totalDrinks = periodDrinks.length;
  const totalAlcoholUnits = periodDrinks.reduce(
    (sum, drink) => sum + calculateAlcoholUnits(drink),
    0
  );
  const averageDailyUnits = totalAlcoholUnits / days;

  // Find most common drink type
  const typeCounts = periodDrinks.reduce((counts, drink) => {
    counts[drink.drink_type] = (counts[drink.drink_type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const mostCommonType =
    Object.entries(typeCounts).reduce(
      (max, [type, count]) =>
        count > (max?.count || 0) ? { type: type as DrinkTypeKey, count } : max,
      null as { type: DrinkTypeKey; count: number } | null
    )?.type || null;

  // Calculate streak (consecutive days with drinks)
  const datesWithDrinks = new Set(
    periodDrinks.map((drink) => new Date(drink.timestamp).toDateString())
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

// Export functions for user profile management
export const getDefaultUserProfile = (): UserProfile => ({
  ...DEFAULT_USER_PROFILE,
});

export const createUserProfile = (
  age: number,
  weight_kg: number,
  gender: "male" | "female",
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active",
  drink_habits: "rarely" | "occasionally" | "regularly" | "frequently"
): UserProfile => ({
  age,
  weight_kg,
  gender,
  activity_level,
  drink_habits,
});
