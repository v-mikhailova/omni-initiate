import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { NewMessageModal } from '@/components/contacts/NewMessageModal';
import { mockContacts, mockConnectedChannels } from '@/data/mockData';
import { Contact } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contacts, setContacts] = useState(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const handleWriteMessage = (contact: Contact) => {
    setSelectedContact(contact);
    setMessageModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    toast({
      title: 'Редактирование контакта',
      description: `Открытие редактора для ${contact.name}`,
    });
  };

  const handleDeleteContact = (contact: Contact) => {
    toast({
      title: 'Удаление контакта',
      description: `Контакт ${contact.name} будет удалён`,
      variant: 'destructive',
    });
  };

  const handleChannelSelect = (contactId: string, channelId: string) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, preferred_channel_id: channelId }
        : c
    ));
    
    const channel = mockConnectedChannels.find(ch => ch.id === channelId);
    toast({
      title: 'Канал выбран',
      description: `Дефолтный канал: ${channel?.display_name}`,
    });
  };

  const handleSendMessage = async (contactId: string, channelId: string, message: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success (in real app, this would create conversation and redirect)
    const contact = contacts.find(c => c.id === contactId);
    const channel = mockConnectedChannels.find(ch => ch.id === channelId);
    
    toast({
      title: 'Сообщение отправлено',
      description: `Диалог с ${contact?.name} через ${channel?.display_name} создан`,
    });

    // In real app: navigate('/dialogs/conversation-id')
  };

  const handleNavigate = (id: string) => {
    if (id === 'dialogs') {
      toast({
        title: 'Переход',
        description: 'Открытие раздела Диалоги',
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeItem="contacts"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleNavigate}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <ContactsTable
            contacts={contacts}
            connectedChannels={mockConnectedChannels}
            onWriteMessage={handleWriteMessage}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onChannelSelect={handleChannelSelect}
          />
        </div>
      </main>

      <NewMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        contact={selectedContact}
        connectedChannels={mockConnectedChannels}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default Index;
