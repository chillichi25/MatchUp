import { useRouter } from "expo-router";
import { Building2, ChevronRight, MapPin, Search, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { searchClubs } from "../services/club.service";
import type { ClubSummary } from "../types";

export function ClubSearchForm() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const cleanQuery = query.trim();
    const currentRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      if (cleanQuery.length < 1) {
        setResults([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const found = await searchClubs(cleanQuery);

        if (currentRequest !== requestId.current) return;

        setResults(found);
        setHasSearched(true);
      } catch {
        if (currentRequest !== requestId.current) return;

        setResults([]);
        setHasSearched(true);
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, cleanQuery.length < 1 ? 0 : 300);

    return () => clearTimeout(timer);
  }, [query]);

  function clearSearch() {
    requestId.current += 1;
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }

  return (
    <View className="mt-6">
      <View className="h-14 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
        <Search size={19} color="#94A3B8" strokeWidth={1.8} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search club name"
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
          autoCorrect={false}
          className="ml-3 h-full flex-1 text-[15px] text-slate-900"
        />

        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={clearSearch}
            className="h-8 w-8 items-center justify-center"
          >
            <X size={18} color="#94A3B8" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View className="mt-5 flex-row items-center justify-center gap-2">
          <ActivityIndicator color="#00B83F" size="small" />
          <Text className="text-[13px] text-slate-500">Searching clubs...</Text>
        </View>
      ) : null}

      {!loading && results.length > 0 ? (
        <View className="mt-4 gap-3">
          {results.map((club) => (
            <Pressable
              key={club.id}
              accessibilityRole="button"
              onPress={() => router.push(`/clubs/join/${club.id}`)}
              className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
            >
              {club.badge_url ? (
                <Avatar uri={club.badge_url} name={club.name} size={44} />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E4F9EB]">
                  <Building2 size={20} color="#00B83F" strokeWidth={1.8} />
                </View>
              )}

              <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-semibold text-slate-900">
                  {club.name}
                </Text>

                {[club.city, club.county].filter(Boolean).length > 0 ? (
                  <View className="mt-1 flex-row items-center gap-1">
                    <MapPin size={13} color="#94A3B8" strokeWidth={1.8} />
                    <Text className="text-[13px] text-slate-500">
                      {[club.city, club.county].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                ) : null}
              </View>

              <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {!loading && hasSearched && results.length === 0 ? (
        <View className="mt-6 items-center rounded-3xl border border-gray-200 bg-white px-6 py-10">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Search size={24} color="#00B83F" strokeWidth={1.8} />
          </View>

          <Text className="mt-4 text-[15px] font-bold text-slate-900">
            No clubs found
          </Text>

          <Text className="mt-2 max-w-[280px] text-center text-[13px] leading-5 text-slate-500">
            Try another club name, or create your club if it isn&apos;t on
            MatchUp.
          </Text>

          <Button
            className="mt-5"
            fullWidth={false}
            onPress={() => router.push("/clubs/create")}
          >
            Create a club
          </Button>
        </View>
      ) : null}
    </View>
  );
}
