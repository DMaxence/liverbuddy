import { LiverState, liverStates } from "@/types";

export const getLiverStateByScore = (score: number): LiverState => {
  return (
    liverStates.find(
      (state) => score >= state.scoreRange[0] && score <= state.scoreRange[1]
    ) || liverStates[liverStates.length - 1]
  );
};
