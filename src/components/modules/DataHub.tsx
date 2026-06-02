'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  { method: 'GET', path: '/api/v1/municipalities', description: 'List all municipalities with scores', auth: 'API Key', rateLimit: '1000/hr' },
  { method: 'GET', path: '/api/v1/municipalities/:code', description: 'Get single municipality profile', auth: 'API Key', rateLimit: '5000/hr' },
  { method: 'GET', path: '/api/v1/tenders', description: 'Search and filter tender awards', auth: 'API Key', rateLimit: '500/hr' },
  { method: 'GET', path: '/api/v1/tenders/:ocid', description: 'Get tender by OCID', auth: 'API Key', rateLimit: '5000/hr' },
  { method: 'GET', path: '/api/v1/indicators', description: 'Browse indicator time-series data', auth: 'API Key', rateLimit: '1000/hr' },
  { method: 'GET', path: '/api/v1/audit-outcomes', description: 'Audit outcome data by municipality', auth: 'API Key', rateLimit: '1000/hr' },
  { method: 'GET', path: '/api/v1/datasets', description: 'List all available datasets', auth: 'Public', rateLimit: '100/hr' },
  { method: 'GET', path: '/api/v1/datasets/:id/download', description: 'Download dataset in specified format', auth: 'API Key', rateLimit: '50/hr' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: '#10B981',
  POST: '#3B82F6',
  PUT: '#F59E0B',
  DELETE: '#EF4444',
};

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

// ── Main Component ──────────────────────────────────────────────────────────

