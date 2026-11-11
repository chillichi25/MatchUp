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

import {
  searchLocations,
  toLocationValue,
  type LocationResult,
} from "../services/location.service";
import type { LocationValue } from "../types";

type LocationPickerProps = {
  value: LocationValue | string | null;
  onChange: (location: LocationValue | null) => void;
  placeholder?: string;
  error?: boolean;
  onInputChange?: () => void;
  disabled?: boolean;
};

export function LocationPicker({
  value,
  onChange,
  placeholder = "Search town or city",
  error = false,
  onInputChange,
  disabled = false,
}: LocationPickerProps) {
  const selectedLabel = typeof value === "string" ? value : value?.formatted;
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    const currentRequest = ++requestId.current;

    const timer = setTimeout(async () => {
      if (disabled || trimmed.length < 2 || trimmed === selectedLabel) {
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

    return () => {
      clearTimeout(timer);

      if (requestId.current === currentRequest) {
        requestId.current += 1;
      }
    };
  }, [query, selectedLabel, disabled]);

  function handleSelect(result: LocationResult) {
    requestId.current += 1;

    const location = toLocationValue(result);

    setQuery(location.formatted);
    setResults([]);
    setSearchError("");
    setIsLoading(false);
    setIsOpen(false);
    onChange(location);
  }

  function handleChangeText(text: string) {
    requestId.current += 1;

    setQuery(text);
    setResults([]);
    setSearchError("");
    setIsLoading(false);
    setIsOpen(false);
    onInputChange?.();

    if (value) {
      onChange(null);
    }
  }

  function handleClear() {
    requestId.current += 1;

    setQuery("");
    setResults([]);
    setSearchError("");
    setIsLoading(false);
    setIsOpen(false);
    onInputChange?.();
    onChange(null);
  }

  return (
    <View className="w-full">
      <View
        className={cn(
          "w-full flex-row items-center bg-white",
          disabled && "opacity-50"
        )}
        style={{
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? "#F87171" : "#CBD5E1",
          paddingLeft: 16,
          paddingRight: 8,
        }}
      >
        <MapPin size={18} color="#7B8798" strokeWidth={1.8} />

        <TextInput
          accessibilityLabel="Town or city"
          value={query}
          onChangeText={handleChangeText}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#7B8798"
          autoCapitalize="words"
          autoCorrect={false}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            marginLeft: 12,
            paddingVertical: 0,
            color: "#07192D",
            fontSize: 16,
          }}
        />

        {isLoading ? (
          <View className="h-11 w-11 items-center justify-center">
            <ActivityIndicator color="#009E45" size="small" />
          </View>
        ) : query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear location"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={handleClear}
            className="h-11 w-11 items-center justify-center"
          >
            <X size={18} color="#7B8798" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      {isOpen && !disabled ? (
        <View
          style={{
            marginTop: 8,
            overflow: "hidden",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: "#FFFFFF",
          }}
        >
          {searchError ? (
            <Text
              accessibilityRole="alert"
              className="px-4 py-3 text-[13px] text-red-600"
            >
              {searchError}
            </Text>
          ) : results.length === 0 ? (
            <Text className="px-4 py-3 text-[13px] text-[#596B80]">
              {query.trim().length < 3
                ? "Keep typing to find your town or city."
                : "No locations found. Try another town or city."}
            </Text>
          ) : (
            results.map((result, index) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                onPress={() => handleSelect(result)}
                className="flex-row items-center gap-3 px-4 py-3 active:bg-slate-50"
                style={{
                  borderBottomWidth: index < results.length - 1 ? 1 : 0,
                  borderBottomColor: "#F1F5F9",
                }}
              >
                <MapPin size={18} color="#009E45" strokeWidth={1.8} />

                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-[#07192D]">
                    {result.city}
                  </Text>

                  <Text className="mt-0.5 text-[13px] leading-[18px] text-[#596B80]">
                    {[result.county, result.country].filter(Boolean).join(", ")}
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