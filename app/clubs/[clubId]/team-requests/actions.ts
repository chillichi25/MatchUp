"use server";

import { revalidatePath } from "next/cache";

import {
  approveTeamJoinRequest,
} from "@/features/clubs/services/club.service";

export async function approveTeamJoinRequestAction(
  membershipId: string,
  clubId: string
) {
  if (!membershipId?.trim()) {
    throw new Error(
      "A team membership request is required."
    );
  }

  if (!clubId?.trim()) {
    throw new Error(
      "A club is required."
    );
  }

  await approveTeamJoinRequest(
    membershipId
  );

  revalidatePath(
    `/clubs/${clubId}/team-requests`
  );
}