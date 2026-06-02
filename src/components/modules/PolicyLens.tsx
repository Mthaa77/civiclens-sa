'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  BookOpen,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Table2,
  Loader2,
  CheckCircle2,
  Brain,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
  Droplets,
  Heart,
  GraduationCap,
  Home,
  Users,
  ChevronDown,
  ChevronUp,
  Scale,
  Bus,
  Zap,
  Wallet,
  Layers,
  RefreshCw,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Minus,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES, PROVINCE_SUMMARY } from '@/lib/mock-data';
import { formatPercent, formatNumber } from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ── Accent Colors: teal (#0F766E) → cyan (#06B6D4) ────────────────────────
const ACCENT_FROM = '#0F766E';
const ACCENT_TO = '#06B6D4';

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

// ── Policy Themes ───────────────────────────────────────────────────────────

const THEMES = [
  { id: 'labour', label: 'Labour', icon: Users, color: '#3B82F6', indicators: ['Unemployment Rate', 'Youth Unemployment', 'Formal Employment', 'Informal Employment', 'Labour Force Participation'], nationalAvg: [31.5, 44.8, 62, 18, 56], trendDirs: ['down', 'down', 'up', 'up', 'stable'] },
  { id: 'poverty', label: 'Poverty', icon: Scale, color: '#EF4444', indicators: ['Poverty Rate', 'Gini Coefficient', 'SASSA Dependency', 'Household Income', 'Food Security'], nationalAvg: [50.8, 0.61, 47, 18700, 78], trendDirs: ['down', 'down', 'up', 'up', 'up'] },
  { id: 'health', label: 'Health', icon: Heart, color: '#10B981', indicators: ['Life Expectancy', 'Infant Mortality', 'HIV Prevalence', 'Healthcare Access', 'Immunisation Rate'], nationalAvg: [65, 22, 13.7, 72, 80], trendDirs: ['up', 'down', 'down', 'up', 'up'] },
  { id: 'education', label: 'Education', icon: GraduationCap, color: '#8B5CF6', indicators: ['Matric Pass Rate', 'Literacy Rate', 'School Infrastructure', 'Teacher:Learner Ratio', 'ECD Access'], nationalAvg: [74, 87, 58, 32, 62], trendDirs: ['up', 'up', 'up', 'stable', 'up'] },
  { id: 'water', label: 'Water', icon: Droplets, color: '#0891B2', indicators: ['Water Access', 'Blue Drop Score', 'Sanitation Access', 'Green Drop Score', 'Water Loss Rate'], nationalAvg: [81.2, 44, 72.5, 38, 37], trendDirs: ['up', 'down', 'up', 'down', 'down'] },
  { id: 'crime', label: 'Crime', icon: Target, color: '#F59E0B', indicators: ['Murder Rate', 'Sexual Offences', 'Property Crime', 'Drug-related Crime', 'Police:Population Ratio'], nationalAvg: [33, 72, 142, 108, 389], trendDirs: ['up', 'stable', 'down', 'up', 'stable'] },
];

// ── Topic Preset Pills (expanded to 8) ──────────────────────────────────────

const TOPIC_PRESETS = [
  { label: 'Youth Unemployment', icon: Users, color: '#3B82F6' },
  { label: 'Water Service Delivery', icon: Droplets, color: '#0891B2' },
  { label: 'Healthcare Access', icon: Heart, color: '#10B981' },
  { label: 'Education Outcomes', icon: GraduationCap, color: '#8B5CF6' },
  { label: 'Housing Delivery', icon: Home, color: '#F59E0B' },
  { label: 'Public Transport', icon: Bus, color: '#06B6D4' },
  { label: 'Energy Access', icon: Zap, color: '#EAB308' },
  { label: 'Social Grants', icon: Wallet, color: '#8B5CF6' },
];

// ── Trend Data ──────────────────────────────────────────────────────────────

const TREND_DATA = [
  { year: '2018', unemployment: 27.1, youthUnemployment: 38.8, povertyRate: 55.5, gini: 0.63 },
  { year: '2019', unemployment: 28.7, youthUnemployment: 40.2, povertyRate: 54.2, gini: 0.62 },
  { year: '2020', unemployment: 32.5, youthUnemployment: 45.8, povertyRate: 58.2, gini: 0.65 },
  { year: '2021', unemployment: 34.9, youthUnemployment: 48.2, povertyRate: 56.8, gini: 0.64 },
  { year: '2022', unemployment: 33.0, youthUnemployment: 46.5, povertyRate: 54.1, gini: 0.63 },
  { year: '2023', unemployment: 32.1, youthUnemployment: 45.5, povertyRate: 52.3, gini: 0.62 },
  { year: '2024', unemployment: 31.5, youthUnemployment: 44.8, povertyRate: 50.8, gini: 0.61 },
];

// ── Extended Trend Data (10Y / All) ─────────────────────────────────────────

const TREND_DATA_EXTENDED = [
  { year: '2010', unemployment: 24.9, youthUnemployment: 34.5, povertyRate: 57.2, gini: 0.65 },
  { year: '2011', unemployment: 25.0, youthUnemployment: 35.4, povertyRate: 56.8, gini: 0.65 },
  { year: '2012', unemployment: 25.2, youthUnemployment: 36.0, povertyRate: 56.1, gini: 0.65 },
  { year: '2013', unemployment: 25.6, youthUnemployment: 36.8, povertyRate: 55.8, gini: 0.64 },
  { year: '2014', unemployment: 25.4, youthUnemployment: 36.9, povertyRate: 55.5, gini: 0.64 },
  { year: '2015', unemployment: 26.0, youthUnemployment: 37.5, povertyRate: 55.2, gini: 0.64 },
  { year: '2016', unemployment: 26.7, youthUnemployment: 38.2, povertyRate: 55.8, gini: 0.63 },
  { year: '2017', unemployment: 27.3, youthUnemployment: 38.6, povertyRate: 56.1, gini: 0.63 },
  ...TREND_DATA,
];

// ── Policy Milestones ───────────────────────────────────────────────────────

const POLICY_MILESTONES = [
  { year: '2012', label: 'NDP Adopted', y: 14 },
  { year: '2020', label: 'COVID-19', y: 58 },
  { year: '2023', label: 'Medium-Term Strategy', y: 52 },
];

// ── Comparison Data ─────────────────────────────────────────────────────────

const PROVINCIAL_COMPARISON = [
  { name: 'Western Cape', unemployment: 22.8, poverty: 28.5, waterAccess: 97.2, matricPass: 82.5 },
  { name: 'Gauteng', unemployment: 33.5, poverty: 35.2, waterAccess: 94.1, matricPass: 78.2 },
  { name: 'KwaZulu-Natal', unemployment: 34.8, poverty: 48.5, waterAccess: 80.5, matricPass: 72.8 },
  { name: 'Eastern Cape', unemployment: 38.2, poverty: 55.8, waterAccess: 72.4, matricPass: 68.5 },
  { name: 'Limpopo', unemployment: 36.5, poverty: 58.2, waterAccess: 65.8, matricPass: 65.2 },
  { name: 'Free State', unemployment: 35.1, poverty: 45.2, waterAccess: 78.3, matricPass: 74.5 },
  { name: 'Mpumalanga', unemployment: 34.2, poverty: 42.8, waterAccess: 75.5, matricPass: 71.8 },
  { name: 'North West', unemployment: 35.8, poverty: 44.5, waterAccess: 76.2, matricPass: 70.1 },
  { name: 'Northern Cape', unemployment: 32.5, poverty: 38.2, waterAccess: 88.1, matricPass: 75.8 },
];

// National averages for comparison
const NATIONAL_AVERAGES = { unemployment: 31.5, poverty: 50.8, waterAccess: 81.2, matricPass: 74.0 };

// ── Key Policy Insights (5 rotating cards) ──────────────────────────────────

const POLICY_INSIGHTS = [
  {
    title: 'Youth Unemployment Crisis',
    description: 'SA youth unemployment (44.8%) remains the highest globally.',
    recommendation: 'Targeted intervention in Eastern Cape and Limpopo could impact 2.8M youth through skills programmes and public employment schemes.',
    icon: Users,
    color: '#EF4444',
  },
  {
    title: 'Water Infrastructure Decline',
    description: 'Blue Drop scores have dropped 44% since 2012. R128B required to address backlog.',
    recommendation: 'Prioritise municipal water infrastructure grants and strengthen Blue Drop regulatory enforcement.',
    icon: Droplets,
    color: '#0891B2',
  },
  {
    title: 'Healthcare Outcome Disparities',
    description: 'Infant mortality varies 3x between provinces. HIV prevalence plateauing at 13.7%.',
    recommendation: 'Scale district health specialist teams and accelerate NHI pilot programmes in under-served provinces.',
    icon: Heart,
    color: '#10B981',
  },
  {
    title: 'Education Performance Gap',
    description: 'Matric pass rates vary 17pp between Western Cape (82.5%) and Limpopo (65.2%).',
    recommendation: 'Ring-fence school infrastructure budgets and deploy additional teacher support in under-performing districts.',
    icon: GraduationCap,
    color: '#8B5CF6',
  },
  {
    title: 'Housing Delivery Shortfall',
    description: '2.5M housing backlog persists. Annual delivery has declined 35% since 2018.',
    recommendation: 'Reform beneficiary allocation, promote gap housing finance, and leverage private sector partnerships.',
    icon: Home,
    color: '#F59E0B',
  },
];

// ── Cross-Module Intelligence Data ──────────────────────────────────────────

const CROSS_MODULE_DATA: Record<string, {
  riskSignals: Array<{ label: string; severity: 'Critical' | 'High' | 'Medium'; module: string }>;
  affectedMunis: Array<{ name: string; fhs: number; module: string }>;
  serviceMetrics: Array<{ label: string; value: string; trend: 'up' | 'down' | 'stable'; module: string }>;
}> = {
  'Youth Unemployment': {
    riskSignals: [
      { label: 'Youth unemployment exceeds 50% in 4 provinces', severity: 'Critical', module: 'risklens' },
      { label: 'NEET rate increasing in rural districts', severity: 'High', module: 'risklens' },
      { label: 'Skills mismatch in Gauteng labour market', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'Buffalo City Metro', fhs: 28, module: 'munilens' },
      { name: 'Polokwane LM', fhs: 31, module: 'munilens' },
      { name: 'Msunduzi LM', fhs: 35, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Labour Force Participation', value: '56%', trend: 'stable', module: 'servicelens' },
      { label: 'Skills Development Spend', value: 'R2.4B', trend: 'up', module: 'servicelens' },
      { label: 'Public Works Jobs Created', value: '1.2M', trend: 'down', module: 'servicelens' },
    ],
  },
  'Water Service Delivery': {
    riskSignals: [
      { label: 'Blue Drop compliance dropped to 44%', severity: 'Critical', module: 'risklens' },
      { label: 'R128B infrastructure backlog identified', severity: 'High', module: 'risklens' },
      { label: 'Water loss rate at 37% nationally', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'Mafikeng LM', fhs: 22, module: 'munilens' },
      { name: 'Thabazimbi LM', fhs: 26, module: 'munilens' },
      { name: 'Emalahleni LM', fhs: 30, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Water Access Rate', value: '81.2%', trend: 'up', module: 'servicelens' },
      { label: 'Sanitation Access', value: '72.5%', trend: 'up', module: 'servicelens' },
      { label: 'Green Drop Score', value: '38/100', trend: 'down', module: 'servicelens' },
    ],
  },
  'Healthcare Access': {
    riskSignals: [
      { label: 'Healthcare access below 60% in 3 provinces', severity: 'Critical', module: 'risklens' },
      { label: 'HIV prevalence plateauing at 13.7%', severity: 'High', module: 'risklens' },
      { label: 'Doctor:patient ratio deteriorating', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'OR Tambo DM', fhs: 24, module: 'munilens' },
      { name: 'Alfred Nzo DM', fhs: 21, module: 'munilens' },
      { name: 'Joe Gqabi DM', fhs: 27, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Life Expectancy', value: '65 years', trend: 'up', module: 'servicelens' },
      { label: 'Immunisation Rate', value: '80%', trend: 'up', module: 'servicelens' },
      { label: 'Clinic Infrastructure Score', value: '58/100', trend: 'up', module: 'servicelens' },
    ],
  },
  'Education Outcomes': {
    riskSignals: [
      { label: 'Matric pass gap of 17pp across provinces', severity: 'Critical', module: 'risklens' },
      { label: 'School infrastructure backlog: 2,500 schools', severity: 'High', module: 'risklens' },
      { label: 'Teacher absenteeism rate at 12%', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'Vhembe DM', fhs: 29, module: 'munilens' },
      { name: 'Mopani DM', fhs: 32, module: 'munilens' },
      { name: 'Chris Hani DM', fhs: 26, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Matric Pass Rate', value: '74%', trend: 'up', module: 'servicelens' },
      { label: 'Literacy Rate', value: '87%', trend: 'up', module: 'servicelens' },
      { label: 'ECD Access', value: '62%', trend: 'up', module: 'servicelens' },
    ],
  },
  'Housing Delivery': {
    riskSignals: [
      { label: '2.5M housing backlog nationally', severity: 'Critical', module: 'risklens' },
      { label: 'Housing delivery declined 35% since 2018', severity: 'High', module: 'risklens' },
      { label: 'Informal settlement growth rate: 4.2% YoY', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'City of Cape Town', fhs: 58, module: 'munilens' },
      { name: 'eThekwini Metro', fhs: 42, module: 'munilens' },
      { name: 'City of Tshwane', fhs: 48, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Units Delivered', value: '82,000', trend: 'down', module: 'servicelens' },
      { label: 'Budget Allocation', value: 'R33B', trend: 'up', module: 'servicelens' },
      { label: 'Title Deeds Issued', value: '45,000', trend: 'stable', module: 'servicelens' },
    ],
  },
  'Public Transport': {
    riskSignals: [
      { label: 'Public transport spend below 2% of GDP', severity: 'Critical', module: 'risklens' },
      { label: 'Taxi industry safety incidents rising', severity: 'High', module: 'risklens' },
      { label: 'PRASA operational capacity at 40%', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'City of Johannesburg', fhs: 52, module: 'munilens' },
      { name: 'Ekurhuleni Metro', fhs: 44, module: 'munilens' },
      { name: 'Nelson Mandela Bay', fhs: 38, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Bus Fleet Utilisation', value: '68%', trend: 'up', module: 'servicelens' },
      { label: 'Rail Commuter Trips', value: '120M/yr', trend: 'down', module: 'servicelens' },
      { label: 'BRT Ridership', value: '52M/yr', trend: 'up', module: 'servicelens' },
    ],
  },
  'Energy Access': {
    riskSignals: [
      { label: 'Load shedding impact on GDP: -2.1%', severity: 'Critical', module: 'risklens' },
      { label: 'Municipal electricity debt at R68B', severity: 'High', module: 'risklens' },
      { label: 'Renewable energy targets lagging', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'Emalahleni LM', fhs: 30, module: 'munilens' },
      { name: 'Govan Mbeki LM', fhs: 34, module: 'munilens' },
      { name: 'Middelburg LM', fhs: 36, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Electricity Access', value: '86.8%', trend: 'up', module: 'servicelens' },
      { label: 'Renewable Share', value: '8.2%', trend: 'up', module: 'servicelens' },
      { label: 'Load Shedding Hours', value: '1,200/yr', trend: 'down', module: 'servicelens' },
    ],
  },
  'Social Grants': {
    riskSignals: [
      { label: 'SASSA dependency rate at 47% nationally', severity: 'Critical', module: 'risklens' },
      { label: 'Grant fraud estimated at R5.2B annually', severity: 'High', module: 'risklens' },
      { label: 'Child support grant below food poverty line', severity: 'Medium', module: 'risklens' },
    ],
    affectedMunis: [
      { name: 'OR Tambo DM', fhs: 24, module: 'munilens' },
      { name: 'Zululand DM', fhs: 27, module: 'munilens' },
      { name: 'Umkhanyakude DM', fhs: 23, module: 'munilens' },
    ],
    serviceMetrics: [
      { label: 'Total Beneficiaries', value: '27.8M', trend: 'up', module: 'servicelens' },
      { label: 'Grant Expenditure', value: 'R253B', trend: 'up', module: 'servicelens' },
      { label: 'SRD Recipients', value: '8.5M', trend: 'stable', module: 'servicelens' },
    ],
  },
};

// ── Brief Preview Structure ─────────────────────────────────────────────────

const BRIEF_STRUCTURE = [
  { section: 'Executive Summary', items: 1 },
  { section: 'Context & Background', items: 2 },
  { section: 'Key Findings', items: 3 },
  { section: 'Data Analysis', items: 4 },
  { section: 'Policy Recommendations', items: 3 },
  { section: 'Appendix: Data Sources', items: 2 },
];

// ── Mini Sparkline SVG Generator ────────────────────────────────────────────

function MiniSparkline({ trend, color }: { trend: string; color: string }) {
  const paths: Record<string, string> = {
    up: 'M2,12 L6,10 L10,7 L14,5 L18,2',
    down: 'M2,2 L6,5 L10,7 L14,10 L18,12',
    stable: 'M2,7 L6,7 L10,7 L14,7 L18,7',
  };
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="shrink-0">
      <path d={paths[trend] ?? paths.stable} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy={trend === 'up' ? 2 : trend === 'down' ? 12 : 7} r="1.5" fill={color} />
    </svg>
  );
}

// ── Cross-Module Intelligence Component ─────────────────────────────────────

function CrossModuleIntelligence({ topic }: { topic: string }) {
  const { setActiveModule } = useNavigationStore();
  const data = CROSS_MODULE_DATA[topic];

  if (!data) return null;

  const severityStyle = (severity: string) => {
    if (severity === 'Critical') return 'bg-red-500/15 text-red-400 border-red-500/25';
    if (severity === 'High') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
  };

  const fhsStyle = (fhs: number) => {
    if (fhs >= 65) return 'bg-emerald-500/10 text-emerald-400';
    if (fhs >= 45) return 'bg-amber-500/10 text-amber-400';
    return 'bg-red-500/10 text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers className="size-4" style={{ color: ACCENT_TO }} />
        <h4 className="text-xs font-semibold text-zinc-200">Cross-Module Intelligence</h4>
        <Badge
          variant="outline"
          className="text-[8px] h-4 px-1.5"
          style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}
        >
          Related Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Risk Signals from RiskLens */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="size-3 text-red-400" />
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Risk Signals</span>
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 ml-auto bg-red-500/10 text-red-400 border-red-500/20">
              RiskLens
            </Badge>
          </div>
          <div className="space-y-2">
            {data.riskSignals.map((signal, i) => (
              <button
                key={i}
                onClick={() => setActiveModule('risklens')}
                className="w-full text-left rounded-md border border-white/[0.04] bg-white/[0.01] px-2.5 py-2 hover:border-[#06B6D4]/25 hover:bg-[#06B6D4]/5 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className={cn('text-[7px] h-3.5 px-1 shrink-0 mt-0.5', severityStyle(signal.severity))}
                  >
                    {signal.severity}
                  </Badge>
                  <span className="text-[10px] text-zinc-300 group-hover:text-zinc-100 leading-relaxed">{signal.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Affected Municipalities from MuniLens */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Building2 className="size-3 text-purple-400" />
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Most Affected</span>
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 ml-auto bg-purple-500/10 text-purple-400 border-purple-500/20">
              MuniLens
            </Badge>
          </div>
          <div className="space-y-2">
            {data.affectedMunis.map((muni, i) => (
              <button
                key={i}
                onClick={() => setActiveModule('munilens')}
                className="w-full text-left rounded-md border border-white/[0.04] bg-white/[0.01] px-2.5 py-2 hover:border-[#06B6D4]/25 hover:bg-[#06B6D4]/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="size-3 text-zinc-500 shrink-0" />
                    <span className="text-[10px] text-zinc-300 group-hover:text-zinc-100 truncate">{muni.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-[8px] h-4 px-1.5 shrink-0', fhsStyle(muni.fhs))}
                  >
                    FHS: {muni.fhs}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Service Metrics from ServiceLens */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BarChart3 className="size-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Service Metrics</span>
            <Badge variant="outline" className="text-[7px] h-3.5 px-1 ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              ServiceLens
            </Badge>
          </div>
          <div className="space-y-2">
            {data.serviceMetrics.map((metric, i) => (
              <button
                key={i}
                onClick={() => setActiveModule('servicelens')}
                className="w-full text-left rounded-md border border-white/[0.04] bg-white/[0.01] px-2.5 py-2 hover:border-[#06B6D4]/25 hover:bg-[#06B6D4]/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-300 group-hover:text-zinc-100 truncate">{metric.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-200 tabular-nums">{metric.value}</span>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="size-2.5 text-emerald-400" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="size-2.5 text-red-400" />
                    ) : (
                      <Minus className="size-2.5 text-zinc-500" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function PolicyLens() {
  const [selectedTheme, setSelectedTheme] = useState('labour');
  const [briefTopic, setBriefTopic] = useState('');
  const [briefGeography, setBriefGeography] = useState('south-africa');
  const [briefAudience, setBriefAudience] = useState('policy-analyst');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [trendPeriod, setTrendPeriod] = useState<'5Y' | '10Y' | 'All'>('5Y');
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [lineVisibility, setLineVisibility] = useState({ unemployment: true, youthUnemployment: true, povertyRate: true });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const currentTheme = THEMES.find((t) => t.id === selectedTheme);

  // Auto-rotate insights (6s interval)
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % POLICY_INSIGHTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateBrief = useCallback(() => {
    setIsGenerating(true);
    setBriefGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setBriefGenerated(true);
    }, 2000);
  }, []);

  const handlePresetClick = useCallback((label: string) => {
    setBriefTopic(label);
    setBriefGenerated(false);
    setActivePreset(label);
  }, []);

  const getTrendData = useMemo(() => {
    switch (trendPeriod) {
      case '10Y': return TREND_DATA_EXTENDED.slice(-10);
      case 'All': return TREND_DATA_EXTENDED;
      default: return TREND_DATA;
    }
  }, [trendPeriod]);

  const sortedComparison = useMemo(() => {
    if (!sortCol) return PROVINCIAL_COMPARISON;
    return [...PROVINCIAL_COMPARISON].sort((a, b) => {
      const aVal = a[sortCol as keyof typeof a];
      const bVal = b[sortCol as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [sortCol, sortDir]);

  const handleSort = useCallback((col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }, [sortCol]);

  const toggleLine = useCallback((key: string) => {
    setLineVisibility((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }, []);

  // National average references for comparison table
  const getCellColor = useCallback((key: string, value: number) => {
    const natAvg = NATIONAL_AVERAGES[key as keyof typeof NATIONAL_AVERAGES];
    if (!natAvg) return 'text-zinc-300';
    // For negative indicators (unemployment, poverty), below average = green
    if (key === 'unemployment' || key === 'poverty') {
      return value < natAvg ? 'text-emerald-400' : value > natAvg * 1.15 ? 'text-red-400' : 'text-amber-400';
    }
    // For positive indicators (waterAccess, matricPass), above average = green
    return value > natAvg ? 'text-emerald-400' : value < natAvg * 0.85 ? 'text-red-400' : 'text-amber-400';
  }, []);

  const getComparisonRank = useCallback((key: string) => {
    const isNegative = key === 'unemployment' || key === 'poverty';
    const sorted = [...PROVINCIAL_COMPARISON].sort((a, b) => {
      const aVal = a[key as keyof typeof a];
      const bVal = b[key as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return isNegative ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, []);

  // Generate brief content based on topic
  const getBriefContent = useMemo(() => {
    const topic = briefTopic || 'Policy Analysis';
    const geography = briefGeography === 'south-africa' ? 'South Africa' : briefGeography.replace('-', ' ');

    return {
      executiveSummary: `This policy brief examines ${topic.toLowerCase()} across ${geography}, drawing on the latest available data from Stats SA, National Treasury, and municipal reporting systems. Current trends indicate significant disparities that require targeted policy intervention.`,
      keyFindings: [
        'National averages mask severe provincial disparities, with a 3x variance between best and worst performing provinces',
        'Current policy frameworks are insufficient to meet NDP 2030 targets at the present trajectory',
        'Municipal-level data reveals that structural barriers disproportionately affect rural and peri-urban communities',
      ],
      recommendations: [
        'Strengthen intergovernmental coordination through targeted conditional grants with performance-based disbursement mechanisms',
        'Establish province-specific intervention thresholds with automatic escalation protocols when indicators breach critical levels',
        'Invest in data infrastructure to enable real-time monitoring and evidence-based policy adjustments at municipal level',
      ],
      dataSources: [
        { name: 'Stats SA Quarterly Labour Force Survey', module: 'peoplelens' },
        { name: 'National Treasury MFMA Reports', module: 'munilens' },
        { name: 'Auditor-General Outcomes', module: 'agasalert' },
      ],
    };
  }, [briefTopic, briefGeography]);

  return (
    <div className="space-y-5 overflow-x-hidden">
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
              <BookOpen className="size-5" style={{ color: ACCENT_TO }} />
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
              PolicyLens
            </h1>
            <p className="text-xs text-zinc-400">Evidence-based policy intelligence</p>
          </div>
          <Badge className="badge-premium badge-phase2 ml-2 hidden sm:inline-flex">Phase 2</Badge>
          <Badge className="badge-premium ml-1 hidden sm:inline-flex" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
            <BookOpen className="size-3 mr-1" />Policy Intelligence
          </Badge>
        </div>
      </motion.div>

      {/* ── Key Policy Insights (5 rotating cards) ───────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardContent className="p-0">
            <div className="relative overflow-hidden" style={{ minHeight: '88px' }}>
              <AnimatePresence mode="wait">
                {POLICY_INSIGHTS.map((insight, i) =>
                  insightIndex === i ? (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute inset-0 flex items-center gap-3 sm:gap-4 p-3 sm:p-4"
                    >
                      <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg sm:rounded-xl shrink-0" style={{ background: `${insight.color}15`, border: `1px solid ${insight.color}25` }}>
                        <insight.icon className="size-4 sm:size-5" style={{ color: insight.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-zinc-200">{insight.title}</p>
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed mt-0.5 line-clamp-2 sm:line-clamp-none">{insight.description}</p>
                        <p className="text-[9px] sm:text-[10px] text-cyan-400/80 mt-1 italic hidden sm:block">{insight.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {POLICY_INSIGHTS.map((_, j) => (
                          <button
                            key={j}
                            onClick={() => setInsightIndex(j)}
                            className={cn(
                              'size-1.5 rounded-full transition-all',
                              j === insightIndex ? 'bg-cyan-400 w-4' : 'bg-white/20 hover:bg-white/40'
                            )}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="brief" className="space-y-4">
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-9 w-max min-w-full sm:w-auto">
          <TabsTrigger value="brief" className="text-[11px] data-[state=active]:bg-[#0F766E]/20 data-[state=active]:text-[#06B6D4]">
            <Sparkles className="size-3 mr-1" /> Brief Generator
          </TabsTrigger>
          <TabsTrigger value="explorer" className="text-[11px] data-[state=active]:bg-[#0F766E]/20 data-[state=active]:text-[#06B6D4]">
            <Search className="size-3 mr-1" /> Indicator Explorer
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-[11px] data-[state=active]:bg-[#0F766E]/20 data-[state=active]:text-[#06B6D4]">
            <TrendingUp className="size-3 mr-1" /> Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-[11px] data-[state=active]:bg-[#0F766E]/20 data-[state=active]:text-[#06B6D4]">
            <Table2 className="size-3 mr-1" /> Comparison
          </TabsTrigger>
        </TabsList>
        </div>

        {/* ── Brief Generator Tab ──────────────────────────── */}
        <TabsContent value="brief">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" style={{ color: ACCENT_TO }} />
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-200">Policy Brief Generator</CardTitle>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Generate evidence-based policy briefs on any topic</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Topic Preset Pills - expanded to 8 */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Quick topics:</span>
                  {TOPIC_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetClick(preset.label)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-all duration-200',
                        activePreset === preset.label
                          ? 'bg-white/[0.06] text-zinc-100'
                          : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                      )}
                      style={{
                        borderLeftWidth: '2px',
                        borderLeftColor: preset.color,
                        ...(activePreset === preset.label ? { borderColor: `${ACCENT_TO}40`, boxShadow: `0 0 12px ${ACCENT_TO}20` } : {}),
                      }}
                    >
                      <preset.icon className="size-3" style={{ color: preset.color }} />
                      {preset.label}
                    </motion.button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Topic</label>
                    <Input
                      placeholder="e.g., Water service delivery gaps in rural municipalities"
                      value={briefTopic}
                      onChange={(e) => { setBriefTopic(e.target.value); setBriefGenerated(false); setActivePreset(null); }}
                      className="h-8 text-xs border-white/[0.08] bg-white/[0.03] focus:border-[#06B6D4]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Geography</label>
                    <Select value={briefGeography} onValueChange={(v) => { setBriefGeography(v); setBriefGenerated(false); }}>
                      <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south-africa">South Africa</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="kzn">KwaZulu-Natal</SelectItem>
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                        <SelectItem value="limpopo">Limpopo</SelectItem>
                        <SelectItem value="free-state">Free State</SelectItem>
                        <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="north-west">North West</SelectItem>
                        <SelectItem value="northern-cape">Northern Cape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Audience</label>
                    <Select value={briefAudience} onValueChange={(v) => { setBriefAudience(v); setBriefGenerated(false); }}>
                      <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policy-analyst">Policy Analyst</SelectItem>
                        <SelectItem value="policymaker">Policymaker</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="media">Media / Journalist</SelectItem>
                        <SelectItem value="public">General Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-5">
                  <Button
                    onClick={handleGenerateBrief}
                    disabled={isGenerating || !briefTopic}
                    className="h-9 px-5 text-white border-0"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
                      boxShadow: `0 0 20px ${ACCENT_FROM}30`,
                    }}
                  >
                    {isGenerating ? <><Loader2 className="size-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="size-4 mr-2" />Generate Brief</>}
                  </Button>
                  {briefGenerated && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">Brief generated</span>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Brief Preview Card */}
                {briefGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md flex items-center justify-center" style={{ background: `${ACCENT_FROM}15`, border: `1px solid ${ACCENT_TO}25` }}>
                            <BookOpen className="size-3" style={{ color: ACCENT_TO }} />
                          </div>
                          <span className="text-xs font-semibold text-zinc-200">Policy Brief Preview</span>
                          <Badge variant="outline" className="text-[8px] h-4 px-1.5" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
                            {briefAudience.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] gap-1">
                            <RefreshCw className="size-3" />
                            Regenerate
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] gap-1">
                            <Download className="size-3" />
                            Download Full Brief
                          </Button>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <div className="mb-3 rounded-md border-l-2 p-3" style={{ borderLeftColor: ACCENT_TO, background: `${ACCENT_FROM}05` }}>
                        <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Executive Summary</h5>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{getBriefContent.executiveSummary}</p>
                      </div>

                      {/* Key Findings */}
                      <div className="mb-3 rounded-md border-l-2 p-3" style={{ borderLeftColor: ACCENT_TO, background: `${ACCENT_FROM}05` }}>
                        <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Key Findings</h5>
                        <div className="space-y-1.5">
                          {getBriefContent.keyFindings.map((finding, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: ACCENT_TO }}>{i + 1}.</span>
                              <span className="text-[11px] text-zinc-400 leading-relaxed">{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Policy Recommendations */}
                      <div className="mb-3 rounded-md border-l-2 p-3" style={{ borderLeftColor: ACCENT_TO, background: `${ACCENT_FROM}05` }}>
                        <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Policy Recommendations</h5>
                        <div className="space-y-1.5">
                          {getBriefContent.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Lightbulb className="size-3 shrink-0 mt-0.5" style={{ color: ACCENT_TO }} />
                              <span className="text-[11px] text-zinc-400 leading-relaxed">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data Sources */}
                      <div className="rounded-md border-l-2 p-3" style={{ borderLeftColor: ACCENT_TO, background: `${ACCENT_FROM}05` }}>
                        <h5 className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Data Sources</h5>
                        <div className="space-y-1">
                          {getBriefContent.dataSources.map((source, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Database className="size-3 text-zinc-500 shrink-0" />
                              <span className="text-[11px] text-zinc-400">{source.name}</span>
                              <Badge variant="outline" className="text-[7px] h-3.5 px-1 bg-white/[0.03] text-zinc-500 border-white/[0.06]">
                                {source.module}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Cross-Module Intelligence Section */}
                {briefTopic && CROSS_MODULE_DATA[briefTopic] && (
                  <CrossModuleIntelligence topic={briefTopic} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Indicator Explorer Tab ───────────────────────── */}
        <TabsContent value="explorer">
          <motion.div variants={containerStagger} initial="hidden" animate="show" className="space-y-4">
            {/* ── Policy Impact Score Cards ──────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {[
                { theme: 'Labour', score: 38, trend: 'down' as const, color: '#3B82F6', icon: Users },
                { theme: 'Poverty', score: 42, trend: 'up' as const, color: '#EF4444', icon: Scale },
                { theme: 'Health', score: 61, trend: 'up' as const, color: '#10B981', icon: Heart },
                { theme: 'Education', score: 58, trend: 'up' as const, color: '#8B5CF6', icon: GraduationCap },
                { theme: 'Water', score: 53, trend: 'down' as const, color: '#0891B2', icon: Droplets },
                { theme: 'Crime', score: 34, trend: 'down' as const, color: '#F59E0B', icon: Target },
              ].map((item, i) => {
                const circumference = 2 * Math.PI * 18;
                const offset = circumference - (item.score / 100) * circumference;
                const trendIcon = item.trend === 'up' ? ArrowUpRight : item.trend === 'down' ? ArrowDownRight : Minus;
                const TrendIcon = trendIcon;
                const trendColor = item.trend === 'up' ? '#10B981' : item.trend === 'down' ? '#EF4444' : '#71717a';
                return (
                  <motion.div
                    key={item.theme}
                    variants={itemSlideUp}
                    whileHover={{ scale: 1.03, y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="glass-card-v2 card-hover-lift overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: item.color, opacity: 0.8 }} />
                      <CardContent className="p-3 flex flex-col items-center">
                        <div className="relative flex items-center justify-center mb-1.5">
                          <svg width={48} height={48} className="shrink-0">
                            <circle cx={24} cy={24} r={18} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
                            <motion.circle
                              cx={24} cy={24} r={18} fill="none" stroke={item.color} strokeWidth={3}
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: offset }}
                              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: i * 0.1 + 0.3 }}
                              transform="rotate(-90 24 24)"
                              style={{ filter: `drop-shadow(0 0 3px ${item.color}60)` }}
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.score}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <item.icon className="size-3" style={{ color: item.color }} />
                          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-300">{item.theme}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendIcon className="size-2.5" style={{ color: trendColor }} />
                          <span className="text-[9px] font-medium" style={{ color: trendColor }}>
                            {item.trend === 'up' ? 'Improving' : item.trend === 'down' ? 'Declining' : 'Stable'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {THEMES.map((theme) => (
                <motion.div key={theme.id} variants={itemSlideUp} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                  <Card
                    className={cn(
                      'glass-card-v2 card-hover-lift cursor-pointer overflow-hidden',
                      selectedTheme === theme.id && 'ring-1 border-transparent'
                    )}
                    style={selectedTheme === theme.id ? { borderColor: `${theme.color}40`, ringColor: `${theme.color}30` } : {}}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: theme.color, opacity: selectedTheme === theme.id ? 1 : 0.3 }} />
                    <CardContent className="p-3 text-center">
                      <div className="flex size-8 items-center justify-center rounded-lg mx-auto mb-1.5" style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}25` }}>
                        <theme.icon className="size-4" style={{ color: theme.color }} />
                      </div>
                      <p className="text-xs font-semibold text-zinc-300">{theme.label}</p>
                      <p className="text-[10px] text-zinc-400">{theme.indicators.length} indicators</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {currentTheme && (
              <motion.div variants={itemFadeIn}>
                <Card className="glass-card-v2 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${currentTheme.color}, ${ACCENT_TO})` }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <currentTheme.icon className="size-4" style={{ color: currentTheme.color }} />
                        <CardTitle className="text-sm font-semibold text-zinc-200">{currentTheme.label} Indicators</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] gap-1"
                        onClick={() => {
                          const tabEl = document.querySelector('[data-value="trends"]') as HTMLElement;
                          tabEl?.click();
                        }}
                      >
                        <BarChart3 className="size-3" />
                        View Full Dashboard
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentTheme.indicators.map((ind, i) => {
                        const natAvg = currentTheme.nationalAvg[i];
                        const displayVal = typeof natAvg === 'number' ? natAvg.toFixed(1) : natAvg;
                        const barWidth = typeof natAvg === 'number' ? Math.min(natAvg, 100) : 50;
                        const trendDir = currentTheme.trendDirs[i];
                        const isExpanded = expandedIndicator === ind;
                        const trendIcon = trendDir === 'up' ? ArrowUpRight : trendDir === 'down' ? ArrowDownRight : ArrowRight;
                        const trendColor = trendDir === 'up' ? '#10B981' : trendDir === 'down' ? '#EF4444' : '#71717a';

                        return (
                          <motion.div
                            key={ind}
                            layout
                            whileHover={{ scale: 1.01, borderColor: `${currentTheme.color}30` }}
                            className="rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden cursor-pointer"
                            style={{ borderLeftWidth: '3px', borderLeftColor: currentTheme.color }}
                            onClick={() => setExpandedIndicator(isExpanded ? null : ind)}
                          >
                            <div className="absolute inset-0 opacity-[0.02]" style={{ background: `linear-gradient(135deg, ${currentTheme.color}, transparent)` }} />
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-zinc-200 flex-1">{ind}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <MiniSparkline trend={trendDir} color={trendColor} />
                                  {isExpanded ? <ChevronUp className="size-3 text-zinc-500" /> : <ChevronDown className="size-3 text-zinc-500" />}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="progress-premium flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.6 }}
                                    className="progress-bar h-full rounded-full"
                                    style={{ '--progress-from': currentTheme.color, '--progress-to': ACCENT_TO } as React.CSSProperties}
                                  />
                                </div>
                                <span className="text-[10px] text-zinc-300 font-bold tabular-nums w-10 text-right">{displayVal}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                <span className="text-[9px] text-zinc-400">National Avg</span>
                                <ArrowRight className="size-2.5 text-zinc-500" />
                                <span className="text-[9px] font-semibold" style={{ color: currentTheme.color }}>{displayVal}</span>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-auto flex items-center gap-0.5"
                                >
                                  {React.createElement(trendIcon, { className: 'size-2.5', style: { color: trendColor } })}
                                  <span className="text-[9px] font-medium" style={{ color: trendColor }}>
                                    {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'}
                                  </span>
                                </motion.div>
                              </div>

                              {/* Expanded Detail */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <Separator className="my-2 bg-white/[0.06]" />
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-zinc-500">Trend Direction</span>
                                        <Badge
                                          variant="outline"
                                          className="text-[8px] h-4 px-1.5"
                                          style={{ background: `${trendColor}15`, color: trendColor, borderColor: `${trendColor}25` }}
                                        >
                                          {trendDir.charAt(0).toUpperCase() + trendDir.slice(1)}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-zinc-500">Data Source</span>
                                        <span className="text-[9px] text-zinc-300">Stats SA / Municipal Money</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-zinc-500">Last Updated</span>
                                        <span className="text-[9px] text-zinc-300">Q4 2024</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-zinc-500">Provincial Range</span>
                                        <span className="text-[9px] text-zinc-300">
                                          {typeof natAvg === 'number' ? `${(natAvg * 0.6).toFixed(1)} — ${(natAvg * 1.4).toFixed(1)}` : '—'}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ── Trend Dashboard Tab ──────────────────────────── */}
        <TabsContent value="trends">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="space-y-4">
            {/* Mini Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Unemployment', value: '31.5%', trend: 'down', color: '#3B82F6', prev: '32.1%' },
                { label: 'Youth Unemployment', value: '44.8%', trend: 'down', color: '#EF4444', prev: '45.5%' },
                { label: 'Poverty Rate', value: '50.8%', trend: 'down', color: '#F59E0B', prev: '52.3%' },
                { label: 'Gini Coefficient', value: '0.61', trend: 'down', color: '#8B5CF6', prev: '0.62' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-card-v2 card-hover-lift overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                    <CardContent className="p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                        <div className="flex items-center gap-0.5 mb-0.5">
                          {stat.trend === 'down' ? (
                            <TrendingDown className="size-3 text-emerald-400" />
                          ) : (
                            <TrendingUp className="size-3 text-red-400" />
                          )}
                          <span className="text-[9px] text-zinc-400">from {stat.prev}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-200">Multi-Indicator Trend Dashboard</CardTitle>
                    <p className="text-[11px] text-zinc-400 mt-0.5">National trend lines with NDP 2030 targets</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Period Selector */}
                    <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03]">
                      {(['5Y', '10Y', 'All'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setTrendPeriod(period)}
                          className={cn(
                            'px-2.5 py-1 text-[10px] font-medium transition-colors',
                            trendPeriod === period ? 'bg-[#0F766E]/20 text-[#06B6D4]' : 'text-zinc-400 hover:text-zinc-300'
                          )}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] gap-1"
                    >
                      <Download className="size-3" />
                      Download Trend Data
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[180px] sm:h-[260px] md:h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="unemploymentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 70]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13,18,36,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                        }}
                        formatter={(v: number) => `${v}%`}
                      />
                      {/* NDP 2030 Target reference lines */}
                      <ReferenceLine y={14} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'NDP Unemployment: 14%', fill: '#10B981', fontSize: 9, position: 'right' }} />
                      <ReferenceLine y={25} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'NDP Poverty: 25%', fill: '#10B98180', fontSize: 9, position: 'right' }} />
                      {/* Policy milestone annotations */}
                      {POLICY_MILESTONES.map((ms) => (
                        <ReferenceLine key={ms.year} x={ms.year} stroke="#06B6D4" strokeDasharray="2 4" strokeWidth={0.8} label={{ value: ms.label, fill: '#06B6D4', fontSize: 8, position: 'top' }} />
                      ))}
                      <Legend
                        wrapperStyle={{ fontSize: '11px' }}
                        formatter={(value: string) => {
                          const labels: Record<string, string> = { unemployment: 'Unemployment', youthUnemployment: 'Youth Unemployment', povertyRate: 'Poverty Rate' };
                          return labels[value] ?? value;
                        }}
                        onClick={(e) => {
                          if (e.dataKey) toggleLine(e.dataKey);
                        }}
                        payload={[
                          { value: 'unemployment', type: 'line', id: 'ID01', color: lineVisibility.unemployment ? '#3B82F6' : '#3B82F640', dataKey: 'unemployment' },
                          { value: 'youthUnemployment', type: 'line', id: 'ID02', color: lineVisibility.youthUnemployment ? '#EF4444' : '#EF44440', dataKey: 'youthUnemployment' },
                          { value: 'povertyRate', type: 'line', id: 'ID03', color: lineVisibility.povertyRate ? '#F59E0B' : '#F59E0B40', dataKey: 'povertyRate' },
                        ]}
                      />
                      {lineVisibility.unemployment && (
                        <Line type="monotone" dataKey="unemployment" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Unemployment" />
                      )}
                      {lineVisibility.youthUnemployment && (
                        <Line type="monotone" dataKey="youthUnemployment" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Youth Unemployment" />
                      )}
                      {lineVisibility.povertyRate && (
                        <Line type="monotone" dataKey="povertyRate" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Poverty Rate" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Comparison Tables Tab ────────────────────────── */}
        <TabsContent value="comparison">
          {/* ── Provincial Ranking Mini-Chart ──────────────── */}
          <motion.div variants={itemSlideUp} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4" style={{ color: ACCENT_TO }} />
                    <div>
                      <CardTitle className="text-sm font-semibold text-zinc-200">Provincial Ranking</CardTitle>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Unemployment rate by province — sorted worst to best</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-sm bg-emerald-400" />
                      <span className="text-[9px] text-zinc-400">Best</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-sm bg-amber-400" />
                      <span className="text-[9px] text-zinc-400">Mid</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="size-2 rounded-sm bg-red-400" />
                      <span className="text-[9px] text-zinc-400">Worst</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[180px] sm:h-[240px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...PROVINCIAL_COMPARISON].sort((a, b) => b.unemployment - a.unemployment)}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="rankGreenGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#10B98180" />
                        </linearGradient>
                        <linearGradient id="rankAmberGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#F59E0B80" />
                        </linearGradient>
                        <linearGradient id="rankRedGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#EF444480" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" domain={[0, 50]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13,18,36,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        }}
                        formatter={(v: number) => [`${v.toFixed(1)}%`, 'Unemployment']}
                      />
                      <Bar dataKey="unemployment" barSize={14} radius={[0, 4, 4, 0]}>
                        {[...PROVINCIAL_COMPARISON].sort((a, b) => b.unemployment - a.unemployment).map((entry, index) => {
                          const total = PROVINCIAL_COMPARISON.length;
                          let fill = 'url(#rankAmberGrad)';
                          if (index < Math.ceil(total / 3)) fill = 'url(#rankRedGrad)';
                          else if (index >= Math.ceil(total * 2 / 3)) fill = 'url(#rankGreenGrad)';
                          return <Cell key={`rank-cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-200">Provincial Comparison</CardTitle>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Key indicators compared across provinces — click column headers to sort</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] gap-1"
                  >
                    <Download className="size-3" />
                    Export Comparison
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[160px] sm:h-[220px] md:h-[280px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedComparison} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barTealGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={ACCENT_FROM} />
                          <stop offset="100%" stopColor={ACCENT_TO} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13,18,36,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        }}
                        formatter={(v: number) => `${v}%`}
                      />
                      <Bar dataKey="unemployment" fill="url(#barTealGrad)" barSize={8} name="Unemployment" radius={[0, 2, 2, 0]} />
                      <Bar dataKey="waterAccess" fill="#10B981" barSize={8} name="Water Access" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <ScrollArea className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.06] hover:bg-transparent" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}08, ${ACCENT_TO}08)` }}>
                        <TableHead className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">Province</TableHead>
                        <TableHead className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider text-center w-10">Rank</TableHead>
                        {[
                          { key: 'unemployment', label: 'Unemployment' },
                          { key: 'poverty', label: 'Poverty' },
                          { key: 'waterAccess', label: 'Water Access' },
                          { key: 'matricPass', label: 'Matric Pass' },
                        ].map((col) => (
                          <TableHead
                            key={col.key}
                            className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors"
                            onClick={() => handleSort(col.key)}
                          >
                            {col.label}
                            {sortCol === col.key && (
                              <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedComparison.map((row, idx) => {
                        // Calculate overall rank based on sort column or default
                        const rankData = sortCol ? getComparisonRank(sortCol) : getComparisonRank('unemployment');
                        const rank = rankData.findIndex((r) => r.name === row.name) + 1;

                        return (
                          <TableRow
                            key={row.name}
                            className={cn(
                              'border-white/[0.04] hover:bg-white/[0.04] transition-colors',
                              idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                            )}
                            style={{ borderLeftWidth: '2px', borderLeftColor: `${ACCENT_FROM}30` }}
                          >
                            <TableCell className="text-xs font-medium text-zinc-200">{row.name}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                'text-[10px] font-bold tabular-nums',
                                rank <= 3 ? 'text-emerald-400' : rank <= 6 ? 'text-amber-400' : 'text-red-400'
                              )}>
                                #{rank}
                              </span>
                            </TableCell>
                            <TableCell className={cn('text-right text-xs font-bold tabular-nums', getCellColor('unemployment', row.unemployment))}>{formatPercent(row.unemployment)}</TableCell>
                            <TableCell className={cn('text-right text-xs font-bold tabular-nums', getCellColor('poverty', row.poverty))}>{formatPercent(row.poverty)}</TableCell>
                            <TableCell className={cn('text-right text-xs font-bold tabular-nums', getCellColor('waterAccess', row.waterAccess))}>{formatPercent(row.waterAccess)}</TableCell>
                            <TableCell className={cn('text-right text-xs font-bold tabular-nums', getCellColor('matricPass', row.matricPass))}>{formatPercent(row.matricPass)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Footer Attribution ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-2"
      >
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <Database className="size-3" />
          <span>Sources: Stats SA, National Treasury, DPSA, DHS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
          <ShieldCheck className="size-3" style={{ color: `${ACCENT_TO}40` }} />
          <span>PolicyLens v2.1 — Policy Intelligence Module</span>
        </div>
      </motion.div>
    </div>
  );
}
