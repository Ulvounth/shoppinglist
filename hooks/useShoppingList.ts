import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

export type ShoppingItem = {
  id: string;
  name: string;
  isCompleted: boolean;
};

export type FilterType = "all" | "active" | "completed";

type DeletedItemState = {
  item: ShoppingItem;
  index: number;
};

const STORAGE_KEY = "@shopping_list_items";

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletedItem, setDeletedItem] = useState<DeletedItemState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted) return;

        if (storedItems) {
          const parsedItems = JSON.parse(storedItems) as ShoppingItem[];
          setItems(Array.isArray(parsedItems) ? parsedItems : []);
        }
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const saveItems = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving items:", error);
      }
    };

    saveItems();
  }, [isHydrated, items]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const handleAddItem = useCallback((name: string) => {
    setItems((prevItems) => {
      const normalizedName = name.trim().toLowerCase();
      const duplicate = prevItems.some(
        (item) => item.name.trim().toLowerCase() === normalizedName,
      );

      if (duplicate) {
        Alert.alert("Duplicate Item", `"${name}" is already in your list`, [
          { text: "OK" },
        ]);
        return prevItems;
      }

      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name,
        isCompleted: false,
      };

      return [newItem, ...prevItems];
    });
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === id);
      if (index === -1) {
        return prevItems;
      }

      const itemToDelete = prevItems[index];
      setDeletedItem({ item: itemToDelete, index });

      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }

      undoTimeoutRef.current = setTimeout(() => {
        setDeletedItem(null);
      }, 5000);

      return prevItems.filter((item) => item.id !== id);
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (!deletedItem) return;

    setItems((prevItems) => {
      const nextItems = [...prevItems];
      nextItems.splice(deletedItem.index, 0, deletedItem.item);
      return nextItems;
    });

    setDeletedItem(null);

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
  }, [deletedItem]);

  const handleClearCompleted = useCallback(() => {
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
  }, [items]);

  const filteredItems = useMemo(() => {
    const filtered =
      filter === "active"
        ? items.filter((item) => !item.isCompleted)
        : filter === "completed"
          ? items.filter((item) => item.isCompleted)
          : items;

    return [...filtered].sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  }, [filter, items]);

  const activeCount = useMemo(
    () => items.filter((item) => !item.isCompleted).length,
    [items],
  );
  const completedCount = useMemo(
    () => items.filter((item) => item.isCompleted).length,
    [items],
  );

  return {
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
  };
}
