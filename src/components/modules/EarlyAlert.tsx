'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceArea,
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
  TrendingDown,
  Minus,
  Building2,
  Brain,
  Download,
  Clock,
  ChevronRight,
  ArrowRight,
  DollarSign,
  Users,
  Zap,
  Target,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_MUNICIPALITIES } from '@/lib/mock-data';
import { formatSADate } from '@/lib/formatters';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// ── Risk Signals for Feed ───────────────────────────────────────────────────

interface RiskSignal {
  id: string;
  municipality: string;
  municipalityCode: string;
  type: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detectedAt: string;
  status: 'Active' | 'Reviewed';
}

const RISK_FEED_SIGNALS: RiskSignal[] = [
  { id: 'rs-1', municipality: 'Ekurhuleni', municipalityCode: 'EKU', type: 'Cash Flow Crisis', description: 'Cash coverage dropped below 15 days. Immediate intervention required to avoid service delivery collapse.', severity: 'Critical', detectedAt: '2026-03-03T08:00:00', status: 'Active' },
  { id: 'rs-2', municipality: 'Mangaung', municipalityCode: 'MAN', type: 'Governance Dysfunction', description: 'Council failed to pass adjustment budget for third consecutive quarter. Section 139 escalation likely.', severity: 'Critical', detectedAt: '2026-03-03T06:30:00', status: 'Active' },
  { id: 'rs-3', municipality: 'eThekwini', municipalityCode: 'ETH', type: 'Service Delivery Gap', description: 'Water supply interruptions affecting 40% of households. Infrastructure maintenance backlog R2.3B.', severity: 'High', detectedAt: '2026-03-02T14:00:00', status: 'Active' },
  { id: 'rs-4', municipality: 'Buffalo City', municipalityCode: 'BUF', type: 'Irregular Expenditure', description: 'R890M in irregular expenditure identified in Q2 audit. Pattern suggests procurement irregularities.', severity: 'High', detectedAt: '2026-02-28T10:00:00', status: 'Active' },
  { id: 'rs-5', municipality: 'Msunduzi', municipalityCode: 'MSU', type: 'Budget Overrun', description: 'Operating expenditure 23% above approved budget at Q3. Revenue collection declining at 8% per quarter.', severity: 'High', detectedAt: '2026-02-27T16:00:00', status: 'Active' },
  { id: 'rs-6', municipality: 'Johannesburg', municipalityCode: 'JHB', type: 'Debt Escalation', description: 'Total debt service ratio exceeding 25% of operating revenue. Credit rating downgrade imminent.', severity: 'Medium', detectedAt: '2026-02-25T09:00:00', status: 'Active' },
  { id: 'rs-7', municipality: 'Tshwane', municipalityCode: 'TSH', type: 'Grant Underspend', description: 'Only 42% of conditional grants spent by Q3. Risk of grant clawback R1.2B.', severity: 'Medium', detectedAt: '2026-02-20T11:00:00', status: 'Reviewed' },
  { id: 'rs-8', municipality: 'Cape Town', municipalityCode: 'CPT', type: 'Supplier Concentration', description: 'Top 5 suppliers receiving 68% of procurement value. Concentration index above threshold.', severity: 'Low', detectedAt: '2026-02-15T08:00:00', status: 'Reviewed' },
];

// ── Intervention History ────────────────────────────────────────────────────

interface Intervention {
  municipality: string;
  province: string;
  date: string;
  type: string;
  status: 'Active' | 'Withdrawn' | 'Completed';
  reason: string;
  outcome?: 'Successful' | 'Ongoing' | 'Withdrawn';
}

const INTERVENTIONS: Intervention[] = [
  { municipality: 'Mangaung', province: 'Free State', date: '2022-04-01', type: 'Full Administration', status: 'Active', reason: 'Financial crisis and service delivery collapse', outcome: 'Ongoing' },
  { municipality: 'Buffalo City', province: 'Eastern Cape', date: '2023-02-15', type: 'Partial Intervention', status: 'Active', reason: 'Persistent financial mismanagement', outcome: 'Ongoing' },
  { municipality: 'Ekurhuleni', province: 'Gauteng', date: '2024-06-01', type: 'Full Administration', status: 'Active', reason: 'Disclaimer audit and cash flow crisis', outcome: 'Ongoing' },
  { municipality: 'Msunduzi', province: 'KwaZulu-Natal', date: '2023-08-20', type: 'Financial Recovery', status: 'Active', reason: 'Adverse audit outcome and irregular expenditure', outcome: 'Ongoing' },
  { municipality: 'Tshwane', province: 'Gauteng', date: '2020-03-01', type: 'Full Administration', status: 'Withdrawn', reason: 'Governance dysfunction (withdrawn 2022)', outcome: 'Withdrawn' },
  { municipality: 'eThekwini', province: 'KwaZulu-Natal', date: '2024-11-01', type: 'Support Programme', status: 'Active', reason: 'Qualified audit and service delivery failures', outcome: 'Ongoing' },
];

