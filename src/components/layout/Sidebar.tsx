import { MessageSquare, Users, BarChart2, Settings, FileText, Bot, ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { id: string; label: string; href: string }[];
}

const navItems: NavItem[] = [
  { id: 'dialogs', label: 'Диалоги', icon: MessageSquare, href: '/dialogs' },
  { id: 'contacts', label: 'Контакты', icon: Users, href: '/contacts' },
  { id: 'analytics', label: 'Аналитика', icon: BarChart2, href: '/analytics' },
  { 
    id: 'settings', 
    label: 'Настройки', 
    icon: Settings,
    children: [
      { id: 'channels', label: 'Каналы', href: '/settings/channels' },
      { id: 'team', label: 'Команда', href: '/settings/team' },
      { id: 'integrations', label: 'Интеграции', href: '/settings/integrations' },
    ],
  },
  { id: 'reports', label: 'Отчёты', icon: FileText, href: '/reports' },
  { 
    id: 'chatbots', 
    label: 'Чат-боты', 
    icon: Bot,
    children: [
      { id: 'bots-list', label: 'Список ботов', href: '/chatbots/list' },
      { id: 'bots-builder', label: 'Конструктор', href: '/chatbots/builder' },
    ],
  },
];

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ 
  activeItem = 'contacts', 
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>(['settings', 'chatbots']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <button 
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <Menu className="w-5 h-5 text-sidebar-foreground" />
        </button>
        {!collapsed && (
          <span className="ml-3 font-semibold text-foreground text-lg">Seven Tech</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.id);

            if (hasChildren) {
              return (
                <li key={item.id}>
                  <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.id)}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "sidebar-item w-full justify-between",
                          isActive && "sidebar-item-active"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </span>
                        {!collapsed && (
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )} />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent>
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children!.map((child) => (
                            <li key={child.id}>
                              <button
                                onClick={() => onNavigate?.(child.id)}
                                className="sidebar-item w-full text-sm py-2"
                              >
                                {child.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.id)}
                  className={cn(
                    "sidebar-item w-full",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
