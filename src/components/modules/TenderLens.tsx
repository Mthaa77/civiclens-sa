'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Building2,
  Tag,
  Star,
  Save,
  ArrowUpDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_TENDERS,
  MOCK_MUNICIPALITIES,
  MOCK_SUPPLIERS,
} from '@/lib/mock-data';
import {
  SA_PROVINCES,
  TENDER_CATEGORIES,
} from '@/types';
import {
  formatZAR,
  formatCompactZAR,
  formatSADate,
  formatRelativeDate,
  formatPercent,
  getTenderStatusStyle,
  getScoreBand,
  truncate,
} from '@/lib/formatters';
import { useTenderFilterStore } from '@/store/tender-filters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Tender } from '@/types';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

const cardFadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

// ── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;
const VALUE_MIN = 0;
const VALUE_MAX = 500_000_000;
const VALUE_STEP = 1_000_000;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'value-desc', label: 'Value (High → Low)' },
  { value: 'value-asc', label: 'Value (Low → High)' },
  { value: 'closing-soon', label: 'Closing Soon' },
  { value: 'recently-published', label: 'Recently Published' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];
type ViewMode = 'grid' | 'list';

const BBLEE_OPTIONS = [
  'Level 1',
  'Level 1-2',
  'Level 1-3',
  'Level 1-4',
  'Level 2',
  'Level 3',
  'Level 4',
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDaysUntilClosing(closingDate: string | null): number | null {
  if (!closingDate) return null;
  const closing = new Date(closingDate);
  const now = new Date();
  return Math.ceil((closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getValueBand(value: number | null): { label: string; color: string } {
  if (value === null) return { label: 'Unknown', color: 'text-zinc-400' };
  if (value >= 100_000_000) return { label: 'Major', color: 'text-amber-400' };
  if (value >= 10_000_000) return { label: 'Mid', color: 'text-emerald-400' };
  return { label: 'Small', color: 'text-zinc-400' };
}

function getRecommendationStyle(rec: string | null): {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  if (!rec) return { color: '', bgColor: '', borderColor: '', icon: null };
  const lower = rec.toLowerCase();
  if (lower.includes('strong') || lower.includes('consider bidding')) {
    return {
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/25',
      icon: <CheckCircle2 className="size-3.5" />,
    };
  }
  if (lower.includes('caution') || lower.includes('risk pricing') || lower.includes('compliance')) {
    return {
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/25',
      icon: <AlertTriangle className="size-3.5" />,
    };
  }
  if (lower.includes('high risk') || lower.includes('proceed only with guarantees')) {
    return {
      color: 'text-red-300',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/25',
      icon: <XCircle className="size-3.5" />,
    };
  }
  return {
    color: 'text-zinc-300',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/25',
    icon: <Eye className="size-3.5" />,
  };
}

function getConfidenceColor(score: number | null): string {
  if (score === null) return '#71717a';
  if (score >= 0.75) return '#10B981';
  if (score >= 0.55) return '#F59E0B';
  return '#EF4444';
}

// ── Sub-Components ──────────────────────────────────────────────────────────

// ── Filter Bar ──────────────────────────────────────────────────────────────

function FilterBar() {
  const { filters, setFilters, resetFilters } = useTenderFilterStore();
  const [valueRange, setValueRange] = useState<[number, number]>(filters.valueRange);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.province) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.valueRange[0] > VALUE_MIN || filters.valueRange[1] < VALUE_MAX) count++;
    if (filters.bbbeeLevel) count++;
    return count;
  }, [filters]);

  const handleValueChange = useCallback(
    (val: number[]) => {
      setValueRange([val[0], val[1]]);
    },
    [],
  );

  const handleValueCommit = useCallback(
    (val: number[]) => {
      setFilters({ valueRange: [val[0], val[1]] });
    },
    [setFilters],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-20 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-4"
    >
      <div className="bg-[#0a0e1a]/95 backdrop-blur-xl px-4 lg:px-6 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundImage: 'linear-gradient(to right, #2D6A4F20, transparent)' }}>
        {/* Primary search row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              placeholder="Search tenders by title, buyer, description..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 h-10 bg-white/[0.04] border-white/[0.08] text-zinc-200 placeholder:text-zinc-500 text-sm focus-visible:border-[#2D6A4F]/50 focus-visible:ring-[#2D6A4F]/30 focus-visible:shadow-[0_0_12px_rgba(45,106,79,0.15)]"
            />
          </div>

          <Select
            value={filters.province || '__all__'}
            onValueChange={(v) => setFilters({ province: v === '__all__' ? '' : v })}
          >
            <SelectTrigger className="w-[160px] h-9 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
              <MapPin className="size-3.5 mr-1 text-zinc-400" />
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="__all__" className="text-zinc-400 text-xs">All Provinces</SelectItem>
              {SA_PROVINCES.map((p) => (
                <SelectItem key={p} value={p} className="text-zinc-300 text-xs">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category || '__all__'}
            onValueChange={(v) => setFilters({ category: v === '__all__' ? '' : v })}
          >
            <SelectTrigger className="w-[170px] h-9 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
              <Tag className="size-3.5 mr-1 text-zinc-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="__all__" className="text-zinc-400 text-xs">All Categories</SelectItem>
              {TENDER_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-zinc-300 text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || '__all__'}
            onValueChange={(v) => setFilters({ status: v === '__all__' ? '' : v })}
          >
            <SelectTrigger className="w-[130px] h-9 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="__all__" className="text-zinc-400 text-xs">All Statuses</SelectItem>
              <SelectItem value="Active" className="text-emerald-400 text-xs">Active</SelectItem>
              <SelectItem value="Awarded" className="text-blue-400 text-xs">Awarded</SelectItem>
              <SelectItem value="Cancelled" className="text-red-400 text-xs">Cancelled</SelectItem>
              <SelectItem value="Closed" className="text-zinc-400 text-xs">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={cn(
              'h-9 px-3 text-xs border border-white/[0.08] hover:bg-white/[0.06]',
              filtersExpanded ? 'bg-white/[0.06] text-zinc-200' : 'text-zinc-400',
            )}
          >
            <Filter className="size-3.5 mr-1.5" />
            More Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1.5 size-5 p-0 flex items-center justify-center bg-[#2D6A4F] text-white text-[9px] border-0 animate-pulse shadow-[0_0_6px_rgba(45,106,79,0.5)]">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'size-3 ml-1 transition-transform',
                filtersExpanded && 'rotate-180',
              )}
            />
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetFilters();
                setValueRange([VALUE_MIN, VALUE_MAX]);
              }}
              className="h-9 px-3 text-xs text-zinc-500 hover:text-zinc-300"
            >
              <RotateCcw className="size-3 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Expanded filters row */}
        <AnimatePresence>
          {filtersExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 flex-wrap pt-3 border-t border-white/[0.06] mt-3">
                {/* Value Range Slider */}
                <div className="flex items-center gap-3 min-w-[300px]">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium whitespace-nowrap">
                    Value Range
                  </span>
                  <Slider
                    min={VALUE_MIN}
                    max={VALUE_MAX}
                    step={VALUE_STEP}
                    value={valueRange}
                    onValueChange={handleValueChange}
                    onValueCommit={handleValueCommit}
                    className="flex-1 [&_[data-slot=slider-track]]:bg-white/[0.06] [&_[data-slot=slider-range]]:bg-[#2D6A4F] [&_[data-slot=slider-thumb]]:border-[#2D6A4F] [&_[data-slot=slider-thumb]]:bg-[#0a0e1a]"
                  />
                  <span className="text-[11px] text-zinc-400 tabular-nums whitespace-nowrap font-medium">
                    {formatCompactZAR(valueRange[0])} — {formatCompactZAR(valueRange[1])}
                  </span>
                </div>

                {/* B-BBEE Level Filter */}
                <Select
                  value={filters.bbbeeLevel || '__all__'}
                  onValueChange={(v) => setFilters({ bbbeeLevel: v === '__all__' ? '' : v })}
                >
                  <SelectTrigger className="w-[140px] h-8 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
                    <Shield className="size-3 mr-1 text-zinc-400" />
                    <SelectValue placeholder="B-BBEE" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                    <SelectItem value="__all__" className="text-zinc-400 text-xs">Any Level</SelectItem>
                    {BBLEE_OPTIONS.map((l) => (
                      <SelectItem key={l} value={l} className="text-zinc-300 text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Save Search Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
                      >
                        <BookmarkPlus className="size-3.5 mr-1.5" />
                        Save Search
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#0d1224] border-white/[0.08] text-zinc-300 text-xs">
                      Save current filters for quick access
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Results Summary Bar ─────────────────────────────────────────────────────

function ResultsSummaryBar({
  filteredCount,
  totalCount,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
}: {
  filteredCount: number;
  totalCount: number;
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="flex items-center justify-between gap-3 py-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">
          Showing{' '}
          <span className="text-white font-bold tabular-nums">{filteredCount}</span>
          {' '}of{' '}
          <span className="text-white font-bold tabular-nums">{totalCount}</span>
          {' '}tenders
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[180px] h-8 bg-white/[0.03] border-white/[0.06] text-zinc-400 text-xs">
            <ArrowUpDown className="size-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1224] border-white/[0.08]">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-zinc-300 text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center border border-white/[0.08] rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'flex items-center justify-center size-8 transition-all duration-200',
              viewMode === 'grid'
                ? 'bg-[#2D6A4F]/20 text-[#4ade80] shadow-[0_0_8px_rgba(45,106,79,0.3)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]',
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex items-center justify-center size-8 transition-all duration-200',
              viewMode === 'list'
                ? 'bg-[#2D6A4F]/20 text-[#4ade80] shadow-[0_0_8px_rgba(45,106,79,0.3)]'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]',
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tender Card ─────────────────────────────────────────────────────────────

function TenderCard({
  tender,
  viewMode,
  onExpand,
}: {
  tender: Tender;
  viewMode: ViewMode;
  onExpand: (t: Tender) => void;
}) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const statusStyle = getTenderStatusStyle(tender.status);
  const daysUntilClosing = getDaysUntilClosing(tender.closingDate);
  const valueBand = getValueBand(tender.estimatedValue);
  const recStyle = getRecommendationStyle(tender.bidRecommendation);
  const confidenceColor = getConfidenceColor(tender.confidenceScore);

  const isGrid = viewMode === 'grid';

  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group"
    >
      <div
        onClick={() => onExpand(tender)}
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.06] cursor-pointer',
          'bg-white/[0.02] backdrop-blur-sm',
          'hover:border-[#2D6A4F]/30 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(45,106,79,0.1)]',
          'transition-all duration-300',
          isGrid ? 'p-4' : 'p-4 flex gap-4',
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(90deg, ${tender.status === 'Active' ? '#10B981' : tender.status === 'Awarded' ? '#3B82F6' : tender.status === 'Cancelled' ? '#EF4444' : '#6B7280'}, transparent)`,
          }}
        />

        {/* Background glow on hover */}
        <div className="absolute -top-12 -right-12 size-32 rounded-full opacity-0 group-hover:opacity-[0.08] blur-2xl transition-opacity duration-500 bg-[#2D6A4F]" />

        {/* Diagonal pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 11px)' }} />

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {isGrid ? (
          /* ── Grid Layout ── */
          <div className="relative space-y-3">
            {/* Header: Status + Category */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'text-[10px] h-6 px-2 font-semibold border',
                    statusStyle.bgColor,
                    statusStyle.color,
                    'border-current/20',
                    tender.status === 'Active' && 'shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse',
                  )}
                  variant="outline"
                >
                  {tender.status === 'Active' && (
                    <span className="size-1.5 rounded-full bg-emerald-400 mr-1" />
                  )}
                  {tender.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[9px] h-5 px-1.5 border-white/[0.10] text-zinc-400"
                >
                  {tender.category}
                </Badge>
              </div>
              {valueBand && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn('text-[9px] font-bold uppercase tracking-wider', valueBand.color)}>
                        {valueBand.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#0d1224] border-white/[0.08] text-zinc-300 text-xs">
                      Value band: {valueBand.label} ({formatCompactZAR(tender.estimatedValue)})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {tender.title}
            </h3>

            {/* Buyer */}
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3 text-zinc-400" />
              <span className="text-xs text-zinc-400 truncate">{tender.buyerName}</span>
            </div>

            {/* Value */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#B45309] tabular-nums drop-shadow-[0_0_6px_rgba(180,83,9,0.3)]">
                {formatCompactZAR(tender.estimatedValue)}
              </span>
              {tender.awardValue && (
                <span className="text-[10px] text-zinc-400">
                  (Awarded: {formatCompactZAR(tender.awardValue)})
                </span>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-zinc-400">
                <Clock className="size-3" />
                <span>Published {formatSADate(tender.publishedDate)}</span>
              </div>
              {tender.closingDate && (
                <div
                  className={cn(
                    'flex items-center gap-1',
                    daysUntilClosing !== null && daysUntilClosing <= 14
                      ? 'text-amber-400'
                      : 'text-zinc-500',
                  )}
                >
                  <span>•</span>
                  <span>
                    {tender.status === 'Active'
                      ? `Closes ${formatRelativeDate(tender.closingDate)}`
                      : `Closed ${formatSADate(tender.closingDate)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Province + B-BBEE */}
            <div className="flex items-center gap-2 flex-wrap">
              {tender.province && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <MapPin className="size-2.5" />
                  <span>{tender.province}</span>
                </div>
              )}
              {tender.bbbeeRequirement && (
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1.5 border-[#2D6A4F]/40 text-[#4ade80] bg-[#2D6A4F]/10 shadow-[0_0_6px_rgba(45,106,79,0.2)]"
                >
                  <Shield className="size-2.5 mr-0.5" />
                  B-BBEE {tender.bbbeeRequirement}
                </Badge>
              )}
            </div>

            {/* AI Summary (collapsed) */}
            {tender.aiSummary && (
              <div className="pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSummaryExpanded(!summaryExpanded);
                  }}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-400 transition-colors"
                >
                  <Sparkles className="size-3 text-[#2D6A4F]/60" />
                  <span>AI Summary</span>
                  {summaryExpanded ? (
                    <ChevronUp className="size-2.5" />
                  ) : (
                    <ChevronDown className="size-2.5" />
                  )}
                </button>
                <AnimatePresence>
                  {summaryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 pl-4 border-l-2 border-[#2D6A4F]/20">
                        {tender.aiSummary}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bid/No-Bid + Confidence */}
            {tender.bidRecommendation && (
              <div className="flex items-center gap-2 pt-1">
                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2 py-1 border text-[10px] font-medium',
                    recStyle.bgColor,
                    recStyle.color,
                    recStyle.borderColor,
                  )}
                >
                  {recStyle.icon}
                  <span className="line-clamp-1">{truncate(tender.bidRecommendation, 35)}</span>
                </div>
                {tender.confidenceScore !== null && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-2 rounded-full bg-white/[0.06] overflow-hidden shadow-[inset_0_0_3px_rgba(0,0,0,0.3)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${tender.confidenceScore * 100}%` }}
                              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                              className="h-full rounded-full shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                              style={{ backgroundColor: confidenceColor }}
                            />
                          </div>
                          <span
                            className="text-[9px] font-semibold tabular-nums"
                            style={{ color: confidenceColor }}
                          >
                            {Math.round(tender.confidenceScore * 100)}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#0d1224] border-white/[0.08] text-zinc-300 text-xs">
                        AI confidence: {Math.round(tender.confidenceScore * 100)}%
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── List Layout ── */
          <div className="relative flex items-start gap-4 flex-1 min-w-0">
            {/* Left: Status indicator */}
            <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
              <div
                className={cn(
                  'size-2.5 rounded-full',
                  tender.status === 'Active' && 'bg-emerald-400 animate-pulse-glow',
                  tender.status === 'Awarded' && 'bg-blue-400',
                  tender.status === 'Cancelled' && 'bg-red-400',
                  tender.status === 'Closed' && 'bg-zinc-500',
                )}
              />
            </div>

            {/* Center: Main info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">
                  {tender.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={cn(
                    'text-[9px] h-4 px-1.5 font-semibold border',
                    statusStyle.bgColor,
                    statusStyle.color,
                    'border-current/20',
                  )}
                  variant="outline"
                >
                  {tender.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-400"
                >
                  {tender.category}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Building2 className="size-3" />
                  <span className="truncate max-w-[200px]">{tender.buyerName}</span>
                </div>
                {tender.province && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <MapPin className="size-2.5" />
                    <span>{tender.province}</span>
                  </div>
                )}
                {tender.bbbeeRequirement && (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 border-[#2D6A4F]/30 text-[#2D6A4F] bg-[#2D6A4F]/5"
                  >
                    B-BBEE {tender.bbbeeRequirement}
                  </Badge>
                )}
              </div>

              {tender.aiSummary && (
                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-1">
                  <Sparkles className="size-3 text-[#2D6A4F]/40 inline mr-1" />
                  {tender.aiSummary}
                </p>
              )}

              {tender.bidRecommendation && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-0.5 border text-[9px] font-medium',
                      recStyle.bgColor,
                      recStyle.color,
                      recStyle.borderColor,
                    )}
                  >
                    {recStyle.icon}
                    <span>{truncate(tender.bidRecommendation, 40)}</span>
                  </div>
                  {tender.confidenceScore !== null && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${tender.confidenceScore * 100}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: confidenceColor }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-semibold tabular-nums"
                        style={{ color: confidenceColor }}
                      >
                        {Math.round(tender.confidenceScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Value + Dates */}
            <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[120px]">
              <span className="text-lg font-bold text-[#B45309] tabular-nums">
                {formatCompactZAR(tender.estimatedValue)}
              </span>
              <span className={cn('text-[10px]', valueBand.color, 'font-semibold uppercase tracking-wider')}>
                {valueBand.label}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <Clock className="size-2.5" />
                {tender.status === 'Active' && tender.closingDate
                  ? `Closes ${formatRelativeDate(tender.closingDate)}`
                  : formatSADate(tender.closingDate)}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Tender Detail Panel (Sheet) ─────────────────────────────────────────────

function TenderDetailPanel({
  tender,
  open,
  onClose,
}: {
  tender: Tender | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!tender) return null;

  const statusStyle = getTenderStatusStyle(tender.status);
  const recStyle = getRecommendationStyle(tender.bidRecommendation);
  const confidenceColor = getConfidenceColor(tender.confidenceScore);
  const daysUntilClosing = getDaysUntilClosing(tender.closingDate);

  // Find municipality for buyer intelligence
  const municipality = tender.municipalityCode
    ? MOCK_MUNICIPALITIES.find((m) => m.code === tender.municipalityCode)
    : null;

  // Find top suppliers related to this buyer's province or category
  const relatedSuppliers = MOCK_SUPPLIERS.filter(
    (s) => s.province === tender.province,
  )
    .sort((a, b) => (b.totalAwardValue ?? 0) - (a.totalAwardValue ?? 0))
    .slice(0, 3);

  // Find related tenders from same buyer
  const buyerTenders = MOCK_TENDERS.filter(
    (t) => t.buyerName === tender.buyerName && t.id !== tender.id,
  );

  // Municipality financial health band
  const muniHealthBand = municipality ? getScoreBand(municipality.financialHealthScore) : null;
  const muniProcurementBand = municipality ? getScoreBand(municipality.procurementScore) : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] bg-[#0a0e1a] border-white/[0.06] p-0"
      >
        <SheetHeader className="p-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              className={cn(
                'text-[10px] h-5 px-2 font-semibold border',
                statusStyle.bgColor,
                statusStyle.color,
                'border-current/20',
              )}
              variant="outline"
            >
              {tender.status === 'Active' && (
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-glow mr-1" />
              )}
              {tender.status}
            </Badge>
            <Badge
              variant="outline"
              className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400"
            >
              {tender.category}
            </Badge>
            <span className="text-[10px] text-zinc-400 ml-auto font-mono">{tender.ocid}</span>
          </div>
          <SheetTitle className="text-base font-semibold text-zinc-100 leading-snug">
            {tender.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Full details for tender {tender.ocid}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="p-4 space-y-5">
            {/* Value & Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  Estimated Value
                </p>
                <p className="text-xl font-bold text-[#B45309] tabular-nums mt-1">
                  {formatZAR(tender.estimatedValue)}
                </p>
                {tender.awardValue && (
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    Awarded: {formatZAR(tender.awardValue)}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  Closing Date
                </p>
                <p className="text-sm font-semibold text-zinc-200 mt-1">
                  {formatSADate(tender.closingDate)}
                </p>
                {tender.status === 'Active' && daysUntilClosing !== null && (
                  <p
                    className={cn(
                      'text-[10px] font-medium mt-0.5',
                      daysUntilClosing <= 7
                        ? 'text-red-400'
                        : daysUntilClosing <= 14
                          ? 'text-amber-400'
                          : 'text-zinc-500',
                    )}
                  >
                    {daysUntilClosing > 0 ? `${daysUntilClosing} days remaining` : 'Closed'}
                  </p>
                )}
              </div>
            </div>

            {/* Tender Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Tender Details
              </h4>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[11px]">
                <div>
                  <span className="text-zinc-400">Buyer</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{tender.buyerName}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Province</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{tender.province || '—'}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Published</span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {formatSADate(tender.publishedDate)}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">Contract Period</span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {tender.contractPeriodDays
                      ? `${tender.contractPeriodDays} days (${Math.round((tender.contractPeriodDays / 30.44) * 10) / 10} months)`
                      : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">B-BBEE Requirement</span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {tender.bbbeeRequirement || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">Award Date</span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {formatSADate(tender.awardDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {tender.description}
              </p>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* AI Bid/No-Bid Recommendation */}
            {tender.bidRecommendation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
                    <Zap className="size-3 text-[#2D6A4F]" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    AI Bid Recommendation
                  </h4>
                </div>

                <div
                  className={cn(
                    'rounded-lg border p-3',
                    recStyle.bgColor,
                    recStyle.borderColor,
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {recStyle.icon}
                    <span className={cn('text-xs font-semibold', recStyle.color)}>
                      {tender.bidRecommendation}
                    </span>
                  </div>

                  {tender.aiSummary && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{tender.aiSummary}</p>
                  )}

                  {tender.confidenceScore !== null && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Confidence
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${tender.confidenceScore * 100}%` }}
                          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: confidenceColor }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: confidenceColor }}
                      >
                        {Math.round(tender.confidenceScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buyer Intelligence Panel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-[#B45309]/10 border border-[#B45309]/20">
                  <Building2 className="size-3 text-[#B45309]" />
                </div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Buyer Intelligence
                </h4>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Buyer:</span>
                  <span className="text-[11px] text-zinc-200 font-medium">{tender.buyerName}</span>
                </div>

                {/* Past 24 months awards from this buyer */}
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Past Awards (Sample Data)
                  </span>
                  {buyerTenders.length > 0 ? (
                    <div className="mt-1.5 space-y-1.5">
                      {buyerTenders.map((bt) => (
                        <div
                          key={bt.id}
                          className="flex items-center justify-between text-[10px] py-1 border-b border-white/[0.04] last:border-0"
                        >
                          <span className="text-zinc-400 truncate max-w-[240px]">
                            {bt.title}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <Badge
                              className={cn(
                                'text-[8px] h-4 px-1 font-semibold border',
                                getTenderStatusStyle(bt.status).bgColor,
                                getTenderStatusStyle(bt.status).color,
                              )}
                              variant="outline"
                            >
                              {bt.status}
                            </Badge>
                            <span className="text-zinc-400 tabular-nums">
                              {formatCompactZAR(bt.estimatedValue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 mt-1">No other tenders from this buyer in sample data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Suppliers to this buyer */}
            {relatedSuppliers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 border border-purple-500/20">
                    <Star className="size-3 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Top Suppliers in {tender.province || 'Region'}
                  </h4>
                </div>

                <div className="space-y-2">
                  {relatedSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[11px] text-zinc-300 font-medium truncate max-w-[240px]">
                          {supplier.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className="text-[8px] h-3.5 px-1 border-[#2D6A4F]/30 text-[#2D6A4F] bg-[#2D6A4F]/5"
                          >
                            Level {supplier.bbbeeLevel}
                          </Badge>
                          <span className="text-[9px] text-zinc-400">
                            {supplier.awardCount} awards
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#B45309] tabular-nums">
                        {formatCompactZAR(supplier.totalAwardValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Municipality Financial Health */}
            {municipality && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                    <FileText className="size-3 text-red-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Municipality Financial Health
                  </h4>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">{municipality.name}</span>
                    <Badge
                      className={cn(
                        'text-[9px] h-5 px-1.5 border',
                        muniHealthBand?.bgColor,
                        muniHealthBand?.textColor,
                        'border-current/20',
                      )}
                      variant="outline"
                    >
                      {muniHealthBand?.label} ({municipality.financialHealthScore}/100)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px]">
                      <span className="text-zinc-400">Audit Outcome</span>
                      <p className="text-zinc-300 font-medium mt-0.5">{municipality.auditOutcome}</p>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-zinc-400">Cash Coverage</span>
                      <p className="text-zinc-300 font-medium mt-0.5">
                        {municipality.cashCoverageDays} days
                      </p>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-zinc-400">Debtor Collection</span>
                      <p className="text-zinc-300 font-medium mt-0.5">
                        {formatPercent(municipality.debtorCollectionRate)}
                      </p>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-zinc-400">§139 Status</span>
                      <p
                        className={cn(
                          'font-medium mt-0.5',
                          municipality.section139Status === 'Intervention'
                            ? 'text-red-400'
                            : municipality.section139Status === 'Warning'
                              ? 'text-amber-400'
                              : 'text-emerald-400',
                        )}
                      >
                        {municipality.section139Status}
                      </p>
                    </div>
                  </div>

                  {/* Financial Health Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-zinc-400">Financial Health Score</span>
                      <span className={cn('font-semibold', muniHealthBand?.color)}>
                        {municipality.financialHealthScore}/100
                      </span>
                    </div>
                    <Progress
                      value={municipality.financialHealthScore ?? 0}
                      className="h-1.5 bg-white/[0.06] [&>div]:rounded-full"
                    />
                  </div>

                  {/* Procurement Score */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-zinc-400">Procurement Score</span>
                      <span className={cn('font-semibold', muniProcurementBand?.color)}>
                        {municipality.procurementScore}/100
                      </span>
                    </div>
                    <Progress
                      value={municipality.procurementScore ?? 0}
                      className="h-1.5 bg-white/[0.06] [&>div]:rounded-full"
                    />
                  </div>

                  {/* Operating & Capital Budget */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
                    <div className="text-[10px]">
                      <span className="text-zinc-400">Operating Budget</span>
                      <p className="text-zinc-300 font-medium mt-0.5 tabular-nums">
                        {formatCompactZAR(municipality.operatingBudget)}
                      </p>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-zinc-400">Capital Budget</span>
                      <p className="text-zinc-300 font-medium mt-0.5 tabular-nums">
                        {formatCompactZAR(municipality.capitalBudget)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────

function TenderPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-center gap-2 pt-4 pb-2"
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page)}
          className={cn(
            'h-8 w-8 p-0 text-xs font-medium tabular-nums',
            page === currentPage
              ? 'bg-[#2D6A4F]/20 text-[#2D6A4F] hover:bg-[#2D6A4F]/30 hover:text-[#2D6A4F]'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]',
          )}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </Button>
    </motion.div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
        <Search className="size-7 text-zinc-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-1">No tenders found</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-4">
        Try adjusting your filters or search terms to find what you&apos;re looking for.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
      >
        <RotateCcw className="size-3.5 mr-1.5" />
        Clear All Filters
      </Button>
    </motion.div>
  );
}

// ── Main TenderLens Component ───────────────────────────────────────────────

export default function TenderLens() {
  const { filters, resetFilters } = useTenderFilterStore();
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Filter logic (client-side) ──
  const filteredTenders = useMemo(() => {
    let results = [...MOCK_TENDERS];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.buyerName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q)),
      );
    }

    // Province
    if (filters.province) {
      results = results.filter((t) => t.province === filters.province);
    }

    // Category
    if (filters.category) {
      results = results.filter((t) => t.category === filters.category);
    }

    // Status
    if (filters.status) {
      results = results.filter((t) => t.status === filters.status);
    }

    // Value range
    if (filters.valueRange[0] > VALUE_MIN || filters.valueRange[1] < VALUE_MAX) {
      results = results.filter((t) => {
        const val = t.estimatedValue ?? 0;
        return val >= filters.valueRange[0] && val <= filters.valueRange[1];
      });
    }

    // B-BBEE level
    if (filters.bbbeeLevel) {
      results = results.filter((t) => t.bbbeeRequirement === filters.bbbeeLevel);
    }

    // Sort
    switch (sortOption) {
      case 'value-desc':
        results.sort((a, b) => (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0));
        break;
      case 'value-asc':
        results.sort((a, b) => (a.estimatedValue ?? 0) - (b.estimatedValue ?? 0));
        break;
      case 'closing-soon':
        results.sort((a, b) => {
          const aDays = getDaysUntilClosing(a.closingDate) ?? 9999;
          const bDays = getDaysUntilClosing(b.closingDate) ?? 9999;
          return aDays - bDays;
        });
        break;
      case 'recently-published':
        results.sort((a, b) => {
          const aDate = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
          const bDate = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'relevance':
      default:
        // For relevance: Active first, then by confidence score
        results.sort((a, b) => {
          const statusOrder: Record<string, number> = { Active: 0, Awarded: 1, Closed: 2, Cancelled: 3 };
          const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
          if (statusDiff !== 0) return statusDiff;
          return (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
        });
        break;
    }

    return results;
  }, [filters, sortOption]);

  // ── Pagination ──
  const totalPages = Math.ceil(filteredTenders.length / PAGE_SIZE);
  const paginatedTenders = useMemo(
    () => filteredTenders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredTenders, currentPage],
  );

  const handleExpandTender = useCallback((tender: Tender) => {
    setSelectedTender(tender);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    // Delay clearing to allow animation
    setTimeout(() => setSelectedTender(null), 300);
  }, []);

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setCurrentPage(1);
  }, [resetFilters]);

  return (
    <div className="space-y-0">
      {/* ── Module Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
            <Search className="size-4 text-[#2D6A4F]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">TenderLens</h1>
            <p className="text-[11px] text-zinc-400">
              Procurement intelligence — {MOCK_TENDERS.length} tenders in database
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 hidden sm:block">
            Updated {new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <Badge className="bg-[#2D6A4F]/10 text-[#2D6A4F] border-[#2D6A4F]/20 text-[10px] h-6 px-2">
            <Zap className="size-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </motion.div>

      {/* ── Filter Bar (Sticky) ── */}
      <FilterBar />

      {/* ── Results Summary ── */}
      <ResultsSummaryBar
        filteredCount={filteredTenders.length}
        totalCount={MOCK_TENDERS.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* ── Tender Cards Grid / List ── */}
      {paginatedTenders.length > 0 ? (
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          key={`${viewMode}-${currentPage}`}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'flex flex-col gap-2',
          )}
        >
          {paginatedTenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              viewMode={viewMode}
              onExpand={handleExpandTender}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState onReset={handleResetFilters} />
      )}

      {/* ── Pagination ── */}
      <TenderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ── Tender Detail Slide-Out Panel ── */}
      <TenderDetailPanel
        tender={selectedTender}
        open={detailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
