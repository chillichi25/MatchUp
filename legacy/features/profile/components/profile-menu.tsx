"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Building2,
  ChevronRight,
  History,
  Menu,
  Settings,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";

export function ProfileMenu() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  return (
    <>
      {/* Menu button */}
      <button
        type="button"
        onClick={() =>
          setIsOpen(true)
        }
        aria-label="Open profile menu"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm"
      >
        <Menu size={23} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setIsOpen(false)
            }
            className="absolute inset-0 bg-black/30"
          />

          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-gray-50 px-5 pb-10 pt-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Menu
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your MatchUp account
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Manage */}
            <section className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Manage
              </p>

              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <MenuLink
                  href="/tournaments/my"
                  icon={
                    <Trophy
                      size={20}
                      className="text-violet-600"
                    />
                  }
                  title="My Tournaments"
                  description="Manage tournaments you organise"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />

                <Divider />

                <MenuLink
                  href="/profile/club/edit"
                  icon={
                    <Building2
                      size={20}
                      className="text-blue-600"
                    />
                  }
                  title="My Club"
                  description="Club details and location"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />

                <Divider />

                <MenuLink
                  href="/profile"
                  icon={
                    <Users
                      size={20}
                      className="text-[#00B83F]"
                    />
                  }
                  title="My Team"
                  description="View your active team"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />
              </div>
            </section>

            {/* Activity */}
            <section className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Activity
              </p>

              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <MenuLink
                  href="/matches/history"
                  icon={
                    <History
                      size={20}
                      className="text-slate-600"
                    />
                  }
                  title="Match History"
                  description="View completed matches"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />

                <Divider />

                <MenuLink
                  href="/tournaments/requests"
                  icon={
                    <Shield
                      size={20}
                      className="text-amber-600"
                    />
                  }
                  title="Tournament Requests"
                  description="Manage tournament requests"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />
              </div>
            </section>

            {/* Account */}
            <section className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account
              </p>

              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <MenuLink
                  href="/settings"
                  icon={
                    <Settings
                      size={20}
                      className="text-slate-600"
                    />
                  }
                  title="Settings"
                  description="Account preferences"
                  onClick={() =>
                    setIsOpen(false)
                  }
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

type MenuLinkProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

function MenuLink({
  href,
  icon,
  title,
  description,
  onClick,
}: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-300"
      />
    </Link>
  );
}

function Divider() {
  return (
    <div className="ml-[68px] border-t border-gray-100" />
  );
}