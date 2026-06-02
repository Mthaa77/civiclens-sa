'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Users,
  TrendingDown,
  Baby,
  Scale,
  Calculator,
  Building2,
  Briefcase,
  Loader2,
  CheckCircle2,
  HeartPulse,
  GraduationCap,
  Wallet,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatPopulation, formatPercent, formatNumber, formatCompactZAR } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// ── Accent Colors: violet (#8B5CF6) → purple (#7B2D8E) ─────────────────────
const ACCENT_FROM = '#8B5CF6';
const ACCENT_TO = '#7B2D8E';

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

// ── Age Pyramid Data ────────────────────────────────────────────────────────

const AGE_PYRAMID = [
  { group: '0-4', male: 2850000, female: 2780000 },
  { group: '5-9', male: 2920000, female: 2860000 },
  { group: '10-14', male: 3050000, female: 2980000 },
  { group: '15-19', male: 3180000, female: 3120000 },
  { group: '20-24', male: 3420000, female: 3380000 },
  { group: '25-29', male: 3580000, female: 3550000 },
  { group: '30-34', male: 3450000, female: 3480000 },
  { group: '35-39', male: 3150000, female: 3220000 },
  { group: '40-44', male: 2780000, female: 2850000 },
  { group: '45-49', male: 2450000, female: 2580000 },
  { group: '50-54', male: 2080000, female: 2250000 },
  { group: '55-59', male: 1680000, female: 1920000 },
  { group: '60-64', male: 1250000, female: 1520000 },
  { group: '65-69', male: 880000, female: 1150000 },
  { group: '70-74', male: 580000, female: 820000 },
  { group: '75-79', male: 320000, female: 520000 },
  { group: '80+', male: 210000, female: 380000 },
];

// ── Labour Market Data ──────────────────────────────────────────────────────

const EMPLOYMENT_BY_SECTOR = [
  { sector: 'Community Services', value: 3850000, color: '#8B5CF6', icon: HeartPulse },
  { sector: 'Trade', value: 3280000, color: '#10B981', icon: Wallet },
  { sector: 'Manufacturing', value: 1950000, color: '#3B82F6', icon: Building2 },
  { sector: 'Construction', value: 1520000, color: '#F59E0B', icon: Home },
  { sector: 'Finance', value: 2180000, color: '#0891B2', icon: Calculator },
  { sector: 'Agriculture', value: 890000, color: '#22C55E', icon: GraduationCap },
  { sector: 'Mining', value: 480000, color: '#B45309', icon: Briefcase },
  { sector: 'Utilities', value: 220000, color: '#64748B', icon: TrendingDown },
];

const INFORMAL_ECONOMY = [
  { segment: 'Informal Trade', value: 1820000 },
  { segment: 'Domestic Work', value: 1050000 },
  { segment: 'Subsistence Agriculture', value: 680000 },
  { segment: 'Construction (Informal)', value: 520000 },
  { segment: 'Transport (Informal)', value: 380000 },
  { segment: 'Other Informal', value: 450000 },
];

// ── SASSA Data ──────────────────────────────────────────────────────────────

const SASSA_BY_PROVINCE = [
  { province: 'Eastern Cape', beneficiaries: 3280000, pctPop: 48.5, grantTypes: { oldAge: 780000, childSupport: 1850000, disability: 420000, other: 230000 } },
  { province: 'KwaZulu-Natal', beneficiaries: 4150000, pctPop: 35.2, grantTypes: { oldAge: 920000, childSupport: 2450000, disability: 520000, other: 260000 } },
  { province: 'Limpopo', beneficiaries: 2850000, pctPop: 42.8, grantTypes: { oldAge: 650000, childSupport: 1650000, disability: 350000, other: 200000 } },
  { province: 'Gauteng', beneficiaries: 3820000, pctPop: 22.5, grantTypes: { oldAge: 850000, childSupport: 2180000, disability: 480000, other: 310000 } },
  { province: 'Free State', beneficiaries: 1280000, pctPop: 38.2, grantTypes: { oldAge: 320000, childSupport: 720000, disability: 150000, other: 90000 } },
  { province: 'Mpumalanga', beneficiaries: 1520000, pctPop: 30.5, grantTypes: { oldAge: 350000, childSupport: 880000, disability: 180000, other: 110000 } },
  { province: 'North West', beneficiaries: 1180000, pctPop: 27.8, grantTypes: { oldAge: 280000, childSupport: 680000, disability: 140000, other: 80000 } },
  { province: 'Northern Cape', beneficiaries: 620000, pctPop: 24.6, grantTypes: { oldAge: 145000, childSupport: 350000, disability: 80000, other: 45000 } },
  { province: 'Western Cape', beneficiaries: 1680000, pctPop: 18.2, grantTypes: { oldAge: 380000, childSupport: 980000, disability: 200000, other: 120000 } },
];

