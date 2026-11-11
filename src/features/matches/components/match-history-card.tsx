import { ChevronRight, Clock } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import {
  formatDateWithYear,
  formatKickOff,
  getDateParts,
} from "@/features/friendlies/utils/format";

import type { MatchHistoryItem } from "../types";

const NAVY = "#07192D";
const MUTED = "#596B80";

const RESULT_STYLES = {
  win: {
    background: "#E4F5EB",
    color: "#007A35",
    label: "Won",
  },
  draw: {
    background: "#F1F5F9",
    color: "#475569",
    label: "Drawn",
  },
  loss: {
    background: "#FEF2F2",
    color: "#B91C1C",
    label: "Lost",
  },
} as const;

type MatchHistoryCardProps = {
  item: MatchHistoryItem;
  onPress: () => void;
};

export function MatchHistoryCard({
  item,
  onPress,
}: MatchHistoryCardProps) {
  const isCancelled = item.status === "cancelled";

  const hasScore =
    item.status === "completed" &&
    item.myScore != null &&
    item.opponentScore != null;

  const resultStyle =
    !isCancelled && item.result
      ? RESULT_STYLES[item.result]
      : null;

  const badge = isCancelled
    ? {
        background: "#FEF2F2",
        color: "#B91C1C",
        label: "Cancelled",
      }
    : resultStyle ?? {
        background: "#EFF6FF",
        color: "#1D4ED8",
        label: "Completed",
      };

  const teamName = item.opponent.teamName?.trim();
  const clubName = item.opponent.clubName?.trim();
  const title = teamName || clubName || "Opponent";

  const date = getDateParts(item.matchDate);
  const fullDate = formatDateWithYear(item.matchDate);
  const year = item.matchDate.slice(0, 4);

  const kickOff = item.kickOffTime
    ? formatKickOff(item.kickOffTime)
    : "";

  const scoreColor =
    item.result === "win"
      ? RESULT_STYLES.win.color
      : item.result === "loss"
        ? RESULT_STYLES.loss.color
        : NAVY;

  const cancellationText = item.cancelledByMyTeam
    ? "Cancelled by your team"
    : "Cancelled by the other team";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        `Match against ${title}`,
        teamName && clubName ? clubName : null,
        badge.label,
        hasScore
          ? `Final score. Your team ${item.myScore}, opponent ${item.opponentScore}`
          : null,
        fullDate,
        kickOff,
        isCancelled ? cancellationText : null,
        !isCancelled && !hasScore ? "Score not recorded" : null,
      ]
        .filter(Boolean)
        .join(". ")}
      accessibilityHint="Opens match details"
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white"
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View className="flex-row">
        <View className="w-[54px] items-center justify-center border-r border-slate-100 bg-slate-50 px-1 py-4">
          <Text
            className="text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {date.weekday}
          </Text>

          <Text
            className="my-0.5 text-[25px] font-bold leading-8"
            style={{
              color: "#009E45",
              fontVariant: ["tabular-nums"],
            }}
          >
            {date.day}
          </Text>

          <Text
            className="text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {date.month}
          </Text>

          <Text
            className="mt-1 text-[9px]"
            style={{ color: MUTED }}
          >
            {year}
          </Text>
        </View>

        <View className="min-w-0 flex-1 px-3 py-4">
          <View className="flex-row items-center gap-2.5">
            <Avatar
              uri={item.opponent.badgeUrl}
              name={clubName || title}
              size={40}
            />

            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={2}
                className="text-[14px] font-bold leading-[19px]"
                style={{ color: NAVY }}
              >
                {title}
              </Text>

              {teamName && clubName ? (
                <Text
                  numberOfLines={2}
                  className="mt-0.5 text-[11px] leading-4"
                  style={{ color: MUTED }}
                >
                  {clubName}
                </Text>
              ) : null}
            </View>
          </View>

          {kickOff ? (
  <View className="mt-3 flex-row items-center gap-1">
    <Clock size={12} color={MUTED} strokeWidth={1.8} />

    <Text
      className="text-[11px]"
      style={{ color: MUTED }}
    >
      {kickOff}
    </Text>
  </View>
) : null}

          {isCancelled ? (
            <Text
              className="mt-2 text-[11px] leading-4"
              style={{ color: MUTED }}
            >
              {cancellationText}
            </Text>
          ) : !hasScore ? (
            <Text
              className="mt-2 text-[11px] leading-4"
              style={{ color: MUTED }}
            >
              Score not recorded
            </Text>
          ) : null}
        </View>

        <View className="w-[108px] justify-between py-4 pr-9">
  <View
    className="self-end rounded-full px-2.5 py-1"
    style={{ backgroundColor: badge.background }}
  >
    <Text
      className="text-[10px] font-semibold"
      style={{ color: badge.color }}
    >
      {badge.label}
    </Text>
  </View>

  <View className="mt-3 flex-row items-center justify-end gap-2">
    {hasScore ? (
      <View className="items-center">
        <Text
          className="mb-1 text-[9px] font-medium"
          style={{ color: MUTED }}
        >
          You – Opp
        </Text>

        <Text
          className="text-[20px] font-bold leading-7"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          <Text style={{ color: scoreColor }}>
            {item.myScore}
          </Text>
          <Text style={{ color: MUTED }}> – </Text>
          <Text style={{ color: NAVY }}>
            {item.opponentScore}
          </Text>
        </Text>
      </View>
    ) : null}

  </View>
</View>
      </View>
      <View
  pointerEvents="none"
  accessibilityElementsHidden
  importantForAccessibility="no-hide-descendants"
  style={{
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  }}
>
  <ChevronRight
    size={17}
    color={MUTED}
    strokeWidth={1.8}
  />
</View>
    </Pressable>
  );
}