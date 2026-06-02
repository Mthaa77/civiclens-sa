'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'recharts';
import {
  Leaf,
  Droplets,
  Thermometer,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatNumber, formatPercent } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  { name: 'Vaal Dam', province: 'Gauteng', current: 58.2, longTermAvg: 72.5, capacity: 100, trend: 'declining' },
  { name: 'Theewaterskloof', province: 'Western Cape', current: 72.8, longTermAvg: 68.2, capacity: 100, trend: 'stable' },
  { name: 'Inanda Dam', province: 'KwaZulu-Natal', current: 65.4, longTermAvg: 78.5, capacity: 100, trend: 'declining' },
  { name: 'Gariep Dam', province: 'Eastern Cape', current: 48.2, longTermAvg: 65.8, capacity: 100, trend: 'declining' },
  { name: 'Vanderkloof Dam', province: 'Northern Cape', current: 52.5, longTermAvg: 68.2, capacity: 100, trend: 'declining' },
  { name: 'Midmar Dam', province: 'KwaZulu-Natal', current: 82.1, longTermAvg: 78.5, capacity: 100, trend: 'stable' },
  { name: 'Sterkfontein Dam', province: 'Free State', current: 92.5, longTermAvg: 88.2, capacity: 100, trend: 'stable' },
  { name: 'Pongolapoort Dam', province: 'KwaZulu-Natal', current: 45.8, longTermAvg: 62.5, capacity: 100, trend: 'declining' },
];

const DAM_TREND_WEEKLY = [
  { week: 'W1', vaal: 62, theewaters: 70, gariep: 52 },
  { week: 'W2', vaal: 61, theewaters: 71, gariep: 51 },
  { week: 'W3', vaal: 60, theewaters: 72, gariep: 50 },
  { week: 'W4', vaal: 59, theewaters: 73, gariep: 49 },
  { week: 'W5', vaal: 58, theewaters: 73, gariep: 49 },
  { week: 'W6', vaal: 58, theewaters: 72, gariep: 48 },
  { week: 'W7', vaal: 57, theewaters: 71, gariep: 48 },
  { week: 'W8', vaal: 58, theewaters: 73, gariep: 48 },
];

// ── Top 20 Most Vulnerable ──────────────────────────────────────────────────

const TOP_VULNERABLE = [
  ...MOCK_MUNICIPALITIES.map((m) => ({
    name: m.name,
    province: m.province,
    cvi: m.climateRiskScore ?? 0,
    droughtRisk: 40 + Math.random() * 40,
    floodRisk: 20 + Math.random() * 50,
    waterStress: 30 + Math.random() * 45,
  })),
].sort((a, b) => b.cvi - a.cvi).slice(0, 20);

// ── Main Component ──────────────────────────────────────────────────────────

export default function CarbonLens() {
  const [selectedMuni, setSelectedMuni] = useState('EKU');

  const radarData = CVI_DIMENSIONS.map((dim, i) => ({
    dimension: dim,
    score: CVI_DATA[selectedMuni]?.[i] ?? 50,
  }));

  const selectedMuniData = MOCK_MUNICIPALITIES.find((m) => m.code === selectedMuni);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20">
            <Leaf className="size-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">CarbonLens</h1>
            <p className="text-xs text-zinc-500">Climate vulnerability and environmental risk</p>
          </div>
          <Badge className="ml-2 bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/25 text-[10px] h-5 px-1.5">Phase 3</Badge>
        </div>
      </motion.div>

      {/* ── CVI Radar + Municipality Select ───────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Climate Vulnerability Index (CVI)</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Multi-dimensional vulnerability assessment</p>
                </div>
                <Select value={selectedMuni} onValueChange={setSelectedMuni}>
                  <SelectTrigger className="w-[160px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_MUNICIPALITIES.map((m) => (
                      <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
                    <Radar name="CVI Score" dataKey="score" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {selectedMuniData && (
                <div className="rounded-lg border border-[#16A34A]/20 bg-[#16A34A]/5 p-3 text-center mt-3">
                  <p className="text-[11px] text-zinc-500">Composite CVI Score</p>
                  <p className="text-3xl font-bold text-[#16A34A] tabular-nums">{selectedMuniData.climateRiskScore}</p>
                  <p className="text-[10px] text-zinc-600">{selectedMuniData.name} · {selectedMuniData.province}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dam Level Tracker */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Droplets className="size-4 text-[#3B82F6]" />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Dam Level Tracker</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Weekly vs long-term average levels</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DAM_TREND_WEEKLY} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => `${v}%`} />
                    <Line type="monotone" dataKey="vaal" stroke="#EF4444" strokeWidth={2} dot={false} name="Vaal" />
                    <Line type="monotone" dataKey="theewaters" stroke="#10B981" strokeWidth={2} dot={false} name="Theewaterskloof" />
                    <Line type="monotone" dataKey="gariep" stroke="#F59E0B" strokeWidth={2} dot={false} name="Gariep" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {DAM_LEVELS.sort((a, b) => a.current - b.current).map((dam) => (
                    <div key={dam.name} className="flex items-center gap-3 text-[11px]">
                      <span className="text-zinc-400 w-32 shrink-0 truncate">{dam.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className={cn('h-full rounded-full', dam.current >= 70 ? 'bg-emerald-400' : dam.current >= 50 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${dam.current}%` }} />
                      </div>
                      <span className={cn('font-semibold tabular-nums w-12 text-right', dam.current >= 70 ? 'text-emerald-400' : dam.current >= 50 ? 'text-amber-400' : 'text-red-400')}>
                        {dam.current}%
                      </span>
                      <span className="text-zinc-600 w-12 text-right">avg {dam.longTermAvg}%</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Top 20 Most Vulnerable ───────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="size-4 text-[#16A34A]" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Top 20 Most Climate-Vulnerable Municipalities</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ranked by composite Climate Vulnerability Index</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {TOP_VULNERABLE.map((muni, i) => (
                  <motion.div
                    key={muni.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-md text-xs font-bold shrink-0" style={{
                        backgroundColor: muni.cvi >= 60 ? '#EF444420' : muni.cvi >= 40 ? '#F59E0B20' : '#3B82F620',
                        color: muni.cvi >= 60 ? '#EF4444' : muni.cvi >= 40 ? '#F59E0B' : '#3B82F6',
                      }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300">{muni.name}</p>
                        <p className="text-[10px] text-zinc-600">{muni.province}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[9px] text-zinc-600">Drought</p>
                          <p className="text-[11px] font-semibold text-red-400 tabular-nums">{muni.droughtRisk.toFixed(0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-zinc-600">Flood</p>
                          <p className="text-[11px] font-semibold text-amber-400 tabular-nums">{muni.floodRisk.toFixed(0)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-zinc-600">Water</p>
                          <p className="text-[11px] font-semibold text-[#3B82F6] tabular-nums">{muni.waterStress.toFixed(0)}</p>
                        </div>
                        <div className="text-center min-w-[48px]">
                          <p className="text-[9px] text-zinc-600">CVI</p>
                          <p className="text-lg font-bold tabular-nums" style={{ color: muni.cvi >= 60 ? '#EF4444' : muni.cvi >= 40 ? '#F59E0B' : '#3B82F6' }}>
                            {muni.cvi}
                          </p>
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
    </div>
  );
}
