'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Ticker event types ─────────────────────────────────────────────────────
type TickerType = 'Tender' | 'Risk' | 'Municipal' | 'Audit' | 'Section 139';

interface TickerEvent {
  type: TickerType;
  description: string;
  timestamp: string;
}

const TYPE_COLORS: Record<TickerType, string> = {
  Tender: '#10B981',
  Risk: '#EF4444',
  Municipal: '#3B82F6',
  Audit: '#F59E0B',
  'Section 139': '#F43F5E',
};

const TICKER_EVENTS: TickerEvent[] = [
  {
    type: 'Tender',
    description: 'New tender published: City of Cape Town — R2.4B Water Infrastructure',
    timestamp: '2m ago',
  },
  {
    type: 'Risk',
    description: 'Risk signal detected: Emfuleni — Cash Flow Crisis',
    timestamp: '5m ago',
  },
  {
    type: 'Section 139',
    description: '§139 Status update: Mangaung — Placed under administration',
    timestamp: '12m ago',
  },
  {
    type: 'Audit',
    description: 'Clean audit: Stellenbosch — 5th consecutive clean audit',
    timestamp: '18m ago',
  },
  {
    type: 'Tender',
    description: 'Tender deadline: Eskom Medupi R8.7B — closes in 3 days',
    timestamp: '25m ago',
  },
  {
    type: 'Municipal',
    description: 'Budget alert: Limpopo Province — Q3 underspend of R3.2B',
    timestamp: '32m ago',
  },
  {
    type: 'Municipal',
    description: 'Service delivery: Nxuba — Water access at 12% capacity',
    timestamp: '45m ago',
  },
  {
    type: 'Audit',
    description: 'Irregular expenditure: Free State — R1.8B flagged by AG',
    timestamp: '1h ago',
  },
  {
    type: 'Municipal',
    description: 'By-election results: 23 wards certified, 48.2% turnout',
    timestamp: '2h ago',
  },
  {
    type: 'Tender',
    description: 'Supplier alert: B-BBEE compliance — 3 suppliers flagged',
    timestamp: '2h ago',
  },
  {
    type: 'Municipal',
    description: 'Dam levels: Western Cape — Theewaterskloof at 67% capacity',
    timestamp: '3h ago',
  },
  {
    type: 'Municipal',
    description: 'Grant tracker: DORA Q3 — 55% average spend rate',
    timestamp: '4h ago',
  },
  {
    type: 'Audit',
    description: 'Audit outcome: Buffalo City — Qualified audit opinion',
    timestamp: '5h ago',
  },
  {
    type: 'Tender',
    description: 'Tender award: eThekwini R1.1B — dispute filed',
    timestamp: '6h ago',
  },
  {
    type: 'Risk',
    description: 'Climate: Northern Cape — Drought warning extended',
    timestamp: '8h ago',
  },
];

// ── Activity Ticker ────────────────────────────────────────────────────────
export default function ActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentEvent = TICKER_EVENTS[currentIndex];
  const dotColor = TYPE_COLORS[currentEvent.type];

  return (
    <div
      className={cn(
        'relative flex items-center h-7 border-b border-white/[0.06]',
        'bg-[#080b14]'
      )}
    >
      {/* Bottom accent gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), rgba(59,130,246,0.2), transparent)',
        }}
      />

      <div className="flex items-center w-full px-4 lg:px-6">
        {/* LIVE indicator */}
        <div className="flex items-center gap-1.5 shrink-0 mr-4">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-400/80 tracking-wide">
            LIVE
          </span>
        </div>

        {/* Ticker content */}
        <div className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {/* Type dot */}
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: dotColor }}
              />

              {/* Description */}
              <span className="text-[11px] text-zinc-400 truncate">
                {currentEvent.description}
              </span>

              {/* Timestamp */}
              <span className="text-[11px] text-zinc-600 shrink-0">
                {currentEvent.timestamp}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All link */}
        <button
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 ml-4 cursor-pointer"
          onClick={() => {}}
        >
          View All
        </button>
      </div>
    </div>
  );
}
