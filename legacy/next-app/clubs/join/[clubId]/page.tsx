import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Building2,
  ChevronLeft,
  MapPin,
} from "lucide-react";

import {
  getClubById,
  getClubTeams,
} from "@/features/clubs/services/club.service";

import {
  TeamSelectionForm,
} from "./team-selection-form";

type JoinClubPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function JoinClubPage({
  params,
}: JoinClubPageProps) {
  const { clubId } =
    await params;

  const [club, teams] =
    await Promise.all([
      getClubById(clubId),
      getClubTeams(clubId),
    ]);

  if (!club) {
    notFound();
  }

  const location = [
    club.city,
    club.county,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-dvh bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-5">
        {/* Back */}
        <div className="flex h-11 items-center">
          <Link
  href="/clubs/join"
  aria-label="Back to club search"
  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07192D] shadow-sm transition hover:bg-slate-50 active:scale-95"
>
  <ChevronLeft
    size={22}
    strokeWidth={2}
    aria-hidden="true"
  />
</Link>
        </div>

        {/* Club */}
        <section className="mt-5 rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-4">
            {/* Badge */}
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50">
              {club.badge_url ? (
                <Image
                  src={
                    club.badge_url
                  }
                  alt={`${club.name} badge`}
                  width={72}
                  height={72}
                  priority
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <Building2
                  size={28}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-slate-400"
                />
              )}
            </div>

            {/* Club details */}
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-bold tracking-[-0.02em] text-[#07192D]">
                {club.name}
              </h1>

              {location && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
                  <MapPin
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-slate-400"
                  />

                  <span className="truncate">
                    {location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Teams */}
        <TeamSelectionForm
          clubId={club.id}
          teams={teams}
        />
      </div>
    </main>
  );
}