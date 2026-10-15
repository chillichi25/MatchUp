import { redirect } from "next/navigation";

import { getProfileData } from "@/features/profile/services/profile.service";
import { EditClubForm } from "@/features/clubs/components/edit-club-form";

export default async function EditClubPage() {
  const profile = await getProfileData();

  if (!profile) {
    redirect("/profile");
  }

  if (!profile.clubId) {
    redirect("/profile");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Edit Club
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update your club name and location.
        </p>
      </section>

      <section className="mt-8">
        <EditClubForm
  clubId={profile.clubId}
  initialName={profile.clubName}
  initialCity={profile.clubCity}
  initialCounty={profile.clubCounty}
  initialCountry={profile.clubCountry}
  initialLat={profile.clubLat}
  initialLng={profile.clubLng}
/>
      </section>
    </main>
  );
}