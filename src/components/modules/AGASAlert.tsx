'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Shield,
  Search,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AUDIT_OUTCOMES_DISTRIBUTION, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate, formatPercent, formatNumber } from '@/lib/formatters';
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

// ── Audit Trajectory Data ───────────────────────────────────────────────────

const AUDIT_TRAJECTORY = [
  { classification: 'Improving', count: 38, color: '#10B981', icon: TrendingUp },
  { classification: 'Stable', count: 142, color: '#3B82F6', icon: Minus },
  { classification: 'Regressed', count: 77, color: '#EF4444', icon: TrendingDown },
];

// ── Material Irregularities ─────────────────────────────────────────────────

const MATERIAL_IRREGULARITIES = [
  { id: 'MI-001', municipality: 'Mangaung', description: 'Procurement irregularities — R420M infrastructure contract awarded without competitive bidding', amount: 420000000, status: 'Under Investigation', detectedAt: '2025-11-15' },
  { id: 'MI-002', municipality: 'Ekurhuleni', description: 'Non-compliance with SCM regulations — security services contract extended beyond lawful period', amount: 185000000, status: 'Remedial Action', detectedAt: '2025-09-22' },
  { id: 'MI-003', municipality: 'Buffalo City', description: 'Irregular expenditure — unauthorised budget overruns on housing project', amount: 280000000, status: 'Under Investigation', detectedAt: '2025-12-03' },
  { id: 'MI-004', municipality: 'Msunduzi', description: 'Failure to prevent irregular expenditure — electricity infrastructure contract variations', amount: 152000000, status: 'Referred to SAPS', detectedAt: '2026-01-18' },
  { id: 'MI-005', municipality: 'eThekwini', description: 'Material misstatement in financial statements — water revenue overstatement', amount: 350000000, status: 'Under Investigation', detectedAt: '2026-02-05' },
];

// ── Clean Audit Probability ─────────────────────────────────────────────────

