'use client';

import React, { Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { MODULES } from '@/lib/mock-data';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import ActivityTicker from './ActivityTicker';
import KeyboardShortcuts from '@/components/shared/KeyboardShortcuts';
import OnboardingModal from '@/components/shared/OnboardingModal';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// ── Dynamic imports (lazy-loaded modules) ─────────────────────────────────
const LoginPage = React.lazy(() => import('@/components/modules/LoginPage'));
const Dashboard = React.lazy(() => import('@/components/modules/Dashboard'));
const TenderLens = React.lazy(() => import('@/components/modules/TenderLens'));
const MuniLens = React.lazy(() => import('@/components/modules/MuniLens'));
const GeoLens = React.lazy(() => import('@/components/modules/GeoLens'));
const AIAnalyst = React.lazy(() => import('@/components/modules/AIAnalyst'));
const RiskLens = React.lazy(() => import('@/components/modules/RiskLens'));
const ElectionLens = React.lazy(() => import('@/components/modules/ElectionLens'));
const ReportLens = React.lazy(() => import('@/components/modules/ReportLens'));
const PolicyLens = React.lazy(() => import('@/components/modules/PolicyLens'));
const PeopleLens = React.lazy(() => import('@/components/modules/PeopleLens'));
const ServiceLens = React.lazy(() => import('@/components/modules/ServiceLens'));
const AGASAlert = React.lazy(() => import('@/components/modules/AGASAlert'));
const EarlyAlert = React.lazy(() => import('@/components/modules/EarlyAlert'));
const GrantLens = React.lazy(() => import('@/components/modules/GrantLens'));
const BudgetLens = React.lazy(() => import('@/components/modules/BudgetLens'));
const CarbonLens = React.lazy(() => import('@/components/modules/CarbonLens'));
const DataHub = React.lazy(() => import('@/components/modules/DataHub'));
const DataExplorer = React.lazy(() => import('@/components/modules/DataExplorer'));
const SettingsPage = React.lazy(() => import('@/components/modules/SettingsPage'));
const HelpCentre = React.lazy(() => import('@/components/modules/HelpCentre'));

// ── Module registry for preloading ────────────────────────────────────────
// Maps module IDs to their lazy component factories.
// Calling the factory triggers the dynamic import, preloading the chunk.
const MODULE_PRELOAD_MAP: Record<string, () => Promise<unknown>> = {
  login: () => import('@/components/modules/LoginPage'),
  dashboard: () => import('@/components/modules/Dashboard'),
  tenderlens: () => import('@/components/modules/TenderLens'),
  munilens: () => import('@/components/modules/MuniLens'),
  geolens: () => import('@/components/modules/GeoLens'),
  'ai-analyst': () => import('@/components/modules/AIAnalyst'),
  risklens: () => import('@/components/modules/RiskLens'),
  electionlens: () => import('@/components/modules/ElectionLens'),
  reportlens: () => import('@/components/modules/ReportLens'),
  policylens: () => import('@/components/modules/PolicyLens'),
  peoplelens: () => import('@/components/modules/PeopleLens'),
  servicelens: () => import('@/components/modules/ServiceLens'),
  agasalert: () => import('@/components/modules/AGASAlert'),
  earlyalert: () => import('@/components/modules/EarlyAlert'),
  grantlens: () => import('@/components/modules/GrantLens'),
  budgetlens: () => import('@/components/modules/BudgetLens'),
  carbonlens: () => import('@/components/modules/CarbonLens'),
  datahub: () => import('@/components/modules/DataHub'),
  'data-explorer': () => import('@/components/modules/DataExplorer'),
  settings: () => import('@/components/modules/SettingsPage'),
  help: () => import('@/components/modules/HelpCentre'),
};

/** Preload a module chunk by its ID. Safe to call multiple times. */
export function preloadModule(moduleId: string) {
  const loader = MODULE_PRELOAD_MAP[moduleId];
  if (loader) {
    loader().catch(() => {
      // Silently ignore preload failures — the actual lazy import will retry
    });
  }
}

// ── ModuleLoader — Premium skeleton with shimmer ──────────────────────────
function ModuleLoader() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl bg-white/[0.04]" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 bg-white/[0.04]" />
            <Skeleton className="h-3 w-24 bg-white/[0.03]" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md bg-white/[0.04]" />
          <Skeleton className="h-8 w-20 rounded-md bg-white/[0.04]" />
        </div>
      </div>

      {/* KPI cards skeleton — 6 items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="size-8 rounded-lg bg-white/[0.04]" />
              <Skeleton className="h-4 w-12 rounded-full bg-white/[0.03]" />
            </div>
            <Skeleton className="h-7 w-20 bg-white/[0.04]" />
            <Skeleton className="h-3 w-16 bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Main content skeleton — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <Skeleton className="h-5 w-32 bg-white/[0.04]" />
          <Skeleton className="h-[200px] w-full rounded-lg bg-white/[0.03]" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <Skeleton className="h-5 w-36 bg-white/[0.04]" />
          <Skeleton className="h-[200px] w-full rounded-lg bg-white/[0.03]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 bg-white/[0.04]" />
          <Skeleton className="h-8 w-24 rounded-md bg-white/[0.04]" />
        </div>
        {/* Table header */}
        <div className="flex gap-4 border-b border-white/[0.06] pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1 bg-white/[0.04]" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1 bg-white/[0.03]" />
            ))}
          </div>
        ))}
      </div>

      {/* Shimmer overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
      </div>
    </div>
  );
}

// ── Placeholder module components ──────────────────────────────────────────
// For modules that don't have a full implementation yet.

function ModulePlaceholder({ moduleId }: { moduleId: string }) {
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center text-center max-w-md"
      >
        {/* Icon with glow */}
        <div className="relative mb-6">
          <div
            className="flex size-20 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${mod.color}20, ${mod.color}08)`,
              border: `1px solid ${mod.color}30`,
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-30"
              style={{ backgroundColor: mod.color }}
            />
            <span className="text-3xl" style={{ color: mod.color }}>
              {mod.name.charAt(0)}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-100 mb-2">{mod.name}</h2>
        <p className="text-sm text-zinc-500 mb-4 leading-relaxed">{mod.description}</p>

        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
          style={{
            borderColor: `${mod.color}30`,
            color: mod.color,
            background: `${mod.color}08`,
          }}
        >
          <span
            className="size-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: mod.color }}
          />
          {mod.phase} Module — Coming Soon
        </div>

        {mod.phase !== 'MVP' && (
          <p className="mt-4 text-xs text-zinc-600">
            This module is planned for {mod.phase} release
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ── Module content renderer ────────────────────────────────────────────────
function ModuleContent({ moduleId }: { moduleId: string }) {
  // Map module IDs to their lazy-loaded components
  const moduleComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    dashboard: Dashboard,
    tenderlens: TenderLens,
    munilens: MuniLens,
    geolens: GeoLens,
    'ai-analyst': AIAnalyst,
    risklens: RiskLens,
    electionlens: ElectionLens,
    reportlens: ReportLens,
    policylens: PolicyLens,
    peoplelens: PeopleLens,
    servicelens: ServiceLens,
    agasalert: AGASAlert,
    earlyalert: EarlyAlert,
    grantlens: GrantLens,
    budgetlens: BudgetLens,
    carbonlens: CarbonLens,
    datahub: DataHub,
    'data-explorer': DataExplorer,
    settings: SettingsPage,
    help: HelpCentre,
  };

  const LazyComponent = moduleComponents[moduleId];

  if (LazyComponent) {
    return (
      <Suspense fallback={<ModuleLoader />}>
        <LazyComponent />
      </Suspense>
    );
  }

  // Fallback to placeholder for unimplemented modules
  return <ModulePlaceholder moduleId={moduleId} />;
}

// ── Mobile Sidebar Sheet ───────────────────────────────────────────────────
function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useNavigationStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-64 p-0 bg-[#0a0e1a] border-white/[0.06]">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

// ── Main App Shell ─────────────────────────────────────────────────────────
export default function AppShell() {
  const { activeModule, sidebarCollapsed, sidebarOpen, setSidebarOpen, isAuthenticated, setAuthenticated } =
    useNavigationStore();
  const isMobile = useIsMobile();

  // Close mobile sidebar on module change
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeModule, isMobile, setSidebarOpen]);

  // ── Not authenticated → show LoginPage ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Suspense fallback={<ModuleLoader />}>
            <LoginPage onLogin={() => setAuthenticated(true)} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Authenticated → show Dashboard ──────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#060911]">
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar (sheet/drawer) */}
      {isMobile && <MobileSidebar />}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        {/* Activity ticker — only when authenticated */}
        <ActivityTicker />

        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4 lg:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <ModuleContent moduleId={activeModule} />
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>

        <Footer />
      </div>

      {/* Onboarding modal (first-time users only) */}
      <OnboardingModal />

      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcuts />
    </div>
  );
}
