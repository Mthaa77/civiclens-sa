'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart,
  FileText,
  FileSpreadsheet,
  Presentation,
  ShieldAlert,
  DollarSign,
  Building2,
  Settings2,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  Palette,
  Calendar,
  ListChecks,
  Eye,
  Mail,
  Send,
  Trash2,
  Sparkles,
  Plus,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSADate } from '@/lib/formatters';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

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

// ── Report Templates ────────────────────────────────────────────────────────

const REPORT_TEMPLATES = [
  { id: 'muni-profile', title: 'Municipality Profile', description: 'Comprehensive municipality overview with financial, service delivery, and demographic data', icon: Building2, formats: ['PDF', 'DOCX'], color: '#7B2D8E' },
  { id: 'tender-brief', title: 'Tender Brief', description: 'Procurement intelligence summary with supplier analysis and bid recommendations', icon: FileText, formats: ['PDF', 'DOCX', 'PPTX'], color: '#2D6A4F' },
  { id: 'policy-brief', title: 'Policy Brief', description: 'Evidence-based policy analysis with indicator trends and recommendations', icon: FileBarChart, formats: ['PDF', 'DOCX'], color: '#6D28D9' },
  { id: 'risk-assessment', title: 'Risk Assessment', description: 'Municipal and procurement risk analysis with anomaly detection results', icon: ShieldAlert, formats: ['PDF', 'DOCX', 'PPTX'], color: '#DC2626' },
  { id: 'financial-analysis', title: 'Financial Analysis', description: 'Detailed financial health breakdown with budget analysis and expenditure tracking', icon: DollarSign, formats: ['PDF', 'DOCX'], color: '#B45309' },
  { id: 'custom', title: 'Custom Report', description: 'Build a custom report with your own selection of modules and data sources', icon: Settings2, formats: ['PDF', 'DOCX', 'PPTX'], color: '#64748B' },
];

const FORMAT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  PDF: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  DOCX: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  PPTX: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};

// ── Recent Reports ──────────────────────────────────────────────────────────

const RECENT_REPORTS = [
  { id: 'r1', title: 'City of Cape Town — Q3 Financial Health Report', template: 'Financial Analysis', format: 'PDF', generatedAt: '2026-03-01T10:30:00Z', pages: 42, status: 'Complete' as const },
  { id: 'r2', title: 'eThekwini Municipality Profile — 2026 Update', template: 'Municipality Profile', format: 'DOCX', generatedAt: '2026-02-28T14:15:00Z', pages: 38, status: 'Complete' as const },
  { id: 'r3', title: 'National Risk Assessment — Q4 2025', template: 'Risk Assessment', format: 'PPTX', generatedAt: '2026-02-25T09:00:00Z', pages: 28, status: 'Processing' as const },
  { id: 'r4', title: 'Water & Sanitation Policy Brief — Eastern Cape', template: 'Policy Brief', format: 'PDF', generatedAt: '2026-02-22T16:45:00Z', pages: 16, status: 'Complete' as const },
  { id: 'r5', title: 'Gauteng Tender Intelligence — Jan 2026', template: 'Tender Brief', format: 'PDF', generatedAt: '2026-02-20T11:20:00Z', pages: 22, status: 'Failed' as const },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Complete: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Processing: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  Failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
};

// ── Sections for customisation ──────────────────────────────────────────────

const SECTIONS = [
  { id: 'exec-summary', label: 'Executive Summary' },
  { id: 'financial', label: 'Financial Health' },
  { id: 'service-delivery', label: 'Service Delivery' },
  { id: 'procurement', label: 'Procurement Analysis' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'risk', label: 'Risk Assessment' },
  { id: 'audit', label: 'Audit Outcomes' },
  { id: 'recommendations', label: 'Recommendations' },
];

// ── Scheduled Reports ───────────────────────────────────────────────────────

