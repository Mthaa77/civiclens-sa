'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
} from 'recharts';
import {
  Landmark,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactZAR, formatNumber } from '@/lib/formatters';
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

// ── Budget Commitments Data ─────────────────────────────────────────────────

const BUDGET_COMMITMENTS = [
  { commitment: 'Expand free education to ECD level', department: 'Basic Education', allocated: 42000000000, spent: 38500000000, status: 'On Track' },
  { commitment: 'National Health Insurance pilot', department: 'Health', allocated: 28000000000, spent: 15200000000, status: 'Behind' },
  { commitment: 'Employment stimulus — 500,000 jobs', department: 'Employment & Labour', allocated: 18000000000, spent: 12100000000, status: 'Behind' },
  { commitment: 'Municipal infrastructure upgrade', department: 'CoGTA', allocated: 65000000000, spent: 52500000000, status: 'On Track' },
  { commitment: 'Land reform and redistribution', department: 'Agriculture', allocated: 12000000000, spent: 6800000000, status: 'Behind' },
  { commitment: 'Energy transition — renewable procurement', department: 'Mineral Resources & Energy', allocated: 35000000000, spent: 28000000000, status: 'On Track' },
  { commitment: 'Social grant increase (above inflation)', department: 'Social Development', allocated: 258000000000, spent: 248000000000, status: 'On Track' },
  { commitment: 'Water and sanitation infrastructure', department: 'Water & Sanitation', allocated: 42000000000, spent: 22800000000, status: 'Behind' },
];

// ── MTEF Trend Data ────────────────────────────────────────────────────────

const MTEF_DATA = [
  { year: '2020/21', health: 58, education: 72, socialDev: 48, coGTA: 32, defence: 52, police: 42 },
  { year: '2021/22', health: 62, education: 78, socialDev: 52, coGTA: 35, defence: 55, police: 45 },
  { year: '2022/23', health: 68, education: 82, socialDev: 58, coGTA: 38, defence: 56, police: 48 },
  { year: '2023/24', health: 74, education: 88, socialDev: 65, coGTA: 42, defence: 58, police: 52 },
  { year: '2024/25', health: 78, education: 92, socialDev: 72, coGTA: 45, defence: 60, police: 55 },
  { year: '2025/26', health: 82, education: 98, socialDev: 78, coGTA: 48, defence: 62, police: 58 },
  { year: '2026/27', health: 86, education: 102, socialDev: 82, coGTA: 52, defence: 64, police: 60 },
];

// ── Department Expenditure Data ─────────────────────────────────────────────

const DEPT_EXPENDITURE = [
  { department: 'Social Development', appropriation: 258000000000, expenditure: 248000000000, pctSpent: 96.1 },
  { department: 'Basic Education', appropriation: 312000000000, expenditure: 285000000000, pctSpent: 91.3 },
  { department: 'Health', appropriation: 248000000000, expenditure: 218000000000, pctSpent: 87.9 },
  { department: 'Police', appropriation: 105000000000, expenditure: 92000000000, pctSpent: 87.6 },
  { department: 'Defence', appropriation: 58000000000, expenditure: 48500000000, pctSpent: 83.6 },
  { department: 'Higher Education', appropriation: 128000000000, expenditure: 105000000000, pctSpent: 82.0 },
  { department: 'CoGTA', appropriation: 92000000000, expenditure: 72000000000, pctSpent: 78.3 },
  { department: 'Water & Sanitation', appropriation: 68000000000, expenditure: 48000000000, pctSpent: 70.6 },
  { department: 'Agriculture', appropriation: 28000000000, expenditure: 18500000000, pctSpent: 66.1 },
  { department: 'Energy', appropriation: 85000000000, expenditure: 52500000000, pctSpent: 61.8 },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function BudgetLens() {
  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#9333EA]/10 border border-[#9333EA]/20">
            <Landmark className="size-5 text-[#9333EA]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">BudgetLens</h1>
            <p className="text-xs text-zinc-500">National Budget and MTEF intelligence</p>
          </div>
          <Badge className="ml-2 bg-[#9333EA]/15 text-[#9333EA] border-[#9333EA]/25 text-[10px] h-5 px-1.5">Phase 3</Badge>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Budget', value: 'R2.05T', color: '#9333EA' },
          { label: 'Budget Speech', value: 'Feb 2026', color: '#3B82F6' },
          { label: 'MTEF Period', value: '2025–2028', color: '#F59E0B' },
          { label: 'Commitments On-Track', value: '4/8', color: '#10B981' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Budget Speech Tracker ────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#9333EA]" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Budget Speech Tracker</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Key commitments vs actual expenditure — 2025/26 fiscal year</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2.5">
                {BUDGET_COMMITMENTS.map((item, i) => {
                  const pctSpent = (item.spent / item.allocated) * 100;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300">{item.commitment}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{item.department}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'On Track' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] h-5 px-1.5">
                              <CheckCircle2 className="size-2.5 mr-1" /> On Track
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[9px] h-5 px-1.5">
                              <XCircle className="size-2.5 mr-1" /> Behind
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className={cn('h-full rounded-full', pctSpent >= 85 ? 'bg-emerald-400' : pctSpent >= 70 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${pctSpent}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: pctSpent >= 85 ? '#10B981' : pctSpent >= 70 ? '#F59E0B' : '#EF4444' }}>
                          {pctSpent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px]">
                        <span className="text-zinc-600">Allocated: {formatCompactZAR(item.allocated)}</span>
                        <span className="text-zinc-600">Spent: {formatCompactZAR(item.spent)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── MTEF Trend + Dept Expenditure ────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MTEF Trend */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">MTEF Trend Analysis</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Allocation by vote (R Billions)</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MTEF_DATA} margin={{ top: 5, right: 20, left: -5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}B`} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => `R${v}B`} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="education" stroke="#3B82F6" strokeWidth={2} dot={false} name="Education" />
                    <Line type="monotone" dataKey="health" stroke="#10B981" strokeWidth={2} dot={false} name="Health" />
                    <Line type="monotone" dataKey="socialDev" stroke="#F59E0B" strokeWidth={2} dot={false} name="Social Dev" />
                    <Line type="monotone" dataKey="coGTA" stroke="#9333EA" strokeWidth={2} dot={false} name="CoGTA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Expenditure vs Appropriation */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Department Expenditure vs Appropriation</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">2025/26 fiscal year — sorted by spend rate</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-2.5">
                  {DEPT_EXPENDITURE.sort((a, b) => b.pctSpent - a.pctSpent).map((dept, i) => (
                    <div key={dept.department} className="rounded-lg border border-white/[0.06] p-2.5 hover:border-white/[0.12] transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium text-zinc-300 truncate flex-1">{dept.department}</p>
                        <span className={cn('text-xs font-bold tabular-nums shrink-0', dept.pctSpent >= 90 ? 'text-emerald-400' : dept.pctSpent >= 75 ? 'text-amber-400' : 'text-red-400')}>
                          {dept.pctSpent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className={cn('h-full rounded-full', dept.pctSpent >= 90 ? 'bg-emerald-400' : dept.pctSpent >= 75 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${dept.pctSpent}%` }} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="text-zinc-600">Approp: {formatCompactZAR(dept.appropriation)}</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-600">Spent: {formatCompactZAR(dept.expenditure)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
