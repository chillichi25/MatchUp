"use server";

import { revalidatePath } from "next/cache";

import {
  assignClubMemberToTeam,
  removeClubMemberFromTeam,
} from "@/features/clubs/services/club.service";

export async function assignMemberToTeamAction(
  clubId: string,
  coachId: string,
  teamId: string
) {
  if (
    !clubId?.trim() ||
    !coachId?.trim() ||
    !teamId?.trim()
  ) {
    throw new Error(
      "A club, member and team are required."
    );
  }

  await assignClubMemberToTeam({
    coachId,
    teamId,
  });

  revalidatePath(
    `/clubs/${clubId}/manage/members`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}/teams`
  );
}

export async function removeMemberFromTeamAction(
  clubId: string,
  coachId: string,
  teamId: string
) {
  if (
    !clubId?.trim() ||
    !coachId?.trim() ||
    !teamId?.trim()
  ) {
    throw new Error(
      "A club, member and team are required."
    );
  }

  await removeClubMemberFromTeam({
    coachId,
    teamId,
  });

  revalidatePath(
    `/clubs/${clubId}/manage/members`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}/teams`
  );
}