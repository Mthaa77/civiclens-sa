'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Palette,
  Bell,
  Bot,
  Shield,
  Info,
  Save,
  RotateCcw,
  Download,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Clock,
  FileText,
  Lock,
  Scale,
  Code2,
  Heart,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// ── Animation Variants ──────────────────────────────────────────────────────

const tabContentVariants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

const cardFadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

// ── Constants ───────────────────────────────────────────────────────────────

const MODULE_COLOR = '#64748B';

const ALL_MODULES = MODULES.map((m) => ({ value: m.id, label: m.name }));

const TIME_ZONES = [
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST, UTC+2)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET, UTC+2)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT, UTC+1)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (EST, UTC-5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'zu', label: 'Zulu (isiZulu)' },
  { value: 'xh', label: 'Xhosa (isiXhosa)' },
];

const ROLES = [
  { value: 'Analyst', label: 'Analyst' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Administrator', label: 'Administrator' },
];

const REFRESH_INTERVALS = [
  { value: '5', label: '5 seconds' },
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '60 seconds' },
  { value: 'manual', label: 'Manual only' },
];

const NUMBER_FORMATS = [
  { value: 'sa', label: 'SA English (1 234 567,89)' },
  { value: 'us', label: 'US (1,234,567.89)' },
  { value: 'eu', label: 'EU (1.234.567,89)' },
];

const CURRENCY_DISPLAYS = [
  { value: 'symbol', label: 'R symbol (R478B)' },
  { value: 'prefix', label: 'ZAR prefix (ZAR 478B)' },
  { value: 'full', label: 'Full notation (R478,000,000,000)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (05/03/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-03-05)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (03/05/2026)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (05-Mar-2026)' },
];

const AI_PERSONAS = [
  { value: 'Citizen', label: 'Citizen' },
  { value: 'Analyst', label: 'Analyst' },
  { value: 'Journalist', label: 'Journalist' },
  { value: 'Government', label: 'Government' },
];

const AI_RESPONSE_LENGTHS = [
  { value: 'concise', label: 'Concise' },
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Detailed' },
];

const POPIA_LEVELS = [
  { value: 'standard', label: 'Standard' },
  { value: 'enhanced', label: 'Enhanced' },
  { value: 'strict', label: 'Strict' },
];

const DATA_RETENTION_PERIODS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: 'indefinite', label: 'Indefinite' },
];

// ── Default Settings ────────────────────────────────────────────────────────

interface SettingsState {
  // General
  displayName: string;
  email: string;
  role: string;
  language: string;
  timeZone: string;
  // Display
  defaultModule: string;
  refreshInterval: string;
  numberFormat: string;
  currencyDisplay: string;
  dateFormat: string;
  compactNumbers: boolean;
  showPhaseModules: boolean;
  // Notifications
  desktopNotifications: boolean;
  emailNotifications: boolean;
  riskSignalAlerts: boolean;
  tenderDeadlines: boolean;
  section139Updates: boolean;
  auditOutcomeChanges: boolean;
  municipalDistressAlerts: boolean;
  weeklyDigest: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  // AI
  aiPersona: string;
  aiResponseLength: string;
  includeSourceCitations: boolean;
  autoSuggestFollowups: boolean;
  popiaLevel: string;
  // Data & Privacy
  dataRetentionPeriod: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  displayName: 'Senior Analyst',
  email: 'analyst@civiclens.gov.za',
  role: 'Analyst',
  language: 'en',
  timeZone: 'Africa/Johannesburg',
  defaultModule: 'dashboard',
  refreshInterval: '30',
  numberFormat: 'sa',
  currencyDisplay: 'symbol',
  dateFormat: 'DD/MM/YYYY',
  compactNumbers: true,
  showPhaseModules: true,
  desktopNotifications: true,
  emailNotifications: false,
  riskSignalAlerts: true,
  tenderDeadlines: true,
  section139Updates: true,
  auditOutcomeChanges: false,
  municipalDistressAlerts: true,
  weeklyDigest: false,
  quietHoursFrom: '22:00',
  quietHoursTo: '07:00',
  aiPersona: 'Analyst',
  aiResponseLength: 'standard',
  includeSourceCitations: true,
  autoSuggestFollowups: true,
  popiaLevel: 'enhanced',
  dataRetentionPeriod: '90',
};

