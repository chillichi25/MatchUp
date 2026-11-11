import { useRouter } from "expo-router";
import {
  ChevronRight,
  MapPin,
  Search,
  Shield,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { searchClubs } from "../services/club.service";
import type { ClubSummary } from "../types";

export function ClubSearchForm() {
  const router = useRouter();
  const requestId = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const cleanQuery = query.trim();
    const currentRequest = ++requestId.current;
    let active = true;

    setResults([]);
    setHasSearched(false);
    setErrorMessage("");

    if (!cleanQuery) {
      setLoading(false);

      return () => {
        active = false;
      };
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const found = await searchClubs(cleanQuery);

        if (!active || currentRequest !== requestId.current) {
          return;
        }

        setResults(found);
        setHasSearched(true);
      } catch {
        if (!active || currentRequest !== requestId.current) {
          return;
        }

        setErrorMessage(
          "We couldn't search for clubs. Please try again."
        );
      } finally {
        if (active && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, attempt]);

  function handleQueryChange(value: string) {
    requestId.current += 1;
    setQuery(value);
    setResults([]);
    setHasSearched(false);
    setErrorMessage("");
    setLoading(Boolean(value.trim()));
  }

  function openClub(clubId: string) {
    Keyboard.dismiss();
    router.push(`/clubs/join/${clubId}`);
  }

  const hasQuery = query.trim().length > 0;

  return (
    <View className="mt-6">
      <View
        style={{
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 4,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: focused ? "#009E45" : "#CBD5E1",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Search
          size={20}
          color="#7B8798"
          strokeWidth={1.8}
        />

        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="Search clubs by name"
          placeholder="Enter club name"
          placeholderTextColor="#7B8798"
          selectionColor="#009E45"
          underlineColorAndroid="transparent"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 54,
            marginLeft: 12,
            paddingVertical: 12,
            paddingRight: 8,
            fontSize: 16,
            color: "#07192D",
          }}
        />

        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => handleQueryChange("")}
            className="h-12 w-12 items-center justify-center rounded-lg active:bg-slate-100"
          >
            <X
              size={18}
              color="#7B8798"
              strokeWidth={2}
            />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View className="mt-6 items-center">
          <ActivityIndicator
            size="small"
            color="#009E45"
            accessibilityLabel="Searching clubs"
          />
        </View>
      ) : null}

      {!loading && hasQuery && errorMessage ? (
        <View className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            className="text-[14px] leading-5 text-red-700"
          >
            {errorMessage}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setAttempt((current) => current + 1)}
            className="mt-1 min-h-[48px] self-start justify-center px-1 active:opacity-70"
          >
            <Text className="text-[14px] font-semibold text-[#008638] underline">
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!loading &&
      hasQuery &&
      !errorMessage &&
      results.length > 0 ? (
        <View className="mt-2 gap-1">
          {results.map((club) => {
            const location = [club.city, club.county]
              .filter(Boolean)
              .join(", ");

            return (
              <Pressable
                key={club.id}
                accessibilityRole="button"
                accessibilityLabel={
                  location
                    ? `${club.name}, ${location}`
                    : club.name
                }
                accessibilityHint="View this club"
                onPress={() => openClub(club.id)}
                className="flex-row items-center gap-4 rounded-2xl border border-[#CBD5E1] bg-white p-4 active:bg-[#EFF8F2]"
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                  }}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  {club.badge_url ? (
                    <Avatar
                      uri={club.badge_url}
                      name={club.name}
                      size={44}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#E4F5EB",
                      }}
                    >
                      <Shield
                        size={20}
                        color="#009E45"
                        strokeWidth={1.8}
                      />
                    </View>
                  )}
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-[#07192D]">
                    {club.name}
                  </Text>

                  {location ? (
                    <View className="mt-1 flex-row items-center gap-1">
                      <MapPin
                        size={13}
                        color="#7B8798"
                        strokeWidth={1.8}
                      />

                      <Text className="flex-1 text-[13px] leading-[18px] text-[#596B80]">
                        {location}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <ChevronRight
                  size={18}
                  color="#7B8798"
                  strokeWidth={2}
                />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {!loading &&
      hasQuery &&
      !errorMessage &&
      hasSearched &&
      results.length === 0 ? (
        <View className="mt-6 items-center px-4">
          <Text
            accessibilityLiveRegion="polite"
            className="text-center text-[16px] font-bold text-[#07192D]"
          >
            No clubs found
          </Text>

          <Text className="mt-2 text-center text-[14px] leading-5 text-[#596B80]">
            Check the spelling or try another club name.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              router.push("/clubs/create");
            }}
            className="mt-4 min-h-[48px] items-center justify-center px-4 active:opacity-70"
          >
            <Text className="text-[14px] font-semibold text-[#008638] underline">
              Add your club
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}