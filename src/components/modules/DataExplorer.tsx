'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Search,
  Building2,
  FileSearch,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle2,
  X,
  Layers,
  BarChart3,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_MUNICIPALITIES,
  MOCK_TENDERS,
  MOCK_RISK_SIGNALS,
} from '@/lib/mock-data';
import {
  formatCompactZAR,
  formatNumber,
  getScoreBand,
  getSeverityStyle,
  truncate,
} from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Municipality, Tender, RiskSignal } from '@/types';

// ── Constants ──────────────────────────────────────────────────────────────

const ACCENT = '#0EA5E9';

type SearchScope = 'all' | 'municipalities' | 'tenders' | 'risk-signals';

const SCOPE_OPTIONS: { value: SearchScope; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Layers className="size-3" /> },
  { value: 'municipalities', label: 'Municipalities', icon: <Building2 className="size-3" /> },
  { value: 'tenders', label: 'Tenders', icon: <FileSearch className="size-3" /> },
  { value: 'risk-signals', label: 'Risk Signals', icon: <ShieldAlert className="size-3" /> },
];

const DEBOUNCE_MS = 300;
const MAX_RESULTS_PER_GROUP = 5;

const RECENT_SEARCHES = [
  'Cape Town',
  'Water & Sanitation',
  'Award Concentration',
  'Ekurhuleni',
  'Infrastructure',
];

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

// ── Helper: dark-mode severity badge ────────────────────────────────────────

function getSeverityBadge(severity: RiskSignal['severity']) {
  const style = getSeverityStyle(severity);
  // Map light-mode styles to dark-mode equivalents
  const darkMap: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    Low: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/25' },
    Medium: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/25' },
    High: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/25' },
    Critical: { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/25' },
  };
  const dark = darkMap[severity] ?? { color: style.color, bgColor: style.bgColor, borderColor: 'border-transparent' };
  return dark;
}

