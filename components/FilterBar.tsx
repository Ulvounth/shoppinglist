import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FilterType } from "../hooks/useShoppingList";
import { theme } from "../theme";

type FilterBarProps = {
  completedCount: number;
  filter: FilterType;
  onClearCompleted: () => void;
  onFilterChange: (filter: FilterType) => void;
};

const FILTER_OPTIONS: FilterType[] = ["all", "active", "completed"];

export function FilterBar({
  completedCount,
  filter,
  onClearCompleted,
  onFilterChange,
}: FilterBarProps) {
  return (
    <View style={styles.filterContainer}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = filter === option;

        return (
          <TouchableOpacity
            key={option}
            style={[styles.filterButton, isActive && styles.filterButtonActive]}
            onPress={() => onFilterChange(option)}
          >
            <Text
              style={[styles.filterText, isActive && styles.filterTextActive]}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}

      {completedCount > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={onClearCompleted}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorLightGrey,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.colorLightGrey,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.colorCerulean,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.colorGrey,
  },
  filterTextActive: {
    color: theme.colors.colorWhite,
  },
  clearButton: {
    marginLeft: "auto",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.colorRed,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.colorWhite,
  },
});
