'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  GitCompareArrows,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  DollarSign,
  Droplets,
  Users,
  Gavel,
  MapPin,
  Building2,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import {
  formatZAR,
  formatCompactZAR,
  formatNumber,
  formatPercent,
  formatPopulation,
  getScoreBand,
  getMuniCategoryLabel,
} from '@/lib/formatters';
import type { Municipality } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// ── Constants ───────────────────────────────────────────────────────────────

const MODULE_COLOR = '#7B2D8E';

const MUNICIPALITY_COLORS = ['#A855F7', '#3B82F6', '#10B981'];

// ── Helper: Score color ─────────────────────────────────────────────────────

function getScoreColor(score: number | null): string {
  if (score === null) return '#71717a';
  if (score >= 80) return '#10B981';
  if (score >= 65) return '#22C55E';
  if (score >= 45) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
}

// ── Helper: Audit outcome style ─────────────────────────────────────────────

function getAuditBadgeStyle(outcome: string | null): { color: string; bgColor: string } {
  if (!outcome) return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)' };
  switch (outcome) {
    case 'Clean': return { color: '#10B981', bgColor: 'rgba(16,185,129,0.12)' };
    case 'Unqualified': return { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)' };
    case 'Qualified': return { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)' };
    case 'Adverse': return { color: '#F97316', bgColor: 'rgba(249,115,22,0.12)' };
    case 'Disclaimer': return { color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)' };
    default: return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)' };
  }
}

// ── Helper: Section 139 style ───────────────────────────────────────────────

function getSection139BadgeStyle(status: string | null): { color: string; bgColor: string; icon: React.ReactNode } {
  if (!status || status === 'None') {
    return { color: '#10B981', bgColor: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 className="size-3" /> };
  }
  if (status === 'Warning') {
    return { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)', icon: <AlertTriangle className="size-3" /> };
  }
  if (status === 'Intervention') {
    return { color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)', icon: <AlertOctagon className="size-3" /> };
  }
  return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)', icon: <HelpCircle className="size-3" /> };
}

// ── Helper: Category badge ──────────────────────────────────────────────────

function getCategoryBadgeStyle(category: string): { color: string; bgColor: string } {
  switch (category) {
    case 'A': return { color: '#A855F7', bgColor: 'rgba(168,85,247,0.12)' };
    case 'B': return { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)' };
    case 'C': return { color: '#6B7280', bgColor: 'rgba(107,114,128,0.12)' };
    default: return { color: '#71717a', bgColor: 'rgba(113,113,122,0.12)' };
  }
}

// ── Score Comparison Bar ────────────────────────────────────────────────────

function ScoreComparisonBar({
  score,
  label,
  color,
  isWinner,
}: {
  score: number | null;
  label: string;
  color: string;
  isWinner: boolean;
}) {
  const scoreColor = getScoreColor(score);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          {isWinner && score !== null && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded"
            >
              BEST
            </motion.span>
          )}
          <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
            {score !== null ? score : '—'}
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: score !== null ? `${score}%` : '0%' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          className="h-full rounded-full"
          style={{ backgroundColor: isWinner ? '#10B981' : scoreColor }}
        />
        {isWinner && (
          <div className="absolute inset-0 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
        )}
      </div>
    </div>
  );
}

// ── Metric Row ──────────────────────────────────────────────────────────────

