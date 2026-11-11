import { useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageHeader } from "@/components/ui/page-header";

import { Screen } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";
import { FriendlyCard } from "@/features/friendlies/components/friendly-card";
import { FriendlyFiltersModal } from "@/features/friendlies/components/friendly-filters-modal";
import { FriendlySortMenu } from "@/features/friendlies/components/friendly-sort-menu";
import {
  EMPTY_FILTERS,
  hasActiveFilters,
} from "@/features/friendlies/services/friendly.service";
import { useFriendlyDiscovery } from "@/features/friendlies/hooks/use-friendlies";
import type { FriendlyFilters } from "@/features/friendlies/types";
import { useIncomingRequests } from "@/features/friendlies/hooks/use-friendly-requests";

const GREEN = "#009E45";
const NAVY = "#07192D";
const MUTED = "#596B80";

const SHORTCUTS = [
  { label: "Requests", href: "/friendlies/requests" },
  { label: "Sent", href: "/friendlies/sent" },
  { label: "Upcoming", href: "/matches/upcoming" },
  { label: "History", href: "/matches/history" },
];

type QuickChip = {
  key: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function MatchesScreen() {
  const router = useRouter();
  const { view, featuredFriendlyId } = useLocalSearchParams<{
  view?: string;
  featuredFriendlyId?: string;
}>();
const showAllRecommended = view === "recommended";
  const activeTeam = useActiveTeam();

  const incomingRequests = useIncomingRequests();

const pendingRequestCount =
  incomingRequests.data?.filter(
    (request) => request.status === "pending"
  ).length ?? 0;

  const [filters, setFilters] = useState<FriendlyFilters>({
    ...EMPTY_FILTERS,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const appliedFilters = useMemo(
    () => ({ ...filters, q: searchText }),
    [filters, searchText]
  );

  const discovery = useFriendlyDiscovery(
  showAllRecommended ? EMPTY_FILTERS : appliedFilters
);
  const data = discovery.data;

  const activeFilterCount = [
    filters.age,
    filters.level,
    filters.gender,
    filters.format,
    filters.date,
    filters.location,
    filters.distance,
    filters.venue,
    filters.quick,
  ].filter(Boolean).length;

  const coachAgeGroup = data?.coachAgeGroup ?? null;
  const coachLevel = data?.coachLevel ?? null;
  const defaultCity = data?.defaultClubCity ?? "";

  const hasSearchOrFilters =
    Boolean(searchText.trim()) ||
    hasActiveFilters(filters) ||
    Boolean(filters.quick);

  const recommended = data?.recommended.slice(0, 2) ?? [];

  function openFriendly(id: string) {
    router.push(`/friendlies/${id}?from=discovery` as never);
  }

  function clearFilters() {
    setFilters({ ...EMPTY_FILTERS, sort: filters.sort });
    setSearchText("");
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await discovery.refetch();
    } finally {
      setRefreshing(false);
    }
  }

  const quickChips: QuickChip[] = [
    {
      key: "all",
      label: "All",
      active: !hasActiveFilters(filters) && !filters.quick,
      onPress: () =>
        setFilters({ ...EMPTY_FILTERS, sort: filters.sort }),
    },
    ...(coachAgeGroup
      ? [
          {
            key: "age",
            label: "My age",
            active:
              filters.age === coachAgeGroup && !filters.quick,
            onPress: () =>
              setFilters({
                ...EMPTY_FILTERS,
                age: coachAgeGroup,
                sort: filters.sort,
              }),
          },
        ]
      : []),
    ...(coachLevel
      ? [
          {
            key: "level",
            label: "My level",
            active: filters.level === coachLevel && !filters.quick,
            onPress: () =>
              setFilters({
                ...EMPTY_FILTERS,
                level: coachLevel,
                sort: filters.sort,
              }),
          },
        ]
      : []),
    {
      key: "week",
      label: "This week",
      active: filters.quick === "this-week",
      onPress: () =>
        setFilters({
          ...EMPTY_FILTERS,
          quick: "this-week",
          sort: filters.sort,
        }),
    },
    {
      key: "nearby",
      label: "Nearby",
      active: filters.distance === "10",
      onPress: () =>
        setFilters({
          ...EMPTY_FILTERS,
          distance: "10",
          sort: "nearest",
        }),
    },
  ];

if (showAllRecommended) {
  const recommendedListings = discovery.data?.recommended ?? [];

const featuredFriendly =
  recommendedListings.find((listing) => listing.id === featuredFriendlyId) ??
  discovery.data?.available.find((listing) => listing.id === featuredFriendlyId);

const allRecommended = featuredFriendly
  ? [
      featuredFriendly,
      ...recommendedListings.filter(
        (listing) => listing.id !== featuredFriendly.id
      ),
    ]
  : recommendedListings;

  return (
    <Screen>
      <PageHeader title="Recommended matches" fallbackHref="/dashboard" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 112,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTeam.isLoading ? (
          <LoadingState label="Loading your team…" />
        ) : activeTeam.isError ? (
          <ErrorState
            description="We couldn't load your active team."
            onRetry={() => activeTeam.refetch()}
          />
        ) : !activeTeam.data ? (
          <EmptyState
            title="Choose your team"
            description="Select or create a team to see recommended matches."
          />
        ) : discovery.isLoading || discovery.isPlaceholderData ? (
          <LoadingState label="Finding recommended matches…" />
        ) : discovery.isError ? (
          <ErrorState
            description="We couldn't load your recommendations."
            onRetry={() => discovery.refetch()}
          />
        ) : allRecommended.length === 0 ? (
          <EmptyState
            title="No recommendations right now"
            description="Check back for new friendlies for your team."
          />
        ) : (
          <View className="gap-3">
            {allRecommended.map((listing) => (
              <FriendlyCard
                key={listing.id}
                listing={listing}
                recommended
                onPress={() => openFriendly(listing.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

  return (
    <Screen edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 112,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >
        <View className="flex-row items-center gap-4">
          <View className="min-w-0 flex-1">
            <Text
              accessibilityRole="header"
              className="text-[28px] font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              Find a match
            </Text>

            <Text
              className="mt-1 text-[13px] leading-5"
              style={{ color: MUTED }}
            >
              Find the right opponent for your team.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a friendly"
            onPress={() => router.push("/create/friendly" as never)}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: GREEN,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center gap-2.5">
          <View className="h-[52px] min-w-0 flex-1 flex-row items-center gap-2.5 rounded-2xl border border-[#CBD5E1] bg-white px-3.5">
            <Search size={18} color={MUTED} strokeWidth={1.8} />

            <TextInput
              accessibilityLabel="Search teams or locations"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search teams or locations"
              placeholderTextColor="#8190A3"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              className="min-w-0 flex-1 text-[13px]"
              style={{ color: NAVY, paddingVertical: 0 }}
            />

            {searchText.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearchText("")}
                hitSlop={8}
                className="h-8 w-8 items-center justify-center"
              >
                <X size={17} color={MUTED} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              activeFilterCount
                ? `Filters, ${activeFilterCount} active`
                : "Open filters"
            }
            onPress={() => setFiltersOpen(true)}
            className={`h-[52px] w-[52px] items-center justify-center rounded-2xl border ${
              activeFilterCount
                ? "border-green-200 bg-green-50"
                : "border-[#CBD5E1] bg-white"
            }`}
          >
            <SlidersHorizontal
              size={20}
              color={activeFilterCount ? GREEN : NAVY}
              strokeWidth={1.8}
            />

            {activeFilterCount > 0 ? (
              <View
                className="absolute -right-1 -top-1 min-w-[19px] items-center justify-center rounded-full px-1"
                style={{ backgroundColor: GREEN, minHeight: 19 }}
              >
                <Text className="text-[10px] font-bold text-white">
                  {activeFilterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
        >
          {quickChips.map((chip) => (
            <Pressable
              key={chip.key}
              accessibilityRole="button"
              accessibilityState={{ selected: chip.active }}
              onPress={chip.onPress}
              style={chip.key === "all" ? { minWidth: 50 } : undefined}
              className={`min-h-[38px] items-center justify-center rounded-full border px-3 ${
  chip.active
    ? "border-[#009E45] bg-[#009E45]"
    : "border-[#CBD5E1] bg-white"
}`}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{ color: chip.active ? "#FFFFFF" : MUTED }}
              >
                {chip.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-5 flex-row gap-2">
  {SHORTCUTS.map((shortcut) => {
    const showCount =
      shortcut.label === "Requests" &&
      pendingRequestCount > 0;

    return (
      <Pressable
        key={shortcut.href}
        accessibilityRole="button"
        accessibilityLabel={
          showCount
            ? `Requests, ${pendingRequestCount} awaiting your response`
            : shortcut.label
        }
        onPress={() => router.push(shortcut.href as never)}
        className="min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-1 py-2"
        style={({ pressed }) => ({
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <Text
          className="text-[11px] font-semibold"
          style={{ color: NAVY }}
        >
          {shortcut.label}
        </Text>

        {showCount ? (
          <View
            className="absolute -right-1 -top-2 min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1"
            style={{ backgroundColor: GREEN }}
          >
            <Text className="text-[10px] font-bold text-white">
              {pendingRequestCount > 9
                ? "9+"
                : pendingRequestCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  })}
</View>

        {activeTeam.isLoading ? (
          <LoadingState className="mt-8" label="Loading your team…" />
        ) : activeTeam.isError ? (
          <ErrorState
            className="mt-8"
            description="We couldn't load your active team."
            onRetry={() => activeTeam.refetch()}
          />
        ) : !activeTeam.data ? (
          <EmptyState
            className="mt-8"
            title="Choose your team"
            description="Select or create a team to find matches."
          />
        ) : discovery.isLoading ? (
          <LoadingState className="mt-8" label="Finding matches…" />
        ) : discovery.isError ? (
          <ErrorState
            className="mt-8"
            description="We couldn't load matches right now."
            onRetry={() => discovery.refetch()}
          />
        ) : data ? (
          <>
            {recommended.length > 0 ? (
              <Section
                title="Recommended for you"
                subtitle="Matches picked for your team."
              >
                {recommended.map((listing) => (
                  <FriendlyCard
                    key={listing.id}
                    listing={listing}
                    recommended
                    onPress={() => openFriendly(listing.id)}
                  />
                ))}
              </Section>
            ) : null}

            {data.yourPosts.length > 0 ? (
              <Section
                title="Your posts"
                subtitle={`${data.yourPosts.length} ${
                  data.yourPosts.length === 1
                    ? "friendly looking"
                    : "friendlies looking"
                } for an opponent`}
              >
                {data.yourPosts.map((listing) => (
                  <FriendlyCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => openFriendly(listing.id)}
                  />
                ))}
              </Section>
            ) : null}

            <View className="mt-7">
              <View className="flex-row items-center justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text
                    accessibilityRole="header"
                    className="text-[19px] font-bold tracking-tight"
                    style={{ color: NAVY }}
                  >
                    Available matches
                  </Text>

                  <Text
                    className="mt-1 text-[12px] leading-[18px]"
                    style={{ color: MUTED }}
                  >
                    {data.available.length}{" "}
                    {data.available.length === 1 ? "match" : "matches"}{" "}
                    {hasSearchOrFilters ? "found" : "available"}
                  </Text>
                </View>

                <FriendlySortMenu
                  value={filters.sort}
                  onChange={(sort) =>
                    setFilters((current) => ({ ...current, sort }))
                  }
                />
              </View>

              {data.available.length === 0 ? (
                <View className="mt-4">
                  <EmptyState
                    title={
                      hasSearchOrFilters
                        ? "No matching friendlies"
                        : "No friendlies available yet"
                    }
                    description={
                      hasSearchOrFilters
                        ? "Try another search or clear your filters."
                        : "Post a friendly and let other coaches request to play."
                    }
                  />

                  <Pressable
                    accessibilityRole="button"
                    onPress={
                      hasSearchOrFilters
                        ? clearFilters
                        : () =>
                            router.push("/create/friendly" as never)
                    }
                    className="mt-4 min-h-[48px] items-center justify-center rounded-full px-5"
                    style={{ backgroundColor: GREEN }}
                  >
                    <Text className="text-[14px] font-semibold text-white">
                      {hasSearchOrFilters
  ? searchText.trim() &&
    !hasActiveFilters(filters) &&
    !filters.quick
    ? "Clear search"
    : "Clear filters"
  : "Post a friendly"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="mt-4 gap-3">
                  {data.available.map((listing) => (
                    <FriendlyCard
                      key={listing.id}
                      listing={listing}
                      onPress={() => openFriendly(listing.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <EmptyState
            className="mt-8"
            title="No matches to show"
            description="Pull down to refresh and try again."
          />
        )}
      </ScrollView>

      {filtersOpen ? (
        <FriendlyFiltersModal
          filters={filters}
          defaultLocation={defaultCity}
          onClose={() => setFiltersOpen(false)}
          onApply={(next) => {
            setFilters(next);
            setFiltersOpen(false);
          }}
        />
      ) : null}
    </Screen>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-7">
      <Text
        accessibilityRole="header"
        className="text-[19px] font-bold tracking-tight"
        style={{ color: NAVY }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          className="mt-1 text-[12px] leading-[18px]"
          style={{ color: MUTED }}
        >
          {subtitle}
        </Text>
      ) : null}

      <View className="mt-4 gap-3">{children}</View>
    </View>
  );
}