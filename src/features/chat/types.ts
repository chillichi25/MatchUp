export type ChatMessage = {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
};

export type ConversationOpponent = {
  teamId: string;
  teamName: string;
  clubName: string;
  badgeUrl: string | null;
};

export type ConversationSummary = {
  conversationId: string;
  matchId: string;
  matchDate: string | null;
  kickOffTime: string | null;
  location: string | null;
  status: string;
  opponent: ConversationOpponent;
  latestMessageText: string | null;
  latestMessageAt: string | null;
  unreadCount: number;
};

export type ConversationDetail = {
  id: string;
  matchId: string;
  matchDate: string | null;
  kickOffTime: string | null;
  location: string | null;
  status: string;
  opponent: ConversationOpponent;
  messages: ChatMessage[];
  currentUserId: string;
};