// ── Risk Forecast Data ──────────────────────────────────────────────────────

interface RiskForecast {
  municipality: string;
  code: string;
  currentECRS: number;
  predictedECRS: number;
  direction: 'up' | 'down' | 'stable';
}

const RISK_FORECASTS: RiskForecast[] = [
  { municipality: 'Ekurhuleni', code: 'EKU', currentECRS: 78, predictedECRS: 82, direction: 'up' },
  { municipality: 'Mangaung', code: 'MAN', currentECRS: 88, predictedECRS: 85, direction: 'down' },
  { municipality: 'Buffalo City', code: 'BUF', currentECRS: 82, predictedECRS: 84, direction: 'up' },
  { municipality: 'Msunduzi', code: 'MSU', currentECRS: 80, predictedECRS: 78, direction: 'down' },
  { municipality: 'Johannesburg', code: 'JHB', currentECRS: 55, predictedECRS: 60, direction: 'up' },
  { municipality: 'eThekwini', code: 'ETH', currentECRS: 68, predictedECRS: 68, direction: 'stable' },
];

// ── Risk Distribution Data ──────────────────────────────────────────────────

const RISK_DISTRIBUTION = [
  { name: 'Critical', value: 2, color: '#EF4444' },
  { name: 'High', value: 3, color: '#F97316' },
  { name: 'Elevated', value: 3, color: '#F59E0B' },
  { name: 'Moderate', value: 3, color: '#3B82F6' },
  { name: 'Low', value: 1, color: '#10B981' },
];

// ── Radar Chart Data ────────────────────────────────────────────────────────

const RADAR_DIMENSIONS = [
  'Financial Health',
  'Service Delivery',
  'Cash Coverage',
  'Debt Risk',
  'Audit Risk',
  'Governance Risk',
];

const RADAR_COLORS = ['#F43F5E', '#3B82F6', '#10B981'];

function getRadarDataForMuni(code: string) {
  const muni = MOCK_MUNICIPALITIES.find((m) => m.code === code);
  if (!muni) return [];
  // Derive 6 dimensions: Financial Health (inverted), Service Delivery Pressure, Cash Coverage Risk, Debt Risk, Audit Risk, Governance Risk
  const financialHealthInverted = 100 - (muni.financialHealthScore ?? 50);
  const serviceDeliveryPressure = muni.serviceDeliveryScore ?? 50;
  const cashCoverageRisk = muni.cashCoverageDays > 60 ? 10 : muni.cashCoverageDays > 30 ? 30 : muni.cashCoverageDays > 15 ? 60 : 85;
  const debtRisk = muni.debtorCollectionRate > 90 ? 15 : muni.debtorCollectionRate > 70 ? 40 : muni.debtorCollectionRate > 50 ? 65 : 85;
  const auditRisk = muni.auditOutcome === 'Clean' ? 5 : muni.auditOutcome === 'Unqualified' ? 20 : muni.auditOutcome === 'Qualified' ? 55 : muni.auditOutcome === 'Adverse' ? 80 : 95;
  const governanceRisk = muni.section139Status === 'Intervention' ? 90 : muni.section139Status === 'Warning' ? 55 : 15;
  return [
    { dimension: 'Financial Health', value: financialHealthInverted },
    { dimension: 'Service Delivery', value: serviceDeliveryPressure },
    { dimension: 'Cash Coverage', value: cashCoverageRisk },
    { dimension: 'Debt Risk', value: debtRisk },
    { dimension: 'Audit Risk', value: auditRisk },
    { dimension: 'Governance Risk', value: governanceRisk },
  ];
}

// ── Intervention Cost Estimator Data ────────────────────────────────────────

interface CostEstimate {
  administratorSalary: { min: number; max: number };
  supportTeam: { min: number; max: number };
  technicalAdvisors: { min: number; max: number };
  totalAnnual: { min: number; max: number };
  projectedSavings: number;
  roi: number;
}

