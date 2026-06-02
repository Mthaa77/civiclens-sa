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
  Droplet,
  MapPin,
  ArrowDownRight,
  Flame,
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

// ── Accent Colors: sky (#0EA5E9) → blue (#3B82F6) ──────────────────────────
const ACCENT_FROM = '#0EA5E9';
const ACCENT_TO = '#3B82F6';

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
  { service: 'Water Infrastructure', households: 3450000, estimatedCost: 128000000000, pctAddressed: 22, target: 50 },
  { service: 'Sanitation', households: 4280000, estimatedCost: 95000000000, pctAddressed: 18, target: 45 },
  { service: 'Electricity Connections', households: 1850000, estimatedCost: 42000000000, pctAddressed: 35, target: 60 },
  { service: 'Refuse Removal', households: 5200000, estimatedCost: 18000000000, pctAddressed: 28, target: 55 },
];

// ── School Infrastructure ───────────────────────────────────────────────────

const SCHOOL_INFRA = [
  { category: 'Pit Latrines Only', count: 3898, pctTotal: 15.2, province: 'Limpopo (42%)', riskLevel: 'Critical' },
  { category: 'No Electricity', count: 1650, pctTotal: 6.4, province: 'Eastern Cape (38%)', riskLevel: 'High' },
  { category: 'No Water Supply', count: 1120, pctTotal: 4.4, province: 'KZN (28%)', riskLevel: 'High' },
  { category: 'Overcrowded (>50:1)', count: 5820, pctTotal: 22.7, province: 'Gauteng (35%)', riskLevel: 'Medium' },
  { category: 'Unsafe Structures', count: 2450, pctTotal: 9.6, province: 'Eastern Cape (31%)', riskLevel: 'Critical' },
];

// ── Service Delivery Hotspots ───────────────────────────────────────────────