function getScoreBadge(score: number | null | undefined) {
  const band = getScoreBand(score);
  const darkMap: Record<string, { color: string; bgColor: string }> = {
    Excellent: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    Good: { color: 'text-green-400', bgColor: 'bg-green-500/10' },
    Fair: { color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    Poor: { color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    Critical: { color: 'text-red-400', bgColor: 'bg-red-500/10' },
  };
  const dark = darkMap[band.label] ?? { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' };
  return { ...band, ...dark };
}

function getAuditBadge(auditOutcome: string | null | undefined) {
  if (!auditOutcome) return { label: '—', color: 'text-zinc-500', bgColor: 'bg-zinc-500/10' };
  const map: Record<string, { label: string; color: string; bgColor: string }> = {
    Clean: { label: 'Clean', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    Unqualified: { label: 'Unqualified', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    Qualified: { label: 'Qualified', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    Adverse: { label: 'Adverse', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    Disclaimer: { label: 'Disclaimer', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  };
  return map[auditOutcome] ?? { label: auditOutcome, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' };
}

function getTenderStatusBadge(status: string) {
  const map: Record<string, { color: string; bgColor: string }> = {
    Active: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    Awarded: { color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    Cancelled: { color: 'text-red-400', bgColor: 'bg-red-500/10' },
    Closed: { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  };
  return map[status] ?? { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' };
}

// ── Debounce Hook ────────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Search Logic ─────────────────────────────────────────────────────────────

function searchMunicipalities(query: string): Municipality[] {
  const q = query.toLowerCase();
  return MOCK_MUNICIPALITIES.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.province.toLowerCase().includes(q) ||
      (m.district && m.district.toLowerCase().includes(q)),
  );
}

function searchTenders(query: string): Tender[] {
  const q = query.toLowerCase();
  return MOCK_TENDERS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.buyerName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.province && t.province.toLowerCase().includes(q)),
  );
}

function searchRiskSignals(query: string): RiskSignal[] {
  const q = query.toLowerCase();
  return MOCK_RISK_SIGNALS.filter(
    (r) =>
      r.type.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.entityId.toLowerCase().includes(q) ||
      r.indicator.toLowerCase().includes(q) ||
      (r.municipalityCode && r.municipalityCode.toLowerCase().includes(q)),
  );
}

// ── Sub-Components ───────────────────────────────────────────────────────────

// ── Municipality Result Row ────────────────────────────────────────────────

function MunicipalityResult({ muni, onClick }: { muni: Municipality; onClick: () => void }) {
  const scoreBadge = getScoreBadge(muni.financialHealthScore);
  const auditBadge = getAuditBadge(muni.auditOutcome);

  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] cursor-pointer transition-all duration-200"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
        <Building2 className="size-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
            {muni.name}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono shrink-0">{muni.code}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-zinc-500">{muni.province}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={cn('text-[9px] h-5 px-1.5 font-semibold border', scoreBadge.bgColor, scoreBadge.color, 'border-current/20')}
        >
          FHS {muni.financialHealthScore}
        </Badge>
        <Badge
          variant="outline"
          className={cn('text-[9px] h-5 px-1.5 font-semibold border', auditBadge.bgColor, auditBadge.color, 'border-current/20')}
        >
          {auditBadge.label}
        </Badge>
        <ChevronRight className="size-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Tender Result Row ─────────────────────────────────────────────────────

function TenderResult({ tender, onClick }: { tender: Tender; onClick: () => void }) {
  const statusBadge = getTenderStatusBadge(tender.status);

  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] cursor-pointer transition-all duration-200"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <FileSearch className="size-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
            {tender.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-zinc-500 truncate">{tender.buyerName}</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1 border-white/[0.08] text-zinc-500 shrink-0">
            {tender.category}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-[#B45309] tabular-nums">
          {formatCompactZAR(tender.estimatedValue)}
        </span>
        <Badge
          variant="outline"
          className={cn('text-[9px] h-5 px-1.5 font-semibold border', statusBadge.bgColor, statusBadge.color, 'border-current/20')}
        >
          {tender.status}
        </Badge>
        <ChevronRight className="size-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Risk Signal Result Row ────────────────────────────────────────────────

function RiskSignalResult({ signal, onClick }: { signal: RiskSignal; onClick: () => void }) {
  const sevBadge = getSeverityBadge(signal.severity);

  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] cursor-pointer transition-all duration-200"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
        <ShieldAlert className="size-4 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
            {signal.type}
          </span>
          <Badge
            variant="outline"
            className={cn('text-[9px] h-5 px-1.5 font-semibold border', sevBadge.color, sevBadge.bgColor, sevBadge.borderColor)}
          >
            {signal.severity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-zinc-500">{signal.entityId}</span>
          <span className="text-[11px] text-zinc-600">·</span>
          <span className="text-[11px] text-zinc-500 truncate">{truncate(signal.description, 60)}</span>
        </div>
      </div>
      <ChevronRight className="size-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
    </motion.div>
  );
}

// ── Result Group Section ──────────────────────────────────────────────────

function ResultGroup({
  title,
  icon,
  count,
  children,
  onViewAll,
  showMore,
  onShowMore,
  hasMore,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  onViewAll: () => void;
  showMore: boolean;
  onShowMore: () => void;
  hasMore: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div variants={itemSlideUp} className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 group/title"
        >
          {icon}
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider group-hover/title:text-zinc-100 transition-colors">
            {title}
          </span>
          <Badge className="text-[9px] h-4 px-1.5 bg-white/[0.06] text-zinc-400 border-white/[0.08]">
            {count}
          </Badge>
          {collapsed ? (
            <ChevronDown className="size-3 text-zinc-600" />
          ) : (
            <ChevronUp className="size-3 text-zinc-600" />
          )}
        </button>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
        >
          View all in {title}
          <ArrowRight className="size-3" />
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5">
              {children}
            </div>
            {hasMore && !showMore && (
              <button
                onClick={onShowMore}
                className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mx-auto"
              >
                <ChevronDown className="size-3" />
                Show more
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Browse Card ───────────────────────────────────────────────────────────

function BrowseCard({
  title,
  icon,
  accentColor,
  count,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.06] p-5',
          'bg-white/[0.02] backdrop-blur-sm',
          'hover:border-white/[0.12] hover:bg-white/[0.04]',
          'transition-all duration-300',
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
        {/* Background glow */}
        <div
          className="absolute -top-12 -right-12 size-32 rounded-full opacity-0 group-hover:opacity-[0.08] blur-2xl transition-opacity duration-500"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative space-y-3">
          <div
            className="flex size-11 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-xl font-bold tabular-nums mt-1" style={{ color: accentColor }}>
              {formatNumber(count)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <span>Explore</span>
            <ArrowRight className="size-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Quick Stat Card ───────────────────────────────────────────────────────

function QuickStatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <motion.div variants={cardFadeIn}>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="text-zinc-500">{icon}</div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold text-zinc-200 tabular-nums">{value}</p>
        {subValue && <p className="text-[10px] text-zinc-600">{subValue}</p>}
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function DataExplorer() {
  const { setActiveModule } = useNavigationStore();
  const [searchInput, setSearchInput] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [showMoreMuni, setShowMoreMuni] = useState(false);
  const [showMoreTenders, setShowMoreTenders] = useState(false);
  const [showMoreRisks, setShowMoreRisks] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebouncedValue(searchInput, DEBOUNCE_MS);
  const hasQuery = debouncedQuery.trim().length > 0;

  // Reset "show more" when query changes — using ref comparison instead of effect
  if (debouncedQuery !== lastQuery) {
    setLastQuery(debouncedQuery);
    setShowMoreMuni(false);
    setShowMoreTenders(false);
    setShowMoreRisks(false);
  }

  // Search results
  const muniResults = useMemo(() => {
    if (!hasQuery) return [];
    if (scope !== 'all' && scope !== 'municipalities') return [];
    return searchMunicipalities(debouncedQuery.trim());
  }, [debouncedQuery, hasQuery, scope]);

  const tenderResults = useMemo(() => {
    if (!hasQuery) return [];
    if (scope !== 'all' && scope !== 'tenders') return [];
    return searchTenders(debouncedQuery.trim());
  }, [debouncedQuery, hasQuery, scope]);

  const riskResults = useMemo(() => {
    if (!hasQuery) return [];
    if (scope !== 'all' && scope !== 'risk-signals') return [];
    return searchRiskSignals(debouncedQuery.trim());
  }, [debouncedQuery, hasQuery, scope]);

  const totalResults = muniResults.length + tenderResults.length + riskResults.length;

  // Total records across all sources
  const totalRecords = MOCK_MUNICIPALITIES.length + MOCK_TENDERS.length + MOCK_RISK_SIGNALS.length;

  const navigateToModule = useCallback(
    (moduleId: 'munilens' | 'tenderlens' | 'risklens') => {
      setActiveModule(moduleId);
    },
    [setActiveModule],
  );

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── Module Header ─────────────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
            border: `1px solid ${ACCENT}30`,
          }}
        >
          <Database className="size-5" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-100">Data Explorer</h1>
            <Badge
              className="text-[9px] h-5 px-2 font-semibold border"
              style={{
                background: `${ACCENT}10`,
                color: ACCENT,
                borderColor: `${ACCENT}25`,
              }}
            >
              <Layers className="size-2.5 mr-0.5" />
              Cross-Module Intelligence
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Search across all data sources simultaneously
          </p>
        </div>
        <Badge
          className="text-[10px] h-6 px-2.5 font-semibold bg-white/[0.04] text-zinc-400 border-white/[0.08] tabular-nums"
        >
          <Database className="size-3 mr-1 text-zinc-500" />
          {formatNumber(totalRecords)} records
        </Badge>
      </motion.div>

      {/* ── Search Section ─────────────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} className="space-y-3">
        {/* Large search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
          <Input
            ref={inputRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search across all data sources..."
            className={cn(
              'pl-12 h-12 bg-white/[0.04] border-white/[0.08]',
              'text-zinc-200 placeholder:text-zinc-600 text-sm',
              'focus-visible:border-sky-500/30 focus-visible:ring-sky-500/10',
              'focus-visible:shadow-[0_0_20px_rgba(14,165,233,0.08)]',
              'transition-all duration-300 rounded-xl',
            )}
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Scope pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setScope(opt.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium',
                'border transition-all duration-200',
                scope === opt.value
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                  : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]',
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}

          {/* Result count indicator */}
          {hasQuery && (
            <span className="ml-auto text-[11px] text-zinc-500 tabular-nums">
              <span className="text-zinc-300 font-semibold">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Quick Stats Row (always visible) ──────────────────────────────── */}
      <motion.div variants={containerStagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStatCard
          icon={<Database className="size-3.5" />}
          label="Total Records"
          value={formatNumber(totalRecords)}
          subValue="Across all data sources"
        />
        <QuickStatCard
          icon={<Layers className="size-3.5" />}
          label="Data Sources"
          value="3"
          subValue="Municipalities, Tenders, Risk Signals"
        />
        <QuickStatCard
          icon={<Clock className="size-3.5" />}
          label="Last Updated"
          value="03 Mar 2026"
          subValue="MFMA 2023/24 cycle"
        />
        <QuickStatCard
          icon={<CheckCircle2 className="size-3.5" />}
          label="Data Quality"
          value="94.2%"
          subValue="Verification score"
        />
      </motion.div>

      {/* ── Search Results (when query exists) ────────────────────────────── */}
      {hasQuery && (
        <ScrollArea className="max-h-[calc(100vh-28rem)]">
          <motion.div variants={containerStagger} initial="hidden" animate="show" className="space-y-5">
            {totalResults === 0 ? (
              <motion.div
                variants={itemSlideUp}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4">
                  <Search className="size-6 text-zinc-600" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">No results found</h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  No records matching &quot;{debouncedQuery}&quot; found across {scope === 'all' ? 'any data source' : SCOPE_OPTIONS.find(o => o.value === scope)?.label}. Try adjusting your search or scope.
                </p>
                <button
                  onClick={() => { setSearchInput(''); setScope('all'); }}
                  className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <X className="size-3" />
                  Clear search
                </button>
              </motion.div>
            ) : (
              <>
                {/* Municipalities Group */}
                {muniResults.length > 0 && (
                  <ResultGroup
                    title="Municipalities"
                    icon={<Building2 className="size-3.5 text-purple-400" />}
                    count={muniResults.length}
                    onViewAll={() => navigateToModule('munilens')}
                    showMore={showMoreMuni}
                    onShowMore={() => setShowMoreMuni(true)}
                    hasMore={muniResults.length > MAX_RESULTS_PER_GROUP}
                  >
                    {muniResults
                      .slice(0, showMoreMuni ? undefined : MAX_RESULTS_PER_GROUP)
                      .map((m) => (
                        <MunicipalityResult
                          key={m.id}
                          muni={m}
                          onClick={() => navigateToModule('munilens')}
                        />
                      ))}
                  </ResultGroup>
                )}

                {/* Tenders Group */}
                {tenderResults.length > 0 && (
                  <ResultGroup
                    title="Tenders"
                    icon={<FileSearch className="size-3.5 text-emerald-400" />}
                    count={tenderResults.length}
                    onViewAll={() => navigateToModule('tenderlens')}
                    showMore={showMoreTenders}
                    onShowMore={() => setShowMoreTenders(true)}
                    hasMore={tenderResults.length > MAX_RESULTS_PER_GROUP}
                  >
                    {tenderResults
                      .slice(0, showMoreTenders ? undefined : MAX_RESULTS_PER_GROUP)
                      .map((t) => (
                        <TenderResult
                          key={t.id}
                          tender={t}
                          onClick={() => navigateToModule('tenderlens')}
                        />
                      ))}
                  </ResultGroup>
                )}

                {/* Risk Signals Group */}
                {riskResults.length > 0 && (
                  <ResultGroup
                    title="Risk Signals"
                    icon={<ShieldAlert className="size-3.5 text-red-400" />}
                    count={riskResults.length}
                    onViewAll={() => navigateToModule('risklens')}
                    showMore={showMoreRisks}
                    onShowMore={() => setShowMoreRisks(true)}
                    hasMore={riskResults.length > MAX_RESULTS_PER_GROUP}
                  >
                    {riskResults
                      .slice(0, showMoreRisks ? undefined : MAX_RESULTS_PER_GROUP)
                      .map((r) => (
                        <RiskSignalResult
                          key={r.id}
                          signal={r}
                          onClick={() => navigateToModule('risklens')}
                        />
                      ))}
                  </ResultGroup>
                )}
              </>
            )}
          </motion.div>
        </ScrollArea>
      )}

      {/* ── Browse Section (when no search query) ─────────────────────────── */}
      {!hasQuery && (
        <motion.div variants={containerStagger} className="space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Browse Data Sources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <BrowseCard
                title="Browse Municipalities"
                icon={<Building2 className="size-5 text-purple-400" />}
                accentColor="#7B2D8E"
                count={MOCK_MUNICIPALITIES.length}
                onClick={() => navigateToModule('munilens')}
              />
              <BrowseCard
                title="Browse Tenders"
                icon={<FileSearch className="size-5 text-emerald-400" />}
                accentColor="#2D6A4F"
                count={MOCK_TENDERS.length}
                onClick={() => navigateToModule('tenderlens')}
              />
              <BrowseCard
                title="Browse Risk Signals"
                icon={<ShieldAlert className="size-5 text-red-400" />}
                accentColor="#DC2626"
                count={MOCK_RISK_SIGNALS.length}
                onClick={() => navigateToModule('risklens')}
              />
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* ── Recent Searches ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-3.5 text-zinc-500" />
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Recent Searches
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {RECENT_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchInput(term)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                >
                  <Search className="size-3 text-zinc-600" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
