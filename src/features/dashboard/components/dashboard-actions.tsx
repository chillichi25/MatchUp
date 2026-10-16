import { useRouter } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Plus,
  Trophy,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

function ActionCard({
  onPress,
  className,
  icon,
  title,
  description,
  accessibilityLabel,
}: {
  onPress: () => void;
  className?: string;
  icon: ReactNode;
  title: string;
  description: string;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        "min-h-[140px] flex-1 rounded-2xl border p-4",
        className
      )}
    >
      <View className="flex-row items-start justify-between">
        {icon}
        <ChevronRight size={17} color="#64748B" strokeWidth={2} />
      </View>

      <Text className="mt-3 text-[13px] font-bold leading-[18px] text-slate-950">
        {title}
      </Text>

      <Text className="mt-1 text-[11px] leading-[15px] text-slate-500">
        {description}
      </Text>
    </Pressable>
  );
}

export function DashboardActions() {
  const router = useRouter();

  return (
    <View className="mt-6">
      <Text className="text-[18px] font-bold tracking-tight text-slate-950">
        What would you like to do?
      </Text>

      <View className="mt-4 gap-3">
        <View className="flex-row gap-3">
          <ActionCard
            accessibilityLabel="Find a Match"
            onPress={() => router.push("/matches")}
            className="border-green-200 bg-green-50"
            icon={
              <CalendarDays size={31} strokeWidth={2.2} color="#00B83F" />
            }
            title="Find a Match"
            description="Find local teams for friendlies"
          />

          <ActionCard
            accessibilityLabel="Find a Tournament"
            onPress={() => router.push("/matches")}
            className="border-blue-200 bg-blue-50"
            icon={<Trophy size={31} strokeWidth={2.2} color="#2563EB" />}
            title="Find a Tournament"
            description="Discover and enter tournaments"
          />
        </View>

        <View className="flex-row gap-3">
          <ActionCard
            accessibilityLabel="Create a Match"
            onPress={() => router.push("/create")}
            className="border-green-100 bg-green-50/50"
            icon={
              <View className="h-[29px] w-[29px] items-center justify-center rounded-full bg-green-500">
                <Plus size={20} strokeWidth={2.3} color="#FFFFFF" />
              </View>
            }
            title="Create a Match"
            description="Post a friendly match"
          />

          <ActionCard
            accessibilityLabel="Create a Tournament"
            onPress={() => router.push("/create")}
            className="border-violet-100 bg-violet-50/50"
            icon={
              <View className="h-[29px] w-[29px] items-center justify-center rounded-full border-2 border-violet-400">
                <Plus size={20} strokeWidth={2.5} color="#8B5CF6" />
              </View>
            }
            title="Create a Tournament"
            description="Organise your tournament"
          />
        </View>
      </View>
    </View>
  );
}
