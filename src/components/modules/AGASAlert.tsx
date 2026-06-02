'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Brain,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Download,
  ExternalLink,
  GitCompareArrows,
  Search,
  Building2,
  Trophy,
  Crown,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AUDIT_OUTCOMES_DISTRIBUTION, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate, formatZAR } from '@/lib/formatters';
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
import { useNavigationStore } from '@/store/navigation';

// ── Accent Colors: blue (#3B82F6) → amber (#F59E0B) ────────────────────────
const ACCENT_FROM = '#3B82F6';
const ACCENT_TO = '#F59E0B';

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
  { classification: 'Improving', count: 38, color: '#10B981', Icon: TrendingUp, trend: 'up' },
  { classification: 'Stable', count: 142, color: '#3B82F6', Icon: Minus, trend: 'stable' },
  { classification: 'Regressed', count: 77, color: '#EF4444', Icon: TrendingDown, trend: 'down' },
];

// ── 5-Year Audit Outcome Trend Data ─────────────────────────────────────────

const AUDIT_OUTCOME_COLORS: Record<string, string> = {
  Clean: '#10B981',
  Unqualified: '#3B82F6',
  Qualified: '#F59E0B',
  Adverse: '#F97316',
  Disclaimer: '#EF4444',
};

const FIVE_YEAR_TREND = [
  { year: '2019/20', Clean: 20, Unqualified: 82, Qualified: 85, Adverse: 38, Disclaimer: 32 },
  { year: '2020/21', Clean: 22, Unqualified: 84, Qualified: 82, Adverse: 36, Disclaimer: 33 },
  { year: '2021/22', Clean: 23, Unqualified: 86, Qualified: 80, Adverse: 35, Disclaimer: 33 },
  { year: '2022/23', Clean: 24, Unqualified: 88, Qualified: 79, Adverse: 34, Disclaimer: 32 },
  { year: '2023/24', Clean: 25, Unqualified: 89, Qualified: 78, Adverse: 32, Disclaimer: 33 },
];

// ── Municipality Audit Outcomes (for horizontal bar chart) ──────────────────

const MUNI_AUDIT_OUTCOMES = [
  { name: 'Stellenbosch', Clean: 1, Unqualified: 0, Qualified: 0, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'City of Cape Town', Clean: 0, Unqualified: 1, Qualified: 0, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'Sol Plaatje', Clean: 0, Unqualified: 1, Qualified: 0, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'City of Tshwane', Clean: 0, Unqualified: 1, Qualified: 0, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'Rustenburg', Clean: 0, Unqualified: 0, Qualified: 1, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'Nelson Mandela Bay', Clean: 0, Unqualified: 0, Qualified: 1, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'eThekwini', Clean: 0, Unqualified: 0, Qualified: 1, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'City of Johannesburg', Clean: 0, Unqualified: 0, Qualified: 1, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'Buffalo City', Clean: 0, Unqualified: 0, Qualified: 1, Adverse: 0, Disclaimer: 0, total: 1 },
  { name: 'Ekurhuleni', Clean: 0, Unqualified: 0, Qualified: 0, Adverse: 0, Disclaimer: 1, total: 1 },
  { name: 'Mangaung', Clean: 0, Unqualified: 0, Qualified: 0, Adverse: 0, Disclaimer: 1, total: 1 },
  { name: 'Msunduzi', Clean: 0, Unqualified: 0, Qualified: 0, Adverse: 1, Disclaimer: 0, total: 1 },
];

// ── Material Irregularities ─────────────────────────────────────────────────

