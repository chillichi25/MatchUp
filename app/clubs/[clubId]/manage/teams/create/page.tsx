import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { CreateTeamForm } from "@/features/clubs/components/create-team-form";

import {
  canManageClubMemberships,
  getClubById,
} from "@/features/clubs/services/club.service";

import {
  createTeamForClubAction,
} from "./actions";

type AddTeamPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function AddTeamPage({
  params,
}: AddTeamPageProps) {
  const { clubId } = await params;

  const [club, canManage] =
    await Promise.all([
      getClubById(clubId),
      canManageClubMemberships(clubId),
    ]);

  if (!club || !canManage) {
    notFound();
  }

  const action = createTeamForClubAction.bind(
    null,
    clubId
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/manage/teams`}
            aria-label="Back to manage teams"
            className="flex h-10 w-10 items-center justify-center text-slate-700 transition hover:text-slate-950 active:scale-95"
          >
            <ArrowLeft
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>

          <Image
            src="/images/matchup-logo.png"
            alt="MatchUp"
            width={150}
            height={80}
            priority
            className="h-auto w-[125px]"
          />

          <div className="h-10 w-10" />
        </div>

        {/* Heading */}
        <div className="mt-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Add team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add a new team to{" "}
            <span className="font-medium text-slate-700">
              {club.name}
            </span>
            .
          </p>
        </div>

        {/* Form */}
        <CreateTeamForm
          action={action}
          clubName={club.name}
          country={club.country ?? ""}
          county={club.county ?? ""}
          city={club.city ?? ""}
          lat=""
          lng=""
          initialTeamName=""
          initialAgeGroup=""
          initialMatchFormat=""
          initialGender=""
          initialLevel=""
          submitLabel="Add team"
        />
      </div>
    </main>
  );
}