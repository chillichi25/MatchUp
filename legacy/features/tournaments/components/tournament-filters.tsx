"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

/* =====================================================
   TYPES
===================================================== */

type TournamentFiltersProps = {
  defaultLocation: string;
};

type Screen =
  | "filters"
  | "date"
  | "location"
  | "distance"
  | "age"
  | "level"
  | "gender"
  | "format";

/* =====================================================
   OPTIONS
===================================================== */

const distanceOptions = [
  "5",
  "10",
  "20",
  "30",
  "50",
];

const ageOptions = [
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
   "U17",
  "U18",
  "Open Age",
];

const levelOptions = [
   "Beginner",
  "Development",
  "Intermediate",
  "Competitive",
];

const genderOptions = [
  "Boys",
  "Girls",
  "Mixed",
];

const formatOptions = [
  "3v3",
  "5v5",
  "7v7",
  "9v9",
  "11v11",
];

/* =====================================================
   COMPONENT
===================================================== */

export function TournamentFilters({
  defaultLocation,
}: TournamentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const [open, setOpen] =
    useState(false);

  const [screen, setScreen] =
    useState<Screen>("filters");

  /* ===================================================
     FILTER STATE
  =================================================== */

  const [search, setSearch] =
    useState(
      searchParams.get("q") ?? ""
    );

  const [age, setAge] =
    useState(
      searchParams.get("age") ?? ""
    );

  const [level, setLevel] =
    useState(
      searchParams.get("level") ?? ""
    );

  const [gender, setGender] =
    useState(
      searchParams.get("gender") ?? ""
    );

  const [format, setFormat] =
    useState(
      searchParams.get("format") ?? ""
    );

  const [date, setDate] =
    useState(
      searchParams.get("date") ?? ""
    );

  const [location, setLocation] =
    useState(
      searchParams.get("location") ??
        ""
    );

  const [distance, setDistance] =
    useState(
      searchParams.get("distance") ??
        ""
    );

  const [
    useCustomLocation,
    setUseCustomLocation,
  ] = useState(
    Boolean(
      searchParams.get("location")
    )
  );

  /* ===================================================
     SYNC STATE WITH URL
  =================================================== */

  useEffect(() => {
    setSearch(
      searchParams.get("q") ?? ""
    );

    setAge(
      searchParams.get("age") ?? ""
    );

    setLevel(
      searchParams.get("level") ?? ""
    );

    setGender(
      searchParams.get("gender") ?? ""
    );

    setFormat(
      searchParams.get("format") ?? ""
    );

    setDate(
      searchParams.get("date") ?? ""
    );

    setLocation(
      searchParams.get("location") ??
        ""
    );

    setDistance(
      searchParams.get("distance") ??
        ""
    );

    setUseCustomLocation(
      Boolean(
        searchParams.get("location")
      )
    );
  }, [searchParams]);

  /* ===================================================
     CLOSE FILTERS
  =================================================== */

  function closeFilters() {
    setAge(
      searchParams.get("age") ?? ""
    );

    setLevel(
      searchParams.get("level") ?? ""
    );

    setGender(
      searchParams.get("gender") ?? ""
    );

    setFormat(
      searchParams.get("format") ?? ""
    );

    setDate(
      searchParams.get("date") ?? ""
    );

    setLocation(
      searchParams.get("location") ??
        ""
    );

    setDistance(
      searchParams.get("distance") ??
        ""
    );

    setUseCustomLocation(
      Boolean(
        searchParams.get("location")
      )
    );

    setScreen("filters");
    setOpen(false);
  }

  /* ===================================================
     APPLY FILTERS
  =================================================== */

  function applyFilters() {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "type",
      "tournaments"
    );

    /* SEARCH */

    if (search.trim()) {
      params.set(
        "q",
        search.trim()
      );
    } else {
      params.delete("q");
    }

    /* AGE */

    if (age) {
      params.set("age", age);
    } else {
      params.delete("age");
    }

    /* LEVEL */

    if (level) {
      params.set(
        "level",
        level
      );
    } else {
      params.delete("level");
    }

    /* GENDER */

    if (gender) {
      params.set(
        "gender",
        gender
      );
    } else {
      params.delete("gender");
    }

    /* FORMAT */

    if (format) {
      params.set(
        "format",
        format
      );
    } else {
      params.delete("format");
    }

    /* DATE */

    if (date) {
      params.set(
        "date",
        date
      );
    } else {
      params.delete("date");
    }

    /* LOCATION */

    if (
      useCustomLocation &&
      location.trim()
    ) {
      params.set(
        "location",
        location.trim()
      );
    } else {
      params.delete(
        "location"
      );
    }

    /* DISTANCE */

    if (distance) {
      params.set(
        "distance",
        distance
      );
    } else {
      params.delete(
        "distance"
      );
    }

    router.push(
      `${pathname}?${params.toString()}`
    );

    setScreen("filters");
    setOpen(false);
  }

  /* ===================================================
   RESET FILTERS
=================================================== */

