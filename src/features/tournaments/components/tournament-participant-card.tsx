import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { TournamentParticipant } from "../types";

type TournamentParticipantCardProps = {
  participant: TournamentParticipant;
  children?: ReactNode;
};

export function TournamentParticipantCard({
  participant,
  children,
}: TournamentParticipantCardProps) {
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <View className="flex-row items-center gap-2.5">
        <Avatar uri={participant.badgeUrl} name={participant.clubName} size={40} />

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[13px] font-bold leading-tight text-slate-950"
          >
            {participant.clubName}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-[10px] text-slate-500">
            {participant.teamName}
            {participant.ageGroup ? ` · ${participant.ageGroup}` : ""}
          </Text>
        </View>

        {children}
      </View>
    </View>
  );
}
