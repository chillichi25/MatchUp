import { supabase } from "@/lib/supabase/client";

import { getActiveTeam } from "@/features/teams/services/active-team.service";

import type {
  ChatMessage,
  ConversationDetail,
  ConversationOpponent,
  ConversationSummary,
} from "../types";

type RawClub = { name: string; badge_url: string | null };

type RawTeam = {
  id: string;
  name: string;
  clubs: RawClub | RawClub[] | null;
};

type RawMessage = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

type RawConversation = {
  id: string;
  match_id: string;
  match_messages: RawMessage[] | null;
};

type RawMatchRow = {
  id: string;
  match_date: string | null;
  kick_off_time: string | null;
  location: string | null;
  status: string | null;
  home: RawTeam | RawTeam[] | null;
  away: RawTeam | RawTeam[] | null;
  match_conversations: RawConversation | RawConversation[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toOpponent(team: RawTeam | null): ConversationOpponent {
  const club = first(team?.clubs);

  return {
    teamId: team?.id ?? "",
    teamName: team?.name ?? "Team",
    clubName: club?.name ?? "Opponent",
    badgeUrl: club?.badge_url ?? null,
  };
}

export async function getMyConversations(): Promise<ConversationSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_date,
      kick_off_time,
      location,
      status,

      home:home_team_id (
        id,
        name,
        clubs (
          name,
          badge_url
        )
      ),

      away:away_team_id (
        id,
        name,
        clubs (
          name,
          badge_url
        )
      ),

      match_conversations (
        id,

        match_messages (
          id,
          sender_id,
          message,
          created_at,
          read_at
        )
      )
    `
    )
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

  if (error) {
    console.error("MY CONVERSATIONS ERROR:", error);
    return [];
  }

  const conversations = ((data ?? []) as unknown as RawMatchRow[])
    .map((match): ConversationSummary | null => {
      const home = first(match.home);
      const away = first(match.away);

      if (!home || !away) {
        return null;
      }

      const opponent = home.id === team.id ? away : home;
      const chat = first(match.match_conversations);

      if (!chat?.id) {
        return null;
      }

      const messages = chat.match_messages ?? [];

      const latestMessage = [...messages].sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      )[0];

      const unreadCount = messages.filter(
        (message) => message.sender_id !== user.id && !message.read_at
      ).length;

      return {
        conversationId: chat.id,
        matchId: match.id,
        matchDate: match.match_date,
        kickOffTime: match.kick_off_time,
        location: match.location,
        status: match.status ?? "scheduled",
        opponent: toOpponent(opponent),
        latestMessageText: latestMessage?.message ?? null,
        latestMessageAt: latestMessage?.created_at ?? null,
        unreadCount,
      };
    })
    .filter((row): row is ConversationSummary => row !== null);

  conversations.sort((a, b) =>
    (b.latestMessageAt ?? "").localeCompare(a.latestMessageAt ?? "")
  );

  return conversations;
}

export async function getUnreadChatCount(): Promise<number> {
  const conversations = await getMyConversations();

  return conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );
}

type RawChatMatch = {
  match_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string | null;
  kick_off_time: string | null;
  location: string | null;
  status: string | null;
};

export async function getConversation(
  conversationId: string
): Promise<ConversationDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("match_conversations")
    .select(
      `
      id,
      match_id,

      match_messages (
        id,
        sender_id,
        message,
        created_at
      )
    `
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    console.error("GET CONVERSATION ERROR:", conversationError);
    return null;
  }

  const { data: matchRows, error: matchError } = await supabase.rpc(
    "get_chat_match",
    { p_conversation_id: conversationId }
  );

  const match = (matchRows ?? [])[0] as RawChatMatch | undefined;

  if (matchError || !match) {
    console.error("GET CHAT MATCH ERROR:", matchError);
    return null;
  }

  const [isHomeMember, isAwayMember] = await Promise.all([
    supabase.rpc("is_approved_team_member", {
      p_team_id: match.home_team_id,
    }),
    supabase.rpc("is_approved_team_member", {
      p_team_id: match.away_team_id,
    }),
  ]);

  if (isHomeMember.error || isAwayMember.error) {
    console.error(
      "CHECK CHAT TEAM MEMBERSHIP ERROR:",
      isHomeMember.error ?? isAwayMember.error
    );
    return null;
  }

  if (!isHomeMember.data && !isAwayMember.data) {
    return null;
  }

  const opponentTeamId = isHomeMember.data
    ? match.away_team_id
    : match.home_team_id;

  const { data: opponent, error: opponentError } = await supabase
    .from("teams")
    .select(
      `
      id,
      name,
      clubs (
        name,
        badge_url
      )
    `
    )
    .eq("id", opponentTeamId)
    .maybeSingle();

  if (opponentError || !opponent) {
    console.error("GET CHAT OPPONENT ERROR:", opponentError);
    return null;
  }

  const rawMessages = (
    (conversation as unknown as {
      match_messages: RawMessage[] | null;
    }).match_messages ?? []
  )
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const messages: ChatMessage[] = rawMessages.map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    message: message.message,
    createdAt: message.created_at,
  }));

  return {
    id: conversation.id,
    matchId: match.match_id,
    matchDate: match.match_date,
    kickOffTime: match.kick_off_time,
    location: match.location,
    status: match.status ?? "scheduled",
    opponent: toOpponent(opponent as unknown as RawTeam),
    messages,
    currentUserId: user.id,
  };
}
