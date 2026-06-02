'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Search,
  Shield,
  FileJson,
  Table2,
  Download,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  ChevronDown,
  Play,
  Lock,
  Unlock,
  Zap,
  Globe,
  BarChart3,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// ── Animation Variants ──────────────────────────────────────────────────────

const containerStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemSlideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const itemFadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
};

// ── Format Color Map ────────────────────────────────────────────────────────

const FORMAT_COLORS: Record<string, string> = {
  'JSON': '#3B82F6',
  'JSON/CSV': '#6366F1',
  'CSV': '#10B981',
  'XML': '#F59E0B',
  'API': '#14B8A6',
  'JSON/GeoJSON': '#06B6D4',
};

const FORMAT_ACCENT: Record<string, string> = {
  'JSON': 'from-blue-500 to-blue-400',
  'JSON/CSV': 'from-indigo-500 to-blue-400',
  'CSV': 'from-emerald-500 to-emerald-400',
  'XML': 'from-amber-500 to-amber-400',
  'API': 'from-teal-500 to-teal-400',
  'JSON/GeoJSON': 'from-cyan-500 to-cyan-400',
};

const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981',
  POST: '#3B82F6',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
};

const AUTH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'API Key': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'Public': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
  'Optional': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

// ── Dataset Registry ────────────────────────────────────────────────────────

const DATASETS = [
  { id: 'ds-001', name: 'Municipality Profiles', description: 'Financial, demographic, and service delivery indicators for all 257 municipalities', records: 257, format: 'JSON', source: 'Treasury / Stats SA', lifecycle: 'Production', lastUpdated: '2026-03-01', sha256: 'a3f8c2d1e5b7...', quality: 98 },
  { id: 'ds-002', name: 'Tender Awards (OCDS)', description: 'Open Contracting Data Standard compliant procurement data from eTenders portal', records: 184520, format: 'JSON/CSV', source: 'eTenders / NT', lifecycle: 'Production', lastUpdated: '2026-03-03', sha256: '7b2e9f4a1c8d...', quality: 95 },
  { id: 'ds-003', name: 'Audit Outcomes', description: 'MFMA audit outcomes for all municipalities and municipal entities', records: 1542, format: 'JSON', source: 'AGSA', lifecycle: 'Production', lastUpdated: '2026-01-28', sha256: 'c5d1e8f3a2b9...', quality: 100 },
  { id: 'ds-004', name: 'Ward Profiles', description: 'Census 2022 ward-level demographic and service delivery indicators', records: 4468, format: 'JSON/GeoJSON', source: 'Stats SA / IEC', lifecycle: 'Production', lastUpdated: '2025-12-15', sha256: 'd8e2f5a1c3b7...', quality: 92 },
  { id: 'ds-005', name: 'Service Delivery Indicators', description: 'Household access to water, sanitation, electricity, and refuse removal by municipality', records: 2313, format: 'JSON/CSV', source: 'Stats SA GHS', lifecycle: 'Production', lastUpdated: '2026-02-10', sha256: 'f1a3c5e7b9d2...', quality: 96 },
  { id: 'ds-006', name: 'DORA Grant Allocations', description: 'Division of Revenue Act grant allocations and expenditure tracking', records: 892, format: 'JSON/CSV', source: 'National Treasury', lifecycle: 'Production', lastUpdated: '2026-02-28', sha256: 'e4b7d2f5a8c1...', quality: 99 },
  { id: 'ds-007', name: 'Climate Risk Scores', description: 'Composite climate vulnerability indices per municipality with dimensional breakdowns', records: 257, format: 'JSON', source: 'CivicLens Model', lifecycle: 'Beta', lastUpdated: '2026-03-01', sha256: 'b5c8e1f4a2d7...', quality: 82 },
  { id: 'ds-008', name: 'Supplier Registry (CSD)', description: 'Central Supplier Database records with B-BBEE levels and award history', records: 42580, format: 'JSON/CSV', source: 'CSD / National Treasury', lifecycle: 'Production', lastUpdated: '2026-02-20', sha256: 'a7d3f5c1e8b2...', quality: 88 },
  { id: 'ds-009', name: 'Dam Levels Weekly', description: 'Weekly dam level readings from DWS for major South African dams', records: 5280, format: 'JSON/CSV', source: 'DWS', lifecycle: 'Production', lastUpdated: '2026-03-03', sha256: 'c2e5a8b1f4d7...', quality: 94 },
  { id: 'ds-010', name: 'MTEF Budget Data', description: 'Medium-Term Expenditure Framework allocations by vote and department', records: 845, format: 'JSON/CSV', source: 'National Treasury', lifecycle: 'Production', lastUpdated: '2026-02-26', sha256: 'f8b2d5a1c7e4...', quality: 97 },
];

