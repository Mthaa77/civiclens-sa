'use client';

import React from 'react';
import { Database, BarChart3, FileText, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceCitationProps {
  source: string;
  period: string;
  type: 'Census' | 'Survey' | 'Administrative' | 'Model';
  className?: string;
}

const typeConfig: Record<
  string,
  { color: string; bgColor: string; borderColor: string; icon: React.ElementType }
> = {
  Census: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: Database,
  },
  Survey: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: BarChart3,
  },
  Administrative: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: FileText,
  },
  Model: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: Brain,
  },
};

export default function SourceCitation({ source, period, type, className }: SourceCitationProps) {
  const config = typeConfig[type] || typeConfig.Administrative;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5',
        config.bgColor,
        config.borderColor,
        'backdrop-blur-sm',
        className
      )}
    >
      <Icon className={cn('size-3.5 shrink-0', config.color)} />
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={cn('text-[11px] font-semibold truncate', config.color)}>
          {type}
        </span>
        <span className="text-zinc-700 text-[10px]">·</span>
        <span className="text-[11px] text-zinc-400 truncate">{source}</span>
        <span className="text-zinc-700 text-[10px]">·</span>
        <span className="text-[11px] text-zinc-500 truncate">{period}</span>
      </div>
    </div>
  );
}
