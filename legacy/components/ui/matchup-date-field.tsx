"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { MatchUpCalendar } from "./matchup-calendar";

type MatchUpDateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
};

export function MatchUpDateField({
  id,
  label,
  value,
  onChange,
  minDate,
}: MatchUpDateFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const displayDate = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "dd/mm/yyyy";

  return (
    <div>
      <label
        id={`${id}-label`}
        className="mb-2 block text-[14px] font-medium text-slate-950"
      >
        {label}
      </label>

      <div ref={containerRef} className="relative">
        <button
          id={id}
          type="button"
          aria-labelledby={`${id}-label`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-[52px] w-full items-center rounded-2xl border bg-white px-4 text-left transition ${
            open ? "border-[#00B83F]" : "border-slate-200"
          }`}
        >
          <CalendarDays
            size={19}
            className="mr-4 shrink-0 text-slate-400"
          />

          <span
            className={`flex-1 text-[15px] ${
              value ? "text-slate-950" : "text-slate-400"
            }`}
          >
            {displayDate}
          </span>

          <ChevronDown
            size={17}
            className={`shrink-0 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2">
            <MatchUpCalendar
              value={value}
              minDate={minDate}
              onChange={(date) => {
                onChange(date);
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}