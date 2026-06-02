'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'recharts';
import {
  ScrollText,
  Search,
  BookOpen,
  TrendingUp,
  BarChart3,
  Table2,
  Loader2,
  CheckCircle2,
  Brain,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES, PROVINCE_SUMMARY } from '@/lib/mock-data';
import { formatPercent, formatNumber } from '@/lib/formatters';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  { id: 'labour', label: 'Labour', icon: '👷', color: '#3B82F6', indicators: ['Unemployment Rate', 'Youth Unemployment', 'Formal Employment', 'Informal Employment', 'Labour Force Participation'], nationalAvg: [31.5, 44.8, 62, 18, 56] },
  { id: 'poverty', label: 'Poverty', icon: '📊', color: '#EF4444', indicators: ['Poverty Rate', 'Gini Coefficient', 'SASSA Dependency', 'Household Income', 'Food Security'], nationalAvg: [50.8, 0.61, 47, 18700, 78] },
  { id: 'health', label: 'Health', icon: '🏥', color: '#10B981', indicators: ['Life Expectancy', 'Infant Mortality', 'HIV Prevalence', 'Healthcare Access', 'Immunisation Rate'], nationalAvg: [65, 22, 13.7, 72, 80] },
  { id: 'education', label: 'Education', icon: '📚', color: '#8B5CF6', indicators: ['Matric Pass Rate', 'Literacy Rate', 'School Infrastructure', 'Teacher:Learner Ratio', 'ECD Access'], nationalAvg: [74, 87, 58, '1:32', 62] },
  { id: 'water', label: 'Water', icon: '💧', color: '#0891B2', indicators: ['Water Access', 'Blue Drop Score', 'Sanitation Access', 'Green Drop Score', 'Water Loss Rate'], nationalAvg: [81.2, 44, 72.5, 38, 37] },
  { id: 'crime', label: 'Crime', icon: '🛡️', color: '#F59E0B', indicators: ['Murder Rate', 'Sexual Offences', 'Property Crime', 'Drug-related Crime', 'Police:Population Ratio'], nationalAvg: [33, 72, 142, 108, '1:389'] },
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

// ── Key Policy Insights (rotating) ─────────────────────────────────────────