const SCHEDULED_REPORTS = [
  { id: 's1', name: 'Weekly Municipality Digest', template: 'Municipality Profile', frequency: 'Weekly', email: 'analyst@treasury.gov.za', nextRun: '2026-03-09T08:00:00Z', active: true },
  { id: 's2', name: 'Monthly Risk Summary', template: 'Risk Assessment', frequency: 'Monthly', email: 'risk.team@coGTA.gov.za', nextRun: '2026-04-01T08:00:00Z', active: true },
  { id: 's3', name: 'Quarterly Financial Overview', template: 'Financial Analysis', frequency: 'Quarterly', email: 'cfo@national.treasury.gov.za', nextRun: '2026-06-30T08:00:00Z', active: false },
];

const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly'] as const;

// ── Animated Count-Up Hook ──────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) {
        ref.current = setTimeout(step, 16);
      }
    };
    step();
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [target, duration]);

  return count;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ReportLens() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [selectedSections, setSelectedSections] = useState<string[]>(['exec-summary', 'financial', 'service-delivery', 'recommendations']);
  const [scheduleFrequency, setScheduleFrequency] = useState<string>('Weekly');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleName, setScheduleName] = useState('');

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    setGenerated(false);
    setGeneratingProgress(0);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGenerated(true);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const template = REPORT_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-violet-400 to-purple-400 shrink-0" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 relative">
            <FileText className="size-5 text-violet-400" />
            <motion.div
              className="absolute inset-0 rounded-xl bg-violet-400/10"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              ReportLens
            </h1>
            <p className="text-xs text-zinc-500">Professional report generator (PDF / DOCX / PPTX)</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/25 text-[10px] h-5 px-2">
              <Sparkles className="size-3 mr-1" /> Professional Reports
            </Badge>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] h-5 px-1.5">MVP</Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Report Templates ────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Report Templates</h2>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{REPORT_TEMPLATES.length} templates</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TEMPLATES.map((tmpl) => (
            <motion.div
              key={tmpl.id}
              variants={itemSlideUp}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={cn(
                  'border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden cursor-pointer group relative',
                  selectedTemplate === tmpl.id && 'border-violet-500/40 ring-1 ring-violet-500/20'
                )}
                onClick={() => handleSelectTemplate(tmpl.id)}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${tmpl.color}, ${tmpl.color}66, transparent)` }} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl shrink-0" style={{ background: `${tmpl.color}18`, border: `1px solid ${tmpl.color}30` }}>
                      <tmpl.icon className="size-6" style={{ color: tmpl.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-200 mb-1">{tmpl.title}</p>
                      <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">{tmpl.description}</p>
                      <div className="flex items-center gap-1.5 mb-3">
                        {tmpl.formats.map((f) => {
                          const style = FORMAT_STYLES[f];
                          return (
                            <span key={f} className={cn('inline-flex items-center gap-1 text-[9px] h-5 px-1.5 rounded border font-medium', style.bg, style.text, style.border)}>
                              {f}
                            </span>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        className={cn(
                          'h-7 text-[10px] px-3 w-full transition-all duration-300',
                          selectedTemplate === tmpl.id
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 hover:from-violet-600 hover:to-purple-600'
                            : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-zinc-300'
                        )}
                        onClick={(e) => { e.stopPropagation(); handleSelectTemplate(tmpl.id); }}
                      >
                        {selectedTemplate === tmpl.id ? '✓ Selected' : 'Select Template'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                {selectedTemplate === tmpl.id && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-violet-400/20 pointer-events-none"
                    layoutId="selectedTemplateGlow"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Report Builder ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/60 via-purple-500/40 to-transparent" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileBarChart className="size-4 text-violet-400" />
                  <CardTitle className="text-sm font-semibold text-zinc-200">Report Builder — {template?.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Configuration */}
                  <div className="lg:col-span-2 space-y-5">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="size-3 text-violet-400" /> Date Range
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-300 flex items-center flex-1 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 to-purple-400" />
                          <span className="ml-2">2024/04/01</span>
                        </div>
                        <span className="text-zinc-500 text-xs font-medium">→</span>
                        <div className="h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-300 flex items-center flex-1 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 to-purple-400" />
                          <span className="ml-2">2025/03/31</span>
                        </div>
                      </div>
                    </div>

                    {/* White-Label */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <Palette className="size-3 text-violet-400" /> White-Label Branding
                      </label>
                      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.03] relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-400 to-purple-400" />
                        <div className="size-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 ml-2 shrink-0" />
                        <span className="text-xs text-zinc-300 ml-2">CivicLens Default</span>
                        <Badge variant="outline" className="text-[8px] h-4 px-1 ml-auto border-violet-500/20 text-violet-400">Active</Badge>
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <ListChecks className="size-3 text-violet-400" /> Report Sections
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SECTIONS.map((section) => {
                          const isChecked = selectedSections.includes(section.id);
                          return (
                            <motion.label
                              key={section.id}
                              className={cn(
                                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all duration-200',
                                isChecked
                                  ? 'border-violet-500/30 bg-violet-500/10'
                                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                              )}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleSection(section.id)}
                                className={cn('border-white/[0.15]', isChecked && 'data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500')}
                              />
                              <span className={cn('text-[11px] transition-colors', isChecked ? 'text-zinc-200' : 'text-zinc-400')}>{section.label}</span>
                            </motion.label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Generate + Preview */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[11px] text-zinc-400 mb-1">Selected: <span className="text-zinc-200 font-medium">{selectedSections.length}</span> sections</p>
                      <p className="text-[11px] text-zinc-500">Output: {template?.formats.join(', ')}</p>
                    </div>

                    {/* Preview Mockup */}
                    <div className="w-full max-w-[180px] border border-white/[0.08] rounded-lg bg-white/[0.02] p-3">
                      <div className="space-y-1.5">
                        <div className="h-2 bg-violet-500/20 rounded w-3/4" />
                        <div className="h-1.5 bg-white/[0.06] rounded w-full" />
                        <div className="h-1.5 bg-white/[0.06] rounded w-5/6" />
                        <Separator className="bg-white/[0.06] my-1" />
                        {selectedSections.map((s) => (
                          <div key={s} className="flex items-center gap-1.5">
                            <div className="size-1 rounded-full bg-violet-400/60" />
                            <div className="h-1 bg-white/[0.08] rounded flex-1" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[8px] text-zinc-600 text-center mt-2">Report Preview</p>
                    </div>

                    {generated ? (
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle2 className="size-10 text-emerald-400" />
                        <p className="text-xs text-emerald-400 font-medium">Report Generated!</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-[11px] h-7 border-white/[0.08] hover:border-white/[0.15]">
                            <Download className="size-3 mr-1" /> Download
                          </Button>
                          <Button variant="outline" size="sm" className="text-[11px] h-7 border-white/[0.08] hover:border-white/[0.15]">
                            <Eye className="size-3 mr-1" /> View
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full">
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 hover:from-violet-600 hover:to-purple-600 h-10 px-6 font-medium shadow-lg shadow-violet-500/20"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileBarChart className="size-4 mr-2" />
                              Generate Report
                            </>
                          )}
                        </Button>
                        {isGenerating && (
                          <motion.div
                            className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-400"
                              style={{ width: `${Math.min(generatingProgress, 100)}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent Reports ───────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/40 via-purple-500/20 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-violet-400" />
                <CardTitle className="text-sm font-semibold text-zinc-200">Recent Reports</CardTitle>
              </div>
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/[0.08] text-zinc-500">{RECENT_REPORTS.length} reports</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent bg-gradient-to-r from-violet-500/[0.06] via-transparent to-transparent">
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Report</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Template</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Format</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Pages</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Generated</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_REPORTS.map((report, idx) => {
                    const statusStyle = STATUS_STYLES[report.status];
                    const formatStyle = FORMAT_STYLES[report.format];
                    return (
                      <TableRow key={report.id} className={cn('border-white/[0.04] hover:bg-white/[0.04] transition-colors', idx % 2 === 1 && 'bg-white/[0.01]')}>
                        <TableCell className="text-xs font-medium text-zinc-300 max-w-[220px] truncate">{report.title}</TableCell>
                        <TableCell className="text-xs text-zinc-400">{report.template}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-center text-[9px] h-5 px-1.5 rounded border font-medium', formatStyle.bg, formatStyle.text, formatStyle.border)}>
                            {report.format}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{report.pages}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-center gap-1 text-[9px] h-5 px-1.5 rounded border font-medium', statusStyle.bg, statusStyle.text, statusStyle.border)}>
                            <span className={cn('size-1.5 rounded-full', statusStyle.dot, report.status === 'Processing' && 'animate-pulse')} />
                            {report.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">{formatSADate(report.generatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300 px-1.5">
                              <Eye className="size-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300 px-1.5">
                              <Download className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Report Scheduling (NEW) ──────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/40 via-purple-500/20 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-violet-400" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Schedule Reports</CardTitle>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Automate report delivery with scheduled generation</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule Config */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-400">Schedule Name</label>
                  <Input
                    placeholder="e.g., Monthly Financial Digest"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300 placeholder:text-zinc-600 focus:border-violet-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-400">Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <motion.button
                        key={freq}
                        className={cn(
                          'text-[10px] font-medium py-2 px-3 rounded-lg border transition-all duration-200',
                          scheduleFrequency === freq
                            ? 'border-violet-500/40 bg-violet-500/15 text-violet-400'
                            : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-400'
                        )}
                        onClick={() => setScheduleFrequency(freq)}
                        whileTap={{ scale: 0.97 }}
                      >
                        {freq}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                    <Mail className="size-3" /> Email Delivery
                  </label>
                  <Input
                    placeholder="recipient@organisation.gov.za"
                    value={scheduleEmail}
                    onChange={(e) => setScheduleEmail(e.target.value)}
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300 placeholder:text-zinc-600 focus:border-violet-500/30"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 hover:from-violet-600 hover:to-purple-600 h-9 text-xs shadow-lg shadow-violet-500/15">
                  <Plus className="size-3.5 mr-1.5" /> Create Schedule
                </Button>
              </div>

              {/* Active Schedules */}
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-zinc-400">Active Schedules</label>
                <ScrollArea className="max-h-[280px]">
                  <div className="space-y-2">
                    {SCHEDULED_REPORTS.map((schedule) => (
                      <motion.div
                        key={schedule.id}
                        className={cn(
                          'rounded-lg border p-3 transition-all duration-200',
                          schedule.active
                            ? 'border-violet-500/20 bg-white/[0.03]'
                            : 'border-white/[0.06] bg-white/[0.02] opacity-60'
                        )}
                        whileHover={{ scale: 1.01, y: -1 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{schedule.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{schedule.template}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={cn(
                              'size-2 rounded-full',
                              schedule.active ? 'bg-emerald-400' : 'bg-zinc-600'
                            )} />
                            <span className={cn('text-[9px] font-medium', schedule.active ? 'text-emerald-400' : 'text-zinc-600')}>
                              {schedule.active ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Clock className="size-2.5" /> {schedule.frequency}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Mail className="size-2.5" /> {schedule.email.split('@')[0]}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500">Next: {formatSADate(schedule.nextRun)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] text-zinc-500 hover:text-zinc-300 px-1.5">
                            <Send className="size-2.5 mr-1" /> Run Now
                          </Button>
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] text-zinc-500 hover:text-zinc-300 px-1.5">
                            <Trash2 className="size-2.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <motion.div variants={itemFadeIn} initial="hidden" animate="show" className="pt-2">
        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600">
          <FileText className="size-3" />
          <span>ReportLens — Powered by CivicLens SA Intelligence Platform</span>
        </div>
      </motion.div>
    </div>
  );
}
