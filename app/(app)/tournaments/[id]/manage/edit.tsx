import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { TournamentForm } from "@/features/tournaments/components/tournament-form";
import { useTournamentDetail } from "@/features/tournaments/hooks/use-tournaments";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function EditTournamentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useTournamentDetail(id);
  const activeTeam = useActiveTeam();

  const tournament = detail.data;

  return (
    <Screen>
      <PageHeader title="Edit Tournament" fallbackHref={`/tournaments/${id}/manage`} />

      {detail.isLoading || activeTeam.isLoading ? (
        <LoadingState />
      ) : !tournament || !tournament.isOwner ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Not authorised"
            description="Only the organiser can edit this tournament."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <TournamentForm
            mode="edit"
            tournamentId={tournament.id}
            teamName={activeTeam.data?.name ?? ""}
            clubName={activeTeam.data?.clubs?.name ?? ""}
            initialValues={{
              name: tournament.name,
              ageGroup: tournament.ageGroup ?? "",
              gender: tournament.gender ?? "",
              level: tournament.level ?? "",
              matchFormat: tournament.matchFormat ?? "",
              startDate: tournament.startDate,
              startTime: tournament.startTime?.slice(0, 5) ?? "",
              endDate: tournament.endDate ?? "",
              endTime: tournament.endTime?.slice(0, 5) ?? "",
              location: tournament.location ?? "",
              entryFee:
                tournament.entryFee === null
                  ? "0"
                  : String(tournament.entryFee),
              maxTeams:
                tournament.maxTeams === null ? "" : String(tournament.maxTeams),
              description: tournament.description ?? "",
            }}
            onSaved={() => router.replace(`/tournaments/${id}/manage` as never)}
          />
        </ScreenScroll>
      )}
    </Screen>
  );
}
