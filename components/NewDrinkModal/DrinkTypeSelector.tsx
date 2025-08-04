import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { DrinkType } from "@/types";
import { getDrinkTypes } from "@/utils";
import { ThemedText } from "../ThemedText";

interface DrinkTypeSelectorProps {
  selectedType: DrinkType;
  onTypeSelect: (type: DrinkType) => void;
}

export const DrinkTypeSelector: React.FC<DrinkTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const { t } = useTranslation();
  const drinkTypes = getDrinkTypes((key: string) => t(key as any));

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {t("whatDidYouDrink")}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {drinkTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typePill,
              selectedType.id === type.id && styles.selectedTypePill,
            ]}
            onPress={() => onTypeSelect(type)}
          >
            <ThemedText style={styles.typeEmoji}>
              {type.emoji}
            </ThemedText>
            <ThemedText
              style={[
                styles.typeName,
                selectedType.id === type.id && styles.selectedTypeName,
              ]}
            >
              {t(type.name_key as any)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  typePill: {
    backgroundColor: "#F8F8F8",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 6,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
  },
  selectedTypePill: {
    borderColor: Colors.light.tint,
    backgroundColor: "#E3F2FD",
    transform: [{ scale: 1.05 }],
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  selectedTypeName: {
    color: Colors.light.tint,
  },
}); 