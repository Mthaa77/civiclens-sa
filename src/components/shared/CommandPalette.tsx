'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Search,
  LayoutDashboard,
  FileSearch,
  Building2,
  Map,
  Bot,
  FileBarChart,
  ShieldAlert,
  Vote,
  ScrollText,
  Users,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  HandCoins,
  Landmark,
  Leaf,
  Database,
  Sun,
  Moon,
  Download,
  HelpCircle,
  PanelLeftClose,
  ArrowRight,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { MODULES, MOCK_MUNICIPALITIES, MOCK_TENDERS, MOCK_RISK_SIGNALS } from '@/lib/mock-data';
import { formatCompactZAR } from '@/lib/formatters';
import type { ModuleId } from '@/types';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

// ── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileSearch,
  Building2,
  Map,
  Bot,
  FileBarChart,
  ShieldAlert,
  Vote,
  ScrollText,
  Users,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  HandCoins,
  Landmark,
  Leaf,
  Database,
};

// ── Local Storage for Recent Searches ────────────────────────────────────────

const RECENT_KEY = 'civiclens-recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const recent = getRecentSearches().filter((r) => r !== query);
    const updated = [query, ...recent].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

// ── Phase Badge Style ────────────────────────────────────────────────────────

function getPhaseBadgeStyle(phase: string): { color: string; bgColor: string } {
  switch (phase) {
    case 'MVP':
      return { color: '#10B981', bgColor: 'rgba(16,185,129,0.12)' };
    case 'Phase 2':
      return { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)' };
    case 'Phase 3':
      return { color: '#94A3B8', bgColor: 'rgba(148,163,184,0.12)' };
    default:
      return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)' };
  }
}

// ── FHS Score Color ──────────────────────────────────────────────────────────

function getFHSDotColor(score: number | null): string {
  if (score === null) return '#71717a';
  if (score >= 65) return '#22C55E';
  if (score >= 45) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
}

// ── Recent Search Items ─────────────────────────────────────────────────────