const CLEAN_AUDIT_PROBS = [
  { name: 'Stellenbosch', probability: 92, currentOutcome: 'Clean' },
  { name: 'City of Cape Town', probability: 78, currentOutcome: 'Unqualified' },
  { name: 'Sol Plaatje', probability: 45, currentOutcome: 'Unqualified' },
  { name: 'City of Tshwane', probability: 32, currentOutcome: 'Unqualified' },
  { name: 'Rustenburg', probability: 18, currentOutcome: 'Qualified' },
  { name: 'Nelson Mandela Bay', probability: 12, currentOutcome: 'Qualified' },
  { name: 'eThekwini', probability: 8, currentOutcome: 'Qualified' },
  { name: 'City of Johannesburg', probability: 6, currentOutcome: 'Qualified' },
  { name: 'Ekurhuleni', probability: 3, currentOutcome: 'Disclaimer' },
  { name: 'Mangaung', probability: 2, currentOutcome: 'Disclaimer' },
  { name: 'Buffalo City', probability: 5, currentOutcome: 'Qualified' },
  { name: 'Msunduzi', probability: 1, currentOutcome: 'Adverse' },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function AGASAlert() {
  const total = AUDIT_OUTCOMES_DISTRIBUTION.reduce((sum, d) => sum + d.value, 0);

  const sortedMunis = [...MOCK_MUNICIPALITIES].sort((a, b) => {
    const order: Record<string, number> = { Clean: 0, Unqualified: 1, Qualified: 2, Adverse: 3, Disclaimer: 4 };
    return (order[a.auditOutcome ?? ''] ?? 5) - (order[b.auditOutcome ?? ''] ?? 5);
  });

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#CA8A04]/10 border border-[#CA8A04]/20">
            <ClipboardCheck className="size-5 text-[#CA8A04]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">AGASAlert</h1>
            <p className="text-xs text-zinc-500">Auditor-General audit outcome intelligence</p>
          </div>
          <Badge className="ml-2 bg-[#CA8A04]/15 text-[#CA8A04] border-[#CA8A04]/25 text-[10px] h-5 px-1.5">Phase 2</Badge>
        </div>
      </motion.div>

      {/* ── National Audit Dashboard + Trajectory ────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">National Audit Dashboard</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">2023/24 MFMA audit outcomes — {total} municipalities</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <div className="relative w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={AUDIT_OUTCOMES_DISTRIBUTION} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {AUDIT_OUTCOMES_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-zinc-100 tabular-nums">{total}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {AUDIT_OUTCOMES_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-zinc-400 flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-zinc-200 tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-zinc-600 tabular-nums w-10 text-right">{((item.value / total) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audit Trajectory */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Audit Trajectory</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Municipality audit outcome movement year-on-year</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {AUDIT_TRAJECTORY.map((t) => (
                  <div key={t.classification} className="rounded-lg border border-white/[0.06] p-4 hover:border-white/[0.12] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <t.icon className="size-4" style={{ color: t.color }} />
                        <span className="text-sm font-semibold text-zinc-200">{t.classification}</span>
                      </div>
                      <span className="text-2xl font-bold tabular-nums" style={{ color: t.color }}>{t.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: t.color, width: `${(t.count / total) * 100}%`, opacity: 0.8 }} />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">{((t.count / total) * 100).toFixed(1)}% of municipalities</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Material Irregularity Tracker ────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[#CA8A04]" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Material Irregularity Tracker</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Flagged material irregularities from AGSA reports</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2.5">
                {MATERIAL_IRREGULARITIES.map((mi, i) => (
                  <motion.div
                    key={mi.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-[#CA8A04]/10 text-[#CA8A04] border-[#CA8A04]/25 shrink-0">{mi.id}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300">{mi.municipality}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{mi.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-[#CA8A04] font-semibold">R{(mi.amount / 1000000).toFixed(0)}M</span>
                          <span className="text-[10px] text-zinc-600">·</span>
                          <Badge variant="outline" className={cn(
                            'text-[9px] h-4 px-1',
                            mi.status === 'Referred to SAPS' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            mi.status === 'Remedial Action' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-[#CA8A04]/10 text-[#CA8A04] border-[#CA8A04]/20'
                          )}>{mi.status}</Badge>
                          <span className="text-[10px] text-zinc-600">{formatSADate(mi.detectedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Municipality Audit Grades + Clean Audit Probability ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit Grades Table */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Municipality Audit Grades</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Sorted by audit outcome</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-[10px]">Municipality</TableHead>
                      <TableHead className="text-zinc-500 text-[10px]">Audit Outcome</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] text-right">FHS</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] text-right">Cash Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMunis.map((m) => {
                      const outcomeColors: Record<string, string> = { Clean: '#10B981', Unqualified: '#3B82F6', Qualified: '#F59E0B', Adverse: '#F97316', Disclaimer: '#EF4444' };
                      return (
                        <TableRow key={m.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                          <TableCell className="text-xs font-medium text-zinc-300">{m.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] h-5 px-1.5" style={{ backgroundColor: `${outcomeColors[m.auditOutcome ?? ''] ?? '#64748B'}15`, color: outcomeColors[m.auditOutcome ?? ''] ?? '#64748B', borderColor: `${outcomeColors[m.auditOutcome ?? ''] ?? '#64748B'}25` }}>
                              {m.auditOutcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: (m.financialHealthScore ?? 0) >= 50 ? '#10B981' : '#EF4444' }}>
                            {m.financialHealthScore}
                          </TableCell>
                          <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{m.cashCoverageDays}d</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clean Audit Probability */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-[#CA8A04]" />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Clean Audit Probability</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">ML model prediction for 2024/25 audit cycle</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {CLEAN_AUDIT_PROBS.sort((a, b) => b.probability - a.probability).map((item, i) => (
                    <div key={item.name} className="rounded-lg border border-white/[0.06] p-2.5 hover:border-white/[0.12] transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-zinc-300">{item.name}</span>
                        <span className={cn('text-xs font-bold tabular-nums', item.probability >= 50 ? 'text-emerald-400' : item.probability >= 20 ? 'text-amber-400' : 'text-red-400')}>
                          {item.probability}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.probability}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.probability >= 50 ? '#10B981' : item.probability >= 20 ? '#F59E0B' : '#EF4444' }}
                        />
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-zinc-600">Current: {item.currentOutcome}</span>
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
