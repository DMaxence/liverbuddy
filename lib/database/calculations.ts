// export interface DrinkLog {
//   drink_type: 'beer' | 'wine' | 'cocktail' | 'spirits' | 'other';
//   drink_option: 'can' | 'bottle' | 'pint' | 'large' | 'glass' | 'large_glass' |
//                 'standard' | 'strong' | 'double' | 'shot' | 'tall' | 'small' |
//                 'medium' | 'extra_large';
//   amount_ml: number;
//   alcohol_percentage?: number;
//   timestamp: Date;
// }

import { UserProfile, DrinkTypeKey } from "@/types";
import type { DrinkLog } from "@/lib/database/schema";
import { DRINK_TYPES } from "@/utils/drinks";

export interface DayLog {
  date: Date;
  drinks: DrinkLog[];
}

export interface LiverHealthScore {
  daily_score: number; // 0-10 (10 = excellent, 0 = critical)
  global_score: number; // Long-term liver health score
  bac_peak: number; // Peak blood alcohol concentration
  metabolism_time_hours: number; // Time to process all alcohol
  recovery_days_needed: number; // Days needed for liver recovery
  risk_level: "low" | "moderate" | "high" | "critical";
  recommendations: string[];
}

// Standard drink definitions (grams of pure alcohol)
export const STANDARD_DRINK_GRAMS = {
  US: 14, // United States
  WHO: 10, // World Health Organization standard
  UK: 8, // United Kingdom
  AU: 10, // Australia
} as const;

const fitnessMultipliers = {
  sedentary: 0.9,
  lightly_active: 0.95,
  moderately_active: 1.05,
  very_active: 1.1,
};

// =============================================================================
// CORE ALCOHOL CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate alcohol units for a single drink
 * Formula: (volume_ml * ABV * alcohol_density) / 1000
 * Uses ethanol density of 0.789 g/ml at 20°C
 */
export const calculateAlcoholUnits = (drink: DrinkLog): number => {
  const alcoholPercentage =
    drink.alcohol_percentage ||
    DRINK_TYPES[drink.drink_type]?.alcohol_percentage ||
    5;

  // Convert percentage to decimal and calculate pure alcohol mass
  const alcoholMass = drink.amount_ml * (alcoholPercentage / 100) * 0.789;

  return alcoholMass / 10; // Convert to WHO standard units (10g = 1 unit)
};

/**
 * Calculate grams of pure alcohol in a drink
 */
export const calculateAlcoholGrams = (drink: DrinkLog): number => {
  return calculateAlcoholUnits(drink) * 10;
};

// =============================================================================
// BLOOD ALCOHOL CONCENTRATION (BAC) CALCULATIONS
// =============================================================================

/**
 * Calculate Blood Alcohol Concentration using modified Widmark formula
 * BAC = (Alcohol consumed in grams / (Body weight in grams × R)) × 100
 * R = Distribution ratio (0.68 for males, 0.55 for females)
 * Accounts for age and activity level adjustments
 */
export const calculateBAC = (
  alcoholGrams: number,
  userProfile: UserProfile,
  timeElapsedHours: number = 0
): number => {
  const { weight_kg, gender, age, activity_level } = userProfile;

  // Base distribution ratios
  let distributionRatio = gender === "male" ? 0.68 : 0.55;

  // Age adjustments (older adults have less body water)
  if (age > 65) {
    distributionRatio *= 0.92; // 8% reduction for elderly
  } else if (age > 40) {
    distributionRatio *= 0.96; // 4% reduction for middle-aged
  }

  distributionRatio *= fitnessMultipliers[activity_level];

  // Activity level adjustments (more muscle = more water)
  // const activityMultiplier = 1 + (activity_level * 0.02); // 2% increase per activity level
  // distributionRatio *= activityMultiplier;

  // Calculate peak BAC
  const peakBAC = (alcoholGrams / (weight_kg * 1000 * distributionRatio)) * 100;

  // Account for alcohol elimination over time
  const eliminationRate = getAlcoholEliminationRate(userProfile);
  const currentBAC = Math.max(0, peakBAC - eliminationRate * timeElapsedHours);

  return currentBAC;
};