const POLICY_INSIGHTS = [
  { title: 'Youth Unemployment Crisis', description: 'SA youth unemployment (44.8%) remains the highest globally. Targeted intervention in Eastern Cape and Limpopo could impact 2.8M youth.', icon: Target, color: '#EF4444' },
  { title: 'Water Infrastructure Decline', description: 'Blue Drop scores have dropped 44% since 2012. R128B required to address water infrastructure backlog nationwide.', icon: Lightbulb, color: '#0891B2' },
  { title: 'Education Outcomes Gap', description: 'Matric pass rates vary 17pp between Western Cape (82.5%) and Limpopo (65.2%), correlating with infrastructure investment.', icon: BookOpen, color: '#8B5CF6' },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function PolicyLens() {
  const [selectedTheme, setSelectedTheme] = useState('labour');
  const [briefTopic, setBriefTopic] = useState('');
  const [briefGeography, setBriefGeography] = useState('');
  const [briefAudience, setBriefAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const currentTheme = THEMES.find((t) => t.id === selectedTheme);

  // Auto-rotate insights
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % POLICY_INSIGHTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateBrief = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setBriefGenerated(true);
    }, 2000);
  };

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

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
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
              <ScrollText className="size-5" style={{ color: ACCENT_TO }} />
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
          <Badge className="badge-premium badge-phase2 ml-2">Phase 2</Badge>
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
            <Brain className="size-3 mr-1" />Policy Intelligence
          </Badge>
        </div>
      </motion.div>

      {/* ── Key Policy Insights (rotating) ───────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardContent className="p-0">
            <div className="relative overflow-hidden" style={{ minHeight: '80px' }}>
              {POLICY_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: insightIndex === i ? 1 : 0, x: insightIndex === i ? 0 : 40 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 flex items-center gap-4 p-4"
                  style={{ pointerEvents: insightIndex === i ? 'auto' : 'none' }}
                >
                  <div className="flex size-10 items-center justify-center rounded-xl shrink-0" style={{ background: `${insight.color}15`, border: `1px solid ${insight.color}25` }}>
                    <insight.icon className="size-5" style={{ color: insight.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-200">{insight.title}</p>
                    <p className="text-[11px] text-zinc-300 leading-relaxed mt-0.5">{insight.description}</p>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="brief" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-9">
          <TabsTrigger value="brief" className="text-[11px] data-[state=active]:bg-[#0F766E]/20 data-[state=active]:text-[#06B6D4]">
            <Brain className="size-3 mr-1" /> Brief Generator
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

        {/* ── Brief Generator Tab ──────────────────────────── */}
        <TabsContent value="brief">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Policy Brief Generator</CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">Generate evidence-based policy briefs on any topic</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Topic</label>
                    <Input
                      placeholder="e.g., Water service delivery gaps"
                      value={briefTopic}
                      onChange={(e) => { setBriefTopic(e.target.value); setBriefGenerated(false); }}
                      className="h-8 text-xs border-white/[0.08] bg-white/[0.03] focus:border-[#06B6D4]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Geography</label>
                    <Select value={briefGeography} onValueChange={(v) => { setBriefGeography(v); setBriefGenerated(false); }}>
                      <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03]">
                        <SelectValue placeholder="Select geography" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="kzn">KwaZulu-Natal</SelectItem>
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Audience</label>
                    <Select value={briefAudience} onValueChange={(v) => { setBriefAudience(v); setBriefGenerated(false); }}>
                      <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-white/[0.03]">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="policymaker">Policymaker</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="media">Media / Journalist</SelectItem>
                        <SelectItem value="public">General Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-5">
                  {briefGenerated ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">Brief generated successfully</span>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] border-white/[0.08]">Download PDF</Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleGenerateBrief}
                      disabled={isGenerating || !briefTopic}
                      className="bg-[#0F766E]/20 text-[#06B6D4] border-[#0F766E]/30 hover:bg-[#0F766E]/30 h-9 px-5"
                      variant="outline"
                    >
                      {isGenerating ? <><Loader2 className="size-4 mr-2 animate-spin" />Generating...</> : <><Brain className="size-4 mr-2" />Generate Brief</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Indicator Explorer Tab ───────────────────────── */}
        <TabsContent value="explorer">
          <motion.div variants={containerStagger} initial="hidden" animate="show" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                      <span className="text-2xl">{theme.icon}</span>
                      <p className="text-xs font-semibold text-zinc-300 mt-1">{theme.label}</p>
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
                    <CardTitle className="text-sm font-semibold text-zinc-200">{currentTheme.icon} {currentTheme.label} Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentTheme.indicators.map((ind, i) => {
                        const natAvg = currentTheme.nationalAvg[i];
                        const displayVal = typeof natAvg === 'number' ? natAvg.toFixed(1) : natAvg;
                        const barWidth = typeof natAvg === 'number' ? Math.min(natAvg, 100) : 50;
                        return (
                          <motion.div
                            key={ind}
                            whileHover={{ scale: 1.01, borderColor: `${currentTheme.color}30` }}
                            className="rounded-lg border border-white/[0.06] p-3 transition-all relative overflow-hidden"
                            style={{ borderLeftWidth: '3px', borderLeftColor: currentTheme.color }}
                          >
                            <div className="absolute inset-0 opacity-[0.02]" style={{ background: `linear-gradient(135deg, ${currentTheme.color}, transparent)` }} />
                            <div className="relative">
                              <p className="text-xs font-semibold text-zinc-200">{ind}</p>
                              <div className="flex items-center gap-2 mt-2">
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
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Source: Stats SA / Municipal Money</p>
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
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Multi-Indicator Trend Dashboard</CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">National trend lines for key socio-economic indicators (2018–2024)</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                      {/* National Development Plan target reference lines */}
                      <ReferenceLine y={14} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'NDP Target: 14%', fill: '#10B981', fontSize: 9, position: 'right' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="unemployment" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Unemployment" />
                      <Line type="monotone" dataKey="youthUnemployment" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Youth Unemployment" />
                      <Line type="monotone" dataKey="povertyRate" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 6 }} name="Poverty Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Comparison Tables Tab ────────────────────────── */}
        <TabsContent value="comparison">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="glass-card-v2 card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Provincial Comparison</CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">Key indicators compared across provinces — click column headers to sort</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px] mb-4">
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}08, ${ACCENT_TO}08)` }}>
                      <TableHead className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">Province</TableHead>
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
                    {sortedComparison.map((row, idx) => (
                      <TableRow
                        key={row.name}
                        className={cn(
                          'border-white/[0.04] hover:bg-white/[0.04] transition-colors',
                          idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                        )}
                        style={{ borderLeftWidth: '2px', borderLeftColor: `${ACCENT_FROM}30` }}
                      >
                        <TableCell className="text-xs font-medium text-zinc-200">{row.name}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: row.unemployment > 35 ? '#EF4444' : row.unemployment > 30 ? '#F59E0B' : '#10B981' }}>{formatPercent(row.unemployment)}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: row.poverty > 50 ? '#EF4444' : row.poverty > 40 ? '#F59E0B' : '#10B981' }}>{formatPercent(row.poverty)}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: row.waterAccess >= 90 ? '#10B981' : row.waterAccess >= 75 ? '#F59E0B' : '#EF4444' }}>{formatPercent(row.waterAccess)}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums" style={{ color: row.matricPass >= 75 ? '#10B981' : row.matricPass >= 70 ? '#F59E0B' : '#EF4444' }}>{formatPercent(row.matricPass)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
