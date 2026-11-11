import { StyleSheet, Text, View } from "react-native";

import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { TeamSwitcher } from "@/features/teams/components/team-switcher";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function DashboardHeader({
  coachName,
}: {
  coachName: string;
}) {
  const name = coachName.trim() || "Coach";

  return (
    <View>
      <View style={styles.headingRow}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {getGreeting()},
          </Text>

          <Text
            accessibilityRole="header"
            style={styles.name}
          >
            {name}!
          </Text>
        </View>

        <View style={styles.notification}>
          <NotificationBell />
        </View>
      </View>

      <View style={styles.teamSwitcher}>
        <TeamSwitcher />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  greeting: {
    flex: 1,
    minWidth: 0,
  },
  greetingText: {
  color: "#07192D",
  fontSize: 20,
  lineHeight: 27,
  fontWeight: "700",
},
name: {
  marginTop: 2,
  color: "#009E45",
  fontSize: 28,
  fontWeight: "800",
  letterSpacing: -1,
},
  notification: {
    flexShrink: 0,
    paddingTop: 2,
  },
  teamSwitcher: {
    marginTop: 16,
  },
});