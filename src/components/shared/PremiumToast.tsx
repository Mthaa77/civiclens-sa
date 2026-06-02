'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface PremiumToastConfig {
  icon: LucideIcon;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ── Style configs ────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, {
  iconColor: string;
  borderColor: string;
  accentBg: string;
  progressBarColor: string;
  glowColor: string;
}> = {
  success: {
    iconColor: '#10B981',
    borderColor: 'rgba(16,185,129,0.25)',
    accentBg: 'rgba(16,185,129,0.08)',
    progressBarColor: '#10B981',
    glowColor: '0 0 20px rgba(16,185,129,0.15)',
  },
  warning: {
    iconColor: '#F59E0B',
    borderColor: 'rgba(245,158,11,0.25)',
    accentBg: 'rgba(245,158,11,0.08)',
    progressBarColor: '#F59E0B',
    glowColor: '0 0 20px rgba(245,158,11,0.15)',
  },
  error: {
    iconColor: '#EF4444',
    borderColor: 'rgba(239,68,68,0.25)',
    accentBg: 'rgba(239,68,68,0.08)',
    progressBarColor: '#EF4444',
    glowColor: '0 0 20px rgba(239,68,68,0.15)',
  },
  info: {
    iconColor: '#3B82F6',
    borderColor: 'rgba(59,130,246,0.25)',
    accentBg: 'rgba(59,130,246,0.08)',
    progressBarColor: '#3B82F6',
    glowColor: '0 0 20px rgba(59,130,246,0.15)',
  },
};

const ICON_MAP: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

// ── Premium Toast Component ──────────────────────────────────────────────────

function PremiumToastContent({
  type,
  title,
  description,
  duration = 5000,
  action,
  onClose,
}: PremiumToastConfig & { type: ToastType; onClose: () => void }) {
  const style = TOAST_STYLES[type];
  const Icon = ICON_MAP[type];
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative flex items-start gap-3 rounded-xl border p-4 min-w-[320px] max-w-[420px]',
        'bg-[#0d1224]/96 backdrop-blur-xl',
        'shadow-2xl shadow-black/40'
      )}
      style={{
        borderColor: style.borderColor,
        boxShadow: style.glowColor,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-t-xl opacity-70"
        style={{ backgroundColor: style.iconColor }}
      />

      {/* Icon with glow */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: style.accentBg, border: `1px solid ${style.borderColor}` }}
        >
          <Icon className="size-4.5" style={{ color: style.iconColor }} />
        </div>
        {/* Background glow */}
        <div
          className="absolute inset-0 size-9 rounded-lg blur-md opacity-40"
          style={{ backgroundColor: style.iconColor }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-zinc-100 leading-snug">{title}</h4>
        {description && (
          <p className="text-[12px] text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-[11px] font-semibold transition-colors hover:opacity-80"
            style={{ color: style.iconColor }}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onClose}
        className="shrink-0 flex size-6 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
      >
        <X className="size-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-b-xl overflow-hidden bg-white/[0.04]">
        <motion.div
          className="h-full rounded-b-xl"
          style={{ backgroundColor: style.progressBarColor }}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// ── Toast Container ──────────────────────────────────────────────────────────

interface ToastEntry {
  id: string;
  type: ToastType;
  config: PremiumToastConfig;
}

const toastContainerState = {
  toasts: [] as ToastEntry[],
  listeners: new Set<() => void>(),
  addToast(type: ToastType, config: PremiumToastConfig) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    toastContainerState.toasts.push({ id, type, config });
    toastContainerState.notify();
    return id;
  },
  removeToast(id: string) {
    toastContainerState.toasts = toastContainerState.toasts.filter((t) => t.id !== id);
    toastContainerState.notify();
  },
  notify() {
    toastContainerState.listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    toastContainerState.listeners.add(listener);
    return () => toastContainerState.listeners.delete(listener);
  },
};

function useToastContainer() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = toastContainerState.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);
  return toastContainerState.toasts;
}

// ── Toast Container Renderer ─────────────────────────────────────────────────

export function PremiumToastContainer() {
  const toasts = useToastContainer();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((entry) => (
          <div key={entry.id} className="pointer-events-auto">
            <PremiumToastContent
              type={entry.type}
              {...entry.config}
              onClose={() => toastContainerState.removeToast(entry.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Helper Functions ─────────────────────────────────────────────────────────

export function showSuccessToast(config: Omit<PremiumToastConfig, 'icon'>) {
  toastContainerState.addToast('success', config);
  // Also fire a sonner toast for accessibility
  toast.success(config.title, { description: config.description });
}

export function showWarningToast(config: Omit<PremiumToastConfig, 'icon'>) {
  toastContainerState.addToast('warning', config);
  toast.warning(config.title, { description: config.description });
}

export function showErrorToast(config: Omit<PremiumToastConfig, 'icon'>) {
  toastContainerState.addToast('error', config);
  toast.error(config.title, { description: config.description });
}

export function showInfoToast(config: Omit<PremiumToastConfig, 'icon'>) {
  toastContainerState.addToast('info', config);
  toast.info(config.title, { description: config.description });
}
