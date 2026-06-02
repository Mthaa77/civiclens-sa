'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileDown,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { ExportFormat, ExportScope, ExportColumn } from '@/types';

// ── Format Config ───────────────────────────────────────────────────────────

const FORMAT_CONFIG: Record<ExportFormat, {
  icon: typeof FileText;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  available: boolean;
}> = {
  csv: {
    icon: FileSpreadsheet,
    label: 'CSV',
    description: 'Comma-separated values. Opens in Excel, Google Sheets, etc.',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    available: true,
  },
  json: {
    icon: FileJson,
    label: 'JSON',
    description: 'Structured data format. Ideal for API integration & developers.',
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    available: true,
  },
  pdf: {
    icon: FileDown,
    label: 'PDF',
    description: 'Professional report format with charts and branding.',
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
    available: false,
  },
  xlsx: {
    icon: FileSpreadsheet,
    label: 'Excel',
    description: 'Native spreadsheet with formatting, charts, and multiple sheets.',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    available: false,
  },
};

const SCOPE_OPTIONS: Array<{ value: ExportScope; label: string; description: string }> = [
  { value: 'current', label: 'Current View', description: 'Only the data currently visible' },
  { value: 'all', label: 'All Data', description: 'Complete dataset including hidden rows' },
  { value: 'filtered', label: 'Filtered Data', description: 'All data matching current filters' },
];

// ── Export Utilities ─────────────────────────────────────────────────────────

