import { useRouter } from "expo-router";
import { Check, Shirt, ShieldCheck } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAvailableTeams } from "@/features/teams/hooks/use-teams";

import { useMyJoinRequests } from "../hooks/use-my-join-requests";
import { requestToJoinTeam } from "../services/club.service";
import type { ClubTeam } from "../types";
import { formatTeamDetails } from "../utils/team-labels";

type TeamSelectionFormProps = {
  clubId: string;
  clubName: string;
  teams: ClubTeam[];
};

export function TeamSelectionForm({
  clubId,
  clubName,
  teams,
}: TeamSelectionFormProps) {
  const router = useRouter();
  const availableTeamsQuery = useAvailableTeams();
  const requestsQuery = useMyJoinRequests();
  const requestInProgress = useRef(false);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const joinedTeamIds = new Set(
    (availableTeamsQuery.data ?? []).map((team) => team.id)
  );
  const pendingTeamIds = new Set(
    requestsQuery.data
      ?.find((request) => request.clubId === clubId)
      ?.teams.map((team) => team.id) ?? []
  );

  const membershipError = availableTeamsQuery.isError || requestsQuery.isError;
  const checkingMembership =
    availableTeamsQuery.isFetching ||
    requestsQuery.isFetching ||
    (!membershipError &&
      (availableTeamsQuery.data === undefined || requestsQuery.data === undefined));

  function getTeamStatus(teamId: string) {
    if (joinedTeamIds.has(teamId)) return "Already joined";
    if (pendingTeamIds.has(teamId)) return "Pending approval";
    return null;
  }

  const selectedTeam = teams.find(
    (team) => team.id === selectedTeamId && !getTeamStatus(team.id)
  );
  const canSubmit = Boolean(
    selectedTeam && !checkingMembership && !membershipError && !submitting
  );

  async function handleRequest() {
    if (!selectedTeam || !canSubmit || requestInProgress.current) return;

    const teamId = selectedTeam.id;
    requestInProgress.current = true;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const [memberships, requests] = await Promise.all([
        availableTeamsQuery.refetch(),
        requestsQuery.refetch(),
      ]);

      if (memberships.isError || requests.isError) {
        setErrorMessage("We couldn't check your team status. Please try again.");
        return;
      }

      if (memberships.data?.some((team) => team.id === teamId)) {
        setSelectedTeamId(null);
        setErrorMessage("You’ve already joined this team.");
        return;
      }

      const existingRequest = requests.data
        ?.find((request) => request.clubId === clubId)
        ?.teams.some((team) => team.id === teamId);

      if (existingRequest) {
        setSelectedTeamId(null);
        setErrorMessage("Your request for this team is already awaiting approval.");
        return;
      }

      await requestToJoinTeam(teamId);

      const refreshedRequests = await requestsQuery.refetch();
      const isPending = refreshedRequests.data
        ?.find((request) => request.clubId === clubId)
        ?.teams.some((team) => team.id === teamId);

      if (!refreshedRequests.isError && isPending) {
        router.replace({
          pathname: "/clubs/join/[clubId]/pending",
          params: { clubId, teamId },
        });
        return;
      }

      setSelectedTeamId(null);

      const refreshedMemberships = await availableTeamsQuery.refetch();

      if (
        !refreshedMemberships.isError &&
        refreshedMemberships.data?.some((team) => team.id === teamId)
      ) {
        setErrorMessage("You’ve already joined this team.");
      } else {
        setErrorMessage(
          "We couldn't confirm the request status. Open Pending requests to check before trying again."
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your request. Please try again."
      );
    } finally {
      requestInProgress.current = false;
      setSubmitting(false);
    }
  }

  return (
    <View className="mt-9">
      <Text className="text-[16px] font-bold text-[#07192D]">
        Teams at this club
      </Text>

      {teams.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-[#CBD5E1] bg-white px-5 py-6">
          <Text className="text-[15px] font-semibold text-[#07192D]">
            No teams available
          </Text>
          <Text className="mt-2 text-[14px] leading-5 text-[#596B80]">
            {clubName} hasn&apos;t added any teams yet. Contact the club to ask
            about joining.
          </Text>
        </View>
      ) : (
        <>
          <Text className="text-[14px] leading-5 text-[#596B80]">
            Select the team you would like to join.
          </Text>

          {membershipError ? (
            <View className="mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text accessibilityRole="alert" className="text-[14px] text-red-700">
                We couldn&apos;t check your team memberships.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={submitting || checkingMembership}
                className="min-h-[44px] justify-center"
                onPress={() => {
                  setErrorMessage("");
                  void Promise.all([
                    availableTeamsQuery.refetch(),
                    requestsQuery.refetch(),
                  ]);
                }}
              >
                <Text className="font-semibold text-[#009E45]">Try again</Text>
              </Pressable>
            </View>
          ) : checkingMembership && !submitting ? (
            <Text
              accessibilityLiveRegion="polite"
              className="mt-3 text-[13px] text-[#596B80]"
            >
              Checking your team memberships…
            </Text>
          ) : null}

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Teams at this club"
            className="mt-3 gap-1"
          >
            {teams.map((team) => {
              const status = getTeamStatus(team.id);
              const isSelected = selectedTeam?.id === team.id;
              const details = formatTeamDetails(team);
              const disabled = Boolean(
                status || submitting || checkingMembership || membershipError
              );

              return (
                <Pressable
                  key={team.id}
                  accessibilityRole="radio"
                  accessibilityLabel={[team.name, details, status]
                    .filter(Boolean)
                    .join(", ")}
                  accessibilityState={{ checked: isSelected, disabled }}
                  disabled={disabled}
                  onPress={() => {
                    setSelectedTeamId((current) =>
                      current === team.id ? null : team.id
                    );
                    setErrorMessage("");
                  }}
                  className="flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-80"
                  style={{
                    borderColor: isSelected ? "#009E45" : "#CBD5E1",
                    backgroundColor: isSelected ? "#EFF8F2" : "#FFFFFF",
                  }}
                >
                  <View
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4F5EB]"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    <Shirt size={20} color="#009E45" strokeWidth={1.8} />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text className="text-[15px] font-semibold text-[#07192D]">
                      {team.name}
                    </Text>
                    {details ? (
                      <Text className="mt-1 text-[13px] leading-[18px] text-[#596B80]">
                        {details}
                      </Text>
                    ) : null}
                    {status ? (
                      <Text
                        className="mt-1 text-[13px] font-semibold"
                        style={{
                          color: status === "Already joined" ? "#007A36" : "#92400E",
                        }}
                      >
                        {status}
                      </Text>
                    ) : null}
                  </View>

                  {!status ? (
                    <View
                      className="h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: isSelected ? "#009E45" : "#CBD5E1",
                        backgroundColor: isSelected ? "#009E45" : "#FFFFFF",
                      }}
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    >
                      {isSelected ? (
                        <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
                      ) : null}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5 flex-row items-start gap-3 rounded-xl bg-[#EAF5EE] px-4 py-3">
            <View
              className="mt-0.5"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <ShieldCheck size={18} color="#009E45" strokeWidth={1.8} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold text-[#07192D]">
                Approval required
              </Text>
              <Text className="mt-1 text-[13px] leading-[18px] text-[#596B80]">
                A club owner or admin will review your request.
              </Text>
            </View>
          </View>

          {errorMessage ? (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <Text className="text-[14px] leading-5 text-red-700">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => void handleRequest()}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: submitting }}
            className="mt-5 min-h-[50px] flex-row items-center justify-center gap-2 rounded-full px-6 py-3 active:opacity-80"
            style={{
              backgroundColor: canSubmit || submitting ? "#009E45" : "#E2E8F0",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
            <Text
              className="text-center text-[16px] font-bold"
              style={{ color: canSubmit || submitting ? "#FFFFFF" : "#596B80" }}
            >
              {submitting ? "Sending request…" : "Request to join"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}