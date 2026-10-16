"use server";

import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";

export async function getMyConversations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // My team

  // Active team
const team = await getActiveTeam();

if (!team) {
  return [];
}

  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      kick_off_time,
      location,

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
    `)
    .or(
      `home_team_id.eq.${team.id},away_team_id.eq.${team.id}`
    );

  if (error) {
    throw error;
  }

  const conversations = (matches ?? []).map((match) => {
    const home = match.home as any;
    const away = match.away as any;

    const myTeam =
      home.id === team.id
        ? home
        : away;

    const opponent =
      home.id === team.id
        ? away
        : home;

    const chat = Array.isArray(
      match.match_conversations
    )
      ? match.match_conversations[0]
      : match.match_conversations;

    const messages =
      chat?.match_messages ?? [];

    const latestMessage = [...messages].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

    const unreadCount = messages.filter(
  (message: any) =>
    message.sender_id !== user.id &&
    !message.read_at
).length;

    return {
      ...match,
      myTeam,
      opponent,
      latestMessageAt:
        latestMessage?.created_at ?? null,
        unreadCount,
    };
  });

  // Most recently active conversation first
  conversations.sort((a, b) => {
    const aTime = a.latestMessageAt
      ? new Date(a.latestMessageAt).getTime()
      : 0;

    const bTime = b.latestMessageAt
      ? new Date(b.latestMessageAt).getTime()
      : 0;

    return bTime - aTime;
  });

  return conversations;
}

export async function getUnreadChatCount() {
  const conversations =
    await getMyConversations();

  return conversations.reduce(
    (total, conversation) =>
      total +
      (conversation.unreadCount ?? 0),
    0
  );
}

export async function getConversation(
  conversationId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the conversation.
  // RLS ensures only an approved member of one of the match teams can see it.
  const { data: conversation, error: conversationError } =
    await supabase
      .from("match_conversations")
      .select(`
        id,
        match_id,

        match_messages (
          id,
          sender_id,
          message,
          created_at
        )
      `)
      .eq("id", conversationId)
      .maybeSingle();

  if (conversationError) {
    console.error(
      "GET CONVERSATION ERROR:",
      conversationError,
    );
    notFound();
  }

  if (!conversation) {
    notFound();
  }

  // Get the match context through the secure RPC.
  const { data: matchRows, error: matchError } =
    await supabase.rpc("get_chat_match", {
      p_conversation_id: conversationId,
    });

  if (matchError) {
    console.error(
      "GET CHAT MATCH ERROR:",
      matchError,
    );
    notFound();
  }

  const match = matchRows?.[0];

  if (!match) {
    notFound();
  }

  // Work out which of the two match teams this user belongs to.
  const isHomeMember = await supabase.rpc(
    "is_approved_team_member",
    {
      p_team_id: match.home_team_id,
    },
  );

  const isAwayMember = await supabase.rpc(
    "is_approved_team_member",
    {
      p_team_id: match.away_team_id,
    },
  );

  if (isHomeMember.error || isAwayMember.error) {
    console.error(
      "CHECK CHAT TEAM MEMBERSHIP ERROR:",
      isHomeMember.error ?? isAwayMember.error,
    );
    notFound();
  }

  if (!isHomeMember.data && !isAwayMember.data) {
    notFound();
  }

  const opponentTeamId = isHomeMember.data
    ? match.away_team_id
    : match.home_team_id;

  // Fetch only the opponent team information needed by the chat header.
  const { data: opponent, error: opponentError } =
    await supabase
      .from("teams")
      .select(`
        id,
        name,
        clubs (
          name,
          badge_url
        )
      `)
      .eq("id", opponentTeamId)
      .maybeSingle();

  if (opponentError || !opponent) {
    console.error(
      "GET CHAT OPPONENT ERROR:",
      opponentError,
    );
    notFound();
  }

  return {
  id: conversation.id,
  matchId: match.match_id,
  matchDate: match.match_date,
  kickOffTime: match.kick_off_time,
  location: match.location,
  status: match.status,
  opponent,
  messages: conversation.match_messages ?? [],
};
}