function generateCSV(data: Record<string, unknown>[], columns: ExportColumn[]): string {
  const selectedCols = columns.filter((c) => c.selected);
  const header = selectedCols.map((c) => `"${c.label}"`).join(',');
  const rows = data.map((row) =>
    selectedCols
      .map((col) => {
        const val = row[col.key];
        const str = val === null || val === undefined ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

function generateJSON(data: Record<string, unknown>[], columns: ExportColumn[]): string {
  const selectedCols = columns.filter((c) => c.selected);
  const selectedKeys = selectedCols.map((c) => c.key);
  const filtered = data.map((row) => {
    const obj: Record<string, unknown> = {};
    selectedKeys.forEach((key) => {
      obj[key] = row[key] ?? null;
    });
    return obj;
  });
  return JSON.stringify(filtered, null, 2);
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Animation Variants ──────────────────────────────────────────────────────

const fadeSlideIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

// ── Component Props ─────────────────────────────────────────────────────────

interface DataExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filenamePrefix?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DataExport({
  open,
  onOpenChange,
  data,
  columns: initialColumns,
  filenamePrefix = 'civiclens-export',
}: DataExportProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>('current');
  const [columns, setColumns] = useState<ExportColumn[]>(initialColumns);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset columns when props change
  const currentColumns = useMemo(() => {
    if (initialColumns.length !== columns.length) {
      return initialColumns;
    }
    return columns;
  }, [initialColumns, columns.length]);

  const selectedColumnCount = currentColumns.filter((c) => c.selected).length;

  const toggleColumn = useCallback((key: string) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.key === key ? { ...c, selected: !c.selected } : c
      )
    );
  }, []);

  const selectAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((c) => ({ ...c, selected: true })));
  }, []);

  const deselectAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((c) => ({ ...c, selected: false })));
  }, []);

  const handleExport = useCallback(async () => {
    const formatConfig = FORMAT_CONFIG[format];
    if (!formatConfig.available) return;

    if (selectedColumnCount === 0) {
      toast.error('No columns selected', {
        description: 'Please select at least one column to export.',
      });
      return;
    }

    setIsExporting(true);
    setExportComplete(false);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 25;
      });
    }, 200);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    clearInterval(progressInterval);
    setProgress(100);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${timestamp}`;

    try {
      if (format === 'csv') {
        const csvContent = generateCSV(data, currentColumns);
        triggerDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
      } else if (format === 'json') {
        const jsonContent = generateJSON(data, currentColumns);
        triggerDownload(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
      }

      setExportComplete(true);
      toast.success('Export complete!', {
        description: `${filename}.${format} downloaded successfully`,
      });
    } catch {
      toast.error('Export failed', {
        description: 'An error occurred during export. Please try again.',
      });
    }

    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(false);
      setProgress(0);
    }, 2000);
  }, [format, data, currentColumns, filenamePrefix, selectedColumnCount]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:max-w-[420px] bg-[#0a0e1a]/95 backdrop-blur-xl border-white/[0.08] p-0 flex flex-col"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <SheetHeader className="p-4 pb-3 space-y-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#B45309]/10 border border-[#B45309]/20">
              <Download className="size-3.5 text-[#B45309]" />
            </div>
            <div>
              <SheetTitle className="text-zinc-100 text-base font-semibold">
                Export Data
              </SheetTitle>
              <SheetDescription className="text-[11px] text-zinc-600">
                Configure and download your data export
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* ── Format Selection ──────────────────────────────── */}
            <motion.div variants={fadeSlideIn} initial="hidden" animate="show">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 block">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FORMAT_CONFIG) as [ExportFormat, typeof FORMAT_CONFIG[ExportFormat]][]).map(
                  ([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = format === key;
                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormat(key)}
                        className={cn(
                          'relative rounded-lg border p-3 text-left transition-all duration-200',
                          'hover:border-white/[0.15]',
                          isSelected
                            ? `${config.bgColor} border-[${config.color}]/40`
                            : 'border-white/[0.06] bg-white/[0.01]'
                        )}
                        style={{
                          borderColor: isSelected ? `${config.color}40` : undefined,
                          background: isSelected ? `${config.color}08` : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={cn('size-4', config.textColor)} />
                          <span className={cn('text-xs font-semibold', isSelected ? 'text-zinc-200' : 'text-zinc-400')}>
                            {config.label}
                          </span>
                          {!config.available && (
                            <Lock className="size-3 text-zinc-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-600 leading-relaxed">
                          {config.description}
                        </p>
                        {isSelected && (
                          <div
                            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
                            style={{ backgroundColor: config.color }}
                          />
                        )}
                        {!config.available && (
                          <Badge className="absolute -top-1.5 -right-1.5 bg-zinc-800 text-zinc-400 border-zinc-700 text-[8px] h-4 px-1">
                            Soon
                          </Badge>
                        )}
                      </motion.button>
                    );
                  }
                )}
              </div>
              {/* Coming soon notice for PDF/Excel */}
              {!FORMAT_CONFIG[format].available && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-amber-400" />
                    <p className="text-[11px] text-amber-300 font-medium">
                      {format.toUpperCase()} export coming soon
                    </p>
                  </div>
                  <p className="text-[10px] text-amber-500/70 mt-1">
                    This format is currently in development. Try CSV or JSON for real functional exports.
                  </p>
                </motion.div>
              )}
            </motion.div>

            <Separator className="bg-white/[0.06]" />

            {/* ── Data Scope ────────────────────────────────────── */}
            <motion.div variants={fadeSlideIn} initial="hidden" animate="show">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 block">
                Data Scope
              </label>
              <div className="space-y-2">
                {SCOPE_OPTIONS.map((option) => {
                  const isSelected = scope === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setScope(option.value)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-all duration-200',
                        'hover:border-white/[0.12]',
                        isSelected
                          ? 'border-[#B45309]/30 bg-[#B45309]/[0.05]'
                          : 'border-white/[0.06] bg-white/[0.01]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'size-3.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                            isSelected
                              ? 'border-[#B45309] bg-[#B45309]'
                              : 'border-zinc-600'
                          )}
                        >
                          {isSelected && (
                            <div className="size-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isSelected ? 'text-zinc-200' : 'text-zinc-400'
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1 ml-5.5 pl-0.5">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <Separator className="bg-white/[0.06]" />

            {/* ── Column Selection ──────────────────────────────── */}
            <motion.div variants={fadeSlideIn} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Columns ({selectedColumnCount}/{currentColumns.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllColumns}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-zinc-700 text-[10px]">|</span>
                  <button
                    onClick={deselectAllColumns}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar"
              >
                {currentColumns.map((col) => (
                  <motion.div
                    key={col.key}
                    variants={fadeSlideIn}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5',
                      'hover:bg-white/[0.03] transition-colors duration-150',
                      col.selected && 'bg-white/[0.02]'
                    )}
                  >
                    <Checkbox
                      checked={col.selected}
                      onCheckedChange={() => toggleColumn(col.key)}
                      className="size-3.5"
                    />
                    <span
                      className={cn(
                        'text-xs',
                        col.selected ? 'text-zinc-300' : 'text-zinc-600'
                      )}
                    >
                      {col.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <Separator className="bg-white/[0.06]" />

            {/* ── Export Preview / Progress ─────────────────────── */}
            <motion.div variants={fadeSlideIn} initial="hidden" animate="show">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                    Export Summary
                  </span>
                  <Badge
                    variant="outline"
                    className="border-white/[0.08] text-zinc-500 text-[9px] h-4 px-1.5"
                  >
                    {data.length} rows
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-zinc-600">Format</span>
                    <p className="text-zinc-300 font-medium">
                      {FORMAT_CONFIG[format].label}
                      {!FORMAT_CONFIG[format].available && ' (Coming Soon)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-600">Scope</span>
                    <p className="text-zinc-300 font-medium capitalize">{scope}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600">Columns</span>
                    <p className="text-zinc-300 font-medium">{selectedColumnCount} selected</p>
                  </div>
                  <div>
                    <span className="text-zinc-600">Rows</span>
                    <p className="text-zinc-300 font-medium">{data.length}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <AnimatePresence>
                  {isExporting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          {exportComplete ? (
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                          ) : (
                            <Loader2 className="size-3.5 text-zinc-400 animate-spin" />
                          )}
                          <span className="text-[11px] text-zinc-400">
                            {exportComplete ? 'Download complete!' : 'Generating export...'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className={cn(
                              'h-full rounded-full',
                              exportComplete ? 'bg-emerald-400' : 'bg-[#B45309]'
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </ScrollArea>

        {/* ── Footer with Export Button ─────────────────────────── */}
        <div className="border-t border-white/[0.06] p-4">
          <Button
            onClick={handleExport}
            disabled={isExporting || !FORMAT_CONFIG[format].available || selectedColumnCount === 0}
            className={cn(
              'w-full h-10 gap-2 font-semibold text-sm transition-all duration-200',
              FORMAT_CONFIG[format].available && selectedColumnCount > 0
                ? 'bg-[#B45309] hover:bg-[#B45309]/90 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {exportComplete ? 'Complete!' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="size-4" />
                Export as {FORMAT_CONFIG[format].label}
                <ArrowRight className="size-3.5 ml-1" />
              </>
            )}
          </Button>
          <p className="text-[9px] text-zinc-600 text-center mt-2">
            Data exported in accordance with POPIA regulations
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
