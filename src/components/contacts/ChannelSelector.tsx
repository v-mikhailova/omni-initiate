import { useState } from 'react';
import { Check, ChevronDown, Circle, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChannelBadge } from './ChannelBadge';
import { ChannelType, ConnectedChannel } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChannelSelectorProps {
  availableTypes: ChannelType[];
  connectedChannels: ConnectedChannel[];
  selectedChannelId?: string;
  onSelectChannel: (channelId: string) => void;
}

export function ChannelSelector({
  availableTypes,
  connectedChannels,
  selectedChannelId,
  onSelectChannel,
}: ChannelSelectorProps) {
  const [openType, setOpenType] = useState<ChannelType | null>(null);

  const selectedChannel = connectedChannels.find(ch => ch.id === selectedChannelId);

  const getChannelsOfType = (type: ChannelType) => 
    connectedChannels.filter(ch => ch.type === type);

  if (availableTypes.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">—</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {availableTypes.map((type) => {
        const channelsOfType = getChannelsOfType(type);
        const connectedOfType = channelsOfType.filter(ch => ch.status === 'connected');
        const isSelected = selectedChannel?.type === type;
        
        // If only one connected channel of this type, select it directly
        if (connectedOfType.length === 1) {
          const channel = connectedOfType[0];
          return (
            <ChannelBadge
              key={type}
              type={type}
              onClick={() => onSelectChannel(channel.id)}
              selected={selectedChannelId === channel.id}
              subtitle={isSelected ? getShortIdentifier(channel.identifier) : undefined}
            />
          );
        }

        // Multiple channels - show popover
        return (
          <Popover 
            key={type} 
            open={openType === type} 
            onOpenChange={(open) => setOpenType(open ? type : null)}
          >
            <PopoverTrigger asChild>
              <div className="relative">
                <ChannelBadge
                  type={type}
                  selected={isSelected}
                  subtitle={isSelected ? getShortIdentifier(selectedChannel!.identifier) : undefined}
                />
                {channelsOfType.length > 1 && (
                  <ChevronDown className="absolute -right-0.5 -bottom-0.5 w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-2 animate-fade-in" 
              align="start"
              sideOffset={4}
            >
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Выберите канал
              </div>
              <div className="space-y-1">
                {channelsOfType.map((channel) => (
                  <button
                    key={channel.id}
                    disabled={channel.status !== 'connected'}
                    onClick={() => {
                      onSelectChannel(channel.id);
                      setOpenType(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      "hover:bg-accent",
                      channel.status !== 'connected' && "opacity-50 cursor-not-allowed",
                      selectedChannelId === channel.id && "bg-primary/10"
                    )}
                  >
                    <Circle
                      className={cn(
                        "w-2 h-2 flex-shrink-0",
                        channel.status === 'connected' 
                          ? "fill-success text-success" 
                          : "fill-muted-foreground text-muted-foreground"
                      )}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{channel.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {channel.status === 'connected' ? 'Подключен' : 'Отключен'}
                      </div>
                    </div>
                    {selectedChannelId === channel.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {connectedOfType.length === 0 && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span>Нет подключенных каналов</span>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

function getShortIdentifier(identifier: string): string {
  if (identifier.startsWith('+')) {
    // Phone number - show last 4 digits
    return '...' + identifier.slice(-4);
  }
  if (identifier.startsWith('@')) {
    // Telegram username
    return identifier.length > 12 ? identifier.slice(0, 12) + '...' : identifier;
  }
  // Other - truncate
  return identifier.length > 10 ? identifier.slice(0, 8) + '...' : identifier;
}
