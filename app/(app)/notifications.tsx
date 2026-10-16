import { Text, View } from "react-native";

import { BackButton } from "@/components/ui/back-button";
import { ScreenScroll } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import {
  useMarkAllNotificationsAsRead,
  useNotifications,
} from "@/features/notifications/hooks/use-notifications";

export default function NotificationsScreen() {
  const notifications = useNotifications();
  const markAllRead = useMarkAllNotificationsAsRead();

  const items = notifications.data ?? [];
  const hasUnread = items.some((item) => !item.is_read);

  return (
    <ScreenScroll contentClassName="px-5 pb-24 pt-3">
      <BackButton fallbackHref="/dashboard" />

      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[22px] font-bold tracking-tight text-slate-950">
          Notifications
        </Text>

        {hasUnread ? (
          <Text
            accessibilityRole="button"
            onPress={() => markAllRead.mutate()}
            className="text-[13px] font-semibold text-[#00B83F]"
          >
            Mark all read
          </Text>
        ) : null}
      </View>

      <View className="mt-4">
        {notifications.isLoading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications.isError ? (
          <ErrorState
            title="Couldn't load notifications"
            description="Check your connection and try again."
            onRetry={() => notifications.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Match, tournament and chat updates will appear here."
          />
        ) : (
          <View className="gap-3">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenScroll>
  );
}
