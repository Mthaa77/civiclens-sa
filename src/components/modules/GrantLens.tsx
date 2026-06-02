'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandCoins,
  AlertTriangle,
  TrendingDown,
  Search,
  ArrowRight,
  CheckCircle2,
  Landmark,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Zap,
  ExternalLink,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactZAR, formatPercent, formatNumber, formatSADate } from '@/lib/formatters';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

// ── DORA Grant Data ─────────────────────────────────────────────────────────

const DORA_GRANTS = [
  { grant: 'Municipal Infrastructure Grant (MIG)', municipality: 'Buffalo City', province: 'Eastern Cape', allocation: 580000000, q1Spend: 22, q2Spend: 38, q3Spend: 52, projectedYearEnd: 68 },
  { grant: 'Water Services Operating Subsidy', municipality: 'Mangaung', province: 'Free State', allocation: 320000000, q1Spend: 15, q2Spend: 28, q3Spend: 35, projectedYearEnd: 48 },
  { grant: 'Public Transport Infrastructure Grant', municipality: 'City of Johannesburg', province: 'Gauteng', allocation: 890000000, q1Spend: 28, q2Spend: 45, q3Spend: 62, projectedYearEnd: 78 },
  { grant: 'Urban Settlements Development Grant', municipality: 'eThekwini', province: 'KwaZulu-Natal', allocation: 1200000000, q1Spend: 20, q2Spend: 35, q3Spend: 48, projectedYearEnd: 62 },
  { grant: 'Municipal Infrastructure Grant (MIG)', municipality: 'Msunduzi', province: 'KwaZulu-Natal', allocation: 410000000, q1Spend: 12, q2Spend: 25, q3Spend: 40, projectedYearEnd: 55 },
  { grant: 'Neighbourhood Development Partnership Grant', municipality: 'City of Cape Town', province: 'Western Cape', allocation: 250000000, q1Spend: 35, q2Spend: 55, q3Spend: 72, projectedYearEnd: 88 },
  { grant: 'Integrated National Electrification Programme', municipality: 'Ekurhuleni', province: 'Gauteng', allocation: 680000000, q1Spend: 18, q2Spend: 32, q3Spend: 45, projectedYearEnd: 58 },
  { grant: 'Municipal Infrastructure Grant (MIG)', municipality: 'Nelson Mandela Bay', province: 'Eastern Cape', allocation: 350000000, q1Spend: 25, q2Spend: 42, q3Spend: 55, projectedYearEnd: 70 },
  { grant: 'Rural Roads Asset Management Grant', municipality: 'Rustenburg', province: 'North West', allocation: 180000000, q1Spend: 30, q2Spend: 48, q3Spend: 65, projectedYearEnd: 82 },
  { grant: 'Water Services Infrastructure Grant', municipality: 'Sol Plaatje', province: 'Northern Cape', allocation: 220000000, q1Spend: 32, q2Spend: 50, q3Spend: 68, projectedYearEnd: 85 },
];

// ── Grant Opportunities for NGOs ────────────────────────────────────────────

const NGO_OPPORTUNITIES = [
  { grant: 'EPWP Integrated Grant for Municipalities', serviceArea: 'Community Works Programme', minAmount: 5000000, maxAmount: 50000000, deadline: '2026-06-30', eligible: 'NPCs and NPOs', matchScore: 92 },
  { grant: 'Social Housing Regulatory Authority Grant', serviceArea: 'Housing', minAmount: 10000000, maxAmount: 200000000, deadline: '2026-05-15', eligible: 'SHIs and NGOs', matchScore: 78 },
  { grant: 'National Lotteries Commission Grant', serviceArea: 'Social Development', minAmount: 500000, maxAmount: 10000000, deadline: 'Rolling', eligible: 'NPOs and NPCs', matchScore: 85 },
  { grant: 'DTI Manufacturing Development Programme', serviceArea: 'Economic Development', minAmount: 2000000, maxAmount: 50000000, deadline: '2026-09-30', eligible: 'SMMEs and Co-ops', matchScore: 64 },
  { grant: 'Green Fund — DBSA', serviceArea: 'Environment & Climate', minAmount: 5000000, maxAmount: 100000000, deadline: '2026-08-31', eligible: 'All entities', matchScore: 71 },
];

// ── Grant Performance Dashboard Data ────────────────────────────────────────

