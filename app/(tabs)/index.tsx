import { Image, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getLiverStateByScore } from "@/utils";

// Import all liver images statically
const liverImages = {
  1: require("@/assets/images/liver-level-1.png"),
  2: require("@/assets/images/liver-level-2.png"),
  3: require("@/assets/images/liver-level-3.png"),
  4: require("@/assets/images/liver-level-4.png"),
  5: require("@/assets/images/liver-level-5.png"),
  6: require("@/assets/images/liver-level-6.png"),
};

export default function HomeScreen() {
  // Mock score for now - this would come from your actual data
  const score = 94;
  const liverState = getLiverStateByScore(score);
  
  // Calculate progress bar percentage
  const progressPercentage = (score / 100) * 100;
  
  // Mock data for stats
  const drinksThisWeek = 3;
  const daysSober = 5;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.appTitle}>LiverBuddy</ThemedText>
        <View style={styles.helpButton}>
          <ThemedText style={styles.helpText}>?</ThemedText>
        </View>
      </ThemedView>

      {/* Liver Character & Health Score */}
      <ThemedView style={styles.characterSection}>
        <Image 
          source={liverImages[liverState.level as keyof typeof liverImages]}
          style={styles.liverImage}
          resizeMode="contain"
        />
        <ThemedText style={styles.healthScore}>{score}</ThemedText>
        <ThemedView style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </ThemedView>
        <View style={styles.healthLabel}>
          <ThemedText style={styles.healthText}>health</ThemedText>
          <View style={styles.infoIcon}>
            <ThemedText style={styles.infoText}>i</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Stats Section */}
      <ThemedView style={styles.statsSection}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>drinks this week</ThemedText>
          <ThemedText style={styles.statValue}>{drinksThisWeek}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>days sober</ThemedText>
          <ThemedText style={styles.statValue}>{daysSober}</ThemedText>
        </View>
      </ThemedView>

      {/* Liver State Description */}
      <ThemedView style={styles.stateSection}>
        <ThemedText style={styles.stateTitle}>Current State</ThemedText>
        <View style={styles.stateItem}>
          <ThemedText style={styles.stateEmoji}>{liverState.emoji}</ThemedText>
          <View style={styles.stateInfo}>
            <ThemedText style={styles.stateName}>{liverState.name}</ThemedText>
            <ThemedText style={styles.stateDescription}>{liverState.description}</ThemedText>
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FEFEFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11181C',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  liverImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  healthScore: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  healthLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthText: {
    fontSize: 14,
    color: '#666',
  },
  infoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: 'bold',
    color: '#11181C',
  },
  stateSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 16,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stateEmoji: {
    fontSize: 32,
  },
  stateInfo: {
    flex: 1,
  },
  stateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 4,
  },
  stateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
