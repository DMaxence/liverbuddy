import React from "react";
import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "../ThemedText";
import { useTranslation } from "@/hooks/useTranslation";

interface LastNightSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const LastNightSlider: React.FC<LastNightSliderProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  // Get slider label based on value
  const getSliderLabel = (value: number): { text: string; emoji: string } => {
    if (value === 0) return { text: t("stoneColdSober"), emoji: "🧘" };
    if (value <= 2) return { text: t("barelyABuzz"), emoji: "😌" };
    if (value <= 5) return { text: t("feelingTipsy"), emoji: "😏" };
    if (value <= 9) return { text: t("nightGotInteresting"), emoji: "🍻" };
    if (value <= 12) return { text: t("whoBoughtLastRound"), emoji: "🤔" };
    return {
      text: t("dontEvenRemember"),
      emoji: "🤯",
    };
  };

  const sliderLabel = getSliderLabel(value);

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {t("howHeavyWasLastNight")}
      </ThemedText>

      {/* Slider Label */}
      <View style={styles.sliderLabelContainer}>
        <ThemedText style={styles.sliderMainLabel}>
          {sliderLabel.text}
        </ThemedText>
        <ThemedText style={styles.sliderEmoji}>
          {sliderLabel.emoji}
        </ThemedText>
      </View>

      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={1}
        maximumValue={15}
        step={1}
        minimumTrackTintColor={Colors.light.tint}
        maximumTrackTintColor="#E0E0E0"
        renderStepNumber
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  sliderLabelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderMainLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  sliderEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  sliderThumb: {
    backgroundColor: Colors.light.tint,
    width: 20,
    height: 20,
  },
}); 