'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FileText,
  Building2,
  Settings,
  CheckCheck,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigationStore } from '@/store/navigation';
import type { NotificationItem, NotificationCategory, ModuleId } from '@/types';

// ── Mock Notifications ──────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'tender',
    title: 'New tender published: Water Infrastructure Upgrade — City of Cape Town',
    description: 'R2.4B infrastructure upgrade tender (CPT-INF-2026-0147) published. Closing 28 April 2026. Category: Water & Sanitation.',
    timestamp: '2 min ago',
    read: false,
    actionLabel: 'View Tender',
    actionModule: 'tenderlens' as ModuleId,
  },
  {
    id: 'n2',
    category: 'alert',
    title: 'Risk signal detected: Budget Overrun in Emfuleni Municipality',
    description: 'Cash flow coverage ratio below 1.0 for three consecutive quarters. Imminent default risk identified by automated monitoring.',
    timestamp: '15 min ago',
    read: false,
    actionLabel: 'Review Risk',
    actionModule: 'risklens' as ModuleId,
  },
  {
    id: 'n3',
    category: 'municipality',
    title: 'Section 139 intervention updated: Tshwane Metropolitan',
    description: 'Mandatory administration per Section 139(1)(b) effective immediately. Provincial executive assumed control of financial governance.',
    timestamp: '1 hour ago',
    read: false,
    actionLabel: 'Open Municipality',
    actionModule: 'munilens' as ModuleId,
  },
  {
    id: 'n4',
    category: 'tender',
    title: 'Tender closing soon: IT Infrastructure Refresh — Gauteng Province (3 days)',
    description: 'GP-IT-2026-0234 closes 6 March 2026. Estimated value R890M. Only 4 submissions received — below expected threshold.',
    timestamp: '2 hours ago',
    read: false,
    actionLabel: 'View Tender',
    actionModule: 'tenderlens' as ModuleId,
  },
  {
    id: 'n5',
    category: 'municipality',
    title: 'Audit outcome published: 12 municipalities assessed',
    description: 'MFMA 2023/24 audit outcomes released. 3 clean audits, 4 qualified, 3 adverse, 2 disclaimers across assessed municipalities.',
    timestamp: '3 hours ago',
    read: false,
    actionLabel: 'Open Municipality',
    actionModule: 'munilens' as ModuleId,
  },
  {
    id: 'n6',
    category: 'municipality',
    title: 'Clean audit achieved: City of Cape Town, Stellenbosch, George',
    description: 'Three Western Cape municipalities achieve clean audit outcomes for 2023/24 cycle. Financial health scores above 75/100.',
    timestamp: '5 hours ago',
    read: true,
    actionLabel: 'Open Municipality',
    actionModule: 'munilens' as ModuleId,
  },
  {
    id: 'n7',
    category: 'alert',
    title: 'New risk alert: Supplier Concentration in eThekwini',
    description: 'Top 3 suppliers hold 68% of awarded tender value (R4.2B of R6.1B). Procurement concentration index exceeds 0.65 threshold.',
    timestamp: '6 hours ago',
    read: true,
    actionLabel: 'Review Risk',
    actionModule: 'risklens' as ModuleId,
  },
  {
    id: 'n8',
    category: 'alert',
    title: 'Grant underspend alert: 5 municipalities below 50% spend rate',
    description: 'Conditional grant expenditure below 50% as of Q3 2025/26. Emfuleni at 23%, Msunduzi at 31%, Mangaung at 38% among flagged.',
    timestamp: 'Yesterday',
    read: true,
    actionLabel: 'Review Risk',
    actionModule: 'grantlens' as ModuleId,
  },
  {
    id: 'n9',
    category: 'system',
    title: 'Data update: MFMA 2024/25 Q3 reports now available',
    description: 'Quarterly financial reports for 257 municipalities have been processed and indexed. 89 new data points per municipality on average.',
    timestamp: 'Yesterday',
    read: true,
    actionLabel: 'View Data',
    actionModule: 'datahub' as ModuleId,
  },
  {
    id: 'n10',
    category: 'system',
    title: 'System maintenance: Scheduled downtime 02:00-04:00 SAST',
    description: 'Planned infrastructure maintenance on 5 March 2026. All services will be unavailable during the maintenance window. Data will be preserved.',
    timestamp: '2 days ago',
    read: true,
    actionLabel: 'View Status',
    actionModule: 'dashboard' as ModuleId,
  },
];

// ── Category Config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NotificationCategory, {
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
}> = {
  alert: {
    icon: AlertTriangle,
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
    label: 'Alerts',
  },
  tender: {
    icon: FileText,
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    label: 'Tenders',
  },
  municipality: {
    icon: Building2,
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    label: 'Municipalities',
  },
  system: {
    icon: Settings,
    color: '#71717A',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20',
    textColor: 'text-zinc-400',
    label: 'System',
  },
};

