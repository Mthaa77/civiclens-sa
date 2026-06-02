'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronRight,
  CheckCircle2,
  FileBarChart,
  Users,
  Shield,
  Info,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_WARD_PROFILES } from '@/lib/mock-data';
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
import { Button } from '@/components/ui/button';
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

const cardEntrance = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
};

// ── Animated Count-Up Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200, startOnMount: boolean = true) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!startOnMount) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, startOnMount]);

  return count;
}

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  accentFrom = '#f43f5e',
  accentTo = '#f59e0b',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  accentFrom?: string;
  accentTo?: string;
}) {
  return (
    <motion.div variants={itemSlideUp} className="flex items-center gap-3">
      <div
        className="w-1 h-10 rounded-full shrink-0"
        style={{ background: `linear-gradient(180deg, ${accentFrom}, ${accentTo})` }}
      />
      <div className="flex items-center gap-2.5">
        <Icon className="size-4.5" style={{ color: accentFrom }} />
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
          {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

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

function getSDSColorRich(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#D97706';
  if (score >= 30) return '#EA580C';
  return '#DC2626';
}

function getGapColor(gap: number): string {
  if (gap > 30) return '#EF4444';
  if (gap > 15) return '#F59E0B';
  return '#10B981';
}

// ── Ward Tooltip Component ──────────────────────────────────────────────────

function WardTooltip({ ward }: { ward: typeof EXTENDED_WARDS[number] }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none">
      <div className="bg-[#0d1224]/95 backdrop-blur-xl border border-white/[0.12] rounded-lg p-3 text-[11px] shadow-2xl">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-semibold text-zinc-100">{ward.code}</p>
          <Badge className="h-4 px-1.5 text-[9px] bg-white/[0.06] text-zinc-300 border-white/[0.08]">
            {ward.incumbentParty}
          </Badge>
        </div>
        <p className="text-zinc-400 text-[10px]">{ward.municipalityName}</p>
        <Separator className="my-2 bg-white/[0.08]" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span className="text-zinc-500">SDS:</span>
          <span className="font-semibold" style={{ color: getSDSColorRich(ward.serviceDeliveryScore) }}>{ward.serviceDeliveryScore}</span>
          <span className="text-zinc-500">Water:</span>
          <span className="text-zinc-300">{formatPercent(ward.waterAccess)}</span>
          <span className="text-zinc-500">Sanitation:</span>
          <span className="text-zinc-300">{formatPercent(ward.sanitationAccess)}</span>
          <span className="text-zinc-500">Poverty:</span>
          <span className="text-zinc-300">{formatPercent(ward.povertyRate)}</span>
          <span className="text-zinc-500">Population:</span>
          <span className="text-zinc-300">{formatNumber(ward.population)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Animated Stat Card ──────────────────────────────────────────────────────

function AnimatedStatCard({
  label,
  value,
  numericValue,
  icon: Icon,
  color,
  subtitle,
  accentIndex,
}: {
  label: string;
  value: string;
  numericValue: number;
  icon: React.ElementType;
  color: string;
  subtitle: string;
  accentIndex: number;
}) {
  const count = useCountUp(numericValue, 1000 + accentIndex * 200);
  const displayValue = numericValue > 0 ? count.toLocaleString('en-ZA') : value;

  return (
    <motion.div
      variants={cardEntrance}
      whileHover={{ scale: 1.03, y: -3 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="card-hover-lift"
    >
      <Card className="relative border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.15] transition-all duration-300 overflow-hidden group">
        {/* Gradient accent line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-90"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}66, transparent)` }}
        />
        {/* Subtle hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 30px ${color}08, 0 0 20px ${color}06` }}
        />
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
              <Icon className="size-5" style={{ color }} />
            </div>
          </div>
          <p className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color }}>{displayValue}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mt-1">{label}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ElectionLens() {
  const [selectedParty, setSelectedParty] = useState('ANC');
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);

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

  const partyColors = useMemo(() => {
    return PARTY_PERFORMANCE.reduce<Record<string, string>>((acc, p) => {
      acc[p.party] = p.color;
      return acc;
    }, {});
  }, []);

  return (
    <div className="space-y-6 bg-grid-pattern min-h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-4">
          {/* Gradient accent bar */}
          <div className="w-1 h-10 rounded-full shrink-0 bg-gradient-to-b from-rose-400 to-amber-400" />
          {/* Icon with animated glow pulse */}
          <div className="relative">
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Vote className="size-5 text-rose-400" />
            </div>
            <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-rose-400/30 pointer-events-none" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
                ElectionLens
              </h1>
              <Badge className="badge-premium badge-phase2 text-[9px] h-5 px-2">
                2026 LGE
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="h-5 px-2 text-[9px] bg-white/[0.04] text-zinc-400 border-white/[0.08] backdrop-blur-sm">
                <Shield className="size-3 mr-1 text-amber-400" />
                Ward Accountability
              </Badge>
              <span className="text-[10px] text-zinc-600">|</span>
              <span className="text-[11px] text-zinc-500">Local Government Election Intelligence</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <AnimatedStatCard
          label="Total Wards"
          value="4,468"
          numericValue={4468}
          icon={MapPin}
          color="#f43f5e"
          subtitle="Across 257 municipalities"
          accentIndex={0}
        />
        <AnimatedStatCard
          label="Municipalities"
          value="257"
          numericValue={257}
          icon={Building2}
          color="#f59e0b"
          subtitle="8 metros, 44 districts"
          accentIndex={1}
        />
        <AnimatedStatCard
          label="Ruling Parties"
          value="5+"
          numericValue={5}
          icon={Users}
          color="#10b981"
          subtitle="ANC, DA, EFF, IFP, Coalitions"
          accentIndex={2}
        />
        <AnimatedStatCard
          label="Wards Profiled"
          value={String(EXTENDED_WARDS.length)}
          numericValue={EXTENDED_WARDS.length}
          icon={FileBarChart}
          color="#0ea5e9"
          subtitle="With full service delivery data"
          accentIndex={3}
        />
      </motion.div>

      {/* ── Ward Accountability Map ──────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-gradient-to-b from-rose-400 to-amber-400" />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-100">Ward Accountability Map</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Each cell represents a ward, coloured by composite service delivery score</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Info className="size-3" />
                <span>Click a ward for details</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-white/[0.015] border border-white/[0.04]">
              {EXTENDED_WARDS.map((ward, i) => (
                <motion.div
                  key={ward.code}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="group relative"
                  onMouseEnter={() => setHoveredWard(ward.code)}
                  onMouseLeave={() => setHoveredWard(null)}
                >
                  <div
                    className={cn(
                      'size-8 sm:size-10 rounded-md cursor-pointer transition-all duration-200 border border-white/[0.04]',
                      'hover:scale-110 hover:z-10',
                    )}
                    style={{
                      backgroundColor: getSDSColorRich(ward.serviceDeliveryScore),
                      opacity: 0.35 + (ward.serviceDeliveryScore / 100) * 0.65,
                      boxShadow: hoveredWard === ward.code
                        ? `0 0 12px ${getSDSColorRich(ward.serviceDeliveryScore)}40, 0 0 4px ${getSDSColorRich(ward.serviceDeliveryScore)}60`
                        : 'none',
                      borderColor: hoveredWard === ward.code
                        ? `${getSDSColorRich(ward.serviceDeliveryScore)}80`
                        : 'rgba(255,255,255,0.04)',
                      transform: hoveredWard === ward.code ? 'scale(1.1)' : undefined,
                    }}
                    title={`${ward.code}: SDS ${ward.serviceDeliveryScore} | ${ward.incumbentParty}`}
                  />
                  {/* Tooltip */}
                  {hoveredWard === ward.code && (
                    <WardTooltip ward={ward} />
                  )}
                </motion.div>
              ))}
            </div>
            {/* Gradient Legend */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 shrink-0">Service Delivery Score:</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(90deg, #DC2626, #EA580C, #D97706, #10B981, #059669)',
                }} />
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-zinc-500">0 — Critical</span>
                <span className="text-[10px] text-zinc-500">30</span>
                <span className="text-[10px] text-zinc-500">50</span>
                <span className="text-[10px] text-zinc-500">70</span>
                <span className="text-[10px] text-zinc-500">100 — Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Municipal Performance by Party ───────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
            {/* Section header with accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-rose-500/60 via-amber-500/40 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-rose-400 to-amber-400" />
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-100">Municipal Performance by Party</CardTitle>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Average scores by ruling party</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px] sm:h-[220px] md:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partyBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="party" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7', backdropFilter: 'blur(12px)' }} />
                    <Bar dataKey="FHS" fill="#3B82F6" radius={[3,3,0,0]} barSize={14} name="Avg FHS" />
                    <Bar dataKey="CleanAudit" fill="#10B981" radius={[3,3,0,0]} barSize={14} name="Clean Audit %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4 bg-white/[0.06]" />
              {/* Premium Table */}
              <div className="rounded-lg border border-white/[0.06] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-white/[0.04] to-white/[0.02] hover:bg-white/[0.04] border-b border-white/[0.08]">
                      <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Party</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Munis</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Avg FHS</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Avg SDS</TableHead>
                      <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Clean %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PARTY_PERFORMANCE.map((p, idx) => (
                      <TableRow
                        key={p.party}
                        className={cn(
                          'border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-200',
                          idx % 2 === 0 ? 'bg-white/[0.015]' : '',
                        )}
                        style={{ borderLeft: `3px solid ${p.color}` }}
                      >
                        <TableCell className="text-xs font-medium flex items-center gap-2 py-2.5">
                          <div className="size-2.5 rounded-full ring-1 ring-white/[0.1]" style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}40` }} />
                          <span className="text-zinc-200">{p.party}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{p.municipalities}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: getScoreBand(p.avgFHS).color.includes('emerald') || getScoreBand(p.avgFHS).color.includes('green') ? '#10B981' : getScoreBand(p.avgFHS).color.includes('amber') ? '#F59E0B' : '#F97316' }}>{p.avgFHS}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: p.avgSDS <= 30 ? '#10B981' : p.avgSDS <= 50 ? '#F59E0B' : '#F97316' }}>{p.avgSDS}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: p.cleanAuditPct >= 20 ? '#10B981' : p.cleanAuditPct >= 10 ? '#F59E0B' : '#F97316' }}>{formatPercent(p.cleanAuditPct)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Manifesto vs Reality ──────────────────────────── */}
        <motion.div variants={itemFadeIn}>
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
            {/* Section header with accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/60 via-rose-500/40 to-transparent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-rose-400" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-100">Manifesto vs Reality</CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-zinc-500">Campaign promises vs actual delivery</p>
                      <Badge className="h-4 px-1.5 text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                        Gap Analysis
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              {/* Party Selector Pills */}
              <div className="flex items-center gap-1.5 mt-3">
                {Object.keys(MANIFESTO_DATA).map((party) => {
                  const partyColor = partyColors[party] || '#6B7280';
                  const isActive = selectedParty === party;
                  return (
                    <button
                      key={party}
                      onClick={() => setSelectedParty(party)}
                      className={cn(
                        'h-7 px-3 rounded-full text-[11px] font-semibold transition-all duration-200',
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-zinc-400 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300',
                      )}
                      style={isActive ? {
                        background: `linear-gradient(135deg, ${partyColor}30, ${partyColor}15)`,
                        border: `1px solid ${partyColor}50`,
                        boxShadow: `0 0 12px ${partyColor}20`,
                      } : undefined}
                    >
                      {party}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px] sm:h-[240px] md:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} />
                    <Radar name="Promise" dataKey="Promise" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }} />
                    <Radar name="Reality" dataKey="Reality" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.12} strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2 }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7', backdropFilter: 'blur(12px)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4 bg-white/[0.06]" />
              {/* Gap Analysis Table */}
              <div className="space-y-2.5">
                {MANIFESTO_DOMAINS.map((domain) => {
                  const data = MANIFESTO_DATA[selectedParty]?.[domain];
                  if (!data) return null;
                  const gap = data.promise - data.reality;
                  return (
                    <motion.div
                      key={domain}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-[11px] text-zinc-400 w-32 shrink-0 truncate">{domain}</span>
                      <div className="flex-1 space-y-1">
                        {/* Promise bar background */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 w-10 shrink-0">Promise</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-amber-500/70"
                              initial={{ width: 0 }}
                              animate={{ width: `${data.promise}%` }}
                              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500 tabular-nums w-7 text-right">{data.promise}%</span>
                        </div>
                        {/* Reality bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 w-10 shrink-0">Reality</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: `${getGapColor(gap)}90` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${data.reality}%` }}
                              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500 tabular-nums w-7 text-right">{data.reality}%</span>
                        </div>
                      </div>
                      <span
                        className="font-bold tabular-nums text-[11px] w-12 text-right shrink-0"
                        style={{ color: getGapColor(gap) }}
                      >
                        -{gap}%
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Election Intelligence Packs ──────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show">
        <SectionHeader
          icon={Crown}
          title="Election Intelligence Packs"
          subtitle="Premium ward-level intelligence for 2026 LGE"
          accentFrom="#f43f5e"
          accentTo="#f59e0b"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {PRICING_PACKS.map((pack) => {
            const tierAccents: Record<string, { from: string; to: string; glow: string }> = {
              'Ward': { from: '#0ea5e9', to: '#06b6d4', glow: '#0ea5e9' },
              'Municipality': { from: '#f43f5e', to: '#f59e0b', glow: '#f43f5e' },
              'Province': { from: '#8b5cf6', to: '#6366f1', glow: '#8b5cf6' },
              'Custom': { from: '#10b981', to: '#059669', glow: '#10b981' },
            };
            const accent = tierAccents[pack.tier] || tierAccents['Ward'];

            return (
              <motion.div
                key={pack.tier}
                variants={cardEntrance}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="card-hover-lift"
              >
                <Card className={cn(
                  'relative border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 overflow-hidden group',
                  pack.popular ? `border-[${accent.from}]/30` : 'hover:border-white/[0.15]',
                )}
                style={pack.popular ? { borderColor: `${accent.from}40` } : undefined}
                >
                  {/* Gradient top accent line */}
                  <div
                    className="h-[2px] w-full"
                    style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to}, transparent)` }}
                  />

                  {/* Popular badge with pulse */}
                  {pack.popular && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="relative text-[9px] h-5 px-2 font-bold animate-pulse" style={{
                        background: `linear-gradient(135deg, ${accent.from}30, ${accent.to}25)`,
                        border: `1px solid ${accent.from}40`,
                        color: accent.from,
                      }}>
                        <Zap className="size-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-bold text-zinc-100">{pack.tier}</p>
                      {pack.tier === 'Custom' && (
                        <Badge className="h-4 px-1.5 text-[8px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Enterprise
                        </Badge>
                      )}
                    </div>
                    <p className="text-3xl font-extrabold tabular-nums tracking-tight" style={{
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {pack.price}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">per report</p>

                    <Separator className="my-4 bg-white/[0.06]" />

                    <ul className="space-y-2">
                      {pack.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[11px] text-zinc-300">
                          <CheckCircle2 className="size-3.5 shrink-0" style={{ color: accent.from }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full mt-5 h-9 text-[11px] font-semibold border-0 transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${accent.from}25, ${accent.to}20)`,
                        color: accent.from,
                        border: `1px solid ${accent.from}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${accent.from}40, ${accent.to}35)`;
                        e.currentTarget.style.boxShadow = `0 0 16px ${accent.glow}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${accent.from}25, ${accent.to}20)`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Select Plan
                      <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </CardContent>

                  {/* Hover border glow */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 20px ${accent.glow}06, 0 0 20px ${accent.glow}08` }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <div className="flex items-center justify-between py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Vote className="size-3.5 text-rose-400/60" />
            <span className="text-[10px] text-zinc-600">ElectionLens v1.0 — Ward Accountability Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-700">Data: IEC, Stats SA, MFMA 2023/24</span>
            <span className="text-[9px] text-zinc-700">•</span>
            <span className="text-[9px] text-zinc-700">Simulated for demo</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
