import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { useCallback } from "react";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../theme";

type ShoppingListItemProps = {
  name: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  onDelete?: () => void;
};

export function ShoppingListItem({
  name,
  isCompleted,
  onToggleComplete,
  onDelete,
}: ShoppingListItemProps) {
  const handleDelete = useCallback(() => {
    Alert.alert(
      `Are you sure you want to delete ${name}?`,
      "It will be gone for good",
      [
        {
          text: "Yes",
          onPress: () => onDelete?.(),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  }, [name, onDelete]);

  return (
    <View
      style={[
        styles.itemContainer,
        isCompleted ? styles.completedContainer : null,
      ]}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggleComplete}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`Mark ${name} as ${isCompleted ? "incomplete" : "complete"}`}
      >
        <AntDesign
          name={isCompleted ? "check-circle" : "minus-circle"}
          size={24}
          color={
            isCompleted ? theme.colors.colorGrey : theme.colors.colorCerulean
          }
        />
      </TouchableOpacity>
      <Text
        style={[styles.itemText, isCompleted ? styles.completedText : null]}
      >
        {name}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${name}`}
      >
        <AntDesign
          name="close-circle"
          size={24}
          color={isCompleted ? theme.colors.colorGrey : theme.colors.colorRed}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorCerulean,
    paddingHorizontal: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedContainer: {
    backgroundColor: theme.colors.colorLightGrey,
    borderBottomColor: theme.colors.colorLightGrey,
  },
  checkbox: {
    padding: 8,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "200",
    flex: 1,
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    textDecorationColor: theme.colors.colorGrey,
    color: theme.colors.colorGrey,
  },
  button: {
    padding: 8,
  },
});