// ── API Endpoints ───────────────────────────────────────────────────────────

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/municipalities', description: 'List all municipalities with scores', auth: 'API Key', rateLimit: '1000/hr', rateUsage: 342 },
  { method: 'GET', path: '/api/v1/municipalities/:code', description: 'Get single municipality profile', auth: 'API Key', rateLimit: '5000/hr', rateUsage: 1203 },
  { method: 'GET', path: '/api/v1/tenders', description: 'Search and filter tender awards', auth: 'API Key', rateLimit: '500/hr', rateUsage: 89 },
  { method: 'GET', path: '/api/v1/tenders/:ocid', description: 'Get tender by OCID', auth: 'API Key', rateLimit: '5000/hr', rateUsage: 2341 },
  { method: 'GET', path: '/api/v1/indicators', description: 'Browse indicator time-series data', auth: 'API Key', rateLimit: '1000/hr', rateUsage: 567 },
  { method: 'GET', path: '/api/v1/audit-outcomes', description: 'Audit outcome data by municipality', auth: 'API Key', rateLimit: '1000/hr', rateUsage: 421 },
  { method: 'GET', path: '/api/v1/datasets', description: 'List all available datasets', auth: 'Public', rateLimit: '100/hr', rateUsage: 45 },
  { method: 'GET', path: '/api/v1/datasets/:id/download', description: 'Download dataset in specified format', auth: 'API Key', rateLimit: '50/hr', rateUsage: 12 },
];

// ── Sample Schema ───────────────────────────────────────────────────────────

const SAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "code": { "type": "string", "example": "CPT" },
    "name": { "type": "string", "example": "City of Cape Town" },
    "category": { "type": "string", "enum": ["A","B","C"] },
    "province": { "type": "string" },
    "financialHealthScore": { "type": "number", "min": 0, "max": 100 },
    "serviceDeliveryScore": { "type": "number", "min": 0, "max": 100 },
    "waterAccess": { "type": "number" },
    "sanitationAccess": { "type": "number" },
    "auditOutcome": { "type": "string" },
    "earlyAlertScore": { "type": "number" }
  }
}`;

// ── Helper: Relative Date ───────────────────────────────────────────────────

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date('2026-03-05');
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

// ── Circular SVG Gauge ──────────────────────────────────────────────────────

function CircularGauge({ value, size = 52, strokeWidth = 4, color = '#10B981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

// ── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ title, subtitle, icon: Icon, accent = 'from-sky-400 to-teal-400' }: { title: string; subtitle?: string; icon?: React.ElementType; accent?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-1 h-10 rounded-full bg-gradient-to-b', accent)} />
      {Icon && (
        <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <Icon className="size-4 text-zinc-400" />
        </div>
      )}
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function DataHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('registry');
  const [searchFocused, setSearchFocused] = useState(false);

  const totalRecords = DATASETS.reduce((s, d) => s + d.records, 0);
  const avgQuality = Math.round(DATASETS.reduce((s, d) => s + d.quality, 0) / DATASETS.length);
  const animatedTotalRecords = useAnimatedCounter(totalRecords);
  const animatedDatasetCount = useAnimatedCounter(DATASETS.length);
  const animatedApiCount = useAnimatedCounter(API_ENDPOINTS.length);

  const filteredDatasets = DATASETS.filter((ds) =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDs = DATASETS.find((ds) => ds.id === selectedDataset);

  const getQualityColor = useCallback((q: number) => {
    if (q >= 95) return '#10B981';
    if (q >= 85) return '#F59E0B';
    return '#EF4444';
  }, []);

  const getFormatColor = useCallback((format: string) => FORMAT_COLORS[format] || '#64748B', []);

  const parseRateLimit = useCallback((rateLimit: string): number => {
    const match = rateLimit.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1000;
  }, []);

  return (
    <div className="space-y-6 bg-grid-fine min-h-full">
      {/* ── Premium Header ────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-sky-400 to-teal-400 shrink-0" />
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-sky-500/20 relative">
            <Database className="size-5 text-sky-400" />
            <div className="absolute inset-0 rounded-xl bg-sky-400/5 animate-pulse-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                DataHub
              </h1>
              <Badge className="badge-premium badge-phase3 text-[9px] h-5 px-2">Phase 3</Badge>
              <Badge className="badge-premium text-[9px] h-5 px-2 bg-sky-500/10 text-sky-400 border-sky-500/20">
                Catalogue
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Dataset catalogue, quality assurance & developer API</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge className="badge-premium text-[9px] h-5 px-2 bg-teal-500/10 text-teal-400 border-teal-500/20">
              <Activity className="size-2.5 mr-1" />
              {animatedTotalRecords.toLocaleString()} Records
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Key Stats ─────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Datasets', value: String(animatedDatasetCount), color: '#0EA5E9', icon: Database, gradient: 'from-sky-500 to-sky-400' },
          { label: 'Total Records', value: `${Math.round(animatedTotalRecords / 1000)}K`, color: '#3B82F6', icon: Table2, gradient: 'from-blue-500 to-blue-400' },
          { label: 'API Endpoints', value: String(animatedApiCount), color: '#10B981', icon: Code2, gradient: 'from-emerald-500 to-emerald-400' },
          { label: 'Avg Quality', value: `${avgQuality}%`, color: '#F59E0B', icon: BarChart3, gradient: 'from-amber-500 to-amber-400' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card-v2 card-hover-lift overflow-hidden border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-80" style={{ backgroundImage: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{stat.label}</p>
                  <div className={cn('size-6 rounded-md bg-gradient-to-br flex items-center justify-center', stat.gradient)} style={{ opacity: 0.2 }}>
                    <stat.icon className="size-3" style={{ color: stat.color, opacity: 1 }} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Premium Tab Navigation ─────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <div className="flex items-center gap-2">
          <TabsList className="bg-white/[0.03] border border-white/[0.06] h-10 backdrop-blur-sm">
            <TabsTrigger
              value="registry"
              className={cn(
                'text-[11px] px-4 data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-400 relative',
                'transition-all duration-300'
              )}
            >
              <Database className={cn('size-3 mr-1.5 transition-all duration-300', activeTab === 'registry' && 'animate-pulse-glow')} />
              Registry
              <Badge className="ml-1.5 text-[8px] h-3.5 px-1 bg-white/[0.06] text-zinc-500 border-white/[0.08]">{DATASETS.length}</Badge>
              {activeTab === 'registry' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-sky-400 to-teal-400 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              className={cn(
                'text-[11px] px-4 data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-400 relative',
                'transition-all duration-300'
              )}
            >
              <Shield className={cn('size-3 mr-1.5 transition-all duration-300', activeTab === 'quality' && 'animate-pulse-glow')} />
              Quality
              <Badge className="ml-1.5 text-[8px] h-3.5 px-1 bg-white/[0.06] text-zinc-500 border-white/[0.08]">{avgQuality}%</Badge>
              {activeTab === 'quality' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className={cn(
                'text-[11px] px-4 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 relative',
                'transition-all duration-300'
              )}
            >
              <Code2 className={cn('size-3 mr-1.5 transition-all duration-300', activeTab === 'api' && 'animate-pulse-glow')} />
              API
              <Badge className="ml-1.5 text-[8px] h-3.5 px-1 bg-white/[0.06] text-zinc-500 border-white/[0.08]">{API_ENDPOINTS.length}</Badge>
              {activeTab === 'api' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Dataset Registry Tab ──────────────────────────── */}
        <TabsContent value="registry">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="space-y-5">
            <SectionHeader title="Dataset Registry" subtitle="Browse and explore all available data sources" icon={Database} accent="from-sky-400 to-teal-400" />

            {/* Search with glowing focus */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    'h-9 text-xs pl-9 border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-all duration-300',
                    searchFocused && 'border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.1)] bg-white/[0.05]'
                  )}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{filteredDatasets.length} of {DATASETS.length} datasets</span>
            </div>

            {/* Dataset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDatasets.map((ds, i) => {
                const formatColor = getFormatColor(ds.format);
                const formatAccent = FORMAT_ACCENT[ds.format] || 'from-zinc-500 to-zinc-400';
                const qualityColor = getQualityColor(ds.quality);

                return (
                  <motion.div
                    key={ds.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    variants={cardHover}
                    whileHover="hover"
                  >
                    <Card
                      className={cn(
                        'glass-card-v2 card-hover-lift cursor-pointer overflow-hidden transition-all duration-300',
                        selectedDataset === ds.id
                          ? 'ring-1 ring-sky-500/30 border-sky-500/30'
                          : 'border-white/[0.08] bg-white/[0.03] backdrop-blur-xl'
                      )}
                      onClick={() => setSelectedDataset(selectedDataset === ds.id ? null : ds.id)}
                    >
                      {/* Gradient accent line at top */}
                      <div className={cn('h-[2px] bg-gradient-to-r', formatAccent)} style={{ opacity: 0.8 }} />

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{ds.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{ds.description}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[8px] h-4 px-1.5 shrink-0 font-semibold border-0',
                              ds.lifecycle === 'Production'
                                ? 'bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                : 'bg-amber-500/15 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                            )}
                          >
                            {ds.lifecycle === 'Production' && <CheckCircle2 className="size-2 mr-0.5" />}
                            {ds.lifecycle === 'Beta' && <AlertCircle className="size-2 mr-0.5" />}
                            {ds.lifecycle}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/[0.08]" style={{ color: formatColor }}>
                            <FileJson className="size-2 mr-0.5" /> {ds.format}
                          </Badge>
                          <span className="text-[10px] text-zinc-400 font-semibold tabular-nums">{ds.records.toLocaleString()} records</span>
                        </div>

                        {/* Quality Score Progress Bar */}
                        <div className="mb-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-zinc-400">Quality Score</span>
                            <span className="text-[10px] font-bold tabular-nums" style={{ color: qualityColor }}>{ds.quality}%</span>
                          </div>
                          <div className="progress-premium progress-glow" data-color={ds.quality >= 95 ? 'green' : ds.quality >= 85 ? 'gold' : 'red'}>
                            <motion.div
                              className="progress-bar"
                              initial={{ width: 0 }}
                              animate={{ width: `${ds.quality}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                              style={{ '--progress-from': qualityColor, '--progress-to': qualityColor } as React.CSSProperties}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Globe className="size-2.5 text-zinc-500" />
                            <span className="text-[9px] text-zinc-400">{ds.source}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-2.5 text-zinc-500" />
                            <span className="text-[9px] text-zinc-400">{getRelativeDate(ds.lastUpdated)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Dataset Detail */}
            <AnimatePresence>
              {selectedDs && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                    <div className="h-[2px] bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <Database className="size-4 text-sky-400" />
                          </div>
                          <CardTitle className="text-sm font-semibold text-zinc-200">{selectedDs.name}</CardTitle>
                          <Badge className={cn(
                            'text-[8px] h-4 px-1.5 border-0',
                            selectedDs.lifecycle === 'Production'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-400'
                          )}>{selectedDs.lifecycle}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-sky-500/30">
                            <Download className="size-3 mr-1" /> JSON
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-sky-500/30">
                            <Download className="size-3 mr-1" /> CSV
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-[11px]">
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">ID</span>
                              <p className="text-zinc-300 font-mono mt-0.5">{selectedDs.id}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Records</span>
                              <p className="text-zinc-300 font-semibold tabular-nums mt-0.5">{selectedDs.records.toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Format</span>
                              <p className="text-zinc-300 mt-0.5">{selectedDs.format}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Lifecycle</span>
                              <p className="mt-0.5">
                                <Badge className={cn(
                                  'text-[8px] h-4 px-1.5 border-0',
                                  selectedDs.lifecycle === 'Production'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                )}>{selectedDs.lifecycle}</Badge>
                              </p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Source</span>
                              <p className="text-zinc-300 mt-0.5">{selectedDs.source}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Updated</span>
                              <p className="text-zinc-300 mt-0.5">{selectedDs.lastUpdated}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">Quality</span>
                              <p className="font-bold tabular-nums mt-0.5" style={{ color: getQualityColor(selectedDs.quality) }}>{selectedDs.quality}%</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2">
                              <span className="text-zinc-400 text-[10px]">SHA-256</span>
                              <p className="text-zinc-300 font-mono text-[9px] mt-0.5">{selectedDs.sha256}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-zinc-300 mb-2">Sample Schema</p>
                          <div className="rounded-lg border border-white/[0.06] bg-black/30 p-3 overflow-auto max-h-[220px]">
                            <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap">{SAMPLE_SCHEMA}</pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        {/* ── Quality Tab ────────────────────────────────────── */}
        <TabsContent value="quality">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="space-y-5">
            <SectionHeader title="Quality Metrics" subtitle="SHA-256 verification status, record counts and quality scores" icon={Shield} accent="from-teal-400 to-emerald-400" />

            {/* Quality overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Verified Datasets', value: String(DATASETS.filter(d => d.quality >= 95).length), total: DATASETS.length, color: '#10B981' },
                { label: 'Avg Quality', value: `${avgQuality}%`, total: 100, color: '#0EA5E9' },
                { label: 'Total Records', value: totalRecords.toLocaleString(), total: 500000, color: '#3B82F6' },
                { label: 'Data Sources', value: String(new Set(DATASETS.map(d => d.source)).size), total: 20, color: '#F59E0B' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                >
                  <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                    <div className="h-[2px] bg-gradient-to-r opacity-70" style={{ backgroundImage: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
                      <p className="text-xl font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Dataset Quality Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATASETS.map((ds, i) => {
                const qualityColor = getQualityColor(ds.quality);
                return (
                  <motion.div
                    key={ds.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden card-hover-lift">
                      <div className="h-[2px] bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${qualityColor}, transparent)`, opacity: 0.8 }} />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          {/* Left side: info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-zinc-200 truncate">{ds.name}</p>
                            </div>

                            {/* SHA-256 verification */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <CheckCircle2
                                className={cn(
                                  'size-3.5 shrink-0',
                                  ds.quality >= 95 ? 'text-emerald-400 animate-pulse-glow' : ds.quality >= 85 ? 'text-amber-400' : 'text-red-400'
                                )}
                              />
                              <span className="text-[9px] text-zinc-400 font-mono">SHA-256: {ds.sha256}</span>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <p className="text-[9px] text-zinc-400">Records</p>
                                <p className="text-lg font-extrabold tabular-nums text-zinc-200">{ds.records.toLocaleString()}</p>
                              </div>
                              <Separator orientation="vertical" className="h-8 bg-white/[0.06]" />
                              <div>
                                <p className="text-[9px] text-zinc-400">Format</p>
                                <Badge variant="outline" className="text-[8px] h-4 px-1 mt-0.5 border-white/[0.08]" style={{ color: getFormatColor(ds.format) }}>
                                  {ds.format}
                                </Badge>
                              </div>
                            </div>

                            {/* Quality Score Progress Bar */}
                            <div className="mb-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] text-zinc-400">Quality Score</span>
                                <span className="text-[10px] font-bold tabular-nums" style={{ color: qualityColor }}>{ds.quality}%</span>
                              </div>
                              <div className="progress-premium progress-glow" data-color={ds.quality >= 95 ? 'green' : ds.quality >= 85 ? 'gold' : 'red'}>
                                <motion.div
                                  className="progress-bar"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ds.quality}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                                  style={{ '--progress-from': qualityColor, '--progress-to': qualityColor } as React.CSSProperties}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="size-2.5 text-zinc-500" />
                              <span className="text-[9px] text-zinc-400">Last verified: {getRelativeDate(ds.lastUpdated)}</span>
                            </div>
                          </div>

                          {/* Right side: circular gauge */}
                          <div className="shrink-0 mt-1">
                            <CircularGauge value={ds.quality} color={qualityColor} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* ── API Tab ────────────────────────────────────────── */}
        <TabsContent value="api">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="space-y-5">
            <SectionHeader title="API Documentation" subtitle="Quick reference for the CivicLens REST API" icon={Code2} accent="from-emerald-400 to-teal-400" />

            {/* Base URL Card */}
            <Card className="glass-card-v2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              <div className="h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Base URL</p>
                    <code className="text-xs text-emerald-400 font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                      https://api.civiclens.co.za/v1
                    </code>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-10 bg-white/[0.06]" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Authentication</p>
                    <div className="flex items-center gap-1.5">
                      <Lock className="size-3 text-red-400" />
                      <span className="text-[11px] text-zinc-300">Bearer token via API Key header</span>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-10 bg-white/[0.06]" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Format</p>
                    <Badge variant="outline" className="text-[9px] h-5 px-2 border-white/[0.08] text-zinc-300 bg-white/[0.03]">
                      JSON
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endpoint Cards */}
            <div className="space-y-3">
              {API_ENDPOINTS.map((ep, i) => {
                const isExpanded = expandedEndpoint === i;
                const rateLimitNum = parseRateLimit(ep.rateLimit);
                const rateUsagePercent = Math.round((ep.rateUsage / rateLimitNum) * 100);
                const authStyle = AUTH_COLORS[ep.auth] || AUTH_COLORS['Public'];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <Card
                      className="glass-card-v2 border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden card-hover-lift cursor-pointer"
                      onClick={() => setExpandedEndpoint(isExpanded ? null : i)}
                    >
                      {/* Method color accent */}
                      <div className="h-[2px] bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${METHOD_COLORS[ep.method]}, transparent)`, opacity: 0.7 }} />

                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* HTTP Method Badge */}
                          <Badge
                            className="text-[9px] h-5 px-2 font-mono font-bold border-0 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                            style={{ backgroundColor: `${METHOD_COLORS[ep.method]}20`, color: METHOD_COLORS[ep.method] }}
                          >
                            {ep.method}
                          </Badge>

                          {/* Path in monospace */}
                          <code className="text-xs text-zinc-200 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                            {ep.path}
                          </code>

                          <div className="flex-1" />

                          {/* Auth Badge */}
                          <Badge variant="outline" className={cn('text-[8px] h-4 px-1.5 border-0', authStyle.bg, authStyle.text)}>
                            {ep.auth === 'API Key' && <Lock className="size-2 mr-0.5" />}
                            {ep.auth === 'Public' && <Unlock className="size-2 mr-0.5" />}
                            {ep.auth}
                          </Badge>

                          {/* Rate limit mini progress */}
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Zap className="size-2.5 text-zinc-500" />
                            <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${rateUsagePercent}%` }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                style={{ backgroundColor: rateUsagePercent > 80 ? '#EF4444' : rateUsagePercent > 50 ? '#F59E0B' : '#10B981' }}
                              />
                            </div>
                            <span className="text-[9px] text-zinc-500 tabular-nums">{ep.rateLimit}</span>
                          </div>

                          {/* Expand chevron */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="size-3.5 text-zinc-500" />
                          </motion.div>
                        </div>

                        <p className="text-[11px] text-zinc-400 mt-1.5">{ep.description}</p>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-3 bg-white/[0.06]" />
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                                  <p className="text-zinc-400 text-[10px] mb-1">Rate Limit</p>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={rateUsagePercent}
                                      className="h-2 flex-1"
                                      style={{
                                        '--tw-progress-color': rateUsagePercent > 80 ? '#EF4444' : rateUsagePercent > 50 ? '#F59E0B' : '#10B981',
                                      } as React.CSSProperties}
                                    />
                                    <span className="text-zinc-300 tabular-nums font-semibold">{ep.rateUsage}/{rateLimitNum}</span>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                                  <p className="text-zinc-400 text-[10px] mb-1">Authentication</p>
                                  <Badge className={cn('text-[9px] h-4 px-1.5 border-0', authStyle.bg, authStyle.text)}>
                                    {ep.auth === 'API Key' ? <Lock className="size-2 mr-0.5" /> : <Unlock className="size-2 mr-0.5" />}
                                    {ep.auth === 'API Key' ? 'Required' : ep.auth === 'Public' ? 'None' : 'Optional'}
                                  </Badge>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                                  <p className="text-zinc-400 text-[10px] mb-1">Response Format</p>
                                  <span className="text-zinc-300">application/json</span>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[10px] border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30"
                                  onClick={(e) => { e.stopPropagation(); }}
                                >
                                  <Play className="size-3 mr-1" /> Try it
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[10px] border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06]"
                                  onClick={(e) => { e.stopPropagation(); }}
                                >
                                  <Copy className="size-3 mr-1" /> Copy URL
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ── Footer ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4 border-t border-white/[0.06]"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="size-3 text-zinc-500" />
            <span className="text-[10px] text-zinc-500">DataHub v1.0 — Data Infrastructure Module</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-zinc-600">Data sources: National Treasury, AGSA, Stats SA, DWS, CSD</span>
            <Separator orientation="vertical" className="h-3 bg-white/[0.06]" />
            <span className="text-[9px] text-zinc-600">POPIA compliant</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
