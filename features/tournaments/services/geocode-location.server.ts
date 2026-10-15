"use server";

type GeocodedLocation = {
  lat: number;
  lng: number;
};

export async function geocodeLocation(
  location: string
): Promise<GeocodedLocation | null> {
  const cleanLocation = location.trim();

  if (!cleanLocation) {
    return null;
  }

  const params = new URLSearchParams({
    q: cleanLocation,
    format: "jsonv2",
    limit: "1",
    countrycodes: "gb",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "MatchUp/1.0",
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Geocoding failed:",
        response.status
      );

      return null;
    }

    const results = await response.json();

    if (
      !Array.isArray(results) ||
      results.length === 0
    ) {
      return null;
    }

    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return null;
    }

    return {
      lat,
      lng,
    };
  } catch (error) {
    console.error(
      "Geocoding error:",
      error
    );

    return null;
  }
}