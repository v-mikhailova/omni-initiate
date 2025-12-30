import { Contact, ConnectedChannel } from '@/types/chat';

// Mock connected channels for the organization
export const mockConnectedChannels: ConnectedChannel[] = [
  {
    id: 'ch-1',
    type: 'telegram',
    display_name: 'Telegram Bot @SevenTechCC_bot',
    identifier: '@SevenTechCC_bot',
    status: 'connected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-2',
    type: 'telegram',
    display_name: 'Telegram Bot @SupportBot',
    identifier: '@SupportBot',
    status: 'connected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-3',
    type: 'whatsapp',
    display_name: 'WhatsApp +7 (999) 123-4169',
    identifier: '+79991234169',
    status: 'connected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-4',
    type: 'whatsapp',
    display_name: 'WhatsApp +7 (952) 224-5854',
    identifier: '+79522245854',
    status: 'connected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-5',
    type: 'whatsapp',
    display_name: 'WhatsApp +7 (900) 555-1234',
    identifier: '+79005551234',
    status: 'disconnected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-6',
    type: 'max',
    display_name: 'MAX Bot #MainSupport',
    identifier: 'max_bot_001',
    status: 'connected',
    organization_id: 'org-1',
  },
  {
    id: 'ch-7',
    type: 'telegram_personal',
    display_name: 'Telegram Personal +7 (952) 224-5854',
    identifier: '+79522245854',
    status: 'connected',
    organization_id: 'org-1',
  },
];

// Mock contacts
export const mockContacts: Contact[] = [
  {
    id: 'c-0',
    name: 'Алексей Жмылев',
    contacts: [
      { type: 'whatsapp', value: '+79263433334' },
      { type: 'telegram', value: '' },
    ],
    tags: [],
    created_at: '2025-12-29',
    last_message_at: null,
    updated_at: '2025-12-29',
    preferred_channel_id: 'ch-1',
  },
  {
    id: 'c-00',
    name: 'Дмитрий Рикман',
    contacts: [
      { type: 'telegram', value: '+79859578792' },
    ],
    tags: [],
    created_at: '2025-12-29',
    last_message_at: null,
    updated_at: '2025-12-29',
    preferred_channel_id: 'ch-1',
  },
  {
    id: 'c-1',
    name: 'Нет данных',
    contacts: [
      { type: 'telegram', value: '513094169' },
    ],
    tags: [],
    created_at: '2025-12-08',
    last_message_at: '2025-12-08',
    updated_at: '2025-12-08',
    preferred_channel_id: 'ch-1',
  },
  {
    id: 'c-2',
    name: 'cc cxxcvcf',
    contacts: [
      { type: 'max', value: 'a9b504ef-95c7-4cde-af5f-859f31b5ffa0' },
    ],
    tags: [],
    created_at: '2025-12-16',
    last_message_at: '2025-12-16',
    updated_at: '2025-12-29',
  },
  {
    id: 'c-3',
    name: 'Виктория Михайлова',
    contacts: [
      { type: 'whatsapp', value: '+79522245854' },
      { type: 'telegram', value: '513094169' },
    ],
    tags: ['Тест'],
    created_at: '2025-12-29',
    last_message_at: null,
    updated_at: '2025-12-29',
  },
  {
    id: 'c-4',
    name: 'Рикман',
    contacts: [
      { type: 'telegram', value: '362032427' },
      { type: 'telegram_personal', value: '+79522245854' },
    ],
    tags: [],
    created_at: '2025-11-18',
    last_message_at: '2025-11-18',
    updated_at: '2025-12-02',
  },
  {
    id: 'c-5',
    name: 'Симкин Александр',
    contacts: [
      { type: 'whatsapp', value: '+79196200250' },
    ],
    tags: ['VIP'],
    created_at: '2025-11-17',
    last_message_at: '2025-12-25',
    updated_at: '2025-12-23',
    preferred_channel_id: 'ch-3',
  },
  {
    id: 'c-6',
    name: 'Елена Петрова',
    contacts: [
      { type: 'whatsapp', value: '+79161234567' },
      { type: 'telegram', value: '987654321' },
      { type: 'telegram_personal', value: '+79522245854' },
    ],
    tags: ['Важный', 'B2B'],
    created_at: '2025-10-15',
    last_message_at: '2025-12-27',
    updated_at: '2025-12-27',
  },
  {
    id: 'c-7',
    name: 'ООО "Технологии"',
    contacts: [
      { type: 'max', value: 'tech_company_001' },
    ],
    tags: ['Корпоративный'],
    created_at: '2025-09-01',
    last_message_at: '2025-12-20',
    updated_at: '2025-12-20',
  },
];

// Helper to get available channels for a contact
export function getAvailableChannelsForContact(
  contact: Contact,
  connectedChannels: ConnectedChannel[]
): ConnectedChannel[] {
  const contactChannelTypes = contact.contacts.map(c => c.type);
  
  return connectedChannels.filter(
    channel => 
      contactChannelTypes.includes(channel.type) && 
      channel.status === 'connected'
  );
}

// Helper to get channels by type
export function getChannelsByType(
  type: string,
  connectedChannels: ConnectedChannel[]
): ConnectedChannel[] {
  return connectedChannels.filter(ch => ch.type === type);
}
