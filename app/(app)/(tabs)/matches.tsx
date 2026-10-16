import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-views";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

import { FriendlyCard } from "@/features/friendlies/components/friendly-card";
import { FriendlyFiltersModal } from "@/features/friendlies/components/friendly-filters-modal";
import { FriendlySortMenu } from "@/features/friendlies/components/friendly-sort-menu";
import { EMPTY_FILTERS, hasActiveFilters } from "@/features/friendlies/services/friendly.service";
import { useFriendlyDiscovery } from "@/features/friendlies/hooks/use-friendlies";
import type { FriendlyFilters } from "@/features/friendlies/types";

export default function MatchesScreen() {
  const router = useRouter();
  const activeTeam = useActiveTeam();

  const [filters, setFilters] = useState<FriendlyFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const appliedFilters = useMemo(
    () => ({ ...filters, q: searchText }),
    [filters, searchText]
  );

  const discovery = useFriendlyDiscovery(appliedFilters);

  const activeFilterCount = [
    filters.age,
    filters.level,
    filters.gender,
    filters.format,
    filters.date,
    filters.location,
    filters.distance,
    filters.venue,
  ].filter(Boolean).length;

  const coachAgeGroup = discovery.data?.coachAgeGroup ?? null;
  const coachLevel = discovery.data?.coachLevel ?? null;
  const defaultCity = discovery.data?.defaultClubCity ?? "";

  function openFriendly(id: string) {
    router.push(`/friendlies/${id}?from=discovery` as never);
  }

  const quickChips = [
    { key: "all", label: "All", active: !hasActiveFilters(filters) },
    coachAgeGroup
      ? {
          key: "age",
          label: "My age group",
          active: filters.age === coachAgeGroup && !filters.quick,
          onPress: () =>
            setFilters({ ...EMPTY_FILTERS, age: coachAgeGroup, sort: filters.sort }),
        }
      : null,
    coachLevel
      ? {
          key: "level",
          label: "My level",
          active: filters.level === coachLevel && !filters.quick,
          onPress: () =>
            setFilters({ ...EMPTY_FILTERS, level: coachLevel, sort: filters.sort }),
        }
      : null,
    {
      key: "week",
      label: "This week",
      active: filters.quick === "this-week",
      onPress: () => setFilters({ ...EMPTY_FILTERS, quick: "this-week" }),
    },
    {
      key: "nearby",
      label: "Nearby",
      active: filters.distance === "10",
      onPress: () =>
        setFilters({ ...EMPTY_FILTERS, distance: "10", sort: "nearest" }),
    },
  ].filter((chip): chip is NonNullable<typeof chip> => chip !== null);

  return (
    <Screen edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-28 pt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-[28px] font-bold tracking-tight text-slate-950">
              Find a Match
            </Text>
            <Text className="text-[13px] text-slate-500">
              Find the right match for your team.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a friendly"
            onPress={() => router.push("/create/friendly" as never)}
            className="h-10 w-10 items-center justify-center rounded-full bg-brand"
          >
            <PlusCircle size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* SEARCH */}
        <View className="mt-3 flex-row items-center gap-2.5">
          <View className="h-12 min-w-0 flex-1 flex-row items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search teams or locations"
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              className="min-w-0 flex-1 text-[13px] text-slate-950"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filters"
            onPress={() => setFiltersOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <SlidersHorizontal size={19} color="#334155" />
            {activeFilterCount > 0 ? (
              <View className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1">
                <Text className="text-[9px] font-bold text-white">
                  {activeFilterCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* QUICK FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 mt-3"
          contentContainerClassName="gap-1 px-4"
        >
          {quickChips.map((chip) => (
            <Pressable
              key={chip.key}
              accessibilityRole="button"
              onPress={
                chip.key === "all"
                  ? () => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                  : chip.onPress
              }
              className={
                chip.active
                  ? "rounded-full border border-green-200 bg-green-50 px-2.5 py-2"
                  : "rounded-full border border-slate-200 bg-white px-2.5 py-2"
              }
            >
              <Text
                className={
                  chip.active
                    ? "text-[10px] font-semibold text-[#00A638]"
                    : "text-[10px] font-semibold text-slate-600"
                }
              >
                {chip.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* SHORTCUTS */}
        <View className="mt-4 flex-row gap-2">
          {[
            { label: "Requests", href: "/friendlies/requests" },
            { label: "Sent", href: "/friendlies/sent" },
            { label: "Upcoming", href: "/matches/upcoming" },
            { label: "History", href: "/matches/history" },
          ].map((shortcut) => (
            <Pressable
              key={shortcut.href}
              accessibilityRole="button"
              onPress={() => router.push(shortcut.href as never)}
              className="h-9 flex-1 flex-row items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <Text className="text-[11px] font-semibold text-slate-700">
                {shortcut.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {discovery.isLoading ? (
          <LoadingState className="mt-10" label="Finding matches…" />
        ) : discovery.isError ? (
          <ErrorState
            className="mt-6"
            description="We couldn't load matches right now."
            onRetry={() => discovery.refetch()}
          />
        ) : discovery.data ? (
          <>
            {discovery.data.recommended.length > 0 ? (
              <Section
                title="Recommended for You"
                count={discovery.data.recommended.length}
                className="mt-6"
              >
                {discovery.data.recommended.slice(0, 2).map((listing) => (
                  <FriendlyCard
                    key={listing.id}
                    listing={listing}
                    recommended
                    onPress={() => openFriendly(listing.id)}
                  />
                ))}
              </Section>
            ) : null}

            {discovery.data.yourPosts.length > 0 ? (
              <Section
                title={`Your Posts (${discovery.data.yourPosts.length})`}
                className="mt-6"
              >
                {discovery.data.yourPosts.slice(0, 2).map((listing) => (
                  <FriendlyCard
                    key={listing.id}
                    listing={listing}
                    onPress={() => openFriendly(listing.id)}
                  />
                ))}
              </Section>
            ) : null}

            <View className="mt-6">
              <View className="flex-row items-end justify-between gap-3">
                <View>
                  <Text className="text-[18px] font-bold tracking-tight text-slate-950">
                    Available Matches
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-slate-500">
                    {discovery.data.available.length}{" "}
                    {discovery.data.available.length === 1 ? "match" : "matches"}{" "}
                    available
                  </Text>
                </View>

                <FriendlySortMenu
                  value={filters.sort}
                  onChange={(sort) => setFilters({ ...filters, sort })}
                />
              </View>

              {discovery.data.available.length === 0 ? (
                <View className="mt-3">
                  <EmptyState
                    title={
                      discovery.data.hasActiveFilters
                        ? "No matches found"
                        : "No matches available"
                    }
                    description={
                      discovery.data.hasActiveFilters
                        ? "Try changing your filters to see more matches."
                        : "New match opportunities will appear here when coaches post them."
                    }
                  />

                  {discovery.data.hasActiveFilters ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setFilters(EMPTY_FILTERS);
                        setSearchText("");
                      }}
                      className="mt-4 h-10 items-center justify-center rounded-full bg-brand px-5"
                    >
                      <Text className="text-[11px] font-bold text-white">
                        Reset filters
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                <View className="mt-3 gap-2.5">
                  {discovery.data.available.map((listing) => (
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
            className="mt-6"
            title="No active team"
            description="Select a team to find matches for it."
          />
        )}

        {!activeTeam.isLoading && !activeTeam.data ? (
          <View className="mt-6">
            <EmptyState
              title="You need an active team"
              description="Choose or create a team before finding matches."
            />
          </View>
        ) : null}
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
  count,
  className,
  children,
}: {
  title: string;
  count?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View className={className}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[18px] font-bold tracking-tight text-slate-950">
          {title}
        </Text>

        {count !== undefined ? (
          <Text className="text-[11px] font-bold text-brand">{count} shown</Text>
        ) : null}
      </View>

      <View className="mt-2.5 gap-2.5">{children}</View>
    </View>
  );
}
