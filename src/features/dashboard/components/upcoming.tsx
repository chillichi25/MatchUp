import { useRouter } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Trophy,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { DashboardMatch, DashboardTournament } from "../types";
import { getDateParts } from "../utils/format-date";

const GREEN = "#009E45";
const VIOLET = "#7C3AED";

const TABS = [
  { value: "matches", label: "Matches" },
  { value: "tournaments", label: "Tournaments" },
] as const;

type UpcomingTab = (typeof TABS)[number]["value"];

function UpcomingCard({
  date,
  title,
  subtitle,
  time,
  location,
  accent,
  badge,
  onPress,
}: {
  date: string;
  title: string;
  subtitle?: string | null;
  time?: string | null;
  location?: string | null;
  accent: string;
  badge: ReactNode;
  onPress: () => void;
}) {
  const { weekday, day, month } = getDateParts(date);
  const timeLabel = time?.slice(0, 5) || "Time to be confirmed";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        subtitle,
        `${weekday} ${day} ${month}`,
        timeLabel,
        location,
      ].filter(Boolean).join(", ")}
      accessibilityHint="Opens fixture details"
      onPress={onPress}
      className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
    >
      <View className="w-[54px] shrink-0 self-stretch items-center justify-center border-r border-slate-200 bg-slate-100 py-2">
        <Text className="text-[9px] font-semibold text-slate-500">
          {weekday}
        </Text>
        <Text
          className="text-[24px] font-bold leading-none"
          style={{ color: accent }}
        >
          {day}
        </Text>
        <Text className="mt-1 text-[9px] font-semibold text-slate-500">
          {month}
        </Text>
      </View>

      <View className="min-w-0 flex-1 flex-row items-center gap-3 p-3">
        {badge}

        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[14px] font-bold text-[#07192D]">
            {title}
          </Text>

          {subtitle ? (
            <Text numberOfLines={1} className="mt-0.5 text-[12px] text-[#596B80]">
              {subtitle}
            </Text>
          ) : null}

          <View className="mt-2 flex-row items-center gap-1.5">
            <Clock3 size={13} color={accent} strokeWidth={1.8} />
            <Text className="min-w-0 flex-1 text-[12px] font-medium text-[#07192D]">
              {timeLabel}
            </Text>
          </View>

          {location ? (
            <View className="mt-1 flex-row items-start gap-1.5">
              <View className="mt-0.5">
                <MapPin size={13} color={accent} strokeWidth={1.8} />
              </View>
              <Text numberOfLines={2} className="min-w-0 flex-1 text-[12px] text-[#596B80]">
                {location}
              </Text>
            </View>
          ) : null}
        </View>

        <ChevronRight size={17} color="#64748B" strokeWidth={1.8} />
      </View>
    </Pressable>
  );
}

function UpcomingEmptyState({
  type,
  hasUpNext,
}: {
  type: UpcomingTab;
  hasUpNext: boolean;
}) {
  const isMatches = type === "matches";
  const eventName = isMatches ? "match" : "tournament";

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View
        className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isMatches ? "bg-green-50" : "bg-violet-50"
        }`}
      >
        {isMatches ? (
          <CalendarDays size={19} color={GREEN} strokeWidth={1.8} />
        ) : (
          <Trophy size={19} color={VIOLET} strokeWidth={1.8} />
        )}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-bold text-[#07192D]">
          {hasUpNext ? `No more upcoming ${type}` : `No upcoming ${type}`}
        </Text>
        <Text className="mt-1 text-[12px] leading-[18px] text-[#596B80]">
          {hasUpNext
            ? `Your next ${eventName} is shown in Up Next.`
            : isMatches
              ? "Confirmed matches will appear here."
              : "Your team's confirmed tournaments will appear here."}
        </Text>
      </View>
    </View>
  );
}

export function Upcoming({
  matches,
  tournaments,
  nextEventType,
  nextEventId,
}: {
  matches: DashboardMatch[];
  tournaments: DashboardTournament[];
  nextEventType: "match" | "tournament" | null;
  nextEventId: string | null;
}) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<UpcomingTab | null>(null);

  if (matches.length === 0 && tournaments.length === 0) return null;

  const activeTab =
    selectedTab ?? (matches.length > 0 ? "matches" : "tournaments");
  const isMatches = activeTab === "matches";

  const visibleMatches = matches
    .filter((match) => nextEventType !== "match" || match.id !== nextEventId)
    .slice(0, 2);

  const visibleTournaments = tournaments
    .filter(
      (tournament) =>
        nextEventType !== "tournament" || tournament.id !== nextEventId
    )
    .slice(0, 2);

  const hasVisibleEvents = isMatches
    ? visibleMatches.length > 0
    : visibleTournaments.length > 0;

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold tracking-tight text-[#07192D]">
        Upcoming
      </Text>

      <View className="mt-3 flex-row rounded-xl bg-slate-200/70 p-1">
        {TABS.map(({ value, label }) => {
          const selected = activeTab === value;

          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setSelectedTab(value)}
              className={`min-h-[44px] flex-1 items-center justify-center rounded-lg px-2 ${
                selected ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  selected ? "text-[#009E45]" : "text-[#596B80]"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-3 gap-2.5">
        {!hasVisibleEvents ? (
          <UpcomingEmptyState
            type={activeTab}
            hasUpNext={nextEventType === (isMatches ? "match" : "tournament")}
          />
        ) : isMatches ? (
          visibleMatches.map((match) => {
            const teamName = match.opponent.teamName.trim();
            const clubName = match.opponent.clubName.trim();
            const title = teamName || clubName || "Opponent";
            const location = [
              match.isHome ? "Home" : "Away",
              match.location?.trim(),
            ].filter(Boolean).join(" · ");

            return (
              <UpcomingCard
                key={match.id}
                date={match.matchDate}
                title={title}
                subtitle={clubName && clubName !== title ? clubName : null}
                time={match.kickOff}
                location={location}
                accent={GREEN}
                badge={
                  <Avatar
                    uri={match.opponent.badgeUrl}
                    name={clubName || title}
                    size={40}
                  />
                }
                onPress={() => router.push(`/matches/${match.id}` as never)}
              />
            );
          })
        ) : (
          visibleTournaments.map((tournament) => (
            <UpcomingCard
              key={tournament.id}
              date={tournament.startDate}
              title={tournament.name}
              subtitle={tournament.ageGroup}
              time={tournament.startTime}
              location={tournament.location}
              accent={VIOLET}
              badge={
                <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50">
                  <Trophy size={21} color={VIOLET} strokeWidth={1.8} />
                </View>
              }
              onPress={() => router.push(`/tournaments/${tournament.id}` as never)}
            />
          ))
        )}
      </View>

      {isMatches && matches.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/matches/upcoming")}
          className="mt-3 min-h-[44px] items-center justify-center rounded-full border border-[#009E45] bg-white px-4 active:bg-green-50"
        >
          <Text className="text-[13px] font-semibold text-[#009E45]">
            View all matches
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}