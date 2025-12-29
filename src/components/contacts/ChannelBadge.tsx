import { Send, MessageCircle, User } from 'lucide-react';
import { ChannelType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChannelBadgeProps {
  type: ChannelType;
  onClick?: () => void;
  selected?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  subtitle?: string;
}

const channelConfig: Record<ChannelType, { label: string; icon: React.ElementType }> = {
  telegram: { label: 'Telegram', icon: Send },
  telegram_personal: { label: 'TG Personal', icon: User },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  max: { label: 'MAX', icon: MessageCircle },
};

export function ChannelBadge({ 
  type, 
  onClick, 
  selected = false,
  showIcon = true,
  size = 'sm',
  subtitle,
}: ChannelBadgeProps) {
  const config = channelConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "channel-badge",
        `channel-badge-${type}`,
        size === 'md' && "px-3 py-1.5 text-sm",
        selected && "ring-2 ring-offset-1",
        type === 'telegram' && selected && "ring-telegram",
        type === 'telegram_personal' && selected && "ring-telegram",
        type === 'whatsapp' && selected && "ring-whatsapp",
        type === 'max' && selected && "ring-max",
      )}
    >
      {showIcon && <Icon className={cn("flex-shrink-0", size === 'sm' ? "w-3 h-3" : "w-4 h-4")} />}
      <span className="flex flex-col items-start">
        <span>{config.label}</span>
        {subtitle && (
          <span className="text-[10px] opacity-70 font-normal">{subtitle}</span>
        )}
      </span>
    </button>
  );
}