function resetFilters() {
  setAge("");
  setLevel("");
  setGender("");
  setFormat("");
  setDate("");
  setLocation("");
  setDistance("");
  setUseCustomLocation(false);
  setSearch("");

  setScreen("filters");
  setOpen(false);

  router.push("/matches?type=tournaments");
}

  /* ===================================================
     SEARCH
  =================================================== */

  function submitSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "type",
      "tournaments"
    );

    if (search.trim()) {
      params.set(
        "q",
        search.trim()
      );
    } else {
      params.delete("q");
    }

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  /* ===================================================
     ACTIVE FILTER COUNT
  =================================================== */

  const activeFilterCount = [
    age,
    level,
    gender,
    format,
    date,
    useCustomLocation
      ? location
      : "",
    distance,
  ].filter(Boolean).length;

  /* ===================================================
     DISPLAY VALUES
  =================================================== */

  const locationDisplay =
    useCustomLocation
      ? location.trim() ||
        "Choose location"
      : defaultLocation.trim() ||
        "Club location";

  const distanceDisplay =
    distance
      ? `Within ${distance} miles`
      : "Any distance";

  const dateDisplay = date
    ? new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Any date";

  /* ===================================================
     UI
  =================================================== */

  return (
    <>
      {/* ================================================
          SEARCH + FILTER BUTTON
      ================================================= */}

      <section className="mt-3">
        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2.5"
        >
          {/* SEARCH */}

          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
            <Search
              size={18}
              strokeWidth={2}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search tournaments or locations"
              enterKeyHint="search"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-950 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* FILTER BUTTON */}

          <button
            type="button"
            onClick={() => {
              setScreen("filters");
              setOpen(true);
            }}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
            aria-label="Tournament filters"
          >
            <SlidersHorizontal
              size={19}
              strokeWidth={2}
            />

            {activeFilterCount >
              0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00B83F] px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>
      </section>

      {/* ================================================
          FILTER OVERLAY
      ================================================= */}

      {open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50">
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-6">

            {screen ===
            "filters" ? (
              <>
                {/* MAIN FILTER SCREEN */}

                <FilterHeader
                  title="Filters"
                  onClose={
                    closeFilters
                  }
                />

                <section className="mt-6">
                  <h2 className="text-[24px] font-bold tracking-tight text-slate-950">
                    Find the right
                    tournament
                  </h2>

                  <p className="mt-1 text-[13px] leading-[18px] text-slate-500">
                    Choose what matters
                    for your team.
                  </p>
                </section>

                {/* FILTER LIST */}

                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">

                  {/* DATE */}

                  <button
                    type="button"
                    onClick={() =>
                      setScreen(
                        "date"
                      )
                    }
                    className="flex min-h-[58px] w-full items-center text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-950">
                        Date
                      </p>

                      <p
                        className={`mt-0.5 truncate text-[10px] ${
                          date
                            ? "font-medium text-violet-600"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          dateDisplay
                        }
                      </p>
                    </div>

                    <CalendarDays
                      size={17}
                      strokeWidth={
                        1.9
                      }
                      className="shrink-0 text-slate-500"
                    />
                  </button>

                  <FilterDivider />

                  {/* LOCATION */}

                  <FilterRow
                    label="Location"
                    value={
                      locationDisplay
                    }
                    active={
                      useCustomLocation &&
                      Boolean(
                        location.trim()
                      )
                    }
                    onClick={() =>
                      setScreen(
                        "location"
                      )
                    }
                  />

                  <FilterDivider />

                  {/* DISTANCE */}

                  <FilterRow
                    label="Distance"
                    value={
                      distanceDisplay
                    }
                    active={Boolean(
                      distance
                    )}
                    onClick={() =>
                      setScreen(
                        "distance"
                      )
                    }
                  />

                  <FilterDivider />

                  {/* AGE */}

                  <FilterRow
                    label="Age group"
                    value={
                      age ||
                      "Any age group"
                    }
                    active={Boolean(
                      age
                    )}
                    onClick={() =>
                      setScreen(
                        "age"
                      )
                    }
                  />

                  <FilterDivider />

                  {/* LEVEL */}

                  <FilterRow
                    label="Level"
                    value={
                      level ||
                      "Any level"
                    }
                    active={Boolean(
                      level
                    )}
                    onClick={() =>
                      setScreen(
                        "level"
                      )
                    }
                  />

                  <FilterDivider />

                  {/* GENDER */}

                  <FilterRow
                    label="Gender"
                    value={
                      gender ||
                      "Any gender"
                    }
                    active={Boolean(
                      gender
                    )}
                    onClick={() =>
                      setScreen(
                        "gender"
                      )
                    }
                  />

                  <FilterDivider />

                  {/* FORMAT */}

                  <FilterRow
                    label="Format"
                    value={
                      format ||
                      "Any format"
                    }
                    active={Boolean(
                      format
                    )}
                    onClick={() =>
                      setScreen(
                        "format"
                      )
                    }
                  />
                </section>

                {/* ACTIONS */}

                <div className="mt-auto grid grid-cols-2 gap-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-7">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition active:scale-[0.98]"
                  >
                    Reset all
                  </button>

                  <button
                    type="button"
                    onClick={
                      applyFilters
                    }
                    className="flex h-12 items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98]"
                  >
                    Show tournaments
                  </button>
                </div>
              </>
            ) : screen ===
              "date" ? (
              <>
                {/* DATE */}

                <SubScreenHeader
                  title="Date"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="When do you want to play?"
                  description="Choose a date for your tournament."
                />

                <TournamentCalendar
                  value={date}
                  onChange={(
                    value
                  ) => {
                    setDate(
                      value
                    );

                    setScreen(
                      "filters"
                    );
                  }}
                  onClear={() => {
                    setDate("");

                    setScreen(
                      "filters"
                    );
                  }}
                />
              </>
            ) : screen ===
              "location" ? (
              <>
                {/* LOCATION */}

                <SubScreenHeader
                  title="Location"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="Where are you looking?"
                  description="Use your club location or search from another town or city."
                />

                {/* CLUB LOCATION */}

                <section className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomLocation(
                        false
                      );

                      setLocation(
                        ""
                      );
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                      !useCustomLocation
                        ? "border-violet-200 bg-violet-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        !useCustomLocation
                          ? "bg-violet-100 text-violet-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <MapPin
                        size={18}
                        strokeWidth={
                          2
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-950">
                        Club
                        location
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {defaultLocation ||
                          "No club location available"}
                      </p>
                    </div>

                    {!useCustomLocation && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600">
                        <Check
                          size={
                            14
                          }
                          strokeWidth={
                            2.5
                          }
                          className="text-white"
                        />
                      </div>
                    )}
                  </button>

                  {/* CUSTOM LOCATION */}

                  <button
                    type="button"
                    onClick={() =>
                      setUseCustomLocation(
                        true
                      )
                    }
                    className={`mt-3 flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                      useCustomLocation
                        ? "border-violet-200 bg-violet-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        useCustomLocation
                          ? "bg-violet-100 text-violet-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <Search
                        size={18}
                        strokeWidth={
                          2
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-950">
                        Another
                        location
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Search from a
                        different town
                        or city
                      </p>
                    </div>

                    {useCustomLocation && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600">
                        <Check
                          size={
                            14
                          }
                          strokeWidth={
                            2.5
                          }
                          className="text-white"
                        />
                      </div>
                    )}
                  </button>
                </section>

                {/* CUSTOM LOCATION INPUT */}

                {useCustomLocation && (
                  <div className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                    <MapPin
                      size={18}
                      strokeWidth={
                        1.9
                      }
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      type="text"
                      value={
                        location
                      }
                      onChange={(
                        event
                      ) =>
                        setLocation(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="e.g. Manchester"
                      autoFocus
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={
                    useCustomLocation &&
                    !location.trim()
                  }
                  onClick={() =>
                    setScreen(
                      "filters"
                    )
                  }
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Done
                </button>
              </>
            ) : screen ===
              "distance" ? (
              <>
                {/* DISTANCE */}

                <SubScreenHeader
                  title="Distance"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="How far can you travel?"
                  description={
                    useCustomLocation
                      ? location.trim()
                        ? `Choose a search radius from ${location.trim()}.`
                        : "Choose a location first."
                      : defaultLocation.trim()
                        ? `Choose a search radius from ${defaultLocation}.`
                        : "Add a club location before choosing a distance."
                  }
                />

                {(useCustomLocation
                  ? Boolean(
                      location.trim()
                    )
                  : Boolean(
                      defaultLocation.trim()
                    )) ? (
                  <OptionList>
                    <OptionButton
                      label="Any distance"
                      selected={
                        !distance
                      }
                      onClick={() => {
                        setDistance(
                          ""
                        );

                        setScreen(
                          "filters"
                        );
                      }}
                    />

                    {distanceOptions.map(
                      (
                        option
                      ) => (
                        <OptionButton
                          key={
                            option
                          }
                          label={`Within ${option} miles`}
                          selected={
                            distance ===
                            option
                          }
                          onClick={() => {
                            setDistance(
                              option
                            );

                            setScreen(
                              "filters"
                            );
                          }}
                        />
                      )
                    )}
                  </OptionList>
                ) : (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
                    <MapPin
                      size={23}
                      strokeWidth={
                        1.8
                      }
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-[13px] font-semibold text-slate-950">
                      Location
                      required
                    </p>

                    <p className="mt-1 text-[11px] leading-[16px] text-slate-500">
                      Choose a
                      location before
                      setting a
                      distance.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setScreen(
                          "location"
                        )
                      }
                      className="mt-4 text-[12px] font-bold text-violet-600"
                    >
                      Choose
                      location
                    </button>
                  </div>
                )}
              </>
            ) : screen ===
              "age" ? (
              <>
                {/* AGE */}

                <SubScreenHeader
                  title="Age group"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="Which age group?"
                  description="Choose the age group you want to find tournaments for."
                />

                <OptionList>
                  <OptionButton
                    label="Any age group"
                    selected={!age}
                    onClick={() => {
                      setAge("");

                      setScreen(
                        "filters"
                      );
                    }}
                  />

                  {ageOptions.map(
                    (option) => (
                      <OptionButton
                        key={
                          option
                        }
                        label={
                          option
                        }
                        selected={
                          age ===
                          option
                        }
                        onClick={() => {
                          setAge(
                            option
                          );

                          setScreen(
                            "filters"
                          );
                        }}
                      />
                    )
                  )}
                </OptionList>
              </>
            ) : screen ===
              "level" ? (
              <>
                {/* LEVEL */}

                <SubScreenHeader
                  title="Level"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="What level are you looking for?"
                  description="Choose a tournament level that suits your team."
                />

                <OptionList>
                  <OptionButton
                    label="Any level"
                    selected={
                      !level
                    }
                    onClick={() => {
                      setLevel("");

                      setScreen(
                        "filters"
                      );
                    }}
                  />

                  {levelOptions.map(
                    (option) => (
                      <OptionButton
                        key={
                          option
                        }
                        label={
                          option
                        }
                        selected={
                          level ===
                          option
                        }
                        onClick={() => {
                          setLevel(
                            option
                          );

                          setScreen(
                            "filters"
                          );
                        }}
                      />
                    )
                  )}
                </OptionList>
              </>
            ) : screen ===
              "gender" ? (
              <>
                {/* GENDER */}

                <SubScreenHeader
                  title="Gender"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="Which teams are you looking for?"
                  description="Choose a tournament team category."
                />

                <OptionList>
                  <OptionButton
                    label="Any gender"
                    selected={
                      !gender
                    }
                    onClick={() => {
                      setGender(
                        ""
                      );

                      setScreen(
                        "filters"
                      );
                    }}
                  />

                  {genderOptions.map(
                    (option) => (
                      <OptionButton
                        key={
                          option
                        }
                        label={
                          option
                        }
                        selected={
                          gender ===
                          option
                        }
                        onClick={() => {
                          setGender(
                            option
                          );

                          setScreen(
                            "filters"
                          );
                        }}
                      />
                    )
                  )}
                </OptionList>
              </>
            ) : (
              <>
                {/* FORMAT */}

                <SubScreenHeader
                  title="Format"
                  onBack={() =>
                    setScreen(
                      "filters"
                    )
                  }
                />

                <SubScreenIntro
                  title="What format are you looking for?"
                  description="Choose the tournament format for your team."
                />

                <OptionList>
                  <OptionButton
                    label="Any format"
                    selected={
                      !format
                    }
                    onClick={() => {
                      setFormat(
                        ""
                      );

                      setScreen(
                        "filters"
                      );
                    }}
                  />

                  {formatOptions.map(
                    (option) => (
                      <OptionButton
                        key={
                          option
                        }
                        label={
                          option
                        }
                        selected={
                          format ===
                          option
                        }
                        onClick={() => {
                          setFormat(
                            option
                          );

                          setScreen(
                            "filters"
                          );
                        }}
                      />
                    )
                  )}
                </OptionList>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* =====================================================
   MATCHUP TOURNAMENT CALENDAR
===================================================== */

function TournamentCalendar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (date: string) => void;
  onClear: () => void;
}) {
  const today = new Date();

  const selected = value
    ? new Date(
        `${value}T00:00:00`
      )
    : null;

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    new Date(
      selected?.getFullYear() ??
        today.getFullYear(),
      selected?.getMonth() ??
        today.getMonth(),
      1
    )
  );

  const year =
    visibleMonth.getFullYear();

  const month =
    visibleMonth.getMonth();

  const monthLabel =
    visibleMonth.toLocaleDateString(
      "en-GB",
      {
        month: "long",
        year: "numeric",
      }
    );

  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  const startOffset =
    (firstDay.getDay() + 6) %
    7;

  const daysInMonth =
    lastDay.getDate();

  const previousMonthLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  const cells = Array.from(
    {
      length: 42,
    },
    (_, index) => {
      const dayNumber =
        index -
        startOffset +
        1;

      if (dayNumber < 1) {
        return {
          day:
            previousMonthLastDay +
            dayNumber,
          offset: -1,
        };
      }

      if (
        dayNumber >
        daysInMonth
      ) {
        return {
          day:
            dayNumber -
            daysInMonth,
          offset: 1,
        };
      }

      return {
        day: dayNumber,
        offset: 0,
      };
    }
  );

  function toDateString(
    dateValue: Date
  ) {
    const dateYear =
      dateValue.getFullYear();

    const dateMonth = String(
      dateValue.getMonth() + 1
    ).padStart(2, "0");

    const dateDay = String(
      dateValue.getDate()
    ).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  }

  const todayString =
    toDateString(today);

  function previousMonth() {
    setVisibleMonth(
      new Date(
        year,
        month - 1,
        1
      )
    );
  }

  function nextMonth() {
    setVisibleMonth(
      new Date(
        year,
        month + 1,
        1
      )
    );
  }

  function selectDate(
    day: number,
    offset: number
  ) {
    const selectedDate =
      new Date(
        year,
        month + offset,
        day
      );

    const selectedString =
      toDateString(
        selectedDate
      );

    if (
      selectedString <
      todayString
    ) {
      return;
    }

    onChange(
      selectedString
    );
  }

  function goToToday() {
    const todayValue =
      toDateString(today);

    setVisibleMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    onChange(todayValue);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* MONTH HEADER */}

      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={
            previousMonth
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition active:bg-slate-100"
          aria-label="Previous month"
        >
          <ChevronLeft
            size={19}
            strokeWidth={2}
          />
        </button>

        <p className="text-[14px] font-bold text-slate-950">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition active:bg-slate-100"
          aria-label="Next month"
        >
          <ChevronRight
            size={19}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* WEEKDAYS */}

      <div className="grid grid-cols-7 px-3">
        {[
          "Mo",
          "Tu",
          "We",
          "Th",
          "Fr",
          "Sa",
          "Su",
        ].map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-[10px] font-semibold text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* DAYS */}

      <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
        {cells.map(
          (
            cell,
            index
          ) => {
            const cellDate =
              new Date(
                year,
                month +
                  cell.offset,
                cell.day
              );

            const dateString =
              toDateString(
                cellDate
              );

            const isSelected =
              value ===
              dateString;

            const isToday =
              todayString ===
              dateString;

            const isPast =
              dateString <
              todayString;

            const isOutside =
              cell.offset !== 0;

            return (
              <button
                key={`${dateString}-${index}`}
                type="button"
                disabled={
                  isPast
                }
                onClick={() =>
                  selectDate(
                    cell.day,
                    cell.offset
                  )
                }
                className="flex h-10 items-center justify-center"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] transition ${
                    isSelected
                      ? "bg-violet-600 font-bold text-white shadow-sm"
                      : isPast
                        ? "text-slate-300"
                        : isToday
                          ? "border border-violet-200 bg-violet-50 font-bold text-violet-600"
                          : isOutside
                            ? "text-slate-300"
                            : "font-medium text-slate-700 active:bg-slate-100"
                  }`}
                >
                  {cell.day}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={onClear}
          className="text-[12px] font-semibold text-slate-500"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={
            goToToday
          }
          className="text-[12px] font-bold text-violet-600"
        >
          Today
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   FILTER HEADER
===================================================== */

function FilterHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <header className="grid grid-cols-[44px_1fr_44px] items-center">
      <button
        type="button"
        onClick={onClose}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
        aria-label="Close filters"
      >
        <X
          size={19}
          strokeWidth={2}
        />
      </button>

      <h1 className="text-center text-[17px] font-bold text-slate-950">
        {title}
      </h1>

      <div />
    </header>
  );
}

/* =====================================================
   SUB SCREEN HEADER
===================================================== */

function SubScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <header className="grid grid-cols-[44px_1fr_44px] items-center">
      <button
        type="button"
        onClick={onBack}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
        aria-label="Back to filters"
      >
        <ArrowLeft
          size={19}
          strokeWidth={2}
        />
      </button>

      <h1 className="text-center text-[17px] font-bold text-slate-950">
        {title}
      </h1>

      <div />
    </header>
  );
}

/* =====================================================
   SUB SCREEN INTRO
===================================================== */

function SubScreenIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-[24px] font-bold tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-[13px] leading-[18px] text-slate-500">
        {description}
      </p>
    </section>
  );
}

/* =====================================================
   FILTER ROW
===================================================== */

function FilterRow({
  label,
  value,
  active = false,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[58px] w-full items-center text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-slate-950">
          {label}
        </span>

        <span
          className={`mt-0.5 block truncate text-[10px] ${
            active
              ? "font-medium text-violet-600"
              : "text-slate-500"
          }`}
        >
          {value}
        </span>
      </span>

      <ChevronRight
        size={17}
        strokeWidth={2}
        className="shrink-0 text-slate-300"
      />
    </button>
  );
}

/* =====================================================
   OPTION LIST
===================================================== */

function OptionList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
      {children}
    </div>
  );
}

/* =====================================================
   OPTION BUTTON
===================================================== */

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between border-b border-slate-100 py-3 text-left last:border-b-0"
    >
      <span
        className={`text-[13px] ${
          selected
            ? "font-semibold text-slate-950"
            : "font-medium text-slate-700"
        }`}
      >
        {label}
      </span>

      {selected && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50">
          <Check
            size={15}
            strokeWidth={2.5}
            className="text-violet-600"
          />
        </div>
      )}
    </button>
  );
}

/* =====================================================
   DIVIDER
===================================================== */

function FilterDivider() {
  return (
    <div className="border-t border-slate-100" />
  );
}