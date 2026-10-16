import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Megaphone,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { TournamentUpdateForm } from "@/features/tournaments/components/tournament-update-form";

type MessageParticipantsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MessageParticipantsPage({
  params,
}: MessageParticipantsPageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // TOURNAMENT
  // --------------------------------------------------

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      created_by,
      name,
      age_group,
      status
    `)
    .eq("id", id)
    .maybeSingle();

  if (
    tournamentError ||
    !tournament
  ) {
    console.error(
      "Message participants tournament error:",
      tournamentError
    );

    notFound();
  }

  // Only organiser can access
  if (
    tournament.created_by !==
    user.id
  ) {
    redirect(
      `/tournaments/${id}`
    );
  }

  // --------------------------------------------------
  // PARTICIPANTS
  // --------------------------------------------------

  const {
    count: participantCount,
    error: participantError,
  } = await supabase
    .from("tournament_requests")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "tournament_id",
      id
    )
    .eq(
      "status",
      "accepted"
    );

  if (participantError) {
    console.error(
      "Message participants count error:",
      participantError
    );
  }

  const acceptedCount =
    participantCount ?? 0;

    // --------------------------------------------------
// UPDATE HISTORY
// --------------------------------------------------

const {
  data: updates,
  error: updatesError,
} = await supabase
  .from("tournament_updates")
  .select(`
    id,
    message,
    created_at
  `)
  .eq("tournament_id", id)
  .order("created_at", {
    ascending: false,
  });

if (updatesError) {
  console.error(
    "Tournament updates history error:",
    updatesError
  );
}

const updateHistory =
  updates ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href={`/tournaments/${id}/manage`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Message Participants
        </h1>
      </header>

      {/* Tournament */}
      <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <Trophy
              size={23}
              className="text-violet-600"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tournament.age_group ??
                "Open age"}
            </p>
          </div>
        </div>
      </section>

      {/* Recipients */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <Users
              size={21}
              className="text-[#00B83F]"
            />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              Participating teams
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {acceptedCount === 0
                ? "No teams will receive this message"
                : `${acceptedCount} ${
                    acceptedCount === 1
                      ? "team will"
                      : "teams will"
                  } receive this message`}
            </p>
          </div>
        </div>
      </section>

      <TournamentUpdateForm
  tournamentId={tournament.id}
  participantCount={acceptedCount}
/>

{/* Update history */}
<section className="mt-7">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-bold text-slate-900">
      Previous Updates
    </h2>

    {updateHistory.length > 0 && (
      <span className="text-sm font-medium text-slate-400">
        {updateHistory.length}
      </span>
    )}
  </div>

  {updateHistory.length === 0 ? (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center shadow-sm">
      <Megaphone
        size={30}
        className="mx-auto text-slate-300"
      />

      <h3 className="mt-3 font-semibold text-slate-900">
        No updates sent yet
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        Tournament announcements you send
        will appear here.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      {updateHistory.map((update) => {
        const sentAt =
          new Intl.DateTimeFormat(
            "en-GB",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          ).format(
            new Date(
              update.created_at
            )
          );

        return (
          <Link
            key={update.id}
            href={`/tournaments/updates/${update.id}`}
            className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Megaphone
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                  {update.message}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {sentAt}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  )}
</section>

      {/* Information */}
      <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-4">
        <p className="text-sm leading-6 text-blue-700">
          Only teams currently accepted
          into the tournament will
          receive this update.
        </p>
      </div>
    </main>
  );
}