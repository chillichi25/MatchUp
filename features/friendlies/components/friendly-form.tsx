"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

import { toast } from "sonner";

import { createFriendly } from "@/features/friendlies/services/friendly.service";
import { updateFriendlyAction } from "@/app/(dashboard)/friendlies/[id]/actions";

type VenueType =
  | "home"
  | "away"
  | "either";

type MatchFormat =
| "3v3"
  | "5v5"
  | "7v7"
  | "9v9"
  | "11v11";

type FriendlyInitialValues = {
  matchDate: string;
  kickOffTime: string;
  venueType: VenueType;
  matchFormat: MatchFormat;
  location: string;
  notes: string;
};

type FriendlyFormProps = {
  teamId: string;
  teamName: string;
  clubName: string;
  teamMatchFormat?: string | null;

  mode?: "create" | "edit";
  friendlyId?: string;
  initialValues?: FriendlyInitialValues;
};

const venueOptions: {
  value: VenueType;
  title: string;
  description: string;
}[] = [
  {
    value: "home",
    title: "Home",
    description: "we have a venue",
  },
  {
    value: "away",
    title: "Away",
    description: "we can travel",
  },
  {
    value: "either",
    title: "Either",
    description: "home or away",
  },
];

const formatOptions: {
  value: MatchFormat;
  label: string;
}[] = [
  {
    value: "3v3",
    label: "3v3",
  },
  {
    value: "5v5",
    label: "5v5",
  },
  {
    value: "7v7",
    label: "7v7",
  },
  {
    value: "9v9",
    label: "9v9",
  },
  {
    value: "11v11",
    label: "11v11",
  },
];

export function FriendlyForm({
  teamId,
  teamName,
  clubName,
  teamMatchFormat,
  mode = "create",
  friendlyId,
  initialValues,
}: FriendlyFormProps) {
  const router = useRouter();

  const venueMenuRef =
    useRef<HTMLDivElement>(null);

  const formatMenuRef =
    useRef<HTMLDivElement>(null);

    const dateMenuRef =
  useRef<HTMLDivElement>(null);

  const timeMenuRef =
  useRef<HTMLDivElement>(null);

  const [venueOpen, setVenueOpen] =
    useState(false);

  const [formatOpen, setFormatOpen] =
    useState(false);

    const [dateOpen, setDateOpen] =
  useState(false);

  const [timeOpen, setTimeOpen] =
  useState(false);

  const isEditing = mode === "edit";

  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());

  const [matchDate, setMatchDate] =
    useState(
      initialValues?.matchDate ?? ""
    );

  const [
    kickOffTime,
    setKickOffTime,
  ] = useState(
    initialValues?.kickOffTime ?? ""
  );

  const [
    venueType,
    setVenueType,
  ] = useState<VenueType>(
    initialValues?.venueType ?? "home"
  );

  const needsLocation =
    venueType !== "away";

  const validTeamMatchFormat =
  formatOptions.some(
    (option) =>
      option.value === teamMatchFormat
  )
    ? (teamMatchFormat as MatchFormat)
    : "9v9";

