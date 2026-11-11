import { ChevronRight, Clock, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { FriendlyListing } from "../types";
import {
  formatDistance,
  formatKickOff,
  getDateParts,
} from "../utils/format";

type FriendlyCardProps = {
  listing: FriendlyListing;
  onPress: () => void;
  recommended?: boolean;
};

const GREEN = "#009E45";
const NAVY = "#07192D";
const MUTED = "#596B80";

export function FriendlyCard({
  listing,
  onPress,
  recommended = false,
}: FriendlyCardProps) {
  const date = getDateParts(listing.matchDate);
  const kickOff = formatKickOff(listing.kickOff);
  const distance = formatDistance(listing.distanceMiles);

  const teamName = listing.teamName?.trim();
  const clubName = listing.clubName?.trim();
  const ageGroup = listing.ageGroup?.trim();

  const teamNameParts = teamName?.toLowerCase().split(/[\s-]+/);
  const showAgeGroup =
    ageGroup && !teamNameParts?.includes(ageGroup.toLowerCase());

  const tags = [
    { key: "age", value: showAgeGroup ? ageGroup : null },
    { key: "level", value: listing.level },
    { key: "format", value: listing.matchFormat },
  ].filter((tag) => Boolean(tag.value));

  const locationLabel = [
    listing.location?.trim(),
    distance,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        teamName || clubName,
        teamName && clubName ? clubName : null,
        `${date.weekday} ${date.day} ${date.month}`,
        kickOff,
        locationLabel,
        listing.isOwnPost ? "Your post" : null,
      ]
        .filter(Boolean)
        .join(", ")}
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white"
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View className="flex-row">
        <View className="w-[62px] items-center justify-center border-r border-green-100 bg-green-50 px-2 py-5">
          <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#596B80]">
            {date.weekday}
          </Text>

          <Text
            className="my-1 text-[28px] font-bold leading-9"
            style={{ color: GREEN }}
          >
            {date.day}
          </Text>

          <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#596B80]">
            {date.month}
          </Text>
        </View>

        <View className="min-w-0 flex-1 p-4">
          <View className="flex-row items-center gap-3">
            <Avatar
              uri={listing.badgeUrl}
              name={clubName || teamName || "Team"}
              size={44}
            />

            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={2}
                className="text-[16px] font-bold leading-[21px]"
                style={{ color: NAVY }}
              >
                {teamName || clubName}
              </Text>

              {teamName && clubName ? (
                <Text
                  numberOfLines={2}
                  className="mt-1 text-[12px] leading-[17px]"
                  style={{ color: MUTED }}
                >
                  {clubName}
                </Text>
              ) : null}
            </View>

            <ChevronRight
              size={18}
              color={MUTED}
              strokeWidth={1.8}
            />
          </View>

          {listing.isOwnPost ? (
            <View className="mt-3 self-start rounded-full bg-green-50 px-2.5 py-1">
              <Text
                className="text-[11px] font-semibold"
                style={{ color: GREEN }}
              >
                Your post
              </Text>
            </View>
          ) : null}

          {tags.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {tags.map((tag) => (
                <View
                  key={tag.key}
                  className={`rounded-full px-2.5 py-1 ${
                    recommended ? "bg-green-50" : "bg-slate-100"
                  }`}
                >
                  <Text
                    className="text-[11px] font-medium"
                    style={{
                      color: recommended ? GREEN : MUTED,
                    }}
                  >
                    {tag.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {kickOff || locationLabel ? (
            <View className="mt-3 gap-2 border-t border-slate-100 pt-3">
              {kickOff ? (
                <View className="flex-row items-center gap-2">
                  <Clock
                    size={15}
                    color={GREEN}
                    strokeWidth={1.8}
                  />

                  <Text
                    className="text-[12px] font-semibold"
                    style={{ color: NAVY }}
                  >
                    {kickOff}
                  </Text>
                </View>
              ) : null}

              {locationLabel ? (
                <View className="flex-row items-start gap-2">
                  <MapPin
                    size={15}
                    color={GREEN}
                    strokeWidth={1.8}
                    style={{ marginTop: 1 }}
                  />

                  <Text
                    numberOfLines={2}
                    className="min-w-0 flex-1 text-[12px] leading-[18px]"
                    style={{ color: MUTED }}
                  >
                    {locationLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}