// Types for Seven Tech Omnichannel Chat Center

export type ChannelType = 'telegram' | 'telegram_personal' | 'whatsapp' | 'max';

export type ChannelStatus = 'connected' | 'disconnected';

export interface ConnectedChannel {
  id: string;
  type: ChannelType;
  display_name: string;
  identifier: string; // phone number, bot username, etc.
  status: ChannelStatus;
  organization_id: string;
}

export interface ContactChannel {
  type: ChannelType;
  value: string; // telegram_id, phone, max_id
}

export interface Contact {
  id: string;
  name: string;
  contacts: ContactChannel[];
  tags: string[];
  created_at: string;
  last_message_at: string | null;
  updated_at: string;
  preferred_channel_id?: string;
}

export interface Conversation {
  id: string;
  contact_id: string;
  channel_id: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

// API Types
export interface StartConversationRequest {
  contact_id: string;
  channel_id: string;
  message_text: string;
}

export interface StartConversationResponse {
  conversation_id: string;
  message_id: string;
  status: 'success' | 'error';
  error?: string;
}
