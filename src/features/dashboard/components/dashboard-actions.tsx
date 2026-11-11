import { useRouter } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Trophy,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionCardProps = {
  onPress: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
};

function ActionCard({
  onPress,
  icon,
  title,
  description,
  backgroundColor,
  borderColor,
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      className="active:opacity-75"
      style={[styles.card, { backgroundColor, borderColor }]}
    >
      <View style={styles.iconRow}>
        {icon}
        <ChevronRight size={17} color="#7B8798" strokeWidth={1.8} />
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
}

export function DashboardActions() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        What would you like to do?
      </Text>

      <View style={styles.grid}>
        <View style={styles.row}>
          <ActionCard
            onPress={() => router.push("/matches")}
            backgroundColor="#EFF9F2"
            borderColor="#C8E8D3"
            icon={<CalendarDays size={26} color="#009E45" strokeWidth={1.9} />}
            title="Find a match"
            description="Find teams for friendlies"
          />

          <ActionCard
            onPress={() => router.push("/tournaments" as never)}
            backgroundColor="#F0F5FC"
            borderColor="#D6E2F3"
            icon={<Trophy size={26} color="#356AC3" strokeWidth={1.9} />}
            title="Find a tournament"
            description="Explore tournaments"
          />
        </View>

        <View style={styles.row}>
          <ActionCard
            onPress={() => router.push("/create/friendly" as never)}
            backgroundColor="#FFFFFF"
            borderColor="#CBD5E1"
            icon={<CirclePlus size={26} color="#009E45" strokeWidth={1.9} />}
            title="Create a match"
            description="Post a friendly"
          />

          <ActionCard
            onPress={() => router.push("/create/tournament" as never)}
            backgroundColor="#FFFFFF"
            borderColor="#CBD5E1"
            icon={<CirclePlus size={26} color="#7560B5" strokeWidth={1.9} />}
            title="Create a tournament"
            description="Organise an event"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#07192D",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  grid: {
    marginTop: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 128,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    marginTop: 12,
    color: "#07192D",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  cardDescription: {
    marginTop: 4,
    color: "#596B80",
    fontSize: 13,
    lineHeight: 18,
  },
});