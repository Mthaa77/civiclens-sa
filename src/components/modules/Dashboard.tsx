'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Building2,
  AlertTriangle,
  FileSearch,
  DollarSign,
  ShieldAlert,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Shield,
  Map,
  Download,
  RefreshCw,
  Loader2,
  GitCompareArrows,
  Users,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_KPIS,
  AUDIT_OUTCOMES_DISTRIBUTION,
  PROVINCE_SUMMARY,
  SERVICE_DELIVERY_BY_PROVINCE,
  MOCK_RISK_SIGNALS,
  MOCK_TENDERS,
  MOCK_MUNICIPALITIES,
} from '@/lib/mock-data';
import {
  formatCompactZAR,
  formatNumber,
  formatSADate,
  formatPopulation,
  getScoreBand,
  getSeverityStyle,
} from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import DataExport from '@/components/shared/DataExport';
import WatchlistWidget from '@/components/shared/WatchlistWidget';
import type { ModuleId, ExportColumn } from '@/types';

// ── Live Data Indicator Hook ───────────────────────────────────────────────

function useLiveCounter(refreshInterval: number = 1) {
  const [seconds, setSeconds] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setSeconds(0);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  }, []);

  const formatCounter = () => {
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return { counter: formatCounter(), isRefreshing, refresh, seconds };
}

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const listItemStagger = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
};

// ── Province Accent Colors ──────────────────────────────────────────────────

const PROVINCE_ACCENT_COLORS: Record<string, string> = {
  'Gauteng': '#0077B6',
  'Western Cape': '#22C55E',
  'KwaZulu-Natal': '#F59E0B',
  'Eastern Cape': '#EF4444',
  'Free State': '#8B5CF6',
  'Limpopo': '#2D6A4F',
  'Mpumalanga': '#F97316',
  'North West': '#06B6D4',
  'Northern Cape': '#EC4899',
};

// ── Tender Category Colors ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Infrastructure': '#3B82F6',
  'Water & Sanitation': '#06B6D4',
  'ICT': '#8B5CF6',
  'Professional Services': '#F59E0B',
  'Health': '#10B981',
  'Energy': '#F97316',
  'Education': '#22C55E',
  'Transport': '#EF4444',
  'Housing': '#EC4899',
  'Waste Management': '#6B7280',
  'Security': '#DC2626',
  'Agriculture': '#84CC16',
};

// ── KPI Card Data ───────────────────────────────────────────────────────────

interface KPICardData {
  label: string;
  value: string;
  rawValue: number;
  trend: { direction: 'up' | 'down'; value: string };
  sentiment: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: React.ReactNode;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  targetModule: ModuleId;
}

