"use server";

import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import {
  removeClubMember,
  updateClubMemberRole,
} from "@/features/clubs/services/club.service";

export async function updateMemberRoleAction(
  clubId: string,
  coachId: string,
  membershipId: string,
  role: "coach" | "admin"
) {
  if (!clubId?.trim()) {
    throw new Error("A club is required.");
  }

  if (!coachId?.trim()) {
    throw new Error("A member is required.");
  }

  if (!membershipId?.trim()) {
    throw new Error(
      "A club membership is required."
    );
  }

  if (
    role !== "coach" &&
    role !== "admin"
  ) {
    throw new Error(
      "Please select a valid club role."
    );
  }

  await updateClubMemberRole({
    membershipId,
    role,
  });

  revalidatePath(
    `/clubs/${clubId}/manage/members`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}`
  );
}

export async function removeMemberFromClubAction(
  clubId: string,
  coachId: string,
  membershipId: string
) {
  if (!clubId?.trim()) {
    throw new Error("A club is required.");
  }

  if (!coachId?.trim()) {
    throw new Error("A member is required.");
  }

  if (!membershipId?.trim()) {
    throw new Error(
      "A club membership is required."
    );
  }

  await removeClubMember(
    membershipId
  );

  revalidatePath(
    `/clubs/${clubId}/manage`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members`
  );

  revalidatePath(
    `/clubs/${clubId}/manage/members/${coachId}`
  );

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/clubs");

  redirect(
  `/clubs/${clubId}/manage/members`
);
}