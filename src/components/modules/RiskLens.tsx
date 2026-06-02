'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronDown,
  X,
  Shield,
  Activity,
  Search,
  SlidersHorizontal,
  Zap,
  Brain,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_RISK_SIGNALS, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate, getSeverityStyle, formatNumber, formatRelativeDate } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { RiskSignal } from '@/types';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// ── Extended Mock Data ──────────────────────────────────────────────────────

const EXTENDED_RISK_SIGNALS: RiskSignal[] = [
  ...MOCK_RISK_SIGNALS,
  { id: '7', type: 'Budget Overrun', severity: 'High', description: 'Capital expenditure exceeds approved budget by 42% without proper adjustment processes', entityId: 'JHB', entityType: 'Municipality', municipalityCode: 'JHB', indicator: 'Budget Variance %', indicatorValue: 42, threshold: 15, detectedAt: '2026-02-18T13:00:00Z', status: 'Active' },
  { id: '8', type: 'Supplier Rotation', severity: 'Medium', description: 'Pattern of supplier rotation detected across 3 related entities with shared directors', entityId: '6', entityType: 'Supplier', municipalityCode: 'JHB', indicator: 'Entity Overlap Score', indicatorValue: 0.58, threshold: 0.40, detectedAt: '2026-02-15T09:30:00Z', status: 'Reviewed' },
  { id: '9', type: 'Service Delivery Gap', severity: 'Critical', description: 'Water access rate declined from 85% to 62% over 12 months — infrastructure collapse risk', entityId: 'MAN', entityType: 'Municipality', municipalityCode: 'MAN', indicator: 'Service Decline Rate', indicatorValue: 23, threshold: 10, detectedAt: '2026-03-01T06:00:00Z', status: 'Active' },
  { id: '10', type: 'Cash Flow Crisis', severity: 'Critical', description: 'Cash coverage below 10 days combined with declining collection rate — imminent liquidity crisis', entityId: 'BUF', entityType: 'Municipality', municipalityCode: 'BUF', indicator: 'Cash Coverage Days', indicatorValue: 8, threshold: 30, detectedAt: '2026-03-02T11:00:00Z', status: 'Active' },
  { id: '11', type: 'Irregular Expenditure', severity: 'High', description: 'Irregular expenditure increased by 180% year-on-year, triggering MFMA Section 38 reporting', entityId: 'MSU', entityType: 'Municipality', municipalityCode: 'MSU', indicator: 'Irregular Exp. Growth', indicatorValue: 180, threshold: 50, detectedAt: '2026-02-22T15:45:00Z', status: 'Active' },
  { id: '12', type: 'Bid Rigging Indicator', severity: 'Critical', description: 'Statistical analysis indicates coordinated bidding patterns across 4 suppliers in 6 tenders', entityId: 'EKU', entityType: 'Buyer', municipalityCode: 'EKU', indicator: 'Bid Coordination Index', indicatorValue: 0.85, threshold: 0.60, detectedAt: '2026-03-03T07:30:00Z', status: 'Active' },
  { id: '13', type: 'Capacity Deficit', severity: 'Low', description: 'Municipality has 35% vacancy rate in critical finance positions', entityId: 'RUST', entityType: 'Municipality', municipalityCode: 'RUST', indicator: 'Critical Vacancy Rate', indicatorValue: 35, threshold: 20, detectedAt: '2026-01-30T10:00:00Z', status: 'Reviewed' },
  { id: '14', type: 'Grant Underspend', severity: 'Medium', description: 'Municipality utilised only 48% of conditional grant allocation by Q3', entityId: 'NMB', entityType: 'Municipality', municipalityCode: 'NMB', indicator: 'Grant Utilisation Rate', indicatorValue: 48, threshold: 75, detectedAt: '2026-02-12T14:00:00Z', status: 'Active' },
];

// ── Severity Config ─────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#3B82F6',
};

const SEVERITY_GRADIENT_FROM: Record<string, string> = {
  Critical: '#B91C1C',
  High: '#C2410C',
  Medium: '#B45309',
  Low: '#1D4ED8',
};

const SEVERITY_GRADIENT_TO: Record<string, string> = {
  Critical: '#F87171',
  High: '#FB923C',
  Medium: '#FCD34D',
  Low: '#60A5FA',
};

const SEVERITY_BG_CLASS: Record<string, string> = {
  Critical: 'from-red-500/10 to-red-500/[0.03]',
  High: 'from-orange-500/10 to-orange-500/[0.03]',
  Medium: 'from-amber-500/10 to-amber-500/[0.03]',
  Low: 'from-blue-500/10 to-blue-500/[0.03]',
};

const SEVERITY_BLUR: Record<string, string> = {
  Critical: 'backdrop-blur-xl',
  High: 'backdrop-blur-lg',
  Medium: 'backdrop-blur-md',
  Low: 'backdrop-blur-sm',
};