/**
 * Calculate alcohol elimination rate (BAC decrease per hour)
 * Average rate is 0.015% per hour, adjusted for individual factors
 */
export const getAlcoholEliminationRate = (userProfile: UserProfile): number => {
  const { gender, age, weight_kg, activity_level } = userProfile;

  // Base elimination rate (BAC % per hour)
  let baseRate = 0.015;

  // Gender differences - women eliminate slightly faster per unit lean body mass
  if (gender === "female") {
    baseRate *= 1.1; // 10% faster elimination
  }

  // Age adjustments - metabolism slows with age
  if (age > 65) {
    baseRate *= 0.85; // 15% slower for elderly
  } else if (age > 40) {
    baseRate *= 0.95; // 5% slower for middle-aged
  }

  // Weight/body mass adjustments - larger liver typically processes more
  const weightFactor = Math.min(1.2, Math.max(0.8, weight_kg / 70)); // Normalized to 70kg
  baseRate *= weightFactor;

  baseRate *= fitnessMultipliers[activity_level];

  // // Activity level - better cardiovascular health may improve metabolism
  // const activityBonus = 1 + (sport_activity * 0.02); // 2% improvement per level
  // baseRate *= activityBonus;

  return baseRate;
};

/**
 * Calculate time needed to metabolize all alcohol
 */
export const calculateMetabolismTime = (
  totalAlcoholGrams: number,
  userProfile: UserProfile
): number => {
  // Liver processes approximately 10-12g of alcohol per hour for average adult
  let processingRate = 11; // grams per hour

  // Adjust processing rate based on user factors
  const eliminationRate = getAlcoholEliminationRate(userProfile);
  const adjustmentFactor = eliminationRate / 0.015; // Ratio to average
  processingRate *= adjustmentFactor;

  return totalAlcoholGrams / processingRate;
};

// =============================================================================
// LIVER HEALTH SCORING SYSTEM
// =============================================================================

/**
 * Calculate daily liver health score (0-10)
 * Based on alcohol consumption, BAC levels, and recovery time
 */
export const calculateDailyScore = (
  drinks: DrinkLog[],
  userProfile: UserProfile
): number => {
  if (drinks.length === 0) return 10; // Perfect score for no drinking

  const totalAlcoholGrams = drinks.reduce(
    (sum, drink) => sum + calculateAlcoholGrams(drink),
    0
  );

  const peakBAC = calculatePeakBAC(drinks, userProfile);
  const metabolismTime = calculateMetabolismTime(
    totalAlcoholGrams,
    userProfile
  );

  // Score components (0-10 each)
  let score = 10;

  // Penalize based on total alcohol consumed
  const dailyLimit = userProfile.gender === "male" ? 20 : 14; // grams
  const alcoholRatio = totalAlcoholGrams / dailyLimit;
  score -= Math.min(4, alcoholRatio * 2); // Up to 4 points deduction

  // Penalize based on peak BAC
  if (peakBAC > 0.08) score -= 3; // Legal limit exceeded
  else if (peakBAC > 0.05) score -= 2; // Moderate impairment
  else if (peakBAC > 0.02) score -= 1; // Mild impairment

  // Penalize based on metabolism time
  if (metabolismTime > 8) score -= 2; // Long processing time
  else if (metabolismTime > 4) score -= 1;

  return Math.max(0, Math.round(score * 10) / 10);
};

/**
 * Calculate peak BAC for multiple drinks consumed over time
 */
