'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CivicLens SA — Premium Typography Utility Components
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Gradient Presets ────────────────────────────────────────────────────────

const GRADIENT_PRESETS: Record<string, { from: string; to: string; via?: string }> = {
  'sa-flag': { from: '#0077B6', via: '#B45309', to: '#2D6A4F' },
  gold: { from: '#B45309', to: '#D97706' },
  teal: { from: '#0F766E', to: '#10B981' },
  danger: { from: '#DC2626', to: '#F97316' },
};

// ─── Easing Functions ────────────────────────────────────────────────────────

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ─── 1. AnimatedCounter ─────────────────────────────────────────────────────

interface AnimatedCounterProps {
  /** Target value to count up to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** String to prepend (e.g. "R", "$") */
  prefix?: string;
  /** String to append (e.g. "%", "B") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Custom font size class */
  fontSize?: string;
  /** Custom text color class */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use thousands separator */
  useGrouping?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  fontSize = 'text-2xl',
  color = 'text-foreground',
  className,
  useGrouping = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentValue =
        startValueRef.current +
        (value - startValueRef.current) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping,
  });

  return (
    <span
      className={cn(
        'font-data tabular-nums',
        fontSize,
        color,
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// ─── 2. GradientText ────────────────────────────────────────────────────────

interface GradientTextProps {
  children: React.ReactNode;
  /** Predefined gradient preset name */
  preset?: keyof typeof GRADIENT_PRESETS;
  /** Custom from color (overrides preset) */
  from?: string;
  /** Custom to color (overrides preset) */
  to?: string;
  /** Custom via color (overrides preset) */
  via?: string;
  /** Whether the gradient should animate (slow shift) */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function GradientText({
  children,
  preset,
  from,
  to,
  via,
  animated = false,
  className,
}: GradientTextProps) {
  const presetValues = preset ? GRADIENT_PRESETS[preset] : null;
  const fromColor = from ?? presetValues?.from ?? '#0077B6';
  const toColor = to ?? presetValues?.to ?? '#D97706';
  const viaColor = via ?? presetValues?.via;

  const gradientStops = viaColor
    ? `${fromColor}, ${viaColor}, ${toColor}`
    : `${fromColor}, ${toColor}`;

  const gradientDirection = animated ? '90deg' : '135deg';

  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent',
        animated && 'text-gradient-animated',
        className
      )}
      style={{
        backgroundImage: !animated
          ? `linear-gradient(${gradientDirection}, ${gradientStops})`
          : undefined,
        ...(animated
          ? {
              backgroundImage: `linear-gradient(${gradientDirection}, ${gradientStops})`,
            }
          : {}),
      }}
    >
      {children}
    </span>
  );
}

// ─── 3. TypeScale — Heading Components ───────────────────────────────────────

interface TypeHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const headingStyles: Record<string, string> = {
  h1: 'text-heading-1',
  h2: 'text-heading-2',
  h3: 'text-heading-3',
  h4: 'text-heading-4',
  h5: 'text-heading-5',
  h6: 'text-heading-6',
};

function createTypeHeading(
  defaultTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
) {
  const Component = ({
    children,
    className,
    as = defaultTag,
  }: TypeHeadingProps) => {
    const Tag = as;
    return (
      <Tag
        className={cn(
          'heading-base',
          headingStyles[defaultTag],
          'text-foreground',
          className
        )}
      >
        {children}
      </Tag>
    );
  };
  Component.displayName = `Type${defaultTag.toUpperCase()}`;
  return Component;
}

export const TypeH1 = createTypeHeading('h1');
export const TypeH2 = createTypeHeading('h2');
export const TypeH3 = createTypeHeading('h3');
export const TypeH4 = createTypeHeading('h4');
export const TypeH5 = createTypeHeading('h5');
export const TypeH6 = createTypeHeading('h6');

// ─── 4. TextShimmer ─────────────────────────────────────────────────────────

interface TextShimmerProps {
  children: React.ReactNode;
  /** Animation speed in seconds */
  speed?: number;
  /** Custom shimmer highlight color (default: white) */
  highlightColor?: string;
  /** Additional CSS classes */
  className?: string;
}

export function TextShimmer({
  children,
  speed = 3,
  highlightColor,
  className,
}: TextShimmerProps) {
  const customStyle = highlightColor
    ? {
        backgroundImage: `linear-gradient(90deg, currentColor 0%, currentColor 40%, ${highlightColor} 50%, currentColor 60%, currentColor 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animationDuration: `${speed}s`,
      }
    : undefined;

  return (
    <span
      className={cn('text-shimmer', className)}
      style={customStyle ? { ...customStyle, animationDuration: `${speed}s` } : { animationDuration: `${speed}s` }}
    >
      {children}
    </span>
  );
}

// ─── 5. MetricValue ─────────────────────────────────────────────────────────

type TrendDirection = 'up' | 'down' | 'neutral';

interface MetricValueProps {
  /** The numeric value to display */
  value: number;
  /** String to prepend (e.g. "R", "$") */
  prefix?: string;
  /** String to append (e.g. "%", "B", "M") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Trend direction for the indicator */
  trend?: TrendDirection;
  /** Trend value text (e.g. "+12.4%") */
  trendValue?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Label text below the value */
  label?: string;
  /** Predefined gradient preset for the value */
  gradientPreset?: keyof typeof GRADIENT_PRESETS;
  /** Custom font size class */
  fontSize?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use thousands separator */
  useGrouping?: boolean;
}

export function MetricValue({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  trendValue,
  duration = 1200,
  label,
  gradientPreset,
  fontSize = 'text-3xl',
  className,
  useGrouping = true,
}: MetricValueProps) {
  const trendConfig: Record<
    TrendDirection,
    { icon: React.ElementType; colorClass: string }
  > = {
    up: { icon: TrendingUp, colorClass: 'text-emerald-400' },
    down: { icon: TrendingDown, colorClass: 'text-red-400' },
    neutral: { icon: Minus, colorClass: 'text-zinc-400' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;
  const trendColorClass = trend ? trendConfig[trend].colorClass : '';

  const valueElement = gradientPreset ? (
    <GradientText preset={gradientPreset} className={fontSize}>
      <AnimatedCounter
        value={value}
        duration={duration}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        useGrouping={useGrouping}
        fontSize={fontSize}
        color=""
        className=""
      />
    </GradientText>
  ) : (
    <AnimatedCounter
      value={value}
      duration={duration}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      useGrouping={useGrouping}
      fontSize={fontSize}
    />
  );

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline gap-2">
        {valueElement}
        {(trend || trendValue) && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold',
              trendColorClass
            )}
          >
            {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
            {trendValue && <span>{trendValue}</span>}
          </span>
        )}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
