import type { NotificationType } from "../types";

/**
 * Resolves the in-app destination for a notification. Returns null when the
 * notification has no meaningful destination.
 */
export function getNotificationHref(
  type: NotificationType,
  relatedId?: string | null
): string | null {
  switch (type) {
    case "friendly_request":
    case "friendly_declined":
    case "friendly_cancelled":
    case "friendly_updated":
      return relatedId ? `/friendlies/requests/${relatedId}` : "/friendlies/requests";

    case "friendly_accepted":
      return relatedId ? `/matches/${relatedId}` : "/matches";

    case "match":
      return relatedId ? `/matches/${relatedId}` : "/matches";

    case "match_change_proposed":
    case "match_change_accepted":
    case "match_change_declined":
    case "match_cancelled":
    case "match_result_submitted":
    case "match_result_confirmed":
    case "match_result_disputed":
      return relatedId ? `/matches/${relatedId}` : "/matches/upcoming";

    case "conversation":
    case "message":
      return relatedId ? `/chat/${relatedId}` : "/chat";

    case "tournament_request":
      return "/tournaments/requests";

    case "tournament_update":
      return relatedId ? `/tournaments/updates/${relatedId}` : "/tournaments";

    case "tournament":
      return relatedId ? `/tournaments/${relatedId}` : "/tournaments";

    default:
      return null;
  }
}
