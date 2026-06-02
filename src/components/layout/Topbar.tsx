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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { MODULES } from '@/lib/mock-data';
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
    <span className="hidden lg:inline text-xs font-medium text-zinc-500 tracking-wide">
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
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
          'sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/[0.06] px-4 lg:px-6',
          'bg-[#0a0e1a]/80 backdrop-blur-xl'
        )}
      >
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Breadcrumb */}
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                onClick={() => setActiveModule('dashboard')}
              >
                CivicLens
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-700">
              <ChevronRight className="size-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-zinc-200 text-xs font-medium">
                {currentModule?.name ?? 'Dashboard'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile breadcrumb - just current module name */}
        <span className="sm:hidden text-xs font-medium text-zinc-200 truncate">
          {currentModule?.name ?? 'Dashboard'}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* SA Date */}
        <SouthAfricanDate />

        {/* Search bar (desktop) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCommandOpen(true)}
              className={cn(
                'hidden md:flex items-center gap-2 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03]',
                'px-3 text-xs text-zinc-500 hover:border-white/[0.15] hover:bg-white/[0.06]',
                'transition-all duration-200 cursor-pointer w-56 lg:w-64'
              )}
            >
              <Search className="size-3.5" />
              <span className="flex-1 text-left">Search modules...</span>
              <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-zinc-500 lg:flex">
                <Command className="size-2.5" />K
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Search modules (Ctrl+K)</TooltipContent>
        </Tooltip>

        {/* AI Analyst quick launch */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative size-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10',
                'transition-all duration-200'
              )}
              onClick={() => setActiveModule('ai-analyst')}
            >
              <Sparkles className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 animate-pulse" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Analyst</TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#0a0e1a]">
                3
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>3 new alerts</TooltipContent>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200"
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

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-8 rounded-full hover:bg-white/[0.06] transition-all duration-200"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-[#0077B6]/20 text-[#0077B6] text-xs font-semibold border border-[#0077B6]/30">
                  SA
                </AvatarFallback>
              </Avatar>
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
            <DropdownMenuItem className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06]">
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06]">
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-400 focus:text-zinc-200 focus:bg-white/[0.06]">
              <Bot className="mr-2 size-4" />
              AI Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
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
        title="Search Modules"
        description="Navigate to any module in CivicLens SA"
      >
        <CommandInput placeholder="Type a module name..." />
        <CommandList>
          <CommandEmpty>No modules found.</CommandEmpty>
          {(['MVP', 'Phase 2', 'Phase 3'] as const).map((phase) => {
            const phaseModules = MODULES.filter((m) => m.phase === phase);
            if (phaseModules.length === 0) return null;
            return (
              <CommandGroup key={phase} heading={phase}>
                {phaseModules.map((mod) => (
                  <CommandItem
                    key={mod.id}
                    value={mod.name}
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
