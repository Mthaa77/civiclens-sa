'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  Landmark,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Download,
  ArrowUpDown,
  Filter,
  Building2,
  Cpu,
  CalendarDays,
  Target,
  PieChart,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactZAR, formatNumber, formatPercent } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const cardEntrance = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

// ── Budget Commitments Data ─────────────────────────────────────────────────

const BUDGET_COMMITMENTS = [
  { commitment: 'Expand free education to ECD level', department: 'Basic Education', allocated: 42000000000, spent: 38500000000, status: 'On Track' as const },
  { commitment: 'National Health Insurance pilot', department: 'Health', allocated: 28000000000, spent: 15200000000, status: 'Behind' as const },
  { commitment: 'Employment stimulus — 500,000 jobs', department: 'Employment & Labour', allocated: 18000000000, spent: 12100000000, status: 'Behind' as const },
  { commitment: 'Municipal infrastructure upgrade', department: 'CoGTA', allocated: 65000000000, spent: 52500000000, status: 'On Track' as const },
  { commitment: 'Land reform and redistribution', department: 'Agriculture', allocated: 12000000000, spent: 6800000000, status: 'Behind' as const },
  { commitment: 'Energy transition — renewable procurement', department: 'Mineral Resources & Energy', allocated: 35000000000, spent: 28000000000, status: 'On Track' as const },
  { commitment: 'Social grant increase (above inflation)', department: 'Social Development', allocated: 258000000000, spent: 248000000000, status: 'On Track' as const },
  { commitment: 'Water and sanitation infrastructure', department: 'Water & Sanitation', allocated: 42000000000, spent: 22800000000, status: 'Behind' as const },
];

// ── MTEF Trend Data ────────────────────────────────────────────────────────

const MTEF_DATA = [
  { year: 'FY2020/21', health: 58, education: 72, socialDev: 48, coGTA: 32, defence: 52, police: 42 },
  { year: 'FY2021/22', health: 62, education: 78, socialDev: 52, coGTA: 35, defence: 55, police: 45 },
  { year: 'FY2022/23', health: 68, education: 82, socialDev: 58, coGTA: 38, defence: 56, police: 48 },
  { year: 'FY2023/24', health: 74, education: 88, socialDev: 65, coGTA: 42, defence: 58, police: 52 },
  { year: 'FY2024/25', health: 78, education: 92, socialDev: 72, coGTA: 45, defence: 60, police: 55 },
  { year: 'FY2025/26', health: 82, education: 98, socialDev: 78, coGTA: 48, defence: 62, police: 58 },
  { year: 'FY2026/27', health: 86, education: 102, socialDev: 82, coGTA: 52, defence: 64, police: 60 },
];

// ── Department Expenditure Data ─────────────────────────────────────────────