export const calculatePeakBAC = (
  drinks: DrinkLog[],
  userProfile: UserProfile
): number => {
  if (drinks.length === 0) return 0;

  // Sort drinks by timestamp
  const sortedDrinks = [...drinks].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let peakBAC = 0;
  const startTime = new Date(sortedDrinks[0].timestamp).getTime();

  // Calculate BAC at 15-minute intervals
  for (let i = 0; i <= 24 * 4; i++) {
    // Check every 15 minutes for 24 hours
    const currentTime = startTime + i * 15 * 60 * 1000; // 15 minutes in ms
    let currentBAC = 0;

    for (const drink of sortedDrinks) {
      const timeSinceDrink =
        (currentTime - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60); // hours

      if (timeSinceDrink >= 0) {
        // Only count drinks that have been consumed
        const alcoholGrams = calculateAlcoholGrams(drink);
        const drinkBAC = calculateBAC(
          alcoholGrams,
          userProfile,
          timeSinceDrink
        );
        currentBAC += drinkBAC;
      }
    }

    peakBAC = Math.max(peakBAC, currentBAC);
  }

  return peakBAC;
};

/**
 * Calculate global liver health score based on long-term patterns
 * Considers frequency, quantity, and recovery periods
 */
export const calculateGlobalScore = (
  dayLogs: DayLog[],
  userProfile: UserProfile
): number => {
  if (dayLogs.length === 0) return 10;

  let score = 10;
  const recentDays = dayLogs.slice(-30); // Last 30 days

  // Calculate average daily consumption
  const totalAlcoholGrams = recentDays.reduce(
    (sum, day) =>
      sum +
      day.drinks.reduce(
        (daySum, drink) => daySum + calculateAlcoholGrams(drink),
        0
      ),
    0
  );

  const avgDailyAlcohol = totalAlcoholGrams / recentDays.length;
  const weeklyAlcohol = avgDailyAlcohol * 7;

  // WHO guidelines: <100g/week low risk, 100-280g moderate, >280g high risk
  if (weeklyAlcohol > 280) score -= 5; // High risk
  else if (weeklyAlcohol > 100) score -= 2; // Moderate risk

  // Count drinking days and alcohol-free days
  const drinkingDays = recentDays.filter((day) => day.drinks.length > 0).length;
  const drinkingFrequency = drinkingDays / recentDays.length;

  // Penalize frequent drinking (>5 days/week)
  if (drinkingFrequency > 0.71) score -= 2; // >5 days/week
  else if (drinkingFrequency > 0.43) score -= 1; // >3 days/week

  // Reward alcohol-free periods
  const longestSoberStreak = calculateLongestSoberStreak(dayLogs);
  if (longestSoberStreak >= 7) score += 1; // Week+ sober streak
  if (longestSoberStreak >= 30) score += 1; // Month+ sober streak

  // Check for binge drinking patterns
  const bingeDays = recentDays.filter((day) => {
    const dayTotal = day.drinks.reduce(
      (sum, drink) => sum + calculateAlcoholGrams(drink),
      0
    );
    const bingeLimit = userProfile.gender === "male" ? 60 : 48; // grams
    return dayTotal > bingeLimit;
  }).length;

  if (bingeDays > 4) score -= 3; // Frequent binge drinking
  else if (bingeDays > 0) score -= 1; // Occasional binge drinking

  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
};

/**
 * Calculate recovery days needed based on consumption pattern
 */
export const calculateRecoveryDays = (
  drinks: DrinkLog[],
  userProfile: UserProfile
): number => {
  if (drinks.length === 0) return 0;

  const totalAlcoholGrams = drinks.reduce(
    (sum, drink) => sum + calculateAlcoholGrams(drink),
    0
  );

  // Base recovery: 1 day per 20g of alcohol for liver enzyme normalization
  let recoveryDays = totalAlcoholGrams / 20;

  // Additional recovery for heavy consumption
  if (totalAlcoholGrams > 60) recoveryDays += 1; // Extra day for binge
  if (totalAlcoholGrams > 100) recoveryDays += 2; // Extra days for excessive consumption

  // Age adjustments - older adults need more recovery time
  if (userProfile.age > 65) recoveryDays *= 1.5;
  else if (userProfile.age > 40) recoveryDays *= 1.2;

  // Activity level helps recovery
  recoveryDays *= fitnessMultipliers[userProfile.activity_level];

  return Math.ceil(recoveryDays);
};

