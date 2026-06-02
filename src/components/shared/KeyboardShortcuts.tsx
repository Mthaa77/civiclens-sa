'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Navigation, Database, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';

// ── Kbd component ──────────────────────────────────────────────────────────
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[24px] h-[24px]',
        'bg-gradient-to-b from-white/[0.08] to-white/[0.04]',
        'border border-white/[0.12] rounded-md px-2 py-0.5',
        'text-[11px] font-mono text-zinc-200 leading-none',
        'shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
        className
      )}
    >
      {children}
    </kbd>
  );
}

// ── Shortcut data ──────────────────────────────────────────────────────────
interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Search modules, municipalities & tenders' },
      { keys: ['?'], description: 'Show / hide shortcuts' },
      { keys: ['1–9'], description: 'Quick switch to module (1=Dashboard, 2=TenderLens, …)' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'T'], description: 'Go to TenderLens' },
      { keys: ['G', 'M'], description: 'Go to MuniLens' },
      { keys: ['G', 'G'], description: 'Go to GeoLens' },
      { keys: ['G', 'A'], description: 'Go to AI Analyst' },
      { keys: ['G', 'R'], description: 'Go to ReportLens' },
      { keys: ['G', 'E'], description: 'Go to ElectionLens' },
    ],
  },
  {
    title: 'Data & Actions',
    items: [
      { keys: ['E'], description: 'Export current data' },
      { keys: ['C'], description: 'Compare municipalities' },
      { keys: ['W'], description: 'Toggle watchlist' },
      { keys: ['N'], description: 'Open notifications' },
      { keys: ['Ctrl', '/'], description: 'Focus search' },
    ],
  },
  {
    title: 'View',
    items: [
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', '⇧', 'D'], description: 'Toggle dark mode' },
      { keys: ['Esc'], description: 'Close dialog/panel' },
    ],
  },
];

// ── Keyboard Shortcuts Overlay ─────────────────────────────────────────────
export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveModule, toggleSidebarCollapse } = useNavigationStore();

  // G-sequence state
  const [gSequence, setGSequence] = useState(false);
  const [gTimeout, setGTimeout] = useState<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // "?" to open shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // Only process these when NOT in the overlay
      if (isOpen) return;

      // Ctrl+K — handled by Topbar, ignore here
      // Ctrl+R — let browser handle refresh naturally
      // Ctrl+E — export (prevent default)
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        // Mock export action
        return;
      }

      // Ctrl+/ — focus search (open command palette)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        // Dispatch a custom event that Topbar can listen to
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        return;
      }

      // Ctrl+B — toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
        return;
      }

      // Ctrl+Shift+D — toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        // Toggle theme via click on theme button
        document.dispatchEvent(new CustomEvent('civiclens-toggle-theme'));
        return;
      }

      // G-sequence for navigation
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (gSequence) {
          // Second key in G sequence
          return;
        }
        e.preventDefault();
        setGSequence(true);
        // Reset after 1s if no second key
        const timeout = setTimeout(() => setGSequence(false), 1000);
        setGTimeout(timeout);
        return;
      }

      // Handle second key in G sequence
      if (gSequence) {
        e.preventDefault();
        if (gTimeout) clearTimeout(gTimeout);
        setGSequence(false);

        const gMap: Record<string, string> = {
          d: 'dashboard',
          t: 'tenderlens',
          m: 'munilens',
          g: 'geolens',
          a: 'ai-analyst',
        };
        const moduleId = gMap[e.key.toLowerCase()];
        if (moduleId) {
          setActiveModule(moduleId as Parameters<typeof setActiveModule>[0]);
        }
        return;
      }

      // Number keys 1-9 for quick module switch
      if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const numMap: Record<string, string> = {
          '1': 'dashboard',
          '2': 'tenderlens',
          '3': 'munilens',
          '4': 'geolens',
          '5': 'ai-analyst',
          '6': 'risklens',
          '7': 'electionlens',
          '8': 'reportlens',
          '9': 'policylens',
        };
        const moduleId = numMap[e.key];
        if (moduleId) {
          setActiveModule(moduleId as Parameters<typeof setActiveModule>[0]);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [isOpen, gSequence, gTimeout, setActiveModule, toggleSidebarCollapse]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with grid pattern */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            onClick={close}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </motion.div>

          {/* Centered dialog card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                'relative w-full max-w-lg pointer-events-auto',
                'rounded-xl border border-white/[0.08]',
                'bg-[#0d1224]/95 backdrop-blur-xl',
                'shadow-2xl shadow-black/40'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-4 right-4 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #0077B6, #FFB81C, #007749, transparent)',
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1]">
                    <Keyboard className="size-4 text-zinc-300" />
                  </div>
                  <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={close}
                  className="flex size-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Separator */}
              <div className="mx-6 h-px bg-white/[0.06]" />

              {/* Shortcut groups */}
              <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {SHORTCUT_GROUPS.map((group, gi) => {
                  const groupIcon = gi === 0 ? Navigation : gi === 1 ? Database : Eye;
                  const groupColor = gi === 0 ? '#0077B6' : gi === 1 ? '#B45309' : '#10B981';
                  const GroupIcon = groupIcon;
                  return (
                    <div key={group.title}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <GroupIcon className="size-3.5" style={{ color: groupColor }} />
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: groupColor }}>
                          {group.title}
                        </h3>
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${groupColor}30, transparent)` }} />
                      </div>
                    <div className="space-y-1.5">
                      {group.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="text-[13px] text-zinc-300">{item.description}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((key, ki) => (
                              <React.Fragment key={ki}>
                                {ki > 0 && (
                                  <span className="text-[10px] text-zinc-600 mx-0.5">
                                    {item.keys.length === 2 &&
                                    item.keys[0] === 'G'
                                      ? 'then'
                                      : '+'}
                                  </span>
                                )}
                                <Kbd>{key}</Kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
                })}
              </div>

              {/* Footer hint */}
              <div className="px-6 py-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-zinc-600 text-center">
                  Press <Kbd className="mx-0.5">?</Kbd> anytime to toggle this panel
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
