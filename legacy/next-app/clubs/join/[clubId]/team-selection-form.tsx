"use client";

import {
  Check,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Shirt,
} from "lucide-react";
import {
  useState,
  useTransition,
} from "react";

import {
  requestToJoinTeamAction,
} from "../actions";

type Team = {
  id: string;
  club_id: string;
  name: string;
  age_group: string;
  gender: string;
  level: string;
  match_format: string;
};

type TeamSelectionFormProps = {
  clubId: string;
  teams: Team[];
};

function formatAgeGroup(
  ageGroup: string
) {
  if (!ageGroup) {
    return "";
  }

  const value =
    ageGroup.trim();

  if (
    /^u\d+$/i.test(value)
  ) {
    return `Under ${value.slice(1)}`;
  }

  return value;
}

function formatGender(
  gender: string
) {
  const value =
    gender?.trim().toLowerCase();

  if (value === "male") {
    return "Boys";
  }

  if (value === "female") {
    return "Girls";
  }

  if (value === "mixed") {
    return "Mixed";
  }

  return gender;
}

function formatMatchFormat(
  matchFormat: string
) {
  if (!matchFormat) {
    return "";
  }

  const value =
    matchFormat.trim();

  if (/^\d+$/.test(value)) {
    return `${value}-a-side`;
  }

  if (
    /^\d+\s*a\s*side$/i.test(value)
  ) {
    return value.replace(
      /\s*a\s*side/i,
      "-a-side"
    );
  }

  return value;
}

export function TeamSelectionForm({
  clubId,
  teams,
}: TeamSelectionFormProps) {
  const [
    selectedTeamId,
    setSelectedTeamId,
  ] = useState<string | null>(
    null
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function submitRequest() {
    if (
      !selectedTeamId ||
      isPending
    ) {
      return;
    }

    startTransition(async () => {
      await requestToJoinTeamAction(
        clubId,
        selectedTeamId
      );
    });
  }

  return (
    <>
      <section className="mt-8">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#07192D]">
          Teams at this club
        </h2>

        {teams.length > 0 ? (
          <div className="mt-4 space-y-3">
            {teams.map((team) => {
              const selected =
                selectedTeamId ===
                team.id;

              const details = [
                formatAgeGroup(
                  team.age_group
                ),
                formatGender(
                  team.gender
                ),
                formatMatchFormat(
                  team.match_format
                ),
              ].filter(Boolean);

              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={isPending}
                  onClick={() =>
  setSelectedTeamId(
    selected ? null : team.id
  )
}
                  className={`flex w-full items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left shadow-[0_2px_6px_rgba(15,23,42,0.05)] transition active:scale-[0.99] ${
                    selected
                      ? "border-green-200 bg-green-50/70"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Shirt */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? "bg-green-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Shirt
  size={25}
  strokeWidth={1.5}
  aria-hidden="true"
  fill="currentColor"
  className={
    selected
      ? "text-[#00B83F]"
      : "text-slate-400"
  }
/>
                  </div>

                  {/* Team details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-[#07192D]">
                      {team.name}
                    </p>

                    {details.length >
                      0 && (
                      <p className="mt-1 truncate text-[13px] text-slate-500">
                        {details.join(
                          " · "
                        )}
                      </p>
                    )}
                  </div>

                  {/* Selection */}
                  {selected ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B83F] text-white">
                      <Check
                        size={19}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <ChevronRight
                      size={20}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="shrink-0 text-slate-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
            <p className="text-[14px] font-semibold text-[#07192D]">
              No teams available
            </p>

            <p className="mt-1 text-[13px] text-slate-500">
              This club hasn&apos;t
              added any teams yet.
            </p>
          </div>
        )}
      </section>

      {/* Approval information */}
      {teams.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] bg-green-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#00B83F]">
            <ShieldCheck
              size={21}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-[14px] font-semibold text-[#07192D]">
              Club approval required
            </p>

            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Your request will be
              reviewed by the club
              owner or admin.
            </p>
          </div>
        </div>
      )}

      {/* Request */}
      {teams.length > 0 && (
        <button
          type="button"
          disabled={
            !selectedTeamId ||
            isPending
          }
          onClick={submitRequest}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00B83F] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
        >
          {isPending ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />

              Sending request...
            </>
          ) : (
            "Request to join team"
          )}
        </button>
      )}
    </>
  );
}