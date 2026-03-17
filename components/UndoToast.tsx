import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";

type UndoToastProps = {
  itemName: string;
  onUndo: () => void;
};

export function UndoToast({ itemName, onUndo }: UndoToastProps) {
  return (
    <View style={styles.undoContainer}>
      <Text style={styles.undoText}>{`"${itemName}" deleted`}</Text>
      <TouchableOpacity
        onPress={onUndo}
        style={styles.undoButton}
        accessibilityRole="button"
        accessibilityLabel="Undo deletion"
      >
        <Text style={styles.undoButtonText}>UNDO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
