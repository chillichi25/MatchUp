import { supabase } from "@/lib/supabase/client";

import type { LocationValue } from "../types";

export type LocationResult = {
  id: string;
  name: string;
  city: string;
  county: string;
  country: string;
  countryCode: string;
  formatted: string;
  lat: number;
  lng: number;
};

/**
 * Calls the `locations-search` Supabase Edge Function, which proxies Geoapify
 * with a server-side key. Returns [] for short queries.
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke<{
    results?: LocationResult[];
  }>("locations-search", {
    body: { query: trimmed },
  });

  if (error) {
    console.error("LOCATION SEARCH ERROR:", error);
    throw new Error(
      "We couldn't search for that location. Please try again."
    );
  }

  return data?.results ?? [];
}

export function toLocationValue(result: LocationResult): LocationValue {
  return {
    city: result.city,
    county: result.county,
    country: result.country,
    lat: result.lat,
    lng: result.lng,
    formatted:
      result.formatted ||
      [result.city, result.county, result.country]
        .filter(Boolean)
        .join(", "),
  };
}
