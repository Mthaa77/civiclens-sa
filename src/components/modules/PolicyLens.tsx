'use client';

import React, { useState, useMemo } from 'react';
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
  { id: 'labour', label: 'Labour', icon: '👷', color: '#3B82F6', indicators: ['Unemployment Rate', 'Youth Unemployment', 'Formal Employment', 'Informal Employment', 'Labour Force Participation'] },
  { id: 'poverty', label: 'Poverty', icon: '📊', color: '#EF4444', indicators: ['Poverty Rate', 'Gini Coefficient', 'SASSA Dependency', 'Household Income', 'Food Security'] },
  { id: 'health', label: 'Health', icon: '🏥', color: '#10B981', indicators: ['Life Expectancy', 'Infant Mortality', 'HIV Prevalence', 'Healthcare Access', 'Immunisation Rate'] },
  { id: 'education', label: 'Education', icon: '📚', color: '#8B5CF6', indicators: ['Matric Pass Rate', 'Literacy Rate', 'School Infrastructure', 'Teacher:Learner Ratio', 'ECD Access'] },
  { id: 'water', label: 'Water', icon: '💧', color: '#0891B2', indicators: ['Water Access', 'Blue Drop Score', 'Sanitation Access', 'Green Drop Score', 'Water Loss Rate'] },
  { id: 'crime', label: 'Crime', icon: '🛡️', color: '#F59E0B', indicators: ['Murder Rate', 'Sexual Offences', 'Property Crime', 'Drug-related Crime', 'Police:Population Ratio'] },
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function PolicyLens() {
  const [selectedTheme, setSelectedTheme] = useState('labour');
  const [briefTopic, setBriefTopic] = useState('');
  const [briefGeography, setBriefGeography] = useState('');
  const [briefAudience, setBriefAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);

  const currentTheme = THEMES.find((t) => t.id === selectedTheme);

  const handleGenerateBrief = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setBriefGenerated(true);
    }, 2000);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#6D28D9]/10 border border-[#6D28D9]/20">
            <ScrollText className="size-5 text-[#6D28D9]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">PolicyLens</h1>
            <p className="text-xs text-zinc-500">Evidence-based policy intelligence</p>
          </div>
          <Badge className="ml-2 bg-[#6D28D9]/15 text-[#6D28D9] border-[#6D28D9]/25 text-[10px] h-5 px-1.5">
            Phase 2
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="brief" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] h-9">
          <TabsTrigger value="brief" className="text-[11px] data-[state=active]:bg-[#6D28D9]/20 data-[state=active]:text-[#6D28D9]">
            <Brain className="size-3 mr-1" /> Brief Generator
          </TabsTrigger>
          <TabsTrigger value="explorer" className="text-[11px] data-[state=active]:bg-[#6D28D9]/20 data-[state=active]:text-[#6D28D9]">
            <Search className="size-3 mr-1" /> Indicator Explorer
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-[11px] data-[state=active]:bg-[#6D28D9]/20 data-[state=active]:text-[#6D28D9]">
            <TrendingUp className="size-3 mr-1" /> Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-[11px] data-[state=active]:bg-[#6D28D9]/20 data-[state=active]:text-[#6D28D9]">
            <Table2 className="size-3 mr-1" /> Comparison
          </TabsTrigger>
        </TabsList>

        {/* ── Brief Generator Tab ──────────────────────────── */}
        <TabsContent value="brief">
          <motion.div variants={itemFadeIn} initial="hidden" animate="show">
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Policy Brief Generator</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">Generate evidence-based policy briefs on any topic</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-zinc-400">Topic</label>
                    <Input
                      placeholder="e.g., Water service delivery gaps"
                      value={briefTopic}
                      onChange={(e) => { setBriefTopic(e.target.value); setBriefGenerated(false); }}
                      className="h-8 text-xs border-white/[0.08] bg-white/[0.03]"
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
                      className="bg-[#6D28D9]/20 text-[#6D28D9] border-[#6D28D9]/30 hover:bg-[#6D28D9]/30 h-9 px-5"
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
                      'border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all cursor-pointer overflow-hidden',
                      selectedTheme === theme.id && 'ring-1 ring-[#6D28D9]/30 border-[#6D28D9]/30'
                    )}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: theme.color, opacity: selectedTheme === theme.id ? 1 : 0.3 }} />
                    <CardContent className="p-3 text-center">
                      <span className="text-2xl">{theme.icon}</span>
                      <p className="text-xs font-semibold text-zinc-300 mt-1">{theme.label}</p>
                      <p className="text-[10px] text-zinc-600">{theme.indicators.length} indicators</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {currentTheme && (
              <motion.div variants={itemFadeIn}>
                <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-zinc-200">{currentTheme.icon} {currentTheme.label} Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentTheme.indicators.map((ind, i) => (
                        <div key={ind} className="rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.12] transition-all">
                          <p className="text-xs font-medium text-zinc-300">{ind}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                              <div className="h-full rounded-full" style={{ backgroundColor: currentTheme.color, width: `${60 + Math.random() * 35}%` }} />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium tabular-nums">{(45 + Math.random() * 50).toFixed(1)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-1">Source: Stats SA / Municipal Money</p>
                        </div>
                      ))}
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
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Multi-Indicator Trend Dashboard</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">National trend lines for key socio-economic indicators (2018–2024)</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 70]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => `${v}%`} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="unemployment" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Unemployment" />
                      <Line type="monotone" dataKey="youthUnemployment" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Youth Unemployment" />
                      <Line type="monotone" dataKey="povertyRate" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Poverty Rate" />
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
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Provincial Comparison</CardTitle>
                <p className="text-[11px] text-zinc-500 mt-0.5">Key indicators compared across provinces</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PROVINCIAL_COMPARISON} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ background: 'rgba(13,18,36,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }} formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="unemployment" fill="#3B82F6" barSize={8} name="Unemployment" radius={[0, 2, 2, 0]} />
                      <Bar dataKey="waterAccess" fill="#10B981" barSize={8} name="Water Access" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Province</TableHead>
                      <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Unemployment</TableHead>
                      <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Poverty</TableHead>
                      <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Water Access</TableHead>
                      <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Matric Pass</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PROVINCIAL_COMPARISON.map((row) => (
                      <TableRow key={row.name} className="border-white/[0.04] hover:bg-white/[0.03]">
                        <TableCell className="text-xs font-medium text-zinc-300">{row.name}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: row.unemployment > 35 ? '#EF4444' : row.unemployment > 30 ? '#F59E0B' : '#10B981' }}>{formatPercent(row.unemployment)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: row.poverty > 50 ? '#EF4444' : row.poverty > 40 ? '#F59E0B' : '#10B981' }}>{formatPercent(row.poverty)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: row.waterAccess >= 90 ? '#10B981' : row.waterAccess >= 75 ? '#F59E0B' : '#EF4444' }}>{formatPercent(row.waterAccess)}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums" style={{ color: row.matricPass >= 75 ? '#10B981' : row.matricPass >= 70 ? '#F59E0B' : '#EF4444' }}>{formatPercent(row.matricPass)}</TableCell>
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
