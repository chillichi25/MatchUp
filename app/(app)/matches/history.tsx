import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { MatchHistoryCard } from "@/features/matches/components/match-history-card";
import { useMatchHistory } from "@/features/matches/hooks/use-matches";

type HistoryFilter = "all" | "win" | "draw" | "loss" | "cancelled";

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "win", label: "Won" },
  { value: "draw", label: "Drawn" },
  { value: "loss", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MatchHistoryScreen() {
  const router = useRouter();
  const history = useMatchHistory();
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filtered = useMemo(() => {
    const rows = history.data ?? [];

    if (filter === "all") return rows;
    if (filter === "cancelled") return rows.filter((row) => row.status === "cancelled");

    return rows.filter((row) => row.status === "completed" && row.result === filter);
  }, [history.data, filter]);

  return (
    <Screen>
      <PageHeader title="Match History" fallbackHref="/profile" />

      <ScreenScroll contentContainerClassName="px-5 pb-32">
        <View className="mt-8">
          <Text className="text-3xl font-bold text-slate-950">Match History</Text>
          <Text className="mt-2 text-slate-500">
            View completed and cancelled matches.
          </Text>
        </View>

        <View className="mt-7 flex-row flex-wrap gap-2">
          {FILTERS.map((item) => {
            const isActive = filter === item.value;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                onPress={() => setFilter(item.value)}
                className={
                  isActive
                    ? "rounded-full bg-brand px-4 py-2"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2"
                }
              >
                <Text
                  className={
                    isActive
                      ? "text-sm font-medium text-white"
                      : "text-sm font-medium text-slate-700"
                  }
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {history.isLoading ? (
          <LoadingState className="mt-8" />
        ) : filtered.length === 0 ? (
          <View className="mt-8">
            <EmptyState
              icon={<CalendarDays size={24} color="#00B83F" strokeWidth={1.9} />}
              title={
                filter === "all"
                  ? "No match history yet"
                  : `No ${
                      filter === "win"
                        ? "won"
                        : filter === "draw"
                          ? "drawn"
                          : filter === "loss"
                            ? "lost"
                            : "cancelled"
                    } matches`
              }
              description={
                filter === "all"
                  ? "Completed and cancelled matches will appear here."
                  : "You don't have any matches in this category yet."
              }
            />

            {filter !== "all" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setFilter("all")}
                className="mt-5 h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5"
              >
                <Text className="text-[12px] font-bold text-slate-700">
                  View All
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View className="mt-8 gap-4">
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
