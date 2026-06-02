'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  FileSearch,
  Building2,
  Map,
  Bot,
  ShieldAlert,
  Lightbulb,
  Keyboard,
  ArrowRight,
  ArrowLeft,
  Activity,
  Eye,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Step definitions ────────────────────────────────────────────────────────

interface StepDef {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  primaryAction: string;
  accentColor: string;
}

const MODULE_CARDS = [
  { icon: <LayoutDashboard className="size-5" />, name: 'Command Centre', desc: 'KPIs & national overview', color: '#0077B6' },
  { icon: <FileSearch className="size-5" />, name: 'TenderLens', desc: 'Procurement intelligence', color: '#2D6A4F' },
  { icon: <Building2 className="size-5" />, name: 'MuniLens', desc: 'Municipality profiles', color: '#7B2D8E' },
  { icon: <Map className="size-5" />, name: 'GeoLens', desc: 'Spatial analytics', color: '#B45309' },
  { icon: <Bot className="size-5" />, name: 'AI Analyst', desc: 'Natural language queries', color: '#0F766E' },
  { icon: <ShieldAlert className="size-5" />, name: 'RiskLens', desc: 'Anomaly detection', color: '#DC2626' },
];

const TIPS = [
  { keys: 'Ctrl+K', text: 'Search modules quickly' },
  { keys: '?', text: 'Keyboard shortcuts' },
  { keys: 'Activity', text: 'Live updates in the Activity Ticker' },
  { keys: 'AI', text: 'Natural language queries with AI Analyst' },
];

// ── Animation variants ─────────────────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

// ── Shield Glow Pulse Component ────────────────────────────────────────────

function ShieldIconWithGlow() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      <motion.div
        className="absolute size-28 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,119,182,0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Inner glow */}
      <motion.div
        className="absolute size-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(45,106,79,0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
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
        <Shield className="size-16 text-zinc-100 relative" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}

// ── Particle Dot Background ────────────────────────────────────────────────

