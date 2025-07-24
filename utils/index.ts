import { Colors } from "@/constants/Colors";
import { LiverState, liverStates, getLocalizedLiverState } from "@/types";

export const getLiverStateByScore = (score: number): LiverState => {
  return (
    liverStates.find(
      (state) =>
        Math.floor(score) >= state.scoreRange[0] &&
        Math.floor(score) <= state.scoreRange[1]
    ) || liverStates[liverStates.length - 1]
  );
};

export const getDayBackgroundColor = (liverState: number): string => {
  switch (liverState) {
    case 1:
    case 2:
      return Colors.light.good.background;
    case 3:
    case 4:
      return Colors.light.medium.background;
    case 5:
    case 6:
      return Colors.light.bad.background;
    default:
      return Colors.light.background;
  }
};

export const getDotColor = (liverState: number): string => {
  switch (liverState) {
    case 1:
    case 2:
      return Colors.light.good.color;
    case 3:
    case 4:
      return Colors.light.medium.color;
    case 5:
    case 6:
      return Colors.light.bad.color;
    default:
      return Colors.light.background;
  }
};

// Re-export the new drink functions for backward compatibility
export {
  calculateTotalAlcohol,
  formatDrinkOption,
  getDefaultDrinkOption,
  getDrinkOption,
  getDrinkTypes,
  validateDrinkLog,
} from "./drinks";

// Re-export the localized liver state function
export { getLocalizedLiverState };