// ── Correlation Matrix Mock Data ────────────────────────────────────────────

const SIGNAL_TYPES_ORDERED = [
  'Bid Rigging Indicator',
  'Cash Flow Crisis',
  'Service Delivery Gap',
  'Irregular Expenditure',
  'Budget Overrun',
  'Supplier Rotation',
  'Grant Underspend',
  'Capacity Deficit',
];

const CORRELATION_DATA: Record<string, Record<string, { score: number; explanation: string }>> = {
  'Bid Rigging Indicator': {
    'Bid Rigging Indicator': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Cash Flow Crisis': { score: 0.72, explanation: 'Bid rigging diverts funds, worsening cash flow' },
    'Service Delivery Gap': { score: 0.65, explanation: 'Rigged bids often inflate costs, reducing service delivery' },
    'Irregular Expenditure': { score: 0.81, explanation: 'Strong link — bid rigging is a primary source of irregular spend' },
    'Budget Overrun': { score: 0.68, explanation: 'Inflated contracts from rigging cause budget overruns' },
    'Supplier Rotation': { score: 0.89, explanation: 'Very strong — rotation schemes enable bid rigging' },
    'Grant Underspend': { score: 0.31, explanation: 'Weak link — rigging may cause inefficiency but not direct underspend' },
    'Capacity Deficit': { score: 0.28, explanation: 'Low correlation — capacity issues are separate from rigging' },
  },
  'Cash Flow Crisis': {
    'Bid Rigging Indicator': { score: 0.72, explanation: 'Bid rigging diverts funds, worsening cash flow' },
    'Cash Flow Crisis': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Service Delivery Gap': { score: 0.78, explanation: 'Cash crises directly impact service delivery capability' },
    'Irregular Expenditure': { score: 0.61, explanation: 'Irregular spending drains cash reserves' },
    'Budget Overrun': { score: 0.74, explanation: 'Budget overruns directly cause cash flow problems' },
    'Supplier Rotation': { score: 0.42, explanation: 'Moderate — rotation may slowly drain resources' },
    'Grant Underspend': { score: 0.55, explanation: 'Moderate — underspending grants signals cash management issues' },
    'Capacity Deficit': { score: 0.48, explanation: 'Moderate — capacity deficits worsen cash management' },
  },
  'Service Delivery Gap': {
    'Bid Rigging Indicator': { score: 0.65, explanation: 'Rigged bids inflate costs, reducing service delivery' },
    'Cash Flow Crisis': { score: 0.78, explanation: 'Cash crises directly impact service delivery' },
    'Service Delivery Gap': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Irregular Expenditure': { score: 0.52, explanation: 'Moderate — irregular spend reduces service delivery funding' },
    'Budget Overrun': { score: 0.59, explanation: 'Overruns divert funds from service delivery' },
    'Supplier Rotation': { score: 0.37, explanation: 'Moderate-low link between rotation and service gaps' },
    'Grant Underspend': { score: 0.44, explanation: 'Moderate — underspending infrastructure grants delays services' },
    'Capacity Deficit': { score: 0.71, explanation: 'Strong — capacity deficits directly cause service gaps' },
  },
  'Irregular Expenditure': {
    'Bid Rigging Indicator': { score: 0.81, explanation: 'Strong link — bid rigging is a primary source of irregular spend' },
    'Cash Flow Crisis': { score: 0.61, explanation: 'Irregular spending drains cash reserves' },
    'Service Delivery Gap': { score: 0.52, explanation: 'Moderate — irregular spend reduces service delivery funding' },
    'Irregular Expenditure': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Budget Overrun': { score: 0.83, explanation: 'Very strong — irregular expenditure drives budget overruns' },
    'Supplier Rotation': { score: 0.56, explanation: 'Moderate — rotation schemes generate irregular spend' },
    'Grant Underspend': { score: 0.29, explanation: 'Low correlation between irregular spend and grant underspend' },
    'Capacity Deficit': { score: 0.35, explanation: 'Low-moderate — capacity issues may enable irregular spend' },
  },
  'Budget Overrun': {
    'Bid Rigging Indicator': { score: 0.68, explanation: 'Inflated contracts from rigging cause overruns' },
    'Cash Flow Crisis': { score: 0.74, explanation: 'Overruns directly cause cash flow problems' },
    'Service Delivery Gap': { score: 0.59, explanation: 'Overruns divert funds from service delivery' },
    'Irregular Expenditure': { score: 0.83, explanation: 'Very strong — irregular expenditure drives overruns' },
    'Budget Overrun': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Supplier Rotation': { score: 0.47, explanation: 'Moderate — rotation may contribute to overruns' },
    'Grant Underspend': { score: 0.38, explanation: 'Low-moderate link' },
    'Capacity Deficit': { score: 0.41, explanation: 'Moderate — capacity issues may lead to poor budgeting' },
  },
  'Supplier Rotation': {
    'Bid Rigging Indicator': { score: 0.89, explanation: 'Very strong — rotation schemes enable bid rigging' },
    'Cash Flow Crisis': { score: 0.42, explanation: 'Moderate — rotation may slowly drain resources' },
    'Service Delivery Gap': { score: 0.37, explanation: 'Moderate-low link' },
    'Irregular Expenditure': { score: 0.56, explanation: 'Moderate — rotation generates irregular spend' },
    'Budget Overrun': { score: 0.47, explanation: 'Moderate link' },
    'Supplier Rotation': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Grant Underspend': { score: 0.22, explanation: 'Low correlation' },
    'Capacity Deficit': { score: 0.19, explanation: 'Very low correlation' },
  },
  'Grant Underspend': {
    'Bid Rigging Indicator': { score: 0.31, explanation: 'Weak link' },
    'Cash Flow Crisis': { score: 0.55, explanation: 'Moderate — underspending grants signals cash management issues' },
    'Service Delivery Gap': { score: 0.44, explanation: 'Moderate — underspending infrastructure grants delays services' },
    'Irregular Expenditure': { score: 0.29, explanation: 'Low correlation' },
    'Budget Overrun': { score: 0.38, explanation: 'Low-moderate link' },
    'Supplier Rotation': { score: 0.22, explanation: 'Low correlation' },
    'Grant Underspend': { score: 1.0, explanation: 'Perfect self-correlation' },
    'Capacity Deficit': { score: 0.64, explanation: 'Strong — capacity deficits directly cause grant underspend' },
  },
  'Capacity Deficit': {
    'Bid Rigging Indicator': { score: 0.28, explanation: 'Low correlation' },
    'Cash Flow Crisis': { score: 0.48, explanation: 'Moderate — capacity deficits worsen cash management' },
    'Service Delivery Gap': { score: 0.71, explanation: 'Strong — capacity deficits directly cause service gaps' },
    'Irregular Expenditure': { score: 0.35, explanation: 'Low-moderate — capacity issues may enable irregular spend' },
    'Budget Overrun': { score: 0.41, explanation: 'Moderate — capacity issues lead to poor budgeting' },
    'Supplier Rotation': { score: 0.19, explanation: 'Very low correlation' },
    'Grant Underspend': { score: 0.64, explanation: 'Strong — capacity deficits directly cause grant underspend' },
    'Capacity Deficit': { score: 1.0, explanation: 'Perfect self-correlation' },
  },
};

