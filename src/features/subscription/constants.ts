import type { PlanId, SubscriptionPlan } from "./types";

export const PLAN_FREE: SubscriptionPlan = {
  id: "free",
  name: "Free",
  tagline: "Perfect to get started",
  priceLabel: "£0",
  pricePeriod: "/ month",
  allowanceLabel: "1 team",
  features: [
    "1 team",
    "Browse friendlies",
    "Browse tournaments",
    "Limited match requests",
    "Basic team profile",
  ],
  ctaLabel: "Get Started Free",
  accent: "#00B83F",
  soft: "#E4F9EB",
  icon: "leaf",
  entitlementId: null,
  productIds: [],
  rank: 0,
};

export const PLAN_TEAM_PRO: SubscriptionPlan = {
  id: "team_pro",
  name: "Team Pro",
  tagline: "For individual teams",
  priceLabel: "£5.99",
  pricePeriod: "/ month",
  allowanceLabel: "1 team",
  features: [
    "1 team",
    "Unlimited match requests",
    "Post friendlies",
    "Join tournaments",
    "Chat with opponents",
    "Match history",
    "Results & statistics",
    "Recommendations",
  ],
  ctaLabel: "Choose Team Pro",
  accent: "#00B83F",
  soft: "#E4F9EB",
  icon: "star",
  entitlementId: "team_pro",
  productIds: ["matchup_team_pro_monthly"],
  rank: 1,
};

export const PLAN_CLUB: SubscriptionPlan = {
  id: "club",
  name: "Club",
  tagline: "For small clubs",
  priceLabel: "£19.99",
  pricePeriod: "/ month",
  allowanceLabel: "Up to 5 teams",
  features: [
    "Up to 5 teams",
    "Multiple coaches",
    "Everything in Team Pro",
    "Manage teams under one club",
    "Club-wide tournament access",
    "Club management tools",
  ],
  ctaLabel: "Choose Club",
  accent: "#1D6FE0",
  soft: "#E8F1FD",
  icon: "shield",
  entitlementId: "club",
  productIds: ["matchup_club_monthly"],
  rank: 2,
};

export const PLAN_CLUB_PRO: SubscriptionPlan = {
  id: "club_pro",
  name: "Club Pro",
  tagline: "For growing clubs",
  priceLabel: "£34.99",
  pricePeriod: "/ month",
  allowanceLabel: "Up to 15 teams",
  features: [
    "Up to 15 teams",
    "Multiple coaches",
    "Everything in Club",
    "Larger team allowance",
    "Advanced club tools",
    "Priority features & support",
  ],
  ctaLabel: "Choose Club Pro",
  accent: "#6D28D9",
  soft: "#F1EAFE",
  icon: "crown",
  entitlementId: "club_pro",
  productIds: ["matchup_club_pro_monthly"],
  rank: 3,
};

export const PLANS: readonly SubscriptionPlan[] = [
  PLAN_FREE,
  PLAN_TEAM_PRO,
  PLAN_CLUB,
  PLAN_CLUB_PRO,
];

export const PLAN_BY_ID: Record<PlanId, SubscriptionPlan> = {
  free: PLAN_FREE,
  team_pro: PLAN_TEAM_PRO,
  club: PLAN_CLUB,
  club_pro: PLAN_CLUB_PRO,
};

export const PAID_PLANS: readonly SubscriptionPlan[] = PLANS.filter(
  (plan) => plan.id !== "free"
);
