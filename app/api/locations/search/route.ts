import {
  NextRequest,
  NextResponse,
} from "next/server";

type GeoapifyResult = {
  place_id?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  name?: string;
  formatted?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
  country_code?: string;
  lat?: number | string;
  lon?: number | string;
};

export async function GET(
  request: NextRequest
) {
  const apiKey =
    process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Geoapify API key is missing.",
      },
      {
        status: 500,
      }
    );
  }

  const query =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
    });
  }

  const params =
    new URLSearchParams({
      text: query,
      format: "json",
      type: "city",
      limit: "12",
      lang: "en",
      filter: "countrycode:gb",
      apiKey,
    });

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Geoapify autocomplete error:",
        response.status
      );

      return NextResponse.json(
        {
          error:
            "Unable to search locations.",
        },
        {
          status: 502,
        }
      );
    }

    const data =
      await response.json();

    const rawResults: GeoapifyResult[] =
      Array.isArray(data.results)
        ? data.results
        : [];

    const cleanQuery =
      query.toLowerCase().trim();

    const mappedResults =
      rawResults
        .map((place) => {
          const city =
            place.city ??
            place.town ??
            place.village ??
            place.municipality ??
            place.name ??
            "";

          return {
            id:
              place.place_id ??
              `${place.lat}-${place.lon}`,

            name: city,

            city,

            county:
              place.county ??
              place.state_district ??
              place.state ??
              "",

            country:
              place.country ?? "",

            countryCode:
              place.country_code ?? "",

            formatted:
              place.formatted ?? "",

            lat: Number(place.lat),

            lng: Number(place.lon),
          };
        })

        // Remove incomplete/invalid places.
        .filter(
          (place) =>
            place.city.trim().length > 0 &&
            Number.isFinite(place.lat) &&
            Number.isFinite(place.lng)
        )

        // The actual town/city name must match
        // what the coach is typing.
        //
        // Examples:
        // "lee"   -> Leeds
        // "leeds" -> Leeds
        // "maidstone" cannot appear for "leeds".
        .filter((place) => {
          const city =
            place.city
              .toLowerCase()
              .trim();

          return city.startsWith(
            cleanQuery
          );
        })

        // Best matches first.
        .sort((a, b) => {
          const aCity =
            a.city
              .toLowerCase()
              .trim();

          const bCity =
            b.city
              .toLowerCase()
              .trim();

          const getScore = (
            city: string
          ) => {
            if (
              city === cleanQuery
            ) {
              return 0;
            }

            if (
              city.startsWith(
                cleanQuery
              )
            ) {
              return 1;
            }

            return 2;
          };

          const scoreDifference =
            getScore(aCity) -
            getScore(bCity);

          if (
            scoreDifference !== 0
          ) {
            return scoreDifference;
          }

          return (
            aCity.length -
            bCity.length
          );
        });

    // Remove duplicates while allowing
    // same-named places in different counties.
    const seenLocations =
      new Set<string>();

    const results =
      mappedResults
        .filter((place) => {
          const key = [
            place.city
              .trim()
              .toLowerCase(),

            place.county
              .trim()
              .toLowerCase(),

            place.country
              .trim()
              .toLowerCase(),
          ].join("|");

          if (
            seenLocations.has(key)
          ) {
            return false;
          }

          seenLocations.add(key);

          return true;
        })
        .slice(0, 6);

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error(
      "Location search route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to search locations.",
      },
      {
        status: 500,
      }
    );
  }
}