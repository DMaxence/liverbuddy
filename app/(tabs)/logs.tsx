import React, { useMemo, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "@/hooks/useTranslation";
import {
  DrinkLog,
  formatDate,
  formatTime,
  mockUserData,
} from "@/utils/mockData";

interface LogSection {
  title: string;
  data: DrinkLog[];
}

export default function LogsScreen() {
  const { t } = useTranslation();

  // Group logs by day
  const sections = useMemo(() => {
    const groupedLogs: { [key: string]: DrinkLog[] } = {};

    // Use the new drinks structure directly
    Object.entries(mockUserData.drinks).forEach(([dateKey, logsForDay]) => {
      if (logsForDay.length > 0) {
        groupedLogs[dateKey] = logsForDay;
      }
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
  }, []);

  const handleDeleteLog = (logId: string) => {
    console.log("Delete pressed for log:", logId);
    // TODO: Implement actual deletion logic
    Alert.alert("Delete Log", "Log deletion will be implemented soon!");
  };

  const renderSectionHeader = ({ section }: { section: LogSection }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
    </ThemedView>
  );

  const renderLogItem = ({ item }: { item: DrinkLog }) => (
    <TouchableOpacity
      style={styles.logItem}
      onLongPress={() => handleDeleteLog(item.id)}
      onPress={() => console.log("Log pressed:", item.id)}
    >
      <View style={styles.logContent}>
        <ThemedText style={styles.logEmoji}>{item.emoji}</ThemedText>
        <View style={styles.logInfo}>
          <ThemedText style={styles.logName}>
            {item.name} - {item.amount}
            {item.unit}
          </ThemedText>
          <ThemedText style={styles.logTime}>
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
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
    paddingVertical: 16,
    paddingHorizontal: 0,
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
