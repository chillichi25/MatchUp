"use server";

import { redirect } from "next/navigation";

import {
  requestToJoinTeam,
  setActiveTeam,
} from "@/features/clubs/services/club.service";

export async function requestToJoinTeamAction(
  teamId: string,
  clubId: string
) {
  if (!teamId?.trim()) {
    throw new Error(
      "A team is required."
    );
  }

  if (!clubId?.trim()) {
    throw new Error(
      "A club is required."
    );
  }

  await requestToJoinTeam(teamId);

  redirect(
    `/clubs/${clubId}/teams/${teamId}/pending`
  );
}

export async function setActiveTeamAction(
  teamId: string
) {
  if (!teamId?.trim()) {
    throw new Error(
      "A team is required."
    );
  }

  await setActiveTeam(teamId);

  redirect("/dashboard");
}