function calculateInterventionCost(code: string): CostEstimate {
  const muni = MOCK_MUNICIPALITIES.find((m) => m.code === code);
  if (!muni) {
    return {
      administratorSalary: { min: 2500000, max: 4500000 },
      supportTeam: { min: 5000000, max: 12000000 },
      technicalAdvisors: { min: 3000000, max: 8000000 },
      totalAnnual: { min: 10500000, max: 24500000 },
      projectedSavings: 0,
      roi: 0,
    };
  }
  // Scale costs based on municipality size (operating budget)
  const budgetScale = (muni.operatingBudget ?? 5000000000) / 50000000000;
  const scale = 0.5 + budgetScale * 0.8;
  const adminMin = Math.round(2500000 * scale);
  const adminMax = Math.round(4500000 * scale);
  const supportMin = Math.round(5000000 * scale);
  const supportMax = Math.round(12000000 * scale);
  const techMin = Math.round(3000000 * scale);
  const techMax = Math.round(8000000 * scale);
  const totalMin = adminMin + supportMin + techMin;
  const totalMax = adminMax + supportMax + techMax;
  // Projected savings: based on irregular expenditure reduction & efficiency gains
  const projectedSavings = Math.round(((muni.operatingBudget ?? 5000000000) * 0.08) + ((100 - (muni.financialHealthScore ?? 50)) * 2000000));
  const roi = projectedSavings > 0 ? ((projectedSavings - totalMax) / totalMax) * 100 : 0;
  return {
    administratorSalary: { min: adminMin, max: adminMax },
    supportTeam: { min: supportMin, max: supportMax },
    technicalAdvisors: { min: techMin, max: techMax },
    totalAnnual: { min: totalMin, max: totalMax },
    projectedSavings,
    roi,
  };
}

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

