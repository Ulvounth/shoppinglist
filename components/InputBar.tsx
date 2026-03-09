import { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../theme";

type InputBarProps = {
  onAddItem: (name: string) => void;
};

export function InputBar({ onAddItem }: InputBarProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    onAddItem(trimmedValue);
    setInputValue("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Add item..."
        placeholderTextColor={theme.colors.colorGrey}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Add item to shopping list"
      >
        <AntDesign name="plus" size={32} color={theme.colors.colorCerulean} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