// ── Setting Row Component ───────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <div className="space-y-0.5 min-w-0 flex-1">
        <Label className="text-sm font-medium text-zinc-200">{label}</Label>
        {description && (
          <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Settings Section Card ───────────────────────────────────────────────────

function SettingsCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={cardFadeIn} initial="hidden" animate="show">
      <Card
        className={cn(
          'bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden',
          className
        )}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
          }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <div
              className="flex size-7 items-center justify-center rounded-lg"
              style={{
                background: `${MODULE_COLOR}15`,
                border: `1px solid ${MODULE_COLOR}30`,
              }}
            >
              <Icon className="size-3.5" style={{ color: MODULE_COLOR }} />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-white/[0.06]">{children}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 1: General Settings ─────────────────────────────────────────────────

function GeneralTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="Profile Information" icon={Settings}>
        <SettingRow label="Display Name" description="Your name as shown across the platform">
          <Input
            value={settings.displayName}
            onChange={(e) => update('displayName', e.target.value)}
            className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm focus:border-[#64748B]/50 focus:ring-[#64748B]/20"
          />
        </SettingRow>
        <SettingRow label="Email Address" description="Used for notifications and account recovery">
          <Input
            value={settings.email}
            onChange={(e) => update('email', e.target.value)}
            type="email"
            className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm focus:border-[#64748B]/50 focus:ring-[#64748B]/20"
          />
        </SettingRow>
        <SettingRow label="Role" description="Determines access level and available features">
          <Select value={settings.role} onValueChange={(v) => update('role', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Regional Settings" icon={Clock}>
        <SettingRow label="Language" description="Interface language preference">
          <Select value={settings.language} onValueChange={(v) => update('language', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Time Zone" description="All timestamps will display in this zone">
          <Select value={settings.timeZone} onValueChange={(v) => update('timeZone', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {TIME_ZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>
    </motion.div>
  );
}

// ── Tab 2: Display Preferences ──────────────────────────────────────────────

function DisplayTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="Module Defaults" icon={Palette}>
        <SettingRow label="Default Module" description="Module shown when you first log in">
          <Select value={settings.defaultModule} onValueChange={(v) => update('defaultModule', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {ALL_MODULES.map((mod) => (
                <SelectItem key={mod.value} value={mod.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {mod.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Data Refresh Interval" description="How often dashboard data auto-refreshes">
          <Select value={settings.refreshInterval} onValueChange={(v) => update('refreshInterval', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {REFRESH_INTERVALS.map((ri) => (
                <SelectItem key={ri.value} value={ri.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {ri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Show Phase 2/3 Modules" description="Display upcoming module placeholders in sidebar">
          <Switch
            checked={settings.showPhaseModules}
            onCheckedChange={(v) => update('showPhaseModules', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Number & Currency Formatting" icon={Code2}>
        <SettingRow label="Number Format" description="Thousand separator and decimal notation">
          <Select value={settings.numberFormat} onValueChange={(v) => update('numberFormat', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {NUMBER_FORMATS.map((nf) => (
                <SelectItem key={nf.value} value={nf.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {nf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Currency Display" description="How South African Rand values appear">
          <Select value={settings.currencyDisplay} onValueChange={(v) => update('currencyDisplay', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {CURRENCY_DISPLAYS.map((cd) => (
                <SelectItem key={cd.value} value={cd.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {cd.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Compact Numbers" description="Show 1.2M instead of 1,200,000">
          <Switch
            checked={settings.compactNumbers}
            onCheckedChange={(v) => update('compactNumbers', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Date & Time" icon={Clock}>
        <SettingRow label="Date Format" description="How dates are displayed across the platform">
          <Select value={settings.dateFormat} onValueChange={(v) => update('dateFormat', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {DATE_FORMATS.map((df) => (
                <SelectItem key={df.value} value={df.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {df.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>
    </motion.div>
  );
}

// ── Tab 3: Notifications ────────────────────────────────────────────────────

function NotificationsTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const notificationCategories = [
    { key: 'riskSignalAlerts' as const, label: 'Risk Signal Alerts', description: 'Procurement anomalies and financial distress signals', icon: AlertTriangle },
    { key: 'tenderDeadlines' as const, label: 'Tender Deadlines', description: 'Upcoming tender closing dates for watched tenders', icon: Clock },
    { key: 'section139Updates' as const, label: 'Section 139 Updates', description: 'Municipal intervention status changes', icon: Scale },
    { key: 'auditOutcomeChanges' as const, label: 'Audit Outcome Changes', description: 'AGSA audit outcome releases and regressions', icon: FileText },
    { key: 'municipalDistressAlerts' as const, label: 'Municipal Distress Alerts', description: 'Early warning signals for at-risk municipalities', icon: Shield },
  ];

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="Notification Channels" icon={Bell}>
        <SettingRow label="Desktop Notifications" description="Show browser push notifications for alerts">
          <Switch
            checked={settings.desktopNotifications}
            onCheckedChange={(v) => update('desktopNotifications', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
        <SettingRow label="Email Notifications" description="Receive alert summaries via email">
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(v) => update('emailNotifications', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Alert Categories" icon={AlertTriangle}>
        {notificationCategories.map((cat) => (
          <SettingRow key={cat.key} label={cat.label} description={cat.description}>
            <div className="flex items-center gap-3">
              <cat.icon className="size-3.5 text-zinc-600 hidden sm:block" />
              <Switch
                checked={settings[cat.key]}
                onCheckedChange={(v) => update(cat.key, v)}
                className="data-[state=checked]:bg-[#64748B]"
              />
            </div>
          </SettingRow>
        ))}
        <SettingRow label="Weekly Digest" description="Summary of key insights delivered every Monday">
          <Switch
            checked={settings.weeklyDigest}
            onCheckedChange={(v) => update('weeklyDigest', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Quiet Hours" icon={Clock}>
        <div className="flex items-center gap-4 py-3">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">From</Label>
            <Input
              type="time"
              value={settings.quietHoursFrom}
              onChange={(e) => update('quietHoursFrom', e.target.value)}
              className="w-32 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm focus:border-[#64748B]/50 focus:ring-[#64748B]/20"
            />
          </div>
          <span className="text-zinc-600 mt-5">—</span>
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">To</Label>
            <Input
              type="time"
              value={settings.quietHoursTo}
              onChange={(e) => update('quietHoursTo', e.target.value)}
              className="w-32 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm focus:border-[#64748B]/50 focus:ring-[#64748B]/20"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-5 hidden sm:block">Notifications paused during these hours</p>
        </div>
      </SettingsCard>
    </motion.div>
  );
}

// ── Tab 4: AI Preferences ───────────────────────────────────────────────────

function AITab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="AI Persona & Response" icon={Bot}>
        <SettingRow label="Default AI Persona" description="Sets the analysis perspective for AI responses">
          <Select value={settings.aiPersona} onValueChange={(v) => update('aiPersona', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {AI_PERSONAS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="AI Response Length" description="Default detail level for AI-generated answers">
          <Select value={settings.aiResponseLength} onValueChange={(v) => update('aiResponseLength', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {AI_RESPONSE_LENGTHS.map((rl) => (
                <SelectItem key={rl.value} value={rl.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {rl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="Include Source Citations" description="Show data sources alongside AI responses">
          <Switch
            checked={settings.includeSourceCitations}
            onCheckedChange={(v) => update('includeSourceCitations', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
        <SettingRow label="Auto-suggest Follow-ups" description="AI suggests relevant follow-up questions">
          <Switch
            checked={settings.autoSuggestFollowups}
            onCheckedChange={(v) => update('autoSuggestFollowups', v)}
            className="data-[state=checked]:bg-[#64748B]"
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="POPIA Data Handling" icon={Shield}>
        <SettingRow
          label="POPIA Data Handling Level"
          description="Controls how personal data is processed in AI responses per the Protection of Personal Information Act"
        >
          <Select value={settings.popiaLevel} onValueChange={(v) => update('popiaLevel', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {POPIA_LEVELS.map((pl) => (
                <SelectItem key={pl.value} value={pl.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {pl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <div className="py-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3">
            <div className="flex items-start gap-2">
              <Lock className="size-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-400">POPIA Compliance Notice</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  All AI processing adheres to the Protection of Personal Information Act (Act 4 of 2013). 
                  Personal data is anonymised before processing. Enhanced and Strict modes further limit 
                  data retention and cross-referencing capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  );
}

// ── Tab 5: Data & Privacy ───────────────────────────────────────────────────

function DataPrivacyTab({ settings, setSettings }: { settings: SettingsState; setSettings: React.Dispatch<React.SetStateAction<SettingsState>> }) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    toast.success('Data export initiated', {
      description: 'Your data package will be ready for download in a few minutes.',
    });
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode', {
      description: 'This action would permanently delete your account and all associated data.',
    });
  };

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="Data Retention" icon={Clock}>
        <SettingRow
          label="Data Retention Period"
          description="How long your activity data and preferences are stored"
        >
          <Select value={settings.dataRetentionPeriod} onValueChange={(v) => update('dataRetentionPeriod', v)}>
            <SelectTrigger className="w-56 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1224] border-white/[0.08]">
              {DATA_RETENTION_PERIODS.map((dr) => (
                <SelectItem key={dr.value} value={dr.value} className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06]">
                  {dr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Export & Deletion" icon={Download}>
        <div className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-zinc-200">Export My Data</Label>
              <p className="text-xs text-zinc-500">Download all your data in a portable format (JSON/CSV)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="border-white/[0.10] text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] gap-2"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </div>
        <Separator className="bg-white/[0.06]" />
        <div className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-red-400">Delete Account</Label>
              <p className="text-xs text-zinc-500">Permanently delete your account and all associated data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0d1224] border-white/[0.08]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-100 flex items-center gap-2">
                    <AlertTriangle className="size-5 text-red-400" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action cannot be undone. This will permanently delete your account and remove all
                    your data from our servers, including saved searches, preferences, and AI chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/[0.10] text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Privacy & Compliance" icon={Shield}>
        <div className="py-3 space-y-4">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <Scale className="size-5 text-[#64748B] mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">POPIA Compliance</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  CivicLens SA is fully compliant with the Protection of Personal Information Act
                  (POPIA, Act 4 of 2013). All personal data is processed lawfully, minimally, and
                  with explicit consent. Data subjects have the right to access, correct, and delete
                  their personal information.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    POPIA Compliant
                  </Badge>
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-blue-500/30 text-blue-400 bg-blue-500/10">
                    ISO 27001
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs text-[#64748B] hover:text-zinc-300 transition-colors group">
            <ExternalLink className="size-3" />
            <span className="group-hover:underline">Read full Privacy Policy</span>
          </button>
        </div>
      </SettingsCard>
    </motion.div>
  );
}

// ── Tab 6: About ────────────────────────────────────────────────────────────

function AboutTab() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <SettingsCard title="Application Information" icon={Info}>
        <div className="py-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">App Version</p>
              <p className="text-sm font-semibold text-zinc-200 mt-0.5">2.4.1</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Build Number</p>
              <p className="text-sm font-semibold text-zinc-200 mt-0.5 font-mono">#2026.03.05-a3f7b</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Release Channel</p>
              <Badge variant="outline" className="text-[9px] h-5 px-1.5 mt-0.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                Stable
              </Badge>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Environment</p>
              <Badge variant="outline" className="text-[9px] h-5 px-1.5 mt-0.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
                Production
              </Badge>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="License Information" icon={FileText}>
        <div className="py-3 space-y-3">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">License Type</p>
            <p className="text-sm text-zinc-200 mt-0.5">Government Enterprise License</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Licensed To</p>
            <p className="text-sm text-zinc-200 mt-0.5">Republic of South Africa — National Treasury</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Valid Until</p>
            <p className="text-sm text-zinc-200 mt-0.5">31 March 2027</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Third-Party Attributions" icon={Heart}>
        <div className="py-3 space-y-2">
          {[
            { name: 'Next.js', version: '16', license: 'MIT' },
            { name: 'React', version: '19', license: 'MIT' },
            { name: 'Recharts', version: '2.x', license: 'MIT' },
            { name: 'Radix UI', version: 'Latest', license: 'MIT' },
            { name: 'Tailwind CSS', version: '4', license: 'MIT' },
            { name: 'Framer Motion', version: '11', license: 'MIT' },
            { name: 'Lucide Icons', version: 'Latest', license: 'ISC' },
            { name: 'Zustand', version: '5', license: 'MIT' },
            { name: 'Prisma', version: '6', license: 'Apache-2.0' },
          ].map((dep) => (
            <div key={dep.name} className="flex items-center justify-between py-1">
              <span className="text-xs text-zinc-400">{dep.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-600 font-mono">v{dep.version}</span>
                <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/[0.06] text-zinc-500">
                  {dep.license}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Contact & Support" icon={MessageSquare}>
        <div className="py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">Technical Support</span>
            </div>
            <button className="text-xs text-[#64748B] hover:text-zinc-300 transition-colors hover:underline">
              support@civiclens.gov.za
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">Feature Requests</span>
            </div>
            <button className="text-xs text-[#64748B] hover:text-zinc-300 transition-colors hover:underline">
              feedback@civiclens.gov.za
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">Documentation</span>
            </div>
            <button className="flex items-center gap-1 text-xs text-[#64748B] hover:text-zinc-300 transition-colors hover:underline">
              docs.civiclens.gov.za
              <ExternalLink className="size-2.5" />
            </button>
          </div>
        </div>
      </SettingsCard>
    </motion.div>
  );
}

// ── Main Settings Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({ ...DEFAULT_SETTINGS });
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    toast.info('Settings reset', {
      description: 'All preferences have been restored to their default values.',
    });
  };

  const tabConfig = [
    { value: 'general', label: 'General', icon: Settings },
    { value: 'display', label: 'Display', icon: Palette },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'ai', label: 'AI', icon: Bot },
    { value: 'privacy', label: 'Data & Privacy', icon: Shield },
    { value: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="space-y-6">
      {/* ── Module Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              background: `${MODULE_COLOR}15`,
              border: `1px solid ${MODULE_COLOR}30`,
            }}
          >
            <Settings className="size-5" style={{ color: MODULE_COLOR }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
            <p className="text-xs text-zinc-500">Manage your preferences and account configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-white/[0.10] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] gap-2"
          >
            <RotateCcw className="size-3.5" />
            Reset to Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-2 bg-[#64748B] hover:bg-[#64748B]/80 text-white"
          >
            <Save className="size-3.5" />
            Save Settings
          </Button>
        </div>
      </motion.div>

      {/* ── Settings Tabs ─────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-1 h-auto flex-wrap gap-0.5">
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-[#64748B]/20 data-[state=active]:text-zinc-100 data-[state=active]:border-[#64748B]/30 text-zinc-500"
            >
              <tab.icon className="size-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            <TabsContent value="general" forceMount={activeTab === 'general' ? true : undefined}>
              {activeTab === 'general' && <GeneralTab settings={settings} setSettings={setSettings} />}
            </TabsContent>
            <TabsContent value="display" forceMount={activeTab === 'display' ? true : undefined}>
              {activeTab === 'display' && <DisplayTab settings={settings} setSettings={setSettings} />}
            </TabsContent>
            <TabsContent value="notifications" forceMount={activeTab === 'notifications' ? true : undefined}>
              {activeTab === 'notifications' && <NotificationsTab settings={settings} setSettings={setSettings} />}
            </TabsContent>
            <TabsContent value="ai" forceMount={activeTab === 'ai' ? true : undefined}>
              {activeTab === 'ai' && <AITab settings={settings} setSettings={setSettings} />}
            </TabsContent>
            <TabsContent value="privacy" forceMount={activeTab === 'privacy' ? true : undefined}>
              {activeTab === 'privacy' && <DataPrivacyTab settings={settings} setSettings={setSettings} />}
            </TabsContent>
            <TabsContent value="about" forceMount={activeTab === 'about' ? true : undefined}>
              {activeTab === 'about' && <AboutTab />}
            </TabsContent>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
