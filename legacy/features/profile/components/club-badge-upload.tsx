"use client";

import Image from "next/image";
import {
  Camera,
  Shield,
  X,
} from "lucide-react";
import {
  useRef,
  useState,
  useTransition,
} from "react";

import { uploadClubBadge } from "../actions/upload-club-badge";

type ClubBadgeUploadProps = {
  badgeUrl?: string | null;
  clubName: string;
};

export function ClubBadgeUpload({
  badgeUrl,
  clubName,
}: ClubBadgeUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [isPending, startTransition] =
    useTransition();

  function openFilePicker() {
    if (isPending) {
      return;
    }

    inputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );
  }

  function cancelSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl(null);
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function saveBadge() {
    if (!selectedFile) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "badge",
      selectedFile
    );

    startTransition(async () => {
      await uploadClubBadge(
        formData
      );

      cancelSelection();
    });
  }

  const displayedBadge =
    previewUrl ?? badgeUrl;

  return (
    <div className="flex flex-col items-center">
      {/* Hidden file input */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={
          handleFileChange
        }
      />

      {/* Clickable badge */}

      <button
        type="button"
        onClick={openFilePicker}
        disabled={isPending}
        className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Change club badge"
      >
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {displayedBadge ? (
            <Image
              src={displayedBadge}
              alt={`${clubName} badge`}
              width={80}
              height={80}
              className="h-full w-full object-contain p-2"
              unoptimized={
                Boolean(
                  previewUrl
                )
              }
            />
          ) : (
            <Shield
              size={30}
              strokeWidth={1.7}
              className="text-slate-400"
            />
          )}
        </div>

        {/* Camera badge */}

        <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-50 bg-[#00B83F] text-white shadow-sm">
          <Camera size={17} />
        </span>
      </button>

      {!previewUrl && (
        <p className="mt-3 text-xs text-slate-400">
          Tap badge to change
        </p>
      )}

      {/* Preview controls */}

      {previewUrl &&
        selectedFile && (
          <div className="mt-4 w-full max-w-xs">
            <p className="text-center text-sm font-medium text-slate-700">
              Use this club
              badge?
            </p>

            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={
                  cancelSelection
                }
                disabled={
                  isPending
                }
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveBadge
                }
                disabled={
                  isPending
                }
                className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white disabled:opacity-50"
              >
                {isPending
                  ? "Saving..."
                  : "Save Badge"}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}