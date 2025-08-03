import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { MiniCalendar } from "@/components/MiniCalendar";
import { NewDrinkModal } from "@/components/NewDrinkModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/hooks/useUser";
import { createDrinkLog } from "@/services/drinkService";
import { useLanguage } from "@/stores/uiStore";
import { getLiverStateByScore, getLocalizedLiverState } from "@/utils";
import { getMostRecentDrink, isWithinLastHour } from "@/utils/dateUtils";
import { getDrinkTypeEmoji } from "@/utils/drinks";
import { formatDrinkAmount } from "@/utils/formatDrinkAmount";
import {
  formatDate,
  formatRelativeTime,
  formatTime,
  getGreeting,
  getQuickAddButtonText,
} from "@/utils/mockData";
import { toast } from "sonner-native";

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
  const [modalMode, setModalMode] = useState<"normal" | "lastNight">("normal");
  const { userData } = useUser("local-user");
  const language = useLanguage();
  const { t } = useTranslation();
  const baseLiverState = getLiverStateByScore(userData?.healthScore ?? 100);
  const liverState = getLocalizedLiverState(baseLiverState, t);
  const progressPercentage = ((userData?.healthScore ?? 100) / 100) * 100;

  const greeting = getGreeting(language);
  const currentDate = formatDate(new Date(), language);

  const handleLogDrink = () => {
    const { mode } = getQuickAddButtonText(userData, language);
    setModalMode(mode);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleDayPress = (date: string) => {
    // TODO: Navigate to calendar day view
    router.push(`/calendar?date=${date}`);
  };

  const handleSettingsPress = () => {
    // TODO: Navigate to settings
    console.log("Settings pressed");
  };

  // Quick add functionality for recent drinks
  const getMostRecentDrinkWithinHour = () => {
    if (!userData?.recentLogs || userData.recentLogs.length === 0) {
      return null;
    }

    const mostRecent = getMostRecentDrink(userData.recentLogs);
    if (mostRecent && isWithinLastHour(mostRecent.timestamp)) {
      return mostRecent;
    }
    return null;
  };

  const recentDrinkWithinHour = getMostRecentDrinkWithinHour();

  const handleQuickAddDrink = async () => {
    if (!recentDrinkWithinHour) return;

    try {
      await createDrinkLog({
        drink_type: recentDrinkWithinHour.drink_type,
        drink_option: recentDrinkWithinHour.drink_option,
        drink_name: recentDrinkWithinHour.drink_name,
        amount_ml: recentDrinkWithinHour.amount_ml,
        alcohol_percentage: recentDrinkWithinHour.alcohol_percentage,
      });

      // Show success toast
      const drinkName =
        recentDrinkWithinHour.drink_name || t(recentDrinkWithinHour.drink_type);
      const amount = formatDrinkAmount(
        recentDrinkWithinHour.amount_ml,
        userData?.preferred_unit || "ml"
      );
      toast.success(`${t("drinkAddedToast")} ${amount} ${drinkName} 🍺`, {
        description: t("drinkAddedSuccess"),
      });
    } catch (error) {
      console.error("Error adding quick drink:", error);
      toast.error(t("drinkAddError"), {
        description: t("drinkAddErrorDescription"),
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.appTitle}>{t("appTitle")}</ThemedText>
          {/* <View style={styles.headerLeft}>
          </View> */}
          {/* <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <ThemedText style={styles.settingsIcon}>⚙️</ThemedText>
          </TouchableOpacity> */}
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
            {Math.round(userData?.healthScore ?? 100)}
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
            {/* <TouchableOpacity style={styles.infoIcon}>
              <ThemedText style={styles.infoText}>ℹ</ThemedText>
            </TouchableOpacity> */}
          </View>
        </ThemedView>

        {/* Drinking Stats */}
        <ThemedView style={styles.statsSection}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>{t("lastDrink")}</ThemedText>
            <ThemedText style={styles.statValue}>
              {userData?.lastDrinkTimestamp
                ? formatRelativeTime(userData?.lastDrinkTimestamp, language)
                : t("never")}
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>
              {t("thisWeeksDrinks")}
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {userData?.weeklyDrinks}/{userData?.weeklyGoal}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Recommendations Section */}
        {userData?.recommendations && userData.recommendations.length > 0 && (
          <ThemedView style={styles.recommendationsSection}>
            <ThemedText style={styles.recommendationsTitle}>
              {t("recommendations")}
            </ThemedText>
            {userData.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                {userData.recommendations.length > 1 && (
                  <ThemedText style={styles.recommendationBullet}>•</ThemedText>
                )}
                <ThemedText style={styles.recommendationText}>
                  {recommendation}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {/* Add button */}
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={handleLogDrink}
        >
          <ThemedText style={styles.quickAddButtonText}>
            {getQuickAddButtonText(userData, language).text}
          </ThemedText>
        </TouchableOpacity>

        {/* Quick repeat button for recent drinks */}
        {recentDrinkWithinHour && (
          <TouchableOpacity
            style={styles.quickRepeatButton}
            onPress={handleQuickAddDrink}
          >
            <ThemedText style={styles.quickRepeatButtonText}>
              {`${t("add")} `}
              {formatDrinkAmount(
                recentDrinkWithinHour.amount_ml,
                userData?.preferred_unit || "ml"
              )}
              {` ${t("of")} `}
              {recentDrinkWithinHour.drink_name ||
                t(recentDrinkWithinHour.drink_type)}{" "}
              {getDrinkTypeEmoji(recentDrinkWithinHour.drink_type)}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Recent Logs */}
        <View style={styles.logsSection}>
          <ThemedText style={styles.logsTitle}>{t("recentDrinks")}</ThemedText>
          {userData?.recentLogs &&
          userData?.recentLogs.length &&
          userData?.recentLogs.length > 0 ? (
            userData?.recentLogs.map((drink, index) => (
              <TouchableOpacity
                key={drink.id}
                onPress={() => router.push("/logs")}
              >
                <View style={styles.logItem}>
                  <View style={styles.logLeft}>
                    <ThemedText style={styles.logEmoji}>
                      {getDrinkTypeEmoji(drink.drink_type)}
                    </ThemedText>
                    <View style={styles.logInfo}>
                      <ThemedText style={styles.logName}>
                        {drink.drink_name || t(drink.drink_type)} -{" "}
                        {formatDrinkAmount(
                          drink.amount_ml,
                          userData?.preferred_unit || "ml"
                        )}
                      </ThemedText>
                      <ThemedText style={styles.logTime}>
                        {formatRelativeTime(drink.timestamp, language)}
                        {" - "}
                        {formatTime(drink.timestamp, language)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                {index < Object.entries(userData?.drinks || {}).length - 1 && (
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

      {/* New Drink Modal */}
      {userData && (
        <NewDrinkModal
          userData={userData}
          visible={isModalVisible}
          onClose={handleCloseModal}
          initialMode={modalMode}
        />
      )}
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
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "flex-start",
    marginTop: 60,
    marginBottom: 20,
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
    textAlign: "center",
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
    marginBottom: 10,
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
  recommendationsSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 16,
  },
  recommendationItem: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  recommendationBullet: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
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
  quickAddButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  quickRepeatButton: {
    backgroundColor: Colors.light.medium.color,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickRepeatButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
