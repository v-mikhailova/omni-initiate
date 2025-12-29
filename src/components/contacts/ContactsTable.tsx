import { useState, useMemo } from 'react';
import { 
  MoreHorizontal, 
  Send, 
  Pencil, 
  Trash2, 
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChannelSelector } from './ChannelSelector';
import { Contact, ConnectedChannel, ChannelType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ContactsTableProps {
  contacts: Contact[];
  connectedChannels: ConnectedChannel[];
  onWriteMessage: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onChannelSelect: (contactId: string, channelId: string) => void;
}

export function ContactsTable({
  contacts,
  connectedChannels,
  onWriteMessage,
  onEditContact,
  onDeleteContact,
  onChannelSelect,
}: ContactsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.contacts.some(contact => contact.value.toLowerCase().includes(query)) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') {
        return a.name.localeCompare(b.name) * modifier;
      }
      if (sortField === 'created_at') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier;
      }
      if (sortField === 'last_message_at') {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return (aTime - bTime) * modifier;
      }
      return 0;
    });
  }, [contacts, searchQuery, sortField, sortDirection]);

  const getAvailableTypesForContact = (contact: Contact): ChannelType[] => {
    const contactTypes = contact.contacts.map(c => c.type);
    const connectedTypes = new Set(
      connectedChannels
        .filter(ch => ch.status === 'connected')
        .map(ch => ch.type)
    );
    return contactTypes.filter(t => connectedTypes.has(t));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderContactInfo = (contact: Contact) => {
    return (
      <div className="flex flex-wrap gap-2">
        {contact.contacts.map((c, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            {c.type === 'telegram' && <Send className="w-3 h-3 text-telegram" />}
            {c.type === 'telegram_personal' && <Send className="w-3 h-3 text-telegram-personal" />}
            {c.type === 'whatsapp' && <Phone className="w-3 h-3 text-whatsapp" />}
            {c.type === 'max' && <Mail className="w-3 h-3 text-max" />}
            <span className="font-mono text-xs">{c.value}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Профили контактов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Контакты, с кем уже ведётся или можно завести Диалог
            <span className="ml-2 text-xs">
              Количество контактных профилей: {contacts.length}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по контакту или имени"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[280px]"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Фильтр
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Загрузить список
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Создать новый контакт
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Название
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead>Контакты</TableHead>
              <TableHead>Канал коммуникации</TableHead>
              <TableHead>Теги</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  Создан
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('last_message_at')}
              >
                <div className="flex items-center gap-2">
                  Последнее сообщение
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead>Изменено</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow 
                key={contact.id} 
                className="hover:bg-table-row-hover transition-colors"
              >
                <TableCell className="font-medium">
                  {contact.name}
                </TableCell>
                <TableCell>
                  {renderContactInfo(contact)}
                </TableCell>
                <TableCell>
                  <ChannelSelector
                    availableTypes={getAvailableTypesForContact(contact)}
                    connectedChannels={connectedChannels}
                    selectedChannelId={contact.preferred_channel_id}
                    onSelectChannel={(channelId) => onChannelSelect(contact.id, channelId)}
                    contact={contact}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.length > 0 ? (
                      contact.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(contact.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(contact.last_message_at)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(contact.updated_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => onWriteMessage(contact)}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Написать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onEditContact(contact)}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteContact(contact)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {searchQuery ? 'Контакты не найдены' : 'Нет контактов'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
