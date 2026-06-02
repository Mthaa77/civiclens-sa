'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCaveatProps {
  source: string;
  period: string;
  type: 'Census' | 'Survey' | 'Administrative' | 'Model';
  className?: string;
}

const typeConfig: Record<string, { color: string; border: string }> = {
  Census: { color: 'text-blue-400', border: 'border-blue-500/20' },
  Survey: { color: 'text-amber-400', border: 'border-amber-500/20' },
  Administrative: { color: 'text-emerald-400', border: 'border-emerald-500/20' },
  Model: { color: 'text-purple-400', border: 'border-purple-500/20' },
};

export default function DataCaveat({ source, period, type, className }: DataCaveatProps) {
  const config = typeConfig[type] || typeConfig.Administrative;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/[0.06] p-3',
        'bg-gradient-to-r from-amber-500/[0.04] via-teal-500/[0.03] to-amber-500/[0.04]',
        'backdrop-blur-md',
        config.border,
        className
      )}
    >
      {/* Subtle glass shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

      <div className="relative flex items-start gap-2.5">
        <div className="flex size-6 items-center justify-center rounded-md bg-white/[0.05] border border-white/[0.08] shrink-0 mt-0.5">
          <ShieldCheck className="size-3.5 text-teal-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-300">Source:</span>
            <span className="text-[11px] text-zinc-400">{source}</span>
            <span className="text-zinc-700 text-[10px]">|</span>
            <span className="text-[11px] font-medium text-zinc-300">Period:</span>
            <span className="text-[11px] text-zinc-400">{period}</span>
            <span className="text-zinc-700 text-[10px]">|</span>
            <span className="text-[11px] font-medium text-zinc-300">Type:</span>
            <span className={cn('text-[11px] font-medium', config.color)}>{type}</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
            <Info className="size-2.5 shrink-0" />
            Subject to POPIA compliance. Data sourced from official South African government repositories.
          </p>
        </div>
      </div>
    </div>
  );
}
