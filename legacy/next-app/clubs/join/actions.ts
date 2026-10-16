"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requestToJoinClub,
  requestToJoinTeam,
  searchClubs,
} from "@/features/clubs/services/club.service";

export async function requestToJoinClubAction(
  clubId: string
) {
  if (!clubId?.trim()) {
    throw new Error(
      "Please select a club."
    );
  }

  const result =
    await requestToJoinClub(
      clubId
    );

  revalidatePath("/clubs");
  revalidatePath("/clubs/join");
  revalidatePath("/profile");

  if (
    result.status === "approved"
  ) {
    redirect("/dashboard");
  }

  redirect(
    `/clubs/join/${clubId}/pending`
  );
}

export async function requestToJoinTeamAction(
  clubId: string,
  teamId: string
) {
  const cleanClubId =
    clubId.trim();

  const cleanTeamId =
    teamId.trim();

  if (!cleanClubId) {
    throw new Error(
      "Please select a club."
    );
  }

  if (!cleanTeamId) {
    throw new Error(
      "Please select a team."
    );
  }

  await requestToJoinTeam(
    cleanTeamId
  );

  revalidatePath("/clubs");
  revalidatePath("/clubs/join");
  revalidatePath(
    `/clubs/join/${cleanClubId}`
  );
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  redirect(
  `/clubs/join/${cleanClubId}/pending?teamId=${cleanTeamId}&sent=1`
);
}

export async function searchClubsAction(
  query: string
) {
  const cleanQuery =
    query.trim();

  if (cleanQuery.length < 1) {
  return [];
}

  const results =
    await searchClubs(
      cleanQuery
    );

  return results;
}