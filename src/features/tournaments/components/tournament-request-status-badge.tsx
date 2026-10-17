import { Text, View } from "react-native";

import type { TournamentRequestStatus } from "../types";

const STYLES: Record<
  TournamentRequestStatus,
  { label: string; container: string; text: string }
> = {
  pending: {
    label: "Pending",
    container: "bg-amber-100",
    text: "text-amber-700",
  },
  accepted: {
    label: "Accepted",
    container: "bg-[#E4F9EB]",
    text: "text-[#009F37]",
  },
  declined: {
    label: "Declined",
    container: "bg-red-100",
    text: "text-red-700",
  },
  removed: {
    label: "Removed",
    container: "bg-slate-100",
    text: "text-slate-600",
  },
  withdrawn: {
    label: "Withdrawn",
    container: "bg-slate-100",
    text: "text-slate-600",
  },
  cancelled: {
    label: "Cancelled",
    container: "bg-slate-100",
    text: "text-slate-600",
  },
  expired: {
    label: "Expired",
    container: "bg-slate-100",
    text: "text-slate-600",
  },
};

export function TournamentRequestStatusBadge({
  status,
}: {
  status: TournamentRequestStatus;
}) {
  const style = STYLES[status];

  return (
    <View className={`rounded-full px-2.5 py-1 ${style.container}`}>
      <Text className={`text-[11px] font-semibold ${style.text}`}>
        {style.label}
      </Text>
    </View>
  );
}