function RecentSearchGroup({ onSelect }: { onSelect: (search: string) => void }) {
  const recentSearches = useMemo(() => getRecentSearches(), []);

  if (recentSearches.length === 0) return null;

  return (
    <CommandGroup heading="Recent">
      {recentSearches.map((search, idx) => (
        <CommandItem
          key={`recent-${idx}`}
          value={`recent-${search}`}
          onSelect={() => onSelect(search)}
          className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
        >
          <Clock className="size-4 text-zinc-500 mr-2 shrink-0" />
          <span className="flex-1 truncate text-sm">{search}</span>
          <ArrowRight className="size-3 text-zinc-600 ml-auto" />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { setActiveModule, toggleSidebarCollapse } = useNavigationStore();
  const { theme, setTheme } = useTheme();

  // Track current query for recent search saving (ref, not state — no re-render needed)
  const currentQueryRef = React.useRef('');

  const handleValueChange = useCallback((value: string) => {
    currentQueryRef.current = value;
  }, []);

  const handleSelect = useCallback(
    (action: () => void) => {
      const q = currentQueryRef.current;
      if (q.trim()) {
        addRecentSearch(q.trim());
      }
      action();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleRecentSelect = useCallback((search: string) => {
    // Set the search value in the cmdk input — dispatch input event
    currentQueryRef.current = search;
    const input = document.querySelector('[cmdk-input]') as HTMLInputElement | null;
    if (input) {
      // Use native input setter to trigger React's onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, search);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search modules, municipalities, actions, and more"
      className={cn(
        'bg-[#0a0e1a]/98 backdrop-blur-2xl border-white/[0.08]',
        'shadow-2xl shadow-black/50',
        '[&_[cmdk-group-heading]]:text-zinc-500',
        '[&_[cmdk-group-heading]]:text-[10px]',
        '[&_[cmdk-group-heading]]:uppercase',
        '[&_[cmdk-group-heading]]:tracking-wider',
        '[&_[cmdk-group-heading]]:font-semibold',
        '[&_[cmdk-input-wrapper]]:border-white/[0.06]',
        '[&_[cmdk-input]]:text-zinc-200',
        '[&_[cmdk-input]]:placeholder:text-zinc-600',
        '[&_[cmdk-empty]]:text-zinc-500',
        '[&_[cmdk-list]]:max-h-[420px]'
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, #0077B6, #B45309, #0F766E, transparent)',
        }}
      />

      <CommandInput
        placeholder="Search modules, municipalities, actions..."
        onValueChange={handleValueChange}
      />

      <CommandList>
        <CommandEmpty className="py-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Search className="size-5 text-zinc-600" />
            <p className="text-sm text-zinc-500">No results found</p>
            <p className="text-[11px] text-zinc-600">Try a different search term</p>
          </div>
        </CommandEmpty>

        {/* Recent Searches */}
        <RecentSearchGroup onSelect={handleRecentSelect} />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            value="action-toggle-dark-mode"
            onSelect={() => handleSelect(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
          >
            <div className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0 bg-purple-500/[0.08] border border-purple-500/[0.15]">
              {theme === 'dark' ? (
                <Sun className="size-3.5 shrink-0 text-purple-400" />
              ) : (
                <Moon className="size-3.5 shrink-0 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium">Toggle Dark Mode</span>
              <span className="block text-[10px] text-zinc-500">
                Switch to {theme === 'dark' ? 'light' : 'dark'} theme
              </span>
            </div>
            <CommandShortcut className="ml-2 flex items-center gap-0.5">
              <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-white/[0.06] border border-white/[0.1] rounded-[4px] px-1.5 text-[10px] font-mono text-zinc-400">
                Ctrl+Shift+D
              </kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="action-export-data"
            onSelect={() => handleSelect(() => document.dispatchEvent(new CustomEvent('civiclens-export')))}
            className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
          >
            <div className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0 bg-amber-500/[0.08] border border-amber-500/[0.15]">
              <Download className="size-3.5 shrink-0 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium">Export Data</span>
              <span className="block text-[10px] text-zinc-500">Open data export panel</span>
            </div>
            <CommandShortcut className="ml-2 flex items-center gap-0.5">
              <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-white/[0.06] border border-white/[0.1] rounded-[4px] px-1.5 text-[10px] font-mono text-zinc-400">
                E
              </kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="action-open-help"
            onSelect={() => handleSelect(() => setActiveModule('help'))}
            className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
          >
            <div className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0 bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
              <HelpCircle className="size-3.5 shrink-0 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium">Open Help</span>
              <span className="block text-[10px] text-zinc-500">Keyboard shortcuts & documentation</span>
            </div>
            <CommandShortcut className="ml-2 flex items-center gap-0.5">
              <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-white/[0.06] border border-white/[0.1] rounded-[4px] px-1.5 text-[10px] font-mono text-zinc-400">
                ?
              </kbd>
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="action-toggle-sidebar"
            onSelect={() => handleSelect(() => toggleSidebarCollapse())}
            className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
          >
            <div className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0 bg-blue-500/[0.08] border border-blue-500/[0.15]">
              <PanelLeftClose className="size-3.5 shrink-0 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium">Toggle Sidebar</span>
              <span className="block text-[10px] text-zinc-500">Expand or collapse sidebar</span>
            </div>
            <CommandShortcut className="ml-2 flex items-center gap-0.5">
              <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-white/[0.06] border border-white/[0.1] rounded-[4px] px-1.5 text-[10px] font-mono text-zinc-400">
                Ctrl+B
              </kbd>
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {/* Modules — grouped by phase */}
        {(['MVP', 'Phase 2', 'Phase 3'] as const).map((phase) => {
          const phaseModules = MODULES.filter((m) => m.phase === phase);
          if (phaseModules.length === 0) return null;
          const phaseBadge = getPhaseBadgeStyle(phase);
          return (
            <CommandGroup key={phase} heading={`Modules — ${phase === 'MVP' ? 'Core' : phase}`}>
              {phaseModules.map((mod) => {
                const IconComp = ICON_MAP[mod.icon] || LayoutDashboard;
                return (
                  <CommandItem
                    key={mod.id}
                    value={`module-${mod.name}-${mod.shortName}-${mod.description}`}
                    onSelect={() => handleSelect(() => setActiveModule(mod.id as ModuleId))}
                    className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
                  >
                    <div
                      className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0"
                      style={{
                        backgroundColor: `${mod.color}15`,
                        border: `1px solid ${mod.color}25`,
                      }}
                    >
                      <IconComp className="size-3.5 shrink-0" style={{ color: mod.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{mod.name}</span>
                      <span className="block text-[10px] text-zinc-500 truncate">{mod.description}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-2 text-[9px] h-5 px-1.5 font-bold tabular-nums shrink-0 border-current/20"
                      style={{ color: phaseBadge.color, backgroundColor: phaseBadge.bgColor }}
                    >
                      {phase === 'Phase 2' ? 'P2' : phase === 'Phase 3' ? 'P3' : 'MVP'}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}

        {/* Municipalities */}
        <CommandGroup heading="Municipalities">
          {MOCK_MUNICIPALITIES.map((muni) => {
            const dotColor = getFHSDotColor(muni.financialHealthScore);
            return (
              <CommandItem
                key={`muni-${muni.id}`}
                value={`municipality-${muni.name}-${muni.code}-${muni.province}`}
                onSelect={() => handleSelect(() => setActiveModule('munilens'))}
                className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
              >
                <div
                  className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0"
                  style={{
                    backgroundColor: `${dotColor}12`,
                    border: `1px solid ${dotColor}20`,
                  }}
                >
                  <Building2 className="size-3.5 shrink-0" style={{ color: dotColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{muni.name}</span>
                  <span className="block text-[10px] text-zinc-500 truncate">
                    {muni.province} · {muni.category === 'A' ? 'Metro' : muni.category === 'B' ? 'Local' : 'District'}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 text-[9px] h-5 px-1.5 font-bold tabular-nums shrink-0 border-current/20"
                  style={{ color: dotColor, backgroundColor: `${dotColor}12` }}
                >
                  FHS {muni.financialHealthScore ?? '—'}
                </Badge>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Tenders */}
        <CommandGroup heading="Tenders">
          {MOCK_TENDERS.map((tender) => {
            const statusColor =
              tender.status === 'Active' ? '#10B981' :
              tender.status === 'Awarded' ? '#3B82F6' :
              tender.status === 'Cancelled' ? '#EF4444' : '#71717a';
            return (
              <CommandItem
                key={`tender-${tender.id}`}
                value={`tender-${tender.title}-${tender.buyerName}-${tender.category}`}
                onSelect={() => handleSelect(() => setActiveModule('tenderlens'))}
                className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
              >
                <div
                  className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0"
                  style={{
                    backgroundColor: `${statusColor}12`,
                    border: `1px solid ${statusColor}20`,
                  }}
                >
                  <FileSearch className="size-3.5 shrink-0" style={{ color: statusColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{tender.title}</span>
                  <span className="block text-[10px] text-zinc-500 truncate">
                    {tender.buyerName} · {tender.category}
                  </span>
                </div>
                {tender.estimatedValue && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-[9px] h-5 px-1.5 font-bold tabular-nums shrink-0 border-current/20"
                    style={{ color: '#B45309', backgroundColor: 'rgba(180,83,9,0.12)' }}
                  >
                    {formatCompactZAR(tender.estimatedValue)}
                  </Badge>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Risk Signals */}
        <CommandGroup heading="Risk Signals">
          {MOCK_RISK_SIGNALS.map((signal) => {
            const severityColor =
              signal.severity === 'Critical' ? '#EF4444' :
              signal.severity === 'High' ? '#F97316' :
              signal.severity === 'Medium' ? '#F59E0B' : '#22C55E';
            return (
              <CommandItem
                key={`risk-${signal.id}`}
                value={`risk-${signal.type}-${signal.entityId}-${signal.description}`}
                onSelect={() => handleSelect(() => setActiveModule('risklens'))}
                className="text-zinc-300 hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06] cursor-pointer rounded-md"
              >
                <div
                  className="mr-2 flex size-6 items-center justify-center rounded-md shrink-0"
                  style={{
                    backgroundColor: `${severityColor}12`,
                    border: `1px solid ${severityColor}20`,
                  }}
                >
                  <ShieldAlert className="size-3.5 shrink-0" style={{ color: severityColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{signal.type}</span>
                  <span className="block text-[10px] text-zinc-500 truncate">
                    {signal.entityId} · {signal.description.slice(0, 50)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 text-[9px] h-5 px-1.5 font-bold shrink-0 border-current/20"
                  style={{ color: severityColor, backgroundColor: `${severityColor}12` }}
                >
                  {signal.severity}
                </Badge>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>

      {/* Footer hint */}
      <div className="border-t border-white/[0.06] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center size-4 bg-white/[0.06] border border-white/[0.1] rounded text-[8px] font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center size-4 bg-white/[0.06] border border-white/[0.1] rounded text-[8px] font-mono">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center size-4 bg-white/[0.06] border border-white/[0.1] rounded text-[8px] font-mono">Esc</kbd>
            Close
          </span>
        </div>
        <span className="text-[10px] text-zinc-700">
          Ctrl+K to toggle
        </span>
      </div>
    </CommandDialog>
  );
}
