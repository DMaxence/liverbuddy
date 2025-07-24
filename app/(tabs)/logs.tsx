import React, { useMemo, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
import { useUser } from "@/hooks/useUser";

interface LogSection {
  title: string;
  data: DrinkLog[];
}

export default function LogsScreen() {
  const { t } = useTranslation();
  const { data } = useDrinkLogs("local-user");
  const { userData } = useUser("local-user");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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

  // Get all log IDs for select all functionality
  const allLogIds = useMemo(() => {
    return sections.flatMap((section) => section.data.map((item) => item.id));
  }, [sections]);

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteDrinkLog(logId);
      // No need to manually refresh - SQLiteProvider will handle it
    } catch (error) {
      console.error("Error deleting drink log:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      t("deleteSelectedDrinks"),
      t("deleteSelectedDrinksMessage", {
        count: selectedItems.size.toString(),
        plural: selectedItems.size === 1 ? "" : "s",
      }),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              // Delete all selected items
              await Promise.all(
                Array.from(selectedItems).map((id) => deleteDrinkLog(id))
              );
              // Clear selection and exit selection mode
              setSelectedItems(new Set());
              setIsSelectionMode(false);
            } catch (error) {
              console.error("Error deleting drink logs:", error);
            }
          },
        },
      ]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === allLogIds.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(allLogIds));
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const renderSectionHeader = ({ section }: { section: LogSection }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
    </ThemedView>
  );

  const renderLogItem = ({ item }: { item: DrinkLog }) => {
    const isSelected = selectedItems.has(item.id);

    if (isSelectionMode) {
      return (
        <TouchableOpacity
          style={[styles.logItem, isSelected && styles.logItemSelected]}
          onPress={() => toggleItemSelection(item.id)}
        >
          <View style={styles.logContent}>
            <View
              style={[
                styles.selectionIndicator,
                isSelected && styles.selectionIndicatorSelected,
              ]}
            >
              {isSelected && (
                <ThemedText style={styles.checkmark}>✓</ThemedText>
              )}
            </View>
            <ThemedText style={styles.logEmoji}>
              {getDrinkTypeEmoji(item.drink_type)}
            </ThemedText>
            <View style={styles.logInfo}>
              <ThemedText style={styles.logName}>
                {item.drink_name || t(item.drink_type)} -{" "}
                {formatDrinkAmount(
                  item.amount_ml,
                  userData?.preferred_unit || "ml"
                )}
              </ThemedText>
              <ThemedText style={styles.logTime}>
                {formatTime(item.timestamp)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
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
          menuTitle: t("actions"),
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
              actionTitle: t("deleteDrink"),
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
                userData?.preferred_unit || "ml"
              )}
            </ThemedText>
            <ThemedText style={styles.logTime}>
              {formatTime(item.timestamp)}
            </ThemedText>
          </View>
        </View>
      </ContextMenuView>
    );
  };

  const renderItemSeparator = () => <View style={styles.itemSeparator} />;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left side - Select All button (only visible in selection mode) */}
          <View style={styles.headerLeft}>
            {isSelectionMode && (
              <TouchableOpacity
                onPress={toggleSelectAll}
                style={styles.headerButton}
              >
                <View
                  style={[
                    styles.selectionIndicator,
                    selectedItems.size === allLogIds.length &&
                      styles.selectionIndicatorSelected,
                  ]}
                >
                  {selectedItems.size === allLogIds.length && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Center - Title */}
          <ThemedText style={styles.headerTitle}>{t("listDrinks")}</ThemedText>

          {/* Right side - Edit/Done button */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={styles.headerButton}
            >
              <ThemedText style={styles.headerButtonText}>
                {isSelectionMode ? t("done") : t("edit")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Bulk delete button (only visible in selection mode with items selected) */}
      {isSelectionMode && selectedItems.size > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleBulkDelete}
            style={styles.deleteButton}
          >
            <ThemedText style={styles.deleteButtonText}>
              {t("deleteItem", {
                count: selectedItems.size.toString(),
                plural: selectedItems.size === 1 ? "" : "s",
              })}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "400",
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "bold",
    color: "#11181C",
    textAlign: "center",
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
  logItemSelected: {
    backgroundColor: "#E3F2FD",
  },
  logContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  selectionIndicatorSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "bold",
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
  bottomBar: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
