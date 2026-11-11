import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Clock, MapPin, ShieldCheck } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatVenueLabel } from "@/features/friendlies/constants";
import {
  useCancelFriendly,
  useFriendlyDetail,
} from "@/features/friendlies/hooks/use-friendlies";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";

const GREEN = "#009E45";

export default function FriendlyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const cancelFriendly = useCancelFriendly();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friendly = detail.data;
  const isOpen = friendly?.status === "open";
  const isCancelled = friendly?.status === "cancelled";
  const notes = friendly?.notes?.trim();

  const ageGroup = friendly?.ageGroup?.trim();
  const teamNameParts = friendly?.teamName.toLowerCase().split(/[\s-]+/);
  const showAgeGroup =
    ageGroup && !teamNameParts?.includes(ageGroup.toLowerCase());

  const tags = [
    showAgeGroup ? ageGroup : null,
    friendly?.level,
    friendly?.matchFormat,
    friendly?.gender,
  ].filter(Boolean);

  async function handleCancel() {
    if (!friendly || cancelFriendly.isPending) return;

    setError(null);

    try {
      await cancelFriendly.mutateAsync(friendly.id);
      setConfirmOpen(false);
      router.replace("/matches" as never);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "We couldn't cancel this friendly."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Match details" fallbackHref="/matches" />

      {detail.isLoading ? (
        <LoadingState />
      ) : !friendly ? (
        <View className="px-6 pt-6">
          <EmptyState
            title="Match not found"
            description="This match may have been removed."
          />
        </View>
      ) : (
        <ScreenScroll contentClassName="px-6 pb-8 pt-6">
          <View className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
            <View className="p-4">
              <View className="flex-row items-center gap-3">
                <Avatar
                  uri={friendly.badgeUrl}
                  name={friendly.clubName || friendly.teamName}
                  size={48}
                />

                <View className="min-w-0 flex-1">
                  <Text
                    accessibilityRole="header"
                    className="text-[20px] font-bold tracking-tight text-[#07192D]"
                  >
                    {friendly.teamName || friendly.clubName}
                  </Text>

                  {friendly.teamName && friendly.clubName ? (
                    <Text className="mt-0.5 text-[13px] text-[#596B80]">
                      {friendly.clubName}
                    </Text>
                  ) : null}
                </View>
              </View>

              {tags.length > 0 ? (
                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  {tags.map((tag, index) => (
                    <View
                      key={`${tag}-${index}`}
                      className="rounded-full bg-slate-100 px-2.5 py-1"
                    >
                      <Text className="text-[11px] font-medium text-[#596B80]">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {isOpen ? (
                <View className="mt-3 self-start rounded-full bg-green-50 px-3 py-1.5">
                  <Text className="text-[12px] font-semibold text-green-800">
                    Looking for an opponent
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-3 border-t border-slate-100 p-4">
              <InfoRow
                icon={<CalendarDays size={18} color={GREEN} strokeWidth={1.9} />}
                label="Match date"
                value={formatDateWithYear(friendly.matchDate)}
              />

              {friendly.kickOff ? (
                <InfoRow
                  icon={<Clock size={18} color={GREEN} strokeWidth={1.9} />}
                  label="Kick-off time"
                  value={formatKickOff(friendly.kickOff)}
                />
              ) : null}

              {friendly.location?.trim() ? (
                <InfoRow
                  icon={<MapPin size={18} color={GREEN} strokeWidth={1.9} />}
                  label="Town or city"
                  value={friendly.location}
                />
              ) : null}

              <InfoRow
                icon={<ShieldCheck size={18} color={GREEN} strokeWidth={1.9} />}
                label="Home or away"
                value={formatVenueLabel(friendly.venueType)}
              />
            </View>
          </View>

          {notes ? (
            <View className="mt-4 rounded-2xl border border-[#CBD5E1] bg-white p-4">
              <Text
                accessibilityRole="header"
                className="text-[14px] font-bold text-[#07192D]"
              >
                Match notes
              </Text>

              <Text className="mt-2 text-[14px] leading-5 text-[#596B80]">
                {notes}
              </Text>
            </View>
          ) : null}

          <View className="mt-5 gap-3">
            {isOpen ? (
              friendly.isOwner ? (
                <>
                  <Button
                    className="min-h-[50px] w-full rounded-full"
                    style={{ backgroundColor: GREEN }}
                    onPress={() =>
  router.push(`/friendlies/${friendly.id}/edit` as never)
}
                  >
                    Edit match
                  </Button>

                  <Button
  variant="outline"
  className="min-h-[50px] w-full rounded-full border-red-200"
  accessibilityLabel="Cancel match"
  onPress={() => {
    setError(null);
    setConfirmOpen(true);
  }}
>
  <Text style={{ color: "#B91C1C" }}>Cancel match</Text>
</Button>
                </>
              ) : (
                <Button
  className="min-h-[50px] w-full rounded-full"
  style={{ backgroundColor: GREEN }}
  onPress={() =>
    router.push(`/friendlies/${friendly.id}/request` as never)
  }
>
  Request to play
</Button>
              )
            ) : (
              <View
                className={`rounded-2xl px-4 py-3 ${
                  isCancelled ? "bg-slate-100" : "bg-green-50"
                }`}
              >
                <Text
                  className={`text-center text-[13px] font-medium ${
                    isCancelled ? "text-[#596B80]" : "text-green-800"
                  }`}
                >
                  {isCancelled
                    ? "This match has been cancelled."
                    : "An opponent has been confirmed."}
                </Text>
              </View>
            )}
          </View>
        </ScreenScroll>
      )}

      <ConfirmDialog
        visible={confirmOpen}
        title="Cancel this match?"
        description="This match will no longer be available to other coaches."
        confirmLabel="Cancel match"
        cancelLabel="Keep match"
        loading={cancelFriendly.isPending}
        error={error}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[12px] text-[#596B80]">{label}</Text>
        <Text className="mt-0.5 text-[14px] font-semibold text-[#07192D]">
          {value}
        </Text>
      </View>
    </View>
  );
}