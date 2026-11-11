import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

import { formatTimestamp } from "@/features/dashboard/utils/format-date";
import { useSetActiveTeam } from "@/features/teams/hooks/use-teams";
import {
  getActiveTeam,
  getAvailableTeams,
  type AvailableTeam,
} from "@/features/teams/services/active-team.service";
import { supabase } from "@/lib/supabase/client";

import { useMarkNotificationAsRead } from "../hooks/use-notifications";
import type { AppNotification } from "../types";
import { getNotificationHref } from "../utils/notification-href";

const MATCH_NOTIFICATION_TYPES = new Set([
  "friendly_accepted",
  "match",
  "match_change_proposed",
  "match_change_accepted",
  "match_change_declined",
  "match_cancelled",
  "match_result_submitted",
  "match_result_confirmed",
  "match_result_disputed",
]);

const REQUEST_NOTIFICATION_TYPES = new Set([
  "friendly_request",
  "friendly_declined",
  "friendly_cancelled",
  "friendly_updated",
]);

function first<T>(
  value: T | T[] | null | undefined
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function chooseTeam(
  teams: AvailableTeam[]
): Promise<string | null> {
  return new Promise((resolve) => {
    if (teams.length === 1) {
      const team = teams[0];

      Alert.alert(
        "Switch team?",
        `This update belongs to ${team.name} at ${team.clubs.name}. Switch teams to open it?`,
        [
          {
            text: "Go back",
            style: "cancel",
            onPress: () => resolve(null),
          },
          {
            text: "Switch and open",
            onPress: () => resolve(team.id),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(null),
        }
      );

      return;
    }

    Alert.alert(
      "Choose a team",
      "You manage both teams involved in this update. Choose which team to view it as.",
      [
        {
          text: "Go back",
          style: "cancel",
          onPress: () => resolve(null),
        },
        ...teams.slice(0, 2).map((team) => ({
          text: `${team.name} · ${team.clubs.name}`,
          onPress: () => resolve(team.id),
        })),
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(null),
      }
    );
  });
}

/**
 * Returns participating team IDs for match and request notifications.
 * Other notification types keep their existing navigation.
 */
async function getParticipantTeamIds(
  notification: AppNotification
): Promise<string[] | null> {
  const relatedId = notification.related_id;

  if (!relatedId) {
    return null;
  }

  if (MATCH_NOTIFICATION_TYPES.has(notification.type)) {
    const { data: match, error } = await supabase
      .from("matches")
      .select("home_team_id, away_team_id")
      .eq("id", relatedId)
      .maybeSingle();

    if (error) {
      throw new Error(
        "Couldn't load this match. Please try again."
      );
    }

    if (!match) {
      throw new Error(
        "This match is no longer available or you no longer have access."
      );
    }

    return [
      match.home_team_id,
      match.away_team_id,
    ].filter((teamId): teamId is string => Boolean(teamId));
  }

  if (REQUEST_NOTIFICATION_TYPES.has(notification.type)) {
    const { data: request, error } = await supabase
      .from("friendly_requests")
      .select(
        "requesting_team_id, friendlies!inner(team_id)"
      )
      .eq("id", relatedId)
      .maybeSingle();

    if (error) {
      throw new Error(
        "Couldn't load this request. Please try again."
      );
    }

    if (!request) {
      throw new Error(
        "This request is no longer available or you no longer have access."
      );
    }

    const friendly = first(
      request.friendlies as unknown as
        | { team_id: string | null }
        | { team_id: string | null }[]
        | null
    );

    return [
      request.requesting_team_id,
      friendly?.team_id,
    ].filter((teamId): teamId is string => Boolean(teamId));
  }

  return null;
}

export function NotificationItem({
  notification,
}: {
  notification: AppNotification;
}) {
  const router = useRouter();
  const markAsRead = useMarkNotificationAsRead();
  const switchTeam = useSetActiveTeam();

  const openingRef = useRef(false);

  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [readError, setReadError] = useState(false);

  const isUnread = !notification.is_read;
  const timestamp = formatTimestamp(notification.created_at);

  const href = getNotificationHref(
    notification.type,
    notification.related_id
  );

  const canPress = Boolean(href) || isUnread;

  async function handlePress() {
    if (openingRef.current) return;

    openingRef.current = true;
    setOpening(true);
    setOpenError(null);
    setReadError(false);

    try {
      if (href) {
        const participantIds =
          await getParticipantTeamIds(notification);

        if (participantIds !== null) {
          const activeTeam = await getActiveTeam();

          const activeTeamParticipates =
            activeTeam !== null &&
            participantIds.includes(activeTeam.id);

          if (!activeTeamParticipates) {
            const availableTeams = await getAvailableTeams();

            const matchingTeams = availableTeams.filter((team) =>
              participantIds.includes(team.id)
            );

            if (matchingTeams.length === 0) {
              throw new Error(
                "No available team could be matched to this update. Check your team access and try again."
              );
            }

            const selectedTeamId =
              await chooseTeam(matchingTeams);

            // Cancelling leaves the selected team and read status unchanged.
            if (!selectedTeamId) return;

            await switchTeam.mutateAsync(selectedTeamId);
          }
        }
      }

      if (isUnread && !markAsRead.isPending) {
        markAsRead.mutate(notification.id, {
          onError: () => {
            setReadError(true);
          },
        });
      }

      if (href) {
        router.push(href as never);
      }
    } catch (error) {
      setOpenError(
        error instanceof Error
          ? error.message
          : "Couldn't open this notification. Please try again."
      );
    } finally {
      openingRef.current = false;
      setOpening(false);
    }
  }

  const content = (
    <>
      <View style={{ paddingRight: href ? 28 : 0 }}>
        <View className="flex-row items-start gap-3">
          <Text
            className="min-w-0 flex-1 text-[14px] leading-5 text-[#07192D]"
            style={{
              fontWeight: isUnread ? "700" : "600",
            }}
          >
            {notification.title}
          </Text>

          {isUnread ? (
            <View
              accessible={false}
              className="mt-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: "#009E45" }}
            />
          ) : null}
        </View>

        <Text className="mt-1.5 text-[13px] leading-5 text-[#596B80]">
          {notification.message}
        </Text>

        <Text className="mt-2 text-[11px] leading-4 text-slate-500">
          {timestamp}
        </Text>

        {openError ? (
          <Text
            accessibilityRole="alert"
            className="mt-2 text-[12px] leading-[18px] text-red-700"
          >
            {openError}
          </Text>
        ) : null}

        {readError ? (
          <Text
            accessibilityRole="alert"
            className="mt-2 text-[12px] leading-[18px] text-red-700"
          >
            Couldn&apos;t mark this as read. Tap to try again.
          </Text>
        ) : null}
      </View>

      {href ? (
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
          {opening ? (
            <ActivityIndicator
              size="small"
              color="#009E45"
            />
          ) : (
            <ChevronRight
              size={18}
              color="#64748B"
              strokeWidth={1.8}
            />
          )}
        </View>
      ) : null}
    </>
  );

  const accessibilityLabel = [
    isUnread ? "Unread" : "Read",
    notification.title,
    notification.message,
    timestamp,
  ].join(". ");

  const cardStyle = {
    backgroundColor: isUnread ? "#F0FAF4" : "#FFFFFF",
    borderColor: isUnread ? "#CDEBD8" : "#E2E8F0",
  };

  if (!canPress) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        className="relative rounded-2xl border p-4"
        style={cardStyle}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        href
          ? "Opens the related update and may ask you to switch teams"
          : "Marks this notification as read"
      }
      accessibilityState={{
        disabled: opening,
        busy: opening,
      }}
      disabled={opening}
      onPress={() => void handlePress()}
      className="relative rounded-2xl border p-4 active:opacity-80"
      style={cardStyle}
    >
      {content}
    </Pressable>
  );
}