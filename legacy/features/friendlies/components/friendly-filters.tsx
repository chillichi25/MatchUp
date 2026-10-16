"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

/* =====================================================
   TYPES
===================================================== */

type FriendlyFiltersProps = {
  age?: string;
  level?: string;
  gender?: string;
  format?: string;
  date?: string;
  location?: string;
  distance?: string;
  venue?: string;
  defaultLocation: string;
};

type Screen =
  | "filters"
  | "age"
  | "date"
  | "location"
  | "distance"
  | "level"
  | "gender"
  | "format"
  | "venue";

/* =====================================================
   OPTIONS
===================================================== */

const ageGroups = [
  "U6",
  "U7",
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

const distanceOptions = [
  "5",
  "10",
  "20",
  "30",
  "50",
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

const venueOptions = [
  {
    label: "Home",
    value: "home",
  },
  {
    label: "Away",
    value: "away",
  },
  {
    label: "Either",
    value: "either",
  },
];

/* =====================================================
   COMPONENT
===================================================== */

export function FriendlyFilters({
  age,
  level,
  gender,
  format,
  date,
  location,
  distance,
  venue,
  defaultLocation,
}: FriendlyFiltersProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [screen, setScreen] =
    useState<Screen>("filters");

  const [selectedAge, setSelectedAge] =
    useState(age ?? "");

  const [selectedDate, setSelectedDate] =
    useState(date ?? "");

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(location ?? "");

  const [
  useCustomLocation,
  setUseCustomLocation,
] = useState(Boolean(location));

  const [
    selectedDistance,
    setSelectedDistance,
  ] = useState(distance ?? "");

  const [
    selectedLevel,
    setSelectedLevel,
  ] = useState(level ?? "");

  const [
    selectedGender,
    setSelectedGender,
  ] = useState(gender ?? "");

  const [
    selectedFormat,
    setSelectedFormat,
  ] = useState(format ?? "");

  const [
    selectedVenue,
    setSelectedVenue,
  ] = useState(venue ?? "");

  /* ===================================================
     HELPERS
  =================================================== */

  function closeFilters() {
    setSelectedAge(age ?? "");
    setSelectedDate(date ?? "");
    setSelectedLocation(location ?? "");
    setUseCustomLocation(Boolean(location));
    setSelectedDistance(distance ?? "");
    setSelectedLevel(level ?? "");
    setSelectedGender(gender ?? "");
    setSelectedFormat(format ?? "");
    setSelectedVenue(venue ?? "");

    setScreen("filters");
    setIsOpen(false);
  }

  function resetFilters() {
  setSelectedAge("");
  setSelectedDate("");
  setSelectedLocation("");
  setUseCustomLocation(false);
  setSelectedDistance("");
  setSelectedLevel("");
  setSelectedGender("");
  setSelectedFormat("");
  setSelectedVenue("");

  setScreen("filters");
  setIsOpen(false);

  router.push("/matches?type=friendlies");
}

  function showMatches() {
    const params = new URLSearchParams();

    params.set("type", "friendlies");

    if (selectedAge) {
      params.set("age", selectedAge);
    }

    if (selectedLevel) {
      params.set("level", selectedLevel);
    }

    if (selectedGender) {
      params.set("gender", selectedGender);
    }

    if (selectedFormat) {
      params.set("format", selectedFormat);
    }

    if (selectedDate) {
      params.set("date", selectedDate);
    }

    if (selectedLocation.trim()) {
      params.set(
        "location",
        selectedLocation.trim()
      );
    }

    if (selectedDistance) {
      params.set(
        "distance",
        selectedDistance
      );
    }

    if (selectedVenue) {
      params.set("venue", selectedVenue);
    }

    setScreen("filters");
    setIsOpen(false);

    router.push(
      `/matches?${params.toString()}`
    );
  }

  const formattedVenue = selectedVenue
    ? selectedVenue.charAt(0).toUpperCase() +
      selectedVenue.slice(1)
    : "";

  const activeFilterCount = [
    selectedAge,
    selectedDate,
    selectedLocation,
    selectedDistance,
    selectedLevel,
    selectedGender,
    selectedFormat,
    selectedVenue,
  ].filter(Boolean).length;

  /* ===================================================
     UI
  =================================================== */

  return (
    <>
      {/* FILTER BUTTON */}

      <button
        type="button"
        onClick={() => {
          setScreen("filters");
          setIsOpen(true);
        }}
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
        aria-label="Filters"
      >
        <SlidersHorizontal
          size={19}
          strokeWidth={2}
        />

        {activeFilterCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00B83F] px-1 text-[9px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* =================================================
          FULL SCREEN FILTERS
      ================================================= */}

      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50">
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-6">

            {/* ===========================================
                MAIN FILTER SCREEN
            =========================================== */}

            {screen === "filters" ? (
              <>
                <FilterHeader
                  title="Filters"
                  onClose={closeFilters}
                />

                {/* INTRO */}

                <section className="mt-6">
                  <h2 className="text-[24px] font-bold tracking-tight text-slate-950">
                    Find the right match
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500">
                    Choose what matters for your team.
                  </p>
                </section>

                {/* FILTER LIST */}

                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                  <FilterRow
                    label="Age group"
                    value={
                      selectedAge || "Any age group"
                    }
                    onClick={() =>
                      setScreen("age")
                    }
                  />

                  <FilterDivider />

                  {/* DATE */}

<button
  type="button"
  onClick={() => setScreen("date")}
  className="flex min-h-[58px] w-full items-center text-left"
>
  <div className="min-w-0 flex-1">
    <p className="text-[12px] font-semibold text-slate-950">
      Date
    </p>

    <p
      className={`mt-0.5 text-[10px] ${
        selectedDate
          ? "font-medium text-[#00B83F]"
          : "text-slate-500"
      }`}
    >
      {selectedDate
        ? new Date(
            `${selectedDate}T00:00:00`
          ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Any date"}
    </p>
  </div>

  <CalendarDays
    size={17}
    strokeWidth={1.9}
    className="shrink-0 text-slate-500"
  />
</button>

                  <FilterDivider />

                  <FilterRow
  label="Location"
  value={
    selectedLocation ||
    "Any location"
  }
  onClick={() =>
    setScreen("location")
  }
/>

                  <FilterDivider />

                  <FilterRow
                    label="Distance"
                    value={
                      selectedDistance
                        ? `${selectedDistance} miles`
                        : "Any distance"
                    }
                    onClick={() =>
                      setScreen("distance")
                    }
                  />

                  <FilterDivider />

                  <FilterRow
                    label="Level"
                    value={
                      selectedLevel || "Any level"
                    }
                    onClick={() =>
                      setScreen("level")
                    }
                  />

                  <FilterDivider />

                  <FilterRow
                    label="Gender"
                    value={
                      selectedGender || "Any"
                    }
                    onClick={() =>
                      setScreen("gender")
                    }
                  />

                  <FilterDivider />

                  <FilterRow
                    label="Match format"
                    value={
                      selectedFormat ||
                      "Any format"
                    }
                    onClick={() =>
                      setScreen("format")
                    }
                  />

                  <FilterDivider />

                  <FilterRow
                    label="Venue"
                    value={
                      formattedVenue ||
                      "Any venue"
                    }
                    onClick={() =>
                      setScreen("venue")
                    }
                  />
                </section>

                {/* ACTIONS */}

                <div className="mt-auto grid grid-cols-2 gap-3 pt-7">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm transition active:scale-[0.98]"
                  >
                    Reset all
                  </button>

                  <button
                    type="button"
                    onClick={showMatches}
                    className="flex h-12 items-center justify-center rounded-2xl bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98]"
                  >
                    Show matches
                  </button>
                </div>
              </>
            ) : screen === "age" ? (
              /* =========================================
                 AGE
              ========================================= */

              <>
                <SubScreenHeader
                  title="Age group"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="Which age group?"
                  description="Choose the age group you want to play."
                />

                <OptionList>
                  <OptionButton
                    label="Any age group"
                    selected={!selectedAge}
                    onClick={() => {
                      setSelectedAge("");
                      setScreen("filters");
                    }}
                  />

                  {ageGroups.map(
                    (ageGroup) => (
                      <OptionButton
                        key={ageGroup}
                        label={ageGroup}
                        selected={
                          selectedAge ===
                          ageGroup
                        }
                        onClick={() => {
                          setSelectedAge(
                            ageGroup
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

              ) : screen === "date" ? (
  <>
    <SubScreenHeader
      title="Date"
      onBack={() =>
        setScreen("filters")
      }
    />

    <SubScreenIntro
      title="When do you want to play?"
      description="Choose a date for your match."
    />

    <MatchUpCalendar
      value={selectedDate}
      onChange={(date) => {
        setSelectedDate(date);
        setScreen("filters");
      }}
      onClear={() => {
        setSelectedDate("");
        setScreen("filters");
      }}
    />
  </>
) : screen === "location" ? (
  <>
    <SubScreenHeader
      title="Location"
      onBack={() => setScreen("filters")}
    />

    <SubScreenIntro
      title="Where are you looking?"
      description="Use your club location or search from another town or city."
    />

    <section className="mt-6">
      {/* CLUB LOCATION */}
      <button
        type="button"
        onClick={() => {
          setUseCustomLocation(false);
          setSelectedLocation("");
        }}
        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
          !useCustomLocation
            ? "border-green-200 bg-green-50/60"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            !useCustomLocation
              ? "bg-green-100 text-[#00B83F]"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <MapPin
            size={18}
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-950">
            Club location
          </p>

          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {defaultLocation ||
              "No club location available"}
          </p>
        </div>

        {!useCustomLocation && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00B83F]">
            <Check
              size={14}
              strokeWidth={2.5}
              className="text-white"
            />
          </div>
        )}
      </button>

      {/* ANOTHER LOCATION */}
      <button
        type="button"
        onClick={() =>
          setUseCustomLocation(true)
        }
        className={`mt-3 flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
          useCustomLocation
            ? "border-green-200 bg-green-50/60"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            useCustomLocation
              ? "bg-green-100 text-[#00B83F]"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <Search
            size={18}
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-950">
            Another location
          </p>

          <p className="mt-0.5 text-[11px] text-slate-500">
            Search from a different town or city
          </p>
        </div>

        {useCustomLocation && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00B83F]">
            <Check
              size={14}
              strokeWidth={2.5}
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
          strokeWidth={1.9}
          className="shrink-0 text-slate-400"
        />

        <input
          type="text"
          value={selectedLocation}
          onChange={(event) =>
            setSelectedLocation(
              event.target.value
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
        !selectedLocation.trim()
      }
      onClick={() =>
        setScreen("filters")
      }
      className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
    >
      Done
    </button>
 </>
) : screen === "distance" ? (
              /* =========================================
                 DISTANCE
              ========================================= */

              <>
                <SubScreenHeader
                  title="Distance"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="How far can you travel?"
                  description="Choose your search radius."
                />

                <OptionList>
                  <OptionButton
                    label="Any distance"
                    selected={
                      !selectedDistance
                    }
                    onClick={() => {
                      setSelectedDistance("");
                      setScreen("filters");
                    }}
                  />

                  {distanceOptions.map(
                    (option) => (
                      <OptionButton
                        key={option}
                        label={`${option} miles`}
                        selected={
                          selectedDistance ===
                          option
                        }
                        onClick={() => {
                          setSelectedDistance(
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
            ) : screen === "level" ? (
              /* =========================================
                 LEVEL
              ========================================= */

              <>
                <SubScreenHeader
                  title="Level"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="What level are you looking for?"
                  description="Choose the level that suits your team."
                />

                <OptionList>
                  <OptionButton
                    label="Any level"
                    selected={
                      !selectedLevel
                    }
                    onClick={() => {
                      setSelectedLevel("");
                      setScreen("filters");
                    }}
                  />

                  {levelOptions.map(
                    (option) => (
                      <OptionButton
                        key={option}
                        label={option}
                        selected={
                          selectedLevel ===
                          option
                        }
                        onClick={() => {
                          setSelectedLevel(
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
            ) : screen === "gender" ? (
              /* =========================================
                 GENDER
              ========================================= */

              <>
                <SubScreenHeader
                  title="Gender"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="Which teams are you looking for?"
                  description="Choose a team category."
                />

                <OptionList>
                  <OptionButton
                    label="Any"
                    selected={
                      !selectedGender
                    }
                    onClick={() => {
                      setSelectedGender("");
                      setScreen("filters");
                    }}
                  />

                  {genderOptions.map(
                    (option) => (
                      <OptionButton
                        key={option}
                        label={option}
                        selected={
                          selectedGender ===
                          option
                        }
                        onClick={() => {
                          setSelectedGender(
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
            ) : screen === "format" ? (
              /* =========================================
                 FORMAT
              ========================================= */

              <>
                <SubScreenHeader
                  title="Match format"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="What format are you looking for?"
                  description="Choose the match format for your team."
                />

                <OptionList>
                  <OptionButton
                    label="Any format"
                    selected={
                      !selectedFormat
                    }
                    onClick={() => {
                      setSelectedFormat("");
                      setScreen("filters");
                    }}
                  />

                  {formatOptions.map(
                    (option) => (
                      <OptionButton
                        key={option}
                        label={option}
                        selected={
                          selectedFormat ===
                          option
                        }
                        onClick={() => {
                          setSelectedFormat(
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
              /* =========================================
                 VENUE
              ========================================= */

              <>
                <SubScreenHeader
                  title="Venue"
                  onBack={() =>
                    setScreen("filters")
                  }
                />

                <SubScreenIntro
                  title="Where do you want to play?"
                  description="Choose the preferred venue."
                />

                <OptionList>
                  <OptionButton
                    label="Any venue"
                    selected={
                      !selectedVenue
                    }
                    onClick={() => {
                      setSelectedVenue("");
                      setScreen("filters");
                    }}
                  />

                  {venueOptions.map(
                    (option) => (
                      <OptionButton
                        key={option.value}
                        label={option.label}
                        selected={
                          selectedVenue ===
                          option.value
                        }
                        onClick={() => {
                          setSelectedVenue(
                            option.value
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
   MAIN HEADER
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
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50">
          <Check
            size={15}
            strokeWidth={2.5}
            className="text-[#00B83F]"
          />
        </div>
      )}
    </button>
  );
}

/* =====================================================
   FILTER ROW
===================================================== */

function FilterRow({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[67px] w-full items-center gap-3 py-3 text-left"
    >
      {icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#00B83F]">
          {icon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-slate-950">
          {label}
        </span>

        <span
          className={`mt-0.5 block truncate text-[11px] ${
            value &&
            !value.startsWith("Any")
              ? "font-medium text-[#00A638]"
              : "text-slate-500"
          }`}
        >
          {value || "Any"}
        </span>
      </span>

      <ChevronRight
  size={17}
  strokeWidth={2}
  className="shrink-0 text-slate-400"
/>
    </button>
  );
}

function MatchUpCalendar({
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
    ? new Date(`${value}T00:00:00`)
    : null;

  const [visibleMonth, setVisibleMonth] =
    useState(
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

  const firstDay =
    new Date(year, month, 1);

  const lastDay =
    new Date(year, month + 1, 0);

  // Convert JS Sunday-first indexing
  // to Monday-first indexing.
  const startOffset =
    (firstDay.getDay() + 6) % 7;

  const daysInMonth =
    lastDay.getDate();

  const previousMonthLastDay =
    new Date(year, month, 0).getDate();

  const cells = Array.from(
    { length: 42 },
    (_, index) => {
      const dayNumber =
        index - startOffset + 1;

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
    date: Date
  ) {
    const dateYear =
      date.getFullYear();

    const dateMonth = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const dateDay = String(
      date.getDate()
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
    const date = new Date(
      year,
      month + offset,
      day
    );

    // Do not allow past dates.
    const selectedString =
      toDateString(date);

    if (
      selectedString <
      todayString
    ) {
      return;
    }

    onChange(selectedString);
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
          onClick={previousMonth}
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
                disabled={isPast}
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
                      ? "bg-[#00B83F] font-bold text-white shadow-sm"
                      : isPast
                        ? "text-slate-300"
                        : isToday
                          ? "border border-green-200 bg-green-50 font-bold text-[#00A638]"
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
          onClick={goToToday}
          className="text-[12px] font-bold text-[#00A638]"
        >
          Today
        </button>
      </div>
    </div>
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