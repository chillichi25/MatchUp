import { Text, View } from "react-native";

import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { TeamSwitcher } from "@/features/teams/components/team-switcher";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export function DashboardHeader({ coachName }: { coachName: string }) {
  return (
    <View>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="text-[22px] font-bold leading-tight tracking-tight text-slate-950">
            {getGreeting()},
          </Text>

          <Text className="mt-1 text-[25px] font-bold leading-tight tracking-tight text-[#00B83F]">
            {coachName}!
          </Text>
        </View>

        <View className="shrink-0 pt-1">
          <NotificationBell />
        </View>
      </View>

      <View className="mt-3">
        <TeamSwitcher />
      </View>
    </View>
  );
}
