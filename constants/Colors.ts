/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#040416";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fcf7e4",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    good: { background: "#dcedcc", color: "#b6e6a2" },
    medium: { background: "#ffefc2", color: "#ffd98e" },
    bad: { background: "#fdd9c8", color: "#f99d97" },
  },
  dark: {
    text: "#ECEDEE",
    background: "#efe6d2",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    good: { background: "#dcedcc", color: "#b6e6a2" },
    medium: { background: "#ffefc2", color: "#ffd98e" },
    bad: { background: "#fdd9c8", color: "#f99d97" },
  },
};
