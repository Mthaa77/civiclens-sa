'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Treemap,
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
  RefreshCw,
  Loader2,
  GitCompareArrows,
  Users,
  ArrowLeftRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Brain,
  Gavel,
  FileCheck,
  Droplets,
  Eye,
  Activity,
  Wifi,
  Cpu,
  Server,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_KPIS,
  AUDIT_OUTCOMES_DISTRIBUTION,
  PROVINCE_SUMMARY,
  SERVICE_DELIVERY_BY_PROVINCE,
  MOCK_RISK_SIGNALS,
  MOCK_TENDERS,
  MOCK_MUNICIPALITIES,
} from '@/lib/mock-data';
import {
  formatCompactZAR,
  formatNumber,
  formatSADate,
  formatPopulation,
  getScoreBand,
  getSeverityStyle,
} from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import DataExport from '@/components/shared/DataExport';
import WatchlistWidget from '@/components/shared/WatchlistWidget';
import MunicipalityComparisonModal from '@/components/shared/MunicipalityComparisonModal';
import type { ModuleId, ExportColumn } from '@/types';

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

const listItemStagger = {
  hidden: { opacity: 0, x: -12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
};

// ── Province Abbreviations ──────────────────────────────────────────────────

const PROVINCE_ABBREVIATIONS: Record<string, string> = {
  'Eastern Cape': 'EC',
  'Free State': 'FS',
  'Gauteng': 'GP',
  'KwaZulu-Natal': 'KZN',
  'Limpopo': 'LP',
  'Mpumalanga': 'MP',
  'Northern Cape': 'NC',
  'North West': 'NW',
  'Western Cape': 'WC',
};

// ── Province Accent Colors ──────────────────────────────────────────────────

const PROVINCE_ACCENT_COLORS: Record<string, string> = {
  'Gauteng': '#0077B6',
  'Western Cape': '#22C55E',
  'KwaZulu-Natal': '#F59E0B',
  'Eastern Cape': '#EF4444',
  'Free State': '#8B5CF6',
  'Limpopo': '#2D6A4F',
  'Mpumalanga': '#F97316',
  'North West': '#06B6D4',
  'Northern Cape': '#EC4899',
};

// ── Tender Category Colors ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Infrastructure': '#3B82F6',
  'Water & Sanitation': '#06B6D4',
  'ICT': '#8B5CF6',
  'Professional Services': '#F59E0B',
  'Health': '#10B981',
  'Energy': '#F97316',
  'Education': '#22C55E',
  'Transport': '#EF4444',
  'Housing': '#EC4899',
  'Waste Management': '#6B7280',
  'Security': '#DC2626',
  'Agriculture': '#84CC16',
};

// ── KPI Card Data ───────────────────────────────────────────────────────────

interface KPICardData {
  label: string;
  value: string;
  rawValue: number;
  trend: { direction: 'up' | 'down'; value: string };
  sentiment: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: React.ReactNode;
  microIcon: React.ReactNode;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  targetModule: ModuleId;
  targetPct: number;
  sparkline: number[];
}

