'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { getScoreBand } from '@/lib/formatters';
import { useWatchlistStore } from '@/store/watchlist';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { ModuleId, Municipality } from '@/types';

// ── Helper: Score band dot color ──────────────────────────────────────────

function getScoreDotColor(score: number | null): string {
  if (score === null) return '#71717a';
  if (score >= 65) return '#22C55E';
  if (score >= 45) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
}

// ── Helper: Mini audit outcome badge ──────────────────────────────────────

function getAuditMiniStyle(outcome: string | null): { color: string; bgColor: string } {
  switch (outcome) {
    case 'Clean': return { color: '#10B981', bgColor: 'rgba(16,185,129,0.12)' };
    case 'Unqualified': return { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)' };
    case 'Qualified': return { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)' };
    case 'Adverse': return { color: '#F97316', bgColor: 'rgba(249,115,22,0.12)' };
    case 'Disclaimer': return { color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)' };
    default: return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)' };
  }
}

// ── Watchlist Item ────────────────────────────────────────────────────────

function WatchlistItem({
  muni,
  editMode,
  onNavigate,
}: {
  muni: Municipality;
  editMode: boolean;
  onNavigate: () => void;
}) {
  const { removeFromWatchlist } = useWatchlistStore();
  const fhsBand = getScoreBand(muni.financialHealthScore);
  const dotColor = getScoreDotColor(muni.financialHealthScore);
  const auditStyle = getAuditMiniStyle(muni.auditOutcome);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group/item relative flex items-center gap-2.5 rounded-lg border border-white/[0.06] p-2.5',
        'hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer'
      )}
      style={{ borderLeft: `3px solid ${dotColor}` }}
      onClick={editMode ? undefined : onNavigate}
    >
      {/* Colored dot */}
      <div
        className="size-2.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 4px ${dotColor}40` }}
      />

      {/* Name + province */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate leading-snug">
          {muni.name}
        </p>
        <p className="text-[10px] text-zinc-500 truncate">{muni.province}</p>
      </div>

      {/* FHS Score Badge */}
      <Badge
        variant="outline"
        className="text-[9px] h-5 px-1.5 font-bold tabular-nums shrink-0 border-current/20"
        style={{ color: dotColor, backgroundColor: `${dotColor}12` }}
      >
        FHS {muni.financialHealthScore ?? '—'}
      </Badge>

      {/* Audit mini badge */}
      <div
        className="flex items-center justify-center rounded px-1 h-5 text-[8px] font-bold shrink-0"
        style={{ color: auditStyle.color, backgroundColor: auditStyle.bgColor }}
      >
        {(muni.auditOutcome || 'N/A').slice(0, 3).toUpperCase()}
      </div>

      {/* Remove button (edit mode or hover) */}
      <div
        className={cn(
          'shrink-0 transition-opacity duration-200',
          editMode ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          onClick={(e) => {
            e.stopPropagation();
            removeFromWatchlist(muni.id);
          }}
        >
          <X className="size-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Watchlist Widget ─────────────────────────────────────────────────

export default function WatchlistWidget() {
  const { watchlistMunis, addToWatchlist } = useWatchlistStore();
  const { setActiveModule } = useNavigationStore();
  const [editMode, setEditMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  // Resolve watched municipalities
  const watchedMunicipalities = useMemo(() => {
    return watchlistMunis
      .map((id) => MOCK_MUNICIPALITIES.find((m) => m.id === id))
      .filter((m): m is Municipality => m !== undefined);
  }, [watchlistMunis]);

  // Available municipalities to add (not already in watchlist)
  const availableMunicipalities = useMemo(() => {
    return MOCK_MUNICIPALITIES.filter((m) => !watchlistMunis.includes(m.id));
  }, [watchlistMunis]);

  const visibleItems = watchedMunicipalities.slice(0, 5);
  const hasMore = watchedMunicipalities.length > 5;

  const handleNavigate = () => {
    setActiveModule('munilens' as ModuleId);
  };

  const handleAddMunicipality = (id: string) => {
    addToWatchlist(id);
    setAddPopoverOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 h-full overflow-hidden relative">
        {/* Accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #D97706, #F59E0B, transparent)' }}
        />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#D97706]/10 border border-[#D97706]/20">
                <Eye className="size-3.5 text-[#D97706]" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  Watchlist
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 font-bold border-[#D97706]/30 text-[#D97706] bg-[#D97706]/10 tabular-nums"
                  >
                    {watchlistMunis.length}
                  </Badge>
                </CardTitle>
                <p className="text-[10px] text-zinc-400">
                  Tracked municipalities
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              {/* Edit toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-6 px-2 text-[10px] font-semibold transition-all duration-200',
                  editMode
                    ? 'text-[#D97706] bg-[#D97706]/10 hover:bg-[#D97706]/20'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
                )}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Done' : 'Edit'}
              </Button>

              {/* Collapse toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronUp className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="pt-0">
                {watchedMunicipalities.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
                      <Plus className="size-5 text-zinc-500" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">
                      Add municipalities to your watchlist
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Track key metrics for municipalities you care about
                    </p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        <AnimatePresence>
                          {visibleItems.map((muni) => (
                            <WatchlistItem
                              key={muni.id}
                              muni={muni}
                              editMode={editMode}
                              onNavigate={handleNavigate}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>

                    {hasMore && (
                      <button
                        onClick={handleNavigate}
                        className="group flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors mt-2"
                      >
                        <span className="relative">
                          View all {watchedMunicipalities.length} municipalities
                          <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
                        </span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </>
                )}

                {/* Add button */}
                <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-[10px] font-semibold text-zinc-400 hover:text-[#D97706] hover:bg-[#D97706]/10 border border-dashed border-white/[0.08] hover:border-[#D97706]/30 transition-all duration-200"
                    >
                      <Plus className="size-3 mr-1" />
                      Add Municipality
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-72 p-0 bg-[#0d1224] border-white/[0.08] shadow-xl"
                    align="start"
                  >
                    <Command className="bg-transparent">
                      <CommandInput
                        placeholder="Search municipalities..."
                        className="text-xs"
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-[11px] text-zinc-500 py-3 text-center">
                          No municipalities found.
                        </CommandEmpty>
                        <CommandGroup>
                          {availableMunicipalities.map((muni) => {
                            const dotColor = getScoreDotColor(muni.financialHealthScore);
                            return (
                              <CommandItem
                                key={muni.id}
                                value={`${muni.name} ${muni.code} ${muni.province}`}
                                onSelect={() => handleAddMunicipality(muni.id)}
                                className="text-zinc-300 text-xs cursor-pointer"
                              >
                                <div
                                  className="mr-2 size-2 rounded-full shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                                <span className="flex-1">{muni.name}</span>
                                <span className="text-[10px] text-zinc-600 ml-1">
                                  {muni.code}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
