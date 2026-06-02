'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Vote,
  MapPin,
  Building2,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileBarChart,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_WARD_PROFILES, MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatNumber, formatPercent, getScoreBand } from '@/lib/formatters';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

// ── Extended Ward Data ──────────────────────────────────────────────────────

const EXTENDED_WARDS = [
  ...MOCK_WARD_PROFILES,
  { code: 'TSH-025', municipalityCode: 'TSH', municipalityName: 'City of Tshwane', province: 'Gauteng', incumbentParty: 'ANC', serviceDeliveryScore: 62, population: 41200, povertyRate: 28.5, waterAccess: 92.3, sanitationAccess: 88.5, electricityAccess: 94.1 },
  { code: 'CPT-080', municipalityCode: 'CPT', municipalityName: 'City of Cape Town', province: 'Western Cape', incumbentParty: 'DA', serviceDeliveryScore: 78, population: 32400, povertyRate: 18.2, waterAccess: 97.8, sanitationAccess: 96.1, electricityAccess: 98.2 },
  { code: 'EKU-010', municipalityCode: 'EKU', municipalityName: 'Ekurhuleni', province: 'Gauteng', incumbentParty: 'ANC', serviceDeliveryScore: 45, population: 58700, povertyRate: 42.8, waterAccess: 80.5, sanitationAccess: 72.3, electricityAccess: 85.2 },
  { code: 'MAN-005', municipalityCode: 'MAN', municipalityName: 'Mangaung', province: 'Free State', incumbentParty: 'ANC', serviceDeliveryScore: 28, population: 45200, povertyRate: 65.4, waterAccess: 55.8, sanitationAccess: 42.1, electricityAccess: 68.5 },
  { code: 'SOL-012', municipalityCode: 'SOL', municipalityName: 'Sol Plaatje', province: 'Northern Cape', incumbentParty: 'ANC', serviceDeliveryScore: 58, population: 28900, povertyRate: 35.8, waterAccess: 88.2, sanitationAccess: 82.5, electricityAccess: 91.8 },
  { code: 'NMB-030', municipalityCode: 'NMB', municipalityName: 'Nelson Mandela Bay', province: 'Eastern Cape', incumbentParty: 'DA', serviceDeliveryScore: 52, population: 35600, povertyRate: 45.2, waterAccess: 78.5, sanitationAccess: 70.2, electricityAccess: 82.8 },
  { code: 'RUST-015', municipalityCode: 'RUST', municipalityName: 'Rustenburg', province: 'North West', incumbentParty: 'ANC', serviceDeliveryScore: 48, population: 32100, povertyRate: 40.5, waterAccess: 82.1, sanitationAccess: 75.3, electricityAccess: 86.8 },
  { code: 'STE-008', municipalityCode: 'STE', municipalityName: 'Stellenbosch', province: 'Western Cape', incumbentParty: 'DA', serviceDeliveryScore: 88, population: 22500, povertyRate: 12.8, waterAccess: 99.5, sanitationAccess: 98.8, electricityAccess: 99.2 },
  { code: 'MSU-020', municipalityCode: 'MSU', municipalityName: 'Msunduzi', province: 'KwaZulu-Natal', incumbentParty: 'ANC', serviceDeliveryScore: 35, population: 41800, povertyRate: 55.2, waterAccess: 68.5, sanitationAccess: 58.2, electricityAccess: 75.8 },
  { code: 'JHB-060', municipalityCode: 'JHB', municipalityName: 'City of Johannesburg', province: 'Gauteng', incumbentParty: 'ANC', serviceDeliveryScore: 50, population: 61200, povertyRate: 38.5, waterAccess: 85.8, sanitationAccess: 78.5, electricityAccess: 88.2 },
  { code: 'CPT-020', municipalityCode: 'CPT', municipalityName: 'City of Cape Town', province: 'Western Cape', incumbentParty: 'DA', serviceDeliveryScore: 72, population: 38500, povertyRate: 20.5, waterAccess: 96.2, sanitationAccess: 94.5, electricityAccess: 97.8 },
  { code: 'ETH-060', municipalityCode: 'ETH', municipalityName: 'eThekwini', province: 'KwaZulu-Natal', incumbentParty: 'ANC', serviceDeliveryScore: 32, population: 55800, povertyRate: 58.8, waterAccess: 62.5, sanitationAccess: 50.8, electricityAccess: 70.2 },
];

// ── Party Performance Data ──────────────────────────────────────────────────

const PARTY_PERFORMANCE = [
  { party: 'ANC', municipalities: 165, avgFHS: 32, avgSDS: 58, cleanAuditPct: 8.5, wards: 3200, color: '#22C55E' },
  { party: 'DA', municipalities: 35, avgFHS: 68, avgSDS: 22, cleanAuditPct: 42.8, wards: 850, color: '#3B82F6' },
  { party: 'EFF', municipalities: 5, avgFHS: 28, avgSDS: 65, cleanAuditPct: 0, wards: 120, color: '#EF4444' },
  { party: 'IFP', municipalities: 12, avgFHS: 35, avgSDS: 55, cleanAuditPct: 12, wards: 280, color: '#8B5CF6' },
  { party: 'Coalition', municipalities: 40, avgFHS: 40, avgSDS: 48, cleanAuditPct: 15, wards: 518, color: '#F59E0B' },
];