const kpiCards: KPICardData[] = [
  {
    label: 'Total Municipalities',
    value: formatNumber(DASHBOARD_KPIS.totalMunicipalities),
    rawValue: DASHBOARD_KPIS.totalMunicipalities,
    trend: { direction: 'up', value: '+2' },
    sentiment: 'neutral',
    icon: <Building2 className="size-5" />,
    accentColor: '#0077B6',
    gradientFrom: 'from-[#0077B6]/10',
    gradientTo: 'to-[#0077B6]/[0.02]',
    targetModule: 'munilens' as ModuleId,
  },
  {
    label: 'Municipalities in Distress',
    value: formatNumber(DASHBOARD_KPIS.municipalitiesInDistress),
    rawValue: DASHBOARD_KPIS.municipalitiesInDistress,
    trend: { direction: 'up', value: '+8.2%' },
    sentiment: 'negative',
    icon: <AlertTriangle className="size-5" />,
    accentColor: '#EF4444',
    gradientFrom: 'from-[#EF4444]/10',
    gradientTo: 'to-[#EF4444]/[0.02]',
    targetModule: 'munilens' as ModuleId,
  },
  {
    label: 'Active Tenders',
    value: formatNumber(DASHBOARD_KPIS.activeTenders),
    rawValue: DASHBOARD_KPIS.activeTenders,
    trend: { direction: 'up', value: '+12.4%' },
    sentiment: 'neutral',
    icon: <FileSearch className="size-5" />,
    accentColor: '#2D6A4F',
    gradientFrom: 'from-[#2D6A4F]/10',
    gradientTo: 'to-[#2D6A4F]/[0.02]',
    targetModule: 'tenderlens' as ModuleId,
  },
  {
    label: 'Total Tender Value',
    value: formatCompactZAR(DASHBOARD_KPIS.totalTenderValue),
    rawValue: DASHBOARD_KPIS.totalTenderValue,
    trend: { direction: 'up', value: '+5.7%' },
    sentiment: 'neutral',
    icon: <DollarSign className="size-5" />,
    accentColor: '#B45309',
    gradientFrom: 'from-[#B45309]/10',
    gradientTo: 'to-[#B45309]/[0.02]',
    targetModule: 'tenderlens' as ModuleId,
  },
  {
    label: 'Active Risk Signals',
    value: formatNumber(DASHBOARD_KPIS.riskSignalsActive),
    rawValue: DASHBOARD_KPIS.riskSignalsActive,
    trend: { direction: 'up', value: '+14.3%' },
    sentiment: 'warning',
    icon: <ShieldAlert className="size-5" />,
    accentColor: '#F59E0B',
    gradientFrom: 'from-[#F59E0B]/10',
    gradientTo: 'to-[#F59E0B]/[0.02]',
    targetModule: 'risklens' as ModuleId,
  },
  {
    label: 'Section 139 Interventions',
    value: formatNumber(DASHBOARD_KPIS.section139Interventions),
    rawValue: DASHBOARD_KPIS.section139Interventions,
    trend: { direction: 'up', value: '+3' },
    sentiment: 'negative',
    icon: <AlertOctagon className="size-5" />,
    accentColor: '#DC2626',
    gradientFrom: 'from-[#DC2626]/10',
    gradientTo: 'to-[#DC2626]/[0.02]',
    targetModule: 'earlyalert' as ModuleId,
  },
];

// ── Chart Colors ────────────────────────────────────────────────────────────

const SERVICE_COLORS = {
  water: '#3B82F6',
  sanitation: '#10B981',
  electricity: '#F59E0B',
  refuse: '#6B7280',
};

const FHS_COLORS: Record<string, string> = {
  Excellent: '#10B981',
  Good: '#22C55E',
  Fair: '#F59E0B',
  Poor: '#F97316',
  Critical: '#EF4444',
};

// ── Helper: Get FHS color by score ─────────────────────────────────────────

