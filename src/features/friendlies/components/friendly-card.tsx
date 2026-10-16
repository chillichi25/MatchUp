import { ChevronRight, Clock, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { FriendlyListing } from "../types";
import { formatDistance, formatKickOff, getDateParts } from "../utils/format";

type FriendlyCardProps = {
  listing: FriendlyListing;
  onPress: () => void;
  recommended?: boolean;
};

export function FriendlyCard({
  listing,
  onPress,
  recommended = false,
}: FriendlyCardProps) {
  const date = getDateParts(listing.matchDate);
  const kickOff = formatKickOff(listing.kickOff);
  const distance = formatDistance(listing.distanceMiles);

  const tags = [
    { key: "age", value: listing.ageGroup },
    { key: "level", value: listing.level },
    { key: "format", value: listing.matchFormat },
  ].filter((tag) => Boolean(tag.value));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.clubName}, ${listing.teamName}`}
      onPress={onPress}
      className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <View className="w-[54px] items-center justify-center bg-green-50 py-3">
        <Text className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {date.weekday}
        </Text>
        <Text className="mt-1 text-[22px] font-bold leading-none text-brand">
          {date.day}
        </Text>
        <Text className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {date.month}
        </Text>
      </View>

      <View className="min-w-0 flex-1 px-3 py-3">
        <View className="flex-row items-start gap-2.5">
          <Avatar uri={listing.badgeUrl} name={listing.clubName} size={40} />

          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                numberOfLines={1}
                className="min-w-0 flex-1 text-[13px] font-bold leading-tight text-slate-950"
              >
                {listing.clubName}
              </Text>

              {listing.isOwnPost ? (
                <View className="shrink-0 rounded-full bg-green-50 px-2 py-1">
                  <Text className="text-[9px] font-bold leading-none text-[#00A638]">
                    Your post
                  </Text>
                </View>
              ) : null}
            </View>

            <Text numberOfLines={1} className="mt-0.5 text-[10px] text-slate-500">
              {listing.teamName}
            </Text>
          </View>

          <ChevronRight size={17} color="#94A3B8" />
        </View>

        {tags.length > 0 ? (
          <View className="ml-[50px] mt-2 flex-row items-center gap-1.5">
            {tags.map((tag) => (
              <View
                key={tag.key}
                className={
                  recommended
                    ? "rounded-full bg-green-50 px-2 py-1"
                    : "rounded-full bg-slate-100 px-2 py-1"
                }
              >
                <Text
                  className={
                    recommended
                      ? "text-[9px] font-semibold text-[#00A638]"
                      : "text-[9px] font-medium text-slate-600"
                  }
                >
                  {tag.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="ml-[50px] mt-2 flex-row items-center gap-3">
          {kickOff ? (
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#64748B" />
              <Text className="text-[10px] text-slate-500">{kickOff}</Text>
            </View>
          ) : null}

          {listing.location ? (
            <View className="min-w-0 flex-1 flex-row items-center gap-1">
              <MapPin size={12} color="#64748B" />
              <Text numberOfLines={1} className="flex-1 text-[10px] text-slate-500">
                {listing.location}
                {distance ? ` · ${distance}` : ""}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
