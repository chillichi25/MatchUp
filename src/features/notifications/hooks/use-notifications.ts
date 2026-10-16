import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service";

export const NOTIFICATION_QUERY_KEYS = {
  list: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list,
    queryFn: getNotifications,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: getUnreadNotificationCount,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.list,
      });
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.list,
      });
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
}