// ── Helper: Active Filters ──────────────────────────────────────────────────

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

// ── CountUp Animation Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1.2) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

// ── CountUp Display Component ───────────────────────────────────────────────

function CountUpNumber({ target, color, className }: { target: number; color: string; className?: string }) {
  const count = useCountUp(target);
  return (
    <span className={className} style={{ color }}>
      {count}
    </span>
  );
}

// ── SVG Progress Ring Component ─────────────────────────────────────────────

function ProgressRing({ percent, color, size = 56, strokeWidth = 3.5 }: { percent: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`${color}15`}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      />
    </svg>
  );
}

// ── Correlation Color Helper ────────────────────────────────────────────────

function getCorrelationColor(score: number): string {
  if (score >= 0.6) return `rgba(239, 68, 68, ${0.2 + score * 0.5})`;
  if (score >= 0.3) return `rgba(245, 158, 11, ${0.2 + score * 0.4})`;
  return `rgba(59, 130, 246, ${0.15 + score * 0.3})`;
}

function getCorrelationTextColor(score: number): string {
  if (score >= 0.6) return '#FCA5A5';
  if (score >= 0.3) return '#FCD34D';
  return '#93C5FD';
}

// ── Sort Config ─────────────────────────────────────────────────────────────

type SortOption = 'severity' | 'date' | 'type';

