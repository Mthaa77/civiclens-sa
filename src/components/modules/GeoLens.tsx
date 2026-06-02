'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Info,
  CheckCircle,
  Database,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVINCE_SUMMARY, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatNumber, getScoreBand } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProvinceGeo {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

type IndicatorKey = 'avgFHS' | 'avgSDS' | 'section139' | 'cleanAudit' | 'municipalities';

interface IndicatorOption {
  key: IndicatorKey;
  label: string;
  unit: string;
  invertScale?: boolean; // true = lower is better (like SDS)
  format: (v: number) => string;
  dotColor: string;
}

// ── Province SVG Paths (simplified) ──────────────────────────────────────────
// Approximate outlines of SA's 9 provinces in a 600x500 viewBox

const PROVINCE_GEO: ProvinceGeo[] = [
  {
    id: 'limpopo',
    name: 'Limpopo',
    path: 'M 265,8 L 290,5 L 330,10 L 370,20 L 410,18 L 440,30 L 465,55 L 460,80 L 440,100 L 420,115 L 395,120 L 370,130 L 345,125 L 320,115 L 295,110 L 270,105 L 250,95 L 240,75 L 245,50 L 255,30 Z',
    labelX: 355,
    labelY: 70,
  },
  {
    id: 'mpumalanga',
    name: 'Mpumalanga',
    path: 'M 420,115 L 440,100 L 460,80 L 465,55 L 490,70 L 510,90 L 520,115 L 515,145 L 500,170 L 480,185 L 460,190 L 440,180 L 420,165 L 400,155 L 395,135 L 395,120 Z',
    labelX: 465,
    labelY: 135,
  },
  {
    id: 'gauteng',
    name: 'Gauteng',
    path: 'M 370,130 L 395,120 L 395,135 L 400,155 L 390,165 L 375,170 L 360,165 L 350,155 L 345,140 Z',
    labelX: 372,
    labelY: 148,
  },
  {
    id: 'north-west',
    name: 'North West',
    path: 'M 240,75 L 250,95 L 270,105 L 295,110 L 320,115 L 345,125 L 345,140 L 350,155 L 360,165 L 350,180 L 335,195 L 310,205 L 280,210 L 250,205 L 220,195 L 195,180 L 180,160 L 175,140 L 185,120 L 200,100 L 220,85 Z',
    labelX: 275,
    labelY: 160,
  },
  {
    id: 'free-state',
    name: 'Free State',
    path: 'M 350,180 L 360,165 L 375,170 L 390,165 L 400,155 L 420,165 L 440,180 L 460,190 L 455,215 L 440,240 L 420,260 L 395,270 L 370,275 L 340,270 L 310,260 L 285,245 L 270,225 L 275,210 L 280,210 L 310,205 L 335,195 Z',
    labelX: 365,
    labelY: 225,
  },
  {
    id: 'kwazulu-natal',
    name: 'KwaZulu-Natal',
    path: 'M 460,190 L 480,185 L 500,170 L 515,190 L 525,215 L 530,245 L 525,275 L 515,305 L 500,330 L 480,350 L 460,365 L 445,370 L 440,355 L 440,335 L 435,315 L 420,295 L 410,275 L 420,260 L 440,240 L 455,215 Z',
    labelX: 480,
    labelY: 280,
  },
  {
    id: 'northern-cape',
    name: 'Northern Cape',
    path: 'M 30,110 L 50,90 L 80,75 L 110,70 L 140,72 L 170,78 L 195,80 L 220,85 L 200,100 L 185,120 L 175,140 L 180,160 L 195,180 L 220,195 L 250,205 L 275,210 L 270,225 L 285,245 L 270,260 L 245,275 L 215,285 L 185,290 L 155,295 L 130,300 L 105,305 L 80,300 L 60,280 L 40,255 L 25,225 L 15,195 L 10,165 L 15,135 L 20,120 Z',
    labelX: 150,
    labelY: 195,
  },
  {
    id: 'western-cape',
    name: 'Western Cape',
    path: 'M 80,300 L 105,305 L 130,300 L 155,295 L 185,290 L 215,285 L 210,305 L 200,325 L 190,345 L 175,365 L 155,385 L 135,400 L 115,410 L 95,415 L 75,410 L 58,395 L 45,375 L 35,350 L 30,325 L 32,310 L 45,300 L 60,295 Z',
    labelX: 125,
    labelY: 355,
  },
  {
    id: 'eastern-cape',
    name: 'Eastern Cape',
    path: 'M 215,285 L 245,275 L 270,260 L 285,245 L 310,260 L 340,270 L 370,275 L 395,270 L 410,275 L 420,295 L 435,315 L 440,335 L 440,355 L 445,370 L 430,380 L 410,395 L 385,405 L 355,410 L 325,408 L 295,400 L 265,390 L 240,375 L 220,355 L 205,335 L 195,315 L 200,305 L 210,305 Z',
    labelX: 320,
    labelY: 345,
  },
];

// ── Indicator Options ────────────────────────────────────────────────────────

const INDICATORS: IndicatorOption[] = [
  { key: 'avgFHS', label: 'Financial Health Score', unit: 'score', format: (v) => `${v}/100`, dotColor: '#22C55E' },
  { key: 'avgSDS', label: 'Service Delivery Pressure', unit: 'score', invertScale: true, format: (v) => `${v}/100`, dotColor: '#F59E0B' },
  { key: 'municipalities', label: 'Municipality Count', unit: 'count', invertScale: true, format: (v) => formatNumber(v), dotColor: '#6B7280' },
  { key: 'section139', label: 'Section 139 Interventions', unit: 'count', invertScale: true, format: (v) => formatNumber(v), dotColor: '#EF4444' },
  { key: 'cleanAudit', label: 'Clean Audit Count', unit: 'count', format: (v) => formatNumber(v), dotColor: '#10B981' },
];

// ── Color Scale (nuanced gradients) ──────────────────────────────────────────

function getChoroplethColor(value: number, min: number, max: number, invert?: boolean): string {
  const normalized = max === min ? 0.5 : (value - min) / (max - min);
  const score = invert ? 1 - normalized : normalized;

  if (score >= 0.75) return '#059669'; // deep emerald
  if (score >= 0.55) return '#10B981'; // emerald
  if (score >= 0.4) return '#F59E0B';  // amber
  if (score >= 0.25) return '#EA580C'; // deep orange
  return '#DC2626'; // deep red
}

function getChoroplethGlow(value: number, min: number, max: number, invert?: boolean): string {
  const normalized = max === min ? 0.5 : (value - min) / (max - min);
  const score = invert ? 1 - normalized : normalized;

  if (score >= 0.75) return '#059669';
  if (score >= 0.55) return '#10B981';
  if (score >= 0.4) return '#F59E0B';
  if (score >= 0.25) return '#EA580C';
  return '#DC2626';
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function ProvinceTooltip({
  name,
  indicator,
  value,
  x,
  y,
}: {
  name: string;
  indicator: IndicatorOption;
  value: number;
  x: number;
  y: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 pointer-events-none rounded-xl border border-white/[0.12] bg-[#0d1224]/95 backdrop-blur-xl px-3.5 py-2.5 shadow-2xl"
      style={{
        left: x + 14,
        top: y - 12,
      }}
    >
      <p className="text-xs font-semibold text-zinc-100">{name}</p>
      <p className="text-[11px] text-zinc-400 mt-0.5">
        {indicator.label}: <span className="text-zinc-200 font-semibold">{indicator.format(value)}</span>
      </p>
    </motion.div>
  );
}

function ProvinceDetailPanel({
  provinceName,
  onClose,
  indicator,
}: {
  provinceName: string;
  onClose: () => void;
  indicator: IndicatorOption;
}) {
  const provinceData = PROVINCE_SUMMARY.find((p) => p.province === provinceName);
  const municipalities = MOCK_MUNICIPALITIES.filter((m) => m.province === provinceName);

  if (!provinceData) return null;

  const nationalAvgFHS = PROVINCE_SUMMARY.reduce((s, p) => s + p.avgFHS, 0) / PROVINCE_SUMMARY.length;
  const nationalAvgSDS = PROVINCE_SUMMARY.reduce((s, p) => s + p.avgSDS, 0) / PROVINCE_SUMMARY.length;
  const nationalAvg139 = PROVINCE_SUMMARY.reduce((s, p) => s + p.section139, 0) / PROVINCE_SUMMARY.length;
  const nationalAvgClean = PROVINCE_SUMMARY.reduce((s, p) => s + p.cleanAudit, 0) / PROVINCE_SUMMARY.length;

  const stats = [
    {
      label: 'Financial Health',
      value: provinceData.avgFHS,
      national: Math.round(nationalAvgFHS),
      format: (v: number) => `${v}/100`,
      band: getScoreBand(provinceData.avgFHS),
      accentColor: '#22C55E',
    },
    {
      label: 'Service Delivery Pressure',
      value: provinceData.avgSDS,
      national: Math.round(nationalAvgSDS),
      format: (v: number) => `${v}/100`,
      band: getScoreBand(100 - provinceData.avgSDS),
      accentColor: '#F59E0B',
    },
    {
      label: 'Section 139 Interventions',
      value: provinceData.section139,
      national: Math.round(nationalAvg139 * 10) / 10,
      format: (v: number) => formatNumber(v),
      band: null,
      accentColor: '#EF4444',
    },
    {
      label: 'Clean Audits',
      value: provinceData.cleanAudit,
      national: Math.round(nationalAvgClean),
      format: (v: number) => formatNumber(v),
      band: null,
      accentColor: '#10B981',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="rounded-xl bg-[#0d1224]/80 backdrop-blur-xl border border-white/[0.1] overflow-hidden">
        {/* Top gradient accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#B45309] to-transparent" />

        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#B45309]/15 border border-[#B45309]/25">
                <Map className="size-4 text-[#B45309]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{provinceName}</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {provinceData.municipalities} municipalities
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] hover:shadow-[0_0_12px_rgba(180,83,9,0.2)] transition-all duration-200"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-3">
          <div className="space-y-2.5">
            {stats.map((stat) => {
              const diff = stat.value - stat.national;
              const isBetter = stat.label.includes('Pressure')
                ? diff < 0
                : stat.label.includes('Section')
                  ? diff < 0
                  : diff > 0;

              return (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-zinc-400 font-medium">{stat.label}</span>
                    {stat.band && (
                      <Badge
                        variant="outline"
                        className={cn('text-[9px] h-4 px-1.5', stat.band.bgColor, stat.band.textColor)}
                      >
                        {stat.band.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-zinc-100 tabular-nums" style={{ color: stat.accentColor }}>
                      {stat.format(stat.value)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {diff === 0 ? (
                        <Minus className="size-3 text-zinc-500" />
                      ) : isBetter ? (
                        <span className="flex items-center text-emerald-400">
                          <TrendingUp className="size-3 mr-0.5" />▲
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400">
                          <TrendingDown className="size-3 mr-0.5" />▼
                        </span>
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-semibold tabular-nums',
                          diff === 0
                            ? 'text-zinc-500'
                            : isBetter
                              ? 'text-emerald-400'
                              : 'text-red-400'
                        )}
                      >
                        {diff > 0 ? '+' : ''}
                        {stat.format(Math.abs(diff))} vs avg
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-4">
          <Separator className="bg-white/[0.06]" />
        </div>

        {/* Municipalities */}
        <div className="p-4 pt-3">
          <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Municipalities
          </h4>
          <ScrollArea className="max-h-48">
            <div className="space-y-1.5">
              {municipalities.length > 0 ? (
                municipalities.map((muni) => (
                  <div
                    key={muni.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-2.5 py-2 hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="size-3 text-zinc-600 shrink-0" />
                      <span className="text-[11px] text-zinc-300 truncate">{muni.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[8px] h-4 px-1',
                          muni.auditOutcome === 'Clean'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            : muni.auditOutcome === 'Unqualified'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                              : muni.auditOutcome === 'Qualified'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                : muni.auditOutcome === 'Disclaimer'
                                  ? 'bg-red-500/15 text-red-400 border-red-500/25'
                                  : 'bg-orange-500/15 text-orange-400 border-orange-500/25'
                        )}
                      >
                        {muni.auditOutcome}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 tabular-nums w-10 text-right">
                        FHS {muni.financialHealthScore}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-zinc-600 py-2 text-center">
                  No sample municipalities in database
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}

function ColorLegend({ min, max, indicator }: { min: number; max: number; indicator: IndicatorOption }) {
  // Smooth gradient stops
  const gradientColors = '#DC2626, #EA580C, #F59E0B, #10B981, #059669';
  const tickCount = 5;
  const tickValues = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    return Math.round(min + t * (max - min));
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Scale</span>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[10px] text-zinc-400 font-medium tabular-nums whitespace-nowrap">
            {indicator.format(min)}
          </span>
          <div className="flex-1 relative">
            {/* Smooth gradient bar */}
            <div
              className="h-3 rounded-full w-full"
              style={{
                background: `linear-gradient(to right, ${gradientColors})`,
              }}
            />
            {/* Tick marks */}
            <div className="relative h-2 mt-0.5">
              {tickValues.map((val, i) => {
                const pos = (i / (tickCount - 1)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-px h-1.5 bg-zinc-600" />
                    <span className="text-[8px] text-zinc-500 tabular-nums mt-0.5 whitespace-nowrap">
                      {indicator.format(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium tabular-nums whitespace-nowrap">
            {indicator.format(max)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-8">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-zinc-400 font-medium">Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-amber-500" />
          <span className="text-[10px] text-zinc-400 font-medium">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500" />
          <span className="text-[10px] text-zinc-400 font-medium">Critical</span>
        </div>
      </div>
    </div>
  );
}

// ── Main GeoLens Component ───────────────────────────────────────────────────

export default function GeoLens() {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorOption>(INDICATORS[0]);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [indicatorDropdownOpen, setIndicatorDropdownOpen] = useState(false);

  // Compute min/max for the selected indicator
  const { min, max } = useMemo(() => {
    const values = PROVINCE_SUMMARY.map((p) => p[selectedIndicator.key] as number);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [selectedIndicator]);

  const getProvinceValue = useCallback(
    (provinceName: string): number => {
      const p = PROVINCE_SUMMARY.find((ps) => ps.province === provinceName);
      return p ? (p[selectedIndicator.key] as number) : 0;
    },
    [selectedIndicator]
  );

  const handleProvinceMouseMove = useCallback(
    (e: React.MouseEvent, provinceName: string) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
      setHoveredProvince(provinceName);
    },
    []
  );

  // National overview stats
  const nationalStats = useMemo(() => ({
    avgFHS: Math.round(PROVINCE_SUMMARY.reduce((s, p) => s + p.avgFHS, 0) / 9),
    total139: PROVINCE_SUMMARY.reduce((s, p) => s + p.section139, 0),
    cleanAudits: PROVINCE_SUMMARY.reduce((s, p) => s + p.cleanAudit, 0),
    totalMunis: PROVINCE_SUMMARY.reduce((s, p) => s + p.municipalities, 0),
  }), []);

  return (
    <div className="space-y-5">
      {/* ── Module Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#B45309]/15 border border-[#B45309]/25">
            <Map className="size-5 text-[#B45309]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-100">GeoLens</h1>
              {/* Pulsing green LIVE dot */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Spatial intelligence — interactive choropleth maps</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicator Selector */}
          <div className="relative">
            <button
              onClick={() => setIndicatorDropdownOpen(!indicatorDropdownOpen)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200',
                indicatorDropdownOpen
                  ? 'border-[#B45309]/40 bg-[#B45309]/15 text-[#B45309] shadow-[0_0_16px_rgba(180,83,9,0.15)]'
                  : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-[#B45309]/30 hover:bg-[#B45309]/10 hover:text-[#B45309]'
              )}
            >
              <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: selectedIndicator.dotColor }} />
              <BarChart3 className="size-3.5" />
              <span>{selectedIndicator.label}</span>
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  indicatorDropdownOpen && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {indicatorDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-60 rounded-xl border border-white/[0.1] bg-[#0d1224]/98 backdrop-blur-xl shadow-2xl z-50 py-1.5 overflow-hidden"
                >
                  {INDICATORS.map((ind) => (
                    <button
                      key={ind.key}
                      onClick={() => {
                        setSelectedIndicator(ind);
                        setIndicatorDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-all duration-200',
                        selectedIndicator.key === ind.key
                          ? 'bg-[#B45309]/15 text-[#B45309]'
                          : 'text-zinc-400 hover:bg-[#B45309]/8 hover:text-zinc-100 hover:pl-3.5'
                      )}
                    >
                      <div
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: ind.dotColor }}
                      />
                      <span className="font-medium">{ind.label}</span>
                      {selectedIndicator.key === ind.key && (
                        <CheckCircle className="size-3.5 ml-auto text-[#B45309]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Period */}
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-500 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all">
            <Info className="size-3.5" />
            <span>2023/24</span>
          </button>
        </div>
      </motion.div>

      {/* ── Map + Detail Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* ── Map Card ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden drop-shadow-lg">
            <CardContent className="p-4 lg:p-6">
              {/* SVG Map */}
              <div className="relative w-full max-w-2xl mx-auto">
                {/* Vignette overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 rounded-xl" style={{
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(8,11,22,0.4) 100%)',
                }} />

                <svg
                  viewBox="0 0 540 430"
                  className="w-full h-auto"
                  style={{ filter: 'drop-shadow(0 4px 30px rgba(180, 83, 9, 0.08))' }}
                >
                  {/* Background glow effects */}
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="selectedGlow">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Spotlight radial gradient from center */}
                    <radialGradient id="bgSpotlight" cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor="#B45309" stopOpacity="0.06" />
                      <stop offset="40%" stopColor="#B45309" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    {/* Vignette gradient */}
                    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                      <stop offset="60%" stopColor="transparent" stopOpacity="0" />
                      <stop offset="100%" stopColor="#080b16" stopOpacity="0.5" />
                    </radialGradient>
                  </defs>

                  {/* Spotlight background */}
                  <rect x="0" y="0" width="540" height="430" fill="url(#bgSpotlight)" />
                  {/* Vignette */}
                  <rect x="0" y="0" width="540" height="430" fill="url(#vignette)" />

                  {/* Province Paths */}
                  {PROVINCE_GEO.map((geo) => {
                    const value = getProvinceValue(geo.name);
                    const fillColor = getChoroplethColor(value, min, max, selectedIndicator.invertScale);
                    const glowColor = getChoroplethGlow(value, min, max, selectedIndicator.invertScale);
                    const isHovered = hoveredProvince === geo.name;
                    const isSelected = selectedProvince === geo.name;

                    return (
                      <g key={geo.id}>
                        {/* Glow effect on hover */}
                        {(isHovered || isSelected) && (
                          <path
                            d={geo.path}
                            fill="none"
                            stroke={isSelected ? '#B45309' : glowColor}
                            strokeWidth="5"
                            filter={isSelected ? 'url(#selectedGlow)' : 'url(#glow)'}
                            opacity="0.7"
                          />
                        )}
                        {/* Selected pulsing ring */}
                        {isSelected && (
                          <path
                            d={geo.path}
                            fill="none"
                            stroke="#B45309"
                            strokeWidth="3"
                            opacity="0.4"
                            className="animate-pulse"
                            style={{ animationDuration: '2s' }}
                          />
                        )}
                        {/* Province shape */}
                        <path
                          d={geo.path}
                          fill={fillColor}
                          fillOpacity={isHovered ? 0.95 : isSelected ? 0.9 : 0.7}
                          stroke={isSelected ? '#B45309' : isHovered ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                          strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 0.8}
                          className="cursor-pointer transition-all duration-300 ease-out"
                          style={{
                            filter: isHovered ? 'brightness(1.15)' : undefined,
                          }}
                          onMouseEnter={() => setHoveredProvince(geo.name)}
                          onMouseMove={(e) => handleProvinceMouseMove(e, geo.name)}
                          onMouseLeave={() => setHoveredProvince(null)}
                          onClick={() =>
                            setSelectedProvince(selectedProvince === geo.name ? null : geo.name)
                          }
                        />
                        {/* Province label */}
                        <text
                          x={geo.labelX}
                          y={geo.labelY}
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                          fill={isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)'}
                          fontSize={geo.name === 'Gauteng' ? '9' : '10.5'}
                          fontWeight={isHovered || isSelected ? '700' : '600'}
                          style={{
                            transition: 'fill 0.3s, font-weight 0.3s',
                            textShadow: isHovered || isSelected
                              ? '0 0 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)'
                              : '0 0 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)',
                          }}
                        >
                          {geo.name === 'KwaZulu-Natal'
                            ? 'KZN'
                            : geo.name === 'Northern Cape'
                              ? 'N. Cape'
                              : geo.name === 'Eastern Cape'
                                ? 'E. Cape'
                                : geo.name === 'North West'
                                  ? 'N. West'
                                  : geo.name === 'Free State'
                                    ? 'Free State'
                                    : geo.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredProvince && (
                    <ProvinceTooltip
                      name={hoveredProvince}
                      indicator={selectedIndicator}
                      value={getProvinceValue(hoveredProvince)}
                      x={tooltipPos.x}
                      y={tooltipPos.y}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <ColorLegend min={min} max={max} indicator={selectedIndicator} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Detail Panel ──────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">
            {selectedProvince ? (
              <ProvinceDetailPanel
                key={selectedProvince}
                provinceName={selectedProvince}
                onClose={() => setSelectedProvince(null)}
                indicator={selectedIndicator}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-xl bg-[#0d1224]/80 backdrop-blur-xl border border-white/[0.1] overflow-hidden">
                  {/* Top gradient accent */}
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-[#B45309] to-transparent" />

                  <div className="p-6">
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-[#B45309]/10 border border-[#B45309]/20 mb-4">
                        <Map className="size-6 text-[#B45309]/60" />
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-300 mb-1.5">Select a Province</h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[220px]">
                        Click on any province in the map to view detailed statistics, indicators, and municipality
                        listings.
                      </p>

                      <Separator className="my-5 bg-white/[0.06] w-full" />

                      {/* National Overview with enhanced stat cards */}
                      <div className="w-full space-y-3">
                        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Radio className="size-3 text-[#B45309]" />
                          National Overview
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Avg Financial Health */}
                          <div className="rounded-lg border border-white/[0.06] p-3 text-left" style={{
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(13,18,36,0.4) 100%)',
                          }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <TrendingUp className="size-3 text-emerald-400" />
                              <p className="text-[9px] text-zinc-500 font-medium">Avg Financial Health</p>
                            </div>
                            <p className="text-2xl font-bold text-amber-400 tabular-nums">
                              {nationalStats.avgFHS}
                            </p>
                          </div>
                          {/* Total §139 */}
                          <div className="rounded-lg border border-white/[0.06] p-3 text-left" style={{
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(13,18,36,0.4) 100%)',
                          }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <AlertTriangle className="size-3 text-red-400" />
                              <p className="text-[9px] text-zinc-500 font-medium">Total §139</p>
                            </div>
                            <p className="text-2xl font-bold text-red-400 tabular-nums">
                              {nationalStats.total139}
                            </p>
                          </div>
                          {/* Clean Audits */}
                          <div className="rounded-lg border border-white/[0.06] p-3 text-left" style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(13,18,36,0.4) 100%)',
                          }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <CheckCircle className="size-3 text-emerald-400" />
                              <p className="text-[9px] text-zinc-500 font-medium">Clean Audits</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                              {nationalStats.cleanAudits}
                            </p>
                          </div>
                          {/* Total Munis */}
                          <div className="rounded-lg border border-white/[0.06] p-3 text-left" style={{
                            background: 'linear-gradient(135deg, rgba(107,114,128,0.05) 0%, rgba(13,18,36,0.4) 100%)',
                          }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Building2 className="size-3 text-zinc-400" />
                              <p className="text-[9px] text-zinc-500 font-medium">Total Munis</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-200 tabular-nums">
                              {nationalStats.totalMunis}
                            </p>
                          </div>
                        </div>

                        {/* Subtle grid pattern */}
                        <div className="mt-3 rounded-lg border border-white/[0.04] p-3 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                          }} />
                          <div className="relative z-10">
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                              <span className="text-[#B45309] font-semibold">9 provinces</span> across
                              South Africa are monitored for financial health, service delivery,
                              and governance indicators.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Section Separator ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="size-1.5 rounded-full bg-[#B45309]/40" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* ── Province Summary Cards ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#B45309] to-[#B45309]/40" />
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200">Province Rankings</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Sorted by {selectedIndicator.label} — click to select
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {[...PROVINCE_SUMMARY]
                .sort((a, b) => {
                  const av = a[selectedIndicator.key] as number;
                  const bv = b[selectedIndicator.key] as number;
                  return selectedIndicator.invertScale ? av - bv : bv - av;
                })
                .map((prov, i) => {
                  const value = prov[selectedIndicator.key] as number;
                  const color = getChoroplethColor(value, min, max, selectedIndicator.invertScale);
                  const isSelected = selectedProvince === prov.province;

                  return (
                    <motion.button
                      key={prov.province}
                      onClick={() =>
                        setSelectedProvince(selectedProvince === prov.province ? null : prov.province)
                      }
                      whileHover={{ scale: 1.03, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'rounded-lg border p-2.5 text-left transition-all duration-200 relative overflow-hidden',
                        isSelected
                          ? 'border-[#B45309]/50 bg-[#B45309]/10 shadow-[0_0_16px_rgba(180,83,9,0.1)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      )}
                      style={{
                        borderLeftWidth: isSelected ? '3px' : undefined,
                        borderLeftColor: isSelected ? '#B45309' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span
                          className={cn(
                            'text-[9px] font-semibold tabular-nums',
                            i < 3 ? 'text-[#B45309]' : 'text-zinc-400'
                          )}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-zinc-200 truncate leading-tight">
                        {prov.province === 'KwaZulu-Natal'
                          ? 'KZN'
                          : prov.province === 'Northern Cape'
                            ? 'N. Cape'
                            : prov.province === 'Eastern Cape'
                              ? 'E. Cape'
                              : prov.province === 'North West'
                                ? 'N. West'
                                : prov.province}
                      </p>
                      <p
                        className="text-sm font-bold tabular-nums mt-1"
                        style={{ color }}
                      >
                        {selectedIndicator.format(value)}
                      </p>
                    </motion.button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Footer Attribution ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-between pt-1 pb-2"
      >
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <Database className="size-3" />
          <span>Data source: Stats SA, National Treasury MFMA, Auditor-General SA</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
          <ShieldCheck className="size-3 text-[#B45309]/40" />
          <span>GeoLens v2.0 — Spatial Intelligence Module</span>
        </div>
      </motion.div>
    </div>
  );
}
