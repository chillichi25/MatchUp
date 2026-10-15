export type ChatMessage = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  match_id: string;
  created_at: string;
  messages: ChatMessage[];
};