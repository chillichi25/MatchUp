import { useRouter } from "expo-router";
import { ChevronRight, Clock3, MapPin, Shield, Trophy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type { DashboardMatch, DashboardTournament } from "../types";
import { getDateParts } from "../utils/format-date";

function UpcomingMatchRow({ match }: { match: DashboardMatch }) {
  const router = useRouter();
  const { weekday, day, month } = getDateParts(match.matchDate);
  const kickOff = match.kickOff?.slice(0, 5) ?? "TBC";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${match.opponent.clubName} match`}
      onPress={() => router.push("/matches")}
      className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
    >
      <View className="w-[46px] shrink-0 items-center border-r border-slate-100 pr-3">
        <Text className="text-[9px] font-bold tracking-wide text-slate-400">
          {weekday}
        </Text>

        <Text className="mt-0.5 text-[19px] font-bold leading-none text-[#00A638]">
          {day}
        </Text>

        <Text className="mt-1 text-[9px] font-bold tracking-wide text-slate-400">
          {month}
        </Text>
      </View>

      <View className="ml-3 shrink-0">
        <Avatar
          uri={match.opponent.badgeUrl}
          name={match.opponent.clubName}
          size={44}
        />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[13px] font-bold text-slate-950" numberOfLines={1}>
          {match.opponent.clubName}
        </Text>

        <Text className="mt-0.5 text-[11px] font-medium text-slate-500" numberOfLines={1}>
          {match.opponent.teamName}
        </Text>

        <View className="mt-1.5 flex-row flex-wrap items-center gap-x-3 gap-y-1">
          <View className="flex-row items-center gap-1">
            <MapPin size={11} color="#64748B" strokeWidth={2} />
            <Text className="text-[10px] font-medium text-slate-500" numberOfLines={1}>
              {match.isHome ? "Home" : "Away"}
              {match.location ? ` · ${match.location}` : ""}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Clock3 size={11} color="#64748B" strokeWidth={2} />
            <Text className="text-[10px] font-medium text-slate-500">
              {kickOff}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
    </Pressable>
  );
}

function UpcomingTournamentRow({
  tournament,
}: {
  tournament: DashboardTournament;
}) {
  const router = useRouter();
  const { weekday, day, month } = getDateParts(tournament.startDate);
  const startTime = tournament.startTime?.slice(0, 5) ?? "TBC";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tournament.name} tournament`}
      onPress={() => router.push("/matches")}
      className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
    >
      <View className="w-[46px] shrink-0 items-center border-r border-slate-100 pr-3">
        <Text className="text-[9px] font-bold tracking-wide text-slate-400">
          {weekday}
        </Text>

        <Text className="mt-0.5 text-[19px] font-bold leading-none text-violet-600">
          {day}
        </Text>

        <Text className="mt-1 text-[9px] font-bold tracking-wide text-slate-400">
          {month}
        </Text>
      </View>

      <View className="ml-3 h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50">
        <Trophy size={21} color="#7C3AED" strokeWidth={2} />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[13px] font-bold text-slate-950" numberOfLines={1}>
          {tournament.name}
        </Text>

        <Text className="mt-0.5 text-[11px] font-medium text-slate-500" numberOfLines={1}>
          {tournament.ageGroup ? `${tournament.ageGroup} Tournament` : "Tournament"}
        </Text>

        <View className="mt-1.5 flex-row flex-wrap items-center gap-x-3 gap-y-1">
          {tournament.location ? (
            <View className="flex-row items-center gap-1">
              <MapPin size={11} color="#64748B" strokeWidth={2} />
              <Text
                className="max-w-[105px] text-[10px] font-medium text-slate-500"
                numberOfLines={1}
              >
                {tournament.location}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-1">
            <Clock3 size={11} color="#64748B" strokeWidth={2} />
            <Text className="text-[10px] font-medium text-slate-500">
              {startTime}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
    </Pressable>
  );
}

function UpcomingEmptyState({
  type,
  hasUpNext,
}: {
  type: "matches" | "tournaments";
  hasUpNext: boolean;
}) {
  const isMatches = type === "matches";

  const title = isMatches
    ? hasUpNext
      ? "No more upcoming matches"
      : "No upcoming matches"
    : hasUpNext
      ? "No more upcoming tournaments"
      : "No upcoming tournaments";

  const description = isMatches
    ? hasUpNext
      ? "Your next match is already shown in Up Next."
      : "Matches you arrange will appear here."
    : hasUpNext
      ? "Your next tournament is already shown in Up Next."
      : "Tournaments you join will appear here.";

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <View
        className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isMatches ? "bg-green-50" : "bg-violet-50"
        }`}
      >
        {isMatches ? (
          <Shield size={19} color="#00B83F" strokeWidth={2} />
        ) : (
          <Trophy size={19} color="#7C3AED" strokeWidth={2} />
        )}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-bold leading-tight text-slate-950">
          {title}
        </Text>

        <Text className="mt-1 text-[11px] leading-[15px] text-slate-500">
          {description}
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
  const [activeTab, setActiveTab] = useState<"matches" | "tournaments">(
    "matches"
  );

  const isMatches = activeTab === "matches";
  const hasUpcomingActivity = matches.length > 0 || tournaments.length > 0;

  if (!hasUpcomingActivity) {
    return null;
  }

  const visibleMatches = matches.filter(
    (match) => !(nextEventType === "match" && match.id === nextEventId)
  );

  const visibleTournaments = tournaments.filter(
    (tournament) =>
      !(nextEventType === "tournament" && tournament.id === nextEventId)
  );

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold tracking-tight text-slate-950">
        Upcoming
      </Text>

      <View className="mt-3 flex-row rounded-xl bg-slate-200/70 p-1">
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isMatches }}
          onPress={() => setActiveTab("matches")}
          className={`flex-1 items-center rounded-lg px-3 py-2 ${
            isMatches ? "bg-white" : ""
          }`}
        >
          <Text
            className={`text-[13px] font-bold ${
              isMatches ? "text-[#00A638]" : "text-slate-500"
            }`}
          >
            Matches
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: !isMatches }}
          onPress={() => setActiveTab("tournaments")}
          className={`flex-1 items-center rounded-lg px-3 py-2 ${
            !isMatches ? "bg-white" : ""
          }`}
        >
          <Text
            className={`text-[13px] font-bold ${
              !isMatches ? "text-[#00A638]" : "text-slate-500"
            }`}
          >
            Tournaments
          </Text>
        </Pressable>
      </View>

      <View className="mt-3 gap-2">
        {isMatches ? (
          visibleMatches.length === 0 ? (
            <UpcomingEmptyState
              type="matches"
              hasUpNext={nextEventType === "match"}
            />
          ) : (
            visibleMatches
              .slice(0, 2)
              .map((match) => <UpcomingMatchRow key={match.id} match={match} />)
          )
        ) : visibleTournaments.length === 0 ? (
          <UpcomingEmptyState
            type="tournaments"
            hasUpNext={nextEventType === "tournament"}
          />
        ) : (
          visibleTournaments
            .slice(0, 2)
            .map((tournament) => (
              <UpcomingTournamentRow
                key={tournament.id}
                tournament={tournament}
              />
            ))
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/matches")}
        className="mt-3 h-10 w-full items-center justify-center rounded-full border border-[#00B83F] bg-white"
      >
        <Text className="text-[13px] font-bold text-[#00A638]">
          {isMatches ? "View All Matches" : "View All Tournaments"}
        </Text>
      </Pressable>
    </View>
  );
}
