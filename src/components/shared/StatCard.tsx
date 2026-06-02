'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  /** Prefix for the value (e.g., "R", "$") */
  prefix?: string;
  /** Suffix for the value (e.g., "%", "B") */
  suffix?: string;
  label: string;
  trend?: TrendDirection;
  trendValue?: string;
  sparklineData?: number[];
  accentColor?: string;
  onClick?: () => void;
  className?: string;
  /** Animation duration in ms for count-up */
  duration?: number;
}

// ── Count-up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return value;
}

// ── Sparkline SVG Component ──────────────────────────────────────────────────

function Sparkline({
  data,
  color,
  width = 80,
  height = 28,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = useMemo(() => {
    const stepX = width / (data.length - 1);
    return data.map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height, min, range]);

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`${color}10`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
}

// ── Shimmer Animation ────────────────────────────────────────────────────────

function ShimmerOverlay({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
      transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl"
    >
      <div
        className="h-full w-1/3 skew-x-[-20deg] opacity-[0.04]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </motion.div>
  );
}

// ── Trend Indicator ──────────────────────────────────────────────────────────

function TrendIndicator({
  trend,
  trendValue,
  accentColor,
}: {
  trend: TrendDirection;
  trendValue?: string;
  accentColor: string;
}) {
  if (trend === 'neutral' || !trendValue) return null;

  const isUp = trend === 'up';
  const isPositive = isUp;
  const color = isPositive ? '#10B981' : '#EF4444';

  return (
    <div
      className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      {isUp ? (
        <TrendingUp className="size-3" style={{ color }} />
      ) : (
        <TrendingDown className="size-3" style={{ color }} />
      )}
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
        {trendValue}
      </span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function StatCard({
  icon: Icon,
  value,
  prefix = '',
  suffix = '',
  label,
  trend = 'neutral',
  trendValue,
  sparklineData,
  accentColor = '#B45309',
  onClick,
  className,
  duration = 1200,
}: StatCardProps) {
  const animatedValue = useCountUp(value, duration);
  const isClickable = !!onClick;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={
        isClickable
          ? { y: -3, transition: { duration: 0.2 } }
          : undefined
      }
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border p-4',
        'bg-white/[0.02] backdrop-blur-sm',
        'transition-all duration-300',
        isClickable && 'cursor-pointer',
        className
      )}
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}35`;
        e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}15, 0 4px 12px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Shimmer animation on mount */}
      <ShimmerOverlay color={accentColor} />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ backgroundColor: accentColor }}
      />

      {/* Background glow */}
      <div
        className="absolute -top-8 -right-8 size-24 rounded-full opacity-[0.06] blur-2xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row: Icon + Trend */}
        <div className="flex items-center justify-between mb-2">
          {/* Icon with glow */}
          <div className="relative">
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${accentColor}12`,
                border: `1px solid ${accentColor}20`,
              }}
            >
              <Icon className="size-4" style={{ color: accentColor }} />
            </div>
            {/* Glow behind icon */}
            <div
              className="absolute inset-0 size-9 rounded-lg blur-md opacity-40 pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />
          </div>

          {/* Trend indicator */}
          <TrendIndicator trend={trend} trendValue={trendValue} accentColor={accentColor} />
        </div>

        {/* Value */}
        <div className="mt-1">
          <span
            className="text-2xl font-bold tracking-tight tabular-nums text-zinc-100"
            style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
          >
            {prefix}
            {animatedValue.toLocaleString('en-ZA')}
            {suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{label}</p>

        {/* Sparkline */}
        {sparklineData && sparklineData.length >= 2 && (
          <div className="mt-3 flex items-end justify-between">
            <Sparkline data={sparklineData} color={accentColor} width={80} height={28} />
            <span className="text-[9px] text-zinc-600 tabular-nums">
              {sparklineData.length} pts
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
