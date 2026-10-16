import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  useCancelFriendly,
  useFriendlyDetail,
} from "@/features/friendlies/hooks/use-friendlies";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";
import { formatVenueLabel } from "@/features/friendlies/constants";

export default function FriendlyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const cancelFriendly = useCancelFriendly();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friendly = detail.data;

  async function handleCancel() {
    if (!friendly) return;

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
      <PageHeader title="Match Details" fallbackHref="/matches" />

      {detail.isLoading ? (
        <LoadingState />
      ) : !friendly ? (
        <View className="px-4 pt-6">
          <EmptyState
            title="Match not found"
            description="This match may have been removed."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-4 pb-32 pt-5">
          <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <View className="px-5 pb-5 pt-5">
              <View className="flex-row items-center gap-3.5">
                <Avatar uri={friendly.badgeUrl} name={friendly.clubName} size={52} />

                <View className="min-w-0 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-[20px] font-bold tracking-tight text-slate-950"
                  >
                    {friendly.clubName}
                  </Text>
                  <Text numberOfLines={1} className="mt-1 text-[12px] text-slate-500">
                    {friendly.teamName}
                  </Text>
                </View>
              </View>

              <View className="ml-[66px] mt-2.5 flex-row flex-wrap gap-1.5">
                {[friendly.ageGroup, friendly.level, friendly.matchFormat, friendly.gender]
                  .filter(Boolean)
                  .map((tag) => (
                    <View
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1"
                    >
                      <Text className="text-[10px] font-medium text-slate-600">
                        {tag}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            <View className="border-t border-slate-100" />

            <View className="gap-4 px-5 py-5">
              <InfoRow
                icon={<CalendarDays size={17} color="#00A638" strokeWidth={1.9} />}
                label="Date"
                value={formatDateWithYear(friendly.matchDate)}
              />

              {friendly.kickOff ? (
                <InfoRow
                  icon={<Clock size={17} color="#00A638" strokeWidth={1.9} />}
                  label="Kick-off"
                  value={formatKickOff(friendly.kickOff)}
                />
              ) : null}

              {friendly.location ? (
                <InfoRow
                  icon={<MapPin size={17} color="#00A638" strokeWidth={1.9} />}
                  label="Location"
                  value={friendly.location}
                />
              ) : null}

              <InfoRow
                icon={<ShieldCheck size={17} color="#00A638" strokeWidth={1.9} />}
                label="Venue"
                value={formatVenueLabel(friendly.venueType)}
              />
            </View>
          </View>

          {friendly.notes?.trim() ? (
            <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Text className="text-[13px] font-bold text-slate-950">
                Match notes
              </Text>
              <Text className="mt-2 text-[12px] leading-[19px] text-slate-500">
                {friendly.notes}
              </Text>
            </View>
          ) : null}

          <View className="mt-6">
            {friendly.isOwner ? (
              friendly.status === "open" ? (
                <>
                  <View className="h-10 items-center justify-center rounded-full border border-green-100 bg-green-50 px-4">
                    <Text className="text-[12px] font-semibold text-[#00A638]">
                      This is your match.
                    </Text>
                  </View>

                  <View className="mt-3">
                    <Button
                      onPress={() =>
                        router.push(`/friendlies/${friendly.id}/edit` as never)
                      }
                    >
                      Edit Match
                    </Button>
                  </View>

                  <View className="mt-3">
                    <Button
                      variant="outline"
                      textClassName="text-red-600"
                      className="border-red-200"
                      onPress={() => {
                        setError(null);
                        setConfirmOpen(true);
                      }}
                    >
                      Cancel Match
                    </Button>
                  </View>
                </>
              ) : friendly.status === "cancelled" ? (
                <View className="rounded-full bg-slate-100 p-4">
                  <Text className="text-center text-[12px] font-medium text-slate-600">
                    This match has been cancelled.
                  </Text>
                </View>
              ) : (
                <View className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <Text className="text-center text-[12px] font-semibold text-[#00A638]">
                    This match has been matched.
                  </Text>
                </View>
              )
            ) : friendly.status === "open" ? (
              <Button
                onPress={() =>
                  router.push(`/friendlies/${friendly.id}/request` as never)
                }
              >
                Request Match
              </Button>
            ) : (
              <View className="rounded-2xl bg-slate-100 p-4">
                <Text className="text-center text-[12px] font-medium text-slate-600">
                  {friendly.status === "cancelled"
                    ? "This match is no longer available."
                    : "This match has already been matched."}
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
        confirmLabel="Cancel Match"
        cancelLabel="Keep Match"
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
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[10px] text-slate-500">{label}</Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-[12px] font-semibold text-slate-700"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
