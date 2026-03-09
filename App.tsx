import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { ShoppingListItem } from "./components/ShoppingListItem";
import { theme } from "./theme";
import { AntDesign } from "@expo/vector-icons";

type ShoppingItem = {
  id: string;
  name: string;
  isCompleted: boolean;
};

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [deletedItem, setDeletedItem] = useState<ShoppingItem | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const handleAddItem = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: trimmedValue,
      isCompleted: false,
    };

    setItems((prevItems) => [newItem, ...prevItems]);
    setInputValue("");
    Keyboard.dismiss();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Add item..."
          placeholderTextColor={theme.colors.colorGrey}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add item to shopping list"
        >
          <AntDesign name="plus" size={32} color={theme.colors.colorCerulean} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
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
            <Text style={styles.emptyText}>Your shopping list is empty</Text>
            <Text style={styles.emptySubtext}>Add items above to get started</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
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
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorLightGrey,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.colorLightGrey,
    borderRadius: 8,
  },
  addButton: {
    padding: 4,
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
