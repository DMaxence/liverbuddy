import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SOURCES = [
  "https://www.who.int/news-room/fact-sheets/detail/alcohol",
  "https://www.cdc.gov/alcohol/fact-sheets/alcohol-use.htm",
  "https://www.niaaa.nih.gov/alcohols-effects-health/alcohols-effects-body",
  "https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/",
  "https://www.healthline.com/health/how-long-does-alcohol-stay-in-your-system",
  "https://pubs.niaaa.nih.gov/publications/Medicine/physiology.html",
  "https://www.sciencedirect.com/science/article/pii/S0899900713002896",
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3950448/",
  "https://www.verywellmind.com/how-long-does-alcohol-stay-in-your-system-80246",
  "https://www.britannica.com/science/alcohol-metabolism",
  "https://www.ncbi.nlm.nih.gov/books/NBK68270/",
  "https://www.samhsa.gov/resource/ebp/alcohol-metabolism-and-ethanol-toxicity",
];

export default function SupportScreen() {
  const { t } = useTranslation();
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const sections = [
    {
      id: "how-scoring-works",
      title: t("howScoringWorks"),
      content: t("howScoringWorksDescription"),
      icon: "🔬",
    },
    {
      id: "accurate-calculations",
      title: t("accurateCalculations"),
      content: t("accurateCalculationsDescription"),
      icon: "⚡",
      details: [
        t("accurateFactor1"),
        t("accurateFactor2"),
        t("accurateFactor3"),
        t("accurateFactor4"),
        t("accurateFactor5"),
        t("accurateFactor6"),
        t("accurateFactor7"),
        t("accurateFactor8"),
      ],
    },
    {
      id: "simple-calculations",
      title: t("simpleCalculations"),
      content: t("simpleCalculationsDescription"),
      icon: "📊",
      details: [t("simpleFactor1"), t("simpleFactor2"), t("simpleFactor3")],
    },
    {
      id: "scoring-system",
      title: t("scoringSystem"),
      content: t("scoringSystemDescription"),
      icon: "📈",
      details: [
        t("scoringSystem1"),
        t("scoringSystem2"),
        t("scoringSystem3"),
        t("scoringSystem4"),
      ],
    },
    {
      id: "score-ranges",
      title: t("scoreRanges"),
      content: t("scoreRangesDescription"),
      icon: "🎯",
      details: [
        t("scoreRange1"),
        t("scoreRange2"),
        t("scoreRange3"),
        t("scoreRange4"),
        t("scoreRange5"),
      ],
    },
    {
      id: "health-guidelines",
      title: t("healthGuidelines"),
      content: t("healthGuidelinesDescription"),
      icon: "🏥",
      details: [
        t("healthGuideline1"),
        t("healthGuideline2"),
        t("healthGuideline3"),
        t("healthGuideline4"),
      ],
    },
    {
      id: "advanced-features",
      title: t("advancedFeatures"),
      content: t("advancedFeaturesDescription"),
      icon: "🔬",
      details: [
        t("advancedFeature1"),
        t("advancedFeature2"),
        t("advancedFeature3"),
        t("advancedFeature4"),
      ],
    },
    {
      id: "recommendations",
      title: t("recommendations"),
      content: t("recommendationsDescription"),
      icon: "💡",
      details: [
        t("recommendation1"),
        t("recommendation2"),
        t("recommendation3"),
        t("recommendation4"),
      ],
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            <ThemedText style={styles.backText}>{t("back")}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>{t("support")} 🆘</ThemedText>
          <ThemedText style={styles.subtitle}>
            {t("supportSubtitle")}
          </ThemedText>
        </View> */}

        {/* Content Sections */}
        {sections.map((section, index) => (
          <View key={section.id} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionIcon}>{section.icon}</ThemedText>
              <ThemedText style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </View>
            <ThemedText style={styles.sectionContent}>
              {section.content}
            </ThemedText>

            {section.details && (
              <View style={styles.detailsContainer}>
                {section.details.map((detail, detailIndex) => (
                  <View key={detailIndex} style={styles.detailItem}>
                    <ThemedText style={styles.bulletPoint}>•</ThemedText>
                    <ThemedText style={styles.detailText}>{detail}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Sources Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.sourcesHeader}
            onPress={() => setSourcesExpanded(!sourcesExpanded)}
          >
            <View style={styles.sourcesHeaderContent}>
              <ThemedText style={styles.sectionIcon}>📚</ThemedText>
              <ThemedText style={styles.sectionTitle}>
                {t("sources")}
              </ThemedText>
            </View>
            <IconSymbol
              name={sourcesExpanded ? "chevron.up" : "chevron.down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {sourcesExpanded && (
            <View style={styles.sourcesContainer}>
              <ThemedText style={styles.sourcesDescription}>
                {t("sourcesDescription")}
              </ThemedText>
              {SOURCES.map((source, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sourceItem}
                  onPress={() => Linking.openURL(source)}
                >
                  <ThemedText style={styles.sourceNumber}>
                    {index + 1}.
                  </ThemedText>
                  <ThemedText style={styles.sourceText}>{source}</ThemedText>
                  <IconSymbol name="arrow.up.right" size={16} color="#007AFF" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {t("supportFooter")}
          </ThemedText>
          <ThemedText style={styles.footerText}>
            {t("supportDisclaimer")}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 17,
    color: "#007AFF",
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#11181C",
    flex: 1,
  },
  sectionContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: Colors.light.backgroundTint,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  sourcesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.backgroundTint,
    borderRadius: 12,
    marginTop: 12,
  },
  sourcesHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourcesDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  sourcesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sourceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sourceNumber: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "bold",
    marginRight: 10,
  },
  sourceText: {
    fontSize: 15,
    color: "#007AFF",
    lineHeight: 22,
    flex: 1,
    textDecorationLine: "underline",
  },
});
