'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

// ── Types ────────────────────────────────────────────────────────────────────

interface PremiumTooltipProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  learnMoreUrl?: string;
  learnMoreLabel?: string;
  accentColor?: string;
  delayDuration?: number;
  trigger?: 'hover' | 'click';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PremiumTooltip({
  children,
  icon: Icon,
  iconColor = '#B45309',
  title,
  description,
  learnMoreUrl,
  learnMoreLabel = 'Learn more',
  accentColor = '#B45309',
  delayDuration = 300,
  trigger = 'hover',
  side = 'top',
  align = 'center',
  className,
}: PremiumTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tooltipContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative rounded-xl border p-3 min-w-[180px] max-w-[280px]',
        'bg-[#0d1224]/96 backdrop-blur-xl',
        'shadow-2xl shadow-black/40'
      )}
      style={{ borderColor: `${accentColor}25` }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-2 right-2 h-[2px] rounded-t-xl opacity-60"
        style={{ backgroundColor: accentColor }}
      />

      {/* Custom arrow indicator */}
      <div
        className="absolute w-2.5 h-2.5 rotate-45 border-r border-b rounded-[2px]"
        style={{
          backgroundColor: '#0d1224',
          borderColor: `${accentColor}25`,
          ...(side === 'top' && { bottom: '-7px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
          ...(side === 'bottom' && { top: '-7px', left: '50%', transform: 'translateX(-50%) rotate(-135deg)' }),
          ...(side === 'left' && { right: '-7px', top: '50%', transform: 'translateY(-50%) rotate(-45deg)' }),
          ...(side === 'right' && { left: '-7px', top: '50%', transform: 'translateY(-50%) rotate(135deg)' }),
        }}
      />

      <div className="flex items-start gap-2.5">
        {/* Icon with accent glow */}
        {Icon && (
          <div className="relative shrink-0 mt-0.5">
            <div
              className="flex size-7 items-center justify-center rounded-md"
              style={{
                backgroundColor: `${accentColor}12`,
                border: `1px solid ${accentColor}20`,
              }}
            >
              <Icon className="size-3.5" style={{ color: iconColor }} />
            </div>
            <div
              className="absolute inset-0 size-7 rounded-md blur-md opacity-30"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h5 className="text-[12px] font-semibold text-zinc-100 leading-snug">{title}</h5>
          {description && (
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{description}</p>
          )}

          {/* Learn more link */}
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: accentColor }}
            >
              {learnMoreLabel}
              <ExternalLink className="size-2.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (trigger === 'click') {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <span
              className="inline-flex cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              {children}
            </span>
          </TooltipTrigger>
          <AnimatePresence>
            {isOpen && (
              <TooltipContent
                side={side}
                align={align}
                sideOffset={10}
                className={cn(
                  'border-0 bg-transparent p-0 shadow-none',
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  className
                )}
              >
                {tooltipContent}
              </TooltipContent>
            )}
          </AnimatePresence>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={10}
          className={cn(
            'border-0 bg-transparent p-0 shadow-none',
            className
          )}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
