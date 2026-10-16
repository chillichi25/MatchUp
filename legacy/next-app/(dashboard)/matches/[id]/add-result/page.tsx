import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { getMatchDetails } from "@/features/matches/services/get-match-details";
import { AddMatchResultForm } from "@/features/matches/components/add-match-result-form";

type AddResultPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AddResultPage({
  params,
}: AddResultPageProps) {
  const { id } = await params;

  const match = await getMatchDetails(id);

  if (match.status !== "scheduled") {
    redirect(`/matches/${id}`);
  }

  if (match.pendingResult) {
    redirect(`/matches/${id}`);
  }

  const home = match.home as any;
  const away = match.away as any;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      <header className="flex items-center">
        <Link
          href={`/matches/${id}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Add Result
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">
          Final score
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the final score. Your opponent will be asked to confirm it.
        </p>
      </section>

      <AddMatchResultForm
        matchId={match.id}
        activeTeamId={match.activeTeamId}
        homeTeamName={home?.name ?? "Home"}
        awayTeamName={away?.name ?? "Away"}
      />
    </main>
  );
}