const SORT_LABELS: Record<SortOption, string> = {
  severity: 'Severity',
  date: 'Date',
  type: 'Type',
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function RiskLens() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('severity');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredCorrelation, setHoveredCorrelation] = useState<{ row: string; col: string } | null>(null);

  const signals = useMemo(() => {
    let filtered = [...EXTENDED_RISK_SIGNALS];

    // Text search across type, description, entity, indicator
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.type.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.entityId.toLowerCase().includes(q) ||
        s.indicator.toLowerCase().includes(q) ||
        s.severity.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== 'all') filtered = filtered.filter((s) => s.severity === severityFilter);
    if (typeFilter !== 'all') filtered = filtered.filter((s) => s.type === typeFilter);
    if (entityTypeFilter !== 'all') filtered = filtered.filter((s) => s.entityType === entityTypeFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((s) => s.status === statusFilter);

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sortBy === 'date') return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

    return filtered;
  }, [severityFilter, typeFilter, entityTypeFilter, statusFilter, searchQuery, sortBy]);

  const severityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    EXTENDED_RISK_SIGNALS.filter((s) => s.status === 'Active').forEach((s) => {
      counts[s.severity]++;
    });
    return counts;
  }, []);

  const uniqueTypes = useMemo(() => [...new Set(EXTENDED_RISK_SIGNALS.map((s) => s.type))], []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EXTENDED_RISK_SIGNALS.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return counts;
  }, []);

  const maxTypeCount = useMemo(() => Math.max(...Object.values(typeCounts)), [typeCounts]);

  const totalActive = useMemo(
    () => Object.values(severityCounts).reduce((a, b) => a + b, 0),
    [severityCounts]
  );

  const barChartData = useMemo(() => [
    { name: 'Critical', count: severityCounts.Critical, color: SEVERITY_COLORS.Critical, gradientFrom: SEVERITY_GRADIENT_FROM.Critical, gradientTo: SEVERITY_GRADIENT_TO.Critical, pct: totalActive ? Math.round((severityCounts.Critical / totalActive) * 100) : 0 },
    { name: 'High', count: severityCounts.High, color: SEVERITY_COLORS.High, gradientFrom: SEVERITY_GRADIENT_FROM.High, gradientTo: SEVERITY_GRADIENT_TO.High, pct: totalActive ? Math.round((severityCounts.High / totalActive) * 100) : 0 },
    { name: 'Medium', count: severityCounts.Medium, color: SEVERITY_COLORS.Medium, gradientFrom: SEVERITY_GRADIENT_FROM.Medium, gradientTo: SEVERITY_GRADIENT_TO.Medium, pct: totalActive ? Math.round((severityCounts.Medium / totalActive) * 100) : 0 },
    { name: 'Low', count: severityCounts.Low, color: SEVERITY_COLORS.Low, gradientFrom: SEVERITY_GRADIENT_FROM.Low, gradientTo: SEVERITY_GRADIENT_TO.Low, pct: totalActive ? Math.round((severityCounts.Low / totalActive) * 100) : 0 },
  ], [severityCounts, totalActive]);

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (searchQuery.trim()) filters.push({ key: 'search', label: 'Search', value: searchQuery.trim() });
    if (severityFilter !== 'all') filters.push({ key: 'severity', label: 'Severity', value: severityFilter });
    if (typeFilter !== 'all') filters.push({ key: 'type', label: 'Type', value: typeFilter });
    if (entityTypeFilter !== 'all') filters.push({ key: 'entityType', label: 'Entity', value: entityTypeFilter });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: 'Status', value: statusFilter });
    return filters;
  }, [severityFilter, typeFilter, entityTypeFilter, statusFilter, searchQuery]);

  const clearFilter = useCallback((key: string) => {
    switch (key) {
      case 'severity': setSeverityFilter('all'); break;
      case 'type': setTypeFilter('all'); break;
      case 'entityType': setEntityTypeFilter('all'); break;
      case 'status': setStatusFilter('all'); break;
      case 'search': setSearchQuery(''); break;
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setSeverityFilter('all');
    setTypeFilter('all');
    setEntityTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

  const getEntityName = useCallback((entityId: string, entityType: string) => {
    if (entityType === 'Municipality' || entityType === 'Buyer') {
      const muni = MOCK_MUNICIPALITIES.find((m) => m.code === entityId);
      if (muni) return muni.name;
    }
    return entityId;
  }, []);

  const getTypeSeverityColor = useCallback((type: string) => {
    const typeSignal = EXTENDED_RISK_SIGNALS.find((s) => s.type === type);
    return typeSignal ? SEVERITY_COLORS[typeSignal.severity] : '#71717A';
  }, []);

  // Check if signal was detected within last 24h
  const isNewSignal = useCallback((detectedAt: string) => {
    const now = new Date('2026-03-04T00:00:00Z'); // Using the latest signal date as "now"
    const detected = new Date(detectedAt);
    return (now.getTime() - detected.getTime()) < 24 * 60 * 60 * 1000;
  }, []);

  return (
    <div className="space-y-6 bg-grid-pattern min-h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          {/* Red/amber accent bar */}
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-red-500 to-amber-500 shrink-0" />
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/15 to-amber-500/10 border border-red-500/20 shadow-[0_0_16px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="size-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">
              <span className="bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent">
                RiskLens
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Procurement and municipal anomaly detection</p>
          </div>
          <span className="badge-premium badge-phase2 ml-2">Phase 2</span>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] h-5 px-2">
              <Zap className="size-3 mr-1" />
              {EXTENDED_RISK_SIGNALS.filter(s => s.status === 'Active').length} Active
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Severity Summary Cards ──────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {([
          { label: 'Critical', count: severityCounts.Critical, icon: AlertOctagon, color: '#EF4444', pulse: true, blur: 'backdrop-blur-xl' },
          { label: 'High', count: severityCounts.High, icon: AlertTriangle, color: '#F97316', pulse: false, blur: 'backdrop-blur-lg' },
          { label: 'Medium', count: severityCounts.Medium, icon: ShieldAlert, color: '#F59E0B', pulse: false, blur: 'backdrop-blur-md' },
          { label: 'Low', count: severityCounts.Low, icon: Info, color: '#3B82F6', pulse: false, blur: 'backdrop-blur-sm' },
        ] as const).map((card) => {
          const pctOfTotal = totalActive > 0 ? (card.count / totalActive) * 100 : 0;
          return (
            <motion.div
              key={card.label}
              variants={itemSlideUp}
              whileHover={{
                scale: 1.03,
                y: -4,
                boxShadow: `0 0 24px ${card.color}20, 0 0 48px ${card.color}10`,
              }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              <Card
                className={cn(
                  'border-white/[0.08] overflow-hidden transition-all duration-300',
                  card.blur,
                  'bg-gradient-to-br',
                  SEVERITY_BG_CLASS[card.label],
                  card.label === 'Critical' && card.count > 0 && 'border-red-500/30'
                )}
              >
                {/* Critical animated border glow */}
                {card.label === 'Critical' && card.count > 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: `inset 0 0 12px ${card.color}30, 0 0 20px ${card.color}15` }}
                    animate={{
                      boxShadow: [
                        `inset 0 0 12px ${card.color}30, 0 0 20px ${card.color}15`,
                        `inset 0 0 18px ${card.color}50, 0 0 32px ${card.color}25`,
                        `inset 0 0 12px ${card.color}30, 0 0 20px ${card.color}15`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Top accent gradient line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-90"
                  style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}60, transparent)` }}
                />
                {/* Subtle background radial glow */}
                <div
                  className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.06]"
                  style={{ background: `radial-gradient(circle, ${card.color}, transparent)` }}
                />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        {card.label}
                      </p>
                      <p className="text-3xl font-extrabold tabular-nums leading-none">
                        <CountUpNumber target={card.count} color={card.color} />
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1.5">active signals</p>
                    </div>
                    <div className="relative flex items-center justify-center">
                      {/* SVG Progress Ring */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ProgressRing percent={pctOfTotal} color={card.color} size={56} strokeWidth={3.5} />
                      </div>
                      {/* Pulse ring for Critical */}
                      {card.pulse && card.count > 0 && (
                        <span className="absolute inset-0 rounded-xl animate-ping opacity-20" style={{ backgroundColor: card.color }} />
                      )}
                      <div
                        className="relative flex size-12 items-center justify-center rounded-xl"
                        style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                      >
                        <card.icon className="size-5" style={{ color: card.color }} />
                      </div>
                    </div>
                  </div>
                  {card.pulse && card.count > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="size-2 rounded-full animate-pulse" style={{ backgroundColor: card.color }} />
                      <span className="text-[10px] text-zinc-400 font-medium">Requires immediate attention</span>
                    </div>
                  )}
                  {/* Severity gradient bar at bottom */}
                  <div className="mt-3 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${SEVERITY_GRADIENT_FROM[card.label]}, ${SEVERITY_GRADIENT_TO[card.label]})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pctOfTotal}%` }}
                      transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1 tabular-nums">
                    {Math.round(pctOfTotal)}% of active signals
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Sticky Filter Bar ───────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="sticky top-0 z-30 -mx-1 px-1 py-2 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <Input
                placeholder="Search signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[160px] h-8 text-[11px] pl-7 border-white/[0.08] bg-[#0d1224] placeholder:text-zinc-500 focus:border-amber-500/30 focus:ring-amber-500/10 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
            <div className="flex items-center gap-1.5 text-zinc-400 mr-1">
              <SlidersHorizontal className="size-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Filters</span>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[120px] h-8 text-[11px] border-white/[0.08] bg-[#0d1224] hover:border-amber-500/30 transition-colors">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                <SelectItem value="all" className="hover:bg-amber-500/10 focus:bg-amber-500/10">All Severity</SelectItem>
                <SelectItem value="Critical" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Critical</SelectItem>
                <SelectItem value="High" className="hover:bg-amber-500/10 focus:bg-amber-500/10">High</SelectItem>
                <SelectItem value="Medium" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Medium</SelectItem>
                <SelectItem value="Low" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] h-8 text-[11px] border-white/[0.08] bg-[#0d1224] hover:border-amber-500/30 transition-colors">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                <SelectItem value="all" className="hover:bg-amber-500/10 focus:bg-amber-500/10">All Types</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t} className="hover:bg-amber-500/10 focus:bg-amber-500/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-[130px] h-8 text-[11px] border-white/[0.08] bg-[#0d1224] hover:border-amber-500/30 transition-colors">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                <SelectItem value="all" className="hover:bg-amber-500/10 focus:bg-amber-500/10">All Entities</SelectItem>
                <SelectItem value="Municipality" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Municipality</SelectItem>
                <SelectItem value="Buyer" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Buyer</SelectItem>
                <SelectItem value="Supplier" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] h-8 text-[11px] border-white/[0.08] bg-[#0d1224] hover:border-amber-500/30 transition-colors">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                <SelectItem value="all" className="hover:bg-amber-500/10 focus:bg-amber-500/10">All Status</SelectItem>
                <SelectItem value="Active" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Active</SelectItem>
                <SelectItem value="Reviewed" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Reviewed</SelectItem>
                <SelectItem value="Dismissed" className="hover:bg-amber-500/10 focus:bg-amber-500/10">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort By */}
            <div className="flex items-center gap-1.5 ml-1">
              <ArrowUpDown className="size-3 text-zinc-500" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[100px] h-8 text-[11px] border-white/[0.08] bg-[#0d1224] hover:border-amber-500/30 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="hover:bg-amber-500/10 focus:bg-amber-500/10">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Active filter chips with AnimatePresence */}
            <AnimatePresence mode="popLayout">
              {activeFilters.map((f) => (
                <motion.span
                  key={f.key}
                  initial={{ opacity: 0, scale: 0.7, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: 8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25"
                >
                  <span className="text-zinc-500">{f.label}:</span> {f.value.length > 15 ? f.value.slice(0, 15) + '...' : f.value}
                  <button
                    onClick={() => clearFilter(f.key)}
                    className="ml-0.5 hover:text-amber-300 transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-[10px] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Clear All
              </Button>
            )}
            <div className="ml-auto">
              <span className="text-[11px] text-zinc-500">
                <span className="text-zinc-300 font-semibold tabular-nums">{signals.length}</span> of {EXTENDED_RISK_SIGNALS.length} signals
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Risk Feed + Severity Chart ──────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Risk Feed */}
        <motion.div variants={itemFadeIn} className="lg:col-span-2">
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-lg hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-red-400" />
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-200">Risk Feed</CardTitle>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{signals.length} signals matching filters</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[520px]">
                <div className="space-y-2">
                  {signals.map((signal, i) => {
                    const sevColor = SEVERITY_COLORS[signal.severity];
                    const isExpanded = expandedSignal === signal.id;
                    const isNew = isNewSignal(signal.detectedAt);
                    return (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="group relative rounded-lg border border-white/[0.06] p-3.5 hover:border-white/[0.12] hover:translate-x-[2px] transition-all duration-200 cursor-pointer"
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: sevColor,
                          position: 'relative',
                        }}
                        onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                      >
                        {/* Severity gradient left border (top-to-bottom fade) */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
                          style={{
                            background: `linear-gradient(to bottom, ${sevColor}, ${sevColor}60, transparent)`,
                          }}
                        />
                        {/* Hover glow effect matching severity */}
                        <div
                          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ boxShadow: `inset 0 0 16px ${sevColor}10, 0 0 24px ${sevColor}08` }}
                        />
                        <div className="flex items-start gap-3">
                          {/* Severity dot indicator */}
                          <div className="relative flex items-center justify-center mt-1 shrink-0">
                            {signal.severity === 'Critical' && (
                              <span className="absolute size-4 rounded-full animate-ping opacity-30" style={{ backgroundColor: sevColor }} />
                            )}
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: sevColor }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={cn(
                                  'shrink-0 text-[9px] h-5 px-2 font-bold border rounded-full',
                                  signal.severity === 'Critical' ? 'bg-gradient-to-r from-red-600/25 to-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]' :
                                  signal.severity === 'High' ? 'bg-gradient-to-r from-orange-600/25 to-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.12)]' :
                                  signal.severity === 'Medium' ? 'bg-gradient-to-r from-amber-600/25 to-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.12)]' :
                                  'bg-gradient-to-r from-blue-600/25 to-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.12)]'
                                )}
                                variant="outline"
                              >
                                {signal.severity}
                              </Badge>
                              <p className="text-xs font-semibold text-zinc-200">{signal.type}</p>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{signal.entityType}</Badge>
                              {/* NEW badge */}
                              {isNew && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-sm text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                >
                                  <Sparkles className="size-2.5" />
                                  NEW
                                </motion.span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-zinc-300 mt-1">{getEntityName(signal.entityId, signal.entityType)}</p>
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{signal.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-zinc-500">{formatRelativeDate(signal.detectedAt)}</span>
                              <span className="text-[10px] text-zinc-600">•</span>
                              <span className="text-[10px] text-zinc-500">{formatSADate(signal.detectedAt)}</span>
                              <Badge variant="outline" className={cn(
                                'text-[9px] h-4 px-1.5',
                                signal.status === 'Active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                              )}>{signal.status}</Badge>
                            </div>
                          </div>
                          <div className="shrink-0 mt-1">
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                              <ChevronDown className="size-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                            </motion.div>
                          </div>
                        </div>
                        {/* Expanded Detail with spring physics */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-3 bg-white/[0.06]" />
                              <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                  <span className="text-zinc-500 font-medium">Indicator</span>
                                  <p className="text-zinc-200 font-semibold mt-0.5">{signal.indicator}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500 font-medium">Threshold</span>
                                  <p className="text-zinc-200 font-semibold mt-0.5">{String(signal.threshold)}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500 font-medium">Detected Value</span>
                                  <p className="font-bold mt-0.5 text-sm" style={{ color: sevColor }}>{String(signal.indicatorValue)}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500 font-medium">Municipality Code</span>
                                  <p className="text-zinc-200 font-semibold mt-0.5">{signal.municipalityCode || '—'}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Severity Distribution + Signal Types */}
        <motion.div variants={itemFadeIn} className="space-y-6">
          {/* Severity Distribution Chart */}
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart className="size-3.5 text-amber-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-200">Severity Distribution</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Active signals by severity level</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      {barChartData.map((entry, index) => (
                        <linearGradient key={`grad-${index}`} id={`barGrad-${index}`} x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor={entry.gradientFrom} stopOpacity={0.9} />
                          <stop offset="50%" stopColor={entry.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.gradientTo} stopOpacity={1} />
                        </linearGradient>
                      ))}
                      {/* Glow filters for each bar */}
                      {barChartData.map((entry, index) => (
                        <filter key={`glow-${index}`} id={`barGlow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feFlood floodColor={entry.color} floodOpacity="0.3" result="color" />
                          <feComposite in="color" in2="blur" operator="in" result="glow" />
                          <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                        backdropFilter: 'blur(12px)',
                      }}
                      formatter={(value: number, name: string, props: { payload: { pct: number; name: string; count: number; color: string } }) => [
                        <span key="val">
                          <span className="font-bold">{value}</span> signals
                          <span className="text-zinc-400 ml-2">({props.payload.pct}% of active)</span>
                        </span>,
                        'Count',
                      ]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                      {barChartData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#barGrad-${index})`}
                          style={{
                            filter: hoveredBar === index ? `url(#barGlow-${index}) brightness(1.15)` : 'none',
                            transition: 'filter 0.3s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHoveredBar(index)}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Animated count labels below chart */}
              <div className="grid grid-cols-4 gap-1 mt-2">
                {barChartData.map((entry, i) => (
                  <div key={entry.name} className="text-center">
                    <motion.p
                      className="text-sm font-extrabold tabular-nums"
                      style={{ color: entry.color }}
                      initial={{ opacity: 0, y: 8, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.12, duration: 0.4, type: 'spring', stiffness: 300 }}
                    >
                      {entry.count}
                    </motion.p>
                    <motion.p
                      className="text-[9px] text-zinc-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.12, duration: 0.3 }}
                    >
                      {entry.pct}%
                    </motion.p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signal Types Section */}
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-amber-400" />
                <CardTitle className="text-sm font-bold text-zinc-200">Signal Types</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {uniqueTypes.map((t, i) => {
                  const count = typeCounts[t];
                  const color = getTypeSeverityColor(t);
                  const pct = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0;
                  return (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[11px] text-zinc-300 font-medium">{t}</span>
                        </div>
                        <Badge className="text-[9px] h-4 px-1.5 bg-white/[0.04] text-zinc-400 border-white/[0.08] tabular-nums">
                          {count}
                        </Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}90, ${color})` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Anomaly Table ───────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-lg hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-red-400" />
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-200">Anomaly Table</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">All detected anomalies with indicators and thresholds</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-2 border-white/[0.08] text-zinc-400">
                {signals.length} records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[440px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent bg-gradient-to-r from-red-500/[0.06] via-amber-500/[0.04] to-transparent">
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Severity</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Entity</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Indicator</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider text-right">Value</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider text-right">Threshold</TableHead>
                    <TableHead className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.map((signal, rowIndex) => {
                    const sevColor = SEVERITY_COLORS[signal.severity];
                    return (
                      <TableRow
                        key={signal.id}
                        className={cn(
                          'border-white/[0.04] transition-all duration-200 group relative',
                          rowIndex % 2 === 1 ? 'bg-white/[0.015]' : ''
                        )}
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: sevColor,
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          const row = e.currentTarget as HTMLElement;
                          row.style.boxShadow = `inset 3px 0 12px ${sevColor}10, 0 0 12px ${sevColor}08`;
                          row.style.backgroundColor = `${sevColor}08`;
                        }}
                        onMouseLeave={(e) => {
                          const row = e.currentTarget as HTMLElement;
                          row.style.boxShadow = 'none';
                          row.style.backgroundColor = '';
                        }}
                      >
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-[9px] h-5 px-2 font-bold border rounded-full shadow-sm',
                              signal.severity === 'Critical' ? 'bg-gradient-to-r from-red-600/25 to-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]' :
                              signal.severity === 'High' ? 'bg-gradient-to-r from-orange-600/25 to-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.12)]' :
                              signal.severity === 'Medium' ? 'bg-gradient-to-r from-amber-600/25 to-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.12)]' :
                              'bg-gradient-to-r from-blue-600/25 to-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.12)]'
                            )}
                            variant="outline"
                          >
                            {signal.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-200 font-semibold">{signal.type}</TableCell>
                        <TableCell>
                          <p className="text-xs text-zinc-300">{getEntityName(signal.entityId, signal.entityType)}</p>
                          <p className="text-[10px] text-zinc-500">{signal.entityType}</p>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-300">{signal.indicator}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-bold tabular-nums" style={{ color: sevColor }}>
                            {String(signal.indicatorValue)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{String(signal.threshold)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            'text-[9px] h-4 px-1.5',
                            signal.status === 'Active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          )}>{signal.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Risk Signal Correlation Matrix ──────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-red-500/10 border border-amber-500/20">
                <Brain className="size-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-zinc-200">Risk Signal Correlation Matrix</CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">Cross-signal correlation analysis across 8 risk types</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Column Headers */}
                <div className="grid grid-cols-[140px_repeat(8,1fr)] gap-1 mb-1">
                  <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider flex items-end justify-end pr-2 pb-1">
                    Signal Type
                  </div>
                  {SIGNAL_TYPES_ORDERED.map((type, i) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                      className="text-[8px] text-zinc-400 font-semibold text-center leading-tight flex items-end justify-center pb-1"
                    >
                      <span className="line-clamp-2 max-w-[72px]">{type.split(' ').slice(0, 2).join(' ')}</span>
                    </motion.div>
                  ))}
                </div>
                {/* Matrix Rows */}
                {SIGNAL_TYPES_ORDERED.map((rowType, rowIdx) => (
                  <motion.div
                    key={rowType}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + rowIdx * 0.06, duration: 0.35 }}
                    className="grid grid-cols-[140px_repeat(8,1fr)] gap-1 mb-1"
                  >
                    {/* Row Label */}
                    <div className="text-[9px] text-zinc-300 font-medium flex items-center pr-2 truncate">
                      {rowType}
                    </div>
                    {/* Cells */}
                    {SIGNAL_TYPES_ORDERED.map((colType, colIdx) => {
                      const cell = CORRELATION_DATA[rowType]?.[colType];
                      const score = cell?.score ?? 0;
                      const explanation = cell?.explanation ?? '';
                      const isDiagonal = rowType === colType;
                      const isHovered = hoveredCorrelation?.row === rowType && hoveredCorrelation?.col === colType;

                      return (
                        <RadixTooltip key={`${rowType}-${colType}`}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: 0.3 + rowIdx * 0.04 + colIdx * 0.02,
                                duration: 0.25,
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                              }}
                              className={cn(
                                'relative flex items-center justify-center rounded-md h-10 cursor-pointer transition-all duration-200',
                                isDiagonal && 'ring-1 ring-white/10',
                              )}
                              style={{
                                backgroundColor: getCorrelationColor(score),
                                boxShadow: isHovered ? `0 0 12px ${score >= 0.6 ? 'rgba(239,68,68,0.3)' : score >= 0.3 ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.2)'}` : 'none',
                                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                              }}
                              onMouseEnter={() => setHoveredCorrelation({ row: rowType, col: colType })}
                              onMouseLeave={() => setHoveredCorrelation(null)}
                            >
                              <span
                                className="text-[10px] font-bold tabular-nums"
                                style={{ color: getCorrelationTextColor(score) }}
                              >
                                {score.toFixed(2)}
                              </span>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-[#0d1224]/95 border-white/[0.1] text-zinc-200 max-w-[220px] backdrop-blur-xl"
                            sideOffset={4}
                          >
                            <div className="space-y-1.5">
                              <p className="font-bold text-[11px]">{rowType} ↔ {colType}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400">Correlation:</span>
                                <span className="font-bold text-[11px]" style={{ color: getCorrelationTextColor(score) }}>
                                  {score.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-relaxed">{explanation}</p>
                            </div>
                          </TooltipContent>
                        </RadixTooltip>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Color Scale Legend */}
            <div className="mt-5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }} />
                  <span className="text-[9px] text-zinc-400">0 — 0.3</span>
                </div>
                <span className="text-[9px] text-zinc-500">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.4)' }} />
                  <span className="text-[9px] text-zinc-400">0.3 — 0.6</span>
                </div>
                <span className="text-[9px] text-zinc-500">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
                  <span className="text-[9px] text-zinc-400">0.6 — 1.0</span>
                </div>
                <span className="text-[9px] text-zinc-500">High</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="size-3 rounded-sm ring-1 ring-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <span className="text-[9px] text-zinc-500">Diagonal (1.0)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
