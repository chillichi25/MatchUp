import { ClubAvatar } from "@/components/ui/club-avatar";
import { RealtimeNotificationBell } from "@/features/notifications/components/realtime-notification-bell";
import { TeamSwitcher } from "@/features/teams/components/team-switcher";

type TeamSwitcherTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;

  club: {
    id: string;
    name: string;
    badgeUrl: string | null;
    city: string | null;
  };
};

type DashboardHeaderProps = {
  coachName: string;
  clubName: string;
  teamName: string;
  badgeUrl?: string | null;
  unreadNotifications: number;

  activeTeamId: string;
  teams: TeamSwitcherTeam[];
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export function DashboardHeader({
  coachName,
  clubName,
  teamName,
  badgeUrl,
  unreadNotifications,
  activeTeamId,
  teams,
}: DashboardHeaderProps) {
  return (
    <header>
      {/* Greeting + Notifications */}
      <div className="flex items-start justify-between gap-4">
        <div>
  <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-950">
    {getGreeting()},
  </h1>

  <p className="mt-1 text-[25px] font-bold leading-tight tracking-tight text-[#00B83F]">
    {coachName}!
  </p>
</div>

        <div className="shrink-0 pt-1">
          <RealtimeNotificationBell
            initialUnreadCount={unreadNotifications}
          />
        </div>
      </div>

      {/* Active Club / Team */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-3.5 py-2.5 shadow-sm">
        <div className="shrink-0">
          <ClubAvatar
            clubName={clubName}
            badgeUrl={badgeUrl}
            size="md"
          />
        </div>

        <div className="min-w-0 flex-1">
          <TeamSwitcher
            activeTeamId={activeTeamId}
            clubName={clubName}
            teamName={teamName}
            teams={teams}
          />
        </div>
      </div>
    </header>
  );
}