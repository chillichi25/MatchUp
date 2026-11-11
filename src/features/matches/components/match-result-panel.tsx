import { useRef, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSession } from "@/features/auth/providers/auth-provider";

import {
  usePendingMatchResult,
  useRespondToMatchResult,
  useSubmitMatchResult,
} from "../hooks/use-matches";
import type { MatchDetail } from "../types";

const GREEN = "#009E45";
const MAX_SCORE = 2147483647;

function isValidScore(value: string) {
  const trimmed = value.trim();

  return (
    /^\d+$/.test(trimmed) &&
    Number.isSafeInteger(Number(trimmed)) &&
    Number(trimmed) <= MAX_SCORE
  );
}

export function MatchResultPanel({ match }: { match: MatchDetail }) {
  const { session } = useSession();

  const eligible = match.status === "scheduled" && match.isPast;

  const pending = usePendingMatchResult(match.id, eligible);
  const submit = useSubmitMatchResult();
  const respond = useRespondToMatchResult();

  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<
    "accepted" | "declined" | null
  >(null);

  const actionRef = useRef(false);
  const result = pending.data;
  const busy = submit.isPending || respond.isPending;

  const scoresValid =
    isValidScore(homeScore) && isValidScore(awayScore);

  const canRespond =
    Boolean(result && session?.user.id) &&
    result?.submitted_by_team_id !== match.activeTeamId &&
    result?.submitted_by !== session?.user.id;

  function updateHomeScore(value: string) {
    setHomeScore(value);
    setError(null);
  }

  function updateAwayScore(value: string) {
    setAwayScore(value);
    setError(null);
  }

  async function handleSubmit() {
    if (
      !eligible ||
      actionRef.current ||
      busy ||
      result ||
      !scoresValid
    ) {
      return;
    }

    actionRef.current = true;
    setError(null);
    Keyboard.dismiss();

    try {
      await submit.mutateAsync({
        matchId: match.id,
        homeScore: Number(homeScore.trim()),
        awayScore: Number(awayScore.trim()),
      });

      setHomeScore("");
      setAwayScore("");
      toast.success("Result sent for confirmation");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Couldn't submit the result."
      );
    } finally {
      actionRef.current = false;
    }
  }

  async function handleResponse() {
    if (
      !result ||
      !confirmation ||
      !canRespond ||
      busy ||
      actionRef.current
    ) {
      return;
    }

    const response = confirmation;

    actionRef.current = true;
    setError(null);

    try {
      await respond.mutateAsync({
        resultRequestId: result.id,
        response,
      });

      setConfirmation(null);

      toast.success(
        response === "accepted"
          ? "Result confirmed"
          : "Result rejected"
      );
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Couldn't respond to the result."
      );
    } finally {
      actionRef.current = false;
    }
  }

  if (!eligible) return null;

  if (pending.isLoading) {
    return (
      <View className="mt-4 rounded-2xl bg-slate-100 p-4">
        <Text className="text-center text-[13px] text-[#596B80]">
          Loading result…
        </Text>
      </View>
    );
  }

  if (pending.isError) {
    return (
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-[13px] leading-5 text-[#596B80]">
          We couldn&apos;t check whether a result has already been
          submitted.
        </Text>

        <Button
          variant="outline"
          className="mt-3 rounded-full"
          loading={pending.isFetching}
          disabled={pending.isFetching}
          onPress={() => void pending.refetch()}
        >
          Try again
        </Button>
      </View>
    );
  }

  const homeIsYourTeam =
    match.homeTeam.teamId === match.activeTeamId;

  const awayIsYourTeam =
    match.awayTeam.teamId === match.activeTeamId;

  return (
    <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-[16px] font-bold text-[#07192D]">
        {result
          ? canRespond
            ? "Confirm match result"
            : "Result awaiting confirmation"
          : "Record match result"}
      </Text>

      <Text className="mt-2 text-[13px] leading-5 text-[#596B80]">
        {result
          ? canRespond
            ? "The other team submitted this score. Check each team's score before confirming."
            : "This score is waiting for confirmation from the opposing coach."
          : "Enter the final score for each team. The opposing coach must confirm it before it becomes official."}
      </Text>

      {/* One shared row keeps both team descriptions aligned. */}
      <View className="mt-5 flex-row items-start gap-3">
        <ScoreTeam
          label="Home"
          isYourTeam={homeIsYourTeam}
          teamName={match.homeTeam.teamName}
          clubName={match.homeTeam.clubName}
        />

        <View style={{ width: 16 }} />

        <ScoreTeam
          label="Away"
          isYourTeam={awayIsYourTeam}
          teamName={match.awayTeam.teamName}
          clubName={match.awayTeam.clubName}
        />
      </View>

      {/* A separate row aligns the score inputs and separator. */}
      <View className="mt-3 flex-row items-center gap-3">
        <ScoreInput
          label="Home"
          teamName={match.homeTeam.teamName}
          isYourTeam={homeIsYourTeam}
          value={result ? String(result.home_score) : homeScore}
          onChangeText={updateHomeScore}
          editable={!result && !busy}
        />

        <Text
          accessible={false}
          className="text-center text-[20px] font-semibold text-[#596B80]"
          style={{ width: 16 }}
        >
          –
        </Text>

        <ScoreInput
          label="Away"
          teamName={match.awayTeam.teamName}
          isYourTeam={awayIsYourTeam}
          value={result ? String(result.away_score) : awayScore}
          onChangeText={updateAwayScore}
          editable={!result && !busy}
        />
      </View>

      {error && !confirmation ? (
        <Text
          accessibilityRole="alert"
          className="mt-3 text-[13px] leading-5 text-red-700"
        >
          {error}
        </Text>
      ) : null}

      {!result ? (
        <Button
          className="mt-5 min-h-[50px] rounded-full"
          style={{
            backgroundColor: GREEN,
            opacity: !scoresValid || busy ? 0.5 : 1,
          }}
          loading={submit.isPending}
          disabled={!scoresValid || busy}
          onPress={handleSubmit}
        >
          Submit result
        </Button>
      ) : canRespond ? (
        <View className="mt-5 gap-3">
          <Button
            className="min-h-[50px] rounded-full"
            style={{ backgroundColor: GREEN }}
            disabled={busy}
            onPress={() => {
              setError(null);
              setConfirmation("accepted");
            }}
          >
            Confirm result
          </Button>

          <Button
            variant="outline"
            className="min-h-[50px] rounded-full border-red-200"
            textClassName="text-red-700"
            disabled={busy}
            onPress={() => {
              setError(null);
              setConfirmation("declined");
            }}
          >
            Reject result
          </Button>
        </View>
      ) : null}

      <ConfirmDialog
      variant={confirmation === "accepted" ? "success" : "danger"}
        visible={confirmation !== null}
        title={
          confirmation === "accepted"
            ? "Confirm this result?"
            : "Reject this result?"
        }
        description={
          confirmation === "accepted"
            ? `Confirm the final score: ${match.homeTeam.teamName} ${
                result?.home_score ?? ""
              } – ${result?.away_score ?? ""} ${
                match.awayTeam.teamName
              }. This will save the score for both teams and mark the match as completed.`
            : "This submitted score will be rejected. A coach can then submit a corrected result."
        }
        confirmLabel={
          confirmation === "accepted"
            ? "Confirm result"
            : "Reject result"
        }
        cancelLabel="Go back"
        loadingLabel={
          confirmation === "accepted"
            ? "Confirming…"
            : "Rejecting…"
        }
        loading={respond.isPending}
        error={error}
        onConfirm={handleResponse}
        onCancel={() => {
          if (!actionRef.current) {
            setConfirmation(null);
            setError(null);
          }
        }}
      />
    </View>
  );
}

function ScoreTeam({
  label,
  isYourTeam,
  teamName,
  clubName,
}: {
  label: string;
  isYourTeam: boolean;
  teamName: string;
  clubName: string;
}) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-center text-[12px] leading-[18px] text-[#596B80]">
        {label}
        {isYourTeam ? (
          <Text className="font-semibold text-[#009E45]">
            {" · Your team"}
          </Text>
        ) : null}
      </Text>

      <Text className="mt-1 text-center text-[14px] font-bold leading-5 text-[#07192D]">
        {teamName || "Team"}
      </Text>

      <Text className="mt-1 text-center text-[11px] leading-4 text-[#596B80]">
        {clubName}
      </Text>
    </View>
  );
}

function ScoreInput({
  label,
  teamName,
  isYourTeam,
  value,
  onChangeText,
  editable,
}: {
  label: string;
  teamName: string;
  isYourTeam: boolean;
  value: string;
  onChangeText: (value: string) => void;
  editable: boolean;
}) {
  return (
    <TextInput
      accessibilityLabel={`${label} score for ${teamName || "Team"}${
        isYourTeam ? ", your team" : ""
      }`}
      accessibilityHint={
        editable ? "Enter a whole number, including zero." : undefined
      }
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType="number-pad"
      maxLength={10}
      placeholder="—"
      placeholderTextColor="#94A3B8"
      selectTextOnFocus
      style={{
        flex: 1,
        minWidth: 0,
        height: 60,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 16,
        backgroundColor: editable ? "#FFFFFF" : "#F8FAFC",
        color: "#07192D",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        paddingHorizontal: 8,
        paddingVertical: 8,
      }}
    />
  );
}
