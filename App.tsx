import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingListItem } from "./components/ShoppingListItem";
import { InputBar } from "./components/InputBar";
import { theme } from "./theme";

type ShoppingItem = {
  id: string;
  name: string;
  isCompleted: boolean;
};

type FilterType = "all" | "active" | "completed";

const STORAGE_KEY = "@shopping_list_items";

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletedItem, setDeletedItem] = useState<ShoppingItem | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load items from AsyncStorage on mount
  useEffect(() => {
    loadItems();
  }, []);

  // Save items to AsyncStorage whenever they change
  useEffect(() => {
    saveItems();
  }, [items]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const saveItems = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving items:", error);
    }
  };

  const handleAddItem = (name: string) => {
    // Validate: Check for duplicates (case-insensitive)
    const duplicate = items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      Alert.alert("Duplicate Item", `"${name}" is already in your list`, [
        { text: "OK" },
      ]);
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      isCompleted: false,
    };

    setItems((prevItems) => [newItem, ...prevItems]);
  };

  const handleToggleComplete = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  };

  const handleDelete = (id: string) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;

    // Remove item and save for undo
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setDeletedItem(itemToDelete);

    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Auto-hide undo after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedItem(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (deletedItem) {
      setItems((prevItems) => [...prevItems, deletedItem]);
      setDeletedItem(null);

      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    }
  };

  const handleClearCompleted = () => {
    const completedCount = items.filter((item) => item.isCompleted).length;

    if (completedCount === 0) return;

    Alert.alert(
      "Clear Completed",
      `Delete ${completedCount} completed item${completedCount > 1 ? "s" : ""}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setItems((prevItems) =>
              prevItems.filter((item) => !item.isCompleted),
            );
          },
          style: "destructive",
        },
      ],
    );
  };

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = items;

    // Apply filter
    if (filter === "active") {
      filtered = items.filter((item) => !item.isCompleted);
    } else if (filter === "completed") {
      filtered = items.filter((item) => item.isCompleted);
    }

    // Sort: incomplete items first
    return filtered.sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  };

  const filteredItems = getFilteredItems();
  const activeCount = items.filter((item) => !item.isCompleted).length;
  const completedCount = items.filter((item) => item.isCompleted).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {activeCount} active · {completedCount} completed
            </Text>
          </View>
        </View>

        <InputBar onAddItem={handleAddItem} />

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "active" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("active")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "active" && styles.filterTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "completed" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("completed")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "completed" && styles.filterTextActive,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          {completedCount > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCompleted}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShoppingListItem
              name={item.name}
              isCompleted={item.isCompleted}
              onToggleComplete={() => handleToggleComplete(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? "Your shopping list is empty"
                  : filter === "active"
                    ? "No active items"
                    : "No completed items"}
              </Text>
              <Text style={styles.emptySubtext}>
                {filter === "all" && "Add items above to get started"}
              </Text>
            </View>
          }
          contentContainerStyle={
            filteredItems.length === 0 ? styles.emptyList : undefined
          }
        />

        {deletedItem && (
          <View style={styles.undoContainer}>
            <Text style={styles.undoText}>"{deletedItem.name}" deleted</Text>
            <TouchableOpacity
              onPress={handleUndo}
              style={styles.undoButton}
              accessibilityRole="button"
              accessibilityLabel="Undo deletion"
            >
              <Text style={styles.undoButtonText}>UNDO</Text>
            </TouchableOpacity>
          </View>
        )}
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorLightGrey,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.colorCerulean,
  },
  statsContainer: {
    marginTop: 4,
  },
  statsText: {
    fontSize: 14,
    color: theme.colors.colorGrey,
  },
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
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.colorGrey,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.colorGrey,
  },
  undoContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.colorBlack,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  undoText: {
    color: theme.colors.colorWhite,
    fontSize: 16,
    flex: 1,
  },
  undoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  undoButtonText: {
    color: theme.colors.colorCerulean,
    fontWeight: "bold",
    fontSize: 14,
  },
});
