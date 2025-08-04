import { setAppIcon } from "@howincodes/expo-dynamic-app-icon";

const getLiverLevel = (healthScore: number): number => {
  if (healthScore >= 85) {
    return 1; // Perfectly healthy
  } else if (healthScore >= 70) {
    return 2; // Kinda vibing
  } else if (healthScore >= 55) {
    return 3; // Lowkey struggling
  } else if (healthScore >= 40) {
    return 4; // Running on regret
  } else if (healthScore >= 25) {
    return 5; // Deeply concerned
  } else {
    return 6; // Legally deceased
  }
};

/**
 * Update app icon based on health score
 * @param healthScore - The current health score (0-100)
 */
export const updateAppIcon = async (
  oldHealthScore: number,
  newHealthScore: number
): Promise<void> => {
  try {
    const oldLiverLevel = getLiverLevel(oldHealthScore);
    const newLiverLevel = getLiverLevel(newHealthScore);
    if (oldLiverLevel === newLiverLevel) {
      return;
    }

    // Set app icon based on liver level
    if (newLiverLevel === 1) {
      await setAppIcon(null); // Reset to default (liver state 1)
    } else {
      await setAppIcon(
        `liver-level-${newLiverLevel}` as
          | "liver-level-2"
          | "liver-level-3"
          | "liver-level-4"
          | "liver-level-5"
          | "liver-level-6"
          | null
      );
    }

    console.log(
      `App icon updated to liver-level-${newLiverLevel} (health score: ${newHealthScore})`
    );
  } catch (error) {
    console.error("Error updating app icon:", error);
  }
};
