'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import {
  Leaf,
  Droplets,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Minus,
  Building2,
  CloudRain,
  Sun,
  Snowflake,
  Flower2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  Waves,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatNumber, formatPercent } from '@/lib/formatters';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, accentColor = '#0D9488' }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accentColor?: string;
}) {
  return (
    <motion.div variants={itemSlideUp} className="flex items-center gap-3 mb-1">
      <div className="w-1 h-10 rounded-full shrink-0" style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)` }} />
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color: accentColor }} />
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ── CVI Gauge Component ─────────────────────────────────────────────────────

function CVIGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getGaugeColor = (v: number) => {
    if (v >= 70) return '#EF4444';
    if (v >= 55) return '#F97316';
    if (v >= 40) return '#F59E0B';
    if (v >= 25) return '#3B82F6';
    return '#10B981';
  };

  const color = getGaugeColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">CVI</span>
      </div>
    </div>
  );
}

// ── Risk Level Badge ────────────────────────────────────────────────────────

function RiskLevelBadge({ score }: { score: number }) {
  const getLevel = (v: number) => {
    if (v >= 70) return { label: 'Critical', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
    if (v >= 55) return { label: 'Very High', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
    if (v >= 40) return { label: 'High', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    if (v >= 25) return { label: 'Moderate', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    return { label: 'Low', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  };
  const level = getLevel(score);
  return (
    <Badge className={cn('text-[10px] h-5 px-2 border font-semibold', level.color)}>
      {level.label}
    </Badge>
  );
}

// ── CVI Dimensions ──────────────────────────────────────────────────────────

const CVI_DIMENSIONS = ['Drought Risk', 'Flood Risk', 'Heat Stress', 'Water Stress', 'Food Security', 'Infrastructure Exposure'];

const CVI_DATA: Record<string, number[]> = {
  EKU: [65, 45, 72, 58, 52, 68],
  MAN: [58, 52, 65, 62, 48, 55],
  BUF: [62, 68, 58, 65, 55, 60],
  MSU: [72, 58, 68, 70, 62, 65],
  ETH: [55, 75, 62, 68, 58, 72],
  JHB: [48, 42, 55, 45, 38, 52],
  CPT: [72, 28, 68, 75, 42, 48],
  TSH: [45, 38, 52, 48, 35, 45],
  NMB: [65, 55, 60, 62, 50, 58],
  RUST: [55, 42, 58, 52, 45, 50],
  SOL: [68, 35, 62, 58, 48, 55],
  STE: [48, 25, 45, 52, 30, 38],
};

// ── Dam Level Data ──────────────────────────────────────────────────────────

const DAM_LEVELS = [
  { name: 'Vaal Dam', province: 'Gauteng', current: 58.2, longTermAvg: 72.5, capacity: 100, trend: 'declining' as const },
  { name: 'Theewaterskloof', province: 'Western Cape', current: 72.8, longTermAvg: 68.2, capacity: 100, trend: 'stable' as const },
  { name: 'Inanda Dam', province: 'KwaZulu-Natal', current: 65.4, longTermAvg: 78.5, capacity: 100, trend: 'declining' as const },
  { name: 'Gariep Dam', province: 'Eastern Cape', current: 48.2, longTermAvg: 65.8, capacity: 100, trend: 'declining' as const },
  { name: 'Vanderkloof Dam', province: 'Northern Cape', current: 52.5, longTermAvg: 68.2, capacity: 100, trend: 'declining' as const },
  { name: 'Midmar Dam', province: 'KwaZulu-Natal', current: 82.1, longTermAvg: 78.5, capacity: 100, trend: 'stable' as const },
  { name: 'Sterkfontein Dam', province: 'Free State', current: 92.5, longTermAvg: 88.2, capacity: 100, trend: 'rising' as const },
  { name: 'Pongolapoort Dam', province: 'KwaZulu-Natal', current: 45.8, longTermAvg: 62.5, capacity: 100, trend: 'declining' as const },
];

const DAM_TREND_WEEKLY = [
  { week: 'W1', date: '06 Jan', vaal: 62, theewaters: 70, gariep: 52 },
  { week: 'W2', date: '13 Jan', vaal: 61, theewaters: 71, gariep: 51 },
  { week: 'W3', date: '20 Jan', vaal: 60, theewaters: 72, gariep: 50 },
  { week: 'W4', date: '27 Jan', vaal: 59, theewaters: 73, gariep: 49 },
  { week: 'W5', date: '03 Feb', vaal: 58, theewaters: 73, gariep: 49 },
  { week: 'W6', date: '10 Feb', vaal: 58, theewaters: 72, gariep: 48 },
  { week: 'W7', date: '17 Feb', vaal: 57, theewaters: 71, gariep: 48 },
  { week: 'W8', date: '24 Feb', vaal: 58, theewaters: 73, gariep: 48 },
];

// ── Top 20 Most Vulnerable ──────────────────────────────────────────────────

const TOP_VULNERABLE = [
  ...MOCK_MUNICIPALITIES.map((m) => ({
    name: m.name,
    code: m.code,
    province: m.province,
    cvi: m.climateRiskScore ?? 0,
    droughtRisk: 40 + Math.random() * 40,
    floodRisk: 20 + Math.random() * 50,
    waterStress: 30 + Math.random() * 45,
    heatStress: 25 + Math.random() * 50,
    foodSecurity: 20 + Math.random() * 55,
    infraExposure: 15 + Math.random() * 60,
  })),
].sort((a, b) => b.cvi - a.cvi).slice(0, 20);

// ── Climate Alerts ──────────────────────────────────────────────────────────

const CLIMATE_ALERTS = [
  { id: 1, type: 'Drought Warning', severity: 'Critical' as const, province: 'Northern Cape', municipality: 'Sol Plaatje', description: 'Prolonged dry spell exceeding 180 days. Dam levels below 30% capacity. Emergency water restrictions in effect.', timestamp: '2 hours ago', icon: Flame, color: '#EF4444' },
  { id: 2, type: 'Flood Risk', severity: 'High' as const, province: 'KwaZulu-Natal', municipality: 'eThekwini', description: 'Heavy rainfall forecast (>150mm in 48hrs) for South Coast. Flash flood risk elevated for low-lying areas.', timestamp: '5 hours ago', icon: CloudRain, color: '#F97316' },
  { id: 3, type: 'Water Crisis', severity: 'Critical' as const, province: 'Eastern Cape', municipality: 'Buffalo City', description: 'Municipal water supply at critical levels. Reservoir below 15%. Stage 6 water restrictions recommended.', timestamp: '8 hours ago', icon: Droplets, color: '#EF4444' },
  { id: 4, type: 'Heat Advisory', severity: 'Moderate' as const, province: 'Limpopo', municipality: 'Polokwane', description: 'Temperatures expected to exceed 42°C for 5 consecutive days. Heatwave alert for vulnerable populations.', timestamp: '12 hours ago', icon: Thermometer, color: '#F59E0B' },
  { id: 5, type: 'Dam Level Critical', severity: 'High' as const, province: 'Free State', municipality: 'Mangaung', description: 'Rustfontein Dam at 18.5% — approaching dead storage level. Emergency water augmentation plan activated.', timestamp: '1 day ago', icon: Waves, color: '#F97316' },
];

// ── Seasonal Outlook ────────────────────────────────────────────────────────

const SEASONAL_OUTLOOK = [
  { season: 'Summer', icon: Sun, tempRange: '25°C – 38°C', rainfall: 'Above Average', risk: 'Flash flooding in KZN & Eastern Cape lowlands', color: '#F59E0B', gradient: 'from-amber-500/20 to-orange-500/10' },
  { season: 'Autumn', icon: CloudRain, tempRange: '15°C – 28°C', rainfall: 'Normal Average', risk: 'Late-season drought risk in Northern Cape', color: '#F97316', gradient: 'from-orange-500/20 to-amber-500/10' },
  { season: 'Winter', icon: Snowflake, tempRange: '2°C – 22°C', rainfall: 'Below Average', risk: 'Water scarcity in Western Cape, frost damage to crops', color: '#3B82F6', gradient: 'from-blue-500/20 to-cyan-500/10' },
  { season: 'Spring', icon: Flower2, tempRange: '12°C – 30°C', rainfall: 'Normal Average', risk: 'Wildfire risk in Western Cape, early heat waves in Limpopo', color: '#10B981', gradient: 'from-emerald-500/20 to-green-500/10' },
];

// ── Dam Status Badge ────────────────────────────────────────────────────────

function DamStatusBadge({ trend }: { trend: string }) {
  if (trend === 'rising') return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] h-4 px-1.5">Rising</Badge>;
  if (trend === 'stable') return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-[9px] h-4 px-1.5">Stable</Badge>;
  return <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[9px] h-4 px-1.5">Falling</Badge>;
}

// ── Dam Trend Icon ──────────────────────────────────────────────────────────

function DamTrendIcon({ trend }: { trend: string }) {
  if (trend === 'rising') return <TrendingUp className="size-3 text-emerald-400" />;
  if (trend === 'stable') return <Minus className="size-3 text-blue-400" />;
  return <TrendingDown className="size-3 text-red-400" />;
}

// ── Custom Tooltip for Radar ────────────────────────────────────────────────

function RadarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1224]/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-zinc-100 tabular-nums">{payload[0].value}<span className="text-zinc-500 text-[10px] ml-1">/ 100</span></p>
    </div>
  );
}

// ── Custom Tooltip for Dam Trend ────────────────────────────────────────────

function DamTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const dataPoint = DAM_TREND_WEEKLY.find(d => d.week === label);
  return (
    <div className="bg-[#0d1224]/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2.5 shadow-xl min-w-[140px]">
      <p className="text-[10px] text-zinc-500 mb-1.5">{dataPoint?.date ?? label} · {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
          <span className="text-zinc-400">{p.name}</span>
          <span className="font-semibold tabular-nums" style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-600">Critical Threshold</span>
          <span className="text-red-400/70">50%</span>
        </div>
      </div>
    </div>
  );
}

// ── Severity Style Helper ───────────────────────────────────────────────────

function getAlertSeverityStyle(severity: 'Critical' | 'High' | 'Moderate') {
  if (severity === 'Critical') return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/30' };
  if (severity === 'High') return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
  return { bg: 'bg-amber-500/8', border: 'border-amber-500/15', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function CarbonLens() {
  const [selectedMuni, setSelectedMuni] = useState('EKU');
  const [muniSearch, setMuniSearch] = useState('');
  const [vulnPage, setVulnPage] = useState(0);
  const [alertIndex, setAlertIndex] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Auto-rotating carousel for climate alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((prev) => (prev + 1) % CLIMATE_ALERTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const radarData = CVI_DIMENSIONS.map((dim, i) => ({
    dimension: dim,
    score: CVI_DATA[selectedMuni]?.[i] ?? 50,
  }));

  const selectedMuniData = MOCK_MUNICIPALITIES.find((m) => m.code === selectedMuni);
  const cviScore = selectedMuniData?.climateRiskScore ?? 0;

  const filteredMunicipalities = MOCK_MUNICIPALITIES.filter((m) =>
    m.name.toLowerCase().includes(muniSearch.toLowerCase()) ||
    m.code.toLowerCase().includes(muniSearch.toLowerCase())
  );

  const totalPages = Math.ceil(TOP_VULNERABLE.length / ITEMS_PER_PAGE);
  const paginatedVuln = TOP_VULNERABLE.slice(vulnPage * ITEMS_PER_PAGE, (vulnPage + 1) * ITEMS_PER_PAGE);

  const getScoreColor = (v: number) => {
    if (v >= 70) return '#EF4444';
    if (v >= 55) return '#F97316';
    if (v >= 40) return '#F59E0B';
    if (v >= 25) return '#3B82F6';
    return '#10B981';
  };

  const getScoreColorClass = (v: number) => {
    if (v >= 70) return 'text-red-400';
    if (v >= 55) return 'text-orange-400';
    if (v >= 40) return 'text-amber-400';
    if (v >= 25) return 'text-blue-400';
    return 'text-emerald-400';
  };

  const getProgressGradient = (v: number) => {
    if (v >= 70) return 'from-red-500 to-red-600';
    if (v >= 55) return 'from-orange-500 to-orange-600';
    if (v >= 40) return 'from-amber-400 to-amber-500';
    if (v >= 25) return 'from-blue-400 to-blue-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const currentAlert = CLIMATE_ALERTS[alertIndex];
  const alertStyle = getAlertSeverityStyle(currentAlert.severity);

  return (
    <div className="space-y-6 bg-grid-pattern min-h-full">
      {/* ── Module Header ──────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg, #0D9488, #059669)' }} />
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 relative">
            <Leaf className="size-5 text-teal-400" />
            <div className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-teal-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(20, 184, 166, 0.5)' }} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">CarbonLens</span>
            </h1>
            <p className="text-xs text-zinc-500">Climate vulnerability and environmental risk intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="badge-premium badge-phase3 text-[9px] h-5 px-2">Phase 3</Badge>
            <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/25 text-[9px] h-5 px-2">
              <CloudRain className="size-3 mr-1" />
              Climate Vulnerability
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Climate Vulnerability Index ─────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Radar + Selector */}
        <motion.div variants={itemFadeIn} className="lg:col-span-2">
          <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <SectionHeader icon={ShieldAlert} title="Climate Vulnerability Index (CVI)" subtitle="Multi-dimensional vulnerability assessment" accentColor="#0D9488" />
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search municipality..."
                    value={muniSearch}
                    onChange={(e) => setMuniSearch(e.target.value)}
                    className="w-[160px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]"
                  />
                  <Select value={selectedMuni} onValueChange={setSelectedMuni}>
                    <SelectTrigger className="w-[160px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full" style={{ backgroundColor: getScoreColor(cviScore) }} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                      {filteredMunicipalities.map((m) => (
                        <SelectItem key={m.code} value={m.code} className="text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: getScoreColor(m.climateRiskScore ?? 0) }} />
                            {m.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
                      <Radar name="CVI Score" dataKey="score" stroke="#0D9488" fill="#0D9488" fillOpacity={0.12} strokeWidth={3} dot={{ r: 4, fill: '#0D9488', stroke: '#0D9488', strokeWidth: 2 }} />
                      <Tooltip content={<RadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <CVIGauge score={cviScore} size={130} />
                  <RiskLevelBadge score={cviScore} />
                  <p className="text-[10px] text-zinc-500 text-center">{selectedMuniData?.name} · {selectedMuniData?.province}</p>
                </div>
              </div>

              {/* 6 Dimension Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                {CVI_DIMENSIONS.map((dim, i) => {
                  const score = CVI_DATA[selectedMuni]?.[i] ?? 50;
                  return (
                    <motion.div
                      key={dim}
                      variants={staggerChild}
                      className="glass-depth rounded-lg p-2.5 text-center space-y-1.5"
                    >
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider truncate">{dim.replace(' Risk', '').replace(' Stress', '').replace(' Exposure', '').replace(' Security', '')}</p>
                      <p className={cn('text-lg font-bold tabular-nums', getScoreColorClass(score))}>{score}</p>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full bg-gradient-to-r', getProgressGradient(score))}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Climate Alerts Panel (NEW) */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <SectionHeader icon={AlertTriangle} title="Climate Alerts" subtitle="Active environmental warnings" accentColor="#F97316" />
                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[9px] h-5 px-1.5 animate-pulse">{CLIMATE_ALERTS.length} Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative h-[260px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAlert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className={cn('rounded-lg border p-4 h-full', alertStyle.bg, alertStyle.border)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', alertStyle.bg)} style={{ border: `1px solid ${currentAlert.color}30` }}>
                        <currentAlert.icon className="size-4" style={{ color: currentAlert.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge className={cn('text-[9px] h-4 px-1.5 border font-semibold', alertStyle.badge)}>{currentAlert.severity}</Badge>
                          <span className="text-[9px] text-zinc-600">{currentAlert.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200">{currentAlert.type}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{currentAlert.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Building2 className="size-3" />
                        {currentAlert.municipality}, {currentAlert.province}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Alert Dots Navigation */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {CLIMATE_ALERTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setAlertIndex(i)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === alertIndex ? 'w-4 h-1.5 bg-teal-400' : 'w-1.5 h-1.5 bg-white/10 hover:bg-white/20'
                    )}
                  />
                ))}
              </div>

              <button className="flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 transition-colors mt-3 w-full justify-center">
                View All Alerts <ArrowRight className="size-3" />
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Dam Level Tracker ───────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Trend Chart */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <SectionHeader icon={Droplets} title="Dam Level Trends" subtitle="8-week trend with critical threshold" accentColor="#3B82F6" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DAM_TREND_WEEKLY} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="vaalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="twGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="garGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip content={<DamTrendTooltip />} />
                    <ReferenceLine y={50} stroke="#EF444440" strokeDasharray="6 4" label={{ value: 'Critical 50%', position: 'insideTopRight', fill: '#EF4444', fontSize: 9, offset: 5 }} />
                    <Area type="monotone" dataKey="vaal" stroke="#EF4444" strokeWidth={2} fill="url(#vaalGrad)" dot={false} name="Vaal Dam" />
                    <Area type="monotone" dataKey="theewaters" stroke="#10B981" strokeWidth={2} fill="url(#twGrad)" dot={false} name="Theewaterskloof" />
                    <Area type="monotone" dataKey="gariep" stroke="#F59E0B" strokeWidth={2} fill="url(#garGrad)" dot={false} name="Gariep Dam" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dam Level Cards */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Waves} title="Major Dam Levels" subtitle="Current vs long-term average" accentColor="#3B82F6" />
                <div className="flex items-center gap-1.5">
                  <DamStatusBadge trend="rising" />
                  <DamStatusBadge trend="stable" />
                  <DamStatusBadge trend="declining" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[240px]">
                <div className="space-y-2">
                  {DAM_LEVELS.sort((a, b) => a.current - b.current).map((dam) => {
                    const diff = dam.current - dam.longTermAvg;
                    const isBelow = diff < 0;
                    const barColor = dam.current >= 70 ? 'from-emerald-400 to-emerald-500' : dam.current >= 50 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500';
                    return (
                      <motion.div
                        key={dam.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group rounded-lg border border-white/[0.06] p-2.5 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <DamTrendIcon trend={dam.trend} />
                          <span className="text-[11px] font-medium text-zinc-300 flex-1 truncate">{dam.name}</span>
                          <DamStatusBadge trend={dam.trend} />
                          <span className={cn('text-sm font-bold tabular-nums', dam.current >= 70 ? 'text-emerald-400' : dam.current >= 50 ? 'text-amber-400' : 'text-red-400')}>
                            {dam.current}%
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden mb-1">
                          {/* Long-term average marker */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10" style={{ left: `${dam.longTermAvg}%` }} title={`Avg: ${dam.longTermAvg}%`} />
                          <motion.div
                            className={cn('h-full rounded-full bg-gradient-to-r', barColor)}
                            initial={{ width: 0 }}
                            animate={{ width: `${dam.current}%` }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-zinc-600">Avg: {dam.longTermAvg}%</span>
                          <span className={cn('tabular-nums', isBelow ? 'text-red-400/70' : 'text-emerald-400/70')}>
                            {isBelow ? '' : '+'}{diff.toFixed(1)}pp
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
      </motion.div>

      {/* ── Seasonal Outlook (NEW) ──────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show">
        <SectionHeader icon={Sun} title="Seasonal Climate Outlook" subtitle="South Africa 2026 forecast and risk assessment" accentColor="#0D9488" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          {SEASONAL_OUTLOOK.map((season, i) => {
            const isCurrent = i === 0; // Mock: Summer is current season
            return (
              <motion.div
                key={season.season}
                variants={staggerChild}
                className={cn(
                  'glass-card-v2 rounded-xl p-4 transition-all duration-300 cursor-default group',
                  isCurrent && 'ring-1 ring-teal-400/30 border-teal-400/20'
                )}
                style={isCurrent ? { boxShadow: '0 0 20px rgba(13, 148, 136, 0.08), 0 0 40px rgba(13, 148, 136, 0.04)' } : {}}
              >
                {/* Season Color Accent Line */}
                <div className="h-0.5 rounded-full mb-3 -mx-4 -mt-4 mb-3" style={{ background: `linear-gradient(90deg, ${season.color}, ${season.color}40, transparent)` }} />

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${season.color}15`, border: `1px solid ${season.color}25` }}>
                    <season.icon className="size-4.5" style={{ color: season.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-zinc-200">{season.season}</p>
                      {isCurrent && <Badge className="bg-teal-500/15 text-teal-400 border-teal-500/25 text-[8px] h-4 px-1">Current</Badge>}
                    </div>
                    <p className="text-[10px] text-zinc-500">{season.tempRange}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Rainfall</span>
                    <Badge className={cn(
                      'text-[9px] h-4 px-1.5 border',
                      season.rainfall === 'Above Average' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
                      season.rainfall === 'Below Average' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                      'bg-zinc-500/15 text-zinc-400 border-zinc-500/25'
                    )}>
                      {season.rainfall}
                    </Badge>
                  </div>
                  <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Key Risk</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{season.risk}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Top 20 Most Vulnerable ──────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <SectionHeader icon={Thermometer} title="Top 20 Most Climate-Vulnerable Municipalities" subtitle="Ranked by composite Climate Vulnerability Index" accentColor="#0D9488" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 border-white/[0.08] bg-white/[0.03]"
                  disabled={vulnPage === 0}
                  onClick={() => setVulnPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="text-[11px] text-zinc-500 tabular-nums">
                  {vulnPage * ITEMS_PER_PAGE + 1}–{Math.min((vulnPage + 1) * ITEMS_PER_PAGE, TOP_VULNERABLE.length)} of {TOP_VULNERABLE.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 border-white/[0.08] bg-white/[0.03]"
                  disabled={vulnPage >= totalPages - 1}
                  onClick={() => setVulnPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[520px]">
              <div className="space-y-2">
                {paginatedVuln.map((muni, i) => {
                  const rank = vulnPage * ITEMS_PER_PAGE + i + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <motion.div
                      key={muni.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="group rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all duration-200 card-hover-lift relative overflow-hidden"
                      style={{ borderLeftWidth: '3px', borderLeftColor: getScoreColor(muni.cvi) }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank */}
                        <div
                          className="flex size-8 items-center justify-center rounded-md text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: isTop3 ? '#B4530920' : `${getScoreColor(muni.cvi)}15`,
                            color: isTop3 ? '#B45309' : getScoreColor(muni.cvi),
                          }}
                        >
                          {rank}
                        </div>

                        {/* Municipality */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="size-3 text-zinc-500 shrink-0" />
                            <p className="text-xs font-medium text-zinc-300 truncate">{muni.name}</p>
                          </div>
                          <p className="text-[10px] text-zinc-600 ml-4.5">{muni.province}</p>
                        </div>

                        {/* Sub-scores as mini progress bars */}
                        <div className="hidden md:flex items-center gap-3">
                          <div className="w-20">
                            <p className="text-[9px] text-zinc-600 mb-0.5">Drought</p>
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full bg-red-400/70" style={{ width: `${muni.droughtRisk}%` }} />
                            </div>
                          </div>
                          <div className="w-20">
                            <p className="text-[9px] text-zinc-600 mb-0.5">Flood</p>
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${muni.floodRisk}%` }} />
                            </div>
                          </div>
                          <div className="w-20">
                            <p className="text-[9px] text-zinc-600 mb-0.5">Water</p>
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full bg-blue-400/70" style={{ width: `${muni.waterStress}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* CVI Score */}
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            'text-[10px] h-5 px-1.5 border font-semibold tabular-nums',
                            muni.cvi >= 70 ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                            muni.cvi >= 55 ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                            muni.cvi >= 40 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                            muni.cvi >= 25 ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
                            'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          )}>
                            {muni.cvi}
                          </Badge>
                        </div>
                      </div>

                      {/* Expanded: All 6 sub-scores on hover */}
                      <div className="hidden group-hover:grid grid-cols-6 gap-2 mt-2.5 pt-2.5 border-t border-white/[0.04]">
                        {[
                          { label: 'Drought', value: muni.droughtRisk, color: 'text-red-400' },
                          { label: 'Flood', value: muni.floodRisk, color: 'text-amber-400' },
                          { label: 'Heat', value: muni.heatStress, color: 'text-orange-400' },
                          { label: 'Water', value: muni.waterStress, color: 'text-blue-400' },
                          { label: 'Food', value: muni.foodSecurity, color: 'text-emerald-400' },
                          { label: 'Infra', value: muni.infraExposure, color: 'text-purple-400' },
                        ].map((sub) => (
                          <div key={sub.label} className="text-center">
                            <p className="text-[8px] text-zinc-600 uppercase tracking-wider mb-0.5">{sub.label}</p>
                            <p className={cn('text-[11px] font-semibold tabular-nums', sub.color)}>{sub.value.toFixed(0)}</p>
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mt-0.5">
                              <div className={cn('h-full rounded-full', sub.color.replace('text-', 'bg-'))} style={{ width: `${sub.value}%`, opacity: 0.6 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-zinc-600">Page {vulnPage + 1} of {totalPages}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setVulnPage(i)}
                    className={cn(
                      'size-6 rounded text-[10px] font-medium transition-all duration-200',
                      i === vulnPage
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <Leaf className="size-3 text-teal-500/50" />
          <span>CarbonLens v1.0 — Climate Vulnerability Intelligence</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
          <span>Data: CSIR, SAWS, DWS</span>
          <Separator orientation="vertical" className="h-3 bg-white/[0.06]" />
          <span>Updated: Mar 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
