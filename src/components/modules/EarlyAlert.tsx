'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle2,
  Activity,
  Shield,
  Siren,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate, formatNumber, formatPercent } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Accent Colors: rose (#F43F5E) → red (#DC2626) ──────────────────────────
const ACCENT_FROM = '#F43F5E';
const ACCENT_TO = '#DC2626';

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

// ── ECRS Trend Data ─────────────────────────────────────────────────────────

const ECRS_TRENDS: Record<string, { quarter: string; score: number }[]> = {
  EKU: [{ quarter: 'Q1', score: 62 }, { quarter: 'Q2', score: 68 }, { quarter: 'Q3', score: 72 }, { quarter: 'Q4', score: 75 }, { quarter: 'Q5', score: 78 }, { quarter: 'Q6', score: 78 }],
  MAN: [{ quarter: 'Q1', score: 78 }, { quarter: 'Q2', score: 82 }, { quarter: 'Q3', score: 85 }, { quarter: 'Q4', score: 86 }, { quarter: 'Q5', score: 88 }, { quarter: 'Q6', score: 88 }],
  BUF: [{ quarter: 'Q1', score: 70 }, { quarter: 'Q2', score: 74 }, { quarter: 'Q3', score: 78 }, { quarter: 'Q4', score: 80 }, { quarter: 'Q5', score: 82 }, { quarter: 'Q6', score: 82 }],
  MSU: [{ quarter: 'Q1', score: 72 }, { quarter: 'Q2', score: 76 }, { quarter: 'Q3', score: 78 }, { quarter: 'Q4', score: 80 }, { quarter: 'Q5', score: 80 }, { quarter: 'Q6', score: 80 }],
  JHB: [{ quarter: 'Q1', score: 45 }, { quarter: 'Q2', score: 48 }, { quarter: 'Q3', score: 52 }, { quarter: 'Q4', score: 55 }, { quarter: 'Q5', score: 55 }, { quarter: 'Q6', score: 55 }],
  ETH: [{ quarter: 'Q1', score: 58 }, { quarter: 'Q2', score: 62 }, { quarter: 'Q3', score: 65 }, { quarter: 'Q4', score: 68 }, { quarter: 'Q5', score: 68 }, { quarter: 'Q6', score: 68 }],
};

// ── Intervention History ────────────────────────────────────────────────────

const INTERVENTIONS = [
  { municipality: 'Mangaung', province: 'Free State', date: '2022-04-01', type: 'Full Administration', status: 'Active', reason: 'Financial crisis and service delivery collapse' },
  { municipality: 'Buffalo City', province: 'Eastern Cape', date: '2023-02-15', type: 'Partial Intervention', status: 'Active', reason: 'Persistent financial mismanagement' },
  { municipality: 'Ekurhuleni', province: 'Gauteng', date: '2024-06-01', type: 'Full Administration', status: 'Active', reason: 'Disclaimer audit and cash flow crisis' },
  { municipality: 'Msunduzi', province: 'KwaZulu-Natal', date: '2023-08-20', type: 'Financial Recovery', status: 'Active', reason: 'Adverse audit outcome and irregular expenditure' },
  { municipality: 'Tshwane', province: 'Gauteng', date: '2020-03-01', type: 'Full Administration', status: 'Withdrawn', reason: 'Governance dysfunction (withdrawn 2022)' },
  { municipality: 'eThekwini', province: 'KwaZulu-Natal', date: '2024-11-01', type: 'Support Programme', status: 'Active', reason: 'Qualified audit and service delivery failures' },
];

// ── Risk Distribution Data ──────────────────────────────────────────────────

const RISK_DISTRIBUTION = [
  { name: 'Critical', value: 2, color: '#EF4444' },
  { name: 'High', value: 3, color: '#F97316' },
  { name: 'Elevated', value: 3, color: '#F59E0B' },
  { name: 'Moderate', value: 3, color: '#3B82F6' },
  { name: 'Low', value: 1, color: '#10B981' },
];

// ── Helper: Risk Color ──────────────────────────────────────────────────────

function getRiskColor(score: number): string {
  if (score >= 70) return '#EF4444';
  if (score >= 50) return '#F97316';
  if (score >= 30) return '#F59E0B';
  if (score >= 15) return '#3B82F6';
  return '#10B981';
}

function getRiskLabel(score: number): string {
  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 30) return 'Elevated';
  if (score >= 15) return 'Moderate';
  return 'Low';
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function EarlyAlert() {
  const [selectedMuni, setSelectedMuni] = useState('EKU');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);

  const trendData = ECRS_TRENDS[selectedMuni] || ECRS_TRENDS['EKU'];
  const selectedMuniData = MOCK_MUNICIPALITIES.find((m) => m.code === selectedMuni);

  const handleGenerateBrief = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setBriefGenerated(true);
    }, 2000);
  };

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
              <AlertTriangle className="size-5" style={{ color: ACCENT_FROM }} />
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
              EarlyAlert
            </h1>
            <p className="text-xs text-zinc-400">Section 139 intervention risk prediction</p>
          </div>
          <Badge className="badge-premium badge-phase3 ml-2">Phase 3</Badge>
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}>
            <Siren className="size-3 mr-1" />Intervention Risk
          </Badge>
        </div>
      </motion.div>

      {/* ── Risk Dashboard — Traffic Light Grid with larger cells and hover glow ── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Risk Dashboard — All Municipalities at a Glance</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">Traffic light grid: Early Composite Risk Score (ECRS) per municipality</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-3">
              {MOCK_MUNICIPALITIES.map((muni, i) => {
                const score = muni.earlyAlertScore ?? 0;
                const riskCol = getRiskColor(score);
                return (
                  <motion.div
                    key={muni.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => setSelectedMuni(muni.code)}
                      className={cn(
                        'size-14 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden',
                        selectedMuni === muni.code && 'ring-2 ring-white/40 scale-110 z-10'
                      )}
                      style={{
                        backgroundColor: riskCol,
                        opacity: 0.4 + (score / 100) * 0.6,
                      }}
                    >
                      {/* Hover glow overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }} />
                      <span className="text-[10px] font-bold text-white/90">{muni.code}</span>
                      <span className="text-[8px] font-medium text-white/70">{score}</span>
                    </button>
                    {/* Enhanced tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-52">
                      <div className="tooltip-premium p-3 text-[11px]">
                        <p className="font-semibold text-zinc-200">{muni.name}</p>
                        <Separator className="my-1.5 bg-white/[0.08]" />
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                          <span className="text-zinc-400">ECRS:</span>
                          <span className="font-semibold" style={{ color: riskCol }}>{score}/100</span>
                          <span className="text-zinc-400">Risk:</span>
                          <span className="text-zinc-300">{getRiskLabel(score)}</span>
                          <span className="text-zinc-400">§139:</span>
                          <span className="text-zinc-300">{muni.section139Status}</span>
                          <span className="text-zinc-400">FHS:</span>
                          <span className="text-zinc-300">{muni.financialHealthScore}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] text-zinc-400">Risk Level:</span>
              {[
                { label: 'Low (0-15)', color: '#10B981' },
                { label: 'Moderate (15-30)', color: '#3B82F6' },
                { label: 'Elevated (30-50)', color: '#F59E0B' },
                { label: 'High (50-70)', color: '#F97316' },
                { label: 'Critical (70+)', color: '#EF4444' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="size-3 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] text-zinc-400">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── ECRS Trend + Briefing Generator + Risk Distribution ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ECRS Trend — premium chart with gradient fill */}
        <motion.div variants={itemFadeIn} className="lg:col-span-2">
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-zinc-200">
                    ECRS Trend — {selectedMuniData?.name ?? selectedMuni}
                  </CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5">6-quarter Early Composite Risk Score trajectory</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] h-5 px-2" style={{ backgroundColor: `${getRiskColor(selectedMuniData?.earlyAlertScore ?? 0)}20`, color: getRiskColor(selectedMuniData?.earlyAlertScore ?? 0), borderColor: `${getRiskColor(selectedMuniData?.earlyAlertScore ?? 0)}30` }}>
                    ECRS: {selectedMuniData?.earlyAlertScore ?? '—'}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400">
                    §139: {selectedMuniData?.section139Status ?? '—'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="ecrsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT_FROM} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={ACCENT_TO} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="quarter" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e4e4e7',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke={ACCENT_FROM} strokeWidth={2.5} dot={{ r: 5, fill: ACCENT_FROM, stroke: ACCENT_TO, strokeWidth: 2 }} activeDot={{ r: 7, fill: ACCENT_TO, stroke: '#fff', strokeWidth: 2 }} name="ECRS Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[1px] bg-white/[0.06] relative mt-4">
                <div className="absolute -top-2.5 left-0 right-0 flex justify-between text-[9px] text-zinc-400">
                  <span>Low Risk</span>
                  <span>Moderate</span>
                  <span>Elevated</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Briefing Generator */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200">Automated Briefing Generator</CardTitle>
              <p className="text-[11px] text-zinc-400 mt-0.5">Generate MEC briefing document</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="rounded-lg border border-white/[0.06] p-3" style={{ borderLeftWidth: '3px', borderLeftColor: ACCENT_FROM }}>
                <p className="text-[11px] font-medium text-zinc-400">Selected Municipality</p>
                <p className="text-sm font-semibold text-zinc-200 mt-1">{selectedMuniData?.name ?? selectedMuni}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div><span className="text-zinc-400">Province:</span> <span className="text-zinc-300">{selectedMuniData?.province}</span></div>
                  <div><span className="text-zinc-400">ECRS:</span> <span className="font-semibold" style={{ color: getRiskColor(selectedMuniData?.earlyAlertScore ?? 0) }}>{selectedMuniData?.earlyAlertScore}/100</span></div>
                  <div><span className="text-zinc-400">FHS:</span> <span className="text-zinc-300">{selectedMuniData?.financialHealthScore}</span></div>
                  <div><span className="text-zinc-400">Cash:</span> <span className="text-zinc-300">{selectedMuniData?.cashCoverageDays}d</span></div>
                </div>
              </div>
              {briefGenerated ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <CheckCircle2 className="size-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-emerald-400 font-medium">MEC Briefing Generated</p>
                  <p className="text-[10px] text-zinc-400 mt-1">3 pages · PDF format</p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px] border-white/[0.08]">Download</Button>
                </motion.div>
              ) : (
                <Button
                  onClick={handleGenerateBrief}
                  disabled={isGenerating}
                  className="w-full h-9 text-[11px] hover:scale-[1.02] transition-transform"
                  style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}
                  variant="outline"
                >
                  {isGenerating ? <><Loader2 className="size-4 mr-2 animate-spin" />Generating...</> : <><FileText className="size-4 mr-2" />Generate Briefing</>}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Risk Distribution Section ─────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="size-4" style={{ color: ACCENT_FROM }} />
                <CardTitle className="text-sm font-semibold text-zinc-200">Risk Distribution</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Severity breakdown across monitored municipalities</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-6">
                <div className="relative w-[160px] h-[160px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={RISK_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {RISK_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(13,18,36,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e4e4e7',
                          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-zinc-100 tabular-nums">12</span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {RISK_DISTRIBUTION.map((item) => (
                    <div key={item.name} className="flex items-center gap-2.5">
                      <div className="size-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-zinc-300 flex-1">{item.name}</span>
                      <span className="text-xs font-bold text-zinc-200 tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-zinc-400 tabular-nums w-8 text-right">{((item.value / 12) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Summary Cards */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_TO}, ${ACCENT_FROM})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Eye className="size-4" style={{ color: ACCENT_TO }} />
                <CardTitle className="text-sm font-semibold text-zinc-200">Key Risk Indicators</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Top risk factors driving Section 139 triggers</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  { label: 'Financial Mismanagement', pct: 78, color: '#EF4444' },
                  { label: 'Service Delivery Collapse', pct: 65, color: '#F97316' },
                  { label: 'Governance Dysfunction', pct: 58, color: ACCENT_FROM },
                  { label: 'Irregular Expenditure', pct: 72, color: ACCENT_TO },
                  { label: 'Cash Flow Crisis', pct: 45, color: '#F59E0B' },
                ].map((item) => (
                  <div key={item.label} className="relative overflow-hidden rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${item.color}, transparent)` }} />
                    <div className="relative flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-zinc-200">{item.label}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="progress-premium h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="progress-bar h-full rounded-full"
                        style={{ '--progress-from': item.color, '--progress-to': `${item.color}88` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Intervention History — timeline with gradient line ── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Section 139 Intervention History</CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">Timeline of past and current interventions</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              {/* Gradient timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(180deg, ${ACCENT_FROM}, ${ACCENT_TO}, transparent)` }} />
              {INTERVENTIONS.map((int, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="relative pl-8 pb-6 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-1 top-1 size-3.5 rounded-full border-2',
                    int.status === 'Active' ? '' : 'bg-zinc-600 border-zinc-600/50'
                  )} style={int.status === 'Active' ? { background: ACCENT_FROM, borderColor: `${ACCENT_FROM}50`, boxShadow: `0 0 8px ${ACCENT_FROM}40` } : {}} />
                  <motion.div
                    whileHover={{ scale: 1.01, borderColor: `${ACCENT_FROM}25` }}
                    className={cn(
                      'rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden',
                      i % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                    )}
                    style={{ borderLeftWidth: '2px', borderLeftColor: int.status === 'Active' ? ACCENT_FROM : '#52525b' }}
                  >
                    <div className="absolute inset-0 opacity-[0.02]" style={{ background: `linear-gradient(135deg, ${int.status === 'Active' ? ACCENT_FROM : '#52525b'}, transparent)` }} />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{int.municipality}</p>
                        <p className="text-[11px] text-zinc-300 mt-0.5">{int.reason}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] h-5 px-1.5 shrink-0',
                          int.status === 'Active' ? '' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        )}
                        style={int.status === 'Active' ? { background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` } : {}}
                      >
                        {int.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span className="text-zinc-400">{int.type}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">{int.province}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400">{formatSADate(int.date)}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
