'use client';

import React, { useState, useMemo } from 'react';
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
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_RISK_SIGNALS, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate, getSeverityStyle, formatNumber } from '@/lib/formatters';
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
import type { RiskSignal } from '@/types';

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

// ── Main Component ──────────────────────────────────────────────────────────

export default function RiskLens() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  const signals = useMemo(() => {
    let filtered = [...EXTENDED_RISK_SIGNALS];
    if (severityFilter !== 'all') filtered = filtered.filter((s) => s.severity === severityFilter);
    if (typeFilter !== 'all') filtered = filtered.filter((s) => s.type === typeFilter);
    if (entityTypeFilter !== 'all') filtered = filtered.filter((s) => s.entityType === entityTypeFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((s) => s.status === statusFilter);
    return filtered.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [severityFilter, typeFilter, entityTypeFilter, statusFilter]);

  const severityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    EXTENDED_RISK_SIGNALS.filter((s) => s.status === 'Active').forEach((s) => {
      counts[s.severity]++;
    });
    return counts;
  }, []);

  const uniqueTypes = useMemo(() => [...new Set(EXTENDED_RISK_SIGNALS.map((s) => s.type))], []);

  const barChartData = useMemo(() => [
    { name: 'Critical', count: severityCounts.Critical, color: SEVERITY_COLORS.Critical },
    { name: 'High', count: severityCounts.High, color: SEVERITY_COLORS.High },
    { name: 'Medium', count: severityCounts.Medium, color: SEVERITY_COLORS.Medium },
    { name: 'Low', count: severityCounts.Low, color: SEVERITY_COLORS.Low },
  ], [severityCounts]);

  const getEntityName = (entityId: string, entityType: string) => {
    if (entityType === 'Municipality' || entityType === 'Buyer') {
      const muni = MOCK_MUNICIPALITIES.find((m) => m.code === entityId);
      if (muni) return muni.name;
    }
    return entityId;
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20">
            <ShieldAlert className="size-5 text-[#DC2626]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">RiskLens</h1>
            <p className="text-xs text-zinc-500">Procurement and municipal anomaly detection</p>
          </div>
          <Badge className="ml-2 bg-[#DC2626]/15 text-[#DC2626] border-[#DC2626]/25 text-[10px] h-5 px-1.5">
            Phase 2
          </Badge>
        </div>
      </motion.div>

      {/* ── Severity Summary Cards ──────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {([
          { label: 'Critical', count: severityCounts.Critical, icon: AlertOctagon, color: '#EF4444', pulse: true },
          { label: 'High', count: severityCounts.High, icon: AlertTriangle, color: '#F97316', pulse: false },
          { label: 'Medium', count: severityCounts.Medium, icon: Activity, color: '#F59E0B', pulse: false },
          { label: 'Low', count: severityCounts.Low, icon: Info, color: '#3B82F6', pulse: false },
        ] as const).map((card) => (
          <motion.div key={card.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold tabular-nums" style={{ color: card.color }}>{card.count}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">active signals</p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-lg" style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                    <card.icon className="size-5" style={{ color: card.color }} />
                  </div>
                </div>
                {card.pulse && card.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: card.color }} />
                    <span className="text-[10px] text-zinc-500">Requires immediate attention</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Risk Feed + Severity Chart ──────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Risk Feed */}
        <motion.div variants={itemFadeIn} className="lg:col-span-2">
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Risk Feed</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{signals.length} signals matching filters</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[110px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[480px]">
                <div className="space-y-2.5">
                  {signals.map((signal, i) => {
                    const sevStyle = getSeverityStyle(signal.severity);
                    const isExpanded = expandedSignal === signal.id;
                    return (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                        onClick={() => setExpandedSignal(isExpanded ? null : signal.id)}
                      >
                        <div className="flex items-start gap-2.5">
                          <Badge
                            className={cn(
                              'shrink-0 text-[9px] h-5 px-1.5 font-semibold border',
                              signal.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
                              sevStyle.bgColor, sevStyle.color, sevStyle.borderColor
                            )}
                            variant="outline"
                          >
                            {signal.severity}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-zinc-300">{signal.type}</p>
                              <Badge variant="outline" className="text-[9px] h-4 px-1 border-white/[0.08] text-zinc-500">{signal.entityType}</Badge>
                            </div>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">{getEntityName(signal.entityId, signal.entityType)}</p>
                            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{signal.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-zinc-600">{formatSADate(signal.detectedAt)}</span>
                              <Badge variant="outline" className={cn(
                                'text-[9px] h-4 px-1',
                                signal.status === 'Active' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                              )}>{signal.status}</Badge>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isExpanded ? <ChevronUp className="size-4 text-zinc-500" /> : <ChevronDown className="size-4 text-zinc-600" />}
                          </div>
                        </div>
                        {/* Expanded Detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-3 bg-white/[0.06]" />
                              <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div>
                                  <span className="text-zinc-600">Indicator</span>
                                  <p className="text-zinc-300 font-medium mt-0.5">{signal.indicator}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-600">Threshold</span>
                                  <p className="text-zinc-300 font-medium mt-0.5">{String(signal.threshold)}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-600">Detected Value</span>
                                  <p className="font-bold mt-0.5" style={{ color: SEVERITY_COLORS[signal.severity] }}>{String(signal.indicatorValue)}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-600">Municipality Code</span>
                                  <p className="text-zinc-300 font-medium mt-0.5">{signal.municipalityCode || '—'}</p>
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

        {/* Severity Distribution */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Severity Distribution</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Active signals by severity level</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }}
                      formatter={(value: number) => [`${value} signals`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-400">Signal Types</p>
                {uniqueTypes.map((t) => (
                  <div key={t} className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">{t}</span>
                    <span className="text-zinc-300 font-medium tabular-nums">{EXTENDED_RISK_SIGNALS.filter((s) => s.type === t).length}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Anomaly Table ───────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200">Anomaly Table</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">All detected anomalies with indicators and thresholds</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger className="w-[120px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="Municipality">Municipality</SelectItem>
                    <SelectItem value="Buyer">Buyer</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[100px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Severity</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Entity</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Indicator</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Value</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Threshold</TableHead>
                    <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.map((signal) => {
                    const sevStyle = getSeverityStyle(signal.severity);
                    return (
                      <TableRow key={signal.id} className="border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-[9px] h-5 px-1.5 font-semibold border',
                              signal.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              sevStyle.bgColor, sevStyle.color, sevStyle.borderColor
                            )}
                            variant="outline"
                          >
                            {signal.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-300 font-medium">{signal.type}</TableCell>
                        <TableCell>
                          <p className="text-xs text-zinc-300">{getEntityName(signal.entityId, signal.entityType)}</p>
                          <p className="text-[10px] text-zinc-600">{signal.entityType}</p>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400">{signal.indicator}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-bold tabular-nums" style={{ color: SEVERITY_COLORS[signal.severity] }}>
                            {String(signal.indicatorValue)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{String(signal.threshold)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            'text-[9px] h-4 px-1',
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
    </div>
  );
}