function getFHSBarColor(score: number): string {
  if (score >= 65) return '#10B981';
  if (score >= 45) return '#F59E0B';
  if (score >= 25) return '#F97316';
  return '#EF4444';
}

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ title, subtitle, accentColor = '#0077B6' }: { title: string; subtitle?: string; accentColor?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-1 h-6 rounded-full shrink-0"
        style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}40)` }}
      />
      <div>
        <h2 className="text-base font-bold text-zinc-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function KPICard({ data, index }: { data: KPICardData; index: number }) {
  const { setActiveModule } = useNavigationStore();

  const handleClick = () => {
    setActiveModule(data.targetModule);
  };

  return (
    <motion.div
      variants={itemSlideUp}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ duration: 0.2 }}
      className="relative group cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.08] p-4 lg:p-5',
          'bg-gradient-to-br',
          data.gradientFrom,
          data.gradientTo,
          'backdrop-blur-sm transition-all duration-300 cursor-pointer',
          'hover:shadow-lg hover:shadow-black/20'
        )}
        style={{
          cursor: 'pointer',
          borderColor: undefined,
          boxShadow: `inset 0 1px 30px ${data.accentColor}08, inset 0 0 60px ${data.accentColor}04`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${data.accentColor}30`;
          e.currentTarget.style.boxShadow = `inset 0 1px 40px ${data.accentColor}12, inset 0 0 80px ${data.accentColor}06, 0 8px 32px ${data.accentColor}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = `inset 0 1px 30px ${data.accentColor}08, inset 0 0 60px ${data.accentColor}04`;
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{
            background: `linear-gradient(90deg, ${data.accentColor}, transparent)`,
          }}
        />

        {/* Subtle background pattern — diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              ${data.accentColor}15 8px,
              ${data.accentColor}15 9px
            )`,
          }}
        />

        {/* Shimmer effect on hover — KPI shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${data.accentColor}10 40%, ${data.accentColor}18 50%, ${data.accentColor}10 60%, transparent 100%)`,
            }}
          />
        </div>

        {/* Background glow — two layers for depth */}
        <div
          className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.16] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />
        <div
          className="absolute -bottom-4 -left-4 size-16 rounded-full opacity-[0.04] blur-xl group-hover:opacity-[0.10] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />

        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              {data.label}
            </p>
            <p
              className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight"
              style={{ color: data.accentColor }}
            >
              {data.value}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {data.trend.direction === 'up' ? (
                <TrendingUp
                  className={cn(
                    'size-4',
                    data.sentiment === 'negative'
                      ? 'text-red-400'
                      : data.sentiment === 'warning'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  )}
                />
              ) : (
                <TrendingDown
                  className={cn(
                    'size-4',
                    data.sentiment === 'positive'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  data.sentiment === 'negative'
                    ? 'text-red-400'
                    : data.sentiment === 'warning'
                      ? 'text-amber-400'
                      : data.sentiment === 'positive'
                        ? 'text-emerald-400'
                        : 'text-zinc-300'
                )}
              >
                {data.trend.value}
              </span>
              <span className="text-[10px] text-zinc-500 ml-0.5">vs prev. year</span>
            </div>
          </div>

          <div
            className="flex size-10 items-center justify-center rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300"
            style={{
              background: `${data.accentColor}18`,
              border: `1px solid ${data.accentColor}30`,
            }}
          >
            <div style={{ color: data.accentColor }}>{data.icon}</div>
          </div>
        </div>

        {/* Click to explore hover text */}
        <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-1">
          <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-300 flex items-center gap-1">
            Click to explore <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Audit Outcome Donut Chart ───────────────────────────────────────────────

function AuditOutcomeChart() {
  const total = AUDIT_OUTCOMES_DISTRIBUTION.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div variants={itemFadeIn}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative">
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #0077B6, #2D6A4F, transparent)' }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-[#0077B6]/10 border border-[#0077B6]/20">
              <Shield className="size-3 text-[#0077B6]" />
            </span>
            Audit Outcome Distribution
          </CardTitle>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            2023/24 MFMA audit outcomes — {total} municipalities
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="relative w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={AUDIT_OUTCOMES_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {AUDIT_OUTCOMES_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13, 18, 36, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e4e4e7',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} (${((value / total) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label with radial gradient background */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="absolute inset-[30%] rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, #0077B615 0%, transparent 70%)`,
                  }}
                />
                <span className="relative text-2xl font-extrabold text-zinc-100 tabular-nums">{total}</span>
                <span className="relative text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {AUDIT_OUTCOMES_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 group/legend">
                  <div
                    className="size-3 rounded-sm shrink-0 group-hover/legend:scale-125 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 6px ${item.color}40`,
                    }}
                  />
                  <span className="text-xs text-zinc-300 flex-1 font-medium">{item.name}</span>
                  <span className="text-xs font-bold text-zinc-200 tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-[10px] text-zinc-400 tabular-nums w-10 text-right font-semibold">
                    {((item.value / total) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Provincial Financial Health Bar Chart ────────────────────────────────────

function ProvincialFHSChart() {
  const sortedData = [...PROVINCE_SUMMARY].sort((a, b) => a.avgFHS - b.avgFHS);

  return (
    <motion.div variants={itemFadeIn}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative">
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #2D6A4F, #F59E0B, transparent)' }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
              <TrendingUp className="size-3 text-[#2D6A4F]" />
            </span>
            Provincial Financial Health
          </CardTitle>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Average Financial Health Score by province — colour-coded by score band
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="province"
                  width={95}
                  tick={{ fill: '#d4d4d8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(13, 18, 36, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e4e4e7',
                  }}
                  formatter={(value: number) => [`${value}/100`, 'Avg FHS']}
                />
                <Bar dataKey="avgFHS" radius={[0, 4, 4, 0]} barSize={16}>
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFHSBarColor(entry.avgFHS)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Service Delivery Stacked Bar ────────────────────────────────────────────

function ServiceDeliveryChart() {
  return (
    <motion.div variants={itemSlideUp}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative">
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, #F59E0B, transparent)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <Building2 className="size-3 text-[#3B82F6]" />
                </span>
                Service Delivery by Province
              </CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Household access to basic services (%)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { key: 'water', label: 'Water', color: SERVICE_COLORS.water },
                { key: 'sanitation', label: 'Sanitation', color: SERVICE_COLORS.sanitation },
                { key: 'electricity', label: 'Electricity', color: SERVICE_COLORS.electricity },
                { key: 'refuse', label: 'Refuse', color: SERVICE_COLORS.refuse },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-1.5 group/legend">
                  <div
                    className="size-2.5 rounded-sm group-hover/legend:scale-125 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 5px ${item.color}40`,
                    }}
                  />
                  <span className="text-[10px] text-zinc-400 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SERVICE_DELIVERY_BY_PROVINCE}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="province"
                  tick={{ fill: '#d4d4d8', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(13, 18, 36, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e4e4e7',
                  }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Bar dataKey="water" stackId="a" fill={SERVICE_COLORS.water} radius={[0, 0, 0, 0]} />
                <Bar dataKey="sanitation" stackId="a" fill={SERVICE_COLORS.sanitation} />
                <Bar dataKey="electricity" stackId="a" fill={SERVICE_COLORS.electricity} />
                <Bar
                  dataKey="refuse"
                  stackId="a"
                  fill={SERVICE_COLORS.refuse}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Provincial Intelligence Table ───────────────────────────────────────────

function ProvincialTable() {
  const { setActiveModule } = useNavigationStore();

  const handleRowClick = () => {
    setActiveModule('geolens' as ModuleId);
  };

  return (
    <motion.div variants={itemSlideUp}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded bg-[#B45309]/10 border border-[#B45309]/20">
                  <Map className="size-3 text-[#B45309]" />
                </span>
                Provincial Intelligence Table
              </CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Key metrics by province — click row to explore in GeoLens
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-white/[0.08] text-zinc-400 text-[10px] cursor-pointer hover:border-[#B45309]/30 hover:text-[#B45309] transition-all"
              onClick={handleRowClick}
            >
              <Map className="size-3 mr-1" />
              Open Map
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{
                    borderBottom: '1px solid transparent',
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.1), rgba(255,255,255,0.06))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                >
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                    Province
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider text-right">
                    Municipalities
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider text-right">
                    Avg FHS
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider text-right">
                    Avg SDS
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider text-right">
                    §139
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider text-right">
                    Clean Audits
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROVINCE_SUMMARY.map((prov, rowIdx) => {
                  const fhsBand = getScoreBand(prov.avgFHS);
                  const sdsBand = getScoreBand(100 - prov.avgSDS);
                  const provinceAccent = PROVINCE_ACCENT_COLORS[prov.province] || '#71717a';
                  return (
                    <TableRow
                      key={prov.province}
                      className={cn(
                        'cursor-pointer transition-colors',
                        rowIdx % 2 === 0 ? 'bg-white/[0.01]' : '',
                        'hover:bg-white/[0.04]'
                      )}
                      onClick={handleRowClick}
                      style={{
                        borderLeft: `3px solid ${provinceAccent}30`,
                      }}
                    >
                      <TableCell className="font-semibold text-zinc-200 text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: provinceAccent }}
                          />
                          {prov.province}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-zinc-300 text-xs tabular-nums">
                        {prov.municipalities}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center text-xs font-bold tabular-nums',
                            fhsBand.textColor
                          )}
                        >
                          {prov.avgFHS}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center text-xs font-bold tabular-nums',
                            sdsBand.textColor
                          )}
                        >
                          {prov.avgSDS}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {prov.section139 > 0 ? (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px] h-5 px-1.5 font-semibold">
                            {prov.section139}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {prov.cleanAudit > 0 ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px] h-5 px-1.5 font-semibold">
                            {prov.cleanAudit}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-xs">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



// ── Municipality Comparison Widget ──────────────────────────────────────────

const COMPARISON_COLORS = ['#0077B6', '#2D6A4F', '#B45309'];

function MunicipalityComparison() {
  const [selected1, setSelected1] = useState('2'); // Johannesburg
  const [selected2, setSelected2] = useState('1'); // Cape Town
  const [selected3, setSelected3] = useState('3'); // eThekwini

  const municipalityOptions = MOCK_MUNICIPALITIES.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code,
  }));

  const getMunicipality = (id: string) => MOCK_MUNICIPALITIES.find((m) => m.id === id);

  const selectedMunicipalities = [selected1, selected2, selected3]
    .map((id) => getMunicipality(id))
    .filter(Boolean);

  const getAuditBadgeStyle = (outcome: string | null) => {
    switch (outcome) {
      case 'Clean': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'Unqualified': return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'Qualified': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'Adverse': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
      case 'Disclaimer': return 'bg-red-500/15 text-red-400 border-red-500/25';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
    }
  };

  const getSection139BadgeStyle = (status: string | null) => {
    switch (status) {
      case 'Intervention': return 'bg-red-500/15 text-red-400 border-red-500/25';
      case 'Warning': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'None': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-zinc-400';
    if (score >= 65) return 'text-emerald-400';
    if (score >= 45) return 'text-amber-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div variants={itemSlideUp}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#7B2D8E]/10 border border-[#7B2D8E]/20">
              <GitCompareArrows className="size-3.5 text-[#7B2D8E]" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-200">
                Municipality Comparison
              </CardTitle>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Select municipalities to compare key metrics side by side
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Select dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[selected1, selected2, selected3].map((val, idx) => {
              const setter = [setSelected1, setSelected2, setSelected3][idx];
              const labels = ['Municipality A', 'Municipality B', 'Municipality C'];
              const colors = COMPARISON_COLORS;
              return (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: colors[idx] }} />
                    {labels[idx]}
                  </label>
                  <Select value={val} onValueChange={setter}>
                    <SelectTrigger
                      className="w-full bg-[#0d1224] text-zinc-300 text-xs h-8"
                      style={{ borderColor: `${colors[idx]}30` }}
                    >
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                      {municipalityOptions.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-zinc-300 text-xs focus:bg-white/[0.06] focus:text-zinc-100">
                          {m.name} ({m.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{
                    background: 'linear-gradient(90deg, rgba(0,119,182,0.04), rgba(45,106,79,0.04), rgba(180,83,9,0.04))',
                    borderBottom: '1px solid transparent',
                    backgroundImage: 'linear-gradient(to right, #0077B620, #2D6A4F20, #B4530920), linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.1), rgba(255,255,255,0.06))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                >
                  <TableHead className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider w-[160px]">
                    Metric
                  </TableHead>
                  {selectedMunicipalities.map((m, i) => {
                    return (
                      <TableHead
                        key={m!.id}
                        className="text-right text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: COMPARISON_COLORS[i] }}
                      >
                        {m!.name}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Financial Health Score */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-xs text-zinc-300 font-semibold">Financial Health Score</TableCell>
                  {selectedMunicipalities.map((m, i) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`fhs-${m!.id}-${m!.financialHealthScore}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={cn('text-sm font-bold tabular-nums', getScoreColor(m!.financialHealthScore))}
                      >
                        {m!.financialHealthScore ?? '—'}/100
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Service Delivery Score */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-xs text-zinc-300 font-semibold">Service Delivery Score</TableCell>
                  {selectedMunicipalities.map((m, i) => {
                    const sds = m!.serviceDeliveryScore !== null ? 100 - m!.serviceDeliveryScore : null;
                    return (
                      <TableCell key={m!.id} className="text-right">
                        <motion.span
                          key={`sds-${m!.id}-${m!.serviceDeliveryScore}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn('text-sm font-bold tabular-nums', getScoreColor(sds))}
                        >
                          {m!.serviceDeliveryScore !== null ? `${m!.serviceDeliveryScore}/100` : '—'}
                        </motion.span>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* FHS vs SDS comparison row */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    <ArrowLeftRight className="size-3" /> FHS vs SDS Gap
                  </TableCell>
                  {selectedMunicipalities.map((m) => {
                    const fhs = m!.financialHealthScore ?? 0;
                    const sds = m!.serviceDeliveryScore ?? 0;
                    const gap = Math.abs(fhs - sds);
                    const gapColor = gap > 30 ? 'text-red-400' : gap > 15 ? 'text-amber-400' : 'text-emerald-400';
                    return (
                      <TableCell key={m!.id} className="text-right">
                        <motion.span
                          key={`gap-${m!.id}-${fhs}-${sds}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn('text-sm font-bold tabular-nums', gapColor)}
                        >
                          {m!.financialHealthScore !== null && m!.serviceDeliveryScore !== null ? `${gap} pts` : '—'}
                        </motion.span>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* Audit Outcome */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-xs text-zinc-300 font-semibold">Audit Outcome</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.div
                        key={`audit-${m!.id}-${m!.auditOutcome}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={cn('text-[10px] h-5 px-1.5 border font-semibold', getAuditBadgeStyle(m!.auditOutcome))}>
                          {m!.auditOutcome ?? '—'}
                        </Badge>
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Population */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Users className="size-3" /> Population
                  </TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`pop-${m!.id}-${m!.population2022}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-semibold text-zinc-200 tabular-nums"
                      >
                        {formatPopulation(m!.population2022)}
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Section 139 Status */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-xs text-zinc-300 font-semibold">§139 Status</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.div
                        key={`s139-${m!.id}-${m!.section139Status}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={cn('text-[10px] h-5 px-1.5 border font-semibold', getSection139BadgeStyle(m!.section139Status))}>
                          {m!.section139Status ?? '—'}
                        </Badge>
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Province */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-xs text-zinc-300 font-semibold">Province</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`prov-${m!.id}-${m!.province}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-xs text-zinc-300 font-medium"
                      >
                        {m!.province}
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



// ── Risk Signals Panel ──────────────────────────────────────────────────────

function RiskSignalsPanel() {
  const { setActiveModule } = useNavigationStore();
  const recentSignals = [...MOCK_RISK_SIGNALS]
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .slice(0, 5);

  return (
    <motion.div variants={itemFadeIn}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 h-full overflow-hidden">
        {/* Accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B, transparent)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="size-3.5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-zinc-200">
                  Recent Risk Signals
                </CardTitle>
                <p className="text-[10px] text-zinc-400">
                  {DASHBOARD_KPIS.riskSignalsActive} active signals
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[340px]">
            <div className="space-y-2.5">
              {recentSignals.map((signal, i) => {
                const severityStyle = getSeverityStyle(signal.severity);
                const severityColor = signal.severity === 'Critical' ? '#EF4444' : signal.severity === 'High' ? '#F97316' : signal.severity === 'Medium' ? '#F59E0B' : '#22C55E';
                return (
                  <motion.div
                    key={signal.id}
                    custom={i}
                    variants={listItemStagger}
                    initial="hidden"
                    animate="show"
                    className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                    style={{ borderLeft: `4px solid ${severityColor}` }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Badge
                        className={cn(
                          'shrink-0 text-[9px] h-5 px-1.5 font-bold border',
                          severityStyle.bgColor,
                          severityStyle.color,
                          severityStyle.borderColor
                        )}
                        variant="outline"
                      >
                        {signal.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {signal.type}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {signal.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {signal.entityId}
                          </span>
                          <span className="text-[10px] text-zinc-600">·</span>
                          <span className="text-[10px] text-zinc-400">
                            {formatSADate(signal.detectedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
          <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <button
            onClick={() => setActiveModule('risklens' as ModuleId)}
            className="group flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="relative">
              View all risk signals
              <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
            </span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Active Tender Highlights Panel ──────────────────────────────────────────

function TenderHighlightsPanel() {
  const { setActiveModule } = useNavigationStore();
  const activeTenders = MOCK_TENDERS.filter((t) => t.status === 'Active')
    .sort((a, b) => (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0))
    .slice(0, 5);

  return (
    <motion.div variants={itemFadeIn}>
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 h-full overflow-hidden">
        {/* Accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #2D6A4F, #B45309, transparent)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
                <FileSearch className="size-3.5 text-[#2D6A4F]" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-zinc-200">
                  Active Tender Highlights
                </CardTitle>
                <p className="text-[10px] text-zinc-400">
                  Top {activeTenders.length} by estimated value
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[340px]">
            <div className="space-y-2.5">
              {activeTenders.map((tender, i) => {
                const categoryColor = CATEGORY_COLORS[tender.category] || '#71717a';
                return (
                  <motion.div
                    key={tender.id}
                    custom={i}
                    variants={listItemStagger}
                    initial="hidden"
                    animate="show"
                    className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                    style={{ borderLeft: `4px solid ${categoryColor}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-1 leading-snug">
                          {tender.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {tender.buyerName}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-[#B45309] tabular-nums shrink-0">
                        {formatCompactZAR(tender.estimatedValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 font-semibold"
                        style={{
                          borderColor: `${categoryColor}30`,
                          color: categoryColor,
                          backgroundColor: `${categoryColor}10`,
                        }}
                      >
                        {tender.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Clock className="size-2.5" />
                        <span>Closes {formatSADate(tender.closingDate ?? '')}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
          <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <button
            onClick={() => setActiveModule('tenderlens' as ModuleId)}
            className="group flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="relative">
              View all tenders
              <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
            </span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Dashboard Header ────────────────────────────────────────────────────────

function DashboardHeader({ onExportOpen }: { onExportOpen: () => void }) {
  const { counter, isRefreshing, refresh } = useLiveCounter();

  return (
    <motion.div variants={itemSlideUp} className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Live Indicator + Counter */}
      <div className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 flex-1">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2.5 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <div className="relative size-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Live Data
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <Shield className="size-3 text-zinc-400" />
          <span className="text-[11px] text-zinc-400">
            Data as of 03 Mar 2026 — MFMA 2023/24 cycle
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 text-zinc-400" />
          <span className="text-[11px] text-zinc-400 font-mono">
            Last updated: {counter}
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
          v1.0.0-mvp
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="h-8 gap-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.06]"
        >
          <RefreshCw
            className={cn('size-3.5', isRefreshing && 'animate-spin')}
          />
          <span className="text-[11px]">Refresh</span>
        </Button>

        {/* Export Button - Opens DataExport Sheet */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportOpen}
          className="h-8 gap-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.06]"
        >
          <Download className="size-3.5" />
          <span className="text-[11px]">Export</span>
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
  const [exportOpen, setExportOpen] = useState(false);

  // ── Export Data Configuration ──────────────────────────────────────────────
  const exportData = useMemo(() => 
    PROVINCE_SUMMARY.map((prov) => ({
      province: prov.province,
      municipalities: prov.municipalities,
      avgFHS: prov.avgFHS,
      avgSDS: prov.avgSDS,
      section139: prov.section139,
      cleanAudit: prov.cleanAudit,
    }))
  , []);

  const exportColumns: ExportColumn[] = useMemo(() => [
    { key: 'province', label: 'Province', selected: true },
    { key: 'municipalities', label: 'Municipalities', selected: true },
    { key: 'avgFHS', label: 'Avg Financial Health Score', selected: true },
    { key: 'avgSDS', label: 'Avg Service Delivery Score', selected: true },
    { key: 'section139', label: 'Section 139 Interventions', selected: true },
    { key: 'cleanAudit', label: 'Clean Audits', selected: true },
  ], []);

  return (
    <div className="space-y-6 relative">
      {/* Subtle noise texture overlay for depth */}
      <div className="noise-texture absolute inset-0 pointer-events-none rounded-xl" />

      {/* ── Dashboard Header ────────────────────────────────────── */}
      <DashboardHeader onExportOpen={() => setExportOpen(true)} />

      {/* ── Quick Insight Banner ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-3"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-300">
              Financial Distress Alert: 63% of municipalities now classified as distressed
            </p>
            <p className="text-[10px] text-amber-400/70 mt-0.5">
              162 of 257 municipalities below Financial Health Score threshold of 45 — up 8.2% year-on-year
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] shrink-0 font-semibold">
            High Priority
          </Badge>
        </div>
      </motion.div>

      {/* ── Hero KPI Strip ──────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="National Overview"
          subtitle="Key performance indicators across South Africa's 257 municipalities"
          accentColor="#0077B6"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4"
        >
          {kpiCards.map((kpi, index) => (
            <KPICard key={kpi.label} data={kpi} index={index} />
          ))}
        </motion.div>
      </div>

      {/* ── National Overview Charts ────────────────────────────── */}
      <div>
        <SectionHeader
          title="Audit & Financial Intelligence"
          subtitle="Distribution of audit outcomes and provincial financial health scores"
          accentColor="#2D6A4F"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <AuditOutcomeChart />
          <ProvincialFHSChart />
        </motion.div>
      </div>

      {/* ── Service Delivery Heatmap ────────────────────────────── */}
      <div>
        <SectionHeader
          title="Service Delivery Pressure"
          subtitle="Household access to basic services by province (%)"
          accentColor="#3B82F6"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <ServiceDeliveryChart />
        </motion.div>
      </div>

      {/* ── Provincial Intelligence Table ───────────────────────── */}
      <div>
        <SectionHeader
          title="Provincial Intelligence"
          subtitle="Comprehensive provincial metrics — click any row to explore spatially"
          accentColor="#B45309"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <ProvincialTable />
        </motion.div>
      </div>

      {/* ── Municipality Comparison ─────────────────────────────── */}
      <div>
        <SectionHeader
          title="Municipality Comparison"
          subtitle="Side-by-side analysis of selected municipalities"
          accentColor="#7B2D8E"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <MunicipalityComparison />
        </motion.div>
      </div>

      {/* ── Watchlist, Risk Signals & Tender Highlights ──────────── */}
      <div>
        <SectionHeader
          title="Intelligence Feed"
          subtitle="Watchlist, latest risk signals and active procurement opportunities"
          accentColor="#D97706"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <WatchlistWidget />
          <RiskSignalsPanel />
          <TenderHighlightsPanel />
        </motion.div>
      </div>

      {/* ── Data Export Sheet ──────────────────────────────────── */}
      <DataExport
        open={exportOpen}
        onOpenChange={setExportOpen}
        data={exportData}
        columns={exportColumns}
        filenamePrefix="civiclens-provincial-intelligence"
      />
    </div>
  );
}
