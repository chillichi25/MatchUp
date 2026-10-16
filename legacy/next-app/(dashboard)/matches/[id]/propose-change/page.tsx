import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { getMatchDetails } from "@/features/matches/services/get-match-details";
import { ProposeMatchChangeForm } from "@/features/matches/components/propose-match-change-form";

type ProposeChangePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProposeChangePage({
  params,
}: ProposeChangePageProps) {
  const { id } = await params;

  const match = await getMatchDetails(id);

  // Only scheduled matches can be changed.
  if (match.status !== "scheduled") {
    redirect(`/matches/${id}`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <Link
          href={`/matches/${id}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Propose Change
        </h1>
      </header>

      {/* Intro */}

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">
          Change match details
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your opponent will need to approve these changes.
        </p>
      </section>

      <ProposeMatchChangeForm
  matchId={match.id}
  proposingTeamId={match.activeTeamId}
  matchDate={match.match_date}
  kickOffTime={
    match.kick_off_time?.slice(0, 5) ?? ""
  }
  location={match.location ?? ""}
/>
    </main>
  );
}