/**
 * Determine risk level based on consumption and health metrics
 */
export const determineRiskLevel = (
  alcoholGrams: number,
  peakBAC: number,
  userProfile: UserProfile
): "low" | "moderate" | "high" | "critical" => {
  // Critical level indicators
  if (peakBAC > 0.25 || alcoholGrams > 150) return "critical";

  // High risk indicators
  if (peakBAC > 0.15 || alcoholGrams > 80) return "high";

  // Moderate risk indicators
  const moderateLimit = userProfile.gender === "male" ? 40 : 30;
  if (peakBAC > 0.08 || alcoholGrams > moderateLimit) return "moderate";

  return "low";
};

/**
 * Generate personalized recommendations based on consumption and profile
 */
export const generateRecommendations = (
  score: LiverHealthScore,
  userProfile: UserProfile
): string[] => {
  const recommendations: string[] = [];

  if (score.daily_score <= 6) {
    recommendations.push("Consider reducing your alcohol intake slightly.");
    recommendations.push("Try alternating alcoholic drinks with water.");
  } else if (score.daily_score <= 4) {
    recommendations.push(
      "Your liver needs some care. Consider a break from alcohol."
    );
    recommendations.push("Focus on hydration and nutrition today.");
    recommendations.push("Avoid drinking for the next 24-48 hours.");
  } else if (score.daily_score <= 2) {
    recommendations.push("⚠️ High alcohol consumption detected.");
    recommendations.push("Take a break from alcohol for several days.");
    recommendations.push("Consider speaking with a healthcare provider.");
    recommendations.push("Monitor for symptoms like nausea or abdominal pain.");
  }

  // Recovery-specific recommendations
  if (score.recovery_days_needed > 2) {
    recommendations.push(
      `Allow ${score.recovery_days_needed} days for liver recovery.`
    );
    recommendations.push("Support recovery with plenty of water and rest.");
  }

  // Age-specific recommendations
  if (userProfile.age > 65) {
    recommendations.push(
      "As we age, alcohol processing slows. Consider lower limits."
    );
  }

  // Activity-based recommendations
  if (
    userProfile.activity_level === "sedentary" ||
    userProfile.activity_level === "lightly_active"
  ) {
    recommendations.push("Regular exercise can improve alcohol metabolism.");
  }

  return recommendations;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate longest consecutive alcohol-free streak
 */
export const calculateLongestSoberStreak = (dayLogs: DayLog[]): number => {
  if (dayLogs.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;

  const sortedLogs = [...dayLogs].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  for (const day of sortedLogs) {
    if (day.drinks.length === 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
};

/**
 * Check if consumption pattern indicates potential alcohol use disorder
 */
export const checkAUDRisk = (
  dayLogs: DayLog[],
  userProfile: UserProfile
): boolean => {
  const recentDays = dayLogs.slice(-30);
  if (recentDays.length < 7) return false; // Need at least a week of data

  const drinkingDays = recentDays.filter((day) => day.drinks.length > 0).length;
  const averageDaily =
    recentDays.reduce(
      (sum, day) =>
        sum +
        day.drinks.reduce(
          (daySum, drink) => daySum + calculateAlcoholGrams(drink),
          0
        ),
      0
    ) / recentDays.length;

  // Risk indicators
  const frequentDrinking = drinkingDays > recentDays.length * 0.6; // >60% of days
  const heavyDaily = averageDaily > (userProfile.gender === "male" ? 40 : 30);
  const bingeDays = recentDays.filter((day) => {
    const dayTotal = day.drinks.reduce(
      (sum, drink) => sum + calculateAlcoholGrams(drink),
      0
    );
    return dayTotal > (userProfile.gender === "male" ? 60 : 48);
  }).length;
  const frequentBinge = bingeDays > 4;

  return frequentDrinking && (heavyDaily || frequentBinge);
};

// =============================================================================
// MAIN CALCULATION FUNCTION
// =============================================================================

/**
 * Main function to calculate comprehensive liver health assessment
 * Uses accurate or simple calculations based on the accurate setting
 */
export const calculateLiverHealth = (
  dayLogs: DayLog[],
  userProfile: UserProfile,
  targetDate?: Date,
  useAccurateCalculations?: boolean
): LiverHealthScore => {
  // If useAccurateCalculations is explicitly false, use simple calculations
  if (useAccurateCalculations === false) {
    return calculateSimpleLiverHealth(dayLogs, userProfile, targetDate);
  }

  // Default to accurate calculations (existing logic)
  const today = targetDate || new Date();
  const todayLog = dayLogs.find(
    (log) => log.date.toDateString() === today.toDateString()
  );

  const todayDrinks = todayLog?.drinks || [];

  // Calculate metrics
  const totalAlcoholGrams = todayDrinks.reduce(
    (sum, drink) => sum + calculateAlcoholGrams(drink),
    0
  );

  const daily_score = calculateDailyScore(todayDrinks, userProfile);
  const global_score = calculateGlobalScore(dayLogs, userProfile);
  const bac_peak = calculatePeakBAC(todayDrinks, userProfile);
  const metabolism_time_hours = calculateMetabolismTime(
    totalAlcoholGrams,
    userProfile
  );
  const recovery_days_needed = calculateRecoveryDays(todayDrinks, userProfile);
  const risk_level = determineRiskLevel(
    totalAlcoholGrams,
    bac_peak,
    userProfile
  );

  const score: LiverHealthScore = {
    daily_score,
    global_score,
    bac_peak,
    metabolism_time_hours,
    recovery_days_needed,
    risk_level,
    recommendations: [],
  };

  score.recommendations = generateRecommendations(score, userProfile);

  console.log("-------------Simple liver health score:", score, daily_score);

  return score;
};

// =============================================================================
// UTILITY FUNCTIONS FROM LEGACY CALCULATIONS
// =============================================================================

/**
 * Get drinks for a specific date (fixed timezone handling)
 */
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

/**
 * Get drinks for a date range
 */
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

/**
 * Calculate total alcohol consumption for a list of drinks
 */
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

/**
 * Calculate daily consumption
 */
export const calculateDailyConsumption = (drinks: DrinkLog[], date: string) => {
  const dayDrinks = getDrinksForDate(drinks, date);
  return calculateTotalConsumption(dayDrinks);
};

/**
 * Calculate weekly consumption
 */
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

/**
 * Calculate drink statistics
 */
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

/**
 * Calculate liver recovery score based on recent drinking history (legacy function)
 * This is kept for compatibility with existing code using medical health scores
 */
export const calculateLiverRecoveryScore = (
  allLogs: DrinkLog[],
  targetDate: string,
  profile: UserProfile
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
  return Math.round(recoveryScore);
};

/**
 * Medical risk assessment based on consumption patterns (legacy function)
 */
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

/**
 * Calculate medically accurate daily health score (legacy function)
 * This maintains compatibility with the existing UI while providing the medical scoring approach
 */
export const calculateMedicalHealthScore = (
  allLogs: DrinkLog[],
  targetDate: string,
  profile?: UserProfile
): number => {
  // Use default profile if none provided (for backwards compatibility)
  const userProfile: UserProfile = profile || {
    age: 25,
    weight_kg: 75,
    gender: "male",
    activity_level: "lightly_active",
    drink_habits: "occasionally",
  };

  const dayLogs = getDrinksForDate(allLogs, targetDate);
  const consumption = calculateDailyConsumption(allLogs, targetDate);
  const units = consumption.total_alcohol_units;

  // Check if this is a recovery day (no drinks today)
  if (units === 0) {
    const recoveryScore = calculateLiverRecoveryScore(
      allLogs,
      targetDate,
      userProfile
    );
    if (recoveryScore > 0) {
      return recoveryScore; // Return liver recovery score
    }
    // If not a recovery day or no recent drinking, return perfect score
    return 100;
  }

  // Calculate weekly context for risk assessment
  const weekStart = new Date(targetDate);
  weekStart.setDate(weekStart.getDate() - 6);
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  const weekStartString = `${year}-${month}-${day}`;
  const weekLogs = getDrinksForDateRange(allLogs, weekStartString, targetDate);
  const weeklyUnits = weekLogs.reduce(
    (sum, log) => sum + calculateAlcoholUnits(log),
    0
  );

  // Count binge days in past week (6+ units in a day)
  const bingeDays = Array.from(
    new Set(
      weekLogs
        .map((log) => {
          const logDate = new Date(log.timestamp);
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

  // Count consecutive drinking days
  let consecutiveDays = 0;
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(targetDate);
    checkDate.setDate(checkDate.getDate() - i);
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

  // 2. Peak BAC estimation penalty
  let bacPenalty = 0;
  if (dayLogs.length > 0) {
    const peakBAC = calculatePeakBAC(dayLogs, userProfile);

    if (peakBAC >= 0.15) {
      bacPenalty = 20; // Dangerous BAC level
    } else if (peakBAC >= 0.1) {
      bacPenalty = 15; // High BAC level
    } else if (peakBAC >= 0.08) {
      bacPenalty = 10; // Legal intoxication level
    }
  }
  score -= bacPenalty;

  // 3. Cumulative liver stress (consecutive days penalty)
  let consecutivePenalty = 0;
  if (consecutiveDays >= 7) {
    consecutivePenalty = 15; // Week+ of continuous drinking
  } else if (consecutiveDays >= 3) {
    consecutivePenalty = 8; // Multiple consecutive days
  }
  score -= consecutivePenalty;

  // 4. Bonus for responsible drinking patterns
  let bonus = 0;
  if (units <= 2 && dayLogs.length <= 2) {
    bonus = 5; // Moderate, spaced drinking
  }
  score += bonus;

  return Math.max(0, Math.min(100, Math.round(score)));
};

// =============================================================================
// SIMPLE CALCULATION FUNCTIONS (TEST FEATURE)
// =============================================================================

/**
 * Simple liver health calculation based on alcohol quantity only
 * 100/100 = no drinks
 * 60/100 = 1 bottle of wine (750ml at 12.5%) or 1.5L beer (at 5%)
 * 0/100 = perfect hangover: 2.5 bottles wine or 3.5L beer (if spaced), reduced if binge
 */
export const calculateSimpleLiverScore = (
  drinks: DrinkLog[],
  userProfile?: UserProfile
): number => {
  if (drinks.length === 0) return 100; // Perfect score for no drinking

  // Calculate total alcohol units
  const totalAlcoholUnits = drinks.reduce(
    (sum, drink) => sum + calculateAlcoholUnits(drink),
    0
  );

  console.log(
    `Simple calculation: ${drinks.length} drinks, ${totalAlcoholUnits.toFixed(
      2
    )} units`
  );

  // Reference points:
  // 1 bottle wine (750ml at 12.5%) = ~7.4 units
  // 1.5L beer (at 5%) = ~7.5 units
  // At 60/100: ~7.5 units
  // At 0/100: ~18.75 units (2.5 bottles wine) if spaced, less if binge

  const maxUnitsSpaced = 18.75; // 2.5 bottles of wine equivalent
  const moderateUnits = 7.5; // 1 bottle wine / 1.5L beer equivalent

  // Check for binge drinking (drinks consumed too quickly)
  let bingePenalty = 0;
  if (drinks.length >= 2) {
    const sortedDrinks = [...drinks].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const drinkingDurationHours =
      (new Date(sortedDrinks[sortedDrinks.length - 1].timestamp).getTime() -
        new Date(sortedDrinks[0].timestamp).getTime()) /
      (1000 * 60 * 60);

    // If drinks consumed very quickly, apply penalty
    if (drinkingDurationHours < 2 && totalAlcoholUnits >= moderateUnits) {
      bingePenalty = 15; // Reduce max capacity by 15%
    } else if (
      drinkingDurationHours < 4 &&
      totalAlcoholUnits >= moderateUnits * 1.5
    ) {
      bingePenalty = 10; // Reduce max capacity by 10%
    }
  }

  // Calculate effective max units considering binge penalty
  const effectiveMaxUnits = maxUnitsSpaced * (1 - bingePenalty / 100);

  // Linear calculation between 100 (no drinks) and 0 (max capacity)
  let score = 100 - (totalAlcoholUnits / effectiveMaxUnits) * 100;

  // Ensure score stays within 0-100 range
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  console.log(
    `Simple calculation result: ${finalScore} (effectiveMaxUnits: ${effectiveMaxUnits.toFixed(
      2
    )})`
  );
  return finalScore;
};

/**
 * Simple daily consumption assessment
 */
export const calculateSimpleDailyScore = (
  drinks: DrinkLog[],
  userProfile?: UserProfile
): number => {
  const score100 = calculateSimpleLiverScore(drinks, userProfile);
  return score100 / 10; // Convert from 0-100 scale to 0-10 scale to match interface
};

/**
 * Simple global score (just average of recent days for simplicity)
 */
export const calculateSimpleGlobalScore = (
  dayLogs: DayLog[],
  userProfile?: UserProfile
): number => {
  if (dayLogs.length === 0) return 10; // Return 10 on 0-10 scale

  const recentDays = dayLogs.slice(-7); // Last 7 days
  const dailyScores = recentDays.map(
    (day) => calculateSimpleDailyScore(day.drinks, userProfile) // Use the 0-10 scale function
  );

  const averageScore =
    dailyScores.reduce((sum, score) => sum + score, 0) / dailyScores.length;
  return Math.round(averageScore * 10) / 10; // Round to 1 decimal place
};

/**
 * Simple liver health calculation (alternative to complex medical calculation)
 */
export const calculateSimpleLiverHealth = (
  dayLogs: DayLog[],
  userProfile: UserProfile,
  targetDate?: Date
): LiverHealthScore => {
  const today = targetDate || new Date();
  const todayLog = dayLogs.find(
    (log) => log.date.toDateString() === today.toDateString()
  );

  const todayDrinks = todayLog?.drinks || [];

  // Simple calculations
  const daily_score = calculateSimpleDailyScore(todayDrinks, userProfile);
  const global_score = calculateSimpleGlobalScore(dayLogs, userProfile);

  // Basic values for other required fields
  const totalAlcoholGrams = todayDrinks.reduce(
    (sum, drink) => sum + calculateAlcoholGrams(drink),
    0
  );

  const bac_peak = calculatePeakBAC(todayDrinks, userProfile); // Keep accurate BAC
  const metabolism_time_hours = totalAlcoholGrams / 10; // Simple: 10g per hour
  const recovery_days_needed = Math.ceil(totalAlcoholGrams / 20); // Simple: 1 day per 20g

  // Simple risk level based on daily score (on 0-10 scale)
  let risk_level: "low" | "moderate" | "high" | "critical";
  if (daily_score >= 8) risk_level = "low";
  else if (daily_score >= 6) risk_level = "moderate";
  else if (daily_score >= 3) risk_level = "high";
  else risk_level = "critical";

  const score: LiverHealthScore = {
    daily_score,
    global_score,
    bac_peak,
    metabolism_time_hours,
    recovery_days_needed,
    risk_level,
    recommendations: [],
  };

  // Simple recommendations (on 0-10 scale)
  if (daily_score <= 7) {
    score.recommendations = [
      "Moderate drinking detected. Consider slowing down.",
    ];
  } else if (daily_score <= 3) {
    score.recommendations = ["Heavy drinking. Take a break and hydrate."];
  } else if (daily_score <= 1) {
    score.recommendations = [
      "⚠️ Excessive drinking. Stop and seek help if needed.",
    ];
  }

  return score;
};

// =============================================================================
// EXPORT ALL FUNCTIONS
// =============================================================================

// All functions are already exported individually above
