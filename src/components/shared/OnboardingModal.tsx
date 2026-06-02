'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  FileSearch,
  Building2,
  Map,
  Bot,
  FileBarChart,
  ShieldAlert,
  Vote,
  ScrollText,
  Users,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  HandCoins,
  Landmark,
  Leaf,
  Database,
  Activity,
  Eye,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Keyboard,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Icon Map for dynamic module icons ─────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileSearch,
  Building2,
  Map,
  Bot,
  FileBarChart,
  ShieldAlert,
  Vote,
  ScrollText,
  Users,
  Droplets,
  ClipboardCheck,
  AlertTriangle,
  HandCoins,
  Landmark,
  Leaf,
  Database,
};

// ── Module data for the 16 modules ────────────────────────────────────────

interface ModuleCard {
  id: string;
  icon: LucideIcon;
  name: string;
  desc: string;
  phase: 'MVP' | 'P2' | 'P3';
  color: string;
}

const MODULE_CARDS: ModuleCard[] = [
  { id: 'dashboard', icon: LayoutDashboard, name: 'Command Centre', desc: 'KPIs & national overview', phase: 'MVP', color: '#0077B6' },
  { id: 'tenderlens', icon: FileSearch, name: 'TenderLens', desc: 'Procurement intelligence', phase: 'MVP', color: '#2D6A4F' },
  { id: 'munilens', icon: Building2, name: 'MuniLens', desc: 'Municipality profiles', phase: 'MVP', color: '#7B2D8E' },
  { id: 'geolens', icon: Map, name: 'GeoLens', desc: 'Spatial analytics', phase: 'MVP', color: '#B45309' },
  { id: 'ai-analyst', icon: Bot, name: 'AI Analyst', desc: 'Natural language queries', phase: 'MVP', color: '#0F766E' },
  { id: 'reportlens', icon: FileBarChart, name: 'ReportLens', desc: 'Professional report generator', phase: 'MVP', color: '#4338CA' },
  { id: 'risklens', icon: ShieldAlert, name: 'RiskLens', desc: 'Anomaly detection', phase: 'P2', color: '#DC2626' },
  { id: 'electionlens', icon: Vote, name: 'ElectionLens', desc: 'Ward accountability', phase: 'MVP', color: '#1D4ED8' },
  { id: 'policylens', icon: ScrollText, name: 'PolicyLens', desc: 'Policy brief generator', phase: 'P2', color: '#6D28D9' },
  { id: 'peoplelens', icon: Users, name: 'PeopleLens', desc: 'Population & labour', phase: 'P2', color: '#059669' },
  { id: 'servicelens', icon: Droplets, name: 'ServiceLens', desc: 'Service delivery scoring', phase: 'P2', color: '#0891B2' },
  { id: 'agasalert', icon: ClipboardCheck, name: 'AGASAlert', desc: 'Audit outcome intel', phase: 'P2', color: '#CA8A04' },
  { id: 'earlyalert', icon: AlertTriangle, name: 'EarlyAlert', desc: '§139 risk prediction', phase: 'P3', color: '#EA580C' },
  { id: 'grantlens', icon: HandCoins, name: 'GrantLens', desc: 'Grant tracking', phase: 'P3', color: '#65A30D' },
  { id: 'budgetlens', icon: Landmark, name: 'BudgetLens', desc: 'National budget intel', phase: 'P3', color: '#9333EA' },
  { id: 'carbonlens', icon: Leaf, name: 'CarbonLens', desc: 'Climate vulnerability', phase: 'P3', color: '#16A34A' },
];

// ── Keyboard shortcuts data ───────────────────────────────────────────────

interface ShortcutDef {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutDef[] = [
  { keys: ['Ctrl', 'K'], description: 'Search modules quickly' },
  { keys: ['1–9'], description: 'Quick navigate between modules' },
  { keys: ['?'], description: 'Show all keyboard shortcuts' },
  { keys: ['G', '+key'], description: 'Go to module by key' },
];

// ── Animation variants ───────────────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.95,
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ── Typewriter hook ───────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 35, delay = 0) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return displayed;
}

