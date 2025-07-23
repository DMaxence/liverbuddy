import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { FloatingActionButton } from "@/components/FloatingActionButton";
import { MiniCalendar } from "@/components/MiniCalendar";
import { NewDrinkModal } from "@/components/NewDrinkModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "@/hooks/useTranslation";
import { getLiverStateByScore } from "@/utils";
import {
  formatDate,
  formatRelativeTime,
  formatTime,
  getDaysSinceLastDrink,
  getGreeting,
  mockUserData,
} from "@/utils/mockData";

// Import all liver images statically
const shadow = require("@/assets/images/shadow.png");
const liverImages = {
  1: require("@/assets/images/liver-level-1.png"),
  2: require("@/assets/images/liver-level-2.png"),
  3: require("@/assets/images/liver-level-3.png"),
  4: require("@/assets/images/liver-level-4.png"),
  5: require("@/assets/images/liver-level-5.png"),
  6: require("@/assets/images/liver-level-6.png"),
};

export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const userData = mockUserData;
  const liverState = getLiverStateByScore(userData.healthScore);
  const progressPercentage = (userData.healthScore / 100) * 100;
  const daysSinceLastDrink = getDaysSinceLastDrink(userData.lastDrinkDate);
  const greeting = getGreeting();
  const currentDate = formatDate(new Date());
  const { t } = useTranslation();

  const handleLogDrink = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleDrinkLogged = (drink: {
    type: string;
    name: string;
    amount: number;
    unit: string;
    emoji: string;
    notes?: string;
    timestamp?: Date;
  }) => {
    // TODO: Add drink to mock data and update health score
    console.log("Drink logged:", drink);
    // For now, just close the modal
    setIsModalVisible(false);
  };

  const handleDayPress = (date: string) => {
    // TODO: Navigate to calendar day view
    console.log("Day pressed:", date);
  };

  const handleSettingsPress = () => {
    // TODO: Navigate to settings
    console.log("Settings pressed");
  };

  console.log(greeting);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.appTitle}>{t("appTitle")}</ThemedText>
            <ThemedText style={styles.greeting}>
              {t("hey")} {userData.name},
            </ThemedText>
            <ThemedText style={styles.date}>{currentDate}</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <ThemedText style={styles.settingsIcon}>⚙️</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Liver Avatar & Health Score */}
        <ThemedView style={styles.characterSection}>
          <Image source={shadow} style={styles.shadow} />
          <Image
            source={liverImages[liverState.level as keyof typeof liverImages]}
            style={styles.liverImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.healthScore}>
            {userData.healthScore}
          </ThemedText>
          <ThemedView style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: liverState.color,
                },
              ]}
            />
          </ThemedView>
          <View style={styles.stateLabel}>
            <ThemedText style={styles.stateText}>{liverState.name}</ThemedText>
            <TouchableOpacity style={styles.infoIcon}>
              <ThemedText style={styles.infoText}>ℹ</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Drinking Stats */}
        <ThemedView style={styles.statsSection}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>{t("lastDrink")}</ThemedText>
            <ThemedText style={styles.statValue}>
              {userData.lastDrinkDate
                ? `${daysSinceLastDrink} ${t("daysAgo")}`
                : t("never")}
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>
              {t("thisWeeksDrinks")}
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {userData.weeklyDrinks}/{userData.weeklyGoal}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Recent Logs */}
        <View style={styles.logsSection}>
          <ThemedText style={styles.logsTitle}>{t("recentLogs")}</ThemedText>
          {Object.values(mockUserData.drinks).length > 0 ? (
            Object.values(mockUserData.drinks)[0]
              .slice(0, 3)
              .map((drink, index) => (
                <TouchableOpacity
                  key={drink.id}
                  onPress={() => router.push("/logs")}
                >
                  <View style={styles.logItem}>
                    <View style={styles.logLeft}>
                      <ThemedText style={styles.logEmoji}>
                        {drink.emoji}
                      </ThemedText>
                      <View style={styles.logInfo}>
                        <ThemedText style={styles.logName}>
                          {drink.name} - {drink.amount}
                          {drink.unit}
                        </ThemedText>
                        <ThemedText style={styles.logTime}>
                          {formatRelativeTime(drink.timestamp)}{" "}
                          {formatTime(drink.timestamp)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  {index < Object.entries(mockUserData.drinks).length - 1 && (
                    <View style={styles.logDivider} />
                  )}
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                {t("emptyStateMessage")}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Mini Calendar */}
        <MiniCalendar onDayPress={handleDayPress} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleLogDrink} />

      {/* New Drink Modal */}
      <NewDrinkModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onLogDrink={handleDrinkLogged}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 80,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 60,
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 18,
    color: "#666",
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: "#999",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 20,
  },
  characterSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  liverImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  shadow: {
    width: 180,
    height: 180,
    marginBottom: 20,
    position: "absolute",
  },
  healthScore: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "80%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  stateLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
  infoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#11181C",
  },
  logsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 20,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 16,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  logLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#11181C",
    marginBottom: 2,
  },
  logTime: {
    fontSize: 14,
    color: "#666",
  },
  logDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
