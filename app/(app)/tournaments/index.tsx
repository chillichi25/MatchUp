import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react-native";
import { useRouter } from "expo-router";

import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-views";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

import { TournamentCard } from "@/features/tournaments/components/tournament-card";
import { TournamentFiltersModal } from "@/features/tournaments/components/tournament-filters-modal";
import { TournamentSortMenu } from "@/features/tournaments/components/tournament-sort-menu";
import {
  EMPTY_TOURNAMENT_FILTERS,
  hasActiveTournamentFilters,
} from "@/features/tournaments/constants";
import { useTournamentDiscovery } from "@/features/tournaments/hooks/use-tournaments";
import type { TournamentFilters } from "@/features/tournaments/types";

export default function TournamentsScreen() {
  const router = useRouter();
  const activeTeam = useActiveTeam();

  const [filters, setFilters] = useState<TournamentFilters>(
    EMPTY_TOURNAMENT_FILTERS
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const appliedFilters = useMemo(
    () => ({ ...filters, q: searchText }),
    [filters, searchText]
  );

  const discovery = useTournamentDiscovery(appliedFilters);

  const activeFilterCount = [
    filters.age,
    filters.level,
    filters.gender,
    filters.format,
    filters.date,
    filters.location,
    filters.distance,
  ].filter(Boolean).length;

  const coachAgeGroup = discovery.data?.coachAgeGroup ?? null;
  const coachLevel = discovery.data?.coachLevel ?? null;
  const defaultCity = discovery.data?.defaultClubCity ?? "";

  function openTournament(id: string) {
    router.push(`/tournaments/${id}` as never);
  }

  return (
    <Screen>
      <PageHeader title="Tournaments" fallbackHref="/dashboard" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-28 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-2 flex-row items-start justify-between">
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold tracking-tight text-slate-950">
              Find a Tournament
            </Text>
            <Text className="text-[13px] text-slate-500">
              Enter your team into a tournament.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a tournament"
            onPress={() => router.push("/create/tournament" as never)}
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
              placeholder="Search tournaments or locations"
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
          <QuickChip
            label="All"
            active={!hasActiveTournamentFilters(filters)}
            onPress={() =>
              setFilters({ ...EMPTY_TOURNAMENT_FILTERS, sort: filters.sort })
            }
          />

          {coachAgeGroup ? (
            <QuickChip
              label="My age group"
              active={filters.age === coachAgeGroup}
              onPress={() =>
                setFilters({
                  ...EMPTY_TOURNAMENT_FILTERS,
                  age: coachAgeGroup,
                  sort: filters.sort,
                })
              }
            />
          ) : null}

          {coachLevel ? (
            <QuickChip
              label="My level"
              active={filters.level === coachLevel}
              onPress={() =>
                setFilters({
                  ...EMPTY_TOURNAMENT_FILTERS,
                  level: coachLevel,
                  sort: filters.sort,
                })
              }
            />
          ) : null}

          <QuickChip
            label="Nearby"
            active={filters.distance === "10"}
            onPress={() =>
              setFilters({
                ...EMPTY_TOURNAMENT_FILTERS,
                distance: "10",
                sort: "nearest",
              })
            }
          />
        </ScrollView>

        {/* SHORTCUTS */}
        <View className="mt-4 flex-row gap-2">
          {[
            { label: "Requests", href: "/tournaments/requests" },
            { label: "My Events", href: "/tournaments/my" },
            { label: "Joined", href: "/tournaments/participating" },
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
          <LoadingState className="mt-10" label="Finding tournaments…" />
        ) : discovery.isError ? (
          <ErrorState
            className="mt-6"
            description="We couldn't load tournaments right now."
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
                {discovery.data.recommended.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    recommended
                    onPress={() => openTournament(tournament.id)}
                  />
                ))}
              </Section>
            ) : null}

            <View className="mt-6">
              <View className="flex-row items-end justify-between gap-3">
                <View>
                  <Text className="text-[18px] font-bold tracking-tight text-slate-950">
                    Available Tournaments
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-slate-500">
                    {discovery.data.available.length}{" "}
                    {discovery.data.available.length === 1
                      ? "tournament"
                      : "tournaments"}{" "}
                    open
                  </Text>
                </View>

                <TournamentSortMenu
                  value={filters.sort}
                  onChange={(sort) => setFilters({ ...filters, sort })}
                />
              </View>

              {discovery.data.available.length === 0 ? (
                <View className="mt-3">
                  <EmptyState
                    title={
                      discovery.data.hasActiveFilters
                        ? "No tournaments found"
                        : "No tournaments available"
                    }
                    description={
                      discovery.data.hasActiveFilters
                        ? "Try changing your filters to see more tournaments."
                        : "New tournaments will appear here when coaches post them."
                    }
                  />

                  {discovery.data.hasActiveFilters ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setFilters(EMPTY_TOURNAMENT_FILTERS);
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
                  {discovery.data.available.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onPress={() => openTournament(tournament.id)}
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
            description="Select a team to find tournaments for it."
          />
        )}

        {!activeTeam.isLoading && !activeTeam.data ? (
          <View className="mt-6">
            <EmptyState
              title="You need an active team"
              description="Choose or create a team before entering tournaments."
            />
          </View>
        ) : null}
      </ScrollView>

      {filtersOpen ? (
        <TournamentFiltersModal
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

function QuickChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={
        active
          ? "rounded-full border border-green-200 bg-green-50 px-2.5 py-2"
          : "rounded-full border border-slate-200 bg-white px-2.5 py-2"
      }
    >
      <Text
        className={
          active
            ? "text-[10px] font-semibold text-[#00A638]"
            : "text-[10px] font-semibold text-slate-600"
        }
      >
        {label}
      </Text>
    </Pressable>
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
