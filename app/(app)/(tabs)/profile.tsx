import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenScroll } from "@/components/ui/screen";
import { useSession } from "@/features/auth/providers/auth-provider";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import {
  useCanManageClub,
  useMyClub,
} from "@/features/clubs/hooks/use-club-queries";
import { PlanBadge } from "@/features/subscription/components/plan-badge";
import { useCurrentPlan } from "@/features/subscription/hooks/use-subscription";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

function displayName(
  metadata: Record<string, unknown> | undefined
) {
  const full =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : "";

  const first =
    typeof metadata?.first_name === "string"
      ? metadata.first_name
      : "";

  const last =
    typeof metadata?.last_name === "string"
      ? metadata.last_name
      : "";

  return (
    full.trim() ||
    [first, last].filter(Boolean).join(" ").trim() ||
    "Coach"
  );
}

type MenuRowProps = {
  icon: ReactNode;
  label: string;
  detail?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
};

function MenuRow({
  icon,
  label,
  detail,
  onPress,
  accessibilityLabel,
}: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className="min-h-[64px] flex-row items-center gap-3 px-4 py-3.5 active:bg-slate-50"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </View>

      <Text className="flex-1 text-[14px] font-medium text-slate-900">
        {label}
      </Text>

      {detail}

      <ChevronRight
        size={18}
        color="#94A3B8"
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useSession();

  const activeTeam = useActiveTeam();
  const myClub = useMyClub();

  const clubId = myClub.data?.club_id ?? "";
  const canManage = useCanManageClub(clubId);

  const currentPlan = useCurrentPlan();
  const signOut = useSignOut();

  const [signingOut, setSigningOut] = useState(false);

  const metadata = session?.user.user_metadata as
    | Record<string, unknown>
    | undefined;

  const name = displayName(metadata);
  const team = activeTeam.data ?? null;

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
      router.replace("/login");
    } catch {
      Alert.alert(
        "Couldn't sign out",
        "Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ScreenScroll contentClassName="px-5 pb-24 pt-4">
      <Text className="text-[22px] font-bold tracking-tight text-slate-950">
        Profile
      </Text>

      <Text className="mt-1 text-[13px] text-slate-500">
        Your club, team and account.
      </Text>

      <Card className="mt-5 p-4">
        <View className="flex-row items-center gap-3">
          <Avatar
            name={name}
            size={52}
          />

          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-semibold text-slate-900">
              {name}
            </Text>

            <Text className="mt-0.5 text-[12.5px] text-slate-500">
              {session?.user.email ?? "Signed in"}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-[#F8FAFC] p-3">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Active team
          </Text>

          {activeTeam.isLoading ? (
            <Text className="mt-1 text-[13px] text-slate-500">
              Loading team…
            </Text>
          ) : team ? (
            <>
              <Text className="mt-1 text-[14px] font-semibold text-slate-900">
                {team.name}
              </Text>

              <Text className="mt-0.5 text-[12px] text-slate-500">
                {[
                  team.clubs?.name,
                  team.age_group,
                  team.match_format,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </>
          ) : (
            <Text className="mt-1 text-[13px] text-slate-500">
              No active team yet.
            </Text>
          )}
        </View>
      </Card>

      {canManage.data === true ? (
        <View className="mt-6">
          <Text className="mb-2 text-[15px] font-bold text-[#07192D]">
            Club management
          </Text>

          <Text className="mb-3 text-[13px] text-[#596B80]">
            {myClub.data?.club.name}
          </Text>

          <Card className="overflow-hidden p-0">
            <MenuRow
              icon={
                <ClipboardList
                  size={18}
                  color="#009E45"
                />
              }
              label="Join requests"
              accessibilityLabel="Review requests to join your club's teams"
              onPress={() =>
                router.push("/clubs/requests" as never)
              }
            />
          </Card>
        </View>
      ) : null}

      {myClub.isError || canManage.isError ? (
        <View className="mt-4 rounded-2xl bg-red-50 p-4">
          <Text className="text-[13px] text-red-700">
            We couldn't check your club-management access.
          </Text>

          <Pressable
            accessibilityRole="button"
            className="min-h-[44px] justify-center"
            onPress={() => {
              if (myClub.isError) {
                void myClub.refetch();
              } else {
                void canManage.refetch();
              }
            }}
          >
            <Text className="text-[14px] font-semibold text-[#009E45]">
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Card className="mt-4 overflow-hidden p-0">
        <MenuRow
          icon={
            <Sparkles
              size={18}
              color="#009E45"
            />
          }
          label="Subscription"
          detail={<PlanBadge planId={currentPlan} />}
          onPress={() =>
            router.push("/subscription" as never)
          }
          accessibilityLabel={`Subscription, current plan ${currentPlan}`}
        />

        <View className="h-px bg-slate-100" />

        <MenuRow
          icon={
            <Users
              size={18}
              color="#475569"
            />
          }
          label="My clubs and teams"
          onPress={() =>
            router.push({
              pathname: "/clubs",
              params: { mode: "add" },
            })
          }
        />

        <View className="h-px bg-slate-100" />

        <MenuRow
          icon={
            <Bell
              size={18}
              color="#475569"
            />
          }
          label="Notifications"
          onPress={() =>
            router.push("/notifications" as never)
          }
        />
      </Card>

      <Button
        variant="outline"
        className="mt-6"
        loading={signingOut}
        disabled={signingOut}
        onPress={handleSignOut}
      >
        <View className="flex-row items-center gap-2">
          <LogOut
            size={16}
            color="#DC2626"
          />

          <Text className="text-[15px] font-semibold text-red-600">
            Sign out
          </Text>
        </View>
      </Button>
    </ScreenScroll>
  );
}