// ── Animated counter hook ─────────────────────────────────────────────────

function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

// ── Shield Logo with Concentric Pulse Rings ───────────────────────────────

function ShieldLogoWithPulse() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          border: '1.5px solid rgba(0,119,182,0.15)',
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          border: '1.5px solid rgba(45,106,79,0.2)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 64,
          height: 64,
          border: '1.5px solid rgba(180,83,9,0.25)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        }}
      />
      {/* Shield icon */}
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 8px rgba(0,119,182,0.3))',
            'drop-shadow(0 0 20px rgba(0,119,182,0.5))',
            'drop-shadow(0 0 8px rgba(0,119,182,0.3))',
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Shield className="size-14 text-zinc-100 relative" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}

// ── Floating Particle Background ──────────────────────────────────────────

function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/[0.05]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.6, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── SA Flag Gradient Progress Bar ─────────────────────────────────────────

function FlagGradientProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #002395, #0077B6, #2D6A4F, #DE3831, #FFB612)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// ── Step Indicators ───────────────────────────────────────────────────────

function StepIndicators({ currentStep, totalSteps, onStepClick }: { currentStep: number; totalSteps: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          {/* Circle */}
          <button
            onClick={() => onStepClick(i)}
            className="relative flex items-center justify-center transition-all duration-300"
          >
            <motion.div
              className={cn(
                'flex items-center justify-center rounded-full transition-all duration-300',
                i === currentStep
                  ? 'size-8 border-2 border-[#0077B6] bg-[#0077B6]/20 text-white'
                  : i < currentStep
                    ? 'size-7 border border-[#2D6A4F] bg-[#2D6A4F]/20 text-[#2D6A4F]'
                    : 'size-7 border border-white/[0.15] bg-white/[0.04] text-zinc-500 hover:border-white/[0.3]'
              )}
              animate={i === currentStep ? { scale: [1, 1.08, 1] } : {}}
              transition={i === currentStep ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              {i < currentStep ? (
                <Check className="size-3.5" />
              ) : (
                <span className="text-[10px] font-semibold tabular-nums">{i + 1}</span>
              )}
            </motion.div>
          </button>
          {/* Connecting line */}
          {i < totalSteps - 1 && (
            <div
              className={cn(
                'h-[2px] w-6 mx-0.5 rounded-full transition-all duration-500',
                i < currentStep ? 'bg-[#2D6A4F]/60' : 'bg-white/[0.08]'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Shimmer Button Effect ─────────────────────────────────────────────────

function ShimmerButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl px-8 py-3 font-semibold text-white transition-all duration-300',
        'bg-gradient-to-r from-[#0077B6] via-[#2D6A4F] to-[#0077B6]',
        'shadow-lg shadow-[#0077B6]/25 hover:shadow-[#0077B6]/40',
        className
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

// ── Mini KPI Strip (for Step 4) ───────────────────────────────────────────

function MiniKPIStrip() {
  const muniCount = useCountUp(257, 1200, 200);
  const tenderValue = useCountUp(478, 1400, 400);
  const riskSignals = useCountUp(234, 1000, 600);
  const s139Count = useCountUp(43, 800, 800);

  const kpis = [
    { label: 'Municipalities', value: muniCount, suffix: '', color: '#0077B6', icon: Building2 },
    { label: 'Tender Value', value: tenderValue, suffix: 'B', prefix: 'R', color: '#B45309', icon: FileSearch },
    { label: 'Risk Signals', value: riskSignals, suffix: '', color: '#F59E0B', icon: ShieldAlert },
    { label: '§139 Cases', value: s139Count, suffix: '', color: '#EF4444', icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {kpis.map((kpi, i) => {
        const IconComp = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 300, damping: 24 }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
            <div className="flex items-center gap-2 mb-1">
              <IconComp className="size-3.5" style={{ color: kpi.color }} />
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold tabular-nums" style={{ color: kpi.color }}>
              {kpi.prefix || ''}{kpi.value.toLocaleString()}{kpi.suffix}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Mini Donut Chart SVG (for Step 4) ────────────────────────────────────

function MiniDonutChart() {
  const segments = [
    { label: 'Clean', value: 25, color: '#10B981' },
    { label: 'Unqual.', value: 89, color: '#0077B6' },
    { label: 'Qualified', value: 78, color: '#F59E0B' },
    { label: 'Adverse', value: 32, color: '#F97316' },
    { label: 'Disclaimer', value: 33, color: '#EF4444' },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {segments.map((seg) => {
          const pct = seg.value / total;
          const offset = (cumulative / total) * circumference;
          cumulative += seg.value;
          return (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              opacity={0.85}
            />
          );
        })}
        <text x="50" y="48" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="inherit">
          257
        </text>
        <text x="50" y="60" textAnchor="middle" fill="#71717a" fontSize="7" fontFamily="inherit">
          TOTAL
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-zinc-400">{seg.label}</span>
            <span className="text-[10px] text-zinc-500 tabular-nums">({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Confetti Burst (for Step 6) ───────────────────────────────────────────

function ConfettiBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5;
        const distance = 60 + Math.random() * 80;
        const colors = ['#0077B6', '#2D6A4F', '#B45309', '#DE3831', '#FFB612', '#0F766E', '#7B2D8E'];
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: colors[i % colors.length],
          size: Math.random() * 4 + 2,
          delay: Math.random() * 0.3,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: [0, 0.5, 0.5, 1],
          }}
        />
      ))}
    </div>
  );
}

// ── Animated Shortcut Key ─────────────────────────────────────────────────

function AnimatedKey({ keyLabel, delay }: { keyLabel: string; delay: number }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-white/[0.08] border border-white/[0.15] text-[11px] font-mono font-semibold text-zinc-200"
      animate={{
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 0.4,
        delay,
        repeat: 1,
        repeatDelay: 4,
        ease: 'easeInOut',
      }}
    >
      {keyLabel}
    </motion.span>
  );
}

// ── Counter with animated stats ───────────────────────────────────────────

function AnimatedStatsLine() {
  const municipalities = useCountUp(257, 1200, 300);
  const tenders = useCountUp(478, 1400, 500);
  const provinces = useCountUp(9, 600, 700);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="flex items-center justify-center gap-3 text-sm text-zinc-400 mt-5"
    >
      <span className="font-bold tabular-nums text-[#0077B6]">{municipalities}</span>
      <span>Municipalities</span>
      <span className="text-zinc-600">•</span>
      <span className="font-bold tabular-nums text-[#B45309]">R{tenders}B+</span>
      <span>Tenders</span>
      <span className="text-zinc-600">•</span>
      <span className="font-bold tabular-nums text-[#2D6A4F]">{provinces}</span>
      <span>Provinces</span>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('civiclens-interests');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  // Check if user has already been onboarded
  useEffect(() => {
    try {
      const onboarded = localStorage.getItem('civiclens-onboarded');
      if (!onboarded) {
        const timer = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem('civiclens-onboarded', 'true');
      if (selectedModules.size > 0) {
        localStorage.setItem('civiclens-interests', JSON.stringify([...selectedModules]));
      }
    } catch {
      // ignore
    }
  }, [selectedModules]);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const goToStep = useCallback(
    (target: number) => {
      setDirection(target > step ? 1 : -1);
      setStep(target);
    },
    [step]
  );

  const toggleModule = useCallback((id: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isLastStep = step === TOTAL_STEPS - 1;
  const canProceed = step === 2 ? selectedModules.size >= 3 : true;

  // ── Step contents ──────────────────────────────────────────────────────

  const stepContent = useMemo(() => {
    switch (step) {
      // ── Step 1: Welcome / Hero ──────────────────────────────────────────
      case 0:
        return <WelcomeStep />;

      // ── Step 2: Platform Overview ────────────────────────────────────────
      case 1:
        return <PlatformOverviewStep />;

      // ── Step 3: Module Showcase ─────────────────────────────────────────
      case 2:
        return <ModuleShowcaseStep selectedModules={selectedModules} toggleModule={toggleModule} />;

      // ── Step 4: Command Centre Preview ──────────────────────────────────
      case 3:
        return <CommandCentrePreviewStep />;

      // ── Step 5: Pro Tips & Shortcuts ────────────────────────────────────
      case 4:
        return <ProTipsStep />;

      // ── Step 6: Get Started / Completion ────────────────────────────────
      case 5:
        return <CompletionStep selectedModules={selectedModules} />;

      default:
        return null;
    }
  }, [step, selectedModules, toggleModule]);

  // ── Step metadata ──────────────────────────────────────────────────────

  const stepTitles: { title: string; subtitle: string }[] = [
    { title: 'Welcome to CivicLens SA', subtitle: "South Africa's Premier Public Sector Intelligence Platform" },
    { title: 'What CivicLens Does', subtitle: 'Three pillars of public sector intelligence' },
    { title: 'Choose Your Modules', subtitle: 'Select 3 or more modules you are interested in' },
    { title: 'Your Command Centre', subtitle: 'A preview of your intelligence dashboard' },
    { title: 'Pro Tips & Shortcuts', subtitle: 'Navigate like a power user from day one' },
    { title: "You're All Set!", subtitle: 'Your CivicLens SA journey begins now' },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0a0e1a]/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            {/* SA flag gradient accent line at very top */}
            <div
              className="h-1 w-full shrink-0"
              style={{
                background: 'linear-gradient(90deg, #002395 0%, #002395 33%, #DE3831 33%, #DE3831 66%, #FFB612 66%, #FFB612 100%)',
              }}
            />

            {/* Particle background */}
            <ParticleBackground />

            <div className="relative p-6 sm:p-8">
              {/* Step progress bar */}
              <div className="mb-5">
                <FlagGradientProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
              </div>

              {/* Step indicators */}
              <div className="flex justify-center mb-5">
                <StepIndicators currentStep={step} totalSteps={TOTAL_STEPS} onStepClick={goToStep} />
              </div>

              {/* Step content with AnimatePresence */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="relative min-h-[340px]"
                >
                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 text-center mb-1">
                    {stepTitles[step]?.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm text-zinc-300 text-center max-w-md mx-auto leading-relaxed mb-4">
                    {stepTitles[step]?.subtitle}
                  </p>

                  {/* Content */}
                  {stepContent}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                {/* Back button */}
                <div className="w-28">
                  {step > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      className="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] gap-1.5"
                    >
                      <ArrowLeft className="size-3.5" />
                      Back
                    </Button>
                  )}
                </div>

                {/* Step counter */}
                <span className="text-[10px] text-zinc-500 tabular-nums">
                  Step {step + 1} of {TOTAL_STEPS}
                </span>

                {/* Next / Primary action */}
                <div className="w-32 flex justify-end">
                  {isLastStep ? (
                    <Button
                      size="sm"
                      onClick={handleClose}
                      className="gap-1.5 bg-gradient-to-r from-[#0077B6] to-[#2D6A4F] hover:from-[#0077B6] hover:to-[#2D6A4F] text-white shadow-lg shadow-[#0077B6]/20 hover:shadow-[#0077B6]/30 transition-shadow duration-300"
                    >
                      <Check className="size-3.5" />
                      Launch
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={goNext}
                      disabled={!canProceed}
                      className={cn(
                        'gap-1.5 transition-all duration-300',
                        canProceed
                          ? 'bg-gradient-to-r from-[#0077B6] to-[#2D6A4F] hover:from-[#0077B6] hover:to-[#2D6A4F] text-white shadow-lg shadow-[#0077B6]/20 hover:shadow-[#0077B6]/30'
                          : 'bg-white/[0.06] text-zinc-500 cursor-not-allowed'
                      )}
                    >
                      {step === 0 ? 'Begin Your Journey' : 'Next'}
                      <ArrowRight className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Skip link */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleClose}
                  className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Step 1: Welcome / Hero ────────────────────────────────────────────────

function WelcomeStep() {
  const typedSubtitle = useTypewriter('Intelligence for a better South Africa', 40, 600);

  return (
    <div className="flex flex-col items-center">
      {/* Shield logo with concentric pulse rings */}
      <ShieldLogoWithPulse />

      {/* Heading with gradient text */}
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="bg-gradient-to-r from-[#0077B6] via-[#2D6A4F] to-[#B45309] bg-clip-text text-transparent">
          Welcome to CivicLens SA
        </span>
      </motion.h2>

      {/* Typewriter subtitle */}
      <motion.div
        className="h-6 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-zinc-400 text-center">
          {typedSubtitle}
          <motion.span
            className="inline-block w-[2px] h-4 bg-zinc-400 ml-0.5 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        </p>
      </motion.div>

      {/* Animated stats counter */}
      <AnimatedStatsLine />
    </div>
  );
}

// ── Step 2: Platform Overview ─────────────────────────────────────────────

function PlatformOverviewStep() {
  const features = [
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      desc: 'Track 257 municipalities with live KPIs, financial health, and service delivery data.',
      color: '#10B981',
    },
    {
      icon: Shield,
      title: 'Risk Detection',
      desc: 'AI-powered anomaly detection for procurement fraud, budget overruns, and service failures.',
      color: '#EF4444',
    },
    {
      icon: Eye,
      title: 'Spatial Intelligence',
      desc: 'Interactive choropleth maps revealing provincial patterns and geographic insights.',
      color: '#B45309',
    },
  ];

  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {features.map((feat, i) => {
          const IconComp = feat.icon;
          return (
            <motion.div
              key={feat.title}
              variants={staggerItem}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center hover:border-white/[0.15] transition-colors relative overflow-hidden"
            >
              {/* Accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${feat.color}, transparent)` }} />

              {/* Icon with float animation on hover */}
              <motion.div
                className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl"
                style={{ background: `${feat.color}12`, border: `1px solid ${feat.color}20` }}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <IconComp className="size-6" style={{ color: feat.color }} />
              </motion.div>

              <p className="text-sm font-semibold text-zinc-200 mb-1">{feat.title}</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{feat.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Animated counter line */}
      <AnimatedStatsLine />
    </div>
  );
}

// ── Step 3: Module Showcase ───────────────────────────────────────────────

function ModuleShowcaseStep({
  selectedModules,
  toggleModule,
}: {
  selectedModules: Set<string>;
  toggleModule: (id: string) => void;
}) {
  const phaseColors: Record<string, string> = {
    MVP: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    P2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    P3: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar"
      >
        {MODULE_CARDS.map((mod) => {
          const IconComp = mod.icon;
          const isSelected = selectedModules.has(mod.id);
          return (
            <motion.button
              key={mod.id}
              variants={staggerItem}
              onClick={() => toggleModule(mod.id)}
              className={cn(
                'relative rounded-lg border p-3 text-left transition-all duration-300 group',
                isSelected
                  ? 'border-[#B45309]/60 bg-[#B45309]/10 shadow-[0_0_16px_rgba(180,83,9,0.15)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
              )}
            >
              {/* Checkmark overlay */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute top-1.5 right-1.5 size-5 rounded-full bg-[#B45309] flex items-center justify-center"
                  >
                    <Check className="size-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div
                className="flex size-7 items-center justify-center rounded-md mb-2"
                style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}25` }}
              >
                <IconComp className="size-4" style={{ color: mod.color }} />
              </div>

              {/* Name */}
              <p className="text-[11px] font-semibold text-zinc-200 leading-tight mb-0.5">{mod.name}</p>

              {/* Description */}
              <p className="text-[9px] text-zinc-500 leading-snug mb-1.5">{mod.desc}</p>

              {/* Phase badge */}
              <span
                className={cn(
                  'inline-flex items-center rounded-[3px] border px-1 py-0.5 text-[8px] font-semibold leading-none',
                  phaseColors[mod.phase]
                )}
              >
                {mod.phase}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Counter */}
      <motion.div
        className="mt-3 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className={cn(
          'text-xs tabular-nums',
          selectedModules.size >= 3 ? 'text-emerald-400' : 'text-zinc-500'
        )}>
          {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
          {selectedModules.size < 3 && (
            <span className="text-zinc-600 ml-1">(select at least 3)</span>
          )}
        </span>
      </motion.div>
    </div>
  );
}

// ── Step 4: Command Centre Preview ────────────────────────────────────────

function CommandCentrePreviewStep() {
  const typedDesc = useTypewriter('This is your command centre — your home base for intelligence across all 257 municipalities.', 25, 600);

  return (
    <div>
      {/* KPI Strip */}
      <MiniKPIStrip />

      {/* Donut chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3"
      >
        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Audit Outcome Distribution</p>
        <MiniDonutChart />
      </motion.div>

      {/* Typing description */}
      <motion.div
        className="mt-3 h-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
          {typedDesc}
          <motion.span
            className="inline-block w-[2px] h-3 bg-zinc-400 ml-0.5 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        </p>
      </motion.div>
    </div>
  );
}

// ── Step 5: Pro Tips & Shortcuts ──────────────────────────────────────────

function ProTipsStep() {
  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      >
        {SHORTCUTS.map((shortcut, i) => (
          <motion.div
            key={shortcut.description}
            variants={staggerItem}
            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3"
          >
            <div className="flex items-center gap-1 shrink-0">
              <Keyboard className="size-3.5 text-zinc-500" />
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, ki) => (
                  <AnimatedKey key={ki} keyLabel={key} delay={i * 0.5 + ki * 0.2} />
                ))}
              </div>
            </div>
            <span className="text-xs text-zinc-400">{shortcut.description}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center"
      >
        <p className="text-[11px] text-zinc-500">
          Press <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded bg-white/[0.08] border border-white/[0.12] text-[10px] font-mono font-semibold text-zinc-300 mx-0.5">?</span> anytime to see all shortcuts
        </p>
      </motion.div>
    </div>
  );
}

// ── Step 6: Get Started / Completion ──────────────────────────────────────

function CompletionStep({ selectedModules }: { selectedModules: Set<string> }) {
  const selectedModuleNames = MODULE_CARDS.filter((m) => selectedModules.has(m.id));

  return (
    <div className="flex flex-col items-center">
      {/* Confetti burst */}
      <ConfettiBurst />

      {/* Checkmark icon with spring animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        className="relative flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#0077B6] mb-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.4 }}
        >
          <Check className="size-9 text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Heading with gradient text */}
      <motion.h3
        className="text-2xl font-bold mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="bg-gradient-to-r from-[#0077B6] via-[#2D6A4F] to-[#B45309] bg-clip-text text-transparent">
          You&apos;re All Set!
        </span>
      </motion.h3>

      {/* Summary of selected modules */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm"
      >
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium text-center mb-2">
          Your selected modules
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {selectedModuleNames.map((mod) => {
            const IconComp = mod.icon;
            return (
              <span
                key={mod.id}
                className="inline-flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-300"
              >
                <IconComp className="size-3" style={{ color: mod.color }} />
                {mod.name}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Launch CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-5"
      >
        <ShimmerButton onClick={() => {}} className="pointer-events-none">
          <Sparkles className="size-4" />
          Launch CivicLens SA
        </ShimmerButton>
      </motion.div>

      {/* Revisit note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-[10px] text-zinc-600 mt-3"
      >
        You can revisit this tour anytime from Help Centre
      </motion.p>
    </div>
  );
}