const HOTSPOTS = [
  { municipality: 'Mangaung', province: 'Free State', waterAccess: 58.2, sanitation: 42.5, electricity: 72.1, refuse: 38.4, sdsScore: 22 },
  { municipality: 'Buffalo City', province: 'Eastern Cape', waterAccess: 62.8, sanitation: 48.1, electricity: 75.3, refuse: 42.6, sdsScore: 28 },
  { municipality: 'Msunduzi', province: 'KwaZulu-Natal', waterAccess: 68.4, sanitation: 52.3, electricity: 78.9, refuse: 45.2, sdsScore: 31 },
  { municipality: 'Ekurhuleni', province: 'Gauteng', waterAccess: 71.2, sanitation: 55.8, electricity: 82.4, refuse: 48.9, sdsScore: 34 },
  { municipality: 'eThekwini', province: 'KwaZulu-Natal', waterAccess: 72.5, sanitation: 58.2, electricity: 80.1, refuse: 51.3, sdsScore: 35 },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function ServiceLens() {
  const nationalAvg = {
    water: 81.2, sanitation: 72.5, electricity: 86.8, refuse: 65.8,
  };

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* ── Enhanced Module Header ─────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          {/* Gradient accent bar */}
          <div className="w-1 h-10 rounded-full shrink-0" style={{ background: `linear-gradient(180deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          {/* Icon with animated glow pulse */}
          <div className="relative">
            <motion.div
              className="flex size-10 items-center justify-center rounded-xl border"
              style={{ background: `linear-gradient(135deg, ${ACCENT_FROM}15, ${ACCENT_TO}15)`, borderColor: `${ACCENT_FROM}30` }}
            >
              <Droplets className="size-5" style={{ color: ACCENT_FROM }} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: `1px solid ${ACCENT_FROM}` }}
              animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ServiceLens
            </h1>
            <p className="text-xs text-zinc-400">Service delivery pressure scoring</p>
          </div>
          <Badge className="badge-premium badge-phase2 ml-2">Phase 2</Badge>
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
            <Droplet className="size-3 mr-1" />Service Intelligence
          </Badge>
        </div>
      </motion.div>

      {/* ── National Overview — with animated count-up, trend arrows, national comparison ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Water Access', value: nationalAvg.water, icon: Droplets, color: '#3B82F6', trend: '+1.2%', unit: '%' },
          { label: 'Sanitation Access', value: nationalAvg.sanitation, icon: ShowerHead, color: '#10B981', trend: '-0.5%', unit: '%' },
          { label: 'Electricity Access', value: nationalAvg.electricity, icon: Zap, color: '#F59E0B', trend: '+2.1%', unit: '%' },
          { label: 'Refuse Removal', value: nationalAvg.refuse, icon: Trash2, color: '#64748B', trend: '+0.8%', unit: '%' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: 0.8 }} />
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{stat.label}</p>
                  <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                    <stat.icon className="size-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <motion.p
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: stat.color }}
                  initial={{ scale: 0.92, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {stat.value}<span className="text-lg">{stat.unit}</span>
                </motion.p>
                <div className="flex items-center gap-1.5 mt-2">
                  {stat.trend.startsWith('+') ? <TrendingUp className="size-3 text-emerald-400" /> : <TrendingDown className="size-3 text-red-400" />}
                  <span className={cn('text-[11px] font-medium tabular-nums', stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400')}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-zinc-400">vs prev year</span>
                </div>
                <div className="progress-premium h-2 mt-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="progress-bar h-full rounded-full"
                    style={{ '--progress-from': stat.color, '--progress-to': `${stat.color}88` } as React.CSSProperties}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Blue Drop / Green Drop — with gradient fills & milestone markers ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #3B82F6, #0EA5E9)' }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md border" style={{ background: '#3B82F610', borderColor: '#3B82F620' }}>
                  <Droplet className="size-3.5 text-[#3B82F6]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Blue Drop Score</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">National drinking water quality compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#3B82F6]">44</p>
                  <p className="text-[10px] text-zinc-400">2024 Score</p>
                </div>
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px]">
                  <TrendingDown className="size-3 mr-1" /> Declining
                </Badge>
              </div>
              <div className="h-[140px] sm:h-[160px] md:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={BLUE_DROP_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="blueDropFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #10B981, #059669)' }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md border" style={{ background: '#10B98110', borderColor: '#10B98120' }}>
                  <Droplet className="size-3.5 text-[#10B981]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Green Drop Score</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">National wastewater treatment compliance</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#10B981]">38</p>
                  <p className="text-[10px] text-zinc-400">2023 Score</p>
                </div>
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px]">
                  <TrendingDown className="size-3 mr-1" /> Declining
                </Badge>
              </div>
              <div className="h-[140px] sm:h-[160px] md:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={GREEN_DROP_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="greenDropFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Service Delivery by Province ─────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Service Delivery by Province</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">Household access to basic services (%)</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[200px] sm:h-[260px] md:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SERVICE_DELIVERY_BY_PROVINCE} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="province" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13,18,36,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e4e4e7',
                      boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                    }}
                    formatter={(v: number) => `${v}%`}
                  />
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

      {/* ── Backlog Quantification — with rand value in font-extrabold + progress vs target ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Backlog Quantification</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Estimated rand value of service delivery gaps</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {SERVICE_BACKLOG.map((item) => (
                <motion.div
                  key={item.service}
                  whileHover={{ scale: 1.01, borderColor: `${ACCENT_FROM}30` }}
                  className="rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden"
                  style={{ borderLeftWidth: '3px', borderLeftColor: ACCENT_FROM }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${ACCENT_FROM}, transparent)` }} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-zinc-200">{item.service}</p>
                      <span className="text-xs font-extrabold tabular-nums" style={{ color: ACCENT_TO }}>{formatCompactZAR(item.estimatedCost)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-zinc-400">{formatNumber(item.households)} households</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">{item.pctAddressed}% addressed</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">Target: {item.target}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="progress-premium flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pctAddressed}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          className="progress-bar h-full rounded-full"
                          style={{ '--progress-from': ACCENT_FROM, '--progress-to': ACCENT_TO } as React.CSSProperties}
                        />
                      </div>
                      {/* Target marker */}
                      <div className="relative h-2 w-px bg-amber-400/60" title={`Target: ${item.target}%`}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-amber-400 whitespace-nowrap">{item.target}%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="rounded-lg border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 p-3 text-center">
                <p className="text-[11px] text-zinc-400">Total Estimated Backlog</p>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: ACCENT_TO }}>{formatCompactZAR(SERVICE_BACKLOG.reduce((sum, b) => sum + b.estimatedCost, 0))}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* School Infrastructure Gap */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, #F59E0B)` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <School className="size-4 text-[#F59E0B]" />
                <CardTitle className="text-sm font-semibold text-zinc-200">School Infrastructure Gap</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Norms and Standards compliance analysis</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}08, ${ACCENT_TO}08)` }}>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold">Category</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold text-right">Schools</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold text-right">% Total</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHOOL_INFRA.map((row, idx) => (
                    <TableRow
                      key={row.category}
                      className={cn(
                        'border-white/[0.04] hover:bg-white/[0.04] transition-colors',
                        idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                      )}
                      style={{ borderLeftWidth: '2px', borderLeftColor: row.riskLevel === 'Critical' ? '#EF444440' : '#F59E0B40' }}
                    >
                      <TableCell>
                        <p className="text-xs font-medium text-zinc-200">{row.category}</p>
                        <p className="text-[10px] text-zinc-400">Worst: {row.province}</p>
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-300 font-semibold tabular-nums">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: row.pctTotal > 15 ? '#EF4444' : '#F59E0B' }}>
                        {formatPercent(row.pctTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] h-5 px-1.5',
                            row.riskLevel === 'Critical' && 'animate-pulse bg-red-500/15 text-red-400 border-red-500/25',
                            row.riskLevel === 'High' && 'bg-amber-500/15 text-amber-400 border-amber-500/25',
                            row.riskLevel === 'Medium' && 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
                          )}
                        >
                          {row.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Service Delivery Hotspots ─────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, #EF4444, ${ACCENT_FROM})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-[#EF4444]" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Service Delivery Hotspots</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Top 5 worst-performing municipalities by service delivery score</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {HOTSPOTS.sort((a, b) => a.sdsScore - b.sdsScore).map((spot, i) => (
                <motion.div
                  key={spot.municipality}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden"
                  style={{ borderLeftWidth: '3px', borderLeftColor: '#EF4444' }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(135deg, #EF4444, transparent)' }} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-200">{spot.municipality}</span>
                      <Badge variant="outline" className="text-[8px] h-4 px-1 bg-red-500/15 text-red-400 border-red-500/25">
                        #{i + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="size-2.5 text-zinc-400" />
                      <span className="text-[10px] text-zinc-400">{spot.province}</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Water', value: spot.waterAccess },
                        { label: 'Sanitation', value: spot.sanitation },
                        { label: 'Electricity', value: spot.electricity },
                        { label: 'Refuse', value: spot.refuse },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-400 w-14">{s.label}</span>
                          <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.value}%`,
                                backgroundColor: s.value >= 75 ? '#10B981' : s.value >= 60 ? '#F59E0B' : '#EF4444',
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-semibold tabular-nums w-7 text-right" style={{ color: s.value >= 75 ? '#10B981' : s.value >= 60 ? '#F59E0B' : '#EF4444' }}>
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/[0.06] text-center">
                      <p className="text-[9px] text-zinc-400 uppercase">SDS Score</p>
                      <p className="text-lg font-bold text-red-400 tabular-nums">{spot.sdsScore}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
