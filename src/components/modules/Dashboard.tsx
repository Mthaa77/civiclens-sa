'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_KPIS,
  AUDIT_OUTCOMES_DISTRIBUTION,
  PROVINCE_SUMMARY,
  SERVICE_DELIVERY_BY_PROVINCE,
  MOCK_RISK_SIGNALS,
  MOCK_TENDERS,
} from '@/lib/mock-data';
import {
  formatCompactZAR,
  formatNumber,
  formatSADate,
  getScoreBand,
  getSeverityStyle,
} from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';
import type { ModuleId } from '@/types';

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

// ── Sub-Components ──────────────────────────────────────────────────────────

function KPICard({ data, index }: { data: KPICardData; index: number }) {
  return (
    <motion.div
      variants={itemSlideUp}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.08] p-4 lg:p-5',
          'bg-gradient-to-br',
          data.gradientFrom,
          data.gradientTo,
          'backdrop-blur-sm transition-all duration-300',
          'hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20'
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{
            background: `linear-gradient(90deg, ${data.accentColor}, transparent)`,
          }}
        />

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
            style={{
              background: `linear-gradient(90deg, transparent, ${data.accentColor}08, transparent)`,
            }}
          />
        </div>

        {/* Background glow */}
        <div
          className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.14] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />

        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
              {data.label}
            </p>
            <p
              className="text-2xl lg:text-3xl font-bold tabular-nums tracking-tight"
              style={{ color: data.accentColor }}
            >
              {data.value}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {data.trend.direction === 'up' ? (
                <TrendingUp
                  className={cn(
                    'size-3.5',
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
                    'size-3.5',
                    data.sentiment === 'positive'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  data.sentiment === 'negative'
                    ? 'text-red-400'
                    : data.sentiment === 'warning'
                      ? 'text-amber-400'
                      : data.sentiment === 'positive'
                        ? 'text-emerald-400'
                        : 'text-zinc-400'
                )}
              >
                {data.trend.value}
              </span>
              <span className="text-[10px] text-zinc-600">vs prev. year</span>
            </div>
          </div>

          <div
            className="flex size-10 items-center justify-center rounded-lg shrink-0"
            style={{
              background: `${data.accentColor}15`,
              border: `1px solid ${data.accentColor}25`,
            }}
          >
            <div style={{ color: data.accentColor }}>{data.icon}</div>
          </div>
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Audit Outcome Distribution
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-0.5">
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
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-zinc-100 tabular-nums">{total}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {AUDIT_OUTCOMES_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-zinc-400 flex-1">{item.name}</span>
                  <span className="text-xs font-semibold text-zinc-200 tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-[10px] text-zinc-600 tabular-nums w-10 text-right">
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Provincial Financial Health
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-0.5">
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
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="province"
                  width={95}
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Service Delivery by Province
              </CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">
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
                <div key={item.key} className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-zinc-500">{item.label}</span>
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
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#71717a', fontSize: 10 }}
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Provincial Intelligence Table
              </CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Key metrics by province — click row to explore in GeoLens
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-white/[0.08] text-zinc-500 text-[10px] cursor-pointer hover:border-white/[0.15] hover:text-zinc-300 transition-all"
              onClick={handleRowClick}
            >
              <Map className="size-3 mr-1" />
              Open Map
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
                  Province
                </TableHead>
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Municipalities
                </TableHead>
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Avg FHS
                </TableHead>
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Avg SDS
                </TableHead>
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">
                  §139
                </TableHead>
                <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Clean Audits
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROVINCE_SUMMARY.map((prov) => {
                const fhsBand = getScoreBand(prov.avgFHS);
                const sdsBand = getScoreBand(100 - prov.avgSDS); // lower SDS is better
                return (
                  <TableRow
                    key={prov.province}
                    className="border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors"
                    onClick={handleRowClick}
                  >
                    <TableCell className="font-medium text-zinc-200 text-xs">
                      {prov.province}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400 text-xs tabular-nums">
                      {prov.municipalities}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-semibold tabular-nums',
                          fhsBand.textColor
                        )}
                      >
                        {prov.avgFHS}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-semibold tabular-nums',
                          sdsBand.textColor
                        )}
                      >
                        {prov.avgSDS}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {prov.section139 > 0 ? (
                        <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[10px] h-5 px-1.5">
                          {prov.section139}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {prov.cleanAudit > 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px] h-5 px-1.5">
                          {prov.cleanAudit}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600 text-xs">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="size-3.5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200">
                  Recent Risk Signals
                </CardTitle>
                <p className="text-[10px] text-zinc-600">
                  {DASHBOARD_KPIS.riskSignalsActive} active signals
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[340px]">
            <div className="space-y-3">
              {recentSignals.map((signal, i) => {
                const severityStyle = getSeverityStyle(signal.severity);
                return (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <Badge
                        className={cn(
                          'shrink-0 text-[9px] h-5 px-1.5 font-semibold border',
                          severityStyle.bgColor,
                          severityStyle.color,
                          severityStyle.borderColor
                        )}
                        variant="outline"
                      >
                        {signal.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate">
                          {signal.type}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {signal.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-zinc-600 font-medium">
                            {signal.entityId}
                          </span>
                          <span className="text-[10px] text-zinc-700">·</span>
                          <span className="text-[10px] text-zinc-600">
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
          <Separator className="my-3 bg-white/[0.06]" />
          <button
            onClick={() => setActiveModule('risklens' as ModuleId)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <span>View all risk signals</span>
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
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
                <FileSearch className="size-3.5 text-[#2D6A4F]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200">
                  Active Tender Highlights
                </CardTitle>
                <p className="text-[10px] text-zinc-600">
                  Top {activeTenders.length} by estimated value
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[340px]">
            <div className="space-y-3">
              {activeTenders.map((tender, i) => (
                <motion.div
                  key={tender.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 line-clamp-1 leading-snug">
                        {tender.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {tender.buyerName}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#B45309] tabular-nums shrink-0">
                      {formatCompactZAR(tender.estimatedValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500"
                    >
                      {tender.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="size-2.5" />
                      <span>Closes {formatSADate(tender.closingDate ?? '')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
          <Separator className="my-3 bg-white/[0.06]" />
          <button
            onClick={() => setActiveModule('tenderlens' as ModuleId)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <span>View all tenders</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Dashboard Header ────────────────────────────────────────────────────────

function DashboardHeader() {
  const { counter, isRefreshing, refresh } = useLiveCounter();

  const handleExport = (format: string) => {
    toast.info('Preparing your export...', {
      description: `Generating ${format} file with dashboard data`,
    });
    setTimeout(() => {
      toast.success('Export complete! File saved to Downloads', {
        description: `civiclens-dashboard-${Date.now()}.${format.toLowerCase()}`,
      });
    }, 2000);
  };

  return (
    <motion.div variants={itemSlideUp} className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Live Indicator + Counter */}
      <div className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 flex-1">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2.5 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <div className="relative size-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Live Data
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <Shield className="size-3 text-zinc-600" />
          <span className="text-[11px] text-zinc-500">
            Data as of 03 Mar 2026 — MFMA 2023/24 cycle
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 text-zinc-600" />
          <span className="text-[11px] text-zinc-500 font-mono">
            Last updated: {counter}
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">
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

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.06]"
            >
              <Download className="size-3.5" />
              <span className="text-[11px]">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#0d1224] border-white/[0.08]"
            align="end"
          >
            <DropdownMenuItem
              className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] cursor-pointer"
              onClick={() => handleExport('CSV')}
            >
              <FileSpreadsheet className="mr-2 size-4 text-emerald-400" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] cursor-pointer"
              onClick={() => handleExport('PDF')}
            >
              <FileDown className="mr-2 size-4 text-red-400" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] cursor-pointer"
              onClick={() => handleExport('XLSX')}
            >
              <FileSpreadsheet className="mr-2 size-4 text-amber-400" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* ── Dashboard Header ────────────────────────────────────── */}
      <DashboardHeader />

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
            <p className="text-xs font-medium text-amber-300">
              Financial Distress Alert: 63% of municipalities now classified as distressed
            </p>
            <p className="text-[10px] text-amber-500/70 mt-0.5">
              162 of 257 municipalities below Financial Health Score threshold of 45 — up 8.2% year-on-year
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] shrink-0">
            High Priority
          </Badge>
        </div>
      </motion.div>

      {/* ── Hero KPI Strip ──────────────────────────────────────── */}
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

      {/* ── National Overview Charts ────────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <AuditOutcomeChart />
        <ProvincialFHSChart />
      </motion.div>

      {/* ── Service Delivery Heatmap ────────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
      >
        <ServiceDeliveryChart />
      </motion.div>

      {/* ── Provincial Intelligence Table ───────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
      >
        <ProvincialTable />
      </motion.div>

      {/* ── Risk Signals & Tender Highlights ────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <RiskSignalsPanel />
        <TenderHighlightsPanel />
      </motion.div>
    </div>
  );
}