// ── Manifesto Data ──────────────────────────────────────────────────────────

const MANIFESTO_DOMAINS = ['Water & Sanitation', 'Electricity', 'Housing', 'Employment', 'Education', 'Healthcare'];

const MANIFESTO_DATA: Record<string, Record<string, { promise: number; reality: number }>> = {
  ANC: { 'Water & Sanitation': { promise: 95, reality: 78 }, Electricity: { promise: 98, reality: 86 }, Housing: { promise: 80, reality: 42 }, Employment: { promise: 70, reality: 35 }, Education: { promise: 90, reality: 65 }, Healthcare: { promise: 85, reality: 55 } },
  DA: { 'Water & Sanitation': { promise: 99, reality: 96 }, Electricity: { promise: 99, reality: 97 }, Housing: { promise: 75, reality: 58 }, Employment: { promise: 65, reality: 52 }, Education: { promise: 92, reality: 82 }, Healthcare: { promise: 88, reality: 72 } },
  EFF: { 'Water & Sanitation': { promise: 100, reality: 65 }, Electricity: { promise: 100, reality: 72 }, Housing: { promise: 100, reality: 28 }, Employment: { promise: 100, reality: 25 }, Education: { promise: 100, reality: 55 }, Healthcare: { promise: 100, reality: 42 } },
};

// ── Pricing Packs ───────────────────────────────────────────────────────────

const PRICING_PACKS = [
  { tier: 'Ward', price: 'R750', features: ['Ward service delivery profile', 'Demographic breakdown', 'Historical voting patterns', 'PDF report'], popular: false },
  { tier: 'Municipality', price: 'R5,000', features: ['All ward profiles', 'Financial health analysis', 'Procurement intelligence', 'Party accountability matrix', 'PDF + DOCX'], popular: true },
  { tier: 'Province', price: 'R25,000', features: ['All municipality profiles', 'Provincial comparison tables', 'Trend analysis 2016-2026', 'Custom indicators', 'PDF + DOCX + PPTX'], popular: false },
  { tier: 'Custom', price: 'R50,000+', features: ['Bespoke research agenda', 'Dedicated analyst support', 'Real-time data feeds', 'API access', 'White-label options', 'All formats'], popular: false },
];

// ── Helper ──────────────────────────────────────────────────────────────────

