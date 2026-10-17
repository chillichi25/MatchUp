import { Tabs } from "expo-router";
import {
  CircleDot,
  House,
  MessageCircle,
  PlusCircle,
  User,
} from "lucide-react-native";

import { useUnreadChatCount } from "@/features/chat/hooks/use-chat";
import { colors } from "@/theme/tokens";

export default function TabsLayout() {
  const unread = useUnreadChatCount();
  const unreadCount = unread.data ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 22,
          borderTopColor: colors.border,
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <House color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color, focused }) => (
            <CircleDot color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <PlusCircle
              color={color}
              size={22}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.brand,
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "700",
          },
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
              color={color}
              size={22}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
