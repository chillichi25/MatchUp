import { Check, ChevronsUpDown, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useActiveTeam, useAvailableTeams, useSetActiveTeam } from "../hooks/use-teams";

export function TeamSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: activeTeam, isLoading } = useActiveTeam();
  const { data: availableTeams = [] } = useAvailableTeams();
  const setActiveTeam = useSetActiveTeam();

  if (isLoading) {
    return <View className="h-14 rounded-2xl bg-slate-100" />;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch team"
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
      >
        <Avatar
          uri={activeTeam?.clubs?.badge_url ?? null}
          name={activeTeam?.clubs?.name ?? activeTeam?.name ?? "Team"}
          size={40}
        />

        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-semibold text-slate-900">
            {activeTeam?.name ?? "No active team"}
          </Text>
          <Text className="text-[12px] text-slate-500">
            {activeTeam?.clubs?.name ?? "Select a team to continue"}
          </Text>
        </View>

        <ChevronsUpDown size={18} color="#94A3B8" strokeWidth={2} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-3xl bg-white pb-8 pt-3">
            <View className="mb-3 items-center">
              <View className="h-1 w-10 rounded-full bg-slate-200" />
            </View>

            <Text className="px-5 pb-3 text-[15px] font-semibold text-slate-900">
              Your teams
            </Text>

            <View className="px-3">
              {availableTeams.map((team) => {
                const isActive = team.id === activeTeam?.id;

                return (
                  <Pressable
                    key={team.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    disabled={setActiveTeam.isPending}
                    onPress={async () => {
                      if (isActive) {
                        setOpen(false);
                        return;
                      }

                      await setActiveTeam.mutateAsync(team.id);
                      setOpen(false);
                      router.replace("/dashboard");
                    }}
                    className="flex-row items-center gap-3 rounded-2xl px-3 py-3"
                  >
                    <Avatar
                      uri={team.clubs?.badge_url ?? null}
                      name={team.clubs?.name ?? team.name}
                      size={38}
                    />

                    <View className="min-w-0 flex-1">
                      <Text className="text-[14px] font-semibold text-slate-900">
                        {team.name}
                      </Text>
                      <Text className="text-[12px] text-slate-500">
                        {team.clubs?.name}
                      </Text>
                    </View>

                    {isActive ? (
                      <Badge tone="brand">Active</Badge>
                    ) : (
                      <Check size={18} color="#E2E8F0" strokeWidth={2} />
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push("/clubs");
                }}
                className="mt-1 flex-row items-center gap-3 rounded-2xl px-3 py-3"
              >
                <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-[#E4F9EB]">
                  <Plus size={18} color="#00B83F" strokeWidth={2.2} />
                </View>
                <Text className="text-[14px] font-semibold text-[#00B83F]">
                  Join or create a club
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
