import { Colors } from "@/constants/Colors";
import { DrinkType, LiverState, liverStates } from "@/types";

export const getLiverStateByScore = (score: number): LiverState => {
  return (
    liverStates.find(
      (state) => score >= state.scoreRange[0] && score <= state.scoreRange[1]
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


export const getDrinkTypes = (t: any): DrinkType[] => [
  {
    id: "beer",
    name: t("beer"),
    emoji: "🍺",
    defaultAmount: 330,
    defaultUnit: "mL",
    options: [
      { amount: 330, unit: "mL", label: `${t("can")} (330mL)` },
      { amount: 500, unit: "mL", label: `${t("bottle")} (500mL)` },
      { amount: 473, unit: "mL", label: `${t("pint")} (473mL)` },
      { amount: 1, unit: "L", label: `${t("large")} (1L)` },
    ],
  },
  {
    id: "wine",
    name: t("wine"),
    emoji: "🍷",
    defaultAmount: 5,
    defaultUnit: "oz",
    options: [
      { amount: 5, unit: "oz", label: `${t("glass")} (5oz)` },
      { amount: 6, unit: "oz", label: `${t("largeGlass")} (6oz)` },
      { amount: 750, unit: "mL", label: `${t("bottle")} (750mL)` },
    ],
  },
  {
    id: "cocktail",
    name: t("cocktail"),
    emoji: "🍸",
    defaultAmount: 1,
    defaultUnit: "drink",
    options: [
      { amount: 1, unit: "drink", label: `${t("standard")} (1 ${t("drink")})` },
      {
        amount: 1.5,
        unit: "drink",
        label: `${t("strong")} (1.5 ${t("drinks")})`,
      },
      { amount: 2, unit: "drink", label: `${t("double")} (2 ${t("drinks")})` },
    ],
  },
  {
    id: "spirits",
    name: t("spirits"),
    emoji: "🥃",
    defaultAmount: 1.5,
    defaultUnit: "oz",
    options: [
      { amount: 1, unit: "oz", label: `${t("shot")} (1oz)` },
      { amount: 1.5, unit: "oz", label: `${t("standard")} (1.5oz)` },
      { amount: 2, unit: "oz", label: `${t("double")} (2oz)` },
    ],
  },
  {
    id: "other",
    name: t("other"),
    emoji: "🥤",
    defaultAmount: 1,
    defaultUnit: "drink",
    options: [
      { amount: 1, unit: "drink", label: `${t("standard")} (1 ${t("drink")})` },
      {
        amount: 1.5,
        unit: "drink",
        label: `${t("strong")} (1.5 ${t("drinks")})`,
      },
      { amount: 2, unit: "drink", label: `${t("double")} (2 ${t("drinks")})` },
    ],
  },
];
