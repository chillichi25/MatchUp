import { describe, expect, it } from "@jest/globals";

import { createClubSchema } from "./create-club.schema";
import { createTeamSchema } from "./create-team.schema";

const validLocation = {
  city: "Leeds",
  county: "West Yorkshire",
  country: "United Kingdom",
  lat: 53.8008,
  lng: -1.5491,
  formatted: "Leeds, West Yorkshire, United Kingdom",
};

describe("createClubSchema", () => {
  it("accepts a name and a complete location", () => {
    const result = createClubSchema.safeParse({
      name: "Leeds Juniors FC",
      location: validLocation,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a blank name", () => {
    const result = createClubSchema.safeParse({
      name: "   ",
      location: validLocation,
    });

    expect(result.success).toBe(false);
  });

  it("rejects out-of-range coordinates", () => {
    const result = createClubSchema.safeParse({
      name: "Leeds Juniors FC",
      location: { ...validLocation, lat: 200 },
    });

    expect(result.success).toBe(false);
  });
});

describe("createTeamSchema", () => {
  const validTeam = {
    name: "U12 Reds",
    ageGroup: "U12",
    matchFormat: "7v7",
    gender: "Boys",
    level: "Development",
  };

  it("accepts a complete team", () => {
    expect(createTeamSchema.safeParse(validTeam).success).toBe(true);
  });

  it("rejects a missing age group", () => {
    const result = createTeamSchema.safeParse({ ...validTeam, ageGroup: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a missing level", () => {
    const result = createTeamSchema.safeParse({ ...validTeam, level: "" });

    expect(result.success).toBe(false);
  });
});
