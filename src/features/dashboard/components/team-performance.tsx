import { ChartColumn, Handshake, ShieldX, Trophy } from "lucide-react-native";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const RING_SIZE = 84;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
  const winShare = played > 0 ? wins / played : 0;
  const winRate = Math.round(winShare * 100);

  const stats = [
    { label: "Played", value: played, Icon: ChartColumn },
    { label: "Won", value: wins, Icon: Trophy },
    { label: "Drawn", value: draws, Icon: Handshake },
    { label: "Lost", value: losses, Icon: ShieldX },
  ];

  return (
    <View className="mt-8">
      <Text
        accessibilityRole="header"
        className="text-[18px] font-bold tracking-tight text-[#07192D]"
      >
        Team performance
      </Text>

      <View className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <View
          accessible
          accessibilityLabel={`${winRate}% win rate. ${wins} wins from ${played} matches.`}
          className="flex-row items-center gap-4"
        >
          <View
            className="shrink-0 items-center justify-center"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              style={{ transform: [{ rotate: "-90deg" }] }}
            >
              <Circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke="#DCFCE7"
                strokeWidth={7}
              />

              {winShare > 0 ? (
                <Circle
                  cx={RING_CENTER}
                  cy={RING_CENTER}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#009E45"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - winShare)}
                />
              ) : null}
            </Svg>

            <Text className="absolute text-[20px] font-bold text-[#07192D]">
              {winRate}%
            </Text>
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[14px] font-bold text-[#07192D]">
              Win rate
            </Text>
            <Text className="mt-0.5 text-[12px] leading-[18px] text-[#596B80]">
              {wins} {wins === 1 ? "win" : "wins"} from {played}{" "}
              {played === 1 ? "match" : "matches"}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row border-t border-slate-100 pt-3">
          {stats.map(({ label, value, Icon }, index) => (
            <View
              key={label}
              className={`flex-1 items-center px-1 ${
                index < stats.length - 1 ? "border-r border-slate-100" : ""
              }`}
            >
              <Icon size={18} color="#64748B" strokeWidth={1.8} />
              <Text className="mt-1 text-[15px] font-bold text-[#07192D]">
                {value}
              </Text>
              <Text className="mt-0.5 text-center text-[11px] text-[#596B80]">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}