import { ChevronRight, MapPin, Trophy, Users } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { getDateParts } from "@/features/friendlies/utils/format";

import type { TournamentListing } from "../types";
import { formatEntryFee } from "../utils/format";

type TournamentCardProps = {
  tournament: TournamentListing;
  onPress: () => void;
  recommended?: boolean;
};

export function TournamentCard({
  tournament,
  onPress,
  recommended = false,
}: TournamentCardProps) {
  const date = getDateParts(tournament.startDate);

  const tags = [
    { key: "age", value: tournament.ageGroup },
    { key: "level", value: tournament.level },
    { key: "format", value: tournament.matchFormat },
  ].filter((tag) => Boolean(tag.value));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tournament.name}
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <View className="flex-row">
        <View className="w-[54px] items-center justify-center bg-violet-50 py-3">
          <Text className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {date.weekday}
          </Text>
          <Text className="mt-1 text-[22px] font-bold leading-none text-violet-600">
            {date.day}
          </Text>
          <Text className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {date.month}
          </Text>
        </View>

        <View className="min-w-0 flex-1 px-3 py-3">
          <View className="flex-row items-start gap-2">
            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={1}
                className="text-[13px] font-bold leading-tight text-slate-950"
              >
                {tournament.name}
              </Text>

              {tournament.location ? (
                <View className="mt-0.5 flex-row items-center gap-1">
                  <MapPin size={11} color="#64748B" />
                  <Text
                    numberOfLines={1}
                    className="min-w-0 flex-1 text-[10px] text-slate-500"
                  >
                    {tournament.location}
                    {tournament.distanceMiles !== null
                      ? ` · ${tournament.distanceMiles.toFixed(1)} mi`
                      : ""}
                  </Text>
                </View>
              ) : null}
            </View>

            {recommended ? (
              <View className="shrink-0 rounded-full bg-violet-50 px-2 py-1">
                <Text className="text-[9px] font-bold leading-none text-violet-600">
                  Recommended
                </Text>
              </View>
            ) : (
              <ChevronRight size={17} color="#94A3B8" />
            )}
          </View>

          {tags.length > 0 ? (
            <View className="mt-2 flex-row items-center gap-1.5">
              {tags.map((tag) => (
                <View
                  key={tag.key}
                  className="rounded-full bg-slate-100 px-2 py-1"
                >
                  <Text className="text-[9px] font-medium text-slate-600">
                    {tag.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-2 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Trophy size={12} color="#7C3AED" />
              <Text className="text-[10px] font-semibold text-violet-600">
                {formatEntryFee(tournament.entryFee)}
              </Text>
            </View>

            {tournament.maxTeams !== null ? (
              <View className="flex-row items-center gap-1">
                <Users size={12} color="#64748B" />
                <Text className="text-[10px] text-slate-500">
                  Up to {tournament.maxTeams} teams
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
