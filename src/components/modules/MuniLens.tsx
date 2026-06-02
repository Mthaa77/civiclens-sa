'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Droplets,
  Zap,
  Trash2,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  ThermometerSun,
  FileCheck,
  Gavel,
  Leaf,
  Activity,
  ChevronRight,
  AlertOctagon,
  GitCompareArrows,
  X,
  CheckSquare,
  Square,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_MUNICIPALITIES,
  MOCK_RISK_SIGNALS,
  MOCK_TENDERS,
  MOCK_INDICATORS,
} from '@/lib/mock-data';
import {
  formatZAR,
  formatCompactZAR,
  formatNumber,
  formatPercent,
  formatPopulation,
  getScoreBand,
  getSeverityStyle,
  getMuniCategoryLabel,
} from '@/lib/formatters';
import { SA_PROVINCES } from '@/types';
import type { Municipality, RiskSignal } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

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

const tabContentVariants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

// ── Constants ───────────────────────────────────────────────────────────────

const MODULE_COLOR = '#7B2D8E';

const CATEGORY_OPTIONS = [
  { value: '__all__', label: 'All Categories' },
  { value: 'A', label: 'Metropolitan' },
  { value: 'B', label: 'Local' },
  { value: 'C', label: 'District' },
] as const;

const NATIONAL_AVERAGES = {
  waterAccess: 85.5,
  sanitationAccess: 78.2,
  electricityAccess: 89.1,
  refuseRemoval: 72.4,
};

