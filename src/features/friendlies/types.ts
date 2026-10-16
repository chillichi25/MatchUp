export type VenueType = "home" | "away" | "either";

export type MatchFormat = "3v3" | "5v5" | "7v7" | "9v9" | "11v11";

export type FriendlyStatus = "open" | "matched" | "cancelled";

export type FriendlyRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired";

/** A friendly listing as shown in discovery and on the detail screen. */
export type FriendlyListing = {
  id: string;
  teamId: string;
  createdBy: string;

  matchDate: string;
  kickOff: string | null;
  venueType: VenueType;
  matchFormat: string | null;
  location: string | null;
  notes: string | null;
  status: FriendlyStatus;
  createdAt: string;

  clubId: string;
  clubName: string;
  badgeUrl: string | null;
  teamName: string;
  ageGroup: string | null;
  level: string | null;
  gender: string | null;

  distanceMiles: number | null;

  isOwnPost: boolean;
  isRecommended: boolean;
};

export type FriendlyDetail = FriendlyListing & {
  isOwner: boolean;
};

export type FriendlyFilters = {
  q: string;
  age: string;
  level: string;
  gender: string;
  format: string;
  date: string;
  location: string;
  distance: string;
  venue: string;
  quick: string;
  sort: "soonest" | "nearest" | "newest";
};

export type FriendlyDiscovery = {
  yourPosts: FriendlyListing[];
  recommended: FriendlyListing[];
  available: FriendlyListing[];

  coachAgeGroup: string | null;
  coachLevel: string | null;
  coachMatchFormat: string | null;
  defaultClubCity: string;

  hasActiveFilters: boolean;
};

export type CreateFriendlyInput = {
  teamId: string;
  matchDate: string;
  kickOffTime: string;
  venueType: VenueType;
  matchFormat: MatchFormat;
  location: string;
  notes?: string;
};

export type UpdateFriendlyInput = CreateFriendlyInput & {
  friendlyId: string;
};

/** Incoming/outgoing request row with the counterparties needed for the UI. */
export type FriendlyRequestCounterparty = {
  teamId: string;
  teamName: string;
  clubName: string;
  badgeUrl: string | null;
};

export type FriendlyRequestSummary = {
  id: string;
  status: FriendlyRequestStatus;
  message: string | null;
  createdAt: string;

  /** The friendly this request targets. */
  friendlyId: string;
  matchDate: string;
  kickOff: string | null;
  location: string | null;
  friendlyStatus: FriendlyStatus;

  /** The team that owns the friendly. */
  host: FriendlyRequestCounterparty;
  /** The team that asked to play. */
  requester: FriendlyRequestCounterparty;
};

export type FriendlyRequestDetail = FriendlyRequestSummary & {
  /** Who is looking at this request. */
  viewer: "host" | "requester";
  /** Fixture created when accepted (null while pending/declined). */
  matchId: string | null;
  conversationId: string | null;
  acceptedMatchAvailable: boolean;
};