function ParticleBackground() {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-white/[0.04]"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Decorative Gradient Bar ────────────────────────────────────────────────

function DecorativeGradientBar({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
      style={{
        background: `linear-gradient(180deg, ${color}80, ${color}30, transparent)`,
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────

function StepProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #0077B6, #2D6A4F, #B45309)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Check if user has already been onboarded
    try {
      const onboarded = localStorage.getItem('civiclens-onboarded');
      if (!onboarded) {
        // Small delay so the app renders first
        const timer = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem('civiclens-onboarded', 'true');
    } catch {
      // ignore
    }
  };

  const goNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const steps: StepDef[] = [
    // Step 1: Welcome
    {
      id: 0,
      icon: <ShieldIconWithGlow />,
      title: 'Welcome to CivicLens SA',
      subtitle: "South Africa's Premier Public Sector Intelligence Platform",
      content: (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-3 mt-6"
        >
          {[
            { icon: <Activity className="size-4 text-emerald-400" />, text: 'Real-time monitoring of 257 municipalities' },
            { icon: <Sparkles className="size-4 text-teal-400" />, text: 'AI-powered insights and recommendations' },
            { icon: <Eye className="size-4 text-amber-400" />, text: 'Spatial analytics with provincial heatmaps' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-white/[0.06] shrink-0">
                {feature.icon}
              </div>
              <span className="text-sm text-zinc-300">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      ),
      primaryAction: 'Get Started',
      accentColor: '#0077B6',
    },
    // Step 2: Your Dashboard
    {
      id: 1,
      icon: <LayoutDashboard className="size-14 text-zinc-100" strokeWidth={1.5} />,
      title: 'Your Command Centre',
      subtitle: 'Monitor South Africa\'s municipalities at a glance with live KPIs and intelligence feeds',
      content: (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-6"
        >
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">Dashboard Preview</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Municipalities', value: '257', color: '#0077B6' },
              { label: 'Active Tenders', value: '1,847', color: '#2D6A4F' },
              { label: 'Risk Signals', value: '234', color: '#F59E0B' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                variants={staggerItem}
                className="rounded-lg border border-white/[0.08] p-3 bg-white/[0.03]"
              >
                <div className="h-[3px] rounded-full mb-2 opacity-80" style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
            Track financial health, service delivery, audit outcomes, and procurement across all 9 provinces in real-time.
          </p>
        </motion.div>
      ),
      primaryAction: 'Next',
      accentColor: '#2D6A4F',
    },
    // Step 3: Key Modules
    {
      id: 2,
      icon: <LayoutDashboard className="size-14 text-zinc-100" strokeWidth={1.5} />,
      title: 'Key Modules',
      subtitle: 'Six powerful tools for public sector intelligence',
      content: (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-2 gap-2"
        >
          {MODULE_CARDS.map((mod, i) => (
            <motion.div
              key={mod.name}
              variants={staggerItem}
              className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 hover:border-white/[0.12] transition-colors"
            >
              <div
                className="flex size-8 items-center justify-center rounded-md shrink-0"
                style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}25` }}
              >
                <span style={{ color: mod.color }}>{mod.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">{mod.name}</p>
                <p className="text-[10px] text-zinc-500 leading-snug">{mod.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ),
      primaryAction: 'Next',
      accentColor: '#B45309',
    },
    // Step 4: Quick Tips
    {
      id: 3,
      icon: <Lightbulb className="size-14 text-amber-300" strokeWidth={1.5} />,
      title: 'Pro Tips',
      subtitle: 'Get the most out of CivicLens with these shortcuts',
      content: (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-6 space-y-2.5"
        >
          {TIPS.map((tip, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <Keyboard className="size-3.5 text-zinc-500" />
                <span className="text-[10px] font-mono font-semibold text-zinc-300 bg-white/[0.08] border border-white/[0.1] rounded px-1.5 py-0.5">
                  {tip.keys}
                </span>
              </div>
              <span className="text-xs text-zinc-400">{tip.text}</span>
            </motion.div>
          ))}
        </motion.div>
      ),
      primaryAction: 'Start Exploring',
      accentColor: '#0F766E',
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === 3;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl mx-4 rounded-2xl border border-white/[0.1] bg-[#0a0e1a]/95 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            {/* SA flag gradient accent line */}
            <div
              className="h-1 w-full"
              style={{
                background: 'linear-gradient(90deg, #002395 0%, #002395 33%, #DE3831 33%, #DE3831 66%, #FFB612 66%, #FFB612 100%)',
              }}
            />

            {/* Particle dot background */}
            <ParticleBackground />

            <div className="relative p-6 sm:p-8">
              {/* Step content with animation */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="relative"
                >
                  {/* Decorative left gradient bar */}
                  <DecorativeGradientBar color={currentStep.accentColor} />

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    {currentStep.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 text-center mb-1.5">
                    {currentStep.title}
                  </h2>

                  {/* Subtitle — lighter color for better contrast */}
                  <p className="text-sm text-zinc-300 text-center max-w-md mx-auto leading-relaxed">
                    {currentStep.subtitle}
                  </p>

                  {/* Content */}
                  <div className="pl-2">
                    {currentStep.content}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/[0.06]">
                {/* Back button */}
                <div className="w-24">
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

                {/* Progress dots + step counter */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setDirection(i > step ? 1 : -1);
                          setStep(i);
                        }}
                        className="transition-all duration-300"
                      >
                        <div
                          className={cn(
                            'rounded-full transition-all duration-300',
                            i === step
                              ? 'w-6 h-2 bg-white/80'
                              : i < step
                                ? 'w-2 h-2 bg-white/40'
                                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    Step {step + 1} of 4
                  </span>
                </div>

                {/* Next / Primary action with gradient hover effect */}
                <div className="w-28 flex justify-end">
                  <Button
                    size="sm"
                    onClick={isLastStep ? handleClose : goNext}
                    className={
                      isLastStep
                        ? 'gap-1.5 bg-gradient-to-r from-[#0077B6] to-[#2D6A4F] hover:from-[#0077B6] hover:to-[#2D6A4F] text-white shadow-lg shadow-[#0077B6]/20 hover:shadow-[#0077B6]/30 transition-shadow duration-300'
                        : 'gap-1.5 bg-white/[0.08] hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-white/[0.14] text-zinc-200 border border-white/[0.1] hover:border-white/[0.16] transition-all duration-300'
                    }
                  >
                    {isLastStep ? (
                      <>
                        <Check className="size-3.5" />
                        {currentStep.primaryAction}
                      </>
                    ) : (
                      <>
                        {currentStep.primaryAction}
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress bar at bottom */}
              <div className="mt-3">
                <StepProgressBar currentStep={step} totalSteps={4} />
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

// Utility for conditional classnames
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
