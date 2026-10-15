"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MatchUpCalendarProps = {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function MatchUpCalendar({
  value,
  onChange,
  minDate,
}: MatchUpCalendarProps) {
  const today = new Date();

  const todayString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);

  const minimumDate =
    minDate && minDate > todayString ? minDate : todayString;

  const selected = value
    ? new Date(`${value}T00:00:00`)
    : null;

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      selected?.getFullYear() ?? today.getFullYear(),
      selected?.getMonth() ?? today.getMonth(),
      1
    )
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthLabel = visibleMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const previousMonthLastDay = new Date(
    year,
    month,
    0
  ).getDate();

  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1) {
      return {
        day: previousMonthLastDay + dayNumber,
        offset: -1,
      };
    }

    if (dayNumber > daysInMonth) {
      return {
        day: dayNumber - daysInMonth,
        offset: 1,
      };
    }

    return {
      day: dayNumber,
      offset: 0,
    };
  });

  function changeMonth(offset: number) {
    setVisibleMonth(
      new Date(year, month + offset, 1)
    );
  }

  function selectDate(day: number, offset: number) {
    const date = new Date(year, month + offset, day);
    const selectedString = toDateString(date);

    if (selectedString < minimumDate) return;

    onChange(selectedString);
  }

  function goToToday() {
    const nextDate = minimumDate;

    const date = new Date(`${nextDate}T00:00:00`);

    setVisibleMonth(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );

    onChange(nextDate);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* MONTH HEADER */}

      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition active:bg-slate-100"
        >
          <ChevronLeft size={19} strokeWidth={2} />
        </button>

        <p className="text-[14px] font-bold text-slate-950">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition active:bg-slate-100"
        >
          <ChevronRight size={19} strokeWidth={2} />
        </button>
      </div>

      {/* WEEKDAYS */}

      <div className="grid grid-cols-7 px-3">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
          (day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-[10px] font-semibold text-slate-400"
            >
              {day}
            </div>
          )
        )}
      </div>

      {/* DAYS */}

      <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
        {cells.map((cell, index) => {
          const cellDate = new Date(
            year,
            month + cell.offset,
            cell.day
          );

          const dateString = toDateString(cellDate);

          const isSelected = value === dateString;
          const isToday = todayString === dateString;
          const isPast = dateString < minimumDate;
          const isOutside = cell.offset !== 0;

          return (
            <button
              key={`${dateString}-${index}`}
              type="button"
              disabled={isPast}
              onClick={() =>
                selectDate(cell.day, cell.offset)
              }
              aria-label={cellDate.toLocaleDateString(
                "en-GB",
                { dateStyle: "full" }
              )}
              aria-pressed={isSelected}
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
        })}
      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-end border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={goToToday}
          className="text-[12px] font-bold text-[#00A638]"
        >
          {minimumDate > todayString ? "Earliest date" : "Today"}
        </button>
      </div>
    </div>
  );
}