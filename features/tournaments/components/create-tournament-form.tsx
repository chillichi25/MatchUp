
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ArrowLeft,
  MapPin,
} from "lucide-react";

import { TournamentSelect } from "@/features/tournaments/components/tournament-select";
import { MatchUpDateField } from "@/components/ui/matchup-date-field";
import { createTournament } from "@/features/tournaments/services/create-tournament.server";

type TournamentFormValues = {
  name: string;
  ageGroup: string;
  gender: string;
  level: string;
  matchFormat: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  entryFee: string;
  maxTeams: string;
  description: string;
};

function getLondonDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getLondonTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function nextDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CreateTournamentForm() {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);

  const [form, setForm] = useState<TournamentFormValues>({
    name: "",
    ageGroup: "",
    gender: "",
    level: "",
    matchFormat: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    entryFee: "",
    maxTeams: "",
    description: "",
  });

  function updateField(
    field: keyof TournamentFormValues,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleMultiDayChange(checked: boolean) {
    setIsMultiDay(checked);

    if (!checked) {
      setForm((current) => ({
        ...current,
        endDate: "",
      }));
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    // REQUIRED DETAILS

    if (
      !form.name.trim() ||
      !form.ageGroup ||
      !form.gender ||
      !form.level ||
      !form.matchFormat
    ) {
      setErrorMessage(
        "Please complete all tournament details."
      );
      return;
    }

    if (!form.startDate) {
      setErrorMessage(
        "Please select a tournament date."
      );
      return;
    }

    if (!form.startTime || !form.endTime) {
      setErrorMessage(
        "Please select the tournament start and end times."
      );
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage(
        "Please enter the tournament location."
      );
      return;
    }

    if (
      form.entryFee.trim() === "" ||
      !Number.isFinite(Number(form.entryFee)) ||
      Number(form.entryFee) < 0
    ) {
      setErrorMessage(
        "Please enter a valid entry fee."
      );
      return;
    }

    if (
      !Number.isInteger(Number(form.maxTeams)) ||
      Number(form.maxTeams) < 2
    ) {
      setErrorMessage(
        "Please enter at least two teams."
      );
      return;
    }

    // FUTURE DATE VALIDATION

    const londonDate = getLondonDate();
    const londonTime = getLondonTime();

    if (
      form.startDate < londonDate ||
      (form.startDate === londonDate &&
        form.startTime <= londonTime)
    ) {
      setErrorMessage(
        "Please choose a future tournament start date and time."
      );
      return;
    }

    const finalEndDate = isMultiDay
      ? form.endDate
      : form.startDate;

    // MULTI-DAY VALIDATION

    if (isMultiDay) {
      if (!form.endDate) {
        setErrorMessage(
          "Please choose an end date for the tournament."
        );
        return;
      }

      if (form.endDate <= form.startDate) {
        setErrorMessage(
          "The end date must be after the start date."
        );
        return;
      }
    }

    // SINGLE-DAY TIME VALIDATION

    if (
      !isMultiDay &&
      form.endTime <= form.startTime
    ) {
      setErrorMessage(
        "The end time must be after the start time."
      );
      return;
    }

    // PUBLISH TOURNAMENT

    startTransition(async () => {
      try {
        const tournament = await createTournament({
          name: form.name.trim(),
          ageGroup: form.ageGroup,
          gender: form.gender,
          level: form.level,
          matchFormat: form.matchFormat,
          startDate: form.startDate,
          startTime: form.startTime,
          endDate: finalEndDate,
          endTime: form.endTime,
          location: form.location.trim(),
          entryFee: form.entryFee,
          maxTeams: form.maxTeams,
          description: form.description,
        });

        toast.success("Tournament created");

        router.replace(
          `/tournaments/${tournament.id}`
        );
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The tournament could not be published."
        );
      }
    });
  }

  const inputClass =
    "mt-2 h-[52px] w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#00B83F]";

  const labelClass =
    "block text-[14px] font-medium text-slate-950";

  return (
    <>
      {/* HEADER */}

      <header className="relative flex h-11 items-center justify-center">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
        >
          <ArrowLeft size={21} strokeWidth={2} />
        </Link>

        <h1 className="text-[18px] font-bold text-slate-950">
          Create Tournament
        </h1>
      </header>

      {/* INTRODUCTION */}

      <div className="mt-10">
        <h2 className="text-[25px] font-bold leading-tight tracking-tight text-slate-950">
          Organise your tournament
        </h2>

        <p className="mt-2 text-[13px] leading-5 text-slate-500">
          Add the details and invite teams to join.
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-7"
      >
        {/* BASIC INFORMATION */}

        <section>
          <h3 className="mb-5 text-[16px] font-bold text-slate-950">
            Basic information
          </h3>

          <div className="space-y-5">
            {/* TOURNAMENT NAME */}

            <div>
              <label
                htmlFor="tournamentName"
                className={labelClass}
              >
                Tournament name
              </label>

              <input
                id="tournamentName"
                required
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="e.g. Leeds Summer Cup"
                className={inputClass}
              />
            </div>

            {/* AGE GROUP AND GENDER */}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="ageGroup"
                  className={labelClass}
                >
                  Age group
                </label>

                <TournamentSelect
                  id="ageGroup"
                  value={form.ageGroup}
                  onChange={(value) =>
                    updateField("ageGroup", value)
                  }
                  options={[
                    { value: "U8", label: "U8" },
                    { value: "U9", label: "U9" },
                    { value: "U10", label: "U10" },
                    { value: "U11", label: "U11" },
                    { value: "U12", label: "U12" },
                    { value: "U13", label: "U13" },
                    { value: "U14", label: "U14" },
                    { value: "U15", label: "U15" },
                    { value: "U16", label: "U16" },
                  ]}
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className={labelClass}
                >
                  Gender
                </label>

                <TournamentSelect
                  id="gender"
                  value={form.gender}
                  onChange={(value) =>
                    updateField("gender", value)
                  }
                  options={[
                    { value: "Boys", label: "Boys" },
                    { value: "Girls", label: "Girls" },
                    { value: "Mixed", label: "Mixed" },
                  ]}
                />
              </div>
            </div>

            {/* LEVEL AND FORMAT */}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="level"
                  className={labelClass}
                >
                  Level
                </label>

                <TournamentSelect
                  id="level"
                  value={form.level}
                  onChange={(value) =>
                    updateField("level", value)
                  }
                  options={[
                    {
                      value: "Beginner",
                      label: "Beginner",
                    },
                    {
                      value: "Intermediate",
                      label: "Intermediate",
                    },
                    {
                      value: "Advanced",
                      label: "Advanced",
                    },
                  ]}
                />
              </div>

              <div>
                <label
                  htmlFor="matchFormat"
                  className={labelClass}
                >
                  Format
                </label>

                <TournamentSelect
                  id="matchFormat"
                  value={form.matchFormat}
                  onChange={(value) =>
                    updateField("matchFormat", value)
                  }
                  options={[
                    { value: "5v5", label: "5v5" },
                    { value: "7v7", label: "7v7" },
                    { value: "9v9", label: "9v9" },
                    { value: "11v11", label: "11v11" },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* DATE AND LOCATION */}

        <section>
          <h3 className="mb-5 text-[16px] font-bold text-slate-950">
            Date &amp; location
          </h3>

          <div className="space-y-5">
            {/* SINGLE-DAY DATE */}

            {!isMultiDay && (
              <MatchUpDateField
                id="startDate"
                label="Tournament date"
                value={form.startDate}
                onChange={(date) =>
                  updateField("startDate", date)
                }
              />
            )}

            {/* MULTI-DAY DATES */}

            {isMultiDay && (
              <div className="space-y-4">
                <MatchUpDateField
                  id="startDate"
                  label="Start date"
                  value={form.startDate}
                  onChange={(date) => {
                    setForm((current) => ({
                      ...current,
                      startDate: date,
                      endDate:
                        current.endDate &&
                        current.endDate <= date
                          ? ""
                          : current.endDate,
                    }));
                  }}
                />

                <MatchUpDateField
                  id="endDate"
                  label="End date"
                  value={form.endDate}
                  minDate={
                    form.startDate
                      ? nextDate(form.startDate)
                      : undefined
                  }
                  onChange={(date) =>
                    updateField("endDate", date)
                  }
                />
              </div>
            )}

            {/* START AND END TIMES */}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="startTime"
                  className={labelClass}
                >
                  Start time
                </label>

                <input
                  id="startTime"
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    updateField(
                      "startTime",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className={labelClass}
                >
                  End time
                </label>

                <input
                  id="endTime"
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField(
                      "endTime",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* MULTI-DAY TOGGLE */}

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="pr-4">
                <p className="text-[14px] font-semibold text-slate-950">
                  Multi-day tournament
                </p>

                <p className="mt-1 text-[12px] leading-[18px] text-slate-500">
                  Turn this on if the tournament runs
                  across more than one day.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={(event) =>
                  handleMultiDayChange(
                    event.target.checked
                  )
                }
                className="h-5 w-5 shrink-0 accent-[#00B83F]"
              />
            </label>

            {/* LOCATION */}

            <div>
              <label
                htmlFor="location"
                className={labelClass}
              >
                Location
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="location"
                  required
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Leeds"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ENTRY DETAILS */}

        <section>
          <h3 className="mb-5 text-[16px] font-bold text-slate-950">
            Entry details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="entryFee"
                className={labelClass}
              >
                Entry fee (£)
              </label>

              <input
                id="entryFee"
                required
                type="number"
                min="0"
                step="0.01"
                value={form.entryFee}
                onChange={(event) =>
                  updateField(
                    "entryFee",
                    event.target.value
                  )
                }
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="maxTeams"
                className={labelClass}
              >
                Max teams
              </label>

              <input
                id="maxTeams"
                required
                type="number"
                min="2"
                step="1"
                value={form.maxTeams}
                onChange={(event) =>
                  updateField(
                    "maxTeams",
                    event.target.value
                  )
                }
                placeholder="16"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}

        <section>
          <label
            htmlFor="description"
            className={labelClass}
          >
            About the tournament{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <textarea
            id="description"
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={4}
            placeholder="Tell coaches about the tournament, facilities, prizes or anything else they should know."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[14px] leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#00B83F]"
          />
        </section>

        {/* ERROR */}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            {errorMessage}
          </div>
        )}

        {/* PUBLISH */}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[15px] font-bold text-white transition hover:bg-[#009F37] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Publishing..."
            : "Publish Tournament"}
        </button>
      </form>
    </>
  );
}
