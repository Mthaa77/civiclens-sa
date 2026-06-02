'use client';

import React, { useState } from 'react';
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

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  PDF: <FileText className="size-3" />,
  DOCX: <FileSpreadsheet className="size-3" />,
  PPTX: <Presentation className="size-3" />,
};

// ── Recent Reports ──────────────────────────────────────────────────────────

const RECENT_REPORTS = [
  { id: 'r1', title: 'City of Cape Town — Q3 Financial Health Report', template: 'Financial Analysis', format: 'PDF', generatedAt: '2026-03-01T10:30:00Z', pages: 42, status: 'Complete' },
  { id: 'r2', title: 'eThekwini Municipality Profile — 2026 Update', template: 'Municipality Profile', format: 'DOCX', generatedAt: '2026-02-28T14:15:00Z', pages: 38, status: 'Complete' },
  { id: 'r3', title: 'National Risk Assessment — Q4 2025', template: 'Risk Assessment', format: 'PPTX', generatedAt: '2026-02-25T09:00:00Z', pages: 28, status: 'Complete' },
  { id: 'r4', title: 'Water & Sanitation Policy Brief — Eastern Cape', template: 'Policy Brief', format: 'PDF', generatedAt: '2026-02-22T16:45:00Z', pages: 16, status: 'Complete' },
  { id: 'r5', title: 'Gauteng Tender Intelligence — Jan 2026', template: 'Tender Brief', format: 'PDF', generatedAt: '2026-02-20T11:20:00Z', pages: 22, status: 'Complete' },
];

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

// ── Main Component ──────────────────────────────────────────────────────────

export default function ReportLens() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(['exec-summary', 'financial', 'service-delivery', 'recommendations']);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    setGenerated(false);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const template = REPORT_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={itemSlideUp} initial="hidden" animate="show">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#4338CA]/10 border border-[#4338CA]/20">
            <FileBarChart className="size-5 text-[#4338CA]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">ReportLens</h1>
            <p className="text-xs text-zinc-500">Professional report generator (PDF / DOCX / PPTX)</p>
          </div>
        </div>
      </motion.div>

      {/* ── Report Templates ────────────────────────────────── */}
      <motion.div variants={containerStagger} initial="hidden" animate="show">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-[#4338CA]" />
          <h2 className="text-sm font-semibold text-zinc-200">Report Templates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TEMPLATES.map((tmpl) => (
            <motion.div
              key={tmpl.id}
              variants={itemSlideUp}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={cn(
                  'border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 overflow-hidden cursor-pointer',
                  selectedTemplate === tmpl.id && 'border-[#4338CA]/40 ring-1 ring-[#4338CA]/20'
                )}
                onClick={() => handleSelectTemplate(tmpl.id)}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${tmpl.color}, transparent)` }} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg shrink-0" style={{ background: `${tmpl.color}15`, border: `1px solid ${tmpl.color}25` }}>
                      <tmpl.icon className="size-5" style={{ color: tmpl.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-200">{tmpl.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{tmpl.description}</p>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {tmpl.formats.map((f) => (
                          <Badge key={f} variant="outline" className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400 flex items-center gap-1">
                            {FORMAT_ICONS[f]}
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
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
            <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-200">Report Builder — {template?.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Configuration */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="size-3" /> Date Range
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 px-3 rounded-md border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 flex items-center">2024/04/01</div>
                          <span className="text-zinc-600 text-xs">to</span>
                          <div className="h-8 px-3 rounded-md border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 flex items-center">2025/03/31</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                          <Palette className="size-3" /> White-Label
                        </label>
                        <div className="flex items-center gap-2 h-8 px-3 rounded-md border border-white/[0.08] bg-white/[0.03]">
                          <div className="size-3 rounded-full bg-[#4338CA]" />
                          <span className="text-xs text-zinc-400">CivicLens Default</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <ListChecks className="size-3" /> Sections
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SECTIONS.map((section) => (
                          <label key={section.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedSections.includes(section.id)}
                              onCheckedChange={() => toggleSection(section.id)}
                              className="border-white/[0.15]"
                            />
                            <span className="text-[11px] text-zinc-400">{section.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Generate */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-[11px] text-zinc-500 mb-1">Selected: {selectedSections.length} sections</p>
                      <p className="text-[11px] text-zinc-600">Output: {template?.formats.join(', ')}</p>
                    </div>
                    {generated ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="size-10 text-emerald-400" />
                        <p className="text-xs text-emerald-400 font-medium">Report Generated!</p>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 border-white/[0.08]">
                          <Download className="size-3 mr-1" /> Download
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-[#4338CA]/20 text-[#4338CA] border-[#4338CA]/30 hover:bg-[#4338CA]/30 h-10 px-6"
                        variant="outline"
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
        <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-200">Recent Reports</CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">Recently generated reports</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Report</TableHead>
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Template</TableHead>
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Format</TableHead>
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Pages</TableHead>
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Generated</TableHead>
                  <TableHead className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_REPORTS.map((report) => (
                  <TableRow key={report.id} className="border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <TableCell className="text-xs font-medium text-zinc-300 max-w-[250px] truncate">{report.title}</TableCell>
                    <TableCell className="text-xs text-zinc-400">{report.template}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400">
                        {report.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-zinc-400 tabular-nums">{report.pages}</TableCell>
                    <TableCell className="text-xs text-zinc-500">{formatSADate(report.generatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300">
                        <Download className="size-3 mr-1" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