const MATERIAL_IRREGULARITIES = [
  { id: 'MI-001', municipality: 'Mangaung', description: 'Procurement irregularities — R420M infrastructure contract awarded without competitive bidding', amount: 420000000, status: 'Under Investigation', detectedAt: '2025-11-15', severity: 'critical' },
  { id: 'MI-002', municipality: 'Ekurhuleni', description: 'Non-compliance with SCM regulations — security services contract extended beyond lawful period', amount: 185000000, status: 'Under Investigation', detectedAt: '2025-09-22', severity: 'high' },
  { id: 'MI-003', municipality: 'Buffalo City', description: 'Irregular expenditure — unauthorised budget overruns on housing project', amount: 280000000, status: 'Under Investigation', detectedAt: '2025-12-03', severity: 'critical' },
  { id: 'MI-004', municipality: 'Msunduzi', description: 'Failure to prevent irregular expenditure — electricity infrastructure contract variations', amount: 152000000, status: 'Open', detectedAt: '2026-01-18', severity: 'critical' },
  { id: 'MI-005', municipality: 'eThekwini', description: 'Material misstatement in financial statements — water revenue overstatement', amount: 350000000, status: 'Under Investigation', detectedAt: '2026-02-05', severity: 'high' },
  { id: 'MI-006', municipality: 'City of Johannesburg', description: 'Irregular expenditure on fleet management contract — deviation from SCM processes', amount: 95000000, status: 'Resolved', detectedAt: '2025-06-10', severity: 'high' },
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

// ── Sparkline data for summary stat cards (5-quarter mini trends) ──────────
const SPARKLINE_DATA: Record<string, number[]> = {
  'Total Audits': [240, 245, 250, 253, 257],
  'Improving': [28, 31, 34, 36, 38],
  'Regressed': [85, 83, 80, 79, 77],
  'Clean Audit Rate': [8.2, 8.8, 9.2, 9.4, 9.7],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getProbColor(prob: number): string {
  if (prob >= 70) return '#10B981';
  if (prob >= 40) return '#F59E0B';
  return '#EF4444';
}

function getProbCategory(prob: number): { label: string; color: string; bg: string; border: string } {
  if (prob >= 70) return { label: 'High Probability', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)' };
  if (prob >= 40) return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' };
  return { label: 'Low', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.25)' };
}

function getSeverityColor(severity: string): string {
  if (severity === 'critical') return '#EF4444';
  if (severity === 'high') return '#F97316';
  return '#F59E0B';
}

function getMIStatusStyle(status: string): { color: string; bg: string; border: string } {
  switch (status) {
    case 'Resolved': return { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)' };
    case 'Under Investigation': return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' };
    case 'Open': return { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.25)' };
    default: return { color: '#71717a', bg: 'rgba(113,113,122,0.15)', border: 'rgba(113,113,122,0.25)' };
  }
}

// ── Animated Count-Up Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200, delay: number = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

// ── SVG Gauge Ring Component ────────────────────────────────────────────────

function GaugeRing({ percentage, color, size = 40, strokeWidth = 3 }: { percentage: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
      />
    </svg>
  );
}

// ── Mini Sparkline Component ────────────────────────────────────────────────

function MiniSparkline({ data, color, width = 80, height = 20 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="opacity-60">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      {/* gradient fill under line */}
      <motion.polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`${color}10`}
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  );
}

// ── Clean Audit Rate Outer Ring ─────────────────────────────────────────────

function CleanAuditOuterRing({ percentage, radius }: { percentage: number; radius: number }) {
  const strokeWidth = 4;
  const r = radius + strokeWidth + 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <motion.circle
      cx="50%" cy="50%" r={r} fill="none"
      stroke={ACCENT_TO} strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={circumference}
      initial={{ strokeDashoffset: circumference, opacity: 0 }}
      animate={{ strokeDashoffset: offset, opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
      transform={`rotate(-90 50% 50%)`}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT_TO}50)` }}
    />
  );
}

// ── Custom Tooltip for Stacked Bar Chart ────────────────────────────────────

function AuditTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-white/[0.1] px-3 py-2 text-xs shadow-xl" style={{ background: 'rgba(13,18,36,0.95)' }}>
      <p className="font-semibold text-zinc-200 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <div className="size-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300">{entry.name}:</span>
          <span className="font-bold text-zinc-100 tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Audit Outcome Timeline ──────────────────────────────────────────────────

function AuditOutcomeTimeline() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const timelineData = FIVE_YEAR_TREND;

  const nodeSpacing = 100;
  const nodeWidth = timelineData.length * nodeSpacing;
  const svgHeight = 200;
  const centerY = 100;
  const nodeRadius = 22;

  const cleanRates = timelineData.map(d => {
    const total = d.Clean + d.Unqualified + d.Qualified + d.Adverse + d.Disclaimer;
    return { year: d.year, rate: total > 0 ? (d.Clean / total) * 100 : 0 };
  });

  const handleNodeClick = (year: string) => {
    setSelectedYear(prev => prev === year ? null : year);
  };

  return (
    <Card className="glass-card-v2 card-hover-lift overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4" style={{ color: ACCENT_FROM }} />
          <div>
            <CardTitle className="text-sm font-semibold text-zinc-200">Audit Outcome Timeline</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">Interactive 5-year audit outcome progression — click a year for details</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto pb-2">
          <svg width={nodeWidth + 80} height={svgHeight + 80} viewBox={`0 0 ${nodeWidth + 80} ${svgHeight + 80}`} className="mx-auto">
            <defs>
              <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={ACCENT_FROM} />
                <stop offset="100%" stopColor={ACCENT_TO} />
              </linearGradient>
              <linearGradient id="cleanTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B98180" />
              </linearGradient>
              <filter id="timelineGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Gradient connecting lines */}
            {timelineData.map((d, i) => {
              if (i === 0) return null;
              const x1 = 40 + (i - 1) * nodeSpacing + nodeRadius;
              const x2 = 40 + i * nodeSpacing - nodeRadius;
              return (
                <motion.line
                  key={`line-${d.year}`}
                  x1={x1} y1={centerY + 40} x2={x2} y2={centerY + 40}
                  stroke="url(#timelineGrad)" strokeWidth={2} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                />
              );
            })}

            {/* Clean audit trend line overlay */}
            <motion.path
              d={cleanRates.map((cr, i) => {
                const x = 40 + i * nodeSpacing;
                const y = 20 + (1 - cr.rate / 12) * 30;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="url(#cleanTrendGrad)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              filter="url(#timelineGlow)"
            />

            {/* Trend dots */}
            {cleanRates.map((cr, i) => {
              const x = 40 + i * nodeSpacing;
              const y = 20 + (1 - cr.rate / 12) * 30;
              return (
                <motion.circle
                  key={`trend-dot-${cr.year}`}
                  cx={x} cy={y} r={3}
                  fill="#10B981"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 3, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.12 }}
                />
              );
            })}

            {/* Year nodes */}
            {timelineData.map((d, i) => {
              const cx = 40 + i * nodeSpacing;
              const cy = centerY + 40;
              const yearTotal = d.Clean + d.Unqualified + d.Qualified + d.Adverse + d.Disclaimer;
              const cleanP = yearTotal > 0 ? d.Clean / yearTotal : 0;
              const unqP = yearTotal > 0 ? d.Unqualified / yearTotal : 0;
              const qualP = yearTotal > 0 ? d.Qualified / yearTotal : 0;
              const advP = yearTotal > 0 ? d.Adverse / yearTotal : 0;

              const isSelected = selectedYear === d.year;

              return (
                <g key={`node-${d.year}`} onClick={() => handleNodeClick(d.year)} className="cursor-pointer">
                  {/* Outer glow on selection */}
                  <motion.circle
                    cx={cx} cy={cy} r={nodeRadius + 6}
                    fill="none"
                    stroke={isSelected ? ACCENT_TO : 'transparent'}
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 0.6 : 0, r: isSelected ? nodeRadius + 8 : nodeRadius + 4 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Node background */}
                  <motion.circle
                    cx={cx} cy={cy} r={nodeRadius}
                    fill="rgba(13,18,36,0.9)"
                    stroke={isSelected ? ACCENT_TO : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isSelected ? 2 : 1}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: nodeRadius, opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ stroke: ACCENT_TO, strokeWidth: 2 }}
                  />

                  {/* Mini stacked bar inside node */}
                  {/* Clean */}
                  <motion.rect
                    x={cx - 10} y={cy - 10 + (1 - cleanP - unqP - qualP - advP) * 20}
                    width={20} height={Math.max(cleanP * 20, 0.5)}
                    fill={AUDIT_OUTCOME_COLORS.Clean}
                    rx={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  />
                  {/* Unqualified */}
                  <motion.rect
                    x={cx - 10} y={cy - 10 + (1 - unqP - qualP - advP) * 20}
                    width={20} height={Math.max(unqP * 20, 0.5)}
                    fill={AUDIT_OUTCOME_COLORS.Unqualified}
                    rx={0}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.45 + i * 0.1 }}
                  />
                  {/* Qualified */}
                  <motion.rect
                    x={cx - 10} y={cy - 10 + (1 - qualP - advP) * 20}
                    width={20} height={Math.max(qualP * 20, 0.5)}
                    fill={AUDIT_OUTCOME_COLORS.Qualified}
                    rx={0}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  />
                  {/* Adverse */}
                  <motion.rect
                    x={cx - 10} y={cy - 10 + (1 - advP) * 20}
                    width={20} height={Math.max(advP * 20, 0.5)}
                    fill={AUDIT_OUTCOME_COLORS.Adverse}
                    rx={0}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.55 + i * 0.1 }}
                  />
                  {/* Disclaimer - top */}
                  <motion.rect
                    x={cx - 10} y={cy - 10}
                    width={20} height={Math.max((yearTotal > 0 ? d.Disclaimer / yearTotal : 0) * 20, 0.5)}
                    fill={AUDIT_OUTCOME_COLORS.Disclaimer}
                    rx={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  />

                  {/* Year label */}
                  <motion.text
                    x={cx} y={cy + nodeRadius + 16}
                    textAnchor="middle"
                    fill="#a1a1aa" fontSize={10} fontWeight={600}
                    initial={{ opacity: 0, y: cy + nodeRadius + 22 }}
                    animate={{ opacity: 1, y: cy + nodeRadius + 16 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {d.year}
                  </motion.text>

                  {/* Clean % label below */}
                  <motion.text
                    x={cx} y={cy + nodeRadius + 28}
                    textAnchor="middle"
                    fill="#10B981" fontSize={9} fontWeight={700}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    {yearTotal > 0 ? ((d.Clean / yearTotal) * 100).toFixed(1) : '0'}%
                  </motion.text>
                </g>
              );
            })}

            {/* Detail popover for selected year */}
            <AnimatePresence>
              {selectedYear && (() => {
                const d = timelineData.find(t => t.year === selectedYear);
                if (!d) return null;
                const idx = timelineData.findIndex(t => t.year === selectedYear);
                const cx = 40 + idx * nodeSpacing;
                const popY = centerY + 40 + nodeRadius + 46;
                const yearTotal = d.Clean + d.Unqualified + d.Qualified + d.Adverse + d.Disclaimer;
                return (
                  <motion.g
                    key={`popover-${selectedYear}`}
                    initial={{ opacity: 0, y: popY - 5 }}
                    animate={{ opacity: 1, y: popY }}
                    exit={{ opacity: 0, y: popY - 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <rect
                      x={cx - 65} y={popY - 5}
                      width={130} height={90}
                      rx={8}
                      fill="rgba(13,18,36,0.95)"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth={1}
                    />
                    <text x={cx} y={popY + 10} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight={700}>{selectedYear}</text>
                    {[
                      { label: 'Clean', value: d.Clean, color: AUDIT_OUTCOME_COLORS.Clean },
                      { label: 'Unqual.', value: d.Unqualified, color: AUDIT_OUTCOME_COLORS.Unqualified },
                      { label: 'Qualified', value: d.Qualified, color: AUDIT_OUTCOME_COLORS.Qualified },
                      { label: 'Adverse', value: d.Adverse, color: AUDIT_OUTCOME_COLORS.Adverse },
                      { label: 'Disclaimer', value: d.Disclaimer, color: AUDIT_OUTCOME_COLORS.Disclaimer },
                    ].map((item, j) => (
                      <g key={`pop-item-${j}`}>
                        <rect x={cx - 55} y={popY + 17 + j * 13} width={6} height={6} rx={1} fill={item.color} />
                        <text x={cx - 44} y={popY + 23 + j * 13} fill="#a1a1aa" fontSize={9}>{item.label}</text>
                        <text x={cx + 55} y={popY + 23 + j * 13} textAnchor="end" fill="#e4e4e7" fontSize={9} fontWeight={600}>{item.value} ({yearTotal > 0 ? ((item.value / yearTotal) * 100).toFixed(0) : '0'}%)</text>
                      </g>
                    ))}
                  </motion.g>
                );
              })()}
            </AnimatePresence>

            {/* Legend for trend line */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <line x1={40} y1={15} x2={60} y2={15} stroke="#10B981" strokeWidth={2} strokeDasharray="4 3" />
              <text x={65} y={18} fill="#10B981" fontSize={9} fontWeight={500}>Clean Audit Trend</text>
            </motion.g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function AGASAlert() {
  const { setActiveModule } = useNavigationStore();
  const [muniSortBy, setMuniSortBy] = useState<'name' | 'clean'>('clean');

  const total = AUDIT_OUTCOMES_DISTRIBUTION.reduce((sum, d) => sum + d.value, 0);
  const cleanAuditRate = ((AUDIT_OUTCOMES_DISTRIBUTION.find(d => d.name === 'Clean')?.value ?? 0) / total * 100);

  const sortedMunis = [...MOCK_MUNICIPALITIES].sort((a, b) => {
    const order: Record<string, number> = { Clean: 0, Unqualified: 1, Qualified: 2, Adverse: 3, Disclaimer: 4 };
    return (order[a.auditOutcome ?? ''] ?? 5) - (order[b.auditOutcome ?? ''] ?? 5);
  });

  const sortedMuniAudits = useMemo(() => {
    const data = [...MUNI_AUDIT_OUTCOMES];
    if (muniSortBy === 'name') {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    }
    return data.sort((a, b) => b.Clean - a.Clean);
  }, [muniSortBy]);

  // Calculate trend badge for 5-year trajectory
  const cleanTrend = FIVE_YEAR_TREND[FIVE_YEAR_TREND.length - 1].Clean - FIVE_YEAR_TREND[0].Clean;
  const trendBadge = cleanTrend > 0
    ? { label: 'Improving', color: '#10B981', icon: TrendingUp }
    : cleanTrend === 0
      ? { label: 'Stable', color: '#3B82F6', icon: Minus }
      : { label: 'Declining', color: '#EF4444', icon: TrendingDown };

  // Total irregular expenditure for banner
  const totalIrregularExpenditure = MATERIAL_IRREGULARITIES.reduce((sum, mi) => sum + mi.amount, 0);

  // Summary stat gauge percentages
  const statGauges = [
    { label: 'Total Audits', pct: Math.round((total / 300) * 100) },
    { label: 'Improving', pct: Math.round((38 / total) * 100) },
    { label: 'Regressed', pct: Math.round((77 / total) * 100) },
    { label: 'Clean Audit Rate', pct: Math.round(cleanAuditRate) },
  ];

  // Animated count-up for trajectory cards
  const improvingCount = useCountUp(38, 1000, 300);
  const stableCount = useCountUp(142, 1000, 400);
  const regressedCount = useCountUp(77, 1000, 500);

  const trajectoryAnimatedCounts: Record<string, number> = {
    'Improving': improvingCount,
    'Stable': stableCount,
    'Regressed': regressedCount,
  };

  return (
    <div className="space-y-5">
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
              <ShieldCheck className="size-5" style={{ color: ACCENT_TO }} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ border: `1px solid ${ACCENT_TO}` }}
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
              AGASAlert
            </h1>
            <p className="text-xs text-zinc-400">Auditor-General audit outcome intelligence</p>
          </div>
          <Badge className="badge-premium badge-phase2 ml-2">Phase 2</Badge>
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
            <BarChart3 className="size-3 mr-1" />Audit Intelligence
          </Badge>
        </div>
      </motion.div>

      {/* ── Quick Actions Bar ──────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm gap-1.5"
          >
            <Download className="size-3.5" style={{ color: ACCENT_FROM }} />
            Export Audit Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm gap-1.5"
          >
            <ExternalLink className="size-3.5" style={{ color: ACCENT_TO }} />
            View Full AGSA Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm gap-1.5"
          >
            <GitCompareArrows className="size-3.5" style={{ color: '#10B981' }} />
            Compare Years
          </Button>
        </div>
      </motion.div>

      {/* ── Enhanced Summary Stats Row with Gauge Rings + Sparklines ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Audits', value: total, icon: FileCheck, color: ACCENT_FROM },
          { label: 'Improving', value: 38, icon: TrendingUp, color: '#10B981' },
          { label: 'Regressed', value: 77, icon: TrendingDown, color: '#EF4444' },
          { label: 'Clean Audit Rate', value: cleanAuditRate.toFixed(1), icon: ShieldCheck, color: ACCENT_TO, isPercent: true },
        ].map((stat, idx) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.03, y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: 0.8 }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>
                      {stat.isPercent ? `${stat.value}%` : stat.value}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-center">
                    {/* SVG Gauge Ring around icon */}
                    <GaugeRing percentage={statGauges[idx].pct} color={stat.color} size={44} strokeWidth={2.5} />
                    <div className="absolute flex size-8 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                      <stat.icon className="size-3.5" style={{ color: stat.color }} />
                      {/* Pulsing animation for Improving card icon */}
                      {stat.label === 'Improving' && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{ border: `1px solid ${stat.color}` }}
                          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Micro Sparkline trend at bottom */}
                <div className="mt-2 flex items-end justify-between">
                  <MiniSparkline data={SPARKLINE_DATA[stat.label] ?? []} color={stat.color} width={70} height={18} />
                  <span className="text-[9px] text-zinc-500 tabular-nums">
                    {(() => {
                      const sd = SPARKLINE_DATA[stat.label] ?? [];
                      if (sd.length < 2) return '';
                      const diff = sd[sd.length - 1] - sd[0];
                      const isUp = diff > 0;
                      return (
                        <span style={{ color: isUp ? '#10B981' : '#EF4444' }}>
                          {isUp ? '+' : ''}{typeof stat.value === 'string' ? diff.toFixed(1) : diff}
                        </span>
                      );
                    })()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── National Audit Dashboard + Trajectory ────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart with outer ring showing clean audit rate */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">National Audit Dashboard</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">2023/24 MFMA audit outcomes — {total} municipalities</p>
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
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13,18,36,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                        }}
                        formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Animated SVG ring showing clean audit rate as outer ring */}
                  <svg className="absolute inset-0" width="180" height="180" viewBox="0 0 180 180">
                    <CleanAuditOuterRing percentage={cleanAuditRate} radius={80} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-zinc-100 tabular-nums">{total}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</span>
                    <span className="text-[9px] font-bold tabular-nums mt-0.5" style={{ color: ACCENT_TO }}>{cleanAuditRate.toFixed(1)}% Clean</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {AUDIT_OUTCOMES_DISTRIBUTION.map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      className="flex items-center gap-2 rounded px-1 py-0.5 transition-colors"
                    >
                      <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-zinc-300 flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-zinc-200 tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-zinc-400 tabular-nums w-10 text-right">{((item.value / total) * 100).toFixed(0)}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audit Trajectory — Enhanced with hover glow, animated count-up, pronounced gradients */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Audit Trajectory</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Municipality audit outcome movement year-on-year</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {AUDIT_TRAJECTORY.map((t) => (
                  <motion.div
                    key={t.classification}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 20px ${t.color}20, 0 0 40px ${t.color}08`,
                    }}
                    className="rounded-lg border border-white/[0.06] p-4 transition-all relative overflow-hidden group"
                    style={{ borderLeftWidth: '3px', borderLeftColor: t.color }}
                  >
                    {/* More pronounced gradient background */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{ background: `linear-gradient(135deg, ${t.color}, transparent 60%)` }} />
                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse at top left, ${t.color}10, transparent 70%)` }} />
                    <div className="relative flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-md" style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                          <t.Icon className="size-4" style={{ color: t.color }} />
                        </div>
                        <span className="text-sm font-semibold text-zinc-200">{t.classification}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.trend === 'up' && <ArrowUpRight className="size-4" style={{ color: t.color }} />}
                        {t.trend === 'down' && <ArrowDownRight className="size-4" style={{ color: t.color }} />}
                        {/* Animated count-up number */}
                        <span className="text-2xl font-bold tabular-nums" style={{ color: t.color }}>
                          {trajectoryAnimatedCounts[t.classification] ?? t.count}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden progress-premium">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.count / total) * 100}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="progress-bar h-full rounded-full"
                        style={{ '--progress-from': t.color, '--progress-to': `${t.color}88` } as React.CSSProperties}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">{((t.count / total) * 100).toFixed(1)}% of municipalities</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── 5-Year Audit Outcome Trajectory ──────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4" style={{ color: ACCENT_FROM }} />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">5-Year Audit Outcome Trajectory</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Stacked audit outcomes from 2019/20 to 2023/24</p>
                </div>
              </div>
              <Badge
                className="text-[10px] h-5 px-2 font-semibold"
                style={{ background: `${trendBadge.color}15`, color: trendBadge.color, borderColor: `${trendBadge.color}25` }}
              >
                <trendBadge.icon className="size-3 mr-1" />
                {trendBadge.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FIVE_YEAR_TREND} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<AuditTrendTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Clean" stackId="a" fill={AUDIT_OUTCOME_COLORS.Clean} name="Clean" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Unqualified" stackId="a" fill={AUDIT_OUTCOME_COLORS.Unqualified} name="Unqualified" />
                  <Bar dataKey="Qualified" stackId="a" fill={AUDIT_OUTCOME_COLORS.Qualified} name="Qualified" />
                  <Bar dataKey="Adverse" stackId="a" fill={AUDIT_OUTCOME_COLORS.Adverse} name="Adverse" />
                  <Bar dataKey="Disclaimer" stackId="a" fill={AUDIT_OUTCOME_COLORS.Disclaimer} name="Disclaimer" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Audit Outcome Timeline Visualization (NEW) ──────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <AuditOutcomeTimeline />
      </motion.div>

      {/* ── Municipality Audit Outcomes ──────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, ${ACCENT_FROM})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4" style={{ color: ACCENT_TO }} />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Municipality Audit Outcomes</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Audit opinions by municipality — click to view MuniLens profile</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 text-[10px] px-2',
                    muniSortBy === 'name'
                      ? 'border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#3B82F6]'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-400'
                  )}
                  onClick={() => setMuniSortBy('name')}
                >
                  By Name
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-6 text-[10px] px-2',
                    muniSortBy === 'clean'
                      ? 'border-[#10B981]/40 bg-[#10B981]/15 text-[#10B981]'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-400'
                  )}
                  onClick={() => setMuniSortBy('clean')}
                >
                  By Clean Audit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedMuniAudits} layout="vertical" margin={{ top: 0, right: 20, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={95} />
                  <Tooltip content={<AuditTrendTooltip />} />
                  <Bar dataKey="Clean" stackId="a" fill={AUDIT_OUTCOME_COLORS.Clean} name="Clean" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Unqualified" stackId="a" fill={AUDIT_OUTCOME_COLORS.Unqualified} name="Unqualified" />
                  <Bar dataKey="Qualified" stackId="a" fill={AUDIT_OUTCOME_COLORS.Qualified} name="Qualified" />
                  <Bar dataKey="Adverse" stackId="a" fill={AUDIT_OUTCOME_COLORS.Adverse} name="Adverse" />
                  <Bar dataKey="Disclaimer" stackId="a" fill={AUDIT_OUTCOME_COLORS.Disclaimer} name="Disclaimer" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Municipality click links */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {sortedMuniAudits.map((muni) => {
                const dominantOutcome = Object.entries(AUDIT_OUTCOME_COLORS).reduce((best, [key]) => {
                  const val = muni[key as keyof typeof muni];
                  if (typeof val === 'number' && val > (muni[best as keyof typeof muni] as number)) return key;
                  return best;
                }, 'Clean');
                return (
                  <motion.button
                    key={muni.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModule('munilens')}
                    className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-2 text-left hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="size-2 rounded-sm shrink-0" style={{ backgroundColor: AUDIT_OUTCOME_COLORS[dominantOutcome] }} />
                    <span className="text-[11px] text-zinc-300 truncate">{muni.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Material Irregularity Tracker — Premium Polish ──── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, #EF4444)` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4" style={{ color: ACCENT_TO }} />
              <CardTitle className="text-sm font-semibold text-zinc-200">Material Irregularity Tracker</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Flagged material irregularities from AGSA reports</p>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Total Irregular Expenditure Banner */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/[0.08] to-orange-500/[0.05] p-3 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex size-8 items-center justify-center rounded-lg bg-red-500/15"
                  animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 12px rgba(239,68,68,0.3)', '0 0 0px rgba(239,68,68,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="size-4 text-red-400" />
                </motion.div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-red-300/70">Total Irregular Expenditure</p>
                  <p className="text-lg font-extrabold tabular-nums text-red-400">{formatZAR(totalIrregularExpenditure)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] h-5 px-2 border-red-500/30 bg-red-500/10 text-red-400">
                  {MATERIAL_IRREGULARITIES.length} Flagged
                </Badge>
                <Badge variant="outline" className="text-[9px] h-5 px-2 border-orange-500/30 bg-orange-500/10 text-orange-400">
                  {MATERIAL_IRREGULARITIES.filter(mi => mi.severity === 'critical').length} Critical
                </Badge>
              </div>
            </motion.div>

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2.5">
                {MATERIAL_IRREGULARITIES.map((mi, i) => {
                  const sevColor = getSeverityColor(mi.severity);
                  const statusStyle = getMIStatusStyle(mi.status);
                  return (
                    <motion.div
                      key={mi.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      whileHover={{
                        scale: 1.008,
                        borderColor: `${sevColor}30`,
                        boxShadow: `0 0 16px ${sevColor}10, 0 0 32px ${sevColor}06`,
                      }}
                      className="rounded-lg border border-white/[0.06] p-4 transition-all cursor-pointer relative overflow-hidden group"
                      style={{ borderLeftWidth: '3px', borderLeftColor: sevColor }}
                    >
                      <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${sevColor}, transparent)` }} />
                      {/* Enhanced severity pulse for critical items */}
                      {mi.severity === 'critical' && (
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-[1px]"
                          style={{ background: `linear-gradient(90deg, transparent, ${sevColor}, transparent)` }}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className="relative">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            {/* Enhanced severity pulse for critical */}
                            {mi.severity === 'critical' && (
                              <motion.div
                                className="relative shrink-0"
                              >
                                <motion.div
                                  className="size-2.5 rounded-full bg-red-500"
                                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                                  transition={{ duration: 1.2, repeat: Infinity }}
                                />
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-red-500/30"
                                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                              </motion.div>
                            )}
                            <Badge variant="outline" className="text-[9px] h-5 px-1.5 shrink-0" style={{ background: `${ACCENT_TO}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>{mi.id}</Badge>
                            <span className="text-sm font-semibold text-zinc-200">{mi.municipality}</span>
                          </div>
                          <span className="text-lg font-extrabold tabular-nums shrink-0" style={{ color: sevColor }}>
                            {formatZAR(mi.amount)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">{mi.description}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] h-5 px-2"
                            style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
                          >
                            {mi.status}
                          </Badge>
                          <span className="text-[10px] text-zinc-400">{formatSADate(mi.detectedAt)}</span>
                          {/* Investigate button with glow on hover */}
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              'h-6 text-[10px] px-2 ml-auto border-white/[0.08] bg-white/[0.03] gap-1',
                              'hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400',
                              'transition-all duration-200',
                              'hover:shadow-[0_0_8px_rgba(245,158,11,0.2),0_0_16px_rgba(245,158,11,0.1)]'
                            )}
                          >
                            <Search className="size-3" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Municipality Audit Grades + Clean Audit Probability ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit Grades Table — Enhanced with alternating gradients, hover glow, left border colors */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Municipality Audit Grades</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Sorted by audit outcome</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(245,158,11,0.06))' }}>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold">Municipality</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold">Audit Outcome</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold text-right">FHS</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold text-right">Cash Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMunis.map((m, idx) => {
                      const outcomeColors: Record<string, string> = { Clean: '#10B981', Unqualified: '#3B82F6', Qualified: '#F59E0B', Adverse: '#F97316', Disclaimer: '#EF4444' };
                      const rowColor = outcomeColors[m.auditOutcome ?? ''] ?? '#64748B';
                      return (
                        <TableRow
                          key={m.id}
                          className={cn(
                            'border-white/[0.04] transition-all duration-200 cursor-pointer group',
                          )}
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: rowColor,
                            background: idx % 2 === 0
                              ? `linear-gradient(90deg, ${rowColor}06, transparent 40%)`
                              : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = `linear-gradient(90deg, ${rowColor}12, transparent 60%)`;
                            (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 8px -3px ${rowColor}20, 0 0 12px ${rowColor}08`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = idx % 2 === 0
                              ? `linear-gradient(90deg, ${rowColor}06, transparent 40%)`
                              : 'transparent';
                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                          }}
                          onClick={() => setActiveModule('munilens')}
                        >
                          <TableCell className="text-xs font-medium text-zinc-200">{m.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] h-5 px-1.5" style={{ backgroundColor: `${rowColor}15`, color: rowColor, borderColor: `${rowColor}25` }}>
                              {m.auditOutcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: (m.financialHealthScore ?? 0) >= 50 ? '#10B981' : '#EF4444' }}>
                            {m.financialHealthScore}
                          </TableCell>
                          <TableCell className="text-right text-xs text-zinc-300 tabular-nums">{m.cashCoverageDays}d</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clean Audit Probability — Enhanced with top 3 crown, category badges, gradient glow */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, ${ACCENT_FROM})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="size-4" style={{ color: ACCENT_TO }} />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Clean Audit Probability</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">ML model prediction for 2024/25 audit cycle</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3">
                  {/* Most Likely to Achieve Clean Audit callout */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Trophy className="size-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Most Likely to Achieve Clean Audit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {CLEAN_AUDIT_PROBS.sort((a, b) => b.probability - a.probability).slice(0, 3).map((item, rank) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <Crown className={cn('size-3', rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-zinc-300' : 'text-amber-700')} />
                          <span className="text-[11px] font-semibold text-zinc-200">{item.name}</span>
                          <span className="text-[10px] font-bold tabular-nums text-emerald-400">{item.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {CLEAN_AUDIT_PROBS.sort((a, b) => b.probability - a.probability).map((item, i) => {
                    const probColor = getProbColor(item.probability);
                    const category = getProbCategory(item.probability);
                    const isTop3 = i < 3;
                    return (
                      <motion.div
                        key={item.name}
                        whileHover={{
                          scale: 1.01,
                          borderColor: `${probColor}30`,
                          boxShadow: `0 0 12px ${probColor}10, 0 0 24px ${probColor}06`,
                        }}
                        className={cn(
                          'rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden group',
                          isTop3 && 'border-emerald-500/20 bg-emerald-500/[0.03]'
                        )}
                        style={{ borderLeftWidth: '3px', borderLeftColor: probColor }}
                      >
                        {isTop3 && (
                          <div className="absolute top-1.5 right-1.5">
                            <motion.div
                              className="size-2 rounded-full bg-emerald-400"
                              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {isTop3 && <Crown className={cn('size-3.5', i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : 'text-amber-700')} />}
                            {!isTop3 && <FileCheck className="size-3 text-zinc-500" />}
                            <span className="text-xs font-semibold text-zinc-200">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[8px] h-4 px-1.5 font-semibold"
                              style={{ background: category.bg, color: category.color, borderColor: category.border }}
                            >
                              {category.label}
                            </Badge>
                            <span className="text-xs font-bold tabular-nums" style={{ color: probColor }}>
                              {item.probability}%
                            </span>
                          </div>
                        </div>
                        <div className="progress-premium h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.probability}%` }}
                            transition={{ delay: i * 0.05, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            className="progress-bar h-full rounded-full"
                            style={{ '--progress-from': probColor, '--progress-to': `${probColor}88` } as React.CSSProperties}
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[10px] text-zinc-400">Current: </span>
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1" style={{ backgroundColor: `${probColor}10`, color: probColor, borderColor: `${probColor}20` }}>
                            {item.currentOutcome}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