const MFMA_SECTION_139_TRIGGERS = [
  { id: 1, name: 'Failure to adopt budget', citation: 'MFMA s139(1)(a)' },
  { id: 2, name: 'Failure to approve integrated development plan', citation: 'MFMA s139(1)(b)' },
  { id: 3, name: 'Unauthorised expenditure', citation: 'MFMA s139(1)(c)' },
  { id: 4, name: 'Persistent breach of financial commitments', citation: 'MFMA s139(5)(a)' },
  { id: 5, name: 'Failure to implement financial recovery plan', citation: 'MFMA s139(5)(b)' },
  { id: 6, name: 'Serious financial problems', citation: 'MFMA s139(7)' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function getAuditOutcomeStyle(outcome: string | null): {
  color: string;
  bgColor: string;
  dotColor: string;
} {
  if (!outcome) return { color: 'text-zinc-500', bgColor: 'bg-zinc-500/10', dotColor: 'bg-zinc-500' };
  switch (outcome) {
    case 'Clean':
      return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' };
    case 'Unqualified':
      return { color: 'text-blue-400', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-400' };
    case 'Qualified':
      return { color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400' };
    case 'Adverse':
      return { color: 'text-orange-400', bgColor: 'bg-orange-500/10', dotColor: 'bg-orange-400' };
    case 'Disclaimer':
      return { color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400' };
    default:
      return { color: 'text-zinc-500', bgColor: 'bg-zinc-500/10', dotColor: 'bg-zinc-500' };
  }
}

function getSection139Style(status: string | null): {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  if (!status || status === 'None') {
    return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: <CheckCircle2 className="size-3.5" /> };
  }
  if (status === 'Warning') {
    return { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: <AlertTriangle className="size-3.5" /> };
  }
  if (status === 'Intervention') {
    return { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: <AlertOctagon className="size-3.5" /> };
  }
  return { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', icon: <HelpCircle className="size-3.5" /> };
}

function getScoreColor(score: number | null): string {
  if (score === null) return '#71717a';
  if (score >= 80) return '#10B981';
  if (score >= 65) return '#22C55E';
  if (score >= 45) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return <TrendingUp className="size-3 text-emerald-400" />;
    case 'down': return <TrendingDown className="size-3 text-red-400" />;
    case 'stable': return <Minus className="size-3 text-zinc-500" />;
  }
}

function generateScoreComponents(score: number | null, category: string): { name: string; value: number; weight: number; trend: 'up' | 'down' | 'stable' }[] {
  if (score === null) return [];
  const base = score;
  const variance = () => Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 30));
  const trend = (): 'up' | 'down' | 'stable' => Math.random() > 0.6 ? 'up' : Math.random() > 0.4 ? 'stable' : 'down';

  switch (category) {
    case 'financial':
      return [
        { name: 'Cash Coverage', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'Debtor Collection', value: Math.round(variance()), weight: 20, trend: trend() },
        { name: 'Operating Surplus', value: Math.round(variance()), weight: 20, trend: trend() },
        { name: 'Budget Credibility', value: Math.round(variance()), weight: 15, trend: trend() },
        { name: 'Audit Compliance', value: Math.round(variance()), weight: 20, trend: trend() },
      ];
    case 'service':
      return [
        { name: 'Water Access', value: Math.round(variance()), weight: 30, trend: trend() },
        { name: 'Sanitation', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'Electricity', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'Refuse Removal', value: Math.round(variance()), weight: 20, trend: trend() },
      ];
    case 'socio':
      return [
        { name: 'Poverty Rate', value: Math.round(100 - variance() * 0.6), weight: 30, trend: trend() },
        { name: 'Youth Employment', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'SASSA Dependency', value: Math.round(100 - variance() * 0.5), weight: 20, trend: trend() },
        { name: 'Education Access', value: Math.round(variance()), weight: 25, trend: trend() },
      ];
    case 'procurement':
      return [
        { name: 'Award Transparency', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'Supplier Diversity', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'B-BBEE Compliance', value: Math.round(variance()), weight: 25, trend: trend() },
        { name: 'Value for Money', value: Math.round(variance()), weight: 25, trend: trend() },
      ];
    default:
      return [];
  }
}

function getTriggerStatus(muni: Municipality, triggerId: number): 'Met' | 'Not Met' | 'Insufficient Data' {
  if (triggerId === 3) {
    if (muni.financialHealthScore !== null && muni.financialHealthScore < 30) return 'Met';
    if (muni.financialHealthScore !== null && muni.financialHealthScore < 45) return 'Not Met';
  }
  if (triggerId === 4) {
    if (muni.cashCoverageDays !== null && muni.cashCoverageDays < 30 && muni.debtorCollectionRate !== null && muni.debtorCollectionRate < 70) return 'Met';
    if (muni.cashCoverageDays !== null && muni.cashCoverageDays < 60) return 'Not Met';
  }
  if (triggerId === 6) {
    if (muni.section139Status === 'Intervention') return 'Met';
    if (muni.section139Status === 'Warning') return 'Not Met';
  }
  if (triggerId === 1) {
    if (muni.financialHealthScore !== null && muni.financialHealthScore < 25) return 'Met';
    if (muni.financialHealthScore !== null && muni.financialHealthScore < 40) return 'Not Met';
  }
  if (triggerId === 2) {
    if (muni.serviceDeliveryScore !== null && muni.serviceDeliveryScore > 60) return 'Met';
    if (muni.serviceDeliveryScore !== null && muni.serviceDeliveryScore > 40) return 'Not Met';
  }
  if (triggerId === 5) {
    if (muni.section139Status === 'Intervention' && muni.financialHealthScore !== null && muni.financialHealthScore < 30) return 'Met';
    if (muni.section139Status === 'Warning') return 'Not Met';
  }
  return 'Insufficient Data';
}

// ── Circular Score Gauge ────────────────────────────────────────────────────

function ScoreGauge({
  score,
  label,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
}: {
  score: number | null;
  label: string;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = score !== null ? (score / 100) * circumference : 0;
  const color = getScoreColor(score);
  const band = getScoreBand(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
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
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>
            {score !== null ? score : '—'}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-[10px] text-zinc-500 leading-tight">{label}</p>
          {score !== null && (
            <p className={cn('text-[9px] font-semibold', band.color)}>{band.label}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mini Score Bar (for cards) ──────────────────────────────────────────────

function MiniScoreBar({ score, label }: { score: number | null; label: string }) {
  const color = getScoreColor(score);
  const band = getScoreBand(score);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-zinc-500">{label}</span>
        <span className="text-[9px] font-semibold tabular-nums" style={{ color }}>
          {score !== null ? score : '—'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: score !== null ? `${score}%` : '0%' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Municipality Card ───────────────────────────────────────────────────────

function MunicipalityCard({
  muni,
  onClick,
  compareMode,
  isSelected,
  onToggleSelect,
  disabled,
}: {
  muni: Municipality;
  onClick: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  disabled?: boolean;
}) {
  const auditStyle = getAuditOutcomeStyle(muni.auditOutcome);
  const s139Style = getSection139Style(muni.section139Status);
  const catLabel = getMuniCategoryLabel(muni.category);

  return (
    <motion.div
      variants={cardFadeIn}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group"
    >
      <div
        onClick={compareMode ? onToggleSelect : onClick}
        className={cn(
          'relative overflow-hidden rounded-xl border cursor-pointer',
          isSelected
            ? 'border-[#7B2D8E]/50 bg-[#7B2D8E]/08'
            : 'border-white/[0.06] bg-white/[0.02]',
          'backdrop-blur-sm',
          !isSelected && 'hover:border-white/[0.15] hover:bg-white/[0.04]',
          disabled && 'opacity-50 cursor-not-allowed',
          'transition-all duration-300 p-4',
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
          }}
        />

        {/* Background glow */}
        <div className="absolute -top-12 -right-12 size-32 rounded-full opacity-0 group-hover:opacity-[0.05] blur-2xl transition-opacity duration-500" style={{ backgroundColor: MODULE_COLOR }} />

        <div className="relative space-y-3">
          {/* Compare mode checkbox */}
          {compareMode && (
            <div className="absolute top-0 right-0 z-10">
              <div className={cn(
                'flex items-center justify-center size-6 rounded-md border transition-all',
                isSelected
                  ? 'bg-[#7B2D8E]/30 border-[#7B2D8E]/60 text-[#A855F7]'
                  : disabled
                  ? 'bg-white/[0.02] border-white/[0.06] text-zinc-700'
                  : 'bg-white/[0.04] border-white/[0.10] text-zinc-500 hover:border-[#7B2D8E]/30'
              )}>
                {isSelected ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-zinc-200 leading-snug group-hover:text-white transition-colors truncate">
                {muni.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-zinc-600">{muni.code}</span>
                <span className="text-zinc-700">•</span>
                <span className="text-[10px] text-zinc-500 truncate">{muni.province}</span>
              </div>
            </div>
            {!compareMode && (
              <Badge
                variant="outline"
                className="text-[9px] h-5 px-1.5 shrink-0 border-white/[0.08] text-zinc-400"
              >
                {catLabel}
              </Badge>
            )}
          </div>

          {/* Score indicators */}
          <div className="grid grid-cols-2 gap-2">
            <MiniScoreBar score={muni.financialHealthScore} label="Financial" />
            <MiniScoreBar score={muni.serviceDeliveryScore} label="Services" />
            <MiniScoreBar score={muni.socioEconomicIndex} label="Socio-Econ" />
            <MiniScoreBar score={muni.procurementScore} label="Procurement" />
          </div>

          {/* Bottom row: Audit + Section 139 + Population */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/[0.04]">
            {/* Audit outcome */}
            <div className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 border border-current/10', auditStyle.bgColor)}>
              <span className={cn('size-1.5 rounded-full', auditStyle.dotColor)} />
              <span className={cn('text-[9px] font-semibold', auditStyle.color)}>
                {muni.auditOutcome || 'N/A'}
              </span>
            </div>

            {/* Section 139 */}
            {(muni.section139Status === 'Warning' || muni.section139Status === 'Intervention') && (
              <div className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 border', s139Style.bgColor, s139Style.borderColor)}>
                {s139Style.icon}
                <span className={cn('text-[9px] font-semibold', s139Style.color)}>
                  §139
                </span>
              </div>
            )}

            {/* Population */}
            <div className="flex items-center gap-1 ml-auto">
              <Users className="size-2.5 text-zinc-600" />
              <span className="text-[10px] text-zinc-500 tabular-nums">
                {formatPopulation(muni.population2022)}
              </span>
            </div>

            {/* Chevron (only in non-compare mode) */}
            {!compareMode && (
              <ChevronRight className="size-3.5 text-zinc-700 group-hover:text-zinc-500 transition-colors ml-1" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Service Comparison Bar Chart ────────────────────────────────────────────

function ServiceComparisonChart({
  muniData,
  label,
  muniValue,
  nationalAvg,
}: {
  muniData: string;
  label: string;
  muniValue: number | null;
  nationalAvg: number;
}) {
  if (muniValue === null) return null;
  const isAbove = muniValue >= nationalAvg;
  const barColor = isAbove ? '#10B981' : '#EF4444';
  const nationalColor = 'rgba(255,255,255,0.15)';

  const data = [
    { name: label, municipality: muniValue, national: nationalAvg },
  ];

  const chartConfig = {
    municipality: { label: muniData, color: barColor },
    national: { label: 'National Avg', color: nationalColor },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tabular-nums" style={{ color: barColor }}>
            {formatPercent(muniValue)}
          </span>
          <span className="text-[10px] text-zinc-600">
            vs {formatPercent(nationalAvg)} national
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {/* Municipality bar */}
        <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${muniValue}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
          />
        </div>
        {/* National average indicator */}
        <div className="relative h-0.5">
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${nationalAvg}%` }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            className="absolute -top-1 size-2 rounded-full bg-white/40 border border-white/60"
          />
        </div>
      </div>
    </div>
  );
}

// ── Detail View: Scorecard Tab ──────────────────────────────────────────────

function ScorecardTab({ muni }: { muni: Municipality }) {
  const dimensions = [
    { key: 'financial', label: 'Financial Health', score: muni.financialHealthScore, icon: DollarSign },
    { key: 'service', label: 'Service Delivery', score: muni.serviceDeliveryScore, icon: Droplets },
    { key: 'socio', label: 'Socio-Economic', score: muni.socioEconomicIndex, icon: Users },
    { key: 'procurement', label: 'Procurement', score: muni.procurementScore, icon: Gavel },
  ];

  const overallScore = [
    muni.financialHealthScore,
    muni.serviceDeliveryScore,
    muni.socioEconomicIndex,
    muni.procurementScore,
  ].filter((s) => s !== null) as number[];

  const avgScore = overallScore.length > 0 ? Math.round(overallScore.reduce((a, b) => a + b, 0) / overallScore.length) : null;
  const overallBand = getScoreBand(avgScore);

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Overall Score */}
      <div className="flex flex-col items-center py-4">
        <ScoreGauge score={avgScore} label="Overall Score" size={140} strokeWidth={10} />
        <p className={cn('text-sm font-semibold mt-2', overallBand.color)}>{overallBand.label}</p>
      </div>

      {/* 4 Dimension Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dimensions.map((dim) => {
          const band = getScoreBand(dim.score);
          return (
            <motion.div
              key={dim.key}
              variants={itemSlideUp}
              className="glass-card p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${getScoreColor(dim.score)}15`, border: `1px solid ${getScoreColor(dim.score)}30` }}>
                  <dim.icon className="size-4" style={{ color: getScoreColor(dim.score) }} />
                </div>
              </div>
              <ScoreGauge score={dim.score} label={dim.label} size={90} strokeWidth={6} />
            </motion.div>
          );
        })}
      </div>

      {/* Component Breakdowns */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Score Component Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim) => {
            const components = generateScoreComponents(dim.score, dim.key);
            return (
              <div key={dim.key} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <dim.icon className="size-4" style={{ color: getScoreColor(dim.score) }} />
                  <h4 className="text-xs font-semibold text-zinc-200">{dim.label}</h4>
                  <span className="ml-auto text-sm font-bold tabular-nums" style={{ color: getScoreColor(dim.score) }}>
                    {dim.score ?? '—'}
                  </span>
                </div>
                <div className="space-y-2">
                  {components.map((comp) => (
                    <div key={comp.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 min-w-[100px]">{comp.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${comp.value}%` }}
                          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: getScoreColor(comp.value) }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold tabular-nums" style={{ color: getScoreColor(comp.value) }}>
                          {comp.value}
                        </span>
                        {getTrendIcon(comp.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail View: Finance Tab ────────────────────────────────────────────────

function FinanceTab({ muni }: { muni: Municipality }) {
  const budgetData = [
    { name: 'Operating', value: muni.operatingBudget ?? 0 },
    { name: 'Capital', value: muni.capitalBudget ?? 0 },
  ];

  const budgetChartConfig = {
    value: { label: 'Budget (ZAR)', color: MODULE_COLOR },
  };

  const cashCoverageColor = muni.cashCoverageDays !== null && muni.cashCoverageDays < 30
    ? 'text-red-400' : muni.cashCoverageDays !== null && muni.cashCoverageDays < 60
    ? 'text-amber-400' : 'text-emerald-400';

  const debtorColor = muni.debtorCollectionRate !== null && muni.debtorCollectionRate < 80
    ? 'text-amber-400' : 'text-emerald-400';

  // Generate trigger statuses
  const triggerStatuses = MFMA_SECTION_139_TRIGGERS.map((trigger) => ({
    ...trigger,
    status: getTriggerStatus(muni, trigger.id),
  }));

  const metCount = triggerStatuses.filter((t) => t.status === 'Met').length;

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Operating Budget</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">{formatCompactZAR(muni.operatingBudget)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Capital Budget</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">{formatCompactZAR(muni.capitalBudget)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Cash Coverage</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className={cn('text-lg font-bold tabular-nums', cashCoverageColor)}>
              {formatNumber(muni.cashCoverageDays)}
            </p>
            <span className="text-[10px] text-zinc-600">days</span>
          </div>
          {muni.cashCoverageDays !== null && muni.cashCoverageDays < 30 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="size-3 text-red-400" />
              <span className="text-[9px] text-red-400 font-semibold">Below 30-day threshold</span>
            </div>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Debtor Collection</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className={cn('text-lg font-bold tabular-nums', debtorColor)}>
              {formatPercent(muni.debtorCollectionRate)}
            </p>
          </div>
          {muni.debtorCollectionRate !== null && muni.debtorCollectionRate < 80 && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="size-3 text-amber-400" />
              <span className="text-[9px] text-amber-400 font-semibold">Below 80% threshold</span>
            </div>
          )}
        </div>
      </div>

      {/* Budget Comparison Chart */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Budget Comparison</h3>
        <ChartContainer config={budgetChartConfig} className="h-[200px] w-full">
          <BarChart data={budgetData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" tickFormatter={(v) => formatCompactZAR(v)} stroke="#52525b" fontSize={10} />
            <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {budgetData.map((_, index) => (
                <Cell key={index} fill={index === 0 ? '#7B2D8E' : '#A855F7'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Operating Surplus Ratio (calculated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Operating Surplus Ratio</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
            {muni.operatingBudget && muni.capitalBudget
              ? formatPercent(((muni.operatingBudget - muni.capitalBudget) / muni.operatingBudget) * 100)
              : '—'}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Capex / Opex Ratio</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
            {muni.operatingBudget && muni.capitalBudget
              ? `${((muni.capitalBudget / muni.operatingBudget) * 100).toFixed(1)}%`
              : '—'}
          </p>
        </div>
      </div>

      {/* MFMA Section 139 Trigger Panel */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-[#7B2D8E]" />
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              MFMA Section 139 Trigger Panel
            </h3>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] h-6 px-2',
              metCount >= 3
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : metCount >= 1
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            )}
          >
            {metCount} of 6 triggers met
          </Badge>
        </div>
        <div className="space-y-2">
          {triggerStatuses.map((trigger) => {
            const statusConfig = {
              Met: { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: <XCircle className="size-3.5" /> },
              'Not Met': { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: <AlertTriangle className="size-3.5" /> },
              'Insufficient Data': { color: 'text-zinc-500', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', icon: <HelpCircle className="size-3.5" /> },
            }[trigger.status];

            return (
              <div
                key={trigger.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 border',
                  statusConfig.bgColor,
                  statusConfig.borderColor,
                )}
              >
                <div className={statusConfig.color}>{statusConfig.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-300 font-medium">{trigger.name}</span>
                    <span className="text-[9px] text-zinc-600 font-mono">{trigger.citation}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-[9px] h-5 px-1.5 shrink-0 border-current/20', statusConfig.color, statusConfig.bgColor)}
                >
                  {trigger.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail View: Demographics Tab ──────────────────────────────────────────

function DemographicsTab({ muni }: { muni: Municipality }) {
  // Mock age pyramid data
  const ageGroups = [
    { group: '0-4', male: -4.2, female: 4.0 },
    { group: '5-9', male: -4.5, female: 4.3 },
    { group: '10-14', male: -4.8, female: 4.6 },
    { group: '15-19', male: -5.1, female: 5.0 },
    { group: '20-24', male: -5.5, female: 5.4 },
    { group: '25-29', male: -5.2, female: 5.3 },
    { group: '30-34', male: -4.8, female: 4.9 },
    { group: '35-39', male: -4.2, female: 4.5 },
    { group: '40-44', male: -3.5, female: 3.8 },
    { group: '45-49', male: -2.8, female: 3.2 },
    { group: '50-54', male: -2.2, female: 2.8 },
    { group: '55-59', male: -1.6, female: 2.2 },
    { group: '60-64', male: -1.2, female: 1.8 },
    { group: '65-69', male: -0.8, female: 1.3 },
    { group: '70-74', male: -0.5, female: 0.9 },
    { group: '75+', male: -0.4, female: 0.8 },
  ];

  const pyramidConfig = {
    male: { label: 'Male', color: '#3B82F6' },
    female: { label: 'Female', color: '#EC4899' },
  };

  const demoMetrics = [
    { label: 'Population', value: formatPopulation(muni.population2022), icon: Users, color: 'text-zinc-200' },
    { label: 'Poverty Rate', value: formatPercent(muni.povertyRate), icon: AlertTriangle, color: muni.povertyRate !== null && muni.povertyRate > 40 ? 'text-red-400' : 'text-amber-400' },
    { label: 'Youth Unemployment', value: formatPercent(muni.youthUnemployment), icon: TrendingDown, color: muni.youthUnemployment !== null && muni.youthUnemployment > 50 ? 'text-red-400' : 'text-amber-400' },
    { label: 'SASSA Dependency', value: formatPercent(muni.sassaDependency), icon: PieChartIcon, color: muni.sassaDependency !== null && muni.sassaDependency > 30 ? 'text-orange-400' : 'text-zinc-300' },
  ];

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Key Demographics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {demoMetrics.map((metric) => (
          <div key={metric.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="size-3.5 text-zinc-600" />
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{metric.label}</p>
            </div>
            <p className={cn('text-lg font-bold tabular-nums', metric.color)}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Age Pyramid */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Population Age Pyramid</h3>
        <ChartContainer config={pyramidConfig} className="h-[350px] w-full">
          <BarChart data={ageGroups} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" tickFormatter={(v) => `${Math.abs(v)}%`} stroke="#52525b" fontSize={9} />
            <YAxis type="category" dataKey="group" stroke="#71717a" fontSize={9} width={35} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => `${Math.abs(Number(value))}% (${name === 'male' ? 'Male' : 'Female'})`}
                />
              }
            />
            <Bar dataKey="male" fill="#3B82F6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="female" fill="#EC4899" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ChartContainer>
        <p className="text-[9px] text-zinc-600 mt-2 text-center">Population distribution by age group and sex (estimated)</p>
      </div>

      {/* Additional context */}
      {muni.wardCount && (
        <div className="glass-card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Ward Count</p>
              <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">{muni.wardCount}</p>
            </div>
            {muni.geographicAreaKm2 && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Geographic Area</p>
                <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
                  {formatNumber(muni.geographicAreaKm2)} km²
                </p>
              </div>
            )}
            {muni.population2022 && muni.geographicAreaKm2 && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Population Density</p>
                <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
                  {formatNumber(Math.round(muni.population2022 / muni.geographicAreaKm2))}/km²
                </p>
              </div>
            )}
            {muni.population2022 && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Approx. Households</p>
                <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
                  {formatNumber(Math.round(muni.population2022 / 3.3))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Detail View: Services Tab ───────────────────────────────────────────────

function ServicesTab({ muni }: { muni: Municipality }) {
  const services = [
    { key: 'water', label: 'Water Access', icon: Droplets, value: muni.waterAccess, national: NATIONAL_AVERAGES.waterAccess },
    { key: 'sanitation', label: 'Sanitation Access', icon: Zap, value: muni.sanitationAccess, national: NATIONAL_AVERAGES.sanitationAccess },
    { key: 'electricity', label: 'Electricity Access', icon: Zap, value: muni.electricityAccess, national: NATIONAL_AVERAGES.electricityAccess },
    { key: 'refuse', label: 'Refuse Removal', icon: Trash2, value: muni.refuseRemoval, national: NATIONAL_AVERAGES.refuseRemoval },
  ];

  // Bar chart data for Recharts
  const barData = services.map((s) => ({
    name: s.label.replace(' Access', '').replace(' Removal', ''),
    municipality: s.value ?? 0,
    national: s.national,
  }));

  const barChartConfig = {
    municipality: { label: muni.name, color: '#7B2D8E' },
    national: { label: 'National Average', color: 'rgba(255,255,255,0.2)' },
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Service delivery comparison bars */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
          Service Delivery vs National Average
        </h3>
        <div className="space-y-5">
          {services.map((service) => (
            <ServiceComparisonChart
              key={service.key}
              muniData={muni.name}
              label={service.label}
              muniValue={service.value}
              nationalAvg={service.national}
            />
          ))}
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
          Comparative Service Access
        </h3>
        <ChartContainer config={barChartConfig} className="h-[250px] w-full">
          <BarChart data={barData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#52525b" fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="municipality" fill="#7B2D8E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="national" fill="rgba(255,255,255,0.12)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Service Delivery Pressure Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Service Delivery Pressure Score</p>
          <div className="flex items-center gap-3 mt-2">
            <ScoreGauge score={muni.serviceDeliveryScore} label="" size={60} strokeWidth={5} showLabel={false} />
            <div>
              <p className="text-sm font-semibold text-zinc-200">{getScoreBand(muni.serviceDeliveryScore).label}</p>
              <p className="text-[10px] text-zinc-500">Higher = more pressure</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Avg Service Access</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
            {services.reduce((sum, s) => sum + (s.value ?? 0), 0) / services.filter((s) => s.value !== null).length > 0
              ? formatPercent(
                  services.reduce((sum, s) => sum + (s.value ?? 0), 0) / services.filter((s) => s.value !== null).length
                )
              : '—'}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            vs {formatPercent(Object.values(NATIONAL_AVERAGES).reduce((a, b) => a + b, 0) / Object.values(NATIONAL_AVERAGES).length)} national average
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail View: Audit Tab ──────────────────────────────────────────────────

function AuditTab({ muni }: { muni: Municipality }) {
  const auditStyle = getAuditOutcomeStyle(muni.auditOutcome);

  // Mock audit history
  const auditHistory = [
    { year: '2019/20', outcome: muni.auditOutcome === 'Clean' ? 'Unqualified' : muni.auditOutcome === 'Unqualified' ? 'Unqualified' : 'Qualified', score: 65 },
    { year: '2020/21', outcome: muni.auditOutcome === 'Clean' ? 'Unqualified' : muni.auditOutcome === 'Disclaimer' ? 'Adverse' : 'Qualified', score: 55 },
    { year: '2021/22', outcome: muni.auditOutcome === 'Clean' ? 'Clean' : muni.auditOutcome === 'Disclaimer' ? 'Disclaimer' : 'Qualified', score: 45 },
    { year: '2022/23', outcome: muni.auditOutcome === 'Clean' ? 'Clean' : muni.auditOutcome === 'Disclaimer' ? 'Disclaimer' : muni.auditOutcome === 'Adverse' ? 'Adverse' : 'Qualified', score: 40 },
    { year: '2023/24', outcome: muni.auditOutcome ?? 'N/A', score: 35 },
  ];

  const trajectoryScore = auditHistory.length >= 2
    ? auditHistory[auditHistory.length - 1].score - auditHistory[0].score
    : 0;

  const trajectoryLabel = trajectoryScore > 5 ? 'Improving' : trajectoryScore < -5 ? 'Declining' : 'Stable';
  const trajectoryColor = trajectoryScore > 5 ? 'text-emerald-400' : trajectoryScore < -5 ? 'text-red-400' : 'text-amber-400';
  const trajectoryIcon = trajectoryScore > 5 ? <TrendingUp className="size-4" /> : trajectoryScore < -5 ? <TrendingDown className="size-4" /> : <Minus className="size-4" />;

  const materialIrregularities = muni.auditOutcome === 'Disclaimer' || muni.auditOutcome === 'Adverse' ? 3 : muni.auditOutcome === 'Qualified' ? 1 : 0;

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Current Audit Outcome */}
      <div className={cn('glass-card p-5 border', auditStyle.bgColor, 'border-current/10')}>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl" style={{ background: `${getScoreColor(muni.financialHealthScore)}15` }}>
            <FileCheck className="size-6" style={{ color: auditStyle.color.replace('text-', '') === 'emerald-400' ? '#34D399' : auditStyle.color.replace('text-', '') === 'blue-400' ? '#60A5FA' : auditStyle.color.replace('text-', '') === 'amber-400' ? '#FBBF24' : auditStyle.color.replace('text-', '') === 'orange-400' ? '#FB923C' : '#F87171' }} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Latest Audit Outcome ({muni.auditYear})</p>
            <p className={cn('text-2xl font-bold mt-0.5', auditStyle.color)}>{muni.auditOutcome ?? 'Not Available'}</p>
          </div>
        </div>
      </div>

      {/* Key Audit Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Trajectory</p>
          <div className={cn('flex items-center justify-center gap-1 mt-2', trajectoryColor)}>
            {trajectoryIcon}
            <span className="text-sm font-bold">{trajectoryLabel}</span>
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Material Irregularities</p>
          <p className={cn('text-lg font-bold tabular-nums mt-2', materialIrregularities > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {materialIrregularities}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Audit Year</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-2">{muni.auditYear ?? '—'}</p>
        </div>
      </div>

      {/* Audit Outcome History */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Audit Outcome History</h3>
        <div className="space-y-2">
          {auditHistory.map((item, i) => {
            const style = getAuditOutcomeStyle(item.outcome);
            const isLatest = i === auditHistory.length - 1;
            return (
              <div key={item.year} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg', isLatest && 'bg-white/[0.04]')}>
                <span className="text-xs font-mono text-zinc-500 w-16">{item.year}</span>
                <div className={cn('flex items-center gap-1.5 rounded-md px-2 py-0.5', style.bgColor)}>
                  <span className={cn('size-1.5 rounded-full', style.dotColor)} />
                  <span className={cn('text-[10px] font-semibold', style.color)}>{item.outcome}</span>
                </div>
                {isLatest && (
                  <Badge variant="outline" className="text-[8px] h-4 px-1 border-[#7B2D8E]/30 text-[#7B2D8E] bg-[#7B2D8E]/5">
                    Latest
                  </Badge>
                )}
                {/* Progress indicator */}
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden ml-auto max-w-[100px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getScoreColor(item.score) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Detail View: Procurement Tab ────────────────────────────────────────────

function ProcurementTab({ muni }: { muni: Municipality }) {
  // Get tenders for this municipality
  const muniTenders = MOCK_TENDERS.filter(
    (t) => t.municipalityCode === muni.code
  );

  const totalTenderValue = muniTenders.reduce((sum, t) => sum + (t.estimatedValue ?? 0), 0);
  const tenderValuePerCapita = muni.population2022 ? totalTenderValue / muni.population2022 : null;
  const awardCount = muniTenders.filter((t) => t.status === 'Awarded').length;
  const activeCount = muniTenders.filter((t) => t.status === 'Active').length;

  // Mock supplier diversity data
  const diversityData = [
    { name: 'Level 1', value: 35, fill: '#10B981' },
    { name: 'Level 2', value: 25, fill: '#22C55E' },
    { name: 'Level 3', value: 18, fill: '#3B82F6' },
    { name: 'Level 4', value: 12, fill: '#8B5CF6' },
    { name: 'Level 5+', value: 10, fill: '#6B7280' },
  ];

  const diversityConfig = {
    value: { label: 'Awards %', color: '#7B2D8E' },
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Key Procurement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Tender Value Per Capita</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">
            {tenderValuePerCapita !== null ? formatCompactZAR(tenderValuePerCapita) : '—'}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Total Tender Value</p>
          <p className="text-lg font-bold text-zinc-200 tabular-nums mt-1">{formatCompactZAR(totalTenderValue)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Active Tenders</p>
          <p className="text-lg font-bold text-emerald-400 tabular-nums mt-1">{activeCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Awards This Year</p>
          <p className="text-lg font-bold text-blue-400 tabular-nums mt-1">{awardCount}</p>
        </div>
      </div>

      {/* Procurement Score + Supplier Diversity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Procurement Score */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Procurement Score</h3>
          <div className="flex items-center gap-4">
            <ScoreGauge score={muni.procurementScore} label="" size={100} strokeWidth={8} showLabel={false} />
            <div>
              <p className={cn('text-lg font-bold', getScoreBand(muni.procurementScore).color)}>
                {getScoreBand(muni.procurementScore).label}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Based on transparency, diversity, compliance & value for money
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Diversity */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Supplier B-BBEE Diversity</h3>
          <ChartContainer config={diversityConfig} className="h-[180px] w-full">
            <RechartsPieChart>
              <Pie
                data={diversityData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {diversityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPieChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-3 flex-wrap mt-1">
            {diversityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="size-2 rounded-sm" style={{ backgroundColor: item.fill }} />
                <span className="text-[9px] text-zinc-500">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tenders */}
      {muniTenders.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Recent Tenders</h3>
          <div className="space-y-2">
            {muniTenders.slice(0, 5).map((tender) => {
              const statusColor = tender.status === 'Active' ? 'text-emerald-400' : tender.status === 'Awarded' ? 'text-blue-400' : 'text-red-400';
              return (
                <div key={tender.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{tender.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={cn('text-[8px] h-4 px-1', statusColor, 'border-current/20')}>
                        {tender.status}
                      </Badge>
                      <span className="text-[9px] text-zinc-600">{tender.category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 tabular-nums shrink-0">
                    {formatCompactZAR(tender.estimatedValue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {muniTenders.length === 0 && (
        <div className="glass-card p-6 text-center">
          <BarChart3 className="size-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">No tender data available for this municipality</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Detail View: Risk Tab ───────────────────────────────────────────────────

function RiskTab({ muni }: { muni: Municipality }) {
  const risks = MOCK_RISK_SIGNALS.filter(
    (r) => r.municipalityCode === muni.code || r.entityId === muni.code
  );

  const severityCounts = {
    Critical: risks.filter((r) => r.severity === 'Critical').length,
    High: risks.filter((r) => r.severity === 'High').length,
    Medium: risks.filter((r) => r.severity === 'Medium').length,
    Low: risks.filter((r) => r.severity === 'Low').length,
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map((severity) => {
          const style = getSeverityStyle(severity);
          return (
            <div key={severity} className="glass-card p-3 text-center">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{severity}</p>
              <p className={cn('text-2xl font-bold tabular-nums mt-1', style.color)}>
                {severityCounts[severity]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Early Alert Score */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <ScoreGauge score={muni.earlyAlertScore} label="" size={90} strokeWidth={7} showLabel={false} />
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Early Alert Score</p>
            <p className={cn('text-lg font-bold', getScoreBand(muni.earlyAlertScore).color)}>
              {getScoreBand(muni.earlyAlertScore).label}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Higher score = higher risk of Section 139 intervention
            </p>
          </div>
        </div>
      </div>

      {/* Active Risk Signals */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
          Active Risk Signals
        </h3>
        {risks.length > 0 ? (
          <div className="space-y-2">
            {risks.map((risk) => {
              const style = getSeverityStyle(risk.severity);
              return (
                <div
                  key={risk.id}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2.5 rounded-lg border',
                    style.bgColor,
                    style.borderColor,
                  )}
                >
                  <div className={cn('mt-0.5', style.color)}>
                    <ShieldAlert className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-300 font-medium">{risk.type}</span>
                      <Badge
                        variant="outline"
                        className={cn('text-[8px] h-4 px-1', style.color, style.bgColor, 'border-current/20')}
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{risk.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-zinc-600">Indicator: {risk.indicator}</span>
                      {risk.indicatorValue !== null && (
                        <span className="text-[9px] text-zinc-500">Value: {risk.indicatorValue}</span>
                      )}
                      {risk.threshold !== null && (
                        <span className="text-[9px] text-zinc-500">Threshold: {risk.threshold}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="size-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No active risk signals for this municipality</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Detail View: Climate Tab ────────────────────────────────────────────────

function ClimateTab({ muni }: { muni: Municipality }) {
  // Mock climate breakdown data
  const climateBreakdown = [
    { dimension: 'Flood Risk', value: muni.climateRiskScore !== null ? Math.min(100, muni.climateRiskScore + (Math.random() * 20 - 10)) : 0, fullMark: 100 },
    { dimension: 'Drought Risk', value: muni.climateRiskScore !== null ? Math.min(100, muni.climateRiskScore * 0.8 + (Math.random() * 15)) : 0, fullMark: 100 },
    { dimension: 'Heat Stress', value: muni.climateRiskScore !== null ? Math.min(100, muni.climateRiskScore * 0.6 + (Math.random() * 20)) : 0, fullMark: 100 },
    { dimension: 'Sea Level Rise', value: muni.climateRiskScore !== null ? Math.min(100, muni.climateRiskScore * 0.3 + (Math.random() * 10)) : 0, fullMark: 100 },
    { dimension: 'Water Scarcity', value: muni.climateRiskScore !== null ? Math.min(100, muni.climateRiskScore * 0.7 + (Math.random() * 15)) : 0, fullMark: 100 },
  ];

  const radarConfig = {
    value: { label: 'Risk Level', color: '#7B2D8E' },
  };

  const climateScoreBand = getScoreBand(muni.climateRiskScore);

  const climateMetrics = [
    { label: 'Overall Vulnerability', value: muni.climateRiskScore, max: 100 },
    { label: 'Flood Risk', value: Math.round(climateBreakdown[0].value), max: 100 },
    { label: 'Drought Risk', value: Math.round(climateBreakdown[1].value), max: 100 },
    { label: 'Heat Stress', value: Math.round(climateBreakdown[2].value), max: 100 },
  ];

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
      {/* Climate Vulnerability Score */}
      <div className={cn('glass-card p-5', climateScoreBand.bgColor, 'border border-current/10')}>
        <div className="flex items-center gap-4">
          <ScoreGauge score={muni.climateRiskScore} label="" size={100} strokeWidth={8} showLabel={false} />
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Climate Vulnerability Score</p>
            <p className={cn('text-xl font-bold', climateScoreBand.color)}>{climateScoreBand.label}</p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Composite score based on flood, drought, heat stress, sea level rise & water scarcity risk
            </p>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">Risk Dimension Breakdown</h3>
          <ChartContainer config={radarConfig} className="h-[250px] w-full">
            <RadarChart data={climateBreakdown}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dimension" stroke="#71717a" fontSize={9} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#52525b" fontSize={8} />
              <Radar
                name="Risk Level"
                dataKey="value"
                stroke="#7B2D8E"
                fill="#7B2D8E"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </div>

        {/* Progress Bars */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">Climate Risk Levels</h3>
          <div className="space-y-4">
            {climateMetrics.map((metric) => {
              const color = getScoreColor(100 - metric.value);
              return (
                <div key={metric.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{metric.label}</span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                      {metric.value}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Climate context */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="size-4 text-emerald-500" />
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Climate Context</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Province Risk Zone</p>
            <p className="text-sm text-zinc-300 font-medium mt-1">
              {muni.province === 'Western Cape' ? 'Moderate-High (Drought)' :
               muni.province === 'KwaZulu-Natal' ? 'High (Flood/Drought)' :
               muni.province === 'Eastern Cape' ? 'High (Drought)' :
               muni.province === 'Gauteng' ? 'Moderate (Heat/Flood)' :
               muni.province === 'Limpopo' ? 'High (Heat/Drought)' :
               muni.province === 'Mpumalanga' ? 'Moderate-High (Drought)' :
               muni.province === 'Northern Cape' ? 'High (Drought/Heat)' :
               muni.province === 'North West' ? 'Moderate-High (Drought)' :
               muni.province === 'Free State' ? 'Moderate (Drought)' : 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Adaptation Priority</p>
            <p className={cn(
              'text-sm font-medium mt-1',
              muni.climateRiskScore !== null && muni.climateRiskScore >= 60 ? 'text-red-400' :
              muni.climateRiskScore !== null && muni.climateRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {muni.climateRiskScore !== null && muni.climateRiskScore >= 60 ? 'Critical' :
               muni.climateRiskScore !== null && muni.climateRiskScore >= 40 ? 'Elevated' : 'Standard'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Municipality Comparison View ─────────────────────────────────────────────

const COMPARE_COLORS = ['#7B2D8E', '#10B981', '#F59E0B'];

function MunicipalityComparisonView({
  municipalities,
  onBack,
}: {
  municipalities: Municipality[];
  onBack: () => void;
}) {
  const munis = municipalities;

  // Radar chart data: 4 dimensions for each municipality overlaid
  const radarData = [
    { dimension: 'Financial Health', ...Object.fromEntries(munis.map((m, i) => [`muni${i}`, m.financialHealthScore ?? 0])) },
    { dimension: 'Service Delivery', ...Object.fromEntries(munis.map((m, i) => [`muni${i}`, m.serviceDeliveryScore ?? 0])) },
    { dimension: 'Socio-Economic', ...Object.fromEntries(munis.map((m, i) => [`muni${i}`, m.socioEconomicIndex ?? 0])) },
    { dimension: 'Procurement', ...Object.fromEntries(munis.map((m, i) => [`muni${i}`, m.procurementScore ?? 0])) },
  ];

  const radarConfig = Object.fromEntries(
    munis.map((m, i) => [`muni${i}`, { label: m.name, color: COMPARE_COLORS[i] }])
  );

  // Comparison table rows
  const comparisonRows = [
    { label: 'Province', get: (m: Municipality) => m.province },
    { label: 'Category', get: (m: Municipality) => getMuniCategoryLabel(m.category) },
    { label: 'Population', get: (m: Municipality) => formatPopulation(m.population2022) },
    { label: 'Financial Health Score', get: (m: Municipality) => m.financialHealthScore !== null ? `${m.financialHealthScore}/100` : '—', numeric: true as const, score: (m: Municipality) => m.financialHealthScore },
    { label: 'Service Delivery Score', get: (m: Municipality) => m.serviceDeliveryScore !== null ? `${m.serviceDeliveryScore}/100` : '—', numeric: true as const, score: (m: Municipality) => m.serviceDeliveryScore },
    { label: 'Socio-Economic Index', get: (m: Municipality) => m.socioEconomicIndex !== null ? `${m.socioEconomicIndex}/100` : '—', numeric: true as const, score: (m: Municipality) => m.socioEconomicIndex },
    { label: 'Procurement Score', get: (m: Municipality) => m.procurementScore !== null ? `${m.procurementScore}/100` : '—', numeric: true as const, score: (m: Municipality) => m.procurementScore },
    { label: 'Audit Outcome', get: (m: Municipality) => m.auditOutcome ?? 'N/A' },
    { label: 'Cash Coverage (days)', get: (m: Municipality) => m.cashCoverageDays !== null ? `${m.cashCoverageDays}` : '—', numeric: true as const, score: (m: Municipality) => m.cashCoverageDays },
    { label: 'Debtor Collection Rate', get: (m: Municipality) => m.debtorCollectionRate !== null ? `${m.debtorCollectionRate}%` : '—' },
    { label: 'Operating Budget', get: (m: Municipality) => formatCompactZAR(m.operatingBudget) },
    { label: 'Capital Budget', get: (m: Municipality) => formatCompactZAR(m.capitalBudget) },
    { label: '§139 Status', get: (m: Municipality) => m.section139Status ?? 'None' },
    { label: 'Poverty Rate', get: (m: Municipality) => formatPercent(m.povertyRate) },
    { label: 'Youth Unemployment', get: (m: Municipality) => formatPercent(m.youthUnemployment) },
    { label: 'Water Access', get: (m: Municipality) => formatPercent(m.waterAccess) },
    { label: 'Sanitation Access', get: (m: Municipality) => formatPercent(m.sanitationAccess) },
    { label: 'Early Alert Score', get: (m: Municipality) => m.earlyAlertScore !== null ? `${m.earlyAlertScore}/100` : '—', numeric: true as const, score: (m: Municipality) => m.earlyAlertScore },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-5"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-3 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] -ml-2"
      >
        <ArrowLeft className="size-4 mr-1.5" />
        Back to Municipalities
      </Button>

      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${MODULE_COLOR}25, ${MODULE_COLOR}08)`, border: `1px solid ${MODULE_COLOR}30` }}>
            <GitCompareArrows className="size-5" style={{ color: MODULE_COLOR }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Municipality Comparison</h2>
            <p className="text-xs text-zinc-500">Side-by-side analysis of {munis.length} municipalities</p>
          </div>
        </div>
      </div>

      {/* Side-by-side score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {munis.map((m, i) => {
          const overallScore = [
            m.financialHealthScore,
            m.serviceDeliveryScore,
            m.socioEconomicIndex,
            m.procurementScore,
          ].filter((s) => s !== null) as number[];
          const avgScore = overallScore.length > 0 ? Math.round(overallScore.reduce((a, b) => a + b, 0) / overallScore.length) : null;
          const band = getScoreBand(avgScore);

          return (
            <motion.div
              key={m.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card p-4"
            >
              {/* Top accent with compare color */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                style={{ backgroundColor: COMPARE_COLORS[i] }}
              />
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: COMPARE_COLORS[i] }} />
                <h3 className="text-sm font-semibold text-zinc-200 truncate">{m.name}</h3>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">{m.code} · {m.province}</p>

              <div className="flex items-center justify-center my-3">
                <ScoreGauge score={avgScore} label="Overall" size={80} strokeWidth={6} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Financial', score: m.financialHealthScore },
                  { label: 'Services', score: m.serviceDeliveryScore },
                  { label: 'Socio-Econ', score: m.socioEconomicIndex },
                  { label: 'Procurement', score: m.procurementScore },
                ].map((dim) => (
                  <MiniScoreBar key={dim.label} score={dim.score} label={dim.label} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Radar Chart */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
          Score Dimension Comparison
        </h3>
        <ChartContainer config={radarConfig} className="h-[320px] w-full">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="dimension" stroke="#71717a" fontSize={10} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#52525b" fontSize={8} />
            {munis.map((m, i) => (
              <Radar
                key={m.code}
                name={`muni${i}`}
                dataKey={`muni${i}`}
                stroke={COMPARE_COLORS[i]}
                fill={COMPARE_COLORS[i]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <ChartTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ChartContainer>
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {munis.map((m, i) => (
            <div key={m.code} className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i] }} />
              <span className="text-[10px] text-zinc-400">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card p-4 overflow-x-auto">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
          Detailed Metric Comparison
        </h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium py-2 pr-4 whitespace-nowrap">Metric</th>
              {munis.map((m, i) => (
                <th key={m.code} className="text-[10px] uppercase tracking-wider font-medium py-2 px-3 whitespace-nowrap" style={{ color: COMPARE_COLORS[i] }}>
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr key={row.label} className={cn(idx % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                <td className="text-[11px] text-zinc-400 py-2 pr-4 whitespace-nowrap border-t border-white/[0.03]">
                  <div className="flex items-center gap-1.5">
                    {row.numeric && <ArrowUpDown className="size-2.5 text-zinc-700" />}
                    {row.label}
                  </div>
                </td>
                {munis.map((m, mIdx) => {
                  const value = row.get(m);
                  // For numeric rows, find best value
                  const isBest = row.score && row.score(m) !== null &&
                    row.score(m) === Math.max(...munis.map(mm => row.score!(mm) ?? -Infinity));
                  return (
                    <td key={m.code} className={cn(
                      'text-[11px] py-2 px-3 whitespace-nowrap border-t border-white/[0.03]',
                      isBest && mIdx > 0 ? 'text-emerald-400 font-semibold' : 'text-zinc-300'
                    )}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Municipality Detail View ────────────────────────────────────────────────

function MunicipalityDetail({
  muni,
  onBack,
}: {
  muni: Municipality;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState('scorecard');
  const auditStyle = getAuditOutcomeStyle(muni.auditOutcome);
  const s139Style = getSection139Style(muni.section139Status);
  const catLabel = getMuniCategoryLabel(muni.category);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-3 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] -ml-2"
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Back to Municipalities
        </Button>

        <div className="glass-card p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Muni Icon */}
            <div className="flex size-14 items-center justify-center rounded-xl shrink-0" style={{ background: `linear-gradient(135deg, ${MODULE_COLOR}25, ${MODULE_COLOR}08)`, border: `1px solid ${MODULE_COLOR}30` }}>
              <Building2 className="size-7" style={{ color: MODULE_COLOR }} />
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-zinc-100">{muni.name}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs font-mono text-zinc-500">{muni.code}</span>
                <span className="text-zinc-700">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="size-3 text-zinc-600" />
                  <span className="text-xs text-zinc-400">{muni.province}</span>
                </div>
                <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400">
                  {catLabel}
                </Badge>
                <div className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 border border-current/10', auditStyle.bgColor)}>
                  <span className={cn('size-1.5 rounded-full', auditStyle.dotColor)} />
                  <span className={cn('text-[9px] font-semibold', auditStyle.color)}>
                    {muni.auditOutcome}
                  </span>
                </div>
                {muni.section139Status !== 'None' && muni.section139Status !== null && (
                  <div className={cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 border', s139Style.bgColor, s139Style.borderColor)}>
                    {s139Style.icon}
                    <span className={cn('text-[9px] font-semibold', s139Style.color)}>
                      §139 {muni.section139Status}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="size-3 text-zinc-600" />
                  <span className="text-xs text-zinc-500 tabular-nums">{formatPopulation(muni.population2022)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Score Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Financial Health', score: muni.financialHealthScore, icon: DollarSign },
          { label: 'Service Delivery', score: muni.serviceDeliveryScore, icon: Droplets },
          { label: 'Socio-Economic', score: muni.socioEconomicIndex, icon: Users },
          { label: 'Procurement', score: muni.procurementScore, icon: Gavel },
        ].map((dim, i) => {
          const band = getScoreBand(dim.score);
          return (
            <motion.div
              key={dim.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-7 items-center justify-center rounded-lg" style={{ background: `${getScoreColor(dim.score)}15`, border: `1px solid ${getScoreColor(dim.score)}25` }}>
                  <dim.icon className="size-3.5" style={{ color: getScoreColor(dim.score) }} />
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{dim.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums" style={{ color: getScoreColor(dim.score) }}>
                  {dim.score ?? '—'}
                </span>
                <span className={cn('text-[10px] font-semibold', band.color)}>{band.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: dim.score !== null ? `${dim.score}%` : '0%' }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor(dim.score) }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 lg:-mx-6 lg:px-6">
          <TabsList className="bg-white/[0.03] border border-white/[0.06] h-9 p-[3px] w-full sm:w-auto inline-flex">
            <TabsTrigger value="scorecard" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <Activity className="size-3 mr-1" />
              Scorecard
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <DollarSign className="size-3 mr-1" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <Users className="size-3 mr-1" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="services" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <Droplets className="size-3 mr-1" />
              Services
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <FileCheck className="size-3 mr-1" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="procurement" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <Gavel className="size-3 mr-1" />
              Procurement
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <ShieldAlert className="size-3 mr-1" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="climate" className="text-[10px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-[#7B2D8E]/20 data-[state=active]:text-[#A855F7]">
              <ThermometerSun className="size-3 mr-1" />
              Climate
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent key={activeTab} value={activeTab} className="mt-4">
            {activeTab === 'scorecard' && <ScorecardTab muni={muni} />}
            {activeTab === 'finance' && <FinanceTab muni={muni} />}
            {activeTab === 'demographics' && <DemographicsTab muni={muni} />}
            {activeTab === 'services' && <ServicesTab muni={muni} />}
            {activeTab === 'audit' && <AuditTab muni={muni} />}
            {activeTab === 'procurement' && <ProcurementTab muni={muni} />}
            {activeTab === 'risk' && <RiskTab muni={muni} />}
            {activeTab === 'climate' && <ClimateTab muni={muni} />}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

// ── Main MuniLens Component ─────────────────────────────────────────────────

export default function MuniLens() {
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('__all__');
  const [categoryFilter, setCategoryFilter] = useState<string>('__all__');
  const [selectedMuni, setSelectedMuni] = useState<Municipality | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter municipalities
  const filteredMunicipalities = useMemo(() => {
    return MOCK_MUNICIPALITIES.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase());
      const matchesProvince =
        provinceFilter === '__all__' || m.province === provinceFilter;
      const matchesCategory =
        categoryFilter === '__all__' || m.category === categoryFilter;
      return matchesSearch && matchesProvince && matchesCategory;
    });
  }, [search, provinceFilter, categoryFilter]);

  const handleSelectMuni = useCallback((muni: Municipality) => {
    setSelectedMuni(muni);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedMuni(null);
  }, []);

  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev);
    setSelectedMunicipalities([]);
    setShowComparison(false);
  }, []);

  const toggleMunicipalitySelection = useCallback((code: string) => {
    setSelectedMunicipalities((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 3) return prev; // max 3
      return [...prev, code];
    });
  }, []);

  const selectedMuniObjects = useMemo(() => {
    return selectedMunicipalities
      .map((code) => MOCK_MUNICIPALITIES.find((m) => m.code === code))
      .filter((m): m is Municipality => m !== undefined);
  }, [selectedMunicipalities]);

  return (
    <div className="min-h-[80vh] pb-20">
      <AnimatePresence mode="wait">
        {selectedMuni ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <MunicipalityDetail muni={selectedMuni} onBack={handleBack} />
          </motion.div>
        ) : showComparison && selectedMuniObjects.length >= 2 ? (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <MunicipalityComparisonView
              municipalities={selectedMuniObjects}
              onBack={() => {
                setShowComparison(false);
                setSelectedMunicipalities([]);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Module Header */}
            <div className="mb-5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex size-9 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${MODULE_COLOR}25, ${MODULE_COLOR}08)`, border: `1px solid ${MODULE_COLOR}30` }}>
                    <Building2 className="size-5" style={{ color: MODULE_COLOR }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-zinc-100">MuniLens</h1>
                    <p className="text-xs text-zinc-500">Municipality intelligence profiles for South Africa's 257 municipalities</p>
                  </div>
                  {/* Compare button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCompareMode}
                    className={cn(
                      'ml-auto gap-1.5 text-xs h-8 px-3 rounded-lg transition-all duration-200',
                      compareMode
                        ? 'bg-[#7B2D8E]/20 border-[#7B2D8E]/40 text-[#A855F7] hover:bg-[#7B2D8E]/30'
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <GitCompareArrows className="size-3.5" />
                    {compareMode ? 'Cancel Compare' : 'Compare'}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Search + Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
              className="sticky top-0 z-20 -mx-4 lg:-mx-6 -mt-1 mb-4"
            >
              <div className="bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-6 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                    <Input
                      placeholder="Search by municipality name or code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 text-sm focus-visible:border-[#7B2D8E]/50 focus-visible:ring-[#7B2D8E]/20"
                    />
                  </div>

                  <Select
                    value={provinceFilter}
                    onValueChange={setProvinceFilter}
                  >
                    <SelectTrigger className="w-[160px] h-9 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
                      <MapPin className="size-3.5 mr-1 text-zinc-500" />
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
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[150px] h-9 bg-white/[0.04] border-white/[0.08] text-zinc-300 text-xs">
                      <Building2 className="size-3.5 mr-1 text-zinc-500" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-zinc-300 text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-xs text-zinc-600 ml-1">
                    <span className="text-zinc-300 font-semibold tabular-nums">{filteredMunicipalities.length}</span>
                    {' '}of {MOCK_MUNICIPALITIES.length}
                  </span>
                </div>

                {/* Province quick-filter tabs */}
                <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setProvinceFilter('__all__')}
                    className={cn(
                      'text-[10px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap',
                      provinceFilter === '__all__'
                        ? 'bg-[#7B2D8E]/20 border-[#7B2D8E]/30 text-[#A855F7]'
                        : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]',
                    )}
                  >
                    All
                  </button>
                  {SA_PROVINCES.map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setProvinceFilter(prov)}
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap',
                        provinceFilter === prov
                          ? 'bg-[#7B2D8E]/20 border-[#7B2D8E]/30 text-[#A855F7]'
                          : 'border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.1]',
                      )}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Municipality Grid */}
            {filteredMunicipalities.length > 0 ? (
              <motion.div
                variants={containerStagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              >
                {filteredMunicipalities.map((muni) => (
                  <MunicipalityCard
                    key={muni.id}
                    muni={muni}
                    onClick={() => handleSelectMuni(muni)}
                    compareMode={compareMode}
                    isSelected={selectedMunicipalities.includes(muni.code)}
                    onToggleSelect={() => toggleMunicipalitySelection(muni.code)}
                    disabled={compareMode && selectedMunicipalities.length >= 3 && !selectedMunicipalities.includes(muni.code)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Building2 className="size-10 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500">No municipalities match your filters</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setProvinceFilter('__all__');
                    setCategoryFilter('__all__');
                  }}
                  className="mt-3 text-[#A855F7] hover:text-[#7B2D8E] text-xs"
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating comparison bar */}
      <AnimatePresence>
        {compareMode && !showComparison && selectedMunicipalities.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#7B2D8E]/30 bg-[#0d1224]/95 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-[#7B2D8E]/10">
              <GitCompareArrows className="size-4 text-[#A855F7]" />
              <span className="text-sm text-zinc-300">
                <span className="font-bold text-[#A855F7]">{selectedMunicipalities.length}</span>/3 municipalities selected
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                {selectedMunicipalities.map((code, i) => {
                  const muni = MOCK_MUNICIPALITIES.find((m) => m.code === code);
                  return (
                    <Badge
                      key={code}
                      className="text-[9px] h-5 px-1.5 gap-1 border-white/[0.08] text-zinc-300 bg-white/[0.05]"
                      variant="outline"
                    >
                      <div className="size-2 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i] }} />
                      {muni?.name ?? code}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMunicipalitySelection(code);
                        }}
                        className="ml-0.5 hover:text-red-400 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <Button
                size="sm"
                disabled={selectedMunicipalities.length < 2}
                onClick={() => setShowComparison(true)}
                className={cn(
                  'ml-2 gap-1.5 text-xs h-8 px-4 rounded-lg',
                  selectedMunicipalities.length >= 2
                    ? 'bg-[#7B2D8E] hover:bg-[#7B2D8E]/80 text-white'
                    : 'bg-white/[0.05] text-zinc-600 cursor-not-allowed'
                )}
              >
                <GitCompareArrows className="size-3.5" />
                Compare Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
