"use server";

import { redirect } from "next/navigation";

type ClubEditContext = {
  editMode: string;
  teamName: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
};

export async function continueToTeamAction(
  editContext: ClubEditContext,
  formData: FormData
) {
  const name =
    formData.get("name")?.toString().trim() ?? "";

  const country =
    formData.get("country")?.toString().trim() ?? "";

  const county =
    formData.get("county")?.toString().trim() ?? "";

  const city =
    formData.get("city")?.toString().trim() ?? "";

  const lat =
    formData.get("lat")?.toString().trim() ?? "";

  const lng =
    formData.get("lng")?.toString().trim() ?? "";

  if (
    !name ||
    !country ||
    !county ||
    !city ||
    !lat ||
    !lng
  ) {
    throw new Error(
      "Please complete all required fields and select a valid location."
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Please select a valid location from the suggestions."
    );
  }

  /*
   * EDITING FROM REVIEW
   *
   * The coach has already completed Team Setup.
   * Return directly to Review and preserve the team.
   */
  if (editContext.editMode === "review") {
    const reviewParams = new URLSearchParams({
      clubName: name,
      country,
      county,
      city,
      lat,
      lng,

      teamName: editContext.teamName,
      ageGroup: editContext.ageGroup,
      matchFormat: editContext.matchFormat,
      gender: editContext.gender,
      level: editContext.level,
    });

    redirect(
      `/clubs/create/review?${reviewParams.toString()}`
    );
  }

  /*
   * NORMAL ONBOARDING
   *
   * Continue from Club Setup → Team Setup.
   */
  const teamParams = new URLSearchParams({
    name,
    country,
    county,
    city,
    lat,
    lng,
  });

  redirect(
    `/clubs/create/team?${teamParams.toString()}`
  );
}