const GRANT_ALLOCATED_VS_SPENT = [
  { name: 'MIG', allocated: 1340000000, spent: 720000000, color: '#F59E0B' },
  { name: 'Water Services', allocated: 540000000, spent: 295000000, color: '#3B82F6' },
  { name: 'Public Transport', allocated: 890000000, spent: 552000000, color: '#10B981' },
  { name: 'Urban Settlements', allocated: 1200000000, spent: 576000000, color: '#8B5CF6' },
  { name: 'Electrification', allocated: 680000000, spent: 306000000, color: '#F97316' },
  { name: 'Neighbourhood Dev', allocated: 250000000, spent: 180000000, color: '#EC4899' },
  { name: 'Rural Roads', allocated: 180000000, spent: 117000000, color: '#14B8A6' },
];

const PROVINCIAL_GRANT_PERFORMANCE = [
  { province: 'Eastern Cape', spendRate: 53, allocation: 930 },
  { province: 'Free State', spendRate: 35, allocation: 320 },
  { province: 'Gauteng', spendRate: 57, allocation: 1570 },
  { province: 'KwaZulu-Natal', spendRate: 44, allocation: 1610 },
  { province: 'North West', spendRate: 65, allocation: 180 },
  { province: 'Northern Cape', spendRate: 68, allocation: 220 },
  { province: 'Western Cape', spendRate: 72, allocation: 250 },
];

// ── Animated Count-Up Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200, prefix: string = '', suffix: string = '') {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      if (target >= 1000000000) {
        setDisplay(`${prefix}${(current / 1000000000).toFixed(1)}B${suffix}`);
      } else if (target >= 1000000) {
        setDisplay(`${prefix}${(current / 1000000).toFixed(0)}M${suffix}`);
      } else {
        setDisplay(`${prefix}${current}${suffix}`);
      }
      if (progress < 1) {
        ref.current = setTimeout(step, 16);
      }
    };
    step();
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [target, duration, prefix, suffix]);

  return display;
}

// ── Spend Rate Bar Component ────────────────────────────────────────────────

