import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import { MatchHistoryCard } from "@/features/matches/components/match-history-card";
import { useMatchHistory } from "@/features/matches/hooks/use-matches";

type HistoryFilter = "all" | "win" | "draw" | "loss" | "cancelled";

const GREEN = "#009E45";

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "win", label: "Won" },
  { value: "draw", label: "Drawn" },
  { value: "loss", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_TITLES: Record<HistoryFilter, string> = {
  all: "No match history yet",
  win: "No wins yet",
  draw: "No draws yet",
  loss: "No losses yet",
  cancelled: "No cancelled matches",
};

export default function MatchHistoryScreen() {
  const router = useRouter();
  const history = useMatchHistory();
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filtered = useMemo(() => {
    const rows = history.data ?? [];

    if (filter === "all") return rows;

    if (filter === "cancelled") {
      return rows.filter((row) => row.status === "cancelled");
    }

    return rows.filter(
      (row) => row.status === "completed" && row.result === filter
    );
  }, [history.data, filter]);

  return (
    <Screen>
      <PageHeader title="Match history" fallbackHref="/matches" />

      <ScreenScroll
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 128,
        }}
      >
        <Text className="text-[26px] font-bold tracking-tight text-[#07192D]">
          Match history
        </Text>

        <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
          View completed and cancelled matches.
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {FILTERS.map((item) => {
            const isActive = filter === item.value;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setFilter(item.value)}
                className="min-h-[38px] items-center justify-center rounded-full border px-3 active:opacity-80"
                style={{
                  minWidth: ["all", "win", "loss"].includes(item.value)
  ? 60
  : undefined,
                  backgroundColor: isActive ? GREEN : "#FFFFFF",
                  borderColor: isActive ? GREEN : "#E2E8F0",
                }}
              >
                <Text
                  className="text-[12px] font-semibold"
                  style={{
                    color: isActive ? "#FFFFFF" : "#596B80",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {history.isLoading ? (
          <LoadingState className="mt-6" />
        ) : history.isError ? (
          <ErrorState
            className="mt-6"
            description="We couldn't load your match history."
            onRetry={() => history.refetch()}
          />
        ) : filtered.length === 0 ? (
          <View className="mt-6">
            <EmptyState
              icon={
                <CalendarDays
                  size={24}
                  color={GREEN}
                  strokeWidth={1.8}
                />
              }
              title={EMPTY_TITLES[filter]}
              description={
                filter === "all"
                  ? "Completed and cancelled matches will appear here."
                  : "There are no matches in this category yet."
              }
            />

            {filter !== "all" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setFilter("all")}
                className="mt-5 min-h-[48px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 active:bg-slate-50"
              >
                <Text className="text-[13px] font-semibold text-[#07192D]">
                  View all matches
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {filtered.map((item) => (
              <MatchHistoryCard
                key={item.id}
                item={item}
                onPress={() =>
                  router.push(`/matches/${item.id}?from=history` as never)
                }
              />
            ))}
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}