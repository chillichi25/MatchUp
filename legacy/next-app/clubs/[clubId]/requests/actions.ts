"use server";

import { revalidatePath } from "next/cache";

import {
  approveClubJoinRequest,
} from "@/features/clubs/services/club.service";

export async function approveClubJoinRequestAction(
  membershipId: string,
  clubId: string
) {
  if (!membershipId?.trim()) {
    throw new Error(
      "A membership request is required."
    );
  }

  if (!clubId?.trim()) {
    throw new Error(
      "A club is required."
    );
  }

  await approveClubJoinRequest(
    membershipId
  );

  revalidatePath(
    `/clubs/${clubId}/requests`
  );
}