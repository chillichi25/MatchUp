"use server";

import {
  redirect,
} from "next/navigation";

import {
  updateTeamForClub,
} from "@/features/clubs/services/club.service";

export async function updateTeamForClubAction(
  clubId: string,
  teamId: string,
  formData: FormData
) {
  const teamName =
    formData
      .get("teamName")
      ?.toString()
      .trim() ?? "";

  const ageGroup =
    formData
      .get("ageGroup")
      ?.toString()
      .trim() ?? "";

  const matchFormat =
    formData
      .get("matchFormat")
      ?.toString()
      .trim() ?? "";

  const gender =
    formData
      .get("gender")
      ?.toString()
      .trim() ?? "";

  const level =
    formData
      .get("level")
      ?.toString()
      .trim() ?? "";

  if (
    !teamName ||
    !ageGroup ||
    !matchFormat ||
    !gender ||
    !level
  ) {
    throw new Error(
      "Please complete all required fields."
    );
  }

  await updateTeamForClub({
    teamId,
    name: teamName,
    ageGroup,
    matchFormat,
    gender,
    level,
  });

  redirect(
  `/clubs/${clubId}/manage/teams/${teamId}?updated=1`
);
}