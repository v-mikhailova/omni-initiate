import { useState, useMemo } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChannelBadge } from './ChannelBadge';
import { Contact, ConnectedChannel, ChannelType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  connectedChannels: ConnectedChannel[];
  onSend: (contactId: string, channelId: string, message: string) => Promise<void>;
}

export function NewMessageModal({
  open,
  onOpenChange,
  contact,
  connectedChannels,
  onSend,
}: NewMessageModalProps) {
  const [selectedType, setSelectedType] = useState<ChannelType | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available channel types for this contact
  const availableTypes = useMemo(() => {
    if (!contact) return [];
    const contactTypes = contact.contacts.map(c => c.type);
    const connectedTypes = new Set(
      connectedChannels
        .filter(ch => ch.status === 'connected')
        .map(ch => ch.type)
    );
    return contactTypes.filter(t => connectedTypes.has(t));
  }, [contact, connectedChannels]);

  // Get channels of selected type
  const channelsOfType = useMemo(() => {
    if (!selectedType) return [];
    return connectedChannels.filter(
      ch => ch.type === selectedType && ch.status === 'connected'
    );
  }, [selectedType, connectedChannels]);

  // Auto-select channel if only one available
  const handleTypeSelect = (type: ChannelType) => {
    setSelectedType(type);
    const channels = connectedChannels.filter(
      ch => ch.type === type && ch.status === 'connected'
    );
    if (channels.length === 1) {
      setSelectedChannelId(channels[0].id);
    } else {
      // Check for preferred channel
      if (contact?.preferred_channel_id) {
        const preferred = channels.find(ch => ch.id === contact.preferred_channel_id);
        if (preferred) {
          setSelectedChannelId(preferred.id);
          return;
        }
      }
      setSelectedChannelId('');
    }
  };

  // Initialize with preferred channel on open
  useMemo(() => {
    if (open && contact?.preferred_channel_id) {
      const preferred = connectedChannels.find(
        ch => ch.id === contact.preferred_channel_id && ch.status === 'connected'
      );
      if (preferred && availableTypes.includes(preferred.type)) {
        setSelectedType(preferred.type);
        setSelectedChannelId(preferred.id);
      }
    }
  }, [open, contact, connectedChannels, availableTypes]);

  const handleSend = async () => {
    if (!contact || !selectedChannelId || !message.trim()) return;

    setError(null);
    setSending(true);

    try {
      await onSend(contact.id, selectedChannelId, message.trim());
      // Reset and close on success
      setMessage('');
      setSelectedType(null);
      setSelectedChannelId('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSelectedType(null);
    setSelectedChannelId('');
    setError(null);
    onOpenChange(false);
  };

  const canSend = selectedChannelId && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Новое сообщение
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Contact Info */}
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Контакт
            </Label>
            <div className="mt-1.5 font-medium text-lg">
              {contact?.name || 'Не выбран'}
            </div>
          </div>

          {/* Channel Type Selection */}
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Канал коммуникации
            </Label>
            
            {availableTypes.length === 0 ? (
              <div className="mt-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-warning">
                      Нет доступных каналов
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      У контакта нет данных для связи или все каналы отключены.
                      <a 
                        href="/settings/channels" 
                        className="ml-1 text-primary hover:underline"
                      >
                        Настроить каналы →
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                {/* Type selection */}
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((type) => (
                    <ChannelBadge
                      key={type}
                      type={type}
                      size="md"
                      selected={selectedType === type}
                      onClick={() => handleTypeSelect(type)}
                    />
                  ))}
                </div>

                {/* Specific channel selection */}
                {selectedType && channelsOfType.length > 1 && (
                  <Select
                    value={selectedChannelId}
                    onValueChange={setSelectedChannelId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите канал" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelsOfType.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Selected channel display */}
                {selectedChannelId && channelsOfType.length === 1 && (
                  <div className="text-sm text-muted-foreground">
                    Канал: <span className="font-medium text-foreground">
                      {channelsOfType[0].display_name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div>
            <Label htmlFor="message" className="text-muted-foreground text-xs uppercase tracking-wide">
              Сообщение
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите текст сообщения..."
              className="mt-2 min-h-[120px] resize-none"
              disabled={!selectedChannelId}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={sending}>
              Отмена
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!canSend || sending}
              className="min-w-[120px]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