const [
  matchFormat,
  setMatchFormat,
] = useState<MatchFormat>(
  initialValues?.matchFormat ??
    validTeamMatchFormat
);

  const [location, setLocation] =
    useState(
      initialValues?.location ?? ""
    );

  const [notes, setNotes] =
    useState(
      initialValues?.notes ?? ""
    );

  const [loading, setLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

 const selectedVenue =
  venueOptions.find(
    (option) =>
      option.value === venueType
  ) ?? venueOptions[0];

  const formatLabel =
    formatOptions.find(
      (option) =>
        option.value === matchFormat
    )?.label ?? "9v9";

  // --------------------------------------------------
  // CLOSE CUSTOM MENUS
  // --------------------------------------------------

  useEffect(() => {
  function handleClickOutside(
    event: MouseEvent
  ) {
    const target = event.target as Node;

    if (
      venueMenuRef.current &&
      !venueMenuRef.current.contains(target)
    ) {
      setVenueOpen(false);
    }

    if (
      formatMenuRef.current &&
      !formatMenuRef.current.contains(target)
    ) {
      setFormatOpen(false);
    }

    if (
      dateMenuRef.current &&
      !dateMenuRef.current.contains(target)
    ) {
      setDateOpen(false);
    }
    if (
  timeMenuRef.current &&
  !timeMenuRef.current.contains(target)
) {
  setTimeOpen(false);
}
  }

  function handleEscape(
    event: KeyboardEvent
  ) {
    if (event.key === "Escape") {
      setVenueOpen(false);
      setFormatOpen(false);
      setDateOpen(false);
      setTimeOpen(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  document.addEventListener(
    "keydown",
    handleEscape
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

    document.removeEventListener(
      "keydown",
      handleEscape
    );
  };
}, []);

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setErrorMessage("");

  // --------------------------------------------------
  // REQUIRED FIELDS
  // --------------------------------------------------

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (!matchDate || !kickOffTime) {
      setErrorMessage(
        "Please enter the date and kick-off time."
      );

      return;
    }

    if (
      needsLocation &&
      !location.trim()
    ) {
      setErrorMessage(
        "Please enter the match location."
      );

      return;
    }

    // --------------------------------------------------
    // DATE / TIME VALIDATION
    // --------------------------------------------------

    const now = new Date();

    const londonDate =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Europe/London",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(now);

    const londonTime =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ).format(now);

    if (
      matchDate < londonDate ||
      (
        matchDate === londonDate &&
        kickOffTime <= londonTime
      )
    ) {
      setErrorMessage(
        "Please choose a future date and kick-off time."
      );

      return;
    }

    const submittedLocation =
      needsLocation
        ? location.trim()
        : "";

    try {
      setLoading(true);

      // --------------------------------------------------
      // EDIT
      // --------------------------------------------------

      if (isEditing) {
        if (!friendlyId) {
          setErrorMessage(
            "The friendly could not be updated."
          );

          return;
        }

        const { error } =
          await updateFriendlyAction({
            friendlyId,
            matchDate,
            kickOffTime,
            venueType,
            matchFormat,
            location:
              submittedLocation,
            notes,
          });

        if (error) {
          setErrorMessage(error);
          return;
        }

        toast.success(
          "Changes saved"
        );

        router.push(
          `/friendlies/${friendlyId}`
        );

        router.refresh();

        return;
      }

      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      const { data, error } =
        await createFriendly({
          teamId,
          matchDate,
          kickOffTime,
          venueType,
          matchFormat,
          location:
            submittedLocation,
          notes,
        });

      if (error) {
        setErrorMessage(
          error.message
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "The friendly could not be created."
        );

        return;
      }

      toast.success(
        "Match created"
      );

      router.push(
        `/friendlies/${data.id}`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        isEditing
          ? "Something went wrong while updating your friendly."
          : "Something went wrong while creating your friendly."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-5"
    >
      {/* -------------------------------------------
          YOUR TEAM
      ------------------------------------------- */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-slate-400">
  {isEditing
    ? "Match posted as"
    : "Posting as"}
</p>

        <p className="mt-1 font-bold text-slate-900">
          {clubName}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {teamName}
        </p>
      </div>

      {/* -------------------------------------------
    MATCH DATE
------------------------------------------- */}

<div>
  <label
    className="mb-2 block text-sm font-medium text-slate-900"
  >
    Match date
  </label>

  <div
    ref={dateMenuRef}
    className="relative"
  >
    <button
      type="button"
      onClick={() => {
        setDateOpen((open) => !open);
        setVenueOpen(false);
        setFormatOpen(false);
      }}
      className={`flex h-[52px] w-full items-center rounded-2xl border bg-white px-4 text-left outline-none transition ${
        dateOpen
          ? "border-[#00B83F]"
          : "border-gray-200"
      }`}
      aria-haspopup="dialog"
      aria-expanded={dateOpen}
    >
      <CalendarDays
        size={19}
        className="mr-4 shrink-0 text-slate-400"
      />

      <span
        className={`flex-1 text-[15px] ${
          matchDate
            ? "text-slate-900"
            : "text-slate-400"
        }`}
      >
        {matchDate
          ? new Date(
              `${matchDate}T00:00:00`
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "dd/mm/yyyy"}
      </span>

      <ChevronDown
        size={17}
        strokeWidth={2.2}
        className={`shrink-0 text-slate-500 transition-transform duration-200 ${
          dateOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {dateOpen && (
      <div className="absolute left-0 right-0 top-full z-50 mt-2">
        <MatchUpCalendar
          value={matchDate}
          onChange={(date) => {
            setMatchDate(date);
            setDateOpen(false);
          }}
        />
      </div>
    )}
  </div>
</div>

      {/* -------------------------------------------
    KICK-OFF TIME
------------------------------------------- */}

<div>
  <label className="mb-2 block text-sm font-medium text-slate-900">
    Kick-off time
  </label>

  <div
    ref={timeMenuRef}
    className="relative"
  >
    <button
      type="button"
      onClick={() => {
        setTimeOpen((open) => !open);
        setDateOpen(false);
        setVenueOpen(false);
        setFormatOpen(false);
      }}
      className={`flex h-[52px] w-full items-center rounded-2xl border bg-white px-4 text-left outline-none transition ${
        timeOpen
          ? "border-[#00B83F]"
          : "border-gray-200"
      }`}
      aria-haspopup="dialog"
      aria-expanded={timeOpen}
    >
      <Clock
        size={19}
        className="mr-4 shrink-0 text-slate-400"
      />

      <span
        className={`flex-1 text-[15px] ${
          kickOffTime
            ? "text-slate-900"
            : "text-slate-400"
        }`}
      >
        {kickOffTime || "--:--"}
      </span>

      <ChevronDown
        size={17}
        strokeWidth={2.2}
        className={`shrink-0 text-slate-500 transition-transform duration-200 ${
          timeOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {timeOpen && (
      <div className="absolute left-0 right-0 top-full z-50 mt-2">
        <MatchUpTimePicker
          value={kickOffTime}
          onChange={(time) => {
            setKickOffTime(time);
            setTimeOpen(false);
          }}
        />
      </div>
    )}
  </div>
</div>

      {/* -------------------------------------------
          VENUE
      ------------------------------------------- */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">
          Venue
        </label>

        <div
          ref={venueMenuRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setVenueOpen(
                (open) => !open
              );

              setFormatOpen(false);
            }}
            className={`flex h-[52px] w-full items-center justify-between rounded-2xl border bg-white px-4 text-left text-[15px] text-slate-900 outline-none transition ${
              venueOpen
                ? "border-[#00B83F]"
                : "border-gray-200"
            }`}
            aria-haspopup="menu"
            aria-expanded={venueOpen}
          >
            <div className="flex min-w-0 items-center gap-2">
  <span className="font-medium">
    {selectedVenue.title}
  </span>

  <span className="h-px w-3 shrink-0 bg-slate-300" />

  <span className="truncate text-slate-500">
    {selectedVenue.description}
  </span>
</div>

            <ChevronDown
              size={17}
              strokeWidth={2.2}
              className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                venueOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {venueOpen && (
            <div
              role="menu"
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              {venueOptions.map(
                (option) => {
                  const isSelected =
                    venueType ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setVenueType(
                          option.value
                        );

                        setVenueOpen(
                          false
                        );
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] font-medium transition ${
                        isSelected
                          ? "bg-green-50 text-[#00A638]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
  <span className="shrink-0 font-medium">
    {option.title}
  </span>

  <span className="h-px w-3 shrink-0 bg-slate-300" />

  <span
    className={
      isSelected
        ? "truncate text-[#00A638]"
        : "truncate text-slate-500"
    }
  >
    {option.description}
  </span>
</div>

{isSelected && (
  <Check
    size={16}
    strokeWidth={2.4}
    className="ml-3 shrink-0 text-[#00B83F]"
  />
)}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------
          MATCH FORMAT
      ------------------------------------------- */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">
          Match format
        </label>

        <div
          ref={formatMenuRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setFormatOpen(
                (open) => !open
              );

              setVenueOpen(false);
            }}
            className={`flex h-[52px] w-full items-center justify-between rounded-2xl border bg-white px-4 text-left text-[15px] text-slate-900 outline-none transition ${
              formatOpen
                ? "border-[#00B83F]"
                : "border-gray-200"
            }`}
            aria-haspopup="menu"
            aria-expanded={formatOpen}
          >
            <span>
              {formatLabel}
            </span>

            <ChevronDown
              size={17}
              strokeWidth={2.2}
              className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                formatOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {formatOpen && (
            <div
              role="menu"
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              {formatOptions.map(
                (option) => {
                  const isSelected =
                    matchFormat ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMatchFormat(
                          option.value
                        );

                        setFormatOpen(
                          false
                        );
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] font-medium transition ${
                        isSelected
                          ? "bg-green-50 text-[#00A638]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        {
                          option.label
                        }
                      </span>

                      {isSelected && (
                        <Check
                          size={16}
                          strokeWidth={
                            2.4
                          }
                          className="text-[#00B83F]"
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------
          LOCATION
          HOME / EITHER ONLY
      ------------------------------------------- */}

      {needsLocation && (
        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-slate-900"
          >
            Location
          </label>

          <div className="relative">
            <MapPin
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="e.g. Leeds"
              required={needsLocation}
              className="h-[52px] w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00B83F]"
            />
          </div>
        </div>
      )}

      {/* -------------------------------------------
          NOTES
      ------------------------------------------- */}

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          Notes{" "}
          <span className="font-normal text-slate-400">
            (optional)
          </span>
        </label>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          rows={4}
          placeholder="Anything the other coach should know?"
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00B83F]"
        />
      </div>

      {/* -------------------------------------------
          ERROR
      ------------------------------------------- */}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* -------------------------------------------
          SUBMIT
      ------------------------------------------- */}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? isEditing
            ? "Saving..."
            : "Publishing..."
          : isEditing
            ? "Save Changes"
            : "Publish a Match"}
      </button>
    </form>
  );
}

function MatchUpCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
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

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

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
    (firstDay.getDay() + 6) % 7;

  const daysInMonth =
    lastDay.getDate();

  const previousMonthLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

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

      if (dayNumber > daysInMonth) {
        return {
          day:
            dayNumber - daysInMonth,
          offset: 1,
        };
      }

      return {
        day: dayNumber,
        offset: 0,
      };
    }
  );

  function toDateString(date: Date) {
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

    const selectedString =
      toDateString(date);

    if (
      selectedString < todayString
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
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
          (cell, index) => {
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
              value === dateString;

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
                className="flex h-9 items-center justify-center"
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

      <div className="flex items-center justify-end border-t border-slate-100 px-4 py-3">
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

function MatchUpTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const [selectedHour, selectedMinute] =
    value && value.includes(":")
      ? value.split(":")
      : ["", ""];

  const hours = Array.from(
    { length: 24 },
    (_, index) =>
      String(index).padStart(2, "0")
  );

  const minutes = Array.from(
    { length: 12 },
    (_, index) =>
      String(index * 5).padStart(2, "0")
  );

  const [hour, setHour] =
    useState(selectedHour);

  const [minute, setMinute] =
    useState(selectedMinute);

  function chooseHour(
    nextHour: string
  ) {
    setHour(nextHour);

    if (minute) {
      onChange(
        `${nextHour}:${minute}`
      );
    }
  }

  function chooseMinute(
    nextMinute: string
  ) {
    setMinute(nextMinute);

    if (hour) {
      onChange(
        `${hour}:${nextMinute}`
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* HEADER */}

      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-center text-[13px] font-bold text-slate-950">
          Select kick-off time
        </p>
      </div>

      {/* COLUMNS */}

      <div className="grid grid-cols-2">
        {/* HOURS */}

        <div className="border-r border-slate-100">
          <p className="px-4 pb-2 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Hour
          </p>

          <div className="max-h-48 overflow-y-auto px-2 pb-2">
            {hours.map(
              (option) => {
                const isSelected =
                  hour === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      chooseHour(
                        option
                      )
                    }
                    className={`mb-1 flex h-9 w-full items-center justify-center rounded-xl text-[13px] font-semibold transition ${
                      isSelected
                        ? "bg-green-50 text-[#00A638]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* MINUTES */}

        <div>
          <p className="px-4 pb-2 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Minute
          </p>

          <div className="max-h-48 overflow-y-auto px-2 pb-2">
            {minutes.map(
              (option) => {
                const isSelected =
                  minute === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      chooseMinute(
                        option
                      )
                    }
                    className={`mb-1 flex h-9 w-full items-center justify-center rounded-xl text-[13px] font-semibold transition ${
                      isSelected
                        ? "bg-green-50 text-[#00A638]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}