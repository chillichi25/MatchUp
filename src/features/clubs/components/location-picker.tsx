import { MapPin, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { cn } from "@/lib/utils";

import { searchLocations, toLocationValue } from "../services/location.service";
import type { LocationResult } from "../services/location.service";
import type { LocationValue } from "../types";

type LocationPickerProps = {
  value: LocationValue | null;
  onChange: (location: LocationValue | null) => void;
  placeholder?: string;
  error?: boolean;
  onInputChange?: () => void;
  disabled?: boolean;
};

export function LocationPicker({
  value,
  onChange,
  placeholder = "Start typing a town or city",
  error = false,
  onInputChange,
  disabled = false,
}: LocationPickerProps) {
  const [query, setQuery] = useState(value?.formatted ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    const currentRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      if (
        disabled ||
        trimmed.length < 2 ||
        trimmed === value?.formatted
      ) {
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSearchError("");

      try {
        const found = await searchLocations(trimmed);

        if (currentRequest !== requestId.current) return;

        setResults(found);
        setIsOpen(true);
      } catch {
        if (currentRequest !== requestId.current) return;

        setResults([]);
        setSearchError("We couldn't search for that location.");
        setIsOpen(true);
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, value?.formatted, disabled]);

  function handleSelect(result: LocationResult) {
    const location = toLocationValue(result);
    setQuery(location.formatted);
    setResults([]);
    setIsOpen(false);
    onChange(location);
  }

  function handleChangeText(text: string) {
    setQuery(text);
    onInputChange?.();

    if (value) {
      onChange(null);
    }
  }

  function handleClear() {
    requestId.current += 1;
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onInputChange?.();
    onChange(null);
  }

  return (
    <View className="w-full">
      <View
        className={cn(
          "h-12 w-full flex-row items-center rounded-2xl border bg-white px-4",
          error ? "border-red-400" : "border-slate-200",
          disabled && "opacity-50"
        )}
      >
        <MapPin size={18} color="#94A3B8" strokeWidth={1.8} />

        <TextInput
          value={query}
          onChangeText={handleChangeText}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
          className="ml-3 h-full flex-1 text-[15px] text-slate-900"
        />

        {isLoading ? (
          <ActivityIndicator color="#00B83F" size="small" />
        ) : query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear location"
            hitSlop={8}
            onPress={handleClear}
            className="h-8 w-8 items-center justify-center"
          >
            <X size={18} color="#94A3B8" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      {isOpen ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {searchError ? (
            <Text className="px-4 py-3 text-[13px] text-red-600">
              {searchError}
            </Text>
          ) : results.length === 0 ? (
            <Text className="px-4 py-3 text-[13px] text-slate-500">
              No locations found.
            </Text>
          ) : (
            results.map((result) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                onPress={() => handleSelect(result)}
                className="flex-row items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
              >
                <MapPin size={17} color="#00B83F" strokeWidth={2} />

                <View className="min-w-0 flex-1">
                  <Text className="text-[14px] font-semibold text-slate-900">
                    {result.city}
                  </Text>
                  <Text className="text-[12px] text-slate-500">
                    {[result.county, result.country]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