const TAB_CATEGORIES: Array<{ value: string; label: string; categories: NotificationCategory[] }> = [
  { value: 'all', label: 'All', categories: ['alert', 'tender', 'municipality', 'system'] },
  { value: 'alerts', label: 'Alerts', categories: ['alert'] },
  { value: 'tenders', label: 'Tenders', categories: ['tender'] },
  { value: 'municipalities', label: 'Municipal', categories: ['municipality'] },
  { value: 'system', label: 'System', categories: ['system'] },
];

// ── Animation Variants ──────────────────────────────────────────────────────

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } },
};

// ── Component ───────────────────────────────────────────────────────────────

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { setActiveModule } = useNavigationStore();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    const tabConfig = TAB_CATEGORIES.find((t) => t.value === activeTab);
    if (!tabConfig) return notifications;
    return notifications.filter((n) => tabConfig.categories.includes(n.category));
  }, [notifications, activeTab]);

  const filteredUnreadCount = useMemo(
    () => filteredNotifications.filter((n) => !n.read).length,
    [filteredNotifications]
  );

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleActionClick = (notification: NotificationItem) => {
    handleMarkRead(notification.id);
    setActiveModule(notification.actionModule);
    onOpenChange(false);
  };

  const allRead = unreadCount === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:max-w-[400px] bg-[#0a0e1a]/95 backdrop-blur-xl border-white/[0.08] p-0 flex flex-col"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <SheetHeader className="p-4 pb-3 space-y-1 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#0077B6]/10 border border-[#0077B6]/20">
                <Bell className="size-3.5 text-[#0077B6]" />
              </div>
              <SheetTitle className="text-zinc-100 text-base font-semibold">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px] h-5 px-1.5 font-semibold">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <div className="flex items-center gap-1.5">
                {soundEnabled ? (
                  <Volume2 className="size-3.5 text-zinc-500" />
                ) : (
                  <VolumeX className="size-3.5 text-zinc-600" />
                )}
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  className="scale-75 origin-right"
                />
              </div>
              {/* Mark All Read */}
              {!allRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-7 text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] gap-1"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <SheetDescription className="text-[11px] text-zinc-600">
            Real-time alerts from across the CivicLens platform
          </SheetDescription>
        </SheetHeader>

        {/* ── Category Tabs ───────────────────────────────────── */}
        <div className="border-b border-white/[0.06] px-3 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/[0.04] h-8 p-0.5 w-full gap-0">
              {TAB_CATEGORIES.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-[10px] h-7 px-2 py-0 data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-200 text-zinc-500 rounded-md flex items-center gap-1"
                >
                  {tab.label}
                  {tab.value !== 'all' && (
                    <span className="text-[9px] text-zinc-600 tabular-nums">
                      {notifications.filter((n) => tab.categories.includes(n.category) && !n.read).length || ''}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* ── Notifications List ───────────────────────────────── */}
        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <CheckCheck className="size-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-zinc-300">
                  {allRead ? 'All caught up!' : 'No notifications in this category'}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {allRead
                    ? "You've read all notifications. New alerts will appear here."
                    : 'Try switching to a different tab or check All notifications.'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`list-${activeTab}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="p-3 space-y-2"
              >
                {filteredNotifications.map((notification) => {
                  const config = CATEGORY_CONFIG[notification.category];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      className={cn(
                        'group relative rounded-lg border border-white/[0.06] border-l-[3px]',
                        `border-l-[${config.color}]`,
                        'p-3 hover:border-white/[0.12] hover:bg-white/[0.02]',
                        'transition-all duration-200 cursor-pointer',
                        notification.read && 'opacity-60'
                      )}
                      style={{ borderLeftColor: config.color }}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category Icon */}
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-md border shrink-0 mt-0.5',
                            config.bgColor,
                            config.borderColor
                          )}
                        >
                          <Icon className={cn('size-4', config.textColor)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-xs font-semibold leading-snug',
                                notification.read ? 'text-zinc-500' : 'text-zinc-200'
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex size-2 rounded-full bg-blue-400 shrink-0 mt-1.5 ring-2 ring-blue-400/20" />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-[11px] leading-relaxed mt-1 line-clamp-2',
                              notification.read ? 'text-zinc-600' : 'text-zinc-300'
                            )}
                          >
                            {notification.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p
                              className={cn(
                                'text-[10px] font-medium',
                                notification.read ? 'text-zinc-700' : 'text-zinc-500'
                              )}
                            >
                              {notification.timestamp}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActionClick(notification);
                              }}
                              className={cn(
                                'text-[10px] font-semibold flex items-center gap-1',
                                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                                config.textColor, 'hover:underline'
                              )}
                            >
                              {notification.actionLabel}
                              <ExternalLink className="size-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-600">
              {filteredUnreadCount} unread in this view
            </span>
            <span className="text-[10px] text-zinc-600">
              {notifications.length} total
            </span>
          </div>
          <button
            className="flex items-center justify-center gap-2 w-full text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors py-2 rounded-lg hover:bg-white/[0.04]"
            onClick={() => onOpenChange(false)}
          >
            <ExternalLink className="size-3" />
            View All Notifications
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