export default function DataHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const filteredDatasets = DATASETS.filter((ds) =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDs = DATASETS.find((ds) => ds.id === selectedDataset);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#64748B]/10 border border-[#64748B]/20">
            <Database className="size-5 text-[#64748B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">DataHub</h1>
            <p className="text-xs text-zinc-500">Dataset catalogue and developer API</p>
          </div>
          <Badge className="ml-2 bg-[#64748B]/15 text-[#64748B] border-[#64748B]/25 text-[10px] h-5 px-1.5">Phase 3</Badge>
        </div>
      </motion.div>

      {/* ── Key Stats ───────────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Datasets', value: String(DATASETS.length), color: '#64748B' },
          { label: 'Total Records', value: '242K', color: '#3B82F6' },
          { label: 'API Endpoints', value: String(API_ENDPOINTS.length), color: '#10B981' },
          { label: 'Avg Quality', value: `${Math.round(DATASETS.reduce((s, d) => s + d.quality, 0) / DATASETS.length)}%`, color: '#F59E0B' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemSlideUp} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <CardContent className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-9">
          <TabsTrigger value="registry" className="text-[11px] data-[state=active]:bg-[#64748B]/20 data-[state=active]:text-[#94a3b8]">
            <Database className="size-3 mr-1" /> Registry
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-[11px] data-[state=active]:bg-[#64748B]/20 data-[state=active]:text-[#94a3b8]">
            <Shield className="size-3 mr-1" /> Quality
          </TabsTrigger>
          <TabsTrigger value="api" className="text-[11px] data-[state=active]:bg-[#64748B]/20 data-[state=active]:text-[#94a3b8]">
            <Code2 className="size-3 mr-1" /> API
          </TabsTrigger>
        </TabsList>

        {/* ── Dataset Registry Tab ──────────────────────────── */}
        <TabsContent value="registry">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-xs pl-8 border-white/[0.08] bg-white/[0.03]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDatasets.map((ds, i) => (
                <motion.div
                  key={ds.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <Card
                    className={cn(
                      'border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all cursor-pointer overflow-hidden',
                      selectedDataset === ds.id && 'ring-1 ring-[#64748B]/30 border-[#64748B]/30'
                    )}
                    onClick={() => setSelectedDataset(selectedDataset === ds.id ? null : ds.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{ds.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{ds.description}</p>
                        </div>
                        <Badge variant="outline" className={cn(
                          'text-[8px] h-4 px-1 shrink-0',
                          ds.lifecycle === 'Production' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        )}>{ds.lifecycle}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/[0.08] text-zinc-500">
                          <FileJson className="size-2.5 mr-0.5" /> {ds.format}
                        </Badge>
                        <span className="text-[9px] text-zinc-600">{ds.records.toLocaleString()} records</span>
                        <span className="text-[9px] text-zinc-700">·</span>
                        <span className="text-[9px] text-zinc-600">{ds.source}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Dataset Detail */}
            {selectedDs && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-zinc-200">{selectedDs.name} — Detail</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/[0.08]">
                          <Download className="size-3 mr-1" /> JSON
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/[0.08]">
                          <Download className="size-3 mr-1" /> CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div><span className="text-zinc-600">ID:</span> <span className="text-zinc-300 font-mono">{selectedDs.id}</span></div>
                          <div><span className="text-zinc-600">Records:</span> <span className="text-zinc-300">{selectedDs.records.toLocaleString()}</span></div>
                          <div><span className="text-zinc-600">Format:</span> <span className="text-zinc-300">{selectedDs.format}</span></div>
                          <div><span className="text-zinc-600">Lifecycle:</span> <span className="text-zinc-300">{selectedDs.lifecycle}</span></div>
                          <div><span className="text-zinc-600">Source:</span> <span className="text-zinc-300">{selectedDs.source}</span></div>
                          <div><span className="text-zinc-600">Updated:</span> <span className="text-zinc-300">{selectedDs.lastUpdated}</span></div>
                          <div><span className="text-zinc-600">Quality:</span> <span className="text-zinc-300">{selectedDs.quality}%</span></div>
                          <div><span className="text-zinc-600">SHA-256:</span> <span className="text-zinc-300 font-mono text-[10px]">{selectedDs.sha256}</span></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-zinc-400 mb-2">Sample Schema</p>
                        <div className="rounded-lg border border-white/[0.06] bg-black/30 p-3 overflow-auto max-h-[180px]">
                          <pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap">{SAMPLE_SCHEMA}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* ── Quality Tab ────────────────────────────────────── */}
        <TabsContent value="quality">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Quality Metrics</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">SHA-256 verification status and record counts</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {DATASETS.map((ds) => (
                    <div key={ds.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <CheckCircle2 className={cn('size-4 shrink-0', ds.quality >= 95 ? 'text-emerald-400' : ds.quality >= 85 ? 'text-amber-400' : 'text-red-400')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300 truncate">{ds.name}</p>
                          <p className="text-[10px] text-zinc-600 font-mono">SHA-256: {ds.sha256}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-[9px] text-zinc-600">Records</p>
                          <p className="text-xs font-semibold text-zinc-300 tabular-nums">{ds.records.toLocaleString()}</p>
                        </div>
                        <div className="text-center w-16">
                          <p className="text-[9px] text-zinc-600">Quality</p>
                          <p className={cn('text-xs font-bold tabular-nums', ds.quality >= 95 ? 'text-emerald-400' : ds.quality >= 85 ? 'text-amber-400' : 'text-red-400')}>
                            {ds.quality}%
                          </p>
                        </div>
                        <div className="text-center w-20">
                          <p className="text-[9px] text-zinc-600">Updated</p>
                          <p className="text-[10px] text-zinc-400">{ds.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── API Tab ────────────────────────────────────────── */}
        <TabsContent value="api">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4 text-[#64748B]" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-200">API Documentation</CardTitle>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Quick reference for the CivicLens REST API</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border border-[#64748B]/15 bg-[#64748B]/5 p-3 mb-4">
                  <p className="text-[11px] text-zinc-400">Base URL:</p>
                  <code className="text-xs text-[#64748B] font-mono">https://api.civiclens.co.za/v1</code>
                  <p className="text-[10px] text-zinc-600 mt-1">Authentication: Bearer token via API Key header</p>
                </div>
                <div className="space-y-2">
                  {API_ENDPOINTS.map((ep, i) => (
                    <div key={i} className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all">
                      <div className="flex items-center gap-2">
                        <Badge className="text-[9px] h-5 px-1.5 font-mono font-bold border-0" style={{ backgroundColor: `${METHOD_COLORS[ep.method]}20`, color: METHOD_COLORS[ep.method] }}>
                          {ep.method}
                        </Badge>
                        <code className="text-xs text-zinc-300 font-mono">{ep.path}</code>
                        <div className="flex-1" />
                        <span className="text-[10px] text-zinc-600">{ep.auth}</span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">{ep.rateLimit}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">{ep.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