const DEPT_EXPENDITURE = [
  { department: 'Social Development', appropriation: 258000000000, expenditure: 248000000000, pctSpent: 96.1, icon: PieChart },
  { department: 'Basic Education', appropriation: 312000000000, expenditure: 285000000000, pctSpent: 91.3, icon: Building2 },
  { department: 'Health', appropriation: 248000000000, expenditure: 218000000000, pctSpent: 87.9, icon: Target },
  { department: 'Police', appropriation: 105000000000, expenditure: 92000000000, pctSpent: 87.6, icon: Cpu },
  { department: 'Defence', appropriation: 58000000000, expenditure: 48500000000, pctSpent: 83.6, icon: Landmark },
  { department: 'Higher Education', appropriation: 128000000000, expenditure: 105000000000, pctSpent: 82.0, icon: Building2 },
  { department: 'CoGTA', appropriation: 92000000000, expenditure: 72000000000, pctSpent: 78.3, icon: PieChart },
  { department: 'Water & Sanitation', appropriation: 68000000000, expenditure: 48000000000, pctSpent: 70.6, icon: Target },
  { department: 'Agriculture', appropriation: 28000000000, expenditure: 18500000000, pctSpent: 66.1, icon: BarChart3 },
  { department: 'Energy', appropriation: 85000000000, expenditure: 52500000000, pctSpent: 61.8, icon: Cpu },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

type CommitmentStatus = 'On Track' | 'Behind' | 'Critical';

function getStatusAccent(status: CommitmentStatus) {
  switch (status) {
    case 'On Track': return { border: 'border-l-emerald-400', bar: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,0.3)', text: 'text-emerald-400' };
    case 'Behind': return { border: 'border-l-amber-400', bar: 'from-amber-500 to-yellow-400', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-400' };
    case 'Critical': return { border: 'border-l-red-400', bar: 'from-red-500 to-rose-400', glow: 'rgba(239,68,68,0.3)', text: 'text-red-400' };
  }
}

function getSpendColor(pct: number) {
  if (pct >= 90) return { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.25)' };
  if (pct >= 75) return { bar: 'from-amber-500 to-yellow-400', text: 'text-amber-400', glow: 'rgba(245,158,11,0.25)' };
  return { bar: 'from-red-500 to-rose-400', text: 'text-red-400', glow: 'rgba(239,68,68,0.25)' };
}

function getStatusIcon(status: CommitmentStatus) {
  switch (status) {
    case 'On Track': return CheckCircle2;
    case 'Behind': return Clock;
    case 'Critical': return AlertTriangle;
  }
}

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, accent = 'emerald' }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accent?: 'emerald' | 'teal' | 'amber' | 'red';
}) {
  const accentColors = {
    emerald: 'from-emerald-400 to-teal-400',
    teal: 'from-teal-400 to-cyan-400',
    amber: 'from-amber-400 to-yellow-400',
    red: 'from-red-400 to-rose-400',
  };
  const iconColors = {
    emerald: 'text-emerald-400',
    teal: 'text-teal-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  const bgColors = {
    emerald: 'bg-emerald-400/10 border-emerald-400/20',
    teal: 'bg-teal-400/10 border-teal-400/20',
    amber: 'bg-amber-400/10 border-amber-400/20',
    red: 'bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex size-9 items-center justify-center rounded-xl border', bgColors[accent])}>
        <Icon className={cn('size-4.5', iconColors[accent])} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={cn('w-1 h-5 rounded-full bg-gradient-to-b', accentColors[accent])} />
          <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        </div>
        {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5 ml-3">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip for MTEF Chart ───────────────────────────────────────────

function MTEFCustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-v2 p-3 min-w-[180px]" style={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-[11px] font-semibold text-zinc-300 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}40` }} />
              <span className="text-[10px] text-zinc-400">{entry.name}</span>
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-zinc-200">R{entry.value}B</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Animated Progress Bar ────────────────────────────────────────────────────

function GradientProgress({ value, max = 100, gradientFrom, gradientTo, glowColor, className, height = 'h-2' }: {
  value: number;
  max?: number;
  gradientFrom: string;
  gradientTo: string;
  glowColor?: string;
  className?: string;
  height?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn('w-full rounded-full overflow-hidden', height, 'bg-white/[0.06]', className)} style={glowColor ? { boxShadow: `0 0 8px ${glowColor}` } : undefined}>
      <motion.div
        className={cn('h-full rounded-full relative')}
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
      >
        <div className="absolute inset-0 rounded-full" style={{
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: `0 0 10px ${gradientFrom}60, 0 0 20px ${gradientTo}30`,
        }} />
      </motion.div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function BudgetLens() {
  const [sortField, setSortField] = useState<'department' | 'spendRate' | 'appropriation' | 'variance'>('spendRate');
  const [filterStatus, setFilterStatus] = useState<'all' | 'on-track' | 'behind' | 'critical'>('all');
  const [selectedYear, setSelectedYear] = useState('2025/26');

  // Compute commitment summary stats
  const commitmentStats = useMemo(() => {
    const total = BUDGET_COMMITMENTS.length;
    const onTrack = BUDGET_COMMITMENTS.filter(c => c.status === 'On Track').length;
    const behind = BUDGET_COMMITMENTS.filter(c => c.status === 'Behind').length;
    const totalAllocated = BUDGET_COMMITMENTS.reduce((s, c) => s + c.allocated, 0);
    const totalSpent = BUDGET_COMMITMENTS.reduce((s, c) => s + c.spent, 0);
    const pctComplete = (totalSpent / totalAllocated) * 100;
    return { total, onTrack, behind, pctComplete };
  }, []);

  // Sort & filter department expenditure
  const sortedDepts = useMemo(() => {
    let data = [...DEPT_EXPENDITURE];
    if (filterStatus === 'on-track') data = data.filter(d => d.pctSpent >= 90);
    else if (filterStatus === 'behind') data = data.filter(d => d.pctSpent >= 75 && d.pctSpent < 90);
    else if (filterStatus === 'critical') data = data.filter(d => d.pctSpent < 75);

    switch (sortField) {
      case 'department': data.sort((a, b) => a.department.localeCompare(b.department)); break;
      case 'spendRate': data.sort((a, b) => b.pctSpent - a.pctSpent); break;
      case 'appropriation': data.sort((a, b) => b.appropriation - a.appropriation); break;
      case 'variance': data.sort((a, b) => (b.appropriation - b.expenditure) - (a.appropriation - a.expenditure)); break;
    }
    return data;
  }, [sortField, filterStatus]);

  // Compute totals for summary row
  const deptTotals = useMemo(() => {
    const totalApprop = sortedDepts.reduce((s, d) => s + d.appropriation, 0);
    const totalExp = sortedDepts.reduce((s, d) => s + d.expenditure, 0);
    return { appropriation: totalApprop, expenditure: totalExp, pctSpent: (totalExp / totalApprop) * 100 };
  }, [sortedDepts]);

  // Filter commitments
  const filteredCommitments = useMemo(() => {
    if (filterStatus === 'all') return BUDGET_COMMITMENTS;
    if (filterStatus === 'on-track') return BUDGET_COMMITMENTS.filter(c => c.status === 'On Track');
    if (filterStatus === 'behind') return BUDGET_COMMITMENTS.filter(c => c.status === 'Behind');
    return BUDGET_COMMITMENTS;
  }, [filterStatus]);

  return (
    <div className="space-y-6 bg-grid-pattern min-h-full overflow-x-hidden">
      {/* ── Module Header ────────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          {/* Gradient accent bar */}
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400 shrink-0" />
          {/* Icon with glow pulse */}
          <div className="relative flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <Landmark className="size-5 text-emerald-400" />
            <div className="absolute inset-0 rounded-xl animate-pulse bg-emerald-400/5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              BudgetLens
            </h1>
            <p className="text-[11px] text-zinc-500">National Budget & MTEF Intelligence</p>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-2 ml-auto hidden sm:flex">
            <Badge className="badge-premium badge-mvp text-[9px] h-5 px-2 gap-1">
              <Landmark className="size-2.5" /> National Treasury
            </Badge>
            <Badge className="badge-premium bg-gradient-to-r from-emerald-400/15 to-teal-400/15 text-emerald-300 border-emerald-400/25 text-[9px] h-5 px-2 gap-1">
              <CalendarDays className="size-2.5" /> MTEF Cycle
            </Badge>
            <Badge className="badge-premium badge-phase3 text-[9px] h-5 px-2">Phase 3</Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Key Stats ──────────────────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Budget', value: 'R2.05T', color: '#10B981', icon: DollarSign, accent: 'from-emerald-500/20 to-teal-500/10' },
          { label: 'Budget Speech', value: 'Feb 2026', color: '#14B8A6', icon: FileText, accent: 'from-teal-500/20 to-cyan-500/10' },
          { label: 'MTEF Period', value: '2025–2028', color: '#F59E0B', icon: CalendarDays, accent: 'from-amber-500/20 to-yellow-500/10' },
          { label: 'Commitments On-Track', value: `${commitmentStats.onTrack}/${commitmentStats.total}`, color: '#10B981', icon: CheckCircle2, accent: 'from-emerald-500/20 to-green-500/10' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card-v2 card-hover-lift overflow-hidden border-white/[0.08]">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tabular-nums animate-kpi-count-up" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <div className={cn('flex size-8 items-center justify-center rounded-lg bg-gradient-to-br', stat.accent)}>
                    <stat.icon className="size-4" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Filter/Sort Controls ────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="glass-card-v2 p-3 sm:p-3 flex flex-wrap items-center gap-2 sm:gap-3 border-white/[0.08]">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="size-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Filters</span>
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
            <SelectTrigger className="w-[140px] h-8 text-[11px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="all" className="text-[11px] text-zinc-300">All Status</SelectItem>
              <SelectItem value="on-track" className="text-[11px] text-emerald-400">On Track</SelectItem>
              <SelectItem value="behind" className="text-[11px] text-amber-400">Behind</SelectItem>
              <SelectItem value="critical" className="text-[11px] text-red-400">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={(v) => setSortField(v as typeof sortField)}>
            <SelectTrigger className="w-[160px] h-8 text-[11px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <ArrowUpDown className="size-3 mr-1.5" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="spendRate" className="text-[11px] text-zinc-300">Spend Rate</SelectItem>
              <SelectItem value="department" className="text-[11px] text-zinc-300">Department</SelectItem>
              <SelectItem value="appropriation" className="text-[11px] text-zinc-300">Appropriation</SelectItem>
              <SelectItem value="variance" className="text-[11px] text-zinc-300">Variance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] h-8 text-[11px] bg-white/[0.03] border-white/[0.08] text-zinc-300">
              <CalendarDays className="size-3 mr-1.5" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              <SelectItem value="2023/24" className="text-[11px] text-zinc-300">2023/24</SelectItem>
              <SelectItem value="2024/25" className="text-[11px] text-zinc-300">2024/25</SelectItem>
              <SelectItem value="2025/26" className="text-[11px] text-zinc-300">2025/26</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/5">
              <Download className="size-3" /> Export Budget Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Budget Speech Tracker ─────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 border-white/[0.08] overflow-hidden">
          {/* Gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent opacity-80" />
          <CardHeader className="pb-2">
            <SectionHeader
              icon={FileText}
              title="Budget Speech Tracker"
              subtitle="Key commitments vs actual expenditure — 2025/26 fiscal year"
              accent="emerald"
            />
          </CardHeader>
          <CardContent className="pt-0">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {[
                { label: 'Total Commitments', value: commitmentStats.total, color: '#a1a1aa' },
                { label: 'On Track', value: commitmentStats.onTrack, color: '#10B981' },
                { label: 'Behind', value: commitmentStats.behind, color: '#F59E0B' },
                { label: '% Complete', value: `${commitmentStats.pctComplete.toFixed(0)}%`, color: '#14B8A6' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <ScrollArea className="max-h-[420px]">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredCommitments.map((item, i) => {
                    const pctSpent = (item.spent / item.allocated) * 100;
                    const status = item.status as CommitmentStatus;
                    const accent = getStatusAccent(status);
                    const StatusIcon = getStatusIcon(status);
                    return (
                      <motion.div
                        key={i}
                        variants={cardEntrance}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.15)' }}
                        className={cn(
                          'rounded-lg border border-white/[0.06] border-l-2 p-3.5 transition-all duration-300',
                          'bg-white/[0.03] backdrop-blur-xl',
                          accent.border,
                          'hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-zinc-200">{item.commitment}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-400 bg-white/[0.02]">{item.department}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={cn(
                              'text-[9px] h-5 px-1.5 gap-1 border',
                              status === 'On Track' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                              status === 'Behind' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                              'bg-red-500/15 text-red-400 border-red-500/25'
                            )}>
                              <StatusIcon className="size-2.5" /> {status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex-1">
                            <GradientProgress
                              value={pctSpent}
                              gradientFrom={status === 'On Track' ? '#10B981' : status === 'Behind' ? '#F59E0B' : '#EF4444'}
                              gradientTo={status === 'On Track' ? '#14B8A6' : status === 'Behind' ? '#FBBF24' : '#FB7185'}
                              glowColor={accent.glow}
                            />
                          </div>
                          <span className={cn('text-[11px] font-bold tabular-nums shrink-0', accent.text)}>
                            {pctSpent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-[10px]">
                          <span className="text-zinc-500">Allocated: <span className="text-zinc-400 font-medium">{formatCompactZAR(item.allocated)}</span></span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500">Spent: <span className="text-zinc-400 font-medium">{formatCompactZAR(item.spent)}</span></span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── MTEF Trend + Dept Expenditure ────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* MTEF Trend */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 border-white/[0.08] overflow-hidden">
            {/* Gradient accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 opacity-70" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={TrendingUp}
                title="MTEF Trend Analysis"
                subtitle="Allocation by vote (R Billions) — FY2020/21 to FY2026/27"
                accent="teal"
              />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px] sm:h-[260px] md:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MTEF_DATA} margin={{ top: 10, right: 20, left: -5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}B`} />
                    <Tooltip content={<MTEFCustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                      formatter={(value: string) => <span className="text-zinc-400">{value}</span>}
                    />
                    {/* Budget 2023 annotation line */}
                    <ReferenceLine x="FY2023/24" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{ value: 'Budget 2023', position: 'top', fill: '#52525b', fontSize: 9 }} />
                    <Line type="monotone" dataKey="education" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} name="Education" />
                    <Line type="monotone" dataKey="health" stroke="#14B8A6" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#14B8A6', strokeWidth: 0 }} name="Health" />
                    <Line type="monotone" dataKey="socialDev" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} name="Social Dev" />
                    <Line type="monotone" dataKey="coGTA" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} name="CoGTA" />
                    <Line type="monotone" dataKey="defence" stroke="#EF4444" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} name="Defence" strokeDasharray="5 3" />
                    <Line type="monotone" dataKey="police" stroke="#F97316" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#F97316', strokeWidth: 0 }} name="Police" strokeDasharray="5 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Chart legend enhancement with glow dots */}
              <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-white/[0.06]">
                {[
                  { name: 'Education', color: '#10B981' },
                  { name: 'Health', color: '#14B8A6' },
                  { name: 'Social Dev', color: '#F59E0B' },
                  { name: 'CoGTA', color: '#8B5CF6' },
                  { name: 'Defence', color: '#EF4444', dashed: true },
                  { name: 'Police', color: '#F97316', dashed: true },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}50` }} />
                    <span className="text-[10px] text-zinc-400">{item.name}</span>
                    {item.dashed && <span className="text-[8px] text-zinc-600">(proj.)</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Expenditure vs Appropriation */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 border-white/[0.08] overflow-hidden">
            {/* Gradient accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 opacity-70" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={BarChart3}
                title="Department Expenditure vs Appropriation"
                subtitle={`${selectedYear} fiscal year — sorted by ${sortField === 'spendRate' ? 'spend rate' : sortField === 'department' ? 'department' : sortField === 'appropriation' ? 'appropriation' : 'variance'}`}
                accent="emerald"
              />
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[400px]">
                <div className="overflow-x-auto -mx-1 px-1">
                <div className="space-y-1.5">
                  {/* Gradient header row */}
                  <div className="grid grid-cols-[1fr_100px_80px] items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-white/[0.04] to-transparent">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Department</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 text-right">Approp / Spent</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 text-right">Spend Rate</span>
                  </div>

                  {sortedDepts.map((dept, i) => {
                    const spendColor = getSpendColor(dept.pctSpent);
                    const DeptIcon = dept.icon;
                    return (
                      <motion.div
                        key={dept.department}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                        className={cn(
                          'grid grid-cols-[1fr_100px_80px] items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                          i % 2 === 0 ? 'bg-white/[0.01]' : 'bg-white/[0.02]',
                          'border border-transparent hover:border-white/[0.06]'
                        )}
                      >
                        {/* Department name with icon */}
                        <div className="flex items-center gap-2 min-w-0">
                          <DeptIcon className="size-3.5 text-zinc-500 shrink-0" />
                          <span className="text-xs font-medium text-zinc-300 truncate">{dept.department}</span>
                        </div>
                        {/* Appropriation vs Expenditure dual bar */}
                        <div className="space-y-0.5">
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-white/[0.15]" style={{ width: '100%' }} />
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${dept.pctSpent}%`,
                                background: `linear-gradient(90deg, ${spendColor.bar.includes('emerald') ? '#10B981' : spendColor.bar.includes('amber') ? '#F59E0B' : '#EF4444'}, ${spendColor.bar.includes('emerald') ? '#14B8A6' : spendColor.bar.includes('amber') ? '#FBBF24' : '#FB7185'})`,
                                boxShadow: `0 0 6px ${spendColor.glow}`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] text-zinc-600">
                            <span>{formatCompactZAR(dept.appropriation)}</span>
                            <span>{formatCompactZAR(dept.expenditure)}</span>
                          </div>
                        </div>
                        {/* Spend Rate */}
                        <div className="flex items-center justify-end gap-1.5">
                          <GradientProgress
                            value={dept.pctSpent}
                            gradientFrom={spendColor.bar.includes('emerald') ? '#10B981' : spendColor.bar.includes('amber') ? '#F59E0B' : '#EF4444'}
                            gradientTo={spendColor.bar.includes('emerald') ? '#14B8A6' : spendColor.bar.includes('amber') ? '#FBBF24' : '#FB7185'}
                            glowColor={spendColor.glow}
                            height="h-1.5"
                            className="w-12"
                          />
                          <span className={cn('text-[11px] font-bold tabular-nums', spendColor.text)}>
                            {dept.pctSpent.toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Summary totals row */}
                  <div className="grid grid-cols-[1fr_100px_80px] items-center gap-2 px-3 py-2.5 mt-2 rounded-lg bg-gradient-to-r from-emerald-400/[0.04] to-transparent border border-emerald-400/10">
                    <div className="flex items-center gap-2">
                      <Landmark className="size-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-400">Total</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 text-right">
                      {formatCompactZAR(deptTotals.appropriation)} / {formatCompactZAR(deptTotals.expenditure)}
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${deptTotals.pctSpent}%`, boxShadow: '0 0 6px rgba(16,185,129,0.25)' }} />
                      </div>
                      <span className="text-[11px] font-bold tabular-nums text-emerald-400">{deptTotals.pctSpent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center justify-between py-3 px-1 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Landmark className="size-3.5 text-emerald-400/60" />
            <span className="text-[10px] text-zinc-600">BudgetLens v1.0 — National Budget Intelligence</span>
          </div>
          <span className="text-[10px] text-zinc-700">Source: National Treasury, MFMA 2023/24</span>
        </div>
      </motion.div>
    </div>
  );
}