function SpendRateBar({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const color = value >= 90 ? 'from-emerald-400 to-emerald-500' : value >= 75 ? 'from-amber-400 to-amber-500' : value >= 50 ? 'from-orange-400 to-orange-500' : 'from-red-400 to-red-500';
  const h = size === 'md' ? 'h-2.5' : 'h-1.5';
  return (
    <div className={cn('rounded-full bg-white/[0.06] overflow-hidden', h)}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
      />
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1224]/95 border border-white/[0.1] rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <p className="text-zinc-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-zinc-300 flex items-center gap-1.5">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-zinc-100">{typeof p.value === 'number' && p.value > 1000 ? formatCompactZAR(p.value) : `${p.value}%`}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function GrantLens() {
  const underspending = DORA_GRANTS.filter((g) => g.q3Spend < 75).sort((a, b) => a.q3Spend - b.q3Spend);
  const totalAllocated = DORA_GRANTS.reduce((sum, g) => sum + g.allocation, 0);
  const avgSpendRate = Math.round(DORA_GRANTS.reduce((sum, g) => sum + g.q3Spend, 0) / DORA_GRANTS.length);
  const onTrackCount = DORA_GRANTS.length - underspending.length;
  const totalUnspent = DORA_GRANTS.reduce((sum, g) => sum + g.allocation * (1 - g.q3Spend / 100), 0);

  const animatedTotal = useCountUp(totalAllocated, 1500, 'R', '');
  const animatedAvg = useCountUp(avgSpendRate, 1200, '', '%');
  const animatedUnder = useCountUp(underspending.length, 800);
  const animatedOnTrack = useCountUp(onTrackCount, 800);

  // Donut chart data
  const totalSpentAmount = DORA_GRANTS.reduce((sum, g) => sum + g.allocation * (g.q3Spend / 100), 0);
  const donutData = [
    { name: 'Spent', value: Math.round(totalSpentAmount), color: '#F59E0B' },
    { name: 'Unspent', value: Math.round(totalAllocated - totalSpentAmount), color: '#374151' },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-amber-400 to-orange-400 shrink-0" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 relative">
            <Landmark className="size-5 text-amber-400" />
            <motion.div
              className="absolute inset-0 rounded-xl bg-amber-400/10"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              GrantLens
            </h1>
            <p className="text-xs text-zinc-500">Conditional grant disbursement tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px] h-5 px-2">
              <HandCoins className="size-3 mr-1" /> Conditional Grants
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] h-5 px-1.5">Phase 3</Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total DORA Grants', value: animatedTotal, rawValue: totalAllocated, color: '#F59E0B', icon: Landmark },
          { label: 'Avg Q3 Spend', value: animatedAvg, rawValue: avgSpendRate, color: '#F97316', icon: Target },
          { label: 'Underspending Muni.', value: animatedUnder, rawValue: underspending.length, color: '#EF4444', icon: TrendingDown },
          { label: 'On-Track Muni.', value: animatedOnTrack, rawValue: onTrackCount, color: '#10B981', icon: TrendingUp },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative group">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}66, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
                  <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                    <stat.icon className="size-3.5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `0 0 30px ${stat.color}15` }} />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Grant Performance Dashboard (NEW) ───────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-500/30 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Grant Performance Dashboard</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">National grant allocation, spend analysis, and provincial performance</p>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 sm:p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Avg Spend Rate</p>
                <p className="text-lg font-extrabold text-amber-400 tabular-nums">{avgSpendRate}%</p>
                <SpendRateBar value={avgSpendRate} size="md" />
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 sm:p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">On-Time Delivery</p>
                <p className="text-lg font-extrabold text-emerald-400 tabular-nums">{Math.round(onTrackCount / DORA_GRANTS.length * 100)}%</p>
                <div className="mt-1 flex items-center gap-1">
                  {DORA_GRANTS.map((g, i) => (
                    <div key={i} className={cn('size-1.5 rounded-full', g.q3Spend >= 75 ? 'bg-emerald-400' : g.q3Spend >= 50 ? 'bg-amber-400' : 'bg-red-400')} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 sm:p-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Unspent</p>
                <p className="text-lg font-extrabold text-red-400 tabular-nums">{formatCompactZAR(totalUnspent)}</p>
                <p className="text-[9px] text-zinc-600 mt-1">{formatPercent((totalUnspent / totalAllocated) * 100)} of allocation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Donut Chart - Allocated vs Spent */}
              <div>
                <p className="text-[11px] font-medium text-zinc-400 mb-3 flex items-center gap-1.5">
                  <PieChartIcon className="size-3 text-amber-400" /> Total Grants Allocated vs Spent
                </p>
                <div className="h-[160px] sm:h-[200px] md:h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-zinc-200 tabular-nums">{formatCompactZAR(totalAllocated)}</p>
                      <p className="text-[9px] text-zinc-500">Total Allocated</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[10px] text-zinc-400">{d.name}: {formatCompactZAR(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart - Provincial Performance */}
              <div>
                <p className="text-[11px] font-medium text-zinc-400 mb-3 flex items-center gap-1.5">
                  <BarChart3 className="size-3 text-amber-400" /> Provincial Grant Performance
                </p>
                <div className="h-[160px] sm:h-[200px] md:h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PROVINCIAL_GRANT_PERFORMANCE} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="province" tick={{ fontSize: 9, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={85} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="spendRate" name="Spend Rate" radius={[0, 4, 4, 0]} maxBarSize={16}>
                        {PROVINCIAL_GRANT_PERFORMANCE.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.spendRate >= 75 ? '#10B981' : entry.spendRate >= 50 ? '#F59E0B' : '#EF4444'}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Grant Type Breakdown */}
            <div className="mt-5">
              <p className="text-[11px] font-medium text-zinc-400 mb-3 flex items-center gap-1.5">
                <Zap className="size-3 text-amber-400" /> Grant Type Breakdown
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {GRANT_ALLOCATED_VS_SPENT.map((g) => {
                  const spendPct = Math.round((g.spent / g.allocated) * 100);
                  return (
                    <motion.div
                      key={g.name}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 sm:p-2.5 hover:border-white/[0.12] transition-all duration-200"
                      whileHover={{ scale: 1.03, y: -2 }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="size-2 rounded-full shrink-0" style={{ background: g.color }} />
                        <p className="text-[10px] text-zinc-300 font-medium truncate">{g.name}</p>
                      </div>
                      <p className="text-xs font-bold text-zinc-200 tabular-nums">{formatCompactZAR(g.allocated)}</p>
                      <div className="mt-1.5">
                        <SpendRateBar value={spendPct} size="sm" />
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-1">{spendPct}% spent</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── DORA Grant Tracker ───────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-500/30 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold text-zinc-200">DORA Grant Tracker</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Major infrastructure grants by municipality — cumulative spend %</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[400px]">
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent bg-gradient-to-r from-amber-500/[0.06] via-transparent to-transparent">
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Grant</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Municipality</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Allocation</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Q1</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Q2</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Q3 Spend</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Projected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DORA_GRANTS.map((grant, i) => (
                    <TableRow key={i} className={cn('border-white/[0.04] hover:bg-white/[0.04] transition-colors', i % 2 === 1 && 'bg-white/[0.01]')}>
                      <TableCell className="text-xs text-zinc-300 max-w-[180px] truncate font-medium">{grant.grant}</TableCell>
                      <TableCell className="text-xs text-zinc-400">{grant.municipality}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-zinc-300 tabular-nums">{formatCompactZAR(grant.allocation)}</TableCell>
                      <TableCell className="text-right text-xs text-zinc-500 tabular-nums">{grant.q1Spend}%</TableCell>
                      <TableCell className="text-right text-xs text-zinc-500 tabular-nums">{grant.q2Spend}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SpendRateBar value={grant.q3Spend} size="sm" />
                          <span className={cn('text-xs font-bold tabular-nums min-w-[32px] text-right', grant.q3Spend >= 75 ? 'text-emerald-400' : grant.q3Spend >= 50 ? 'text-amber-400' : 'text-red-400')}>
                            {grant.q3Spend}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn('text-xs font-semibold tabular-nums', grant.projectedYearEnd >= 90 ? 'text-emerald-400' : grant.projectedYearEnd >= 75 ? 'text-amber-400' : 'text-red-400')}>
                          {grant.projectedYearEnd}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Underspending Alert + Grant Opportunities ────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Underspending */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/40 via-amber-500/20 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-400" />
                <CardTitle className="text-sm font-semibold text-zinc-200">Underspending Alert</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Municipalities spending &lt;75% by Q3</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[380px]">
              <div className="space-y-3">
              {underspending.map((grant, i) => {
                    const isSevere = grant.q3Spend < 50;
                    const accentColor = isSevere ? 'red' : 'amber';
                    return (
                      <motion.div
                        key={i}
                        className={cn(
                          'rounded-lg border bg-white/[0.03] p-3 sm:p-3.5 transition-all duration-200 overflow-hidden relative',
                          isSevere ? 'border-red-500/15' : 'border-amber-500/15'
                        )}
                        style={{ borderLeftWidth: '3px', borderLeftColor: isSevere ? '#EF4444' : '#F59E0B' }}
                        whileHover={{ scale: 1.01, y: -2 }}
                      >
                        <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: `0 0 20px ${isSevere ? '#EF4444' : '#F59E0B'}10` }} />
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">{grant.municipality}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{grant.grant.split('(')[0].trim()}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn('text-lg font-extrabold tabular-nums', isSevere ? 'text-red-400' : 'text-amber-400')}>
                              {grant.q3Spend}%
                            </p>
                          </div>
                        </div>
                        <SpendRateBar value={grant.q3Spend} size="md" />
                        <div className="flex items-center justify-between mt-2 text-[10px]">
                          <span className="text-zinc-500">Allocation: <span className="text-zinc-400 font-medium">{formatCompactZAR(grant.allocation)}</span></span>
                          <span className={cn('font-semibold', isSevere ? 'text-red-400' : 'text-amber-400')}>
                            Unspent: {formatCompactZAR(grant.allocation * (1 - grant.q3Spend / 100))}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grant Opportunities */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/40 via-orange-500/20 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-amber-400" />
                <CardTitle className="text-sm font-semibold text-zinc-200">Grant Opportunity Matching</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Available grants for NGOs by service area</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[380px]">
                <div className="space-y-3">
                  {NGO_OPPORTUNITIES.map((opp, i) => (
                    <motion.div
                      key={i}
                      className="rounded-lg border border-amber-500/10 bg-white/[0.03] p-3 sm:p-3.5 hover:border-amber-500/25 transition-all duration-200 overflow-hidden relative group"
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: '0 0 20px #F59E0B10' }} />
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200">{opp.grant}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[9px] h-4 px-1.5">{opp.serviceArea}</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{opp.eligible}</Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-[10px] text-zinc-500 font-medium">Match</p>
                          <p className={cn('text-sm font-extrabold tabular-nums', opp.matchScore >= 80 ? 'text-emerald-400' : opp.matchScore >= 70 ? 'text-amber-400' : 'text-zinc-400')}>
                            {opp.matchScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-zinc-400 font-medium">{formatCompactZAR(opp.minAmount)} – {formatCompactZAR(opp.maxAmount)}</span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Calendar className="size-2.5" /> {opp.deadline}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <Button
                          size="sm"
                          className="h-6 text-[9px] px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 font-medium shadow-sm shadow-amber-500/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-2.5 mr-1" /> Apply Now
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="pt-2">
        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600">
          <Landmark className="size-3" />
          <span>GrantLens — Powered by CivicLens SA Intelligence Platform</span>
        </div>
      </motion.div>
    </div>
  );
}
