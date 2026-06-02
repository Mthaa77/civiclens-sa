'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ── Types ────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeColor = '#B45309',
  actions,
  accentColor = '#B45309',
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn('relative', className)}
    >
      {/* Main layout — stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon with colored background circle */}
          <div className="relative shrink-0">
            <div
              className="flex size-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${accentColor}15`,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <Icon className="size-5" style={{ color: accentColor }} />
            </div>
            {/* Background glow */}
            <div
              className="absolute inset-0 size-10 rounded-full blur-lg opacity-30"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          {/* Title + Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100"
                style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
              >
                {title}
              </h2>
              {badge && (
                <Badge
                  variant="outline"
                  className="text-[9px] h-5 px-1.5 font-bold shrink-0 border-current/20"
                  style={{ color: badgeColor, backgroundColor: `${badgeColor}12` }}
                >
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action buttons */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Animated accent line below */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
        className="mt-3 h-[2px] origin-left rounded-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40, transparent)`,
        }}
      />
    </motion.div>
  );
}
