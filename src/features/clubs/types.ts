export type LocationValue = {
  city: string;
  county: string;
  country: string;
  lat: number;
  lng: number;
  formatted: string;
};

export type ClubSummary = {
  id: string;
  name: string;
  city: string | null;
  county: string | null;
  country: string | null;
  badge_url: string | null;
};

export type ClubTeam = {
  id: string;
  club_id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;
};

export type MyClub = {
  club_id: string;
  coach_id: string;
  status: string;
  club: ClubSummary;
};

export type PendingClubRequest = {
  membershipId: string;
  clubId: string;
  status: string;
  createdAt: string;
  club: ClubSummary;
};

export type ApprovedClubMembership = {
  membershipId: string;
  clubId: string;
  role: string;
  status: string;
  createdAt: string;
  club: ClubSummary;
};

export type ClubMember = {
  membership_id: string;
  coach_id: string;
  first_name: string | null;
  last_name: string | null;
  club_role: string;
};

export type ClubMemberTeam = {
  coach_id: string;
  team_id: string;
  team_name: string;
};

export type PendingClubJoinRequest = {
  membership_id: string;
  first_name: string | null;
  last_name: string | null;
};

export type PendingTeamJoinRequest = {
  membership_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  team_name: string;
  age_group: string | null;
  gender: string | null;
  match_format: string | null;
};
