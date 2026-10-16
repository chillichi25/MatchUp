export type NotificationType =
  | "friendly_request"
  | "friendly_accepted"
  | "friendly_declined"
  | "friendly_cancelled"
  | "friendly_updated"
  | "match"
  | "match_change_proposed"
  | "match_change_accepted"
  | "match_change_declined"
  | "match_cancelled"
  | "match_result_submitted"
  | "match_result_confirmed"
  | "match_result_disputed"
  | "conversation"
  | "message"
  | "tournament"
  | "tournament_request"
  | "tournament_update"
  | string;

export type AppNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
};
