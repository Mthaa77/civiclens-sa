'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  HandCoins,
  AlertTriangle,
  TrendingDown,
  Search,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
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
  { grant: 'EPWP Integrated Grant for Municipalities', serviceArea: 'Community Works Programme', minAmount: 5000000, maxAmount: 50000000, deadline: '2026-06-30', eligible: 'NPCs and NPOs' },
  { grant: 'Social Housing Regulatory Authority Grant', serviceArea: 'Housing', minAmount: 10000000, maxAmount: 200000000, deadline: '2026-05-15', eligible: 'SHIs and NGOs' },
  { grant: 'National Lotteries Commission Grant', serviceArea: 'Social Development', minAmount: 500000, maxAmount: 10000000, deadline: 'Rolling', eligible: 'NPOs and NPCs' },
  { grant: 'DTI Manufacturing Development Programme', serviceArea: 'Economic Development', minAmount: 2000000, maxAmount: 50000000, deadline: '2026-09-30', eligible: 'SMMEs and Co-ops' },
  { grant: 'Green Fund — DBSA', serviceArea: 'Environment & Climate', minAmount: 5000000, maxAmount: 100000000, deadline: '2026-08-31', eligible: 'All entities' },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function GrantLens() {
  const underspending = DORA_GRANTS.filter((g) => g.q3Spend < 75).sort((a, b) => a.q3Spend - b.q3Spend);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#65A30D]/10 border border-[#65A30D]/20">
            <HandCoins className="size-5 text-[#65A30D]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">GrantLens</h1>
            <p className="text-xs text-zinc-500">Conditional grant disbursement tracking</p>
          </div>
          <Badge className="ml-2 bg-[#65A30D]/15 text-[#65A30D] border-[#65A30D]/25 text-[10px] h-5 px-1.5">Phase 3</Badge>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total DORA Grants', value: 'R4.5B', color: '#65A30D' },
          { label: 'Avg Q3 Spend', value: '55%', color: '#F59E0B' },
          { label: 'Underspending Muni.', value: String(underspending.length), color: '#EF4444' },
          { label: 'On-Track Muni.', value: String(DORA_GRANTS.length - underspending.length), color: '#10B981' },
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

      {/* ── DORA Grant Tracker ───────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">DORA Grant Tracker</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">Major infrastructure grants by municipality — cumulative spend %</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-[10px]">Grant</TableHead>
                    <TableHead className="text-zinc-500 text-[10px]">Municipality</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Allocation</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Q1</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Q2</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Q3</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Projected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DORA_GRANTS.map((grant, i) => (
                    <TableRow key={i} className="border-white/[0.04] hover:bg-white/[0.03]">
                      <TableCell className="text-xs text-zinc-300 max-w-[200px] truncate">{grant.grant}</TableCell>
                      <TableCell className="text-xs text-zinc-400">{grant.municipality}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-zinc-300 tabular-nums">{formatCompactZAR(grant.allocation)}</TableCell>
                      <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{grant.q1Spend}%</TableCell>
                      <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{grant.q2Spend}%</TableCell>
                      <TableCell className="text-right">
                        <span className={cn('text-xs font-bold tabular-nums', grant.q3Spend >= 75 ? 'text-emerald-400' : grant.q3Spend >= 50 ? 'text-amber-400' : 'text-red-400')}>
                          {grant.q3Spend}%
                        </span>
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
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Underspending Alert + Grant Opportunities ────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Underspending */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-400" />
                <CardTitle className="text-sm font-semibold text-zinc-200">Underspending Alert</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Municipalities spending &lt;75% by Q3</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[350px]">
                <div className="space-y-3">
                  {underspending.map((grant, i) => (
                    <div key={i} className="rounded-lg border border-red-500/10 p-3 hover:border-red-500/20 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-medium text-zinc-300">{grant.municipality}</p>
                          <p className="text-[10px] text-zinc-600">{grant.grant.split('(')[0].trim()}</p>
                        </div>
                        <span className="text-lg font-bold text-red-400 tabular-nums">{grant.q3Spend}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full bg-red-400/70" style={{ width: `${grant.q3Spend}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="text-zinc-600">Allocation: {formatCompactZAR(grant.allocation)}</span>
                        <span className="text-red-400">Unspent: {formatCompactZAR(grant.allocation * (1 - grant.q3Spend / 100))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grant Opportunities */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-[#65A30D]" />
                <CardTitle className="text-sm font-semibold text-zinc-200">Grant Opportunity Matching</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Available grants for NGOs by service area</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[350px]">
                <div className="space-y-3">
                  {NGO_OPPORTUNITIES.map((opp, i) => (
                    <div key={i} className="rounded-lg border border-[#65A30D]/10 p-3 hover:border-[#65A30D]/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300">{opp.grant}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-[#65A30D]/20 text-[#65A30D]">{opp.serviceArea}</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{opp.eligible}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px]">
                            <span className="text-zinc-500">{formatCompactZAR(opp.minAmount)} – {formatCompactZAR(opp.maxAmount)}</span>
                            <span className="text-zinc-700">·</span>
                            <span className="text-zinc-500">Deadline: {opp.deadline}</span>
                          </div>
                        </div>
                        <CheckCircle2 className="size-4 text-[#65A30D] shrink-0 cursor-pointer hover:scale-110 transition-transform" />
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
