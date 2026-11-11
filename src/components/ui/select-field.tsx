import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label?: string;
  value: string | null;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  containerClassName?: string;
};

const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
  helperText,
  disabled = false,
  containerClassName,
}: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selected = options.find(
    (option) => option.value === value
  );

  function close() {
    setOpen(false);
  }

  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={label ?? placeholder}
        accessibilityValue={{
          text: selected?.label ?? placeholder,
        }}
        disabled={disabled}
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={[
          styles.field,
          error ? styles.fieldError : null,
          open ? styles.fieldOpen : null,
          disabled ? styles.disabled : null,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            { color: selected ? NAVY : "#7B8798" },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>

        <ChevronDown
          size={18}
          color="#7B8798"
          strokeWidth={1.8}
        />
      </Pressable>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <Modal
        visible={open && !disabled}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <View style={styles.modal}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close selection"
            onPress={close}
            style={{
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}}
          />

          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.sheetHeader}>
              <Text
                accessibilityRole="header"
                style={styles.sheetTitle}
              >
                {label ?? placeholder}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close selection"
                onPress={close}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <FlatList
              data={options}
              extraData={value}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No options available.
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: isSelected,
                    }}
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}
                    style={[
                      styles.option,
                      isSelected
                        ? styles.selectedOption
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected
                          ? styles.selectedOptionText
                          : null,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View style={styles.checkContainer}>
                      {isSelected ? (
                        <Check
                          size={20}
                          color={GREEN}
                          strokeWidth={2.4}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    color: NAVY,
    fontSize: 14,
    fontWeight: "500",
  },
  field: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  fieldOpen: {
    borderColor: GREEN,
  },
  fieldError: {
    borderColor: "#F87171",
  },
  disabled: {
    opacity: 0.5,
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
  },
  helperText: {
    marginTop: 6,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    marginTop: 6,
    color: "#DC2626",
    fontSize: 12,
    lineHeight: 18,
  },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(7, 25, 45, 0.35)",
  },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingLeft: 24,
    paddingRight: 12,
    paddingBottom: 8,
  },
  sheetTitle: {
    flex: 1,
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 4,
    borderRadius: 12,
  },
  selectedOption: {
    backgroundColor: "#E4F5EB",
  },
  optionText: {
    flex: 1,
    color: NAVY,
    fontSize: 15,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: GREEN,
    fontWeight: "600",
  },
  checkContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    padding: 16,
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
  },
});