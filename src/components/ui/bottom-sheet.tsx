import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function BottomSheet({
  visible,
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          className={cn(
            "max-h-[85%] rounded-t-3xl bg-white px-5 pb-8 pt-3",
            className
          )}
          onPress={() => {}}
        >
          <View className="mb-3 items-center">
            <View className="h-1 w-10 rounded-full bg-slate-200" />
          </View>

          {title ? (
            <View className="mb-4">
              <Text className="text-[17px] font-bold text-slate-950">
                {title}
              </Text>

              {description ? (
                <Text className="mt-1 text-[13px] leading-5 text-slate-500">
                  {description}
                </Text>
              ) : null}
            </View>
          ) : null}

          {children}

          {footer ? <View className="mt-5">{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
