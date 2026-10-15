"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { saveMatchNoteAction } from "@/app/(dashboard)/matches/[id]/note-actions";

type MatchNoteCardProps = {
  matchId: string;
  activeTeamId: string;
  initialNote?: string | null;
};

export function MatchNoteCard({
  matchId,
  activeTeamId,
  initialNote,
}: MatchNoteCardProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] =
    useState(false);

  const [note, setNote] =
    useState(initialNote ?? "");

  const [savedNote, setSavedNote] =
    useState(initialNote ?? "");

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSave() {
    const cleanNote = note.trim();

    if (!cleanNote || isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    const result =
      await saveMatchNoteAction({
        matchId,
        teamId: activeTeamId,
        note: cleanNote,
      });

    if (result.error) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setSavedNote(cleanNote);
    setNote(cleanNote);
    setIsEditing(false);
    setIsSaving(false);

    router.refresh();
  }

  function handleCancel() {
    setNote(savedNote);
    setError(null);
    setIsEditing(false);
  }

  return (
    <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">
            Match Notes
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Private to your team
          </p>
        </div>

        {!isEditing && savedNote && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsEditing(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600"
            aria-label="Edit match note"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* Display note */}

      {!isEditing && (
        <>
          {savedNote ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {savedNote}
            </p>
          ) : (
            <>
              <p className="mt-4 text-sm text-slate-500">
                No notes yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsEditing(true);
                }}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-slate-700"
              >
                Add Note
              </button>
            </>
          )}
        </>
      )}

      {/* Editor */}

      {isEditing && (
        <div className="mt-5">
          <textarea
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setError(null);
            }}
            rows={5}
            maxLength={2000}
            placeholder="Add notes about this match..."
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00B83F]"
          />

          <div className="mt-1 text-right text-xs text-slate-400">
            {note.length}/2000
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving ||
              note.trim().length === 0
            }
            className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-[#00B83F] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving
              ? "Saving..."
              : "Save Note"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}