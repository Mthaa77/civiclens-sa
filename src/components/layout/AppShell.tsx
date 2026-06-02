'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { MODULES } from '@/lib/mock-data';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import LoginPage from '@/components/modules/LoginPage';
import Dashboard from '@/components/modules/Dashboard';
import TenderLens from '@/components/modules/TenderLens';
import MuniLens from '@/components/modules/MuniLens';
import GeoLens from '@/components/modules/GeoLens';
import AIAnalyst from '@/components/modules/AIAnalyst';
import RiskLens from '@/components/modules/RiskLens';
import ElectionLens from '@/components/modules/ElectionLens';
import ReportLens from '@/components/modules/ReportLens';
import PolicyLens from '@/components/modules/PolicyLens';
import PeopleLens from '@/components/modules/PeopleLens';
import ServiceLens from '@/components/modules/ServiceLens';
import AGASAlert from '@/components/modules/AGASAlert';
import EarlyAlert from '@/components/modules/EarlyAlert';
import GrantLens from '@/components/modules/GrantLens';
import BudgetLens from '@/components/modules/BudgetLens';
import CarbonLens from '@/components/modules/CarbonLens';
import DataHub from '@/components/modules/DataHub';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Placeholder module components ──────────────────────────────────────────
// These will be replaced with actual module implementations later.
// For now, they show a professional placeholder for each module.

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
  // Render actual module components when implemented
  if (moduleId === 'dashboard') {
    return <Dashboard />;
  }
  if (moduleId === 'tenderlens') {
    return <TenderLens />;
  }
  if (moduleId === 'munilens') {
    return <MuniLens />;
  }
  if (moduleId === 'geolens') {
    return <GeoLens />;
  }
  if (moduleId === 'ai-analyst') {
    return <AIAnalyst />;
  }
  if (moduleId === 'risklens') {
    return <RiskLens />;
  }
  if (moduleId === 'electionlens') {
    return <ElectionLens />;
  }
  if (moduleId === 'reportlens') {
    return <ReportLens />;
  }
  if (moduleId === 'policylens') {
    return <PolicyLens />;
  }
  if (moduleId === 'peoplelens') {
    return <PeopleLens />;
  }
  if (moduleId === 'servicelens') {
    return <ServiceLens />;
  }
  if (moduleId === 'agasalert') {
    return <AGASAlert />;
  }
  if (moduleId === 'earlyalert') {
    return <EarlyAlert />;
  }
  if (moduleId === 'grantlens') {
    return <GrantLens />;
  }
  if (moduleId === 'budgetlens') {
    return <BudgetLens />;
  }
  if (moduleId === 'carbonlens') {
    return <CarbonLens />;
  }
  if (moduleId === 'datahub') {
    return <DataHub />;
  }

  // Fallback to placeholder for unimplemented modules
  return (
    <ModulePlaceholder moduleId={moduleId} />
  );
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
          <LoginPage onLogin={() => setAuthenticated(true)} />
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

        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-6">
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
    </div>
  );
}
