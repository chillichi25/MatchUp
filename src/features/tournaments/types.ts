export type TournamentStatus = "open" | "closed" | "completed" | "cancelled";

export type TournamentRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "removed"
  | "withdrawn"
  | "cancelled"
  | "expired";

export type TournamentSort = "soonest" | "nearest" | "fee" | "newest";

export type TournamentFilters = {
  q: string;
  age: string;
  level: string;
  gender: string;
  format: string;
  date: string;
  location: string;
  distance: string;
  sort: TournamentSort;
};

export type TournamentListing = {
  id: string;
  name: string;
  ageGroup: string | null;
  gender: string | null;
  level: string | null;
  matchFormat: string | null;

  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;

  entryFee: number | null;
  maxTeams: number | null;
  status: TournamentStatus;
  createdBy: string;

  distanceMiles: number | null;
  score: number;
  isRecommended: boolean;
};

export type TournamentEligibility = {
  eligible: boolean;
  reasons: string[];
};

export type ExistingTournamentRequest = {
  id: string;
  status: TournamentRequestStatus;
};

export type TournamentDetail = TournamentListing & {
  description: string | null;
  isOwner: boolean;
  acceptedCount: number;
  spacesRemaining: number | null;
  isFull: boolean;
  eligibility: TournamentEligibility;
  existingRequest: ExistingTournamentRequest | null;
};

export type TournamentParticipant = {
  teamId: string;
  teamName: string;
  ageGroup: string | null;
  clubId: string;
  clubName: string;
  badgeUrl: string | null;
};

export type TournamentRequestCounterparty = {
  teamId: string;
  teamName: string;
  ageGroup: string | null;
  clubId: string;
  clubName: string;
  badgeUrl: string | null;
};

export type TournamentRequestSummary = {
  id: string;
  status: TournamentRequestStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;

  tournamentId: string;
  tournamentName: string;
  tournamentStartDate: string;
  tournamentEndDate: string | null;
  tournamentLocation: string | null;

  team: TournamentRequestCounterparty;
};

export type TournamentUpdate = {
  id: string;
  message: string;
  createdAt: string;
};

export type MyTournament = {
  id: string;
  name: string;
  ageGroup: string | null;
  gender: string | null;
  level: string | null;
  matchFormat: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
  maxTeams: number | null;
  status: TournamentStatus;
  acceptedCount: number;
  pendingCount: number;
};

export type ParticipatingTournament = {
  requestId: string;
  id: string;
  name: string;
  ageGroup: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
};

export type CreateTournamentInput = {
  name: string;
  ageGroup: string;
  gender: string;
  level: string;
  matchFormat: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  entryFee: string;
  maxTeams: string;
  description: string;
};

export type UpdateTournamentInput = CreateTournamentInput & {
  tournamentId: string;
};