function MetricRow({
  label,
  values,
  bestFn,
  formatValue,
  highlightFn,
}: {
  label: string;
  values: (number | string | null)[];
  bestFn?: (val: number | string | null, all: (number | string | null)[]) => boolean;
  formatValue: (val: number | string | null, idx: number) => React.ReactNode;
  highlightFn?: (val: number | string | null) => string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-2 items-center py-2.5 border-b border-white/[0.04] last:border-0"
      style={{ gridTemplateColumns: `140px repeat(${values.length}, 1fr)` }}
    >
      <span className="text-xs text-zinc-400 font-medium truncate">{label}</span>
      {values.map((val, idx) => {
        const isBest = bestFn ? bestFn(val, values) : false;
        const highlight = highlightFn ? highlightFn(val) : null;
        return (
          <div
            key={idx}
            className={cn(
              'flex items-center justify-center',
              isBest && 'text-emerald-400',
            )}
          >
            <div
              className={cn(
                'px-2 py-1 rounded text-xs font-semibold tabular-nums text-center',
                isBest && 'bg-emerald-500/10 border border-emerald-500/20',
                highlight === 'red' && !isBest && 'text-red-400 bg-red-500/8',
                highlight === 'amber' && !isBest && 'text-amber-400 bg-amber-500/8',
              )}
            >
              {formatValue(val, idx)}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

interface MunicipalityComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedIds?: string[];
}

export default function MunicipalityComparisonModal({
  open,
  onOpenChange,
  preselectedIds = [],
}: MunicipalityComparisonModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(preselectedIds);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset selections when preselectedIds change
  React.useEffect(() => {
    if (preselectedIds.length > 0) {
      setSelectedIds(preselectedIds);
    }
  }, [preselectedIds]);

  const selectedMunicipalities = useMemo(() => {
    return selectedIds
      .map((id) => MOCK_MUNICIPALITIES.find((m) => m.id === id))
      .filter((m): m is Municipality => m !== undefined);
  }, [selectedIds]);

  const availableMunicipalities = useMemo(() => {
    return MOCK_MUNICIPALITIES.filter(
      (m) => !selectedIds.includes(m.id) && selectedIds.length < 3
    );
  }, [selectedIds]);

  const handleAddMunicipality = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.length >= 3 || prev.includes(id)) return prev;
      return [...prev, id];
    });
    setAddPopoverOpen(false);
  }, []);

  const handleRemoveMunicipality = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ── Best value determiners ──────────────────────────────────────────────

  const isBestScore = useCallback(
    (val: number | string | null, all: (number | string | null)[]) => {
      if (val === null || typeof val !== 'number') return false;
      const numVals = all.filter((v): v is number => v !== null && typeof v === 'number');
      return numVals.length > 1 && val === Math.max(...numVals);
    },
    []
  );

  const isBestLowest = useCallback(
    (val: number | string | null, all: (number | string | null)[]) => {
      if (val === null || typeof val !== 'number') return false;
      const numVals = all.filter((v): v is number => v !== null && typeof v === 'number');
      return numVals.length > 1 && val === Math.min(...numVals);
    },
    []
  );

  // ── Radar chart data ────────────────────────────────────────────────────

  const radarData = useMemo(() => {
    const dimensions = [
      { key: 'financialHealthScore', label: 'Financial Health' },
      { key: 'serviceDeliveryScore', label: 'Service Delivery' },
      { key: 'socioEconomicIndex', label: 'Socio-Economic' },
      { key: 'procurementScore', label: 'Procurement' },
      { key: 'climateRiskScore', label: 'Climate Risk' },
    ];

    return dimensions.map((dim) => {
      const row: Record<string, string | number> = { dimension: dim.label };
      selectedMunicipalities.forEach((muni, idx) => {
        row[`muni${idx}`] = (muni as Record<string, unknown>)[dim.key] as number ?? 0;
      });
      return row;
    });
  }, [selectedMunicipalities]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0',
          'bg-[#0d1224]/98 backdrop-blur-xl border-white/[0.08]',
          'shadow-2xl shadow-black/50'
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg z-10"
          style={{
            background: 'linear-gradient(90deg, #A855F7, #3B82F6, #10B981, transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#7B2D8E]/15 border border-[#7B2D8E]/25">
              <GitCompareArrows className="size-4.5 text-[#A855F7]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-100 tracking-tight">
                Municipality Comparison
              </DialogTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Compare 2–3 municipalities side by side across key metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Municipality */}
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.length >= 3}
                  className="h-8 text-xs font-semibold border-[#7B2D8E]/30 text-[#A855F7] hover:bg-[#7B2D8E]/10 hover:border-[#7B2D8E]/50 disabled:opacity-40"
                >
                  <Plus className="size-3.5 mr-1" />
                  Add Municipality
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 bg-[#0d1224] border-white/[0.08] shadow-xl"
                align="end"
              >
                <Command className="bg-transparent">
                  <CommandInput
                    placeholder="Search municipalities..."
                    className="text-xs"
                  />
                  <CommandList className="max-h-[240px]">
                    <CommandEmpty className="text-[11px] text-zinc-500 py-3 text-center">
                      No municipalities found.
                    </CommandEmpty>
                    <CommandGroup>
                      {availableMunicipalities.map((muni) => {
                        const dotColor = getScoreColor(muni.financialHealthScore);
                        return (
                          <CommandItem
                            key={muni.id}
                            value={`${muni.name} ${muni.code} ${muni.province}`}
                            onSelect={() => handleAddMunicipality(muni.id)}
                            className="text-zinc-300 text-xs cursor-pointer"
                          >
                            <div
                              className="mr-2 size-2.5 rounded-full shrink-0"
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

            {/* Clear All */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedIds.length === 0}
              className="h-8 text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 className="size-3.5 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {selectedMunicipalities.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#7B2D8E]/10 border border-[#7B2D8E]/20 mb-4">
                  <GitCompareArrows className="size-7 text-[#A855F7]/60" />
                </div>
                <h3 className="text-base font-semibold text-zinc-300 mb-1">
                  No municipalities selected
                </h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Use the &ldquo;Add Municipality&rdquo; button above to select 2–3 municipalities to compare.
                </p>
              </motion.div>
            ) : (
              <>
                {/* ── Municipality Headers ──────────────────────────────── */}
                <div
                  className="grid gap-3 items-start"
                  style={{ gridTemplateColumns: `140px repeat(${selectedMunicipalities.length}, 1fr)` }}
                >
                  <div /> {/* Spacer for label column */}
                  {selectedMunicipalities.map((muni, idx) => {
                    const color = MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length];
                    const auditStyle = getAuditBadgeStyle(muni.auditOutcome);
                    const catStyle = getCategoryBadgeStyle(muni.category);

                    return (
                      <motion.div
                        key={muni.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="relative rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4 overflow-hidden"
                      >
                        {/* Top accent */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
                          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                        />

                        {/* Background glow */}
                        <div
                          className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.06] blur-2xl"
                          style={{ backgroundColor: color }}
                        />

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveMunicipality(muni.id)}
                          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>

                        <div className="relative space-y-2">
                          {/* Color indicator dot */}
                          <div className="flex items-center gap-2">
                            <div
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}40` }}
                            />
                            <span className="text-[10px] font-mono text-zinc-500">{muni.code}</span>
                          </div>

                          {/* Name */}
                          <h3 className="text-sm font-bold text-zinc-100 leading-snug pr-6">
                            {muni.name}
                          </h3>

                          {/* Province */}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-zinc-500" />
                            <span className="text-[11px] text-zinc-400">{muni.province}</span>
                          </div>

                          {/* Badges row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold"
                              style={{ color: catStyle.color, backgroundColor: catStyle.bgColor }}
                            >
                              {getMuniCategoryLabel(muni.category)}
                            </div>
                            <div
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold"
                              style={{ color: auditStyle.color, backgroundColor: auditStyle.bgColor }}
                            >
                              {muni.auditOutcome || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Score Bars Comparison ────────────────────────────── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ background: `linear-gradient(180deg, ${MODULE_COLOR}, ${MODULE_COLOR}40)` }}
                    />
                    <h3 className="text-sm font-bold text-zinc-200">Score Comparison</h3>
                  </div>

                  {[
                    { key: 'financialHealthScore', label: 'Financial Health', icon: DollarSign },
                    { key: 'serviceDeliveryScore', label: 'Service Delivery', icon: Droplets },
                    { key: 'socioEconomicIndex', label: 'Socio-Economic', icon: Users },
                    { key: 'procurementScore', label: 'Procurement', icon: Gavel },
                  ].map((dim) => {
                    const scores = selectedMunicipalities.map(
                      (m) => (m as Record<string, unknown>)[dim.key] as number | null
                    );
                    const numScores = scores.filter((s): s is number => s !== null);
                    const bestScore = numScores.length > 0 ? Math.max(...numScores) : null;

                    return (
                      <motion.div
                        key={dim.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <dim.icon className="size-3.5 text-zinc-400" />
                          <span className="text-xs font-semibold text-zinc-300">{dim.label}</span>
                        </div>
                        <div
                          className="grid gap-4"
                          style={{ gridTemplateColumns: `repeat(${selectedMunicipalities.length}, 1fr)` }}
                        >
                          {selectedMunicipalities.map((muni, idx) => {
                            const score = (muni as Record<string, unknown>)[dim.key] as number | null;
                            const isWinner = score !== null && bestScore !== null && score === bestScore && numScores.length > 1;

                            return (
                              <div key={muni.id}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div
                                    className="size-2 rounded-full shrink-0"
                                    style={{ backgroundColor: MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length] }}
                                  />
                                  <span className="text-[10px] text-zinc-500 truncate">{muni.name}</span>
                                </div>
                                <ScoreComparisonBar
                                  score={score}
                                  label=""
                                  color={MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length]}
                                  isWinner={isWinner}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Detailed Metrics Table ────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #3B82F6, #3B82F640)' }}
                    />
                    <h3 className="text-sm font-bold text-zinc-200">Detailed Metrics</h3>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4">
                    {/* Audit Outcome */}
                    <MetricRow
                      label="Audit Outcome"
                      values={selectedMunicipalities.map((m) => m.auditOutcome)}
                      formatValue={(val) => {
                        if (!val || typeof val !== 'string') return '—';
                        const style = getAuditBadgeStyle(val);
                        return (
                          <span className="font-bold" style={{ color: style.color }}>{val}</span>
                        );
                      }}
                    />

                    {/* Population */}
                    <MetricRow
                      label="Population"
                      values={selectedMunicipalities.map((m) => m.population2022)}
                      bestFn={isBestScore}
                      formatValue={(val) => val !== null && typeof val === 'number' ? formatPopulation(val) : '—'}
                    />

                    {/* Cash Coverage Days */}
                    <MetricRow
                      label="Cash Coverage Days"
                      values={selectedMunicipalities.map((m) => m.cashCoverageDays)}
                      bestFn={isBestScore}
                      formatValue={(val) => val !== null && typeof val === 'number' ? `${val} days` : '—'}
                      highlightFn={(val) => {
                        if (val !== null && typeof val === 'number' && val < 30) return 'red';
                        return null;
                      }}
                    />

                    {/* Debtor Collection Rate */}
                    <MetricRow
                      label="Debtor Collection Rate"
                      values={selectedMunicipalities.map((m) => m.debtorCollectionRate)}
                      bestFn={isBestScore}
                      formatValue={(val) => val !== null && typeof val === 'number' ? formatPercent(val) : '—'}
                      highlightFn={(val) => {
                        if (val !== null && typeof val === 'number' && val < 80) return 'amber';
                        return null;
                      }}
                    />

                    {/* Section 139 Status */}
                    <MetricRow
                      label="Section 139 Status"
                      values={selectedMunicipalities.map((m) => m.section139Status)}
                      formatValue={(val) => {
                        const status = (val as string) || 'None';
                        const style = getSection139BadgeStyle(status);
                        return (
                          <span className="flex items-center gap-1 font-bold" style={{ color: style.color }}>
                            {style.icon}
                            {status}
                          </span>
                        );
                      }}
                    />

                    {/* Province */}
                    <MetricRow
                      label="Province"
                      values={selectedMunicipalities.map((m) => m.province)}
                      formatValue={(val) => (
                        <span className="text-zinc-300">{val as string || '—'}</span>
                      )}
                    />

                    {/* Category */}
                    <MetricRow
                      label="Category"
                      values={selectedMunicipalities.map((m) => m.category)}
                      formatValue={(val) => {
                        const cat = val as string;
                        const style = getCategoryBadgeStyle(cat);
                        return (
                          <span className="font-bold" style={{ color: style.color }}>
                            {getMuniCategoryLabel(cat)}
                          </span>
                        );
                      }}
                    />

                    {/* Operating Budget */}
                    <MetricRow
                      label="Operating Budget"
                      values={selectedMunicipalities.map((m) => m.operatingBudget)}
                      bestFn={isBestScore}
                      formatValue={(val) => val !== null && typeof val === 'number' ? formatCompactZAR(val) : '—'}
                    />

                    {/* Capital Budget */}
                    <MetricRow
                      label="Capital Budget"
                      values={selectedMunicipalities.map((m) => m.capitalBudget)}
                      bestFn={isBestScore}
                      formatValue={(val) => val !== null && typeof val === 'number' ? formatCompactZAR(val) : '—'}
                    />
                  </div>
                </div>

                {/* ── Radar Chart ──────────────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #10B981, #10B98140)' }}
                    />
                    <h3 className="text-sm font-bold text-zinc-200">Multi-Dimensional Radar</h3>
                    <span className="text-[10px] text-zinc-500">5 key dimensions compared</span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: '#52525b', fontSize: 8 }}
                          axisLine={false}
                        />
                        {selectedMunicipalities.map((_, idx) => (
                          <Radar
                            key={idx}
                            name={selectedMunicipalities[idx]?.name || `Muni ${idx + 1}`}
                            dataKey={`muni${idx}`}
                            stroke={MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length]}
                            fill={MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length]}
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        ))}
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(13, 18, 36, 0.95)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#e4e4e7',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-white/[0.06]">
                      {selectedMunicipalities.map((muni, idx) => (
                        <div key={muni.id} className="flex items-center gap-1.5">
                          <div
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor: MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length],
                              boxShadow: `0 0 4px ${MUNICIPALITY_COLORS[idx % MUNICIPALITY_COLORS.length]}40`,
                            }}
                          />
                          <span className="text-[10px] text-zinc-400 font-medium">{muni.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