const kpiCards: KPICardData[] = [
  {
    label: 'Total Municipalities',
    value: formatNumber(DASHBOARD_KPIS.totalMunicipalities),
    rawValue: DASHBOARD_KPIS.totalMunicipalities,
    trend: { direction: 'up', value: '+2' },
    sentiment: 'neutral',
    icon: <Building2 className="size-5" />,
    microIcon: <Building2 className="size-3" />,
    accentColor: '#0077B6',
    gradientFrom: 'from-[#0077B6]/10',
    gradientTo: 'to-[#0077B6]/[0.02]',
    targetModule: 'munilens' as ModuleId,
    targetPct: 88,
    sparkline: [240, 243, 248, 250, 253, 255, 257],
  },
  {
    label: 'Municipalities in Distress',
    value: formatNumber(DASHBOARD_KPIS.municipalitiesInDistress),
    rawValue: DASHBOARD_KPIS.municipalitiesInDistress,
    trend: { direction: 'up', value: '+8.2%' },
    sentiment: 'negative',
    icon: <AlertTriangle className="size-5" />,
    microIcon: <AlertTriangle className="size-3" />,
    accentColor: '#EF4444',
    gradientFrom: 'from-[#EF4444]/10',
    gradientTo: 'to-[#EF4444]/[0.02]',
    targetModule: 'munilens' as ModuleId,
    targetPct: 63,
    sparkline: [140, 145, 150, 158, 162, 160, 162],
  },
  {
    label: 'Active Tenders',
    value: formatNumber(DASHBOARD_KPIS.activeTenders),
    rawValue: DASHBOARD_KPIS.activeTenders,
    trend: { direction: 'up', value: '+12.4%' },
    sentiment: 'neutral',
    icon: <FileSearch className="size-5" />,
    microIcon: <FileSearch className="size-3" />,
    accentColor: '#2D6A4F',
    gradientFrom: 'from-[#2D6A4F]/10',
    gradientTo: 'to-[#2D6A4F]/[0.02]',
    targetModule: 'tenderlens' as ModuleId,
    targetPct: 72,
    sparkline: [1600, 1680, 1720, 1780, 1810, 1830, 1847],
  },
  {
    label: 'Total Tender Value',
    value: formatCompactZAR(DASHBOARD_KPIS.totalTenderValue),
    rawValue: DASHBOARD_KPIS.totalTenderValue,
    trend: { direction: 'up', value: '+5.7%' },
    sentiment: 'neutral',
    icon: <DollarSign className="size-5" />,
    microIcon: <DollarSign className="size-3" />,
    accentColor: '#B45309',
    gradientFrom: 'from-[#B45309]/10',
    gradientTo: 'to-[#B45309]/[0.02]',
    targetModule: 'tenderlens' as ModuleId,
    targetPct: 56,
    sparkline: [420, 440, 460, 480, 490, 500, 478],
  },
  {
    label: 'Active Risk Signals',
    value: formatNumber(DASHBOARD_KPIS.riskSignalsActive),
    rawValue: DASHBOARD_KPIS.riskSignalsActive,
    trend: { direction: 'up', value: '+14.3%' },
    sentiment: 'warning',
    icon: <ShieldAlert className="size-5" />,
    microIcon: <ShieldAlert className="size-3" />,
    accentColor: '#F59E0B',
    gradientFrom: 'from-[#F59E0B]/10',
    gradientTo: 'to-[#F59E0B]/[0.02]',
    targetModule: 'risklens' as ModuleId,
    targetPct: 78,
    sparkline: [180, 195, 210, 220, 228, 230, 234],
  },
  {
    label: 'Section 139 Interventions',
    value: formatNumber(DASHBOARD_KPIS.section139Interventions),
    rawValue: DASHBOARD_KPIS.section139Interventions,
    trend: { direction: 'up', value: '+3' },
    sentiment: 'negative',
    icon: <AlertOctagon className="size-5" />,
    microIcon: <AlertOctagon className="size-3" />,
    accentColor: '#DC2626',
    gradientFrom: 'from-[#DC2626]/10',
    gradientTo: 'to-[#DC2626]/[0.02]',
    targetModule: 'earlyalert' as ModuleId,
    targetPct: 41,
    sparkline: [30, 32, 35, 37, 40, 41, 43],
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

// ── Helper: Get FHS indicator dot color ──────────────────────────────────────

function getFHSIndicatorColor(score: number): string {
  if (score >= 65) return '#10B981'; // green
  if (score >= 45) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

// ── Mini Map Province SVG Paths (simplified for widget) ─────────────────────

const MINI_MAP_PROVINCES = [
  { id: 'limpopo', name: 'Limpopo', path: 'M 265,8 L 290,5 L 330,10 L 370,20 L 410,18 L 440,30 L 465,55 L 460,80 L 440,100 L 420,115 L 395,120 L 370,130 L 345,125 L 320,115 L 295,110 L 270,105 L 250,95 L 240,75 L 245,50 L 255,30 Z', labelX: 355, labelY: 70 },
  { id: 'mpumalanga', name: 'Mpumalanga', path: 'M 420,115 L 440,100 L 460,80 L 465,55 L 490,70 L 510,90 L 520,115 L 515,145 L 500,170 L 480,185 L 460,190 L 440,180 L 420,165 L 400,155 L 395,135 L 395,120 Z', labelX: 465, labelY: 135 },
  { id: 'gauteng', name: 'Gauteng', path: 'M 370,130 L 395,120 L 395,135 L 400,155 L 390,165 L 375,170 L 360,165 L 350,155 L 345,140 Z', labelX: 372, labelY: 148 },
  { id: 'north-west', name: 'North West', path: 'M 240,75 L 250,95 L 270,105 L 295,110 L 320,115 L 345,125 L 345,140 L 350,155 L 360,165 L 350,180 L 335,195 L 310,205 L 280,210 L 250,205 L 220,195 L 195,180 L 180,160 L 175,140 L 185,120 L 200,100 L 220,85 Z', labelX: 275, labelY: 160 },
  { id: 'free-state', name: 'Free State', path: 'M 350,180 L 360,165 L 375,170 L 390,165 L 400,155 L 420,165 L 440,180 L 460,190 L 455,215 L 440,240 L 420,260 L 395,270 L 370,275 L 340,270 L 310,260 L 285,245 L 270,225 L 275,210 L 280,210 L 310,205 L 335,195 Z', labelX: 365, labelY: 225 },
  { id: 'kwazulu-natal', name: 'KwaZulu-Natal', path: 'M 460,190 L 480,185 L 500,170 L 515,190 L 525,215 L 530,245 L 525,275 L 515,305 L 500,330 L 480,350 L 460,365 L 445,370 L 440,355 L 440,335 L 435,315 L 420,295 L 410,275 L 420,260 L 440,240 L 455,215 Z', labelX: 480, labelY: 280 },
  { id: 'northern-cape', name: 'Northern Cape', path: 'M 30,110 L 50,90 L 80,75 L 110,70 L 140,72 L 170,78 L 195,80 L 220,85 L 200,100 L 185,120 L 175,140 L 180,160 L 195,180 L 220,195 L 250,205 L 275,210 L 270,225 L 285,245 L 270,260 L 245,275 L 215,285 L 185,290 L 155,295 L 130,300 L 105,305 L 80,300 L 60,280 L 40,255 L 25,225 L 15,195 L 10,165 L 15,135 L 20,120 Z', labelX: 150, labelY: 195 },
  { id: 'western-cape', name: 'Western Cape', path: 'M 80,300 L 105,305 L 130,300 L 155,295 L 185,290 L 215,285 L 210,305 L 200,325 L 190,345 L 175,365 L 155,385 L 135,400 L 115,410 L 95,415 L 75,410 L 58,395 L 45,375 L 35,350 L 30,325 L 32,310 L 45,300 L 60,295 Z', labelX: 125, labelY: 355 },
  { id: 'eastern-cape', name: 'Eastern Cape', path: 'M 215,285 L 245,275 L 270,260 L 285,245 L 310,260 L 340,270 L 370,275 L 395,270 L 410,275 L 420,295 L 435,315 L 440,335 L 440,355 L 445,370 L 430,380 L 410,395 L 385,405 L 355,410 L 325,408 L 295,400 L 265,390 L 240,375 L 220,355 L 205,335 L 195,315 L 200,305 L 210,305 Z', labelX: 320, labelY: 345 },
];

// ── Province Quick-Select Navigation Cards ────────────────────────────────────

function ProvinceQuickSelect() {
  const { setActiveModule } = useNavigationStore();

  const handleProvinceClick = () => {
    setActiveModule('geolens' as ModuleId);
  };

  return (
    <motion.div variants={itemSlideUp}>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Navigation className="size-3.5 text-[#B45309]" />
        <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Quick Province Navigation</span>
      </div>
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {PROVINCE_SUMMARY.map((prov, i) => {
          const fhsColor = getFHSBarColor(prov.avgFHS);
          const indicatorColor = getFHSIndicatorColor(prov.avgFHS);
          const accent = PROVINCE_ACCENT_COLORS[prov.province] || '#B45309';
          const abbrev = PROVINCE_ABBREVIATIONS[prov.province] || prov.province.slice(0, 3).toUpperCase();

          return (
            <motion.button
              key={prov.province}
              variants={itemSlideUp}
              custom={i}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleProvinceClick}
              className="flex-shrink-0 w-[100px] sm:w-[110px] rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-2.5 sm:p-3 cursor-pointer group transition-all duration-300 hover:border-white/[0.16] text-left min-h-[44px]"
              style={{ boxShadow: `0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)` }}
            >
              {/* Top mini accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-xl opacity-70"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}60, transparent)`, boxShadow: `0 0 6px ${accent}30` }}
              />

              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: indicatorColor, boxShadow: `0 0 6px ${indicatorColor}60` }}
                />
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-200 truncate">{abbrev}</span>
              </div>

              {/* Mini progress bar for FHS */}
              <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: fhsColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(prov.avgFHS, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-medium">FHS</span>
                <span className="text-[9px] sm:text-[10px] font-bold tabular-nums" style={{ color: fhsColor }}>{prov.avgFHS}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Mini Interactive Map Widget ────────────────────────────────────────────────

function MiniMapWidget() {
  const { setActiveModule } = useNavigationStore();
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const handleProvinceClick = () => {
    setActiveModule('geolens' as ModuleId);
  };

  const getProvinceFHS = (name: string): number => {
    const prov = PROVINCE_SUMMARY.find(p => p.province === name);
    return prov ? prov.avgFHS : 0;
  };

  return (
    <motion.div variants={itemSlideUp}>
      <Card
        className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, #B45309, #F59E0B, transparent)', boxShadow: '0 0 10px rgba(180,83,9,0.2)' }}
        />
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-5 items-center justify-center rounded bg-[#B45309]/10 border border-[#B45309]/20">
              <Map className="size-3 text-[#B45309]" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-200">Spatial Overview</span>
          </div>

          {/* SVG Map */}
          <div className="relative w-full" style={{ height: '220px' }}>
            <svg
              viewBox="0 0 550 430"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
            >
              <defs>
                <filter id="miniMapGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="miniBgSpotlight" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#B45309" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background */}
              <rect width="550" height="430" fill="url(#miniBgSpotlight)" rx="8" />

              {/* Province paths */}
              {MINI_MAP_PROVINCES.map((geo) => {
                const fhs = getProvinceFHS(geo.name);
                const color = getFHSBarColor(fhs);
                const isHovered = hoveredProvince === geo.id;

                return (
                  <g key={geo.id}>
                    <path
                      d={geo.path}
                      fill={`${color}B3`}
                      stroke={isHovered ? '#fff' : '#0d1224'}
                      strokeWidth={isHovered ? 2 : 1.5}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        filter: isHovered ? 'url(#miniMapGlow)' : 'none',
                        fillOpacity: isHovered ? 1 : 0.8,
                      }}
                      onClick={handleProvinceClick}
                      onMouseEnter={() => setHoveredProvince(geo.id)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    />
                    {/* Province abbreviation label */}
                    <text
                      x={geo.labelX}
                      y={geo.labelY}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="9"
                      fontWeight="700"
                      style={{
                        pointerEvents: 'none',
                        opacity: isHovered ? 1 : 0.7,
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      }}
                    >
                      {PROVINCE_ABBREVIATIONS[geo.name] || geo.name.slice(0, 3).toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Color legend */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] text-zinc-500">≥65</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-amber-500" />
              <span className="text-[8px] text-zinc-500">45–64</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-orange-500" />
              <span className="text-[8px] text-zinc-500">25–44</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-red-500" />
              <span className="text-[8px] text-zinc-500">&lt;25</span>
            </div>
          </div>

          {/* Click hint */}
          <p className="text-[8px] text-zinc-600 mt-1.5 text-center">Click any province to explore in GeoLens</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── System Health Monitor Widget ──────────────────────────────────────────────

function SystemHealthMonitor() {
  const healthItems = [
    { label: 'API Uptime', value: '99.97%', color: '#10B981', barPct: 99.97, icon: <Server className="size-3" /> },
    { label: 'Data Sync', value: '2 min ago', color: '#10B981', isDot: true, icon: <Wifi className="size-3" /> },
    { label: 'ML Model Accuracy', value: '94.2%', color: '#F59E0B', barPct: 94.2, icon: <Cpu className="size-3" /> },
    { label: 'Active Users', value: '847', color: '#0077B6', isDot: true, icon: <Users className="size-3" /> },
  ];

  return (
    <motion.div
      variants={itemSlideUp}
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden relative"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)' }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
        style={{ background: 'linear-gradient(90deg, #10B981, #F59E0B, #0077B6, transparent)', boxShadow: '0 0 8px rgba(16,185,129,0.15)' }}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 p-2.5 sm:p-3">
        {/* Section label */}
        <div className="flex items-center gap-1.5 shrink-0 sm:pr-3 sm:border-r border-white/[0.06]">
          <Activity className="size-3 text-emerald-500/70" />
          <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">System Health</span>
        </div>

        {/* Health items */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:pl-3 flex-1">
          {healthItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1">
                <div style={{ color: `${item.color}80` }}>{item.icon}</div>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium">{item.label}</span>
              </div>

              {item.isDot ? (
                /* Colored indicator dot */
                <div className="flex items-center gap-1">
                  <div
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                  />
                  <span className="text-[9px] sm:text-[10px] font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                </div>
              ) : (
                /* Mini progress bar */
                <div className="flex items-center gap-1.5">
                  <div className="w-12 sm:w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.barPct || 0}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ title, subtitle, accentColor = '#0077B6', action }: { title: string; subtitle?: string; accentColor?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="w-[3px] h-5 sm:h-7 rounded-full shrink-0"
          style={{
            background: `linear-gradient(180deg, ${accentColor}, ${accentColor}60)`,
            boxShadow: `0 0 12px ${accentColor}30`,
          }}
        />
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-tight">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────

function KPICard({ data, index }: { data: KPICardData; index: number }) {
  const { setActiveModule } = useNavigationStore();

  const handleClick = () => {
    setActiveModule(data.targetModule);
  };

  // SVG progress ring config
  const ringRadius = 18;
  const ringStroke = 3;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (data.targetPct / 100) * ringCircumference;

  // Sparkline config
  const sparkW = 60;
  const sparkH = 18;
  const sparkData = data.sparkline;
  const sparkMin = Math.min(...sparkData);
  const sparkMax = Math.max(...sparkData);
  const sparkRange = sparkMax - sparkMin || 1;
  const sparkPoints = sparkData.map((v, i) => {
    const x = (i / (sparkData.length - 1)) * sparkW;
    const y = sparkH - ((v - sparkMin) / sparkRange) * (sparkH - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      variants={itemSlideUp}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative group cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/[0.10] p-3 sm:p-4 lg:p-5 xl:p-6',
          'bg-gradient-to-br',
          data.gradientFrom,
          data.gradientTo,
          'backdrop-blur-xl transition-all duration-300 cursor-pointer',
          'hover:shadow-xl hover:shadow-black/30'
        )}
        style={{
          cursor: 'pointer',
          borderColor: undefined,
          boxShadow: `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 40px ${data.accentColor}0C, inset 0 0 80px ${data.accentColor}06, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${data.accentColor}35`;
          e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.35), inset 0 1px 50px ${data.accentColor}15, inset 0 0 100px ${data.accentColor}08, 0 0 30px ${data.accentColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 40px ${data.accentColor}0C, inset 0 0 80px ${data.accentColor}06, inset 0 1px 0 rgba(255,255,255,0.04)`;
        }}
      >
        {/* Animated gradient border on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            padding: '1px',
            background: `linear-gradient(135deg, ${data.accentColor}50, transparent 40%, transparent 60%, ${data.accentColor}30)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Top accent line — enhanced with glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-90"
          style={{
            background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}60, transparent)`,
            boxShadow: `0 0 8px ${data.accentColor}40`,
          }}
        />

        {/* Subtle background pattern — diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              ${data.accentColor}15 8px,
              ${data.accentColor}15 9px
            )`,
          }}
        />

        {/* Inner glow effect — deeper on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 60px ${data.accentColor}14`,
          }}
        />

        {/* Shimmer effect on hover — KPI shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${data.accentColor}10 40%, ${data.accentColor}18 50%, ${data.accentColor}10 60%, transparent 100%)`,
            }}
          />
        </div>

        {/* Background glow — three layers for depth */}
        <div
          className="absolute -top-10 -right-10 size-32 rounded-full opacity-[0.06] blur-3xl group-hover:opacity-[0.18] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />
        <div
          className="absolute -bottom-6 -left-6 size-24 rounded-full opacity-[0.04] blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 rounded-full opacity-[0.02] blur-3xl group-hover:opacity-[0.06] transition-opacity duration-500"
          style={{ backgroundColor: data.accentColor }}
        />

        <div className="relative flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 sm:mb-1.5">
              {data.label}
            </p>
            {/* KPI value with count-up animation */}
            <motion.p
              className="text-xl sm:text-2xl lg:text-[2rem] font-extrabold tabular-nums tracking-tight leading-none"
              style={{ color: data.accentColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
            >
              {data.value}
            </motion.p>
            <div className="flex items-center gap-1.5 mt-2">
              {data.trend.direction === 'up' ? (
                <TrendingUp
                  className={cn(
                    'size-3.5',
                    data.sentiment === 'negative'
                      ? 'text-red-400'
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
                  'text-[10px] sm:text-xs font-semibold tabular-nums',
                  data.sentiment === 'negative'
                    ? 'text-red-400'
                    : data.sentiment === 'warning'
                      ? 'text-amber-400'
                      : data.sentiment === 'positive'
                        ? 'text-emerald-400'
                        : 'text-emerald-400'
                )}
              >
                {data.trend.value}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 ml-0.5 hidden sm:inline">vs prev. year</span>
            </div>
          </div>

          {/* Icon with SVG progress ring */}
          <div className="relative shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg width="44" height="44" className="absolute -top-1 -left-1">
              <circle
                cx="22" cy="22" r={ringRadius}
                fill="none"
                stroke={`${data.accentColor}15`}
                strokeWidth={ringStroke}
              />
              <motion.circle
                cx="22" cy="22" r={ringRadius}
                fill="none"
                stroke={data.accentColor}
                strokeWidth={ringStroke}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                initial={{ strokeDashoffset: ringCircumference }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.08, ease: [0.4, 0, 0.2, 1] }}
                transform="rotate(-90 22 22)"
                style={{ opacity: 0.7 }}
              />
            </svg>
            <div
              className="relative flex size-10 items-center justify-center rounded-lg"
              style={{
                background: `${data.accentColor}18`,
                border: `1px solid ${data.accentColor}30`,
              }}
            >
              <div style={{ color: data.accentColor }}>{data.icon}</div>
            </div>
          </div>
        </div>

        {/* Micro sparkline chart at bottom */}
        <div className="relative mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-medium">7-day trend</span>
            <span className="text-[8px] sm:text-[9px] font-bold tabular-nums" style={{ color: data.accentColor }}>{data.targetPct}% of target</span>
          </div>
          <svg width={sparkW} height={sparkH} className="mt-0.5 sm:mt-1 overflow-visible w-full max-w-[60px]">
            <motion.polyline
              points={sparkPoints}
              fill="none"
              stroke={data.accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.6, pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.5 + index * 0.08 }}
            />
            {/* Gradient fill under the line */}
            <motion.polyline
              points={`0,${sparkH} ${sparkPoints} ${sparkW},${sparkH}`}
              fill={`${data.accentColor}08`}
              stroke="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 + index * 0.08 }}
            />
          </svg>
        </div>

        {/* Quick Action dropdown (appears on hover, touch-friendly) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="flex flex-col gap-0.5 bg-[#0d1224]/95 backdrop-blur-xl border border-white/[0.1] rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveModule(data.targetModule); }}
              className="flex items-center gap-1.5 px-2 py-1.5 min-h-[32px] text-[9px] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100 active:bg-white/[0.1] transition-colors whitespace-nowrap"
            >
              <Eye className="size-2.5" />
              View
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toast.success('Data exported successfully'); }}
              className="flex items-center gap-1.5 px-2 py-1.5 min-h-[32px] text-[9px] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100 active:bg-white/[0.1] transition-colors whitespace-nowrap"
            >
              <Download className="size-2.5" />
              Export
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toast.success('Alert created'); }}
              className="flex items-center gap-1.5 px-2 py-1.5 min-h-[32px] text-[9px] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100 active:bg-white/[0.1] transition-colors whitespace-nowrap"
            >
              <ShieldAlert className="size-2.5" />
              Alert
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── AI Insights Data ────────────────────────────────────────────────────────

interface AIInsight {
  type: 'Trend' | 'Alert' | 'Anomaly' | 'Prediction';
  severity: 'green' | 'amber' | 'red';
  title: string;
  description: string;
  source: string;
}

const AI_INSIGHTS: AIInsight[] = [
  {
    type: 'Trend',
    severity: 'amber',
    title: 'Municipal Financial Health Declining in 3 Provinces',
    description: 'Eastern Cape, Limpopo, and Free State show consecutive 3-year FHS declines. Combined impact affects 94 municipalities and R42B in operational budgets.',
    source: 'MFMA 2023/24 Cycle',
  },
  {
    type: 'Alert',
    severity: 'red',
    title: 'Section 139 Interventions Up 18% Year-on-Year',
    description: '43 municipalities now under intervention, up from 36. KwaZulu-Natal accounts for 7 new interventions, the highest provincial increase.',
    source: 'CoGTA Quarterly Report',
  },
  {
    type: 'Anomaly',
    severity: 'amber',
    title: 'Procurement Concentration Risk Detected in Gauteng',
    description: '72% of Gauteng health procurement awards directed to 3 suppliers in Q3. Pattern suggests potential bid rotation and requires auditor review.',
    source: 'CivicLens Procurement Analysis',
  },
  {
    type: 'Prediction',
    severity: 'green',
    title: 'Western Cape Projected to Achieve 85% Clean Audit by 2027',
    description: 'Based on current trajectory analysis, Western Cape is on track to improve from 62% to 85% clean audit outcomes within the MTEF period.',
    source: 'AGSA Trend Analysis',
  },
  {
    type: 'Trend',
    severity: 'green',
    title: 'Service Delivery Access Improving in Urban Metro Areas',
    description: 'Metropolitan municipalities show 4.2% improvement in average service delivery scores, driven by water infrastructure investment in eThekwini and Cape Town.',
    source: 'Stats SA Community Survey',
  },
  {
    type: 'Alert',
    severity: 'red',
    title: 'Cash Coverage Below 30 Days for 67 Municipalities',
    description: '67 municipalities report cash coverage under 30 days, indicating severe liquidity stress. 23 of these are in the Eastern Cape alone.',
    source: 'National Treasury MFMA Report',
  },
];

const INSIGHT_TYPE_STYLES: Record<string, string> = {
  Trend: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Alert: 'bg-red-500/15 text-red-400 border-red-500/25',
  Anomaly: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Prediction: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

const INSIGHT_SEVERITY_COLORS: Record<string, string> = {
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
};

// ── AI Insights Panel Component ──────────────────────────────────────────────

function AIInsightsPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AI_INSIGHTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + AI_INSIGHTS.length) % AI_INSIGHTS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % AI_INSIGHTS.length);
  };

  const currentInsight = AI_INSIGHTS[currentIndex];

  return (
    <motion.div variants={itemSlideUp}>
      <Card
        className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top accent line — teal/emerald gradient with glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ background: 'linear-gradient(90deg, #0D9488, #10B981, transparent)', boxShadow: '0 0 10px rgba(13,148,136,0.3)' }}
        />

        {/* Background glow — three layers for depth */}
        <div
          className="absolute -top-16 -right-16 size-52 rounded-full opacity-[0.05] blur-3xl"
          style={{ backgroundColor: '#0D9488' }}
        />
        <div
          className="absolute -bottom-12 -left-12 size-36 rounded-full opacity-[0.04] blur-2xl"
          style={{ backgroundColor: '#10B981' }}
        />
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 size-40 rounded-full opacity-[0.02] blur-3xl"
          style={{ backgroundColor: '#0D9488' }}
        />

        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6 relative">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/25">
                <Sparkles className="size-4.5 text-teal-400" />
                {/* Animated glow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(13, 148, 136, 0)',
                      '0 0 12px rgba(13, 148, 136, 0.3)',
                      '0 0 0px rgba(13, 148, 136, 0)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div>
                <h3
                  className="text-sm sm:text-base font-extrabold tracking-tight"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #0D9488, #10B981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  AI Insights
                </h3>
              </div>
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 font-semibold uppercase tracking-wider hidden sm:inline-flex">
                Powered by CivicLens AI
              </Badge>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={goToPrev}
                className="flex size-8 sm:size-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-zinc-400 hover:text-zinc-200 active:bg-white/[0.1]"
              >
                <ChevronLeft className="size-4 sm:size-3.5" />
              </button>
              <button
                onClick={goToNext}
                className="flex size-8 sm:size-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-zinc-400 hover:text-zinc-200 active:bg-white/[0.1]"
              >
                <ChevronRight className="size-4 sm:size-3.5" />
              </button>
            </div>
          </div>

          {/* Insight content with AnimatePresence */}
          <div className="relative min-h-[80px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-2.5"
              >
                {/* Type badge + Severity indicator + Title */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-0.5">
                    <Badge className={cn('text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-semibold', INSIGHT_TYPE_STYLES[currentInsight.type])}>
                      {currentInsight.type}
                    </Badge>
                    <div
                      className="size-1.5 sm:size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: INSIGHT_SEVERITY_COLORS[currentInsight.severity],
                        boxShadow: `0 0 6px ${INSIGHT_SEVERITY_COLORS[currentInsight.severity]}60`,
                      }}
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug">
                    {currentInsight.title}
                  </h4>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed pl-0 line-clamp-3 sm:line-clamp-none">
                  {currentInsight.description}
                </p>

                {/* Source attribution */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <FileSearch className="size-3 text-teal-500/60" />
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium">{currentInsight.source}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-1.5 mt-3 sm:mt-4">
            {AI_INSIGHTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'rounded-full transition-all duration-300 min-w-[24px] min-h-[24px] flex items-center justify-center',
                  idx === currentIndex
                    ? 'w-5 h-1.5 bg-teal-400'
                    : 'w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400'
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Budget Treemap Data ──────────────────────────────────────────────────────

interface TreemapDataItem {
  name: string;
  category: string;
  size: number;
  color: string;
}

const BUDGET_TREEMAP_DATA: TreemapDataItem[] = [
  { name: 'Gauteng', category: 'Education', size: 45.2, color: '#3B82F6' },
  { name: 'Gauteng', category: 'Health', size: 38.7, color: '#3B82F6' },
  { name: 'Gauteng', category: 'Infrastructure', size: 28.3, color: '#3B82F6' },
  { name: 'KwaZulu-Natal', category: 'Education', size: 42.1, color: '#10B981' },
  { name: 'KwaZulu-Natal', category: 'Health', size: 35.6, color: '#10B981' },
  { name: 'KwaZulu-Natal', category: 'Infrastructure', size: 22.4, color: '#10B981' },
  { name: 'Western Cape', category: 'Education', size: 32.8, color: '#8B5CF6' },
  { name: 'Western Cape', category: 'Health', size: 28.5, color: '#8B5CF6' },
  { name: 'Western Cape', category: 'Infrastructure', size: 19.2, color: '#8B5CF6' },
  { name: 'Eastern Cape', category: 'Education', size: 28.4, color: '#F59E0B' },
  { name: 'Eastern Cape', category: 'Health', size: 24.1, color: '#F59E0B' },
  { name: 'Eastern Cape', category: 'Infrastructure', size: 15.7, color: '#F59E0B' },
  { name: 'Limpopo', category: 'Education', size: 22.3, color: '#EF4444' },
  { name: 'Limpopo', category: 'Health', size: 19.8, color: '#EF4444' },
  { name: 'Limpopo', category: 'Infrastructure', size: 12.1, color: '#EF4444' },
  { name: 'Free State', category: 'Education', size: 15.2, color: '#06B6D4' },
  { name: 'Free State', category: 'Health', size: 12.7, color: '#06B6D4' },
  { name: 'Free State', category: 'Infrastructure', size: 8.4, color: '#06B6D4' },
  { name: 'Mpumalanga', category: 'Education', size: 18.6, color: '#84CC16' },
  { name: 'Mpumalanga', category: 'Health', size: 15.3, color: '#84CC16' },
  { name: 'Mpumalanga', category: 'Infrastructure', size: 10.8, color: '#84CC16' },
  { name: 'North West', category: 'Education', size: 14.1, color: '#F97316' },
  { name: 'North West', category: 'Health', size: 11.6, color: '#F97316' },
  { name: 'North West', category: 'Infrastructure', size: 7.9, color: '#F97316' },
  { name: 'Northern Cape', category: 'Education', size: 8.9, color: '#EC4899' },
  { name: 'Northern Cape', category: 'Health', size: 7.2, color: '#EC4899' },
  { name: 'Northern Cape', category: 'Infrastructure', size: 4.8, color: '#EC4899' },
];

const TREEMAP_PROVINCE_LEGEND = [
  { name: 'Gauteng', color: '#3B82F6' },
  { name: 'KwaZulu-Natal', color: '#10B981' },
  { name: 'Western Cape', color: '#8B5CF6' },
  { name: 'Eastern Cape', color: '#F59E0B' },
  { name: 'Limpopo', color: '#EF4444' },
  { name: 'Free State', color: '#06B6D4' },
  { name: 'Mpumalanga', color: '#84CC16' },
  { name: 'North West', color: '#F97316' },
  { name: 'Northern Cape', color: '#EC4899' },
];

const TOTAL_BUDGET = BUDGET_TREEMAP_DATA.reduce((sum, d) => sum + d.size, 0);

// ── Custom Treemap Content ───────────────────────────────────────────────────

interface CustomTreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  category?: string;
  size?: number;
  color?: string;
  depth?: number;
  index?: number;
}

function CustomTreemapContent(props: CustomTreemapContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, category, size, color } = props;

  if (width < 2 || height < 2) return null;

  const showLabel = width > 55 && height > 30;
  const showCategory = width > 75 && height > 48;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#0d1224"
        strokeWidth={2}
        fill={color ? `${color}B3` : '#71717aB3'}
        style={{ rx: 3 }}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCategory ? 7 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 11 : 9}
          fontWeight="700"
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      {showCategory && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={8}
          fontWeight="500"
          style={{ pointerEvents: 'none' }}
        >
          {category} · R{size}B
        </text>
      )}
    </g>
  );
}

// ── Custom Treemap Tooltip ───────────────────────────────────────────────────

function TreemapTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: TreemapDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const percentage = ((data.size / TOTAL_BUDGET) * 100).toFixed(1);
  return (
    <div className="bg-[rgba(13,18,36,0.95)] border border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="size-2.5 rounded-sm" style={{ backgroundColor: data.color, boxShadow: `0 0 6px ${data.color}40` }} />
        <span className="font-bold text-zinc-100">{data.name}</span>
      </div>
      <div className="text-zinc-300 font-medium">{data.category}</div>
      <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/[0.06]">
        <span className="text-zinc-200 font-bold">R{data.size}B</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-400">{percentage}%</span>
      </div>
    </div>
  );
}

// ── Budget Treemap Chart Component ───────────────────────────────────────────

function BudgetTreemapChart() {
  const { setActiveModule } = useNavigationStore();

  const handleProvinceClick = () => {
    setActiveModule('geolens' as ModuleId);
  };

  return (
    <motion.div variants={itemSlideUp}>
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {/* Top accent line with glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, #8B5CF6, #F59E0B, transparent)', boxShadow: '0 0 10px rgba(59,130,246,0.2)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5 sm:gap-2">
                <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-[#0D9488]/10 border border-[#0D9488]/20">
                  <Brain className="size-2.5 sm:size-3 text-[#0D9488]" />
                </span>
                Budget Allocation by Province
              </CardTitle>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                Provincial budget allocation (R Billions) — Education, Health, Infrastructure
              </p>
            </div>
            <div className="text-[10px] text-zinc-500 font-semibold tabular-nums">
              Total: R{TOTAL_BUDGET.toFixed(1)}B
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className="h-[200px] sm:h-[280px] md:h-[340px] cursor-pointer"
            onClick={handleProvinceClick}
          >
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={BUDGET_TREEMAP_DATA}
                dataKey="size"
                nameKey="name"
                content={<CustomTreemapContent />}
                stroke="#0d1224"
                aspectRatio={4 / 3}
              >
                <Tooltip
                  content={<TreemapTooltipContent />}
                  allowEscapeViewBox={{ x: false, y: true }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>

          {/* Province Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-white/[0.06]">
            {TREEMAP_PROVINCE_LEGEND.map((prov) => (
              <div key={prov.name} className="flex items-center gap-1.5 group/legend">
                <div
                  className="size-2.5 rounded-sm group-hover/legend:scale-125 transition-transform duration-200"
                  style={{
                    backgroundColor: prov.color,
                    boxShadow: `0 0 5px ${prov.color}40`,
                  }}
                />
                <span className="text-[10px] text-zinc-400 font-medium">{prov.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Audit Outcome Donut Chart ───────────────────────────────────────────────

function AuditOutcomeChart() {
  const total = AUDIT_OUTCOMES_DISTRIBUTION.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div variants={itemFadeIn}>
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, #0077B6, #2D6A4F, transparent)', boxShadow: '0 0 10px rgba(0,119,182,0.2)' }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5 sm:gap-2">
            <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-[#0077B6]/10 border border-[#0077B6]/20">
              <Shield className="size-2.5 sm:size-3 text-[#0077B6]" />
            </span>
            Audit Outcome Distribution
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
            2023/24 MFMA audit outcomes — {total} municipalities
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="relative w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={AUDIT_OUTCOMES_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
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
              {/* Center label with radial gradient background */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="absolute inset-[30%] rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, #0077B615 0%, transparent 70%)`,
                  }}
                />
                <span className="relative text-xl sm:text-2xl font-extrabold text-zinc-100 tabular-nums">{total}</span>
                <span className="relative text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 sm:space-y-2.5 w-full sm:w-auto">
              {AUDIT_OUTCOMES_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 group/legend">
                  <div
                    className="size-3 rounded-sm shrink-0 group-hover/legend:scale-125 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 6px ${item.color}40`,
                    }}
                  />
                  <span className="text-[10px] sm:text-xs text-zinc-300 flex-1 font-medium">{item.name}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-200 tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 tabular-nums w-8 sm:w-10 text-right font-semibold">
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
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, #2D6A4F, #F59E0B, transparent)', boxShadow: '0 0 10px rgba(45,106,79,0.2)' }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5 sm:gap-2">
            <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
              <TrendingUp className="size-2.5 sm:size-3 text-[#2D6A4F]" />
            </span>
            Provincial Financial Health
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
            Average Financial Health Score by province — colour-coded by score band
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px] sm:h-[250px] md:h-[280px]">
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
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="province"
                  width={95}
                  tick={{ fill: '#d4d4d8', fontSize: 9 }}
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
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {/* Module-themed accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
          style={{ background: 'linear-gradient(90deg, #3B82F6, #10B981, #F59E0B, transparent)', boxShadow: '0 0 10px rgba(59,130,246,0.2)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                  <Building2 className="size-2.5 sm:size-3 text-[#3B82F6]" />
                </span>
                Service Delivery by Province
              </CardTitle>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                Household access to basic services (%)
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {[
                { key: 'water', label: 'Water', color: SERVICE_COLORS.water },
                { key: 'sanitation', label: 'Sanitation', color: SERVICE_COLORS.sanitation },
                { key: 'electricity', label: 'Electricity', color: SERVICE_COLORS.electricity },
                { key: 'refuse', label: 'Refuse', color: SERVICE_COLORS.refuse },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-1.5 group/legend">
                  <div
                    className="size-2.5 rounded-sm group-hover/legend:scale-125 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 5px ${item.color}40`,
                    }}
                  />
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px] sm:h-[250px] md:h-[300px]">
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
                  tick={{ fill: '#d4d4d8', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#a1a1aa', fontSize: 10 }}
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
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-1.5 sm:gap-2">
                <span className="flex size-4 sm:size-5 items-center justify-center rounded bg-[#B45309]/10 border border-[#B45309]/20">
                  <Map className="size-2.5 sm:size-3 text-[#B45309]" />
                </span>
                Provincial Intelligence Table
              </CardTitle>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                Key metrics by province — click row to explore in GeoLens
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-white/[0.08] text-zinc-400 text-[9px] sm:text-[10px] cursor-pointer hover:border-[#B45309]/30 hover:text-[#B45309] transition-all min-h-[32px]"
              onClick={handleRowClick}
            >
              <Map className="size-3 mr-1" />
              Open Map
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{
                    borderBottom: '1px solid transparent',
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.1), rgba(255,255,255,0.06))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                >
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    Province
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-right">
                    Munis
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-right">
                    Avg FHS
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-right">
                    Avg SDS
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-right">
                    §139
                  </TableHead>
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-right">
                    Clean
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROVINCE_SUMMARY.map((prov, rowIdx) => {
                  const fhsBand = getScoreBand(prov.avgFHS);
                  const sdsBand = getScoreBand(100 - prov.avgSDS);
                  const provinceAccent = PROVINCE_ACCENT_COLORS[prov.province] || '#71717a';
                  return (
                    <TableRow
                      key={prov.province}
                      className={cn(
                        'cursor-pointer transition-colors',
                        rowIdx % 2 === 0 ? 'bg-white/[0.01]' : '',
                        'hover:bg-white/[0.04]'
                      )}
                      onClick={handleRowClick}
                      style={{
                        borderLeft: `3px solid ${provinceAccent}30`,
                      }}
                    >
                      <TableCell className="font-semibold text-zinc-200 text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: provinceAccent }}
                          />
                          {prov.province}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-zinc-300 text-[10px] sm:text-xs tabular-nums">
                        {prov.municipalities}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center text-[10px] sm:text-xs font-bold tabular-nums',
                            fhsBand.textColor
                          )}
                        >
                          {prov.avgFHS}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center text-[10px] sm:text-xs font-bold tabular-nums',
                            sdsBand.textColor
                          )}
                        >
                          {prov.avgSDS}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {prov.section139 > 0 ? (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[9px] sm:text-[10px] h-5 px-1 sm:px-1.5 font-semibold">
                            {prov.section139}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-[10px] sm:text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {prov.cleanAudit > 0 ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] sm:text-[10px] h-5 px-1 sm:px-1.5 font-semibold">
                            {prov.cleanAudit}
                          </Badge>
                        ) : (
                          <span className="text-zinc-500 text-[10px] sm:text-xs">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



// ── Municipality Comparison Widget ──────────────────────────────────────────

const COMPARISON_COLORS = ['#0077B6', '#2D6A4F', '#B45309'];

function MunicipalityComparison() {
  const [selected1, setSelected1] = useState('2'); // Johannesburg
  const [selected2, setSelected2] = useState('1'); // Cape Town
  const [selected3, setSelected3] = useState('3'); // eThekwini

  const municipalityOptions = MOCK_MUNICIPALITIES.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code,
  }));

  const getMunicipality = (id: string) => MOCK_MUNICIPALITIES.find((m) => m.id === id);

  const selectedMunicipalities = [selected1, selected2, selected3]
    .map((id) => getMunicipality(id))
    .filter(Boolean);

  const getAuditBadgeStyle = (outcome: string | null) => {
    switch (outcome) {
      case 'Clean': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'Unqualified': return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'Qualified': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'Adverse': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
      case 'Disclaimer': return 'bg-red-500/15 text-red-400 border-red-500/25';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
    }
  };

  const getSection139BadgeStyle = (status: string | null) => {
    switch (status) {
      case 'Intervention': return 'bg-red-500/15 text-red-400 border-red-500/25';
      case 'Warning': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'None': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-zinc-400';
    if (score >= 65) return 'text-emerald-400';
    if (score >= 45) return 'text-amber-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div variants={itemSlideUp}>
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#7B2D8E]/10 border border-[#7B2D8E]/20">
              <GitCompareArrows className="size-3.5 text-[#7B2D8E]" />
            </div>
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200">
                Municipality Comparison
              </CardTitle>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 mt-0.5">
                Select municipalities to compare key metrics side by side
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Select dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {[selected1, selected2, selected3].map((val, idx) => {
              const setter = [setSelected1, setSelected2, setSelected3][idx];
              const labels = ['Municipality A', 'Municipality B', 'Municipality C'];
              const colors = COMPARISON_COLORS;
              return (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: colors[idx] }} />
                    {labels[idx]}
                  </label>
                  <Select value={val} onValueChange={setter}>
                    <SelectTrigger
                      className="w-full bg-[#0d1224] text-zinc-300 text-xs h-8"
                      style={{ borderColor: `${colors[idx]}30` }}
                    >
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1224] border-white/[0.08]">
                      {municipalityOptions.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-zinc-300 text-xs focus:bg-white/[0.06] focus:text-zinc-100">
                          {m.name} ({m.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{
                    background: 'linear-gradient(90deg, rgba(0,119,182,0.04), rgba(45,106,79,0.04), rgba(180,83,9,0.04))',
                    borderBottom: '1px solid transparent',
                    backgroundImage: 'linear-gradient(to right, #0077B620, #2D6A4F20, #B4530920), linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.1), rgba(255,255,255,0.06))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                >
                  <TableHead className="text-zinc-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider w-[120px] sm:w-[160px]">
                    Metric
                  </TableHead>
                  {selectedMunicipalities.map((m, i) => {
                    return (
                      <TableHead
                        key={m!.id}
                        className="text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: COMPARISON_COLORS[i] }}
                      >
                        {m!.name}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Financial Health Score */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold">Financial Health Score</TableCell>
                  {selectedMunicipalities.map((m, i) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`fhs-${m!.id}-${m!.financialHealthScore}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={cn('text-xs sm:text-sm font-bold tabular-nums', getScoreColor(m!.financialHealthScore))}
                      >
                        {m!.financialHealthScore ?? '—'}/100
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Service Delivery Score */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold">Service Delivery Score</TableCell>
                  {selectedMunicipalities.map((m, i) => {
                    const sds = m!.serviceDeliveryScore !== null ? 100 - m!.serviceDeliveryScore : null;
                    return (
                      <TableCell key={m!.id} className="text-right">
                        <motion.span
                          key={`sds-${m!.id}-${m!.serviceDeliveryScore}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn('text-xs sm:text-sm font-bold tabular-nums', getScoreColor(sds))}
                        >
                          {m!.serviceDeliveryScore !== null ? `${m!.serviceDeliveryScore}/100` : '—'}
                        </motion.span>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* FHS vs SDS comparison row */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    <ArrowLeftRight className="size-3" /> FHS vs SDS Gap
                  </TableCell>
                  {selectedMunicipalities.map((m) => {
                    const fhs = m!.financialHealthScore ?? 0;
                    const sds = m!.serviceDeliveryScore ?? 0;
                    const gap = Math.abs(fhs - sds);
                    const gapColor = gap > 30 ? 'text-red-400' : gap > 15 ? 'text-amber-400' : 'text-emerald-400';
                    return (
                      <TableCell key={m!.id} className="text-right">
                        <motion.span
                          key={`gap-${m!.id}-${fhs}-${sds}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn('text-xs sm:text-sm font-bold tabular-nums', gapColor)}
                        >
                          {m!.financialHealthScore !== null && m!.serviceDeliveryScore !== null ? `${gap} pts` : '—'}
                        </motion.span>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* Audit Outcome */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold">Audit Outcome</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.div
                        key={`audit-${m!.id}-${m!.auditOutcome}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={cn('text-[10px] h-5 px-1.5 border font-semibold', getAuditBadgeStyle(m!.auditOutcome))}>
                          {m!.auditOutcome ?? '—'}
                        </Badge>
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Population */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Users className="size-3" /> Population
                  </TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`pop-${m!.id}-${m!.population2022}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-xs sm:text-sm font-semibold text-zinc-200 tabular-nums"
                      >
                        {formatPopulation(m!.population2022)}
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Section 139 Status */}
                <TableRow className="border-white/[0.04] bg-white/[0.01]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold">§139 Status</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.div
                        key={`s139-${m!.id}-${m!.section139Status}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className={cn('text-[10px] h-5 px-1.5 border font-semibold', getSection139BadgeStyle(m!.section139Status))}>
                          {m!.section139Status ?? '—'}
                        </Badge>
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
                {/* Province */}
                <TableRow className="border-white/[0.04]">
                  <TableCell className="text-[10px] sm:text-xs text-zinc-300 font-semibold">Province</TableCell>
                  {selectedMunicipalities.map((m) => (
                    <TableCell key={m!.id} className="text-right">
                      <motion.span
                        key={`prov-${m!.id}-${m!.province}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-[10px] sm:text-xs text-zinc-300 font-medium"
                      >
                        {m!.province}
                      </motion.span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
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
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 h-full overflow-hidden">
        {/* Accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B, transparent)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="size-3.5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200">
                  Recent Risk Signals
                </CardTitle>
                <p className="text-[9px] sm:text-[10px] text-zinc-400">
                  {DASHBOARD_KPIS.riskSignalsActive} active signals
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[260px] sm:max-h-[340px]">
            <div className="space-y-2.5">
              {recentSignals.map((signal, i) => {
                const severityStyle = getSeverityStyle(signal.severity);
                const severityColor = signal.severity === 'Critical' ? '#EF4444' : signal.severity === 'High' ? '#F97316' : signal.severity === 'Medium' ? '#F59E0B' : '#22C55E';
                return (
                  <motion.div
                    key={signal.id}
                    custom={i}
                    variants={listItemStagger}
                    initial="hidden"
                    animate="show"
                    className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.16] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                    style={{ borderLeft: `4px solid ${severityColor}` }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex items-center gap-1">
                        <Badge
                          className={cn(
                    'shrink-0 text-[8px] sm:text-[9px] h-5 px-1 sm:px-1.5 font-bold border',
                            severityStyle.bgColor,
                            severityStyle.color,
                            severityStyle.borderColor
                          )}
                          variant="outline"
                        >
                          {signal.severity}
                        </Badge>
                        {/* Critical pulse badge */}
                        {signal.severity === 'Critical' && (
                          <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 truncate">
                          {signal.type}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {signal.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {signal.entityId}
                          </span>
                          <span className="text-[10px] text-zinc-600">·</span>
                          <span className="text-[10px] text-zinc-400">
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
          <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveModule('risklens' as ModuleId)}
              className="group flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors min-h-[44px]"
            >
              <span className="relative">
                View all risk signals
                <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
              </span>
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveModule('risklens' as ModuleId)}
              className="h-8 sm:h-6 gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 min-w-[44px]"
            >
              Expand
              <ArrowRight className="size-2.5" />
            </Button>
          </div>
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
      <Card className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 h-full overflow-hidden">
        {/* Accent frame */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #2D6A4F, #B45309, transparent)' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#2D6A4F]/10 border border-[#2D6A4F]/20">
                <FileSearch className="size-3.5 text-[#2D6A4F]" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-zinc-200">
                  Active Tender Highlights
                </CardTitle>
                <p className="text-[9px] sm:text-[10px] text-zinc-400">
                  Top {activeTenders.length} by estimated value
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[260px] sm:max-h-[340px]">
            <div className="space-y-2.5">
              {activeTenders.map((tender, i) => {
                const categoryColor = CATEGORY_COLORS[tender.category] || '#71717a';
                return (
                  <motion.div
                    key={tender.id}
                    custom={i}
                    variants={listItemStagger}
                    initial="hidden"
                    animate="show"
                    className="group relative rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.16] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
                    style={{ borderLeft: `4px solid ${categoryColor}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 line-clamp-1 leading-snug">
                          {tender.title}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1">
                          {tender.buyerName}
                        </p>
                      </div>
                      <span className="text-[11px] sm:text-xs font-extrabold text-[#B45309] tabular-nums shrink-0">
                        {formatCompactZAR(tender.estimatedValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 font-semibold"
                        style={{
                          borderColor: `${categoryColor}30`,
                          color: categoryColor,
                          backgroundColor: `${categoryColor}10`,
                        }}
                      >
                        {tender.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Clock className="size-2.5" />
                        <span>Closes {formatSADate(tender.closingDate ?? '')}</span>
                        {/* Closing countdown badge */}
                        {tender.closingDate && (() => {
                          const daysToClose = Math.ceil((new Date(tender.closingDate).getTime() - new Date('2026-03-03').getTime()) / (1000 * 60 * 60 * 24));
                          if (daysToClose <= 14 && daysToClose > 0) {
                            return (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[8px] h-3.5 px-1',
                                  daysToClose <= 7
                                    ? 'bg-red-500/15 text-red-400 border-red-500/25'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                )}
                              >
                                {daysToClose}d left
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
          <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveModule('tenderlens' as ModuleId)}
              className="group flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors min-h-[44px]"
            >
              <span className="relative">
                View all tenders
                <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
              </span>
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveModule('tenderlens' as ModuleId)}
              className="h-8 sm:h-6 gap-1 text-[9px] text-zinc-500 hover:text-zinc-300 min-w-[44px]"
            >
              Expand
              <ArrowRight className="size-2.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Live Activity Feed Data & Component (CR-7-c) ───────────────────────────

type ActivityEventType = 'TenderAward' | 'RiskAlert' | 'AuditUpdate' | 'Section139' | 'ServiceUpdate';

interface ActivityEvent {
  type: ActivityEventType;
  text: string;
  entity: string;
  time: string;
}

const ACTIVITY_EVENTS: ActivityEvent[] = [
  { type: 'RiskAlert', text: 'New procurement anomaly detected in eThekwini Municipality', entity: 'KwaZulu-Natal', time: '2m ago' },
  { type: 'TenderAward', text: 'R245M water infrastructure tender awarded to City of Cape Town', entity: 'Western Cape', time: '5m ago' },
  { type: 'AuditUpdate', text: 'AGSA releases Q3 audit outcomes for Free State municipalities', entity: 'Free State', time: '12m ago' },
  { type: 'Section139', text: 'Section 139 intervention escalated in Mafikeng Local Municipality', entity: 'North West', time: '18m ago' },
  { type: 'ServiceUpdate', text: 'Water service delivery improved in Nelson Mandela Bay', entity: 'Eastern Cape', time: '25m ago' },
  { type: 'TenderAward', text: 'R89M IT modernisation contract published by Gauteng Health', entity: 'Gauteng', time: '32m ago' },
  { type: 'RiskAlert', text: 'Budget overrun alert: Limpopo education infrastructure exceeds 120% spend', entity: 'Limpopo', time: '45m ago' },
  { type: 'AuditUpdate', text: 'Clean audit maintained by Western Cape for 5th consecutive year', entity: 'Western Cape', time: '1h ago' },
  { type: 'Section139', text: 'Administrator appointed for Emfuleni Local Municipality', entity: 'Gauteng', time: '1h ago' },
  { type: 'ServiceUpdate', text: 'Electricity access reaches 92% in Mpumalanga district municipalities', entity: 'Mpumalanga', time: '2h ago' },
  { type: 'TenderAward', text: 'R156M road rehabilitation tender published for KZN municipalities', entity: 'KwaZulu-Natal', time: '2h ago' },
  { type: 'RiskAlert', text: 'Supplier concentration risk flagged in Northern Cape health procurement', entity: 'Northern Cape', time: '3h ago' },
];

const ACTIVITY_TYPE_CONFIG: Record<ActivityEventType, { icon: React.ReactNode; color: string; glow: string; targetModule: ModuleId }> = {
  TenderAward: { icon: <Building2 className="size-3" />, color: 'text-emerald-400', glow: '0 0 6px rgba(16,185,129,0.4)', targetModule: 'tenderlens' as ModuleId },
  RiskAlert: { icon: <AlertTriangle className="size-3" />, color: 'text-red-400', glow: '0 0 6px rgba(239,68,68,0.4)', targetModule: 'risklens' as ModuleId },
  AuditUpdate: { icon: <FileCheck className="size-3" />, color: 'text-blue-400', glow: '0 0 6px rgba(59,130,246,0.4)', targetModule: 'agasalert' as ModuleId },
  Section139: { icon: <Gavel className="size-3" />, color: 'text-amber-400', glow: '0 0 6px rgba(245,158,11,0.4)', targetModule: 'earlyalert' as ModuleId },
  ServiceUpdate: { icon: <Droplets className="size-3" />, color: 'text-teal-400', glow: '0 0 6px rgba(20,184,166,0.4)', targetModule: 'servicelens' as ModuleId },
};

function LiveActivityFeed() {
  const { setActiveModule } = useNavigationStore();
  // Duplicate events for seamless loop
  const duplicatedEvents = [...ACTIVITY_EVENTS, ...ACTIVITY_EVENTS];

  const handleEventClick = (type: ActivityEventType) => {
    const config = ACTIVITY_TYPE_CONFIG[type];
    if (config?.targetModule) {
      setActiveModule(config.targetModule);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative w-full h-10 sm:h-12 flex items-center bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden rounded-xl"
    >
      {/* Left: LIVE indicator + label */}
      <div className="flex items-center gap-2 px-2 sm:px-3 shrink-0 z-10 bg-[#0a0e1a]/90 h-full border-r border-white/[0.06]">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">LIVE</span>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:inline">Activity Feed</span>
      </div>

      {/* Right: Scrolling events - Clickable */}
      <div className="flex-1 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0e1a]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0e1a]/80 to-transparent z-10 pointer-events-none" />

        <div className="animate-activity-feed flex items-center gap-6 whitespace-nowrap h-full">
          {duplicatedEvents.map((event, idx) => {
            const config = ACTIVITY_TYPE_CONFIG[event.type];
            return (
              <button
                key={`event-${idx}`}
                onClick={() => handleEventClick(event.type)}
                className="flex items-center gap-2 shrink-0 cursor-pointer hover:brightness-125 transition-all group/event"
              >
                {/* Category icon with glow */}
                <span className={cn('flex items-center justify-center size-5 rounded', config.color)} style={{ boxShadow: config.glow }}>
                  {config.icon}
                </span>
                {/* Event text */}
                <span className="text-[10px] sm:text-[11px] text-zinc-300 font-medium group-hover/event:underline underline-offset-2">{event.text}</span>
                {/* Entity tag */}
                <span className="text-[8px] sm:text-[9px] font-semibold text-zinc-500 bg-white/[0.04] px-1 sm:px-1.5 py-0.5 rounded border border-white/[0.06]">{event.entity}</span>
                {/* Relative timestamp */}
                <span className="text-[9px] text-zinc-500 font-mono">{event.time}</span>
                {/* Dot divider */}
                <span className="text-zinc-700 ml-2">•</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Live Activity Feed Panel (R9-2a) ────────────────────────────────────────

const FEED_PANEL_EVENTS = [
  { type: 'RiskAlert' as ActivityEventType, text: 'Procurement anomaly flagged in eThekwini — 3 suppliers awarded 78% of health contracts', entity: 'eThekwini Metro', time: '2m ago' },
  { type: 'TenderAward' as ActivityEventType, text: 'R245M water infrastructure tender awarded — City of Cape Town Wastewater Treatment Plant', entity: 'City of Cape Town', time: '5m ago' },
  { type: 'AuditUpdate' as ActivityEventType, text: 'AGSA Q3 audit outcomes released for 23 Free State municipalities — 4 new disclaimers', entity: 'Free State Province', time: '12m ago' },
  { type: 'Section139' as ActivityEventType, text: 'Section 139(1)(b) intervention escalated to 139(7) — Mafikeng Local Municipality', entity: 'Mafikeng LM', time: '18m ago' },
  { type: 'ServiceUpdate' as ActivityEventType, text: 'Water service delivery access improved by 3.2% in Nelson Mandela Bay — now 79.4%', entity: 'Nelson Mandela Bay', time: '25m ago' },
  { type: 'TenderAward' as ActivityEventType, text: 'R89M IT modernisation contract published — Gauteng Department of Health', entity: 'Gauteng Health', time: '32m ago' },
  { type: 'RiskAlert' as ActivityEventType, text: 'Budget overrun detected — Limpopo education infrastructure at 120% of allocation', entity: 'Limpopo Education', time: '45m ago' },
  { type: 'AuditUpdate' as ActivityEventType, text: 'Clean audit maintained for 5th consecutive year — Western Cape Provincial Treasury', entity: 'WC Treasury', time: '1h ago' },
  { type: 'Section139' as ActivityEventType, text: 'Administrator appointed for Emfuleni Local Municipality — 12-month recovery plan', entity: 'Emfuleni LM', time: '1h ago' },
  { type: 'ServiceUpdate' as ActivityEventType, text: 'Electricity access reaches 92% in Mpumalanga district municipalities — up from 88%', entity: 'Mpumalanga DMs', time: '2h ago' },
];

function LiveActivityFeedPanel() {
  const { setActiveModule } = useNavigationStore();

  return (
    <motion.div variants={itemSlideUp}>
      <Card
        className="border-white/[0.10] bg-white/[0.04] backdrop-blur-xl hover:border-white/[0.16] transition-all duration-300 overflow-hidden relative"
        style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
      >
        {/* Top accent line with glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ background: 'linear-gradient(90deg, #10B981, #0D9488, #3B82F6, transparent)', boxShadow: '0 0 10px rgba(16,185,129,0.25)' }}
        />

        {/* Background glow orbs */}
        <div
          className="absolute -top-16 -left-16 size-48 rounded-full opacity-[0.04] blur-3xl"
          style={{ backgroundColor: '#10B981' }}
        />
        <div
          className="absolute -bottom-12 -right-12 size-40 rounded-full opacity-[0.03] blur-2xl"
          style={{ backgroundColor: '#0D9488' }}
        />

        <CardContent className="p-3 sm:p-4 lg:p-5 xl:p-6 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <div className="flex items-center gap-3">
              {/* Live badge with pulsing dot */}
              <div className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex size-2">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-tight">Real-Time Activity Feed</h3>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5">Latest system events across all monitoring modules</p>
              </div>
            </div>
            <Badge className="bg-white/[0.04] text-zinc-400 border-white/[0.08] text-[9px] px-2 py-0.5 font-semibold">
              {FEED_PANEL_EVENTS.length} events
            </Badge>
          </div>

          {/* Feed items */}
          <ScrollArea className="max-h-[280px] sm:max-h-[360px]">
            <div className="space-y-1">
              {FEED_PANEL_EVENTS.map((event, i) => {
                const config = ACTIVITY_TYPE_CONFIG[event.type];
                return (
                  <motion.div
                    key={`feed-${i}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="group/feed-item flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-2.5 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer border border-transparent hover:border-white/[0.06]"
                    onClick={() => {
                      if (config?.targetModule) setActiveModule(config.targetModule);
                    }}
                  >
                    {/* Event type icon with glow */}
                    <div
                      className={cn('flex size-6 sm:size-7 items-center justify-center rounded-lg shrink-0 mt-0.5', config.color)}
                      style={{
                        background: `${config.color === 'text-red-400' ? '#EF4444' : config.color === 'text-emerald-400' ? '#10B981' : config.color === 'text-blue-400' ? '#3B82F6' : config.color === 'text-amber-400' ? '#F59E0B' : '#14B8A6'}12`,
                        border: `1px solid ${config.color === 'text-red-400' ? '#EF4444' : config.color === 'text-emerald-400' ? '#10B981' : config.color === 'text-blue-400' ? '#3B82F6' : config.color === 'text-amber-400' ? '#F59E0B' : '#14B8A6'}25`,
                        boxShadow: config.glow,
                      }}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed group-hover/feed-item:text-zinc-50 transition-colors line-clamp-2 sm:line-clamp-none">
                        {event.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 bg-white/[0.04] px-1 sm:px-1.5 py-0.5 rounded border border-white/[0.06]">
                          {event.entity}
                        </span>
                        <span className="text-[9px] text-zinc-500">·</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{event.time}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="size-3 sm:size-3.5 text-zinc-600 group-hover/feed-item:text-zinc-400 shrink-0 mt-1 transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <Separator className="my-3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-3 text-zinc-500" />
              <span className="text-[9px] sm:text-[10px] text-zinc-500">Auto-updating every 30s</span>
            </div>
            <button
              onClick={() => setActiveModule('risklens' as ModuleId)}
              className="group flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors min-h-[44px]"
            >
              <span className="relative">
                View all events
                <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-zinc-300 transition-all duration-300" />
              </span>
              <ArrowRight className="size-2.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Dashboard Header ────────────────────────────────────────────────────────

function DashboardHeader({ onExportOpen }: { onExportOpen: () => void }) {
  const { counter, isRefreshing, refresh } = useLiveCounter();

  return (
    <motion.div variants={itemSlideUp} className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Live Indicator + Counter */}
      <div className="flex items-center gap-2 sm:gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 sm:px-4 py-2 sm:py-2.5 flex-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="relative flex size-2.5 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <div className="relative size-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Live Data
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5 shrink-0">
          <Shield className="size-3 text-zinc-400" />
          <span className="text-[10px] sm:text-[11px] text-zinc-400 whitespace-nowrap">
            Data as of 03 Mar 2026
          </span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-white/[0.08] hidden sm:block" />
        <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
          <Clock className="size-3 text-zinc-400" />
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
            Last updated: {counter}
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
          v1.0.0-mvp
        </span>
      </div>

      {/* Action Buttons — Premium Glass Morphism */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className={cn(
            'h-9 sm:h-8 gap-1.5 text-zinc-300',
            'bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]',
            'hover:bg-white/[0.08] hover:border-white/[0.16] hover:shadow-lg',
            'active:scale-[0.98] transition-all duration-200'
          )}
        >
          <RefreshCw
            className={cn('size-3.5 animate-spin-on-hover', isRefreshing && 'animate-spin')}
          />
          <span className="text-[10px] sm:text-[11px]">Refresh</span>
        </Button>

        {/* Export Button — Premium Glass Morphism */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportOpen}
          className={cn(
            'h-9 sm:h-8 gap-1.5 text-zinc-300',
            'bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]',
            'hover:bg-white/[0.08] hover:border-white/[0.16] hover:shadow-lg',
            'active:scale-[0.98] transition-all duration-200'
          )}
        >
          <Download className="size-3.5 animate-icon-bounce-hover" />
          <span className="text-[10px] sm:text-[11px]">Export</span>
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────

export default function Dashboard() {
  const [exportOpen, setExportOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  // ── Export Data Configuration ──────────────────────────────────────────────
  const exportData = useMemo(() => 
    PROVINCE_SUMMARY.map((prov) => ({
      province: prov.province,
      municipalities: prov.municipalities,
      avgFHS: prov.avgFHS,
      avgSDS: prov.avgSDS,
      section139: prov.section139,
      cleanAudit: prov.cleanAudit,
    }))
  , []);

  const exportColumns: ExportColumn[] = useMemo(() => [
    { key: 'province', label: 'Province', selected: true },
    { key: 'municipalities', label: 'Municipalities', selected: true },
    { key: 'avgFHS', label: 'Avg Financial Health Score', selected: true },
    { key: 'avgSDS', label: 'Avg Service Delivery Score', selected: true },
    { key: 'section139', label: 'Section 139 Interventions', selected: true },
    { key: 'cleanAudit', label: 'Clean Audits', selected: true },
  ], []);

  return (
    <div className="space-y-5 sm:space-y-8 relative overflow-hidden">
      {/* Subtle noise texture overlay for depth */}
      <div className="noise-texture absolute inset-0 pointer-events-none rounded-xl" />

      {/* ── Dashboard Header ────────────────────────────────────── */}
      <DashboardHeader onExportOpen={() => setExportOpen(true)} />

      {/* ── Live Activity Feed ─────────────────────────────────── */}
      <LiveActivityFeed />

      {/* ── Premium Financial Distress Alert Banner ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative overflow-hidden rounded-xl backdrop-blur-xl"
        style={{
          boxShadow: '0 0 20px rgba(127,29,29,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Gradient background: deeper, richer red gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/50 via-red-900/30 to-amber-950/20" />

        {/* Pulsing border animation */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(220,38,38,0.5), rgba(217,119,6,0.3), rgba(220,38,38,0.2))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Left red accent bar with glow */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
          style={{
            background: 'linear-gradient(180deg, #EF4444, #DC2626, #D97706)',
            boxShadow: '0 0 12px rgba(239,68,68,0.4)',
          }}
        />

        {/* Diagonal stripe pattern overlay at 2% opacity */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 6px,
              rgba(255,255,255,0.15) 6px,
              rgba(255,255,255,0.15) 7px
            )`,
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 sm:pl-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
              <AlertTriangle className="size-3.5 sm:size-4 text-red-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              <span
                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #D97706)',
                }}
              >
                High Priority
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-red-200">
              Financial Distress Alert: 63% of municipalities now classified as distressed
            </p>
            <p className="text-[9px] sm:text-[10px] text-red-300/60 mt-0.5">
              162 of 257 municipalities below FHS threshold of 45 — up 8.2% YoY
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => useNavigationStore.getState().setActiveModule('munilens')}
            className="h-8 sm:h-7 gap-1.5 text-[9px] sm:text-[10px] border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 shrink-0 min-w-[44px]"
          >
            <span className="hidden sm:inline">View Distressed</span>
            <span className="sm:hidden">View</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </motion.div>

      {/* ── Hero KPI Strip ──────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="National Overview"
          subtitle="Key performance indicators across South Africa's 257 municipalities"
          accentColor="#0077B6"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4"
        >
          {kpiCards.map((kpi, index) => (
            <KPICard key={kpi.label} data={kpi} index={index} />
          ))}
        </motion.div>

        {/* ── Province Quick-Select Navigation Cards ──────────────── */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="mt-3 sm:mt-4"
        >
          <ProvinceQuickSelect />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#0077B6]/30 to-transparent"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── AI Insights Panel ──────────────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
      >
        <AIInsightsPanel />
      </motion.div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-teal-500/25 to-transparent"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Live Activity Feed Panel ───────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
      >
        <LiveActivityFeedPanel />
      </motion.div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── National Overview Charts ────────────────────────────── */}
      <div>
        <SectionHeader
          title="Audit & Financial Intelligence"
          subtitle="Distribution of audit outcomes and provincial financial health scores"
          accentColor="#2D6A4F"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
        >
          <AuditOutcomeChart />
          <ProvincialFHSChart />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#2D6A4F]/25 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── Service Delivery Heatmap ────────────────────────────── */}
      <div>
        <SectionHeader
          title="Service Delivery Pressure"
          subtitle="Household access to basic services by province (%)"
          accentColor="#3B82F6"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <ServiceDeliveryChart />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#3B82F6]/25 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── Budget Treemap Chart ─────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Budget Allocation View"
          subtitle="Provincial budget allocation across Education, Health, and Infrastructure"
          accentColor="#0D9488"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <BudgetTreemapChart />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#0D9488]/25 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── Provincial Intelligence Table + Mini Map ─────────────── */}
      <div>
        <SectionHeader
          title="Provincial Intelligence"
          subtitle="Comprehensive provincial metrics — click any row to explore spatially"
          accentColor="#B45309"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-3 sm:gap-4"
        >
          <ProvincialTable />
          <MiniMapWidget />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#B45309]/25 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── Municipality Comparison ─────────────────────────────── */}
      <div>
        <SectionHeader
          title="Municipality Comparison"
          subtitle="Side-by-side analysis of selected municipalities"
          accentColor="#7B2D8E"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <MunicipalityComparison />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#7B2D8E]/25 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── Watchlist, Risk Signals & Tender Highlights ──────────── */}
      <div>
        <SectionHeader
          title="Intelligence Feed"
          subtitle="Watchlist, latest risk signals and active procurement opportunities"
          accentColor="#D97706"
        />
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {/* Compare Municipality Button */}
          <motion.div variants={itemSlideUp}>
            <button
              onClick={() => setCompareOpen(true)}
              className={cn(
                'w-full flex items-center gap-2 sm:gap-2.5 rounded-xl border p-3 sm:p-4',
                'border-[#7B2D8E]/20 bg-[#7B2D8E]/05',
                'hover:border-[#7B2D8E]/40 hover:bg-[#7B2D8E]/10',
                'transition-all duration-300 cursor-pointer group min-h-[44px]'
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#7B2D8E]/15 border border-[#7B2D8E]/25">
                <GitCompareArrows className="size-4 text-[#A855F7]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">Compare Municipalities</p>
                <p className="text-[9px] sm:text-[10px] text-zinc-500">Side-by-side comparison</p>
              </div>
              <ArrowRight className="size-3.5 text-zinc-600 group-hover:text-[#A855F7] transition-colors" />
            </button>
          </motion.div>

          <WatchlistWidget />

          {/* Municipality Comparison Modal */}
          <MunicipalityComparisonModal
            open={compareOpen}
            onOpenChange={setCompareOpen}
          />
          <RiskSignalsPanel />
          <TenderHighlightsPanel />
        </motion.div>
      </div>

      {/* Section Divider — Animated Gradient */}
      <div className="relative h-px"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" /><motion.div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} /></div>

      {/* ── System Health Monitor ──────────────────────────────── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
      >
        <SystemHealthMonitor />
      </motion.div>

      {/* ── Data Export Sheet ──────────────────────────────────── */}
      <DataExport
        open={exportOpen}
        onOpenChange={setExportOpen}
        data={exportData}
        columns={exportColumns}
        filenamePrefix="civiclens-provincial-intelligence"
      />
    </div>
  );
}
