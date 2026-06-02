'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  X,
  Compass,
  Zap,
  Database,
  Search,
  ArrowLeftRight,
  GitCompareArrows,
  Eye,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';

// ── Kbd component (physical key style) ──────────────────────────────────────
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[28px] h-[28px]',
        'bg-[#1a1f2e] border border-white/[0.12] rounded-[6px] px-2 py-1',
        'text-[11px] font-mono text-zinc-200 leading-none',
        'shadow-[0_2px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        'select-none',
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
  icon?: React.ReactNode;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation',
    icon: <Compass className="size-4" />,
    accentColor: '#3B82F6',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Open Search', icon: <Search className="size-3 text-blue-400" /> },
      { keys: ['1–9'], description: 'Navigate to module (Shift for Phase 2/3)', icon: <Zap className="size-3 text-blue-400" /> },
      { keys: ['D'], description: 'Dashboard', icon: <Compass className="size-3 text-blue-400" /> },
      { keys: ['T'], description: 'TenderLens', icon: <Compass className="size-3 text-blue-400" /> },
      { keys: ['M'], description: 'MuniLens', icon: <Compass className="size-3 text-blue-400" /> },
      { keys: ['G'], description: 'GeoLens', icon: <Compass className="size-3 text-blue-400" /> },
      { keys: ['A'], description: 'AI Analyst', icon: <Compass className="size-3 text-blue-400" /> },
      { keys: ['R'], description: 'ReportLens', icon: <Compass className="size-3 text-blue-400" /> },
    ],
  },
  {
    title: 'General',
    icon: <Zap className="size-4" />,
    accentColor: '#A855F7',
    items: [
      { keys: ['?'], description: 'Show/Hide Shortcuts', icon: <Keyboard className="size-3 text-purple-400" /> },
      { keys: ['Esc'], description: 'Close Dialog/Panel', icon: <X className="size-3 text-purple-400" /> },
      { keys: ['/'], description: 'Focus Search', icon: <Search className="size-3 text-purple-400" /> },
      { keys: ['Ctrl', '\\'], description: 'Toggle Sidebar', icon: <ArrowLeftRight className="size-3 text-purple-400" /> },
    ],
  },
  {
    title: 'Data',
    icon: <Database className="size-4" />,
    accentColor: '#10B981',
    items: [
      { keys: ['E'], description: 'Export Data', icon: <Database className="size-3 text-emerald-400" /> },
      { keys: ['C'], description: 'Compare Municipalities', icon: <GitCompareArrows className="size-3 text-emerald-400" /> },
      { keys: ['W'], description: 'Toggle Watchlist', icon: <Eye className="size-3 text-emerald-400" /> },
      { keys: ['N'], description: 'Notifications', icon: <Bell className="size-3 text-emerald-400" /> },
    ],
  },
];

// ── Keyboard Shortcuts Panel ────────────────────────────────────────────────
export default function KeyboardShortcutsPanel() {
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
      // Ctrl+E — export (prevent default)
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        return;
      }

      // Ctrl+/ — focus search (open command palette)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        return;
      }

      // Ctrl+\ — toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebarCollapse();
        return;
      }

      // Ctrl+B — toggle sidebar (legacy)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapse();
        return;
      }

      // Ctrl+Shift+D — toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('civiclens-toggle-theme'));
        return;
      }

      // G-sequence for navigation
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (gSequence) {
          return;
        }
        e.preventDefault();
        setGSequence(true);
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

      // Single-key navigation shortcuts (only when no modifiers)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        // Number keys 1-9 for quick module switch
        if (/^[1-9]$/.test(e.key)) {
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
            // With shift, navigate to Phase 2/3 modules
            if (e.shiftKey) {
              const shiftMap: Record<string, string> = {
                '1': 'peoplelens',
                '2': 'servicelens',
                '3': 'agasalert',
                '4': 'earlyalert',
                '5': 'grantlens',
                '6': 'budgetlens',
                '7': 'carbonlens',
                '8': 'datahub',
                '9': 'data-explorer',
              };
              const shiftId = shiftMap[e.key];
              if (shiftId) {
                setActiveModule(shiftId as Parameters<typeof setActiveModule>[0]);
              }
            } else {
              setActiveModule(moduleId as Parameters<typeof setActiveModule>[0]);
            }
          }
          return;
        }

        // Single-letter shortcuts (only when not in G-sequence)
        const singleKeyMap: Record<string, string> = {
          d: 'dashboard',
          t: 'tenderlens',
          m: 'munilens',
          g: 'geolens',  // handled via G-sequence above, but also as single key
          a: 'ai-analyst',
          r: 'reportlens',
        };

        // Note: g is handled by G-sequence above, so it won't reach here
        const letterMap: Record<string, string> = {
          d: 'dashboard',
          t: 'tenderlens',
          m: 'munilens',
          a: 'ai-analyst',
          r: 'reportlens',
        };

        const lowerKey = e.key.toLowerCase();
        if (letterMap[lowerKey]) {
          setActiveModule(letterMap[lowerKey] as Parameters<typeof setActiveModule>[0]);
          return;
        }

        // 'c' for compare municipalities — dispatch custom event
        if (lowerKey === 'c') {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('civiclens-compare'));
          return;
        }

        // 'w' for toggle watchlist
        if (lowerKey === 'w') {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('civiclens-watchlist'));
          return;
        }

        // 'n' for notifications
        if (lowerKey === 'n') {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('civiclens-notifications'));
          return;
        }

        // 'e' for export
        if (lowerKey === 'e') {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('civiclens-export'));
          return;
        }
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
          {/* Backdrop with blur */}
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
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </motion.div>

          {/* Centered panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                'relative w-full max-w-2xl pointer-events-auto',
                'rounded-xl border border-white/[0.08]',
                'bg-[#0d1224]/96 backdrop-blur-xl',
                'shadow-2xl shadow-black/40'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line — SA flag colors */}
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
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1]">
                    <Keyboard className="size-4.5 text-zinc-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-[10px] text-zinc-500">
                      Navigate faster with keyboard shortcuts
                    </p>
                  </div>
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

              {/* Shortcut categories */}
              <div className="px-6 py-4 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {SHORTCUT_CATEGORIES.map((category, catIdx) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: catIdx * 0.08 }}
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="flex size-6 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: `${category.accentColor}15`,
                          border: `1px solid ${category.accentColor}30`,
                          color: category.accentColor,
                        }}
                      >
                        {React.cloneElement(category.icon as React.ReactElement, { className: 'size-3.5' })}
                      </div>
                      <h3
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: category.accentColor }}
                      >
                        {category.title}
                      </h3>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${category.accentColor}30, transparent)`,
                        }}
                      />
                    </div>

                    {/* 2-column grid for shortcuts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {category.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: catIdx * 0.08 + idx * 0.03 }}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {item.icon && (
                              <span className="shrink-0 opacity-50 group-hover:opacity-80 transition-opacity">
                                {item.icon}
                              </span>
                            )}
                            <span className="text-[12px] text-zinc-300 truncate">{item.description}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.keys.map((key, ki) => (
                              <React.Fragment key={ki}>
                                {ki > 0 && (
                                  <span className="text-[9px] text-zinc-600 mx-0.5">
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="px-6 py-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-zinc-600 text-center flex items-center justify-center gap-1.5">
                  Press <Kbd className="mx-0.5 scale-90">?</Kbd> anytime to toggle this panel
                  <span className="mx-1 text-zinc-700">·</span>
                  <span>Click outside or press <Kbd className="mx-0.5 scale-90">Esc</Kbd> to close</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
