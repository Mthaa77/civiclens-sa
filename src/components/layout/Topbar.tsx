'use client';

import React, { useEffect, useState, useCallback, useSyncExternalStore, useMemo } from 'react';
import {
  Search,
  Bell,
  Bot,
  Sun,
  Moon,
  Menu,
  Sparkles,
  LogOut,
  User,
  Settings,
  ChevronRight,
  Command,
  Building2,
  FileSearch,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { MODULES, MOCK_MUNICIPALITIES, MOCK_TENDERS, MOCK_RISK_SIGNALS } from '@/lib/mock-data';
import { formatCompactZAR, getScoreBand } from '@/lib/formatters';
import type { ModuleId } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import NotificationsPanel from '@/components/layout/NotificationsPanel';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const emptySubscribe = () => () => {};

function SouthAfricanDate() {
  const dateStr = useSyncExternalStore(
    emptySubscribe,
    () =>
      new Date().toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    () => '' // server snapshot
  );

  if (!dateStr) return <span className="text-xs text-zinc-500">Loading...</span>;

  return (
    <span className="hidden lg:inline text-xs font-medium text-zinc-400 tracking-wide">
      <span className="text-zinc-500">ZA</span>{' '}
      <span className="text-[#B45309]/70">●</span>{' '}
      {dateStr}
    </span>
  );
}

export default function Topbar() {
  const { activeModule, setActiveModule, setSidebarOpen, sidebarOpen } =
    useNavigationStore();
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Recent modules - derived from active module + defaults
  const recentModules = useMemo(() => {
    const defaultIds: ModuleId[] = ['dashboard', 'munilens', 'tenderlens', 'geolens', 'ai-analyst'];
    const filtered = defaultIds.filter((id) => id !== activeModule);
    const ids = [activeModule, ...filtered].slice(0, 5);
    return ids.map((id) => MODULES.find((m) => m.id === id)).filter(Boolean);
  }, [activeModule]);

  // Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentModule = MODULES.find((m) => m.id === activeModule);

  const handleModuleSelect = useCallback(
    (moduleId: string) => {
      setActiveModule(moduleId as ModuleId);
      setCommandOpen(false);
    },
    [setActiveModule]
  );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 flex h-14 items-center gap-2 sm:gap-4 border-b border-border/40 px-3 sm:px-4 lg:px-6',
          'bg-[#0a0e1a]/85 backdrop-blur-2xl',
          'relative'
        )}
      >
        {/* ── Bottom gradient border (blue to gold, low opacity) ── */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,119,182,0.2) 25%, rgba(180,83,9,0.2) 75%, transparent)',
          }}
        />

        {/* Mobile menu toggle — 44px minimum tap target */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200 hover:brightness-110 min-h-[44px] min-w-[44px]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Breadcrumb */}
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer transition-colors duration-200"
                onClick={() => setActiveModule('dashboard')}
              >
                CivicLens
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-700">
              <ChevronRight className="size-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage
                className="text-sm font-medium"
                style={{ color: currentModule?.color ?? '#d4d4d8' }}
              >
                {currentModule?.name ?? 'Dashboard'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile breadcrumb - just current module name, with max-width to prevent overflow */}
        <span
          className="sm:hidden text-sm font-medium truncate max-w-[120px]"
          style={{ color: currentModule?.color ?? '#e4e4e7' }}
        >
          {currentModule?.name ?? 'Dashboard'}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* SA Date */}
        <SouthAfricanDate />

        {/* Search bar — responsive: hidden on small, medium on md, full on lg */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCommandOpen(true)}
              className={cn(
                'hidden md:flex items-center gap-2 h-9 rounded-lg border bg-white/[0.03]',
                'px-3 text-xs text-zinc-500 transition-all duration-300 cursor-pointer w-44 lg:w-72',
                searchFocused
                  ? 'border-transparent shadow-[0_0_16px_rgba(0,119,182,0.15),0_0_4px_rgba(0,119,182,0.1)] bg-white/[0.05]'
                  : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]'
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            >
              {/* Gradient border on focus wrapper */}
              {searchFocused && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={{
                    padding: '1px',
                    background: 'linear-gradient(135deg, #0077B6, #0F766E)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />
              )}
              <Search className="size-3.5 shrink-0" />
              <span className="flex-1 text-left truncate">Search modules...</span>
              <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-zinc-500 lg:flex">
                <Command className="size-2.5" />K
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Search modules (Ctrl+K)</TooltipContent>
        </Tooltip>

        {/* Mobile search button — small screen fallback */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200 min-h-[44px] min-w-[44px]"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search (Ctrl+K)</TooltipContent>
        </Tooltip>

        {/* AI Analyst quick launch — 44px tap target */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative text-zinc-400 transition-all duration-200 min-h-[44px] min-w-[44px]',
                'hover:text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              )}
              onClick={() => setActiveModule('ai-analyst')}
            >
              <Sparkles className="size-4" />
              {/* More prominent pulse indicator */}
              <span className="absolute top-1 right-1 flex">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Analyst</TooltipContent>
        </Tooltip>

        {/* Notification bell — 44px tap target, badge visible on mobile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:shadow-[0_0_10px_rgba(239,68,68,0.1)] transition-all duration-200 min-h-[44px] min-w-[44px]"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="size-4" />
              <span
                className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#0a0e1a] shadow-[0_0_8px_rgba(239,68,68,0.4)]"
              >
                3
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>3 new alerts</TooltipContent>
        </Tooltip>

        {/* Theme toggle — 44px tap target */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:shadow-[0_0_8px_rgba(255,255,255,0.04)] transition-all duration-200 min-h-[44px] min-w-[44px]"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        {/* User avatar dropdown — with online status & themed accent */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative rounded-full hover:bg-white/[0.06] transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <div className="relative">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#0077B6]/20 text-[#0077B6] text-xs font-semibold border border-[#0077B6]/30">
                    SA
                  </AvatarFallback>
                </Avatar>
                {/* Online status green dot */}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0e1a]" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-[#0d1224] border-white/[0.08]"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-zinc-200">Senior Analyst</p>
                <p className="text-xs text-zinc-500">analyst@civiclens.gov.za</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] cursor-pointer transition-all duration-150"
              onClick={() => setActiveModule('settings' as ModuleId)}
            >
              <User className="mr-2 size-4 text-[#0077B6]/70" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] transition-all duration-150"
              onClick={() => setActiveModule('settings')}
            >
              <Settings className="mr-2 size-4 text-zinc-500" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06] transition-all duration-150">
              <Bot className="mr-2 size-4 text-[#0F766E]/70" />
              AI Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer transition-all duration-150"
              onClick={() => useNavigationStore.getState().setAuthenticated(false)}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Notifications Panel ──────────────────────────────── */}
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />

      {/* ── Command Palette Dialog ──────────────────────────────── */}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Search CivicLens SA"
        description="Search modules, municipalities, tenders, and risk signals"
      >
        <CommandInput placeholder="Search everything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Recent Modules */}
          {recentModules.length > 0 && (
            <CommandGroup heading="Recent">
              {recentModules.map((mod) => (
                <CommandItem
                  key={`recent-${mod.id}`}
                  value={`recent-${mod.name}`}
                  onSelect={() => handleModuleSelect(mod.id)}
                  className="text-zinc-300"
                >
                  <div
                    className="mr-2 size-2 rounded-full"
                    style={{ backgroundColor: mod.color }}
                  />
                  <span>{mod.name}</span>
                  <span className="ml-auto text-[10px] text-zinc-600">
                    {mod.shortName}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Modules */}
          {(['MVP', 'Phase 2', 'Phase 3'] as const).map((phase) => {
            const phaseModules = MODULES.filter((m) => m.phase === phase);
            if (phaseModules.length === 0) return null;
            return (
              <CommandGroup key={phase} heading={`Modules — ${phase}`}>
                {phaseModules.map((mod) => (
                  <CommandItem
                    key={mod.id}
                    value={`module-${mod.name}`}
                    onSelect={() => handleModuleSelect(mod.id)}
                    className="text-zinc-300"
                  >
                    <div
                      className="mr-2 size-2 rounded-full"
                      style={{ backgroundColor: mod.color }}
                    />
                    <span>{mod.name}</span>
                    <span className="ml-auto text-[10px] text-zinc-600">
                      {mod.shortName}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          {/* Municipalities */}
          <CommandGroup heading="Municipalities">
            {MOCK_MUNICIPALITIES.map((muni) => {
              const band = getScoreBand(muni.financialHealthScore);
              const dotColor = muni.financialHealthScore !== null
                ? muni.financialHealthScore >= 65 ? '#22C55E'
                  : muni.financialHealthScore >= 45 ? '#F59E0B'
                  : muni.financialHealthScore >= 25 ? '#F97316'
                  : '#EF4444'
                : '#71717a';
              return (
                <CommandItem
                  key={`muni-${muni.id}`}
                  value={`municipality-${muni.name}-${muni.code}-${muni.province}`}
                  onSelect={() => handleModuleSelect('munilens')}
                  className="text-zinc-300"
                >
                  <div
                    className="mr-2 size-2 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <Building2 className="size-3 mr-1.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{muni.name}</span>
                  <span className="ml-1 text-[10px] text-zinc-600 shrink-0">{muni.province}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[9px] h-4 px-1 font-bold tabular-nums shrink-0 border-current/20"
                    style={{ color: dotColor, backgroundColor: `${dotColor}12` }}
                  >
                    FHS {muni.financialHealthScore ?? '—'}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {/* Tenders */}
          <CommandGroup heading="Tenders">
            {MOCK_TENDERS.map((tender) => {
              const statusColor = tender.status === 'Active' ? '#10B981'
                : tender.status === 'Awarded' ? '#3B82F6'
                : tender.status === 'Cancelled' ? '#EF4444'
                : '#71717a';
              return (
                <CommandItem
                  key={`tender-${tender.id}`}
                  value={`tender-${tender.title}-${tender.buyerName}-${tender.category}`}
                  onSelect={() => handleModuleSelect('tenderlens')}
                  className="text-zinc-300"
                >
                  <div
                    className="mr-2 size-2 rounded-full shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <FileSearch className="size-3 mr-1.5 text-zinc-500 shrink-0" />
                  <span className="truncate flex-1">{tender.title}</span>
                  <span className="text-[10px] text-zinc-500 ml-1 shrink-0">{tender.buyerName}</span>
                  <span className="ml-auto text-[10px] font-bold text-[#B45309] tabular-nums shrink-0">
                    {formatCompactZAR(tender.estimatedValue)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {/* Risk Signals */}
          <CommandGroup heading="Risk Signals">
            {MOCK_RISK_SIGNALS.map((signal) => {
              const severityColor = signal.severity === 'Critical' ? '#EF4444'
                : signal.severity === 'High' ? '#F97316'
                : signal.severity === 'Medium' ? '#F59E0B'
                : '#22C55E';
              return (
                <CommandItem
                  key={`risk-${signal.id}`}
                  value={`risk-${signal.type}-${signal.entityId}-${signal.description}`}
                  onSelect={() => handleModuleSelect('risklens')}
                  className="text-zinc-300"
                >
                  <div
                    className="mr-2 size-2 rounded-full shrink-0"
                    style={{ backgroundColor: severityColor }}
                  />
                  <ShieldAlert className="size-3 mr-1.5 text-zinc-500 shrink-0" />
                  <span className="truncate flex-1">{signal.type}</span>
                  <span className="text-[10px] text-zinc-500 ml-1 shrink-0">{signal.entityId}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto text-[9px] h-4 px-1 font-bold shrink-0 border-current/20"
                    style={{ color: severityColor, backgroundColor: `${severityColor}12` }}
                  >
                    {signal.severity}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
