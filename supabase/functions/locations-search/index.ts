// Supabase Edge Function: locations-search
//
// Proxies town/city autocomplete to Geoapify so the API key stays a server-side
// secret. Closely follows the retired Next.js route at
// legacy/next-app/api/locations/search/route.ts.
//
// Deploy with:  supabase functions deploy locations-search
// Set secret:   supabase secrets set GEOAPIFY_API_KEY=...

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
    formatted?: string;
    lat?: number;
    lon?: number;
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("GEOAPIFY_API_KEY");

  if (!apiKey) {
    return json({ error: "Location search is not configured." }, 500);
  }

  let query = "";

  try {
    const body = await req.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return json({ error: "Unable to search locations." }, 400);
  }

  if (query.length < 2) {
    return json({ results: [] });
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");

  url.searchParams.set("text", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("type", "city");
  url.searchParams.set("limit", "12");
  url.searchParams.set("lang", "en");
  url.searchParams.set("filter", "countrycode:gb");
  url.searchParams.set("apiKey", apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      return json({ error: "Unable to search locations." }, 502);
    }

    const data = (await response.json()) as { results?: GeoapifyFeature[] };
    const lowerQuery = query.toLowerCase();

    const results = (data.results ?? [])
      .map((feature) => {
        const properties = feature.properties ?? {};

        const city =
          properties.city ??
          properties.town ??
          properties.village ??
          properties.municipality ??
          properties.name ??
          "";

        const county =
          properties.county ??
          properties.state_district ??
          properties.state ??
          "";

        const country = properties.country ?? "";
        const lat = Number(properties.lat);
        const lng = Number(properties.lon);

        return {
          id:
            properties.place_id ??
            (Number.isFinite(lat) && Number.isFinite(lng)
              ? `${lat}-${lng}`
              : city),
          name: properties.name ?? city,
          city,
          county,
          country,
          countryCode: properties.country_code ?? "",
          formatted: properties.formatted ?? "",
          lat,
          lng,
        };
      })
      .filter(
        (result) =>
          result.city.trim().length > 0 &&
          Number.isFinite(result.lat) &&
          Number.isFinite(result.lng)
      )
      .filter((result) =>
        result.city.toLowerCase().startsWith(lowerQuery)
      );

    results.sort((a, b) => {
      const aExact = a.city.toLowerCase() === lowerQuery ? 0 : 1;
      const bExact = b.city.toLowerCase() === lowerQuery ? 0 : 1;

      if (aExact !== bExact) return aExact - bExact;

      return a.city.length - b.city.length;
    });

    const seen = new Set<string>();
    const deduped = [];

    for (const result of results) {
      const key = `${result.city}|${result.county}|${result.country}`.toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);
      deduped.push(result);
    }

    return json({ results: deduped.slice(0, 6) });
  } catch {
    return json({ error: "Unable to search locations." }, 500);
  }
});
