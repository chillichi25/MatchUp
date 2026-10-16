"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CalendarDays,
  MapPin,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTournament } from "@/features/tournaments/services/update-tournament.server";

type Tournament = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;

  start_date: string;
  start_time: string | null;

  end_date: string | null;
  end_time: string | null;

  location: string;
  entry_fee: number | null;
  max_teams: number | null;
  description: string | null;
};

type EditTournamentFormProps = {
  tournament: Tournament;
};

export function EditTournamentForm({
  tournament,
}: EditTournamentFormProps) {
  const router = useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  function handleSubmit(
    formData: FormData
  ) {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await updateTournament({
          tournamentId:
            tournament.id,

          name:
            String(
              formData.get(
                "name"
              ) ?? ""
            ),

          ageGroup:
            String(
              formData.get(
                "ageGroup"
              ) ?? ""
            ),

          gender:
            String(
              formData.get(
                "gender"
              ) ?? ""
            ),

          level:
            String(
              formData.get(
                "level"
              ) ?? ""
            ),

          matchFormat:
            String(
              formData.get(
                "matchFormat"
              ) ?? ""
            ),

          startDate:
            String(
              formData.get(
                "startDate"
              ) ?? ""
            ),

          endDate:
            String(
              formData.get(
                "endDate"
              ) ?? ""
            ),

            startTime:
  String(
    formData.get(
      "startTime"
    ) ?? ""
  ),

endTime:
  String(
    formData.get(
      "endTime"
    ) ?? ""
  ),

          location:
            String(
              formData.get(
                "location"
              ) ?? ""
            ),

          entryFee:
            String(
              formData.get(
                "entryFee"
              ) ?? ""
            ),

          maxTeams:
            String(
              formData.get(
                "maxTeams"
              ) ?? ""
            ),

          description:
            String(
              formData.get(
                "description"
              ) ?? ""
            ),
        });

        toast.success("Changes saved");

router.push(
  `/tournaments/${tournament.id}/manage`
);

router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to update tournament."
        );
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mt-5 space-y-5"
    >
      {/* Validation error */}
      {errorMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-bold text-amber-800">
            Changes can&apos;t be saved
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Basic information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Basic information
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Tournament name
            </label>

            <input
              required
              name="name"
              defaultValue={
                tournament.name
              }
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#00B83F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Age group
              </label>

              <select
                required
                name="ageGroup"
                defaultValue={
                  tournament.age_group ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
              >
                <option value="">
                  Select
                </option>

                <option value="U8">
                  U8
                </option>

                <option value="U9">
                  U9
                </option>

                <option value="U10">
                  U10
                </option>

                <option value="U11">
                  U11
                </option>

                <option value="U12">
                  U12
                </option>

                <option value="U13">
                  U13
                </option>

                <option value="U14">
                  U14
                </option>

                <option value="U15">
                  U15
                </option>

                <option value="U16">
                  U16
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                required
                name="gender"
                defaultValue={
                  tournament.gender ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
              >
                <option value="">
                  Select
                </option>

                <option value="Boys">
                  Boys
                </option>

                <option value="Girls">
                  Girls
                </option>

                <option value="Mixed">
                  Mixed
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Level
              </label>

              <select
                required
                name="level"
                defaultValue={
                  tournament.level ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
              >
                <option value="">
                  Select
                </option>

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Format
              </label>

              <select
                required
                name="matchFormat"
                defaultValue={
                  tournament.match_format ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
              >
                <option value="">
                  Select
                </option>

                <option value="5v5">
                  5v5
                </option>

                <option value="7v7">
                  7v7
                </option>

                <option value="9v9">
                  9v9
                </option>

                <option value="11v11">
                  11v11
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Date & location */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-bold text-slate-900">
            Date & location
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Start date
              </label>

              <input
                required
                type="date"
                name="startDate"
                defaultValue={
                  tournament.start_date
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                End date
              </label>

              <input
                type="date"
                name="endDate"
                defaultValue={
                  tournament.end_date ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-sm font-medium text-slate-700">
      Start time
    </label>

    <input
      required
      type="time"
      name="startTime"
      defaultValue={
        tournament.start_time
          ? tournament.start_time.slice(
              0,
              5
            )
          : ""
      }
      className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-slate-700">
      End time
    </label>

    <input
      required
      type="time"
      name="endTime"
      defaultValue={
        tournament.end_time
          ? tournament.end_time.slice(
              0,
              5
            )
          : ""
      }
      className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
    />
  </div>
</div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Location
            </label>

            <div className="relative mt-2">
              <MapPin
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                required
                name="location"
                defaultValue={
                  tournament.location
                }
                className="h-12 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-[#00B83F]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Entry details */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Entry details
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Entry fee (£)
            </label>

            <input
              type="number"
              min="0"
              name="entryFee"
              defaultValue={
                tournament.entry_fee ??
                ""
              }
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Max teams
            </label>

            <input
              type="number"
              min="2"
              name="maxTeams"
              defaultValue={
                tournament.max_teams ??
                ""
              }
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="font-bold text-slate-900">
          About the tournament
        </label>

        <textarea
          name="description"
          rows={5}
          defaultValue={
            tournament.description ??
            ""
          }
          className="mt-3 w-full resize-none rounded-xl bg-[#F5F6F8] px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
        />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-bold text-white disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending
          ? "Saving..."
          : "Save Changes"}
      </button>
    </form>
  );
}