'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { preloadModule } from '@/components/layout/AppShell';
import { MODULES } from '@/lib/mock-data';
import type { ModuleId, ModuleDef } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Map icon string names to actual lucide components
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

const PHASE_ORDER = ['MVP', 'Phase 2', 'Phase 3'] as const;

const PHASE_COLORS: Record<string, string> = {
  MVP: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Phase 2': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Phase 3': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function ModuleIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = ICON_MAP[icon] || LayoutDashboard;
  return <IconComponent className={className} />;
}

function NavItem({
  module,
  isActive,
  collapsed,
  onClick,
}: {
  module: ModuleDef;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const content = (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => preloadModule(module.id)}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        'hover:bg-white/[0.06]',
        isActive
          ? 'bg-white/[0.08] text-white'
          : 'text-zinc-400 hover:text-zinc-200',
        collapsed && 'justify-center px-2'
      )}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active left border accent — 4px with pulse animation */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[4px] rounded-r-full"
          style={{ backgroundColor: module.color }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          {/* Pulse glow behind the active border */}
          <motion.div
            className="absolute inset-0 rounded-r-full"
            style={{ backgroundColor: module.color }}
            animate={{ opacity: [0.6, 1, 0.6], scaleX: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* Hover left border accent (colored, 3px, 50% opacity) */}
      {!isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full opacity-0 group-hover:opacity-50 transition-opacity duration-200"
          style={{ backgroundColor: module.color }}
        />
      )}

      {/* Active background gradient (accent color brighter gradient) */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${module.color}14 0%, ${module.color}08 40%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Hover shimmer effect */}
      {!isActive && (
        <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-transparent" />
      )}

      {/* Icon with color glow on active — 19px with micro pulse */}
      <div className="relative flex-shrink-0">
        <ModuleIcon
          icon={module.icon}
          className={cn(
            'size-[19px] transition-colors duration-200',
            isActive ? 'text-white animate-icon-pulse' : 'text-zinc-500 group-hover:text-zinc-300'
          )}
        />
        {isActive && (
          <div
            className="absolute inset-0 size-[19px] rounded-full blur-md opacity-60"
            style={{ backgroundColor: module.color }}
          />
        )}
      </div>

      {/* Text content — hidden when collapsed */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="relative z-10 flex flex-1 items-center justify-between overflow-hidden"
          >
            <span className="truncate text-[13px]">{module.name}</span>
            <Badge
              variant="outline"
              className={cn(
                'ml-2 h-[18px] rounded-[4px] border px-1.5 text-[10px] font-semibold leading-none',
                PHASE_COLORS[module.phase]
              )}
            >
              {module.phase === 'Phase 2' ? 'P2' : module.phase === 'Phase 3' ? 'P3' : module.phase}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-medium">
          {module.name}
          <span className="ml-2 text-[10px] text-zinc-400">{module.phase}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebarCollapse } =
    useNavigationStore();

  // Group modules by phase
  const modulesByPhase = PHASE_ORDER.map((phase) => ({
    phase,
    modules: MODULES.filter((m) => m.phase === phase),
  }));

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative flex h-screen flex-col border-r border-white/[0.06]',
        'bg-gradient-to-b from-[#0c1020] via-[#0d1224] to-[#070a14]'
      )}
    >
      {/* ── Animated gradient line at very top ── */}
      <div className="sidebar-top-line" />

      {/* ── Subtle gradient overlay (lighter top, darker bottom) ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.015] via-transparent to-black/[0.08]" />

      {/* ── Star pattern overlay for branding area ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-star-pattern opacity-40" />

      {/* ── Right border gradient (transparent → white/6% → transparent) ── */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
        }}
      />

      {/* ── Branding ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-4',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        {/* Logo mark with subtle glow behind shield */}
        <div className="relative flex-shrink-0">
          {/* Glow behind shield */}
          <div className="absolute inset-0 flex size-8 items-center justify-center rounded-lg bg-[#0077B6]/20 blur-md" />
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0077B6] to-[#00a8e8] shadow-lg shadow-[#0077B6]/20">
            <Shield className="size-4 text-white" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-[15px] font-bold tracking-tight text-white">
                CivicLens
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#0091d5]">
                South Africa
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gold accent line below branding */}
        <div
          className="absolute bottom-0 left-4 right-4 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(180,83,9,0.3) 30%, rgba(180,83,9,0.5) 50%, rgba(180,83,9,0.3) 70%, transparent)',
          }}
        />
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <ScrollArea className="relative z-10 flex-1 py-3">
        <div className="space-y-5 px-2">
          {modulesByPhase.map(({ phase, modules }) => (
            <div key={phase}>
              {/* Phase label with divider */}
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-2 px-3"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                      {phase === 'MVP' ? 'Core Intelligence' : phase}
                    </span>
                    {/* Subtle divider line after phase header */}
                    <div className="mt-1.5 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.04] to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Module items */}
              <div className="space-y-0.5">
                {modules.map((mod) => (
                  <NavItem
                    key={mod.id}
                    module={mod}
                    isActive={activeModule === mod.id}
                    collapsed={sidebarCollapsed}
                    onClick={() => setActiveModule(mod.id as ModuleId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* ── Bottom Section ───────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/[0.06] p-2">
        <div className={cn('flex items-center gap-1', sidebarCollapsed && 'flex-col')}>
          {sidebarCollapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] hover:shadow-[0_0_8px_rgba(255,255,255,0.04)] transition-all duration-200"
                    onClick={() => setActiveModule('settings')}
                  >
                    <Settings className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] hover:shadow-[0_0_8px_rgba(255,255,255,0.04)] transition-all duration-200"
                    onClick={() => setActiveModule('help')}
                  >
                    <HelpCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Help</TooltipContent>
              </Tooltip>
              <div className="relative mt-1">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#0077B6]/20 text-[#0077B6] text-xs font-semibold">
                    SA
                  </AvatarFallback>
                </Avatar>
                {/* Online status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0e1a]" />
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] hover:shadow-[0_0_8px_rgba(255,255,255,0.04)] transition-all duration-200"
                onClick={() => setActiveModule('settings')}
              >
                <Settings className="size-4" />
                <span className="text-[13px]">Settings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] hover:shadow-[0_0_8px_rgba(255,255,255,0.04)] transition-all duration-200"
                onClick={() => setActiveModule('help')}
              >
                <HelpCircle className="size-4" />
                <span className="text-[13px]">Help</span>
              </Button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <Separator className="my-2 bg-white/[0.06]" />

        <div
          className={cn(
            'flex items-center gap-2',
            sidebarCollapsed ? 'justify-center' : 'px-1'
          )}
        >
          {!sidebarCollapsed && (
            <div className="flex flex-1 items-center gap-2">
              <div className="relative">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#0077B6]/20 text-[#0077B6] text-xs font-semibold border border-[#0077B6]/30">
                    SA
                  </AvatarFallback>
                </Avatar>
                {/* Online status dot (green) */}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0e1a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-zinc-300 truncate">Analyst</p>
                <p className="text-[10px] text-zinc-600 truncate">Gov. Level 5</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapse}
            className={cn(
              'size-8 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] transition-all duration-300',
              'border border-white/[0.06] hover:border-white/[0.12]',
              sidebarCollapsed && 'mt-1'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
