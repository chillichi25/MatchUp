"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  X,
} from "lucide-react";

export type LocationValue = {
  city: string;
  county: string;
  country: string;
  lat: number;
  lng: number;
  formatted: string;
};

type LocationResult = LocationValue & {
  id: string;
  name: string;
  countryCode: string;
};

type LocationPickerProps = {
  value?: LocationValue | null;
  onChange: (
    location: LocationValue | null
  ) => void;
  placeholder?: string;
  error?: boolean;

  // Called whenever the user starts typing
  // so the visible validation error can clear.
  onInputChange?: () => void;
};

export function LocationPicker({
  value,
  onChange,
  placeholder = "Search town or city",
  error = false,
  onInputChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState(
    value?.formatted ?? ""
  );

  const [results, setResults] =
    useState<LocationResult[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  // Keep the visible input text in sync
  // with the selected location.
  useEffect(() => {
    setQuery(value?.formatted ?? "");
  }, [value]);

  // Search locations after the user has
  // typed at least two characters.
  useEffect(() => {
    const cleanQuery = query.trim();

    if (
      cleanQuery.length < 2 ||
      cleanQuery === value?.formatted
    ) {
      setResults([]);
      setLoading(false);
      setOpen(false);

      return;
    }

    const timer = setTimeout(async () => {
      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      try {
        setLoading(true);

        const response = await fetch(
          `/api/locations/search?q=${encodeURIComponent(
            cleanQuery
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to search locations."
          );
        }

        const data = await response.json();

        const nextResults =
          Array.isArray(data.results)
            ? data.results
            : [];

        setResults(nextResults);
        setOpen(true);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Location search error:",
          error
        );

        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query, value?.formatted]);

  function selectLocation(
    result: LocationResult
  ) {
    const selected: LocationValue = {
      city: result.city,
      county: result.county,
      country: result.country,
      lat: result.lat,
      lng: result.lng,
      formatted: result.formatted,
    };

    onChange(selected);

    setQuery(result.formatted);
    setResults([]);
    setOpen(false);
  }

  function clearLocation() {
    setQuery("");
    setResults([]);
    setOpen(false);

    onInputChange?.();
    onChange(null);
  }

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative">
        <MapPin
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${
            error
              ? "text-red-400"
              : "text-slate-400"
          }`}
        />

        <input
          type="text"
          value={query}
          aria-invalid={error}
          aria-describedby={
            error
              ? "club-location-error"
              : undefined
          }
          onChange={(event) => {
            setQuery(event.target.value);

            // Remove the visible red validation
            // while the user is correcting it.
            onInputChange?.();

            // Typed text alone is NOT a valid
            // location. A suggestion must be selected.
            onChange(null);
          }}
          onFocus={() => {
            if (results.length > 0) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`h-14 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
          }`}
        />

        {/* Loading / clear */}
        {loading ? (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        ) : query ? (
          <button
            type="button"
            onClick={clearLocation}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear location"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Results */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() =>
                selectLocation(result)
              }
              className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
            >
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-[#00B83F]"
              />

              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {result.city ||
                    result.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {[
                    result.county,
                    result.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open &&
        !loading &&
        query.trim().length >= 2 &&
        results.length === 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-slate-500 shadow-lg">
            No locations found.
          </div>
        )}
    </div>
  );
}