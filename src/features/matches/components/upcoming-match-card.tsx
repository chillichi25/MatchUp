import { CalendarDays, ChevronRight, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";

import type { MatchSummary } from "../types";

type UpcomingMatchCardProps = {
  match: MatchSummary;
  onPress: () => void;
};

const GREEN = "#009E45";

export function UpcomingMatchCard({
  match,
  onPress,
}: UpcomingMatchCardProps) {
  const teamName = match.opponent.teamName?.trim();
  const clubName = match.opponent.clubName?.trim();
  const title = teamName || clubName || "Opponent";

  const kickOff = match.kickOff ? formatKickOff(match.kickOff) : "";
  const date = formatDateWithYear(match.matchDate);

  const badge = match.hasPendingResult
    ? {
        label: "Awaiting confirmation",
        backgroundColor: "#FFF7DB",
        color: "#92400E",
      }
    : match.isPast
      ? {
          label: "Result not recorded",
          backgroundColor: "#FFF7DB",
          color: "#92400E",
        }
      : {
          label: "Scheduled",
          backgroundColor: "#E4F5EB",
          color: "#007A35",
        };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        `Match against ${title}`,
        teamName && clubName ? clubName : null,
        date,
        kickOff,
        badge.label,
      ]
        .filter(Boolean)
        .join(". ")}
      accessibilityHint="Opens match details"
      onPress={onPress}
      className="relative rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
    >
      <View style={{ paddingRight: 24 }}>
        <View className="flex-row items-center gap-3">
          <Avatar
            uri={match.opponent.badgeUrl}
            name={clubName || title}
            size={48}
          />

          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="text-[16px] font-bold leading-5 text-[#07192D]"
            >
              {title}
            </Text>

            {teamName && clubName ? (
              <Text
                numberOfLines={1}
                className="mt-1 text-[12px] leading-[18px] text-[#596B80]"
              >
                {clubName}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          className="mt-3 self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: badge.backgroundColor }}
        >
          <Text
            className="text-[11px] font-semibold"
            style={{ color: badge.color }}
          >
            {badge.label}
          </Text>
        </View>

        <View className="mt-4 gap-2">
          <View className="flex-row items-start gap-2">
            <CalendarDays
              size={16}
              color={GREEN}
              strokeWidth={1.8}
            />

            <Text className="min-w-0 flex-1 text-[12px] font-medium leading-[18px] text-[#07192D]">
              {date}
              {kickOff ? ` · ${kickOff}` : ""}
            </Text>
          </View>

          <View className="flex-row items-start gap-2">
            <MapPin
              size={16}
              color={GREEN}
              strokeWidth={1.8}
            />

            <Text className="min-w-0 flex-1 text-[12px] leading-[18px] text-[#596B80]">
              {match.location?.trim() || "Location to be confirmed"}
            </Text>
          </View>
        </View>
      </View>

      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          right: 14,
          top: 0,
          bottom: 0,
          justifyContent: "center",
        }}
      >
        <ChevronRight
          size={18}
          color="#64748B"
          strokeWidth={1.8}
        />
      </View>
    </Pressable>
  );
}