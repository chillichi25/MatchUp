import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { formatTimestamp } from "@/features/dashboard/utils/format-date";

import { useMarkNotificationAsRead } from "../hooks/use-notifications";
import type { AppNotification } from "../types";
import { getNotificationHref } from "../utils/notification-href";

export function NotificationItem({
  notification,
}: {
  notification: AppNotification;
}) {
  const router = useRouter();
  const markAsRead = useMarkNotificationAsRead();
  const isUnread = !notification.is_read;

  const href = getNotificationHref(
    notification.type,
    notification.related_id
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (isUnread) {
          markAsRead.mutate(notification.id);
        }

        if (href) {
          router.push(href as never);
        }
      }}
      className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
    >
      <View className="flex-row items-start gap-2">
        <Text className="flex-1 text-[14px] font-semibold text-slate-950">
          {notification.title}
        </Text>

        {isUnread ? (
          <View
            accessibilityLabel="Unread notification"
            className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#00B83F]"
          />
        ) : null}
      </View>

      <View className="flex-row items-end gap-2">
        <View className="min-w-0 flex-1">
          <Text className="mt-1 text-[13px] leading-5 text-slate-500">
            {notification.message}
          </Text>

          <Text className="mt-1 text-[11px] text-slate-400">
            {formatTimestamp(notification.created_at)}
          </Text>
        </View>

        {href ? (
          <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
        ) : null}
      </View>
    </Pressable>
  );
}
