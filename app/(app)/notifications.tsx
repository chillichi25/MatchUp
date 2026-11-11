import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
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

const GREEN = "#009E45";

export default function NotificationsScreen() {
  const notifications = useNotifications();
  const markAllRead = useMarkAllNotificationsAsRead();

  const [actionError, setActionError] = useState<string | null>(null);

  const items = notifications.data ?? [];
  const unreadCount = items.filter((item) => !item.is_read).length;
  const hasUnread = unreadCount > 0;

  const actionDisabled =
    !hasUnread ||
    notifications.isLoading ||
    notifications.isError ||
    markAllRead.isPending;

  async function handleMarkAllRead() {
    if (actionDisabled) return;

    setActionError(null);

    try {
      await markAllRead.mutateAsync();
    } catch {
      setActionError(
        "Couldn't mark notifications as read. Please try again."
      );
    }
  }

  return (
    <Screen>
      <PageHeader
        title="Notifications"
        fallbackHref="/dashboard"
      />

      <ScreenScroll
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 128,
        }}
      >
        <Text className="text-[26px] font-bold tracking-tight text-[#07192D]">
          Your updates
        </Text>

        <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
          Keep track of requests and match updates.
        </Text>

        {!notifications.isLoading && !notifications.isError ? (
          <View className="mt-5 flex-row items-center justify-between gap-3">
            <Text
              accessibilityLiveRegion="polite"
              className="min-w-0 flex-1 text-[13px] font-semibold text-[#596B80]"
            >
              {hasUnread
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              accessibilityState={{
                disabled: actionDisabled,
                busy: markAllRead.isPending,
              }}
              disabled={actionDisabled}
              onPress={() => void handleMarkAllRead()}
              className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-full px-3"
              style={{
                backgroundColor: hasUnread ? "#E4F5EB" : "#F1F5F9",
                opacity: actionDisabled ? 0.6 : 1,
              }}
            >
              {markAllRead.isPending ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : null}

              <Text
                className="text-[12px] font-semibold"
                style={{
                  color: hasUnread ? "#007A35" : "#64748B",
                }}
              >
                {markAllRead.isPending
                  ? "Marking as read…"
                  : "Mark all read"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {actionError ? (
          <View className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <Text
              accessibilityRole="alert"
              className="text-[13px] leading-5 text-red-700"
            >
              {actionError}
            </Text>
          </View>
        ) : null}

        <View className="mt-4">
          {notifications.isLoading ? (
            <LoadingState label="Loading notifications…" />
          ) : notifications.isError ? (
            <ErrorState
              title="Couldn't load notifications"
              description="Check your connection and try again."
              onRetry={() => void notifications.refetch()}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Your requests and match updates will appear here."
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
    </Screen>
  );
}