"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Check,
  ChevronDown,
} from "lucide-react";

const sortOptions = [
  {
    value: "soonest",
    label: "Soonest",
  },
  {
    value: "nearest",
    label: "Nearest",
  },
  {
    value: "newest",
    label: "Newest",
  },
];

export function FriendlySort() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [isOpen, setIsOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const currentSort =
    searchParams.get("sort") ??
    "soonest";

  const currentLabel =
    sortOptions.find(
      (option) =>
        option.value === currentSort
    )?.label ?? "Soonest";

  function handleSort(sort: string) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (sort === "soonest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    params.set(
      "type",
      "friendlies"
    );

    setIsOpen(false);

    router.push(
      `/matches?${params.toString()}`
    );
  }

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
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

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        className="flex h-8 items-center gap-1 rounded-lg px-1.5 text-[12px] font-semibold text-[#00A638] transition active:bg-green-50"
        aria-label="Sort friendlies"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{currentLabel}</span>

        <ChevronDown
          size={14}
          strokeWidth={2.2}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[132px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {sortOptions.map(
            (option) => {
              const isSelected =
                currentSort ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleSort(
                      option.value
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold transition ${
                    isSelected
                      ? "bg-green-50 text-[#00A638]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={15}
                      strokeWidth={2.4}
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
  );
}