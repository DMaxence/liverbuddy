import { useEffect, useRef } from "react";
import { updateAppIcon } from "@/utils/appIcon";
import { useHealthScore, useSetHealthScore } from "@/stores/uiStore";

/**
 * Hook to automatically update app icon when health score changes
 * @param healthScore - The current health score
 */
export const useAppIcon = (newHealthScore: number) => {
  const healthScore = useHealthScore();
  const setHealthScore = useSetHealthScore();

  useEffect(() => {
    // Only update if the health score has actually changed
    if (healthScore !== newHealthScore) {
      const updateIcon = async () => {
        try {
          await updateAppIcon(healthScore, newHealthScore);
        } catch (error) {
          console.error("Error updating app icon:", error);
        } finally {
          // previousHealthScore.current = healthScore;
        }
      };

      // Add a small delay to ensure the health score calculation is complete
      setTimeout(updateIcon, 100);
    }

    // Update the previous health score reference
    setHealthScore(newHealthScore);
  }, [newHealthScore, healthScore, setHealthScore]);
};
