"use client";

import {
  Check,
  ChevronDown,
  Shield,
  X,
} from "lucide-react";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { setActiveTeam } from "@/features/teams/services/active-team.service";

type TeamSwitcherTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;

  club: {
    id: string;
    name: string;
    badgeUrl: string | null;
    city: string | null;
  };
};

type TeamSwitcherProps = {
  activeTeamId: string;
  clubName: string;
  teamName: string;
  teams: TeamSwitcherTeam[];
};

export function TeamSwitcher({
  activeTeamId,
  clubName,
  teamName,
  teams,
}: TeamSwitcherProps) {
  const router = useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [open, setOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  function switchTeam(
    teamId: string
  ) {
    if (
      teamId === activeTeamId ||
      isPending
    ) {
      setOpen(false);
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        await setActiveTeam(teamId);

        setOpen(false);

        router.refresh();
      } catch (err) {
        console.error(
          "TEAM SWITCH ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to switch team."
        );
      }
    });
  }

  return (
    <>
      {/* Active team */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full min-w-0 items-center gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-950">
            {clubName}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-slate-500">
            {teamName}
          </p>
        </div>

        <ChevronDown
          size={19}
          strokeWidth={2}
          className="shrink-0 text-slate-500"
        />
      </button>

      {/* Team switcher */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/40">
          {/* Background overlay */}
          <button
            type="button"
            aria-label="Close team switcher"
            className="absolute inset-0"
            onClick={() =>
              setOpen(false)
            }
          />

          {/* Bottom sheet */}
          <div className="relative z-10 w-full rounded-t-3xl bg-white px-5 pb-8 pt-5">
            <div className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Switch team
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose the team you&apos;re managing.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <X
                    size={20}
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Teams */}
              <div className="mt-6 space-y-3">
                {teams.map((team) => {
                  const isActive =
                    team.id ===
                    activeTeamId;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        switchTeam(
                          team.id
                        )
                      }
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-[#00B83F] bg-green-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {/* Club badge */}
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                        {team.club.badgeUrl ? (
                          <img
                            src={
                              team.club.badgeUrl
                            }
                            alt={`${team.club.name} badge`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Shield
                            size={26}
                            strokeWidth={1.8}
                            className="text-slate-400"
                          />
                        )}
                      </div>

                      {/* Club / team details */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-950">
                          {
                            team.club.name
                          }
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {team.name}

                          {team.age_group
                            ? ` · ${team.age_group}`
                            : ""}
                        </p>

                        {team.club.city && (
                          <p className="mt-1 text-xs text-slate-400">
                            {
                              team.club.city
                            }
                          </p>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isActive && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00B83F] text-white">
                          <Check
                            size={16}
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}