function getUrgencyBadge(detectedAt: string): { label: string; color: string; bg: string; border: string } {
  const detected = new Date(detectedAt);
  const now = new Date('2026-03-03T12:00:00');
  const hoursDiff = (now.getTime() - detected.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) return { label: 'Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' };
  if (hoursDiff < 168) return { label: 'Recent', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
  return { label: '', color: '', bg: '', border: '' };
}

function getOutcomeBadge(outcome?: string): { label: string; color: string; bg: string; border: string } | null {
  if (outcome === 'Successful') return { label: 'Successful', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' };
  if (outcome === 'Ongoing') return { label: 'Ongoing', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
  if (outcome === 'Withdrawn') return { label: 'Withdrawn', color: '#71717A', bg: 'rgba(113,113,122,0.15)', border: 'rgba(113,113,122,0.3)' };
  return null;
}

function calculateDuration(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date('2026-03-03');
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
}

function formatZAR(value: number): string {
  if (value >= 1_000_000_000) return `R${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}K`;
  return `R${value}`;
}

function getSeverityColor(severity: string): string {
  if (severity === 'Critical') return '#EF4444';
  if (severity === 'High') return '#F97316';
  if (severity === 'Medium') return '#F59E0B';
  return '#10B981';
}

// ── Custom Dot with Pulse Animation ─────────────────────────────────────────

function PulsingDot(props: Record<string, unknown>) {
  const cx = props.cx as number;
  const cy = props.cy as number;
  const payload = props.payload as { score: number };
  const color = getRiskColor(payload?.score ?? 50);
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#0d1224" strokeWidth={2} />
    </g>
  );
}

// ── Radar Sweep SVG Component ───────────────────────────────────────────────

function RadarSweep({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ borderRadius: 'inherit', overflow: 'hidden' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${color}40 40deg, transparent 80deg)`,
          borderRadius: 'inherit',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function EarlyAlert() {
  const { setActiveModule } = useNavigationStore();
  const [selectedMuni, setSelectedMuni] = useState('EKU');
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [radarSelected, setRadarSelected] = useState<string[]>(['EKU', 'MAN', 'BUF']);
  const [costMuni, setCostMuni] = useState('EKU');
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);

  const trendData = ECRS_TRENDS[selectedMuni] || ECRS_TRENDS['EKU'];
  const selectedMuniData = MOCK_MUNICIPALITIES.find((m) => m.code === selectedMuni);

  // Signal counts
  const activeSignals = RISK_FEED_SIGNALS.filter((s) => s.status === 'Active').length;
  const totalSignals = RISK_FEED_SIGNALS.length;

  const handleGenerateBrief = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setBriefGenerated(true);
    }, 2000);
  };

  const handleInvestigate = () => {
    setActiveModule('risklens');
  };

  const toggleRadarMuni = (code: string) => {
    setRadarSelected((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), code];
      }
      return [...prev, code];
    });
  };

  // Radar chart data
  const radarChartData = RADAR_DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim };
    radarSelected.forEach((code) => {
      const data = getRadarDataForMuni(code);
      const dimData = data.find((d) => d.dimension === dim);
      entry[code] = dimData?.value ?? 0;
    });
    return entry;
  });

  // Cost estimate
  const costEstimate = calculateInterventionCost(costMuni);
  const costMuniData = MOCK_MUNICIPALITIES.find((m) => m.code === costMuni);

  // Top signals for briefing
  const topSignals = RISK_FEED_SIGNALS.filter((s) => s.municipalityCode === selectedMuni)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* ── Enhanced Module Header ─────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-10 rounded-full shrink-0" style={{ background: `linear-gradient(180deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
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

          {/* Active Signals Counter */}
          <Badge className="badge-premium ml-1" style={{ background: `${ACCENT_TO}15`, color: ACCENT_TO, borderColor: `${ACCENT_TO}25` }}>
            <Activity className="size-3 mr-1" />
            Active Signals: {activeSignals} of {totalSignals} total
          </Badge>
        </div>
      </motion.div>

      {/* ── Quick Actions Bar ──────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleGenerateBrief}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[11px] bg-white/[0.04] backdrop-blur-sm border-white/[0.08] text-zinc-300 hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/30 hover:text-[#F43F5E] transition-all"
          >
            <FileText className="size-3.5" />
            Generate MEC Briefing
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[11px] bg-white/[0.04] backdrop-blur-sm border-white/[0.08] text-zinc-300 hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/30 hover:text-[#F43F5E] transition-all"
            onClick={() => setActiveModule('reportlens')}
          >
            <Download className="size-3.5" />
            Export Risk Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[11px] bg-white/[0.04] backdrop-blur-sm border-white/[0.08] text-zinc-300 hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/30 hover:text-[#F43F5E] transition-all"
          >
            <Clock className="size-3.5" />
            View Full History
          </Button>
        </div>
      </motion.div>

      {/* ── Risk Dashboard — Enhanced Traffic Light Grid ── */}
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
                const isCritical = score >= 70;
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
                        'size-16 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden',
                        selectedMuni === muni.code && 'ring-2 ring-white/40 scale-110 z-10'
                      )}
                      style={{
                        backgroundColor: riskCol,
                        opacity: 0.4 + (score / 100) * 0.6,
                        boxShadow: `0 0 12px ${riskCol}40, 0 0 4px ${riskCol}20`,
                      }}
                    >
                      {/* Radar sweep on critical blocks */}
                      {isCritical && <RadarSweep color={riskCol} />}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity" style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }} />
                      <span className="text-[10px] font-bold text-white/90 relative z-10">{muni.code}</span>
                      <span className="text-[8px] font-medium text-white/70 relative z-10">{score}</span>
                    </button>
                    {/* Magnified hover card below the block */}
                    <AnimatePresence>
                      <motion.div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-60 hidden group-hover:block"
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="rounded-xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl p-3 text-[11px] shadow-2xl" style={{ boxShadow: `0 0 20px ${riskCol}15` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="size-3.5" style={{ color: riskCol }} />
                            <p className="font-semibold text-zinc-200">{muni.name}</p>
                          </div>
                          <Separator className="my-1.5 bg-white/[0.08]" />
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            <span className="text-zinc-400">ECRS:</span>
                            <span className="font-semibold" style={{ color: riskCol }}>{score}/100</span>
                            <span className="text-zinc-400">Risk:</span>
                            <span className="text-zinc-300">{getRiskLabel(score)}</span>
                            <span className="text-zinc-400">§139:</span>
                            <span className="text-zinc-300">{muni.section139Status}</span>
                            <span className="text-zinc-400">FHS:</span>
                            <span className="text-zinc-300">{muni.financialHealthScore}</span>
                            <span className="text-zinc-400">Cash:</span>
                            <span className="text-zinc-300">{muni.cashCoverageDays}d</span>
                            <span className="text-zinc-400">Audit:</span>
                            <span className="text-zinc-300">{muni.auditOutcome}</span>
                            <span className="text-zinc-400">Province:</span>
                            <span className="text-zinc-300">{muni.province}</span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
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
                  <div className="size-3 rounded-sm" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}30` }} />
                  <span className="text-[10px] text-zinc-400">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Premium Risk Feed Signals ── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Eye className="size-4" style={{ color: ACCENT_FROM }} />
                  Risk Signal Feed
                </CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">Latest detected risk signals — hover for details</p>
              </div>
              <Badge style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}>
                {activeSignals} active / {totalSignals} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-72">
              <div className="space-y-2">
                {RISK_FEED_SIGNALS.map((signal, i) => {
                  const urgency = getUrgencyBadge(signal.detectedAt);
                  const sevColor = getSeverityColor(signal.severity);
                  return (
                    <TooltipProvider key={signal.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
                        className="group"
                      >
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-default relative overflow-hidden"
                              style={{
                                borderLeftWidth: '3px',
                                borderLeftColor: sevColor,
                                borderImage: `linear-gradient(180deg, ${sevColor}, transparent) 1`,
                              }}
                            >
                              {/* Subtle gradient overlay */}
                              <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${sevColor}, transparent)` }} />

                              {/* Severity indicator with pulsing glow on Critical */}
                              <motion.div
                                className="size-2.5 rounded-full shrink-0 relative z-10"
                                style={{
                                  backgroundColor: sevColor,
                                  boxShadow: `0 0 6px ${sevColor}80`,
                                }}
                                animate={signal.severity === 'Critical' ? {
                                  boxShadow: [
                                    `0 0 4px ${sevColor}80`,
                                    `0 0 12px ${sevColor}CC`,
                                    `0 0 4px ${sevColor}80`,
                                  ],
                                } : {}}
                                transition={signal.severity === 'Critical' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                              />
                              {/* Municipality with Building2 icon */}
                              <div className="flex items-center gap-1.5 min-w-0 shrink-0 relative z-10">
                                <Building2 className="size-3 text-zinc-500" />
                                <span className="text-[11px] font-semibold text-zinc-200 truncate">{signal.municipality}</span>
                              </div>
                              {/* Signal type */}
                              <span className="text-[11px] text-zinc-400 flex-1 truncate relative z-10">{signal.type}</span>
                              {/* Urgency badge */}
                              {urgency.label && (
                                <Badge
                                  variant="outline"
                                  className="text-[8px] h-4 px-1.5 shrink-0 relative z-10"
                                  style={{ color: urgency.color, background: urgency.bg, borderColor: urgency.border }}
                                >
                                  {urgency.label}
                                </Badge>
                              )}
                              {/* Severity badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[8px] h-4 px-1.5 shrink-0 relative z-10',
                                  signal.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                                  signal.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                                  signal.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                                  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                )}
                              >
                                {signal.severity}
                              </Badge>
                              {/* Investigate button with gradient hover */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleInvestigate}
                                className="h-6 gap-1 text-[9px] text-zinc-400 hover:text-white shrink-0 relative z-10 hover:bg-gradient-to-r hover:from-[#F43F5E]/20 hover:to-[#DC2626]/20 hover:border hover:border-[#F43F5E]/30 transition-all"
                              >
                                Investigate
                                <ArrowRight className="size-2.5" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="max-w-xs bg-[#0d1224]/95 backdrop-blur-xl border border-white/[0.1] text-zinc-200 text-[11px] shadow-2xl"
                          >
                            <p className="font-semibold text-zinc-100 mb-1">{signal.type}</p>
                            <p className="text-zinc-400 leading-relaxed">{signal.description}</p>
                            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/[0.06]">
                              <span className="text-zinc-500">Detected: {formatSADate(signal.detectedAt)}</span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-500">{signal.status}</span>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      </motion.div>
                    </TooltipProvider>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Enhanced ECRS Trend + Briefing Generator + Risk Distribution ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ECRS Trend - Enhanced with Area Fill, Reference Zones, Pulsing Dots */}
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
                  <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="ecrsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT_FROM} stopOpacity={0.35} />
                        <stop offset="30%" stopColor={ACCENT_FROM} stopOpacity={0.2} />
                        <stop offset="70%" stopColor={ACCENT_TO} stopOpacity={0.08} />
                        <stop offset="100%" stopColor={ACCENT_TO} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ecrsLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={ACCENT_FROM} />
                        <stop offset="100%" stopColor={ACCENT_TO} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    {/* Reference zone bands */}
                    <ReferenceArea y1={0} y2={30} fill="rgba(16,185,129,0.05)" strokeOpacity={0} />
                    <ReferenceArea y1={30} y2={50} fill="rgba(245,158,11,0.05)" strokeOpacity={0} />
                    <ReferenceArea y1={50} y2={70} fill="rgba(249,115,22,0.05)" strokeOpacity={0} />
                    <ReferenceArea y1={70} y2={100} fill="rgba(239,68,68,0.05)" strokeOpacity={0} />
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
                    <Area type="monotone" dataKey="score" stroke="url(#ecrsLineGradient)" strokeWidth={2.5} fill="url(#ecrsAreaGradient)" dot={<PulsingDot />} activeDot={{ r: 7, fill: ACCENT_TO, stroke: '#fff', strokeWidth: 2 }} name="ECRS Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[1px] bg-white/[0.06] relative mt-4">
                <div className="absolute -top-2.5 left-0 right-0 flex justify-between text-[9px]">
                  <span className="text-emerald-400/60">Low Risk</span>
                  <span className="text-amber-400/60">Moderate</span>
                  <span className="text-yellow-400/60">Elevated</span>
                  <span className="text-orange-400/60">High</span>
                  <span className="text-red-400/60">Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Briefing Generator */}
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden"
                >
                  {/* Rich Preview Header */}
                  <div className="px-3 py-2 border-b border-emerald-500/15 bg-emerald-500/10 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-400">MEC Briefing Generated</span>
                  </div>
                  <div className="p-3 space-y-2.5">
                    {/* Key Risk Metrics */}
                    <div>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Key Risk Metrics</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-1.5">
                          <p className="text-[8px] text-zinc-500">ECRS Score</p>
                          <p className="text-xs font-bold" style={{ color: getRiskColor(selectedMuniData?.earlyAlertScore ?? 0) }}>{selectedMuniData?.earlyAlertScore}/100</p>
                        </div>
                        <div className="rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-1.5">
                          <p className="text-[8px] text-zinc-500">Cash Coverage</p>
                          <p className="text-xs font-bold text-zinc-200">{selectedMuniData?.cashCoverageDays}d</p>
                        </div>
                        <div className="rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-1.5">
                          <p className="text-[8px] text-zinc-500">Audit Outcome</p>
                          <p className="text-xs font-bold text-zinc-200">{selectedMuniData?.auditOutcome}</p>
                        </div>
                        <div className="rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-1.5">
                          <p className="text-[8px] text-zinc-500">§139 Status</p>
                          <p className="text-xs font-bold" style={{ color: selectedMuniData?.section139Status === 'Intervention' ? '#EF4444' : selectedMuniData?.section139Status === 'Warning' ? '#F59E0B' : '#10B981' }}>{selectedMuniData?.section139Status}</p>
                        </div>
                      </div>
                    </div>
                    {/* Top Signals */}
                    {topSignals.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Top Risk Signals</p>
                        <div className="space-y-1">
                          {topSignals.map((sig) => (
                            <div key={sig.id} className="flex items-center gap-1.5 text-[9px]">
                              <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: getSeverityColor(sig.severity) }} />
                              <span className="text-zinc-300 truncate">{sig.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Recommended Actions */}
                    <div>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Recommended Actions</p>
                      <div className="space-y-1">
                        {(selectedMuniData?.earlyAlertScore ?? 0) >= 70 ? (
                          <>
                            <div className="flex items-center gap-1.5 text-[9px]"><Zap className="size-3 text-red-400" /><span className="text-zinc-300">Initiate Section 139 intervention process</span></div>
                            <div className="flex items-center gap-1.5 text-[9px]"><Target className="size-3 text-orange-400" /><span className="text-zinc-300">Deploy financial recovery team</span></div>
                          </>
                        ) : (selectedMuniData?.earlyAlertScore ?? 0) >= 50 ? (
                          <>
                            <div className="flex items-center gap-1.5 text-[9px]"><Eye className="size-3 text-orange-400" /><span className="text-zinc-300">Enhanced monitoring and support</span></div>
                            <div className="flex items-center gap-1.5 text-[9px]"><Target className="size-3 text-amber-400" /><span className="text-zinc-300">Issue compliance directive</span></div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 text-[9px]"><Eye className="size-3 text-blue-400" /><span className="text-zinc-300">Continue quarterly monitoring</span></div>
                            <div className="flex items-center gap-1.5 text-[9px]"><CheckCircle2 className="size-3 text-emerald-400" /><span className="text-zinc-300">Support capacity building</span></div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                      <span className="text-[9px] text-zinc-500">3 pages · PDF format</span>
                      <Button variant="outline" size="sm" className="h-6 text-[9px] border-white/[0.08] hover:bg-[#F43F5E]/10 hover:border-[#F43F5E]/30 hover:text-[#F43F5E]">Download</Button>
                    </div>
                  </div>
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

      {/* ── Risk Forecast Section ── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="size-4" style={{ color: ACCENT_FROM }} />
              <CardTitle className="text-sm font-semibold text-zinc-200">Q4 2026 Risk Forecast</CardTitle>
              <Badge className="text-[9px] h-5 px-1.5" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}>
                ML Predicted
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Predicted ECRS direction for next quarter — ▲ Up = increasing risk, ▼ Down = decreasing risk, → Stable</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {RISK_FORECASTS.map((fc, i) => (
                <motion.div
                  key={fc.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/[0.12] transition-all"
                  style={{
                    borderLeftWidth: '3px',
                    borderLeftColor: fc.direction === 'up' ? '#EF4444' : fc.direction === 'down' ? '#10B981' : '#F59E0B',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="size-3 text-zinc-500" />
                    <span className="text-[10px] font-semibold text-zinc-200 truncate">{fc.municipality}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-[9px] text-zinc-500">Current</p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: getRiskColor(fc.currentECRS) }}>
                        {fc.currentECRS}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {fc.direction === 'up' ? (
                        <TrendingUp className="size-5 text-red-400" />
                      ) : fc.direction === 'down' ? (
                        <TrendingDown className="size-5 text-emerald-400" />
                      ) : (
                        <Minus className="size-5 text-amber-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500">Predicted</p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: getRiskColor(fc.predictedECRS) }}>
                        {fc.predictedECRS}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[8px] h-4 px-1.5 w-full justify-center',
                      fc.direction === 'up' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                      fc.direction === 'down' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                      'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    )}
                  >
                    {fc.direction === 'up' ? '▲ Risk Increasing' : fc.direction === 'down' ? '▼ Risk Decreasing' : '→ Stable'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Risk Distribution + Key Risk Indicators ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart - Enhanced with outer ring glow + hover scale on legend */}
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
                  {/* Outer ring glow */}
                  <div
                    className="absolute inset-[-4px] rounded-full opacity-30"
                    style={{
                      background: `conic-gradient(from 0deg, #EF4444 0deg 60deg, #F97316 60deg 150deg, #F59E0B 150deg 240deg, #3B82F6 240deg 330deg, #10B981 330deg 360deg)`,
                      filter: 'blur(6px)',
                    }}
                  />
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
                    <motion.div
                      key={item.name}
                      className="flex items-center gap-2.5 cursor-pointer"
                      onHoverStart={() => setHoveredLegend(item.name)}
                      onHoverEnd={() => setHoveredLegend(null)}
                      animate={{ scale: hoveredLegend === item.name ? 1.05 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="size-3 rounded-sm shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 4px ${item.color}40` }} />
                      <span className="text-xs text-zinc-300 flex-1">{item.name}</span>
                      <span className="text-xs font-bold text-zinc-200 tabular-nums">{item.value}</span>
                      <span className="text-[10px] text-zinc-400 tabular-nums w-8 text-right">{((item.value / 12) * 100).toFixed(0)}%</span>
                    </motion.div>
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

      {/* ── NEW: Municipal Risk Comparison Radar + Intervention Cost Estimator ── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Comparison Radar Chart */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4" style={{ color: ACCENT_FROM }} />
                <CardTitle className="text-sm font-semibold text-zinc-200">Municipal Risk Comparison Radar</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Compare up to 3 municipalities across 6 risk dimensions</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Municipality selector buttons */}
              <div className="flex flex-wrap gap-1.5">
                {MOCK_MUNICIPALITIES.map((muni) => {
                  const isSelected = radarSelected.includes(muni.code);
                  const colorIdx = radarSelected.indexOf(muni.code);
                  const btnColor = isSelected ? RADAR_COLORS[colorIdx] : undefined;
                  return (
                    <motion.button
                      key={muni.code}
                      onClick={() => toggleRadarMuni(muni.code)}
                      className={cn(
                        'px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
                        isSelected
                          ? 'text-white'
                          : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-300'
                      )}
                      style={isSelected ? {
                        background: `linear-gradient(135deg, ${btnColor}30, ${btnColor}15)`,
                        borderColor: `${btnColor}40`,
                        color: btnColor,
                        boxShadow: `0 0 8px ${btnColor}20`,
                      } : {}}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {muni.code}
                    </motion.button>
                  );
                })}
              </div>
              {/* Radar Chart */}
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#a1a1aa', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 8 }} axisLine={false} />
                    {radarSelected.map((code, idx) => (
                      <Radar
                        key={code}
                        name={MOCK_MUNICIPALITIES.find((m) => m.code === code)?.name ?? code}
                        dataKey={code}
                        stroke={RADAR_COLORS[idx]}
                        fill={RADAR_COLORS[idx]}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(13,18,36,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#e4e4e7',
                        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4">
                {radarSelected.map((code, idx) => {
                  const muni = MOCK_MUNICIPALITIES.find((m) => m.code === code);
                  return (
                    <div key={code} className="flex items-center gap-1.5">
                      <div className="size-3 rounded-sm" style={{ backgroundColor: RADAR_COLORS[idx], boxShadow: `0 0 6px ${RADAR_COLORS[idx]}40` }} />
                      <span className="text-[10px] text-zinc-300">{muni?.name ?? code}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intervention Cost Estimator */}
        <motion.div variants={itemFadeIn}>
          <Card className="glass-card-v2 card-hover-lift overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calculator className="size-4" style={{ color: ACCENT_FROM }} />
                <CardTitle className="text-sm font-semibold text-zinc-200">Intervention Cost Estimator</CardTitle>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Estimate Section 139 intervention costs and ROI</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Municipality selector */}
              <div>
                <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1 block">Select Municipality</label>
                <Select value={costMuni} onValueChange={setCostMuni}>
                  <SelectTrigger className="h-8 text-[11px] bg-white/[0.03] border-white/[0.08] text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1224] border-white/[0.1]">
                    {MOCK_MUNICIPALITIES.map((muni) => (
                      <SelectItem key={muni.code} value={muni.code} className="text-[11px] text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.05]">
                        {muni.name} ({muni.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2">
                {[
                  { label: 'Administrator Salary', icon: Users, data: costEstimate.administratorSalary, color: '#F43F5E' },
                  { label: 'Support Team', icon: Shield, data: costEstimate.supportTeam, color: '#F97316' },
                  { label: 'Technical Advisors', icon: Brain, data: costEstimate.technicalAdvisors, color: '#F59E0B' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 hover:border-white/[0.12] transition-all" style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="size-3.5" style={{ color: item.color }} />
                        <span className="text-[11px] text-zinc-300">{item.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-zinc-200 tabular-nums">
                        {formatZAR(item.data.min)} — {formatZAR(item.data.max)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3" style={{ boxShadow: `0 0 12px ${ACCENT_FROM}08` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Estimated Annual Cost</span>
                </div>
                <p className="text-lg font-bold tabular-nums" style={{ color: ACCENT_FROM }}>
                  {formatZAR(costEstimate.totalAnnual.min)} — {formatZAR(costEstimate.totalAnnual.max)}
                </p>
              </div>

              {/* ROI Indicator */}
              <div className="rounded-xl border border-white/[0.06] p-3 relative overflow-hidden" style={{ borderColor: costEstimate.roi > 0 ? '#10B98130' : '#EF444430' }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${costEstimate.roi > 0 ? '#10B981' : '#EF4444'}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <DollarSign className="size-4" style={{ color: costEstimate.roi > 0 ? '#10B981' : '#EF4444' }} />
                    <span className="text-[11px] font-semibold" style={{ color: costEstimate.roi > 0 ? '#10B981' : '#EF4444' }}>
                      ROI Indicator
                    </span>
                    <Badge
                      className="text-[8px] h-4 px-1.5"
                      style={{
                        background: costEstimate.roi > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: costEstimate.roi > 0 ? '#10B981' : '#EF4444',
                        borderColor: costEstimate.roi > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                      }}
                    >
                      {costEstimate.roi > 0 ? 'Positive' : 'Negative'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-zinc-500">Projected Annual Savings</p>
                      <p className="text-sm font-bold tabular-nums text-emerald-400">{formatZAR(costEstimate.projectedSavings)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500">ROI vs Max Cost</p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: costEstimate.roi > 0 ? '#10B981' : '#EF4444' }}>
                        {costEstimate.roi > 0 ? '+' : ''}{costEstimate.roi.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {/* ROI bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max(Math.abs(costEstimate.roi), 0), 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                      className="h-full rounded-full"
                      style={{ background: costEstimate.roi > 0 ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #EF4444, #F87171)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Municipality context */}
              {costMuniData && (
                <div className="text-[9px] text-zinc-500 flex items-center gap-2">
                  <Building2 className="size-3" />
                  <span>Based on {costMuniData.name} — OpBudget: {formatZAR(costMuniData.operatingBudget)}, FHS: {costMuniData.financialHealthScore}/100</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Intervention History — Enhanced ── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="glass-card-v2 card-hover-lift overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT_FROM}, ${ACCENT_TO})` }} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-200">Section 139 Intervention History</CardTitle>
              <Badge className="text-[9px] h-5 px-1.5" style={{ background: `${ACCENT_FROM}15`, color: ACCENT_FROM, borderColor: `${ACCENT_FROM}25` }}>
                {INTERVENTIONS.filter((int) => int.status === 'Active').length} Active
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Timeline of past and current interventions</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(180deg, ${ACCENT_FROM}, ${ACCENT_TO}, transparent)` }} />
              {INTERVENTIONS.map((int, i) => {
                const outcomeBadge = getOutcomeBadge(int.outcome);
                const durationMonths = calculateDuration(int.date);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="relative pl-8 pb-6 last:pb-0"
                  >
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
                      <div className="relative">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">{int.municipality}</p>
                            <p className="text-[11px] text-zinc-300 mt-0.5">{int.reason}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Outcome badge */}
                            {outcomeBadge && (
                              <Badge
                                variant="outline"
                                className="text-[8px] h-4 px-1.5"
                                style={{ color: outcomeBadge.color, background: outcomeBadge.bg, borderColor: outcomeBadge.border }}
                              >
                                {outcomeBadge.label}
                              </Badge>
                            )}
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
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-zinc-400">{int.type}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-400">{int.province}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-400">{formatSADate(int.date)}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-400">Duration: {durationMonths} months</span>
                        </div>
                        {/* View Details button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 mt-2 gap-1 text-[9px] text-zinc-500 hover:text-[#F43F5E] p-0"
                          onClick={() => setActiveModule('munilens')}
                        >
                          View Details
                          <ChevronRight className="size-2.5" />
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

