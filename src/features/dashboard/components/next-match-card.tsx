import { useRouter } from "expo-router";
import { Clock3, MapPin, MessageCircle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type { DashboardMatch, DashboardMatchTeam } from "../types";
import { getDateParts } from "../utils/format-date";

const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";

function TeamColumn({ team }: { team: DashboardMatchTeam }) {
  return (
    <View style={styles.teamColumn}>
      <Avatar
        uri={team.badgeUrl}
        name={team.clubName}
        size={48}
      />

      <Text style={styles.clubName}>
        {team.clubName}
      </Text>

      <Text style={styles.teamName}>
        {team.name}
      </Text>
    </View>
  );
}

export function NextMatchCard({
  match,
}: {
  match: DashboardMatch;
}) {
  const router = useRouter();

  const { weekday, day, month } = getDateParts(match.matchDate);
  const kickOff = match.kickOff?.slice(0, 5) || "Time TBC";

  return (
    <View style={styles.card}>
      <View style={styles.matchRow}>
        <TeamColumn team={match.homeTeam} />

        <View style={styles.dateColumn}>
          <Text style={styles.weekday}>{weekday}</Text>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
          <Text style={styles.versus}>VS</Text>
        </View>

        <TeamColumn team={match.awayTeam} />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.timeDetail}>
          <Clock3
            size={16}
            color={MUTED}
            strokeWidth={1.8}
          />

          <Text style={styles.detailText}>{kickOff}</Text>
        </View>

        <View style={styles.locationDetail}>
          <MapPin
            size={16}
            color={MUTED}
            strokeWidth={1.8}
          />

          <Text style={styles.locationText}>
            {match.location || "Location TBC"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View match details"
          onPress={() =>
            router.push(`/matches/${match.id}` as never)
          }
          className="active:opacity-80"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>
            View match
          </Text>
        </Pressable>

        {match.conversationId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open match chat"
            onPress={() =>
              router.push(
                `/chat/${match.conversationId}` as never
              )
            }
            className="active:opacity-75"
            style={styles.secondaryButton}
          >
            <MessageCircle
              size={17}
              color={GREEN}
              strokeWidth={1.8}
            />

            <Text style={styles.secondaryText}>Chat</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 8,
  },
  teamColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  clubName: {
    marginTop: 8,
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  teamName: {
    marginTop: 3,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  dateColumn: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  weekday: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  day: {
    marginTop: 2,
    color: GREEN,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  month: {
    marginTop: 2,
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  versus: {
    marginTop: 8,
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  detailsRow: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },
  timeDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  locationDetail: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  detailText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  locationText: {
    flex: 1,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  secondaryText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});