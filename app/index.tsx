import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FilterBar } from "../components/FilterBar";
import { InputBar } from "../components/InputBar";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { UndoToast } from "../components/UndoToast";
import { useShoppingList } from "../hooks/useShoppingList";
import { theme } from "../theme";

export default function App() {
  const {
    activeCount,
    completedCount,
    deletedItem,
    filter,
    filteredItems,
    handleAddItem,
    handleClearCompleted,
    handleDelete,
    handleToggleComplete,
    handleUndo,
    isHydrated,
    setFilter,
  } = useShoppingList();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {activeCount} active | {completedCount} completed
            </Text>
          </View>
        </View>

        <InputBar onAddItem={handleAddItem} />

        <FilterBar
          completedCount={completedCount}
          filter={filter}
          onClearCompleted={handleClearCompleted}
          onFilterChange={setFilter}
        />

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
                {!isHydrated
                  ? "Loading your shopping list..."
                  : filter === "all"
                    ? "Your shopping list is empty"
                    : filter === "active"
                      ? "No active items"
                      : "No completed items"}
              </Text>
              <Text style={styles.emptySubtext}>
                {isHydrated && filter === "all"
                  ? "Add items above to get started"
                  : ""}
              </Text>
            </View>
          }
          contentContainerStyle={
            filteredItems.length === 0 ? styles.emptyList : undefined
          }
        />

        {deletedItem && (
          <UndoToast itemName={deletedItem.item.name} onUndo={handleUndo} />
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
});
