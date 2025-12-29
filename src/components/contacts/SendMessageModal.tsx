import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ConnectedChannel } from '@/types/chat';

const MAX_MESSAGE_LENGTH = 2048;

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: ConnectedChannel | null;
  onSend?: (channelId: string, message: string) => Promise<void>;
}

export function SendMessageModal({
  open,
  onOpenChange,
  channel,
  onSend,
}: SendMessageModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!channel || !message.trim()) return;

    setSending(true);

    try {
      if (onSend) {
        await onSend(channel.id, message.trim());
      } else {
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setSuccess(true);
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSuccess(false);
    onOpenChange(false);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }
  };

  const canSend = message.trim().length > 0 && !sending && !success;
  const charsRemaining = MAX_MESSAGE_LENGTH - message.length;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Сообщение отправлено</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Через {channel?.display_name}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Отправить сообщение
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Channel Info */}
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Канал
            </Label>
            <div className="mt-1 font-medium">
              {channel?.display_name || 'Не выбран'}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="message" className="text-muted-foreground text-xs uppercase tracking-wide">
                Сообщение
              </Label>
              <span className={`text-xs ${charsRemaining < 100 ? 'text-warning' : 'text-muted-foreground'}`}>
                {charsRemaining} / {MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="Введите текст сообщения..."
              className="mt-2 min-h-[120px] resize-none"
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={sending}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={sending}>
              Отмена
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!canSend}
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
