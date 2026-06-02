'use client';

import React, { useState } from 'react';
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
  CreditCard,
  Building2,
  Briefcase,
  Loader2,
  CheckCircle2,
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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
  { sector: 'Community Services', value: 3850000, color: '#3B82F6' },
  { sector: 'Trade', value: 3280000, color: '#10B981' },
  { sector: 'Manufacturing', value: 1950000, color: '#8B5CF6' },
  { sector: 'Construction', value: 1520000, color: '#F59E0B' },
  { sector: 'Finance', value: 2180000, color: '#0891B2' },
  { sector: 'Agriculture', value: 890000, color: '#22C55E' },
  { sector: 'Mining', value: 480000, color: '#B45309' },
  { sector: 'Utilities', value: 220000, color: '#64748B' },
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function PeopleLens() {
  const [calcGeography, setCalcGeography] = useState('national');
  const [calcBracket, setCalcBracket] = useState('low');
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const NATIONAL_POP = 62_027_503;

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
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#059669]/10 border border-[#059669]/20">
            <Users className="size-5 text-[#059669]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">PeopleLens</h1>
            <p className="text-xs text-zinc-500">Population, poverty, and labour market analytics</p>
          </div>
          <Badge className="ml-2 bg-[#059669]/15 text-[#059669] border-[#059669]/25 text-[10px] h-5 px-1.5">Phase 2</Badge>
        </div>
      </motion.div>

      {/* ── Key Metrics ─────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Population', value: '62.0M', sub: 'Census 2022', icon: Users, color: '#059669' },
          { label: 'Poverty Rate', value: '50.8%', sub: 'Upper-bound', icon: TrendingDown, color: '#EF4444' },
          { label: 'Youth Unemployment', value: '44.8%', sub: 'Q4 2024', icon: Baby, color: '#F97316' },
          { label: 'Gini Coefficient', value: '0.61', sub: 'High inequality', icon: Scale, color: '#F59E0B' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{stat.sub}</p>
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

      {/* ── Age Pyramid ──────────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Age Pyramid</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">South African population by age group and sex (Census 2022)</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {AGE_PYRAMID.map((age, i) => (
                <div key={age.group} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 w-8 text-right shrink-0">{age.group}</span>
                  <div className="flex-1 flex items-center gap-0.5">
                    {/* Male (left) */}
                    <div className="flex-1 flex justify-end">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(age.male / maxAgeValue) * 100}%` }}
                        transition={{ delay: i * 0.03, duration: 0.5 }}
                        className="h-4 rounded-l-sm bg-[#3B82F6]/60"
                      />
                    </div>
                    {/* Female (right) */}
                    <div className="flex-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(age.female / maxAgeValue) * 100}%` }}
                        transition={{ delay: i * 0.03, duration: 0.5 }}
                        className="h-4 rounded-r-sm bg-[#EC4899]/60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-[#3B82F6]/60" /><span className="text-[10px] text-zinc-500">Male</span></div>
              <div className="flex items-center gap-1.5"><div className="size-3 rounded-sm bg-[#EC4899]/60" /><span className="text-[10px] text-zinc-500">Female</span></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Labour Market + Market Sizing ────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employment by Sector */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Employment by Sector</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Formal employment distribution</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EMPLOYMENT_BY_SECTOR} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <YAxis type="category" dataKey="sector" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => formatPopulation(v)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                      {EMPLOYMENT_BY_SECTOR.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 mb-2">Informal Economy Breakdown</p>
                {INFORMAL_ECONOMY.map((item) => (
                  <div key={item.segment} className="flex items-center justify-between text-[11px] py-1">
                    <span className="text-zinc-500">{item.segment}</span>
                    <span className="text-zinc-300 font-medium tabular-nums">{formatPopulation(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Sizing Calculator */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Market Sizing Calculator</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Estimate consumer base by geography and income bracket</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">Geography</label>
                  <Select value={calcGeography} onValueChange={setCalcGeography}>
                    <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03] mt-1">
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
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">Income Bracket</label>
                  <Select value={calcBracket} onValueChange={setCalcBracket}>
                    <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03] mt-1">
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
              <Button onClick={handleCalculate} variant="outline" className="w-full h-8 text-[11px] bg-[#059669]/10 text-[#059669] border-[#059669]/25 hover:bg-[#059669]/20">
                <Calculator className="size-3.5 mr-1.5" /> Calculate Market Size
              </Button>
              {calcResult !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-[#059669]/20 bg-[#059669]/5 p-4 text-center">
                  <p className="text-[11px] text-zinc-500 mb-1">Estimated Consumer Base</p>
                  <p className="text-3xl font-bold text-[#059669] tabular-nums">{formatPopulation(calcResult)}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Based on {INCOME_BRACKETS.find((b) => b.id === calcBracket)?.label}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── SASSA Dependency ─────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">SASSA Grant Beneficiary Analysis by Province</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">Social grant dependency as percentage of provincial population</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SASSA_BY_PROVINCE.sort((a, b) => b.pctPop - a.pctPop).map((prov) => (
                <div key={prov.province} className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-300">{prov.province}</p>
                    <span className="text-xs font-bold tabular-nums" style={{ color: prov.pctPop > 40 ? '#EF4444' : prov.pctPop > 30 ? '#F59E0B' : '#10B981' }}>
                      {formatPercent(prov.pctPop)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min((prov.pctPop / 50) * 100, 100)}%`,
                      backgroundColor: prov.pctPop > 40 ? '#EF4444' : prov.pctPop > 30 ? '#F59E0B' : '#10B981'
                    }} />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className="text-zinc-600">Old Age: <span className="text-zinc-400">{formatPopulation(prov.grantTypes.oldAge)}</span></span>
                    <span className="text-zinc-600">Child Support: <span className="text-zinc-400">{formatPopulation(prov.grantTypes.childSupport)}</span></span>
                    <span className="text-zinc-600">Disability: <span className="text-zinc-400">{formatPopulation(prov.grantTypes.disability)}</span></span>
                    <span className="text-zinc-600">Total: <span className="text-zinc-300 font-medium">{formatPopulation(prov.beneficiaries)}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
