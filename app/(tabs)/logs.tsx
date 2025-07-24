import React, { useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { ContextMenuView } from "react-native-ios-context-menu";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useDrinkLogs } from "@/hooks/useDrinkLogs";
import { useTranslation } from "@/hooks/useTranslation";
import { DrinkLog } from "@/lib/database/schema";
import { deleteDrinkLog } from "@/services/drinkService";
import { getDrinkTypeEmoji } from "@/utils/drinks";
import { formatDrinkAmount } from "@/utils/formatDrinkAmount";
import { formatDate, formatTime } from "@/utils/mockData";

interface LogSection {
  title: string;
  data: DrinkLog[];
}

export default function LogsScreen() {
  const { t } = useTranslation();
  const { data } = useDrinkLogs("local-user");

  // Group logs by day
  const sections = useMemo(() => {
    const groupedLogs: { [key: string]: DrinkLog[] } = {};

    // Group the flat array of logs by date
    (data || []).forEach((log) => {
      const date = new Date(log.timestamp);
      const dateString = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      if (!groupedLogs[dateString]) {
        groupedLogs[dateString] = [];
      }
      groupedLogs[dateString].push(log);
    });

    // Convert to SectionList format and sort by date (newest first)
    return Object.entries(groupedLogs)
      .map(([dateKey, logsForDay]) => ({
        title: formatDate(new Date(dateKey)),
        data: logsForDay.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.data[0].timestamp).getTime() -
          new Date(a.data[0].timestamp).getTime()
      );
  }, [data]);

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteDrinkLog(logId);
      // No need to manually refresh - SQLiteProvider will handle it
    } catch (error) {
      console.error("Error deleting drink log:", error);
    }
  };

  const renderSectionHeader = ({ section }: { section: LogSection }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
    </ThemedView>
  );

  const renderLogItem = ({ item }: { item: DrinkLog }) => (
    <ContextMenuView
      style={styles.logItem}
      onPressMenuItem={({
        nativeEvent,
      }: {
        nativeEvent: { actionKey: string };
      }) => {
        switch (nativeEvent.actionKey) {
          // case "view":
          //   console.log("View drink details:", item.id);
          //   break;
          // case "edit":
          //   console.log("Edit drink:", item.id);
          //   break;
          case "delete":
            handleDeleteLog(item.id);
            break;
        }
      }}
      menuConfig={{
        menuTitle: "Actions",
        menuItems: [
          {
            //   actionKey: 'view',
            //   actionTitle: 'View Details',
            //   icon: {
            //     type: 'IMAGE_SYSTEM',
            //     imageValue: {
            //       systemName: 'eye',
            //     },
            //   },
            // }, {
            //   actionKey: 'edit',
            //   actionTitle: 'Edit Drink',
            //   icon: {
            //     type: 'IMAGE_SYSTEM',
            //     imageValue: {
            //       systemName: 'pencil',
            //     },
            //   },
            // },

            actionKey: "delete",
            actionTitle: "Delete Drink",
            menuAttributes: ["destructive"],
            icon: {
              type: "IMAGE_SYSTEM",
              imageValue: {
                systemName: "trash",
              },
            },
          },
        ],
      }}
    >
      <View style={styles.logContent}>
        <ThemedText style={styles.logEmoji}>
          {getDrinkTypeEmoji(item.drink_type)}
        </ThemedText>
        <View style={styles.logInfo}>
          <ThemedText style={styles.logName}>
            {item.drink_name || t(item.drink_type)} -{" "}
            {formatDrinkAmount(
              item.amount_ml,
              "ml"
              // userData?.preferred_unit || "oz"
            )}
          </ThemedText>
          <ThemedText style={styles.logTime}>
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    </ContextMenuView>
  );

  const renderItemSeparator = () => <View style={styles.itemSeparator} />;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>{t("recentLogs")}</ThemedText>
      </ThemedView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={renderItemSeparator}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "bold",
    color: "#11181C",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#11181C",
  },
  logItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: Colors.light.background,
    // Add subtle visual feedback for context menu
    borderRadius: 8,
  },
  logContent: {
    flexDirection: "row",
    alignItems: "center",
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
  itemSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
