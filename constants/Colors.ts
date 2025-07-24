/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#040416";
const tintColorDark = "#040416";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fcf7e4",
    backgroundTint: "#efe6d2",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    good: { background: "#dcedcc", color: "#b6e6a2" },
    medium: { background: "#ffefc2", color: "#ffd98e" },
    bad: { background: "#fdd9c8", color: "#f99d97" },
  },
  dark: {
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
};
