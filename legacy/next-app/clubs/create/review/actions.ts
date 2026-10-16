"use server";

import { redirect } from "next/navigation";

import { completeClubSetup } from "@/features/clubs/services/club.service";

export async function completeSetupAction(
  formData: FormData
) {
  const clubName =
    formData.get("clubName")?.toString().trim() ?? "";

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

  const teamName =
    formData.get("teamName")?.toString().trim() ?? "";

  const ageGroup =
    formData.get("ageGroup")?.toString().trim() ?? "";

  const matchFormat =
    formData.get("matchFormat")?.toString().trim() ?? "";

  const gender =
    formData.get("gender")?.toString().trim() ?? "";

  const level =
    formData.get("level")?.toString().trim() ?? "";

  if (
    !clubName ||
    !country ||
    !county ||
    !city ||
    !lat ||
    !lng ||
    !teamName ||
    !ageGroup ||
    !matchFormat ||
    !gender ||
    !level
  ) {
    throw new Error(
      "Some setup information is missing."
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
      "Please select a valid club location."
    );
  }

  await completeClubSetup({
    clubName,
    country,
    county,
    city,
    lat: latitude,
    lng: longitude,

    teamName,
    ageGroup,
    matchFormat,
    gender,
    level,
  });

  redirect("/clubs/setup-complete");
}