// ── Income Brackets ─────────────────────────────────────────────────────────

const INCOME_BRACKETS = [
  { id: 'low', label: 'Low Income (<R3,500/mo)', factor: 0.35 },
  { id: 'lower-mid', label: 'Lower Middle (R3,500–R7,500)', factor: 0.28 },
  { id: 'upper-mid', label: 'Upper Middle (R7,500–R22,000)', factor: 0.22 },
  { id: 'high', label: 'High Income (>R22,000/mo)', factor: 0.15 },
];

// ── Demographic Highlights (auto-rotating) ──────────────────────────────────

const DEMOGRAPHIC_HIGHLIGHTS = [
  { title: 'Youth Bulge', value: '19.7M', description: '60% of population under 35 — a demographic dividend opportunity', icon: Baby, color: '#8B5CF6' },
  { title: 'Urban Migration', value: '68%', description: 'Rapid urbanisation rate with 42M now in metropolitan areas', icon: Building2, color: '#3B82F6' },
  { title: 'Social Grants', value: '18.8M', description: '30% of population dependent on social grants — R234B annual spend', icon: Wallet, color: '#F59E0B' },
  { title: 'Working Age', value: '39.5M', description: '63.7% of population is working age but only 40.2% employed', icon: Users, color: '#10B981' },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function PeopleLens() {
  const [calcGeography, setCalcGeography] = useState('national');
  const [calcBracket, setCalcBracket] = useState('low');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [hoveredAgeGroup, setHoveredAgeGroup] = useState<string | null>(null);

  const NATIONAL_POP = 62_027_503;

  // Auto-rotate highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % DEMOGRAPHIC_HIGHLIGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCalculate = () => {
    const bracket = INCOME_BRACKETS.find((b) => b.id === calcBracket);
    if (!bracket) return;
    let pop = NATIONAL_POP;
    if (calcGeography !== 'national') {
      const muni = MOCK_MUNICIPALITIES.find((m) => m.code === calcGeography);
      pop = muni?.population2022 ?? NATIONAL_POP;
    }
    setCalcResult(Math.round(pop * bracket.factor));
  };

  const maxAgeValue = Math.max(...AGE_PYRAMID.map((d) => Math.max(d.male, d.female)));

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
              <Users className="size-5" style={{ color: ACCENT_FROM }} />
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
              PeopleLens
            </h1>
            <p className="text-xs text-zinc-400">Population, poverty, and labour market analytics</p>
          </div>
          <Badge className="badge-premium badge-phase2 ml-2">Phase 2</Badge>
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}>
            <Users className="size-3 mr-1" />Demographics
          </Badge>
        </div>
      </motion.div>

      {/* ── Key Metrics ─────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Population', value: '62.0M', sub: 'Census 2022', icon: Users, color: ACCENT_FROM },
          { label: 'Poverty Rate', value: '50.8%', sub: 'Upper-bound', icon: TrendingDown, color: '#EF4444' },
          { label: 'Youth Unemployment', value: '44.8%', sub: 'Q4 2024', icon: Baby, color: '#F97316' },
          { label: 'Gini Coefficient', value: '0.61', sub: 'High inequality', icon: Scale, color: '#F59E0B' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: 0.8 }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{stat.sub}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                    <stat.icon className="size-5" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Demographic Highlights Carousel ──────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardContent className="p-0">
            <div className="relative overflow-hidden" style={{ minHeight: '80px' }}>
              {DEMOGRAPHIC_HIGHLIGHTS.map((hl, i) => (
                <motion.div
                  key={hl.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: highlightIndex === i ? 1 : 0, x: highlightIndex === i ? 0 : 40 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 flex items-center gap-4 p-4"
                  style={{ pointerEvents: highlightIndex === i ? 'auto' : 'none' }}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl shrink-0" style={{ background: `${hl.color}15`, border: `1px solid ${hl.color}25` }}>
                    <hl.icon className="size-6" style={{ color: hl.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-zinc-200">{hl.title}</p>
                      <span className="text-xl font-bold tabular-nums" style={{ color: hl.color }}>{hl.value}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed mt-0.5">{hl.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {DEMOGRAPHIC_HIGHLIGHTS.map((_, j) => (
                      <button
                        key={j}
                        onClick={() => setHighlightIndex(j)}
                        className={cn(
                          'size-1.5 rounded-full transition-all',
                          j === highlightIndex ? 'w-4' : 'bg-white/20 hover:bg-white/40'
                        )}
                        style={{ backgroundColor: j === highlightIndex ? ACCENT_FROM : undefined }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Age Pyramid — enhanced with hover tooltips, gender comparison ── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, #EC4899, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Age Pyramid</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">South African population by age group and sex (Census 2022)</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {AGE_PYRAMID.map((age, i) => {
                const isHovered = hoveredAgeGroup === age.group;
                const malePct = ((age.male / NATIONAL_POP) * 100).toFixed(1);
                const femalePct = ((age.female / NATIONAL_POP) * 100).toFixed(1);
                return (
                  <div
                    key={age.group}
                    className="flex items-center gap-2 group cursor-default"
                    onMouseEnter={() => setHoveredAgeGroup(age.group)}
                    onMouseLeave={() => setHoveredAgeGroup(null)}
                  >
                    <span className="text-[10px] text-zinc-400 w-8 text-right shrink-0">{age.group}</span>
                    <div className="flex-1 flex items-center gap-0.5 relative">
                      {/* Male (left) */}
                      <div className="flex-1 flex justify-end">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(age.male / maxAgeValue) * 100}%` }}
                          transition={{ delay: i * 0.03, duration: 0.5 }}
                          className="h-5 rounded-l-sm transition-all duration-200"
                          style={{
                            backgroundColor: isHovered ? '#3B82F6' : '#3B82F680',
                            boxShadow: isHovered ? '0 0 8px #3B82F640' : 'none',
                          }}
                        />
                      </div>
                      {/* Center divider */}
                      <div className="w-px h-5 bg-white/[0.1] shrink-0" />
                      {/* Female (right) */}
                      <div className="flex-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(age.female / maxAgeValue) * 100}%` }}
                          transition={{ delay: i * 0.03, duration: 0.5 }}
                          className="h-5 rounded-r-sm transition-all duration-200"
                          style={{
                            backgroundColor: isHovered ? '#EC4899' : '#EC489980',
                            boxShadow: isHovered ? '0 0 8px #EC489940' : 'none',
                          }}
                        />
                      </div>
                      {/* Hover tooltip */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 -top-8 z-10 tooltip-premium px-2 py-1 whitespace-nowrap text-[10px]"
                        >
                          <span className="text-[#3B82F6]">♂ {malePct}%</span>
                          <span className="text-zinc-500 mx-1">·</span>
                          <span className="text-[#EC4899]">♀ {femalePct}%</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-[#3B82F6]" /><span className="text-[10px] text-zinc-400">Male</span></div>
              <div className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-[#EC4899]" /><span className="text-[10px] text-zinc-400">Female</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Labour Market + Market Sizing ────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employment by Sector — with sector icons & gradient fills */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Employment by Sector</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Formal employment distribution</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EMPLOYMENT_BY_SECTOR} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                    <defs>
                      {EMPLOYMENT_BY_SECTOR.map((entry, index) => (
                        <linearGradient key={`grad-${index}`} id={`sectorGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.5} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <YAxis type="category" dataKey="sector" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                      }}
                      formatter={(v: number) => formatPopulation(v)}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                      {EMPLOYMENT_BY_SECTOR.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#sectorGrad-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <div>
                <p className="text-[11px] font-semibold text-zinc-300 mb-2">Informal Economy Breakdown</p>
                {INFORMAL_ECONOMY.map((item) => (
                  <div key={item.segment} className="flex items-center justify-between text-[11px] py-1">
                    <span className="text-zinc-400">{item.segment}</span>
                    <span className="text-zinc-200 font-semibold tabular-nums">{formatPopulation(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Sizing Calculator — premium glass morphism */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, ${ACCENT_FROM})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="size-4" style={{ color: ACCENT_FROM }} />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Market Sizing Calculator</CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Estimate consumer base by geography and income bracket</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02]" style={{ borderLeftWidth: '3px', borderLeftColor: ACCENT_FROM }}>
                  <label className="text-[11px] font-medium text-zinc-400">Geography</label>
                  <Select value={calcGeography} onValueChange={setCalcGeography}>
                    <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03] mt-1 focus:border-[#8B5CF6]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National (62.0M)</SelectItem>
                      {MOCK_MUNICIPALITIES.map((m) => (
                        <SelectItem key={m.code} value={m.code}>{m.name} ({formatPopulation(m.population2022 ?? 0)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-white/[0.06] p-3 bg-white/[0.02]" style={{ borderLeftWidth: '3px', borderLeftColor: ACCENT_TO }}>
                  <label className="text-[11px] font-medium text-zinc-400">Income Bracket</label>
                  <Select value={calcBracket} onValueChange={setCalcBracket}>
                    <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03] mt-1 focus:border-[#7B2D8E]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_BRACKETS.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCalculate}
                variant="outline"
                className="w-full h-9 text-[11px] hover:scale-[1.02] transition-transform"
                style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}
              >
                <Calculator className="size-3.5 mr-1.5" /> Calculate Market Size
              </Button>
              {calcResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="rounded-lg border p-4 text-center relative overflow-hidden"
                  style={{ borderColor: `${ACCENT_FROM}25`, background: `${ACCENT_FROM}08` }}
                >
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
                  <div className="relative">
                    <p className="text-[11px] text-zinc-400 mb-1">Estimated Consumer Base</p>
                    <p className="text-3xl font-bold tabular-nums" style={{ color: ACCENT_FROM }}>{formatPopulation(calcResult)}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Based on {INCOME_BRACKETS.find((b) => b.id === calcBracket)?.label}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── SASSA Dependency ─────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">SASSA Grant Beneficiary Analysis by Province</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">Social grant dependency as percentage of provincial population</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SASSA_BY_PROVINCE.sort((a, b) => b.pctPop - a.pctPop).map((prov, idx) => {
                const barColor = prov.pctPop > 40 ? '#EF4444' : prov.pctPop > 30 ? '#F59E0B' : '#10B981';
                return (
                  <motion.div
                    key={prov.province}
                    whileHover={{ scale: 1.01, borderColor: `${barColor}30` }}
                    className="rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden"
                    style={{ borderLeftWidth: '3px', borderLeftColor: barColor }}
                  >
                    <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${barColor}, transparent)` }} />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-zinc-200">{prov.province}</p>
                        <span className="text-xs font-bold tabular-nums" style={{ color: barColor }}>
                          {formatPercent(prov.pctPop)}
                        </span>
                      </div>
                      <div className="progress-premium h-2 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((prov.pctPop / 50) * 100, 100)}%` }}
                          transition={{ delay: idx * 0.04, duration: 0.6 }}
                          className="progress-bar h-full rounded-full"
                          style={{ '--progress-from': barColor, '--progress-to': `${barColor}88` } as React.CSSProperties}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span className="text-zinc-400">Old Age: <span className="text-zinc-300 font-medium">{formatPopulation(prov.grantTypes.oldAge)}</span></span>
                        <span className="text-zinc-400">Child Support: <span className="text-zinc-300 font-medium">{formatPopulation(prov.grantTypes.childSupport)}</span></span>
                        <span className="text-zinc-400">Disability: <span className="text-zinc-300 font-medium">{formatPopulation(prov.grantTypes.disability)}</span></span>
                        <span className="text-zinc-400">Total: <span className="text-zinc-200 font-semibold">{formatPopulation(prov.beneficiaries)}</span></span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
