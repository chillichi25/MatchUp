import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useUnreadNotificationCount } from "../hooks/use-notifications";

/**
 * Header bell showing the unread count. Opening the list is handled by the
 * notifications route. Live push updates arrive in a later phase; the count
 * refreshes whenever the list is opened or the query is invalidated.
 */
export function NotificationBell() {
  const router = useRouter();
  const { data: count = 0 } = useUnreadNotificationCount();

  const label =
    count > 0 ? `Notifications, ${count} unread` : "Notifications";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => router.push("/notifications")}
      className="h-11 w-11 items-center justify-center"
    >
      <Bell size={26} color="#334155" strokeWidth={2} />

      {count > 0 ? (
        <View className="absolute right-0 top-0 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
          <Text className="text-[11px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
