import { AlertTriangle, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel = "Keep Match",
  loadingLabel = "Cancelling...",
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-end bg-black/40 px-4 pb-4">
        <View className="w-full rounded-3xl bg-white p-6 shadow-xl">
          <View className="flex-row items-start justify-between gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={22} color="#DC2626" />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              disabled={loading}
              onPress={onCancel}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <X size={20} color="#94A3B8" />
            </Pressable>
          </View>

          <Text className="mt-5 text-xl font-bold text-slate-950">{title}</Text>

          <Text className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </Text>

          {warning ? (
            <Text className="mt-2 text-sm font-medium text-red-600">
              {warning}
            </Text>
          ) : null}

          {error ? (
            <View className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <Text className="text-sm font-medium text-red-700">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 gap-3">
            <Button
              variant="danger"
              loading={loading}
              onPress={onConfirm}
            >
              {loading ? loadingLabel : confirmLabel}
            </Button>

            <Button variant="primary" disabled={loading} onPress={onCancel}>
              {cancelLabel}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