function getSDSColor(score: number): string {
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#F97316';
  return '#EF4444';
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ElectionLens() {
  const [selectedParty, setSelectedParty] = useState('ANC');
  const [selectedDomain, setSelectedDomain] = useState('Water & Sanitation');

  const radarData = useMemo(() => {
    const partyData = MANIFESTO_DATA[selectedParty];
    if (!partyData) return [];
    return MANIFESTO_DOMAINS.map((domain) => ({
      domain,
      Promise: partyData[domain]?.promise ?? 0,
      Reality: partyData[domain]?.reality ?? 0,
    }));
  }, [selectedParty]);

  const partyBarData = useMemo(() => {
    return PARTY_PERFORMANCE.map((p) => ({
      party: p.party,
      FHS: p.avgFHS,
      SDS: p.avgSDS,
      CleanAudit: Math.round(p.cleanAuditPct),
    }));
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1D4ED8]/10 border border-[#1D4ED8]/20">
            <Vote className="size-5 text-[#1D4ED8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">ElectionLens</h1>
            <p className="text-xs text-zinc-500">2026 LGE ward accountability intelligence</p>
          </div>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Wards', value: '4,468', icon: MapPin, color: '#1D4ED8' },
          { label: 'Municipalities', value: '257', icon: Building2, color: '#7B2D8E' },
          { label: 'Ruling Parties', value: '5+', icon: Users, color: '#B45309' },
          { label: 'Wards Profiled', value: String(EXTENDED_WARDS.length), icon: FileBarChart, color: '#2D6A4F' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
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

      {/* ── Ward Accountability Map ──────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Ward Accountability Map</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">Stylised grid — each cell represents a ward, coloured by composite service delivery score</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              {EXTENDED_WARDS.map((ward, i) => (
                <motion.div
                  key={ward.code}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="group relative"
                >
                  <div
                    className="size-8 rounded cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 hover:ring-1 hover:ring-white/30"
                    style={{ backgroundColor: getSDSColor(ward.serviceDeliveryScore), opacity: 0.4 + (ward.serviceDeliveryScore / 100) * 0.6 }}
                    title={`${ward.code}: SDS ${ward.serviceDeliveryScore} | ${ward.incumbentParty}`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-44">
                    <div className="bg-[#0d1224] border border-white/[0.1] rounded-lg p-2.5 text-[11px] shadow-xl">
                      <p className="font-semibold text-zinc-200">{ward.code}</p>
                      <p className="text-zinc-400">{ward.municipalityName}</p>
                      <Separator className="my-1.5 bg-white/[0.06]" />
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                        <span className="text-zinc-500">SDS:</span>
                        <span className="text-zinc-300 font-medium">{ward.serviceDeliveryScore}</span>
                        <span className="text-zinc-500">Party:</span>
                        <span className="text-zinc-300 font-medium">{ward.incumbentParty}</span>
                        <span className="text-zinc-500">Water:</span>
                        <span className="text-zinc-300">{formatPercent(ward.waterAccess)}</span>
                        <span className="text-zinc-500">Poverty:</span>
                        <span className="text-zinc-300">{formatPercent(ward.povertyRate)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] text-zinc-500">Service Delivery Score:</span>
              {[
                { label: '0-30', color: '#EF4444' },
                { label: '30-50', color: '#F97316' },
                { label: '50-70', color: '#F59E0B' },
                { label: '70-100', color: '#10B981' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="size-3 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] text-zinc-500">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Municipal Performance by Party ───────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Municipal Performance by Party</CardTitle>
              <p className="text-[11px] text-zinc-500 mt-0.5">Average scores by ruling party</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partyBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="party" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} />
                    <Bar dataKey="FHS" fill="#3B82F6" radius={[2,2,0,0]} barSize={14} name="Avg FHS" />
                    <Bar dataKey="CleanAudit" fill="#10B981" radius={[2,2,0,0]} barSize={14} name="Clean Audit %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-500 text-[10px]">Party</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Munis</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Avg FHS</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Avg SDS</TableHead>
                    <TableHead className="text-zinc-500 text-[10px] text-right">Clean %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PARTY_PERFORMANCE.map((p) => (
                    <TableRow key={p.party} className="border-white/[0.04] hover:bg-white/[0.03]">
                      <TableCell className="text-xs font-medium flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                        <span className="text-zinc-300">{p.party}</span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{p.municipalities}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: p.avgFHS >= 50 ? '#10B981' : '#F97316' }}>{p.avgFHS}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: p.avgSDS <= 40 ? '#10B981' : '#F97316' }}>{p.avgSDS}</TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: p.cleanAuditPct >= 20 ? '#10B981' : '#F97316' }}>{formatPercent(p.cleanAuditPct)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Manifesto vs Reality ──────────────────────────── */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">Manifesto vs Reality</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Campaign promises vs actual delivery</p>
                </div>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger className="w-[90px] h-7 text-[11px] border-white/[0.08] bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANC">ANC</SelectItem>
                    <SelectItem value="DA">DA</SelectItem>
                    <SelectItem value="EFF">EFF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
                    <Radar name="Promise" dataKey="Promise" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Reality" dataKey="Reality" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-3 bg-white/[0.06]" />
              <div className="space-y-2">
                {MANIFESTO_DOMAINS.map((domain) => {
                  const data = MANIFESTO_DATA[selectedParty]?.[domain];
                  if (!data) return null;
                  const gap = data.promise - data.reality;
                  return (
                    <div key={domain} className="flex items-center gap-3 text-[11px]">
                      <span className="text-zinc-400 w-32 shrink-0">{domain}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${data.reality}%` }} />
                        </div>
                      </div>
                      <span className={cn('font-semibold tabular-nums w-10 text-right', gap > 30 ? 'text-red-400' : gap > 15 ? 'text-amber-400' : 'text-emerald-400')}>
                        -{gap}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Election Intelligence Packs ──────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show">
        <div className="flex items-center gap-2 mb-3">
          <FileBarChart className="size-4 text-[#1D4ED8]" />
          <h2 className="text-sm font-semibold text-zinc-200">Election Intelligence Packs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICING_PACKS.map((pack) => (
            <motion.div key={pack.tier} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
              <Card className={cn(
                'border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden relative',
                pack.popular && 'border-[#1D4ED8]/40'
              )}>
                {pack.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1D4ED8]" />
                )}
                {pack.popular && (
                  <Badge className="absolute top-2 right-2 bg-[#1D4ED8]/20 text-[#1D4ED8] border-[#1D4ED8]/30 text-[9px] h-5 px-1.5">Popular</Badge>
                )}
                <CardContent className="p-5">
                  <p className="text-sm font-bold text-zinc-200">{pack.tier}</p>
                  <p className="text-2xl font-bold text-[#1D4ED8] mt-1">{pack.price}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">per report</p>
                  <Separator className="my-3 bg-white/[0.06]" />
                  <ul className="space-y-1.5">
                    {pack.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <CheckCircle2 className="size-3 text-[#1D4ED8] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4 h-8 text-[11px] bg-[#1D4ED8]/20 text-[#1D4ED8] border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/30" variant="outline">
                    Get Pack
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
