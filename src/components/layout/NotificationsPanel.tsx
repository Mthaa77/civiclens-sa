'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FileText,
  Building2,
  Vote,
  CheckCheck,
  Bell,
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
import { Separator } from '@/components/ui/separator';

// ── Notification Types ──────────────────────────────────────────────────────

type NotificationType = 'risk' | 'tender' | 'municipality' | 'election';
type Severity = 'critical' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  severity: Severity;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

// ── Mock Notifications ──────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'risk',
    severity: 'critical',
    title: 'Critical Risk Signal Detected',
    description:
      'Emfuleni Local Municipality has triggered a critical financial distress signal. Cash flow coverage ratio has fallen below 1.0 for three consecutive quarters, indicating imminent default risk.',
    timestamp: '5 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'tender',
    severity: 'info',
    title: 'New Tender Published',
    description:
      'City of Cape Town has published a R2.4B infrastructure upgrade tender (CPT-INF-2026-0147). Closing date: 28 April 2026. Category: Water & Sanitation.',
    timestamp: '32 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'municipality',
    severity: 'critical',
    title: 'Section 139 Status Changed',
    description:
      'Mangaung Metropolitan Municipality has been placed under mandatory administration per Section 139(1)(b) of the Constitution. Provincial executive assumed control effective immediately.',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'election',
    severity: 'warning',
    title: 'Council Dissolution Imminent',
    description:
      'Ethekwini Metropolitan Council faces potential dissolution following vote of no confidence. Special council sitting scheduled for 15 March 2026 to determine outcome.',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'risk',
    severity: 'warning',
    title: 'Irregular Expenditure Spike',
    description:
      'Limpopo Province municipalities reported R3.2B in irregular expenditure for Q3 2025/26, a 47% increase from Q2. Polokwane and Makhado are the primary contributors.',
    timestamp: '3 hours ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'tender',
    severity: 'warning',
    title: 'Tender Deadline Approaching',
    description:
      'Eskom Medupi remediation tender (ESK-REM-2026-0089) closes in 48 hours. Estimated value: R8.7B. Only 3 submissions received to date — below expected threshold.',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: 'n7',
    type: 'municipality',
    severity: 'info',
    title: 'Clean Audit Achievement',
    description:
      'Winelands District Municipality has achieved its 5th consecutive clean audit outcome, one of only 25 municipalities nationally. Financial health score improved to 82/100.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'n8',
    type: 'risk',
    severity: 'critical',
    title: 'Service Delivery Crisis Alert',
    description:
      'Nxuba Local Municipality (Eastern Cape) water supply has dropped to 12% of households. Sanitation access at 8%. National Treasury notified for emergency intervention.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'n9',
    type: 'election',
    severity: 'info',
    title: 'By-Election Results Certified',
    description:
      '2026 Ward By-Elections for 23 wards across 6 provinces have been certified by the IEC. Voter turnout averaged 48.2%, down from 53.1% in the 2024 cycle.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'n10',
    type: 'tender',
    severity: 'info',
    title: 'Tender Award Dispute Filed',
    description:
      'A formal dispute has been filed against the R1.1B eThekwini solid waste management tender award. Alleged procedural non-compliance under PFMA Section 51.',
    timestamp: '3 days ago',
    read: true,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case 'risk':
      return AlertTriangle;
    case 'tender':
      return FileText;
    case 'municipality':
      return Building2;
    case 'election':
      return Vote;
  }
}

function getTypeIconStyle(type: NotificationType) {
  switch (type) {
    case 'risk':
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'tender':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'municipality':
      return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    case 'election':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  }
}

function getSeverityBorder(severity: Severity) {
  switch (severity) {
    case 'critical':
      return 'border-l-red-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'info':
      return 'border-l-emerald-500';
  }
}

// ── Stagger Animation ───────────────────────────────────────────────────────

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
};

// ── Component ───────────────────────────────────────────────────────────────

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const allRead = unreadCount === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:max-w-[420px] bg-[#0a0e1a] border-white/[0.08] p-0 flex flex-col"
      >
        <SheetHeader className="p-4 pb-3 space-y-1 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-zinc-100 text-base font-semibold">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px] h-5 px-1.5 font-semibold">
                  {unreadCount}
                </Badge>
              )}
            </div>
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
          <SheetDescription className="text-[11px] text-zinc-600">
            Real-time alerts from across the CivicLens platform
          </SheetDescription>
        </SheetHeader>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {allRead && notifications.length > 0 ? (
              <motion.div
                key="all-read"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <CheckCheck className="size-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-zinc-300">All caught up!</p>
                <p className="text-xs text-zinc-600 mt-1">
                  You&apos;ve read all notifications. New alerts will appear here.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="p-3 space-y-2"
              >
                {notifications.map((notification) => {
                  const Icon = getTypeIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      className={cn(
                        'group relative rounded-lg border border-white/[0.06] border-l-[3px]',
                        getSeverityBorder(notification.severity),
                        'p-3 hover:border-white/[0.12] hover:bg-white/[0.02]',
                        'transition-all duration-200 cursor-pointer'
                      )}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type Icon */}
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-md border shrink-0 mt-0.5',
                            getTypeIconStyle(notification.type)
                          )}
                        >
                          <Icon className="size-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-xs font-medium leading-snug',
                                notification.read ? 'text-zinc-500' : 'text-zinc-200'
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex size-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-[11px] leading-relaxed mt-1 line-clamp-2',
                              notification.read ? 'text-zinc-600' : 'text-zinc-400'
                            )}
                          >
                            {notification.description}
                          </p>
                          <p
                            className={cn(
                              'text-[10px] mt-1.5 font-medium',
                              notification.read ? 'text-zinc-700' : 'text-zinc-500'
                            )}
                          >
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-3">
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
