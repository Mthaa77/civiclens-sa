'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Droplets,
  Zap,
  Trash2,
  ShowerHead,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  School,
  DollarSign,
  Droplet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVICE_DELIVERY_BY_PROVINCE, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatPercent, formatCompactZAR, formatNumber } from '@/lib/formatters';
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
import { Progress } from '@/components/ui/progress';

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

// ── Drop Score Data ─────────────────────────────────────────────────────────

const BLUE_DROP_DATA = [
  { year: '2012', score: 78 }, { year: '2014', score: 74 }, { year: '2016', score: 68 },
  { year: '2018', score: 62 }, { year: '2020', score: 55 }, { year: '2022', score: 48 }, { year: '2024', score: 44 },
];

const GREEN_DROP_DATA = [
  { year: '2013', score: 65 }, { year: '2015', score: 60 }, { year: '2017', score: 55 },
  { year: '2019', score: 48 }, { year: '2021', score: 42 }, { year: '2023', score: 38 },
];

// ── Backlog Data ────────────────────────────────────────────────────────────

const SERVICE_BACKLOG = [
  { service: 'Water Infrastructure', households: 3450000, estimatedCost: 128000000000, pctAddressed: 22 },
  { service: 'Sanitation', households: 4280000, estimatedCost: 95000000000, pctAddressed: 18 },
  { service: 'Electricity Connections', households: 1850000, estimatedCost: 42000000000, pctAddressed: 35 },
  { service: 'Refuse Removal', households: 5200000, estimatedCost: 18000000000, pctAddressed: 28 },
];

// ── School Infrastructure ───────────────────────────────────────────────────

const SCHOOL_INFRA = [
  { category: 'Pit Latrines Only', count: 3898, pctTotal: 15.2, province: 'Limpopo (42%)', riskLevel: 'Critical' },
  { category: 'No Electricity', count: 1650, pctTotal: 6.4, province: 'Eastern Cape (38%)', riskLevel: 'High' },
  { category: 'No Water Supply', count: 1120, pctTotal: 4.4, province: 'KZN (28%)', riskLevel: 'High' },
  { category: 'Overcrowded (>50:1)', count: 5820, pctTotal: 22.7, province: 'Gauteng (35%)', riskLevel: 'Medium' },
  { category: 'Unsafe Structures', count: 2450, pctTotal: 9.6, province: 'Eastern Cape (31%)', riskLevel: 'Critical' },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function ServiceLens() {
  const nationalAvg = {
    water: 81.2, sanitation: 72.5, electricity: 86.8, refuse: 65.8,
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#0891B2]/10 border border-[#0891B2]/20">
            <Droplets className="size-5 text-[#0891B2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">ServiceLens</h1>
            <p className="text-xs text-zinc-500">Service delivery pressure scoring</p>
          </div>
          <Badge className="ml-2 bg-[#0891B2]/15 text-[#0891B2] border-[#0891B2]/25 text-[10px] h-5 px-1.5">Phase 2</Badge>
        </div>
      </motion.div>

      {/* ── National Overview ────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Water Access', value: nationalAvg.water, icon: Droplets, color: '#3B82F6', trend: '+1.2%', unit: '%' },
          { label: 'Sanitation Access', value: nationalAvg.sanitation, icon: ShowerHead, color: '#10B981', trend: '-0.5%', unit: '%' },
          { label: 'Electricity Access', value: nationalAvg.electricity, icon: Zap, color: '#F59E0B', trend: '+2.1%', unit: '%' },
          { label: 'Refuse Removal', value: nationalAvg.refuse, icon: Trash2, color: '#64748B', trend: '+0.8%', unit: '%' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}<span className="text-lg">{stat.unit}</span></p>
                <div className="flex items-center gap-1.5 mt-2">
                  {stat.trend.startsWith('+') ? <TrendingUp className="size-3 text-emerald-400" /> : <TrendingDown className="size-3 text-red-400" />}
                  <span className={cn('text-[11px] font-medium tabular-nums', stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400')}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-zinc-600">vs prev year</span>
                </div>
                <Progress value={stat.value} className="h-1.5 mt-2 bg-white/[0.04]" style={{ accentColor: stat.color }} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Blue Drop / Green Drop ───────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <Droplet className="size-3.5 text-[#3B82F6]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Blue Drop Score</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">National drinking water quality compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#3B82F6]">44</p>
                  <p className="text-[10px] text-zinc-600">2024 Score</p>
                </div>
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px]">
                  <TrendingDown className="size-3 mr-1" /> Declining
                </Badge>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={BLUE_DROP_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#10B981]/10 border border-[#10B981]/20">
                  <Droplet className="size-3.5 text-[#10B981]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Green Drop Score</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">National wastewater treatment compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#10B981]">38</p>
                  <p className="text-[10px] text-zinc-600">2023 Score</p>
                </div>
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px]">
                  <TrendingDown className="size-3 mr-1" /> Declining
                </Badge>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={GREEN_DROP_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} />
                    <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Service Delivery by Province ─────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Service Delivery by Province</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">Household access to basic services (%)</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SERVICE_DELIVERY_BY_PROVINCE} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="province" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="water" fill="#3B82F6" radius={[2,2,0,0]} barSize={12} name="Water" />
                  <Bar dataKey="sanitation" fill="#10B981" radius={[2,2,0,0]} barSize={12} name="Sanitation" />
                  <Bar dataKey="electricity" fill="#F59E0B" radius={[2,2,0,0]} barSize={12} name="Electricity" />
                  <Bar dataKey="refuse" fill="#64748B" radius={[2,2,0,0]} barSize={12} name="Refuse" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Backlog Quantification ───────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Backlog Quantification</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Estimated rand value of service delivery gaps</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {SERVICE_BACKLOG.map((item) => (
                <div key={item.service} className="rounded-lg border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-300">{item.service}</p>
                    <span className="text-xs font-bold text-[#0891B2] tabular-nums">{formatCompactZAR(item.estimatedCost)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-zinc-500">{formatNumber(item.households)} households</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-zinc-500">{item.pctAddressed}% addressed</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-[#0891B2]" style={{ width: `${item.pctAddressed}%` }} />
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-[#0891B2]/20 bg-[#0891B2]/5 p-3 text-center">
                <p className="text-[11px] text-zinc-500">Total Estimated Backlog</p>
                <p className="text-2xl font-bold text-[#0891B2] tabular-nums">{formatCompactZAR(SERVICE_BACKLOG.reduce((sum, b) => sum + b.estimatedCost, 0))}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* School Infrastructure Gap */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <School className="size-4 text-[#F59E0B]" />
                <CardTitle className="text-sm font-semibold text-zinc-200">School Infrastructure Gap</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Norms and Standards compliance analysis</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-[10px]">Category</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Schools</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">% Total</TableHead>
                    <TableHead className="text-zinc-500 text-[10px]">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHOOL_INFRA.map((row) => (
                    <TableRow key={row.category} className="border-white/[0.04] hover:bg-white/[0.03]">
                      <TableCell>
                        <p className="text-xs text-zinc-300">{row.category}</p>
                        <p className="text-[10px] text-zinc-600">Worst: {row.province}</p>
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: row.pctTotal > 15 ? '#EF4444' : '#F59E0B' }}>
                        {formatPercent(row.pctTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          'text-[9px] h-5 px-1.5',
                          row.riskLevel === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        )}>{row.riskLevel}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
