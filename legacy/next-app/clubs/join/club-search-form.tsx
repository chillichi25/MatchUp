"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { searchClubsAction } from "./actions";

import type { ClubSearchResult } from "@/features/clubs/services/club.service";

export function ClubSearchForm() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const requestIdRef = useRef(0);

  const cleanQuery = query.trim();
  const canSearch =
  cleanQuery.length >= 1;

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(false);

    const timeout = window.setTimeout(async () => {
      try {
        const clubs = await searchClubsAction(cleanQuery);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults(clubs);
        setHasSearched(true);
      } catch (error) {
        console.error("CLUB AUTOCOMPLETE ERROR:", error);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults([]);
        setHasSearched(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [cleanQuery, canSearch]);

  function clearSearch() {
    requestIdRef.current += 1;

    setQuery("");
    setResults([]);
    setLoading(false);
    setHasSearched(false);
  }

  function openClub(clubId: string) {
    router.push(`/clubs/join/${clubId}`);
  }

  return (
  <div className="mt-5">
      {/* Search field */}
      <div className="relative">
        <Search
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id="club-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search club name"
          autoComplete="off"
          aria-label="Search club name"
          aria-autocomplete="list"
          aria-expanded={canSearch}
          className="h-14 w-full rounded-[18px] border border-slate-200 bg-white pl-12 pr-12 text-[14px] text-[#07192D] shadow-[0_2px_6px_rgba(15,23,42,0.05)] outline-none transition placeholder:text-slate-400 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear club search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X
              size={17}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      {/* Loading */}
      {canSearch && loading && (
        <div className="mt-5 flex items-center justify-center gap-2 py-5 text-[13px] text-slate-500">
          <Loader2
            size={17}
            className="animate-spin text-[#00B83F]"
            aria-hidden="true"
          />

          Searching clubs...
        </div>
      )}

      {/* Results */}
      {canSearch && !loading && results.length > 0 && (
        <div
          role="listbox"
          aria-label="Club search results"
          className="mt-5 space-y-3"
        >
          {results.map((club) => {
            const location = [club.city, club.county]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={club.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => openClub(club.id)}
                className="group flex w-full items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 text-left shadow-[0_2px_5px_rgba(15,23,42,0.06)] transition hover:border-green-200 hover:bg-green-50/30 active:scale-[0.99]"
              >
                {/* Club badge */}
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50">
                  {club.badge_url ? (
                    <Image
                      src={club.badge_url}
                      alt={`${club.name} badge`}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building2
                      size={21}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-slate-400"
                    />
                  )}
                </div>

                {/* Club details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[#07192D]">
                    {club.name}
                  </p>

                  {location && (
                    <div className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-slate-500">
                      <MapPin
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate">
                        {location}
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#00B83F]"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* No results */}
{canSearch &&
  !loading &&
  hasSearched &&
  results.length === 0 && (
    <div className="mt-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
        <Search
          size={21}
          strokeWidth={2}
          aria-hidden="true"
          className="text-[#00B83F]"
        />
      </div>

      <p className="mt-3 text-[15px] font-bold text-[#07192D]">
        No clubs found
      </p>

      <p className="mx-auto mt-1.5 max-w-[270px] text-[13px] leading-5 text-slate-500">
        Try another club name, or create your club if it
        isn&apos;t on MatchUp.
      </p>

      <button
        type="button"
        onClick={() =>
          router.push("/clubs/create")
        }
        className="mx-auto mt-5 flex h-11 items-center justify-center rounded-full border border-[#00B83F] bg-white px-6 text-[14px] font-semibold text-[#00B83F] transition hover:bg-green-50 active:scale-[0.98]"
      >
        Create a club
      </button>
    </div>
        )}
    </div>
  );
}