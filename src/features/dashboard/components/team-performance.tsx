import {
  ChartColumn,
  Handshake,
  ShieldX,
  Trophy,
} from "lucide-react-native";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

function StatColumn({
  icon,
  value,
  label,
  showDivider,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  showDivider: boolean;
}) {
  return (
    <View
      className={`flex-1 items-center px-1 ${
        showDivider ? "border-r border-slate-100" : ""
      }`}
    >
      {icon}

      <Text className="mt-1.5 text-[15px] font-bold text-slate-950">
        {value}
      </Text>

      <Text className="mt-0.5 text-[10px] font-medium text-slate-500">
        {label}
      </Text>
    </View>
  );
}

export function TeamPerformance({
  played,
  wins,
  draws,
  losses,
}: {
  played: number;
  wins: number;
  draws: number;
  losses: number;
}) {
  const winRate = played === 0 ? 0 : Math.round((wins / played) * 100);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold tracking-tight text-slate-950">
        Team Performance
      </Text>

      <View className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 pb-3.5 pt-4 shadow-sm">
        <View className="items-center">
          <View className="h-[120px] w-[120px] items-center justify-center">
            <Svg
              width={120}
              height={120}
              viewBox="0 0 120 120"
              style={{ transform: [{ rotate: "-90deg" }] }}
            >
              <Circle
                cx={60}
                cy={60}
                r={radius}
                fill="none"
                stroke="#DCFCE7"
                strokeWidth={9}
              />

              <Circle
                cx={60}
                cy={60}
                r={radius}
                fill="none"
                stroke="#00B83F"
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </Svg>

            <View className="absolute items-center justify-center">
              <Text className="text-[25px] font-bold tracking-tight text-slate-950">
                {winRate}%
              </Text>
            </View>
          </View>

          <Text className="-mt-0.5 text-[12px] font-medium text-slate-500">
            Win Rate
          </Text>
        </View>

        <View className="my-3 h-px bg-slate-100" />

        <View className="flex-row">
          <StatColumn
            icon={<ChartColumn size={21} color="#64748B" strokeWidth={2} />}
            value={played}
            label="Played"
            showDivider
          />

          <StatColumn
            icon={<Trophy size={21} color="#64748B" strokeWidth={2} />}
            value={wins}
            label="Wins"
            showDivider
          />

          <StatColumn
            icon={<Handshake size={21} color="#64748B" strokeWidth={2} />}
            value={draws}
            label="Draws"
            showDivider
          />

          <StatColumn
            icon={<ShieldX size={21} color="#64748B" strokeWidth={2} />}
            value={losses}
            label="Losses"
            showDivider={false}
          />
        </View>
      </View>
    </View>
  );
}
