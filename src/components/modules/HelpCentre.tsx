'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Rocket,
  Keyboard,
  Mail,
  GitBranch,
  Shield,
  Building2,
  FileSearch,
  Bot,
  Map,
  Check,
  Search,
  ExternalLink,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  Globe,
  Github,
  Linkedin,
  Twitter,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

// ── Constants ───────────────────────────────────────────────────────────────

const MODULE_COLOR = '#64748B';

// ── Kbd component ───────────────────────────────────────────────────────────

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[22px] h-[22px]',
        'bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5',
        'text-[11px] font-mono text-zinc-300 leading-none',
        className
      )}
    >
      {children}
    </kbd>
  );
}

// ── Help Card wrapper ───────────────────────────────────────────────────────

function HelpCard({
  title,
  icon: Icon,
  children,
  className,
  accentColor,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
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
            background: `linear-gradient(90deg, ${accentColor || MODULE_COLOR}, transparent)`,
          }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <div
              className="flex size-7 items-center justify-center rounded-lg"
              style={{
                background: `${accentColor || MODULE_COLOR}15`,
                border: `1px solid ${accentColor || MODULE_COLOR}30`,
              }}
            >
              <Icon className="size-3.5" style={{ color: accentColor || MODULE_COLOR }} />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

// ── FAQ Data ────────────────────────────────────────────────────────────────

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  categoryColor: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What data sources does CivicLens SA use?',
    answer:
      'CivicLens SA aggregates data from multiple authoritative South African sources including the Municipal Finance Management Act (MFMA) reports, National Treasury municipal audit data, Auditor-General of South Africa (AGSA) outcomes, Statistics South Africa (Stats SA) Census and Community Survey data, eTender Portal procurement records, and the Central Supplier Database (CSD). All data is verified against official publications and updated on a regular cycle.',
    category: 'Data',
    categoryColor: '#3B82F6',
  },
  {
    id: 'faq-2',
    question: 'How often is the data updated?',
    answer:
      'Data refresh rates vary by source: Tender and procurement data is updated in near real-time (every 15 minutes) from the eTender Portal. Financial data (MFMA Section 71 reports) is updated quarterly as National Treasury releases new cycles. Audit outcomes are updated annually following AGSA reporting. Census and demographic data follows the Stats SA release schedule (typically every 5 years for full Census, annually for mid-year estimates). Risk signals are recalculated every 30 minutes.',
    category: 'Data',
    categoryColor: '#3B82F6',
  },
  {
    id: 'faq-3',
    question: 'What is the Financial Health Score?',
    answer:
      'The Financial Health Score (FHS) is a proprietary 0-100 composite index that measures the overall financial sustainability of a municipality. It combines multiple weighted indicators including: cash coverage ratio (20%), debtor collection rate (15%), operating surplus margin (15%), capital expenditure ratio (10%), audit outcome weighting (15%), debt service coverage (10%), and grant dependency ratio (15%). Scores above 65 indicate healthy finances, 45-64 show moderate risk, 25-44 indicate distress, and below 25 signals critical financial failure.',
    category: 'Scoring',
    categoryColor: '#10B981',
  },
  {
    id: 'faq-4',
    question: 'How does the AI Analyst work?',
    answer:
      'The AI Analyst uses a large language model (LLM) fine-tuned on South African public-sector data to provide contextual analysis and insights. It processes your questions in natural language, retrieves relevant municipal, tender, and financial data, and generates responses with source citations. The AI operates in full POPIA (Protection of Personal Information Act) compliance — personal data is anonymised before processing, and responses are filtered to exclude personally identifiable information. Four persona modes (Citizen, Analyst, Journalist, Government) tailor the response depth and language style.',
    category: 'AI',
    categoryColor: '#0F766E',
  },
  {
    id: 'faq-5',
    question: 'What is Section 139?',
    answer:
      'Section 139 of the Constitution of the Republic of South Africa (Act 108 of 1996) provides for provincial intervention in local government. When a municipality cannot or does not fulfil an executive obligation in terms of legislation, the relevant provincial executive may intervene by: (1) Issuing a directive describing the extent of failure and remedial actions (Section 139(1)(a)); (2) Assuming responsibility for the relevant obligation (Section 139(1)(b)); or (3) Dissolving the Municipal Council and appointing an administrator (Section 139(1)(c)). As of the current reporting period, 43 municipalities are under some form of Section 139 intervention.',
    category: 'Legal',
    categoryColor: '#EF4444',
  },
  {
    id: 'faq-6',
    question: 'How are risk signals generated?',
    answer:
      'Risk signals are generated through threshold-based anomaly detection. Our engine continuously monitors over 50 financial and operational indicators for each of South Africa\'s 257 municipalities. When an indicator crosses a predefined threshold (e.g., cash coverage drops below 30 days, debtor collection rate falls under 80%, or irregular expenditure exceeds 10% of operating budget), a signal is triggered. Signals are classified by severity: Critical (immediate intervention required), High (significant risk), Medium (monitoring needed), and Low (minor deviation). Each signal includes the indicator value, the threshold breached, and a confidence score.',
    category: 'Scoring',
    categoryColor: '#10B981',
  },
  {
    id: 'faq-7',
    question: 'Can I export data?',
    answer:
      'Yes. CivicLens SA supports data export in multiple formats: CSV (comma-separated values) for spreadsheet analysis, PDF for formatted reports and presentations, and Excel (.xlsx) for detailed data workbooks. You can export individual municipality profiles, tender listings, risk signal reports, and dashboard views. The ReportLens module provides advanced export options including white-labelled documents, custom date ranges, and section selection. All exports are POPIA-compliant and exclude personal information unless explicitly authorised.',
    category: 'Features',
    categoryColor: '#8B5CF6',
  },
  {
    id: 'faq-8',
    question: 'Is my data POPIA compliant?',
    answer:
      'Yes. CivicLens SA is fully compliant with the Protection of Personal Information Act (POPIA, Act 4 of 2013). All data is processed and stored within South African borders (data residency). Personal information is anonymised or pseudonymised before processing. We maintain three compliance levels: Standard (default business rules), Enhanced (reduced data retention, stricter cross-referencing limits), and Strict (maximum privacy, no cross-entity analysis). Our Information Officer is registered with the Information Regulator, and we conduct annual POPIA impact assessments.',
    category: 'Legal',
    categoryColor: '#EF4444',
  },
  {
    id: 'faq-9',
    question: 'What municipalities are monitored?',
    answer:
      'CivicLens SA monitors all 257 municipalities in South Africa, comprising 8 Category A (Metropolitan) municipalities, 205 Category B (Local) municipalities, and 44 Category C (District) municipalities. This includes all 9 provincial jurisdictions: Eastern Cape, Free State, Gauteng, KwaZulu-Natal, Limpopo, Mpumalanga, Northern Cape, North West, and Western Cape. Coverage is comprehensive across all financial, service delivery, and procurement indicators for every municipality.',
    category: 'Data',
    categoryColor: '#3B82F6',
  },
  {
    id: 'faq-10',
    question: 'How do I navigate between modules?',
    answer:
      'You can navigate between modules in several ways: (1) Use the left sidebar to click on any module name; (2) Press Ctrl+K (or Cmd+K on Mac) to open the command palette and search for a module; (3) Use keyboard shortcuts — press G followed by a letter (G+D for Dashboard, G+T for TenderLens, G+M for MuniLens, G+G for GeoLens, G+A for AI Analyst); (4) Press number keys 1-9 for quick module switching; (5) Press ? to view all keyboard shortcuts. The sidebar can be collapsed using Ctrl+B for more screen space.',
    category: 'Features',
    categoryColor: '#8B5CF6',
  },
  {
    id: 'faq-11',
    question: 'What do the phase badges mean?',
    answer:
      'Phase badges indicate the development roadmap stage of each module: MVP (Minimum Viable Product) — currently live with full functionality, coloured green in the sidebar. Phase 2 (P2) — planned for the next release cycle, with partial functionality available, shown in amber. Phase 3 (P3) — future development, currently showing placeholder views, displayed in slate/grey. The current MVP includes Dashboard, TenderLens, MuniLens, GeoLens, AI Analyst, and ReportLens. Phase 2 adds RiskLens, ElectionLens, PolicyLens, PeopleLens, ServiceLens, and AGASAlert. Phase 3 introduces EarlyAlert, GrantLens, BudgetLens, CarbonLens, and DataHub.',
    category: 'Features',
    categoryColor: '#8B5CF6',
  },
  {
    id: 'faq-12',
    question: 'How do I customize my dashboard?',
    answer:
      'Navigate to the Settings module (click the gear icon in the sidebar or press Ctrl+K and search "Settings") to customize your experience. Available options include: default module on login, data refresh interval, number/currency/date formatting, notification preferences (risk signals, tender deadlines, Section 139 updates), AI persona and response length, POPIA data handling level, and display preferences. Your settings persist across sessions and are stored securely in compliance with POPIA.',
    category: 'Features',
    categoryColor: '#8B5CF6',
  },
];

// ── Keyboard Shortcuts Data ─────────────────────────────────────────────────

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Search modules' },
      { keys: ['?'], description: 'Show shortcuts' },
      { keys: ['1–9'], description: 'Quick switch to module (1=Dashboard, 2=TenderLens, …)' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'T'], description: 'Go to TenderLens' },
      { keys: ['G', 'M'], description: 'Go to MuniLens' },
      { keys: ['G', 'G'], description: 'Go to GeoLens' },
      { keys: ['G', 'A'], description: 'Go to AI Analyst' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { keys: ['Ctrl', 'R'], description: 'Refresh data' },
      { keys: ['Ctrl', 'E'], description: 'Export data' },
      { keys: ['Ctrl', '/'], description: 'Focus search' },
      { keys: ['Esc'], description: 'Close dialog/panel' },
    ],
  },
  {
    title: 'View',
    items: [
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', '⇧', 'D'], description: 'Toggle dark mode' },
    ],
  },
];

// ── Changelog Data ──────────────────────────────────────────────────────────

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
  isCurrent?: boolean;
}

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v2.4.0',
    date: '03 March 2026',
    highlights: [
      'AI Analyst Integration with 4 persona modes',
      'Enhanced Dashboard with 6 KPI cards and national overview',
      'Settings Module with 6 configuration tabs',
      'Help Centre with documentation and FAQ',
      'Keyboard shortcuts system with G-sequence navigation',
    ],
    isCurrent: true,
  },
  {
    version: 'v2.3.0',
    date: '14 February 2026',
    highlights: [
      'GeoLens Province Rankings with interactive cards',
      'Election Intelligence Packs for 2026 LGE',
      'Manifesto vs Reality Tracker',
      'Ward Accountability Map',
    ],
  },
  {
    version: 'v2.2.0',
    date: '28 January 2026',
    highlights: [
      'MuniLens 8-Tab Municipal Profile',
      'MFMA Section 139 Trigger Panel',
      'Financial Health Score composite index',
      'Demographics age pyramid visualization',
    ],
  },
  {
    version: 'v2.1.0',
    date: '10 January 2026',
    highlights: [
      'TenderLens AI Recommendations',
      'Confidence Scoring for bid analysis',
      'Buyer Intelligence Panel',
      'Supplier B-BBEE Diversity charts',
    ],
  },
  {
    version: 'v2.0.0',
    date: '01 December 2025',
    highlights: [
      'Initial MVP Launch',
      '6 Core Modules (Dashboard, TenderLens, MuniLens, GeoLens, AI Analyst, ReportLens)',
      'Real-time risk signal detection',
      'South African POPIA compliance framework',
    ],
  },
];

// ── Contact Data ────────────────────────────────────────────────────────────

interface ContactCard {
  title: string;
  email: string;
  description: string;
  responseTime: string;
  icon: React.ElementType;
  color: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    title: 'Technical Support',
    email: 'support@civiclens.gov.za',
    description: 'Get help with platform issues, bug reports, and technical questions.',
    responseTime: '24h',
    icon: Zap,
    color: '#3B82F6',
  },
  {
    title: 'Sales & Licensing',
    email: 'sales@civiclens.gov.za',
    description: 'Enterprise licensing, custom deployments, and partnership inquiries.',
    responseTime: '48h',
    icon: Globe,
    color: '#8B5CF6',
  },
  {
    title: 'Data Requests',
    email: 'data@civiclens.gov.za',
    description: 'Custom data extracts, API access, and bulk dataset requests.',
    responseTime: '72h',
    icon: FileSearch,
    color: '#10B981',
  },
  {
    title: 'Report a Bug',
    email: 'bugs@civiclens.gov.za',
    description: 'Submit bug reports with reproduction steps for faster resolution.',
    responseTime: '24h',
    icon: Activity,
    color: '#EF4444',
  },
];

// ── Feature Highlight Data ──────────────────────────────────────────────────

const FEATURE_HIGHLIGHTS = [
  {
    icon: Building2,
    title: 'Real-time Municipal Intelligence',
    description: 'Monitor all 257 SA municipalities with live financial, service delivery, and risk indicators.',
    accentColor: '#3B82F6',
  },
  {
    icon: FileSearch,
    title: 'Procurement Monitoring',
    description: 'Track tenders, supplier patterns, and B-BBEE compliance across government procurement.',
    accentColor: '#10B981',
  },
  {
    icon: Bot,
    title: 'AI-powered Analysis',
    description: 'Ask questions in natural language and get contextual insights with source citations.',
    accentColor: '#0F766E',
  },
  {
    icon: Map,
    title: 'Spatial Analytics',
    description: 'Interactive choropleth maps with provincial rankings and multi-indicator comparisons.',
    accentColor: '#D97706',
  },
];

// ── Tab 1: Getting Started ──────────────────────────────────────────────────

function GettingStartedTab() {
  const { setActiveModule } = useNavigationStore();

  const quickStartSteps = [
    'Explore the Dashboard Command Centre for a national overview of municipal intelligence.',
    'Use TenderLens to search and analyse procurement data with AI-powered recommendations.',
    'Dive into MuniLens for in-depth 8-tab municipal profiles with financial and service data.',
    'Visualise provincial comparisons in GeoLens with interactive choropleth maps.',
    'Ask the AI Analyst anything about South African public-sector data — it cites sources.',
  ];

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      {/* Welcome Card */}
      <HelpCard title="Welcome to CivicLens SA" icon={Rocket} accentColor={MODULE_COLOR}>
        <div className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            CivicLens SA is the intelligence layer for South Africa&apos;s public sector. Access real-time
            municipal financials, procurement intelligence, risk signals, and AI-powered analysis — all
            from a single, integrated platform.
          </p>
          <Separator className="bg-white/[0.06]" />
          <div>
            <p className="text-xs font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Quick-start Steps</p>
            <div className="space-y-2.5">
              {quickStartSteps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="flex size-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      background: `${MODULE_COLOR}20`,
                      color: MODULE_COLOR,
                      border: `1px solid ${MODULE_COLOR}30`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed pt-0.5">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </HelpCard>

      {/* What is CivicLens SA? */}
      <HelpCard title="What is CivicLens SA?" icon={Shield} accentColor="#0077B6">
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 leading-relaxed">
            CivicLens SA is a premium public-sector intelligence platform designed for South African
            government analysts, policymakers, and oversight bodies. It synthesises data from the
            Municipal Finance Management Act (MFMA) reports, Auditor-General of South Africa (AGSA)
            outcomes, National Treasury datasets, Statistics South Africa (Stats SA) publications,
            and the eTender Portal into a unified, actionable intelligence layer.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-blue-500/30 text-blue-400 bg-blue-500/10">
              MFMA Compliant
            </Badge>
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              POPIA Compliant
            </Badge>
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
              257 Municipalities
            </Badge>
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-teal-500/30 text-teal-400 bg-teal-500/10">
              AI-Powered
            </Badge>
          </div>
        </div>
      </HelpCard>

      {/* Feature Highlight Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {FEATURE_HIGHLIGHTS.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} variants={staggerItem}>
              <Card
                className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden hover:border-white/[0.12] transition-all duration-300 group h-full"
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    background: `linear-gradient(135deg, ${feature.accentColor}40, transparent 60%)`,
                  }}
                />
                <CardContent className="relative p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `${feature.accentColor}15`,
                        border: `1px solid ${feature.accentColor}30`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: feature.accentColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{feature.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Card */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, ${MODULE_COLOR}, #0077B6, transparent)`,
            }}
          />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-200">Ready to dive in?</h3>
                <p className="text-sm text-zinc-500">
                  Launch the Command Centre Dashboard for a full national overview.
                </p>
              </div>
              <Button
                onClick={() => setActiveModule('dashboard')}
                className="gap-2 bg-[#64748B] hover:bg-[#64748B]/80 text-white shrink-0"
              >
                Open Dashboard
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 2: FAQ ──────────────────────────────────────────────────────────────

function FAQTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const query = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      {/* Search filter */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
            }}
          />
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="w-full pl-10 bg-white/[0.04] border-white/[0.08] text-zinc-200 text-sm focus:border-[#64748B]/50 focus:ring-[#64748B]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-zinc-500 mt-2">
                Showing {filteredFaqs.length} of {FAQ_ITEMS.length} questions
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Accordion */}
      <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
        <div
          className="h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
          }}
        />
        <CardContent className="p-4">
          {filteredFaqs.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Search className="size-8 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-400 font-medium">No matching questions found</p>
              <p className="text-xs text-zinc-600 mt-1">Try a different search term</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-white/[0.06] last:border-b-0"
                >
                  <AccordionTrigger className="text-left hover:no-underline hover:bg-white/[0.02] px-2 rounded-md group">
                    <div className="flex items-start gap-3 pr-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] h-5 px-1.5 shrink-0 mt-0.5"
                        style={{
                          borderColor: `${faq.categoryColor}30`,
                          color: faq.categoryColor,
                          background: `${faq.categoryColor}10`,
                        }}
                      >
                        {faq.category}
                      </Badge>
                      <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="pl-[68px]">
                      <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 3: Keyboard Shortcuts ───────────────────────────────────────────────

function KeyboardShortcutsTab() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      {/* Hint note */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
            }}
          />
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{
                  background: `${MODULE_COLOR}15`,
                  border: `1px solid ${MODULE_COLOR}30`,
                }}
              >
                <Keyboard className="size-4" style={{ color: MODULE_COLOR }} />
              </div>
              <p className="text-sm text-zinc-400">
                Press <Kbd className="mx-1">?</Kbd> anywhere to open the keyboard shortcuts overlay
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shortcut groups */}
      {SHORTCUT_GROUPS.map((group) => (
        <motion.div key={group.title} variants={cardFadeIn} initial="hidden" animate="show">
          <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
            <div
              className="h-[2px] opacity-60"
              style={{
                background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
              }}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-sm text-zinc-300">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && (
                            <span className="text-[10px] text-zinc-600 mx-0.5">
                              {item.keys.length === 2 && item.keys[0] === 'G' ? 'then' : '+'}
                            </span>
                          )}
                          <Kbd>{key}</Kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Tab 4: Contact & Support ────────────────────────────────────────────────

function ContactSupportTab() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      {/* Contact cards grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {CONTACT_CARDS.map((contact) => {
          const Icon = contact.icon;
          return (
            <motion.div key={contact.title} variants={staggerItem}>
              <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden h-full">
                <div
                  className="h-[2px] opacity-60"
                  style={{
                    background: `linear-gradient(90deg, ${contact.color}, transparent)`,
                  }}
                />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `${contact.color}15`,
                        border: `1px solid ${contact.color}30`,
                      }}
                    >
                      <Icon className="size-4" style={{ color: contact.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-200">{contact.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed mt-1">{contact.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-zinc-300 transition-colors hover:underline"
                    >
                      <Mail className="size-3" />
                      {contact.email}
                    </a>
                    <Badge
                      variant="outline"
                      className="text-[9px] h-5 px-1.5 border-white/[0.08] text-zinc-400 bg-white/[0.03]"
                    >
                      <Clock className="size-2.5 mr-1" />
                      {contact.responseTime}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* System Status Card */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, #10B981, transparent)`,
            }}
          />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Activity className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">System Status</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">All services operational and monitored</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] h-5 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                >
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Office Address */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
            }}
          />
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `${MODULE_COLOR}15`,
                  border: `1px solid ${MODULE_COLOR}30`,
                }}
              >
                <MapPin className="size-4" style={{ color: MODULE_COLOR }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Office Address</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Carter Digitals (Pty) Ltd<br />
                  Sandton, Gauteng<br />
                  South Africa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Links */}
      <motion.div variants={cardFadeIn} initial="hidden" animate="show">
        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden">
          <div
            className="h-[2px] opacity-60"
            style={{
              background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
            }}
          />
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Follow Us</p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/civiclens_sa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <Twitter className="size-3.5" />
                <span className="hidden sm:inline">Twitter/X</span>
              </a>
              <a
                href="https://linkedin.com/company/civiclens-sa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <Linkedin className="size-3.5" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="https://github.com/civiclens-sa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <Github className="size-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ── Tab 5: Changelog ────────────────────────────────────────────────────────

function ChangelogTab() {
  return (
    <motion.div variants={tabContentVariants} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Vertical timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[#64748B]/40 via-[#64748B]/20 to-transparent" />

        <div className="space-y-0">
          {CHANGELOG_ENTRIES.map((entry, index) => (
            <motion.div key={entry.version} variants={staggerItem} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0 mt-1">
                <div
                  className={cn(
                    'size-[10px] rounded-full border-2 z-10 relative',
                    entry.isCurrent
                      ? 'bg-[#64748B] border-[#64748B]'
                      : 'bg-[#0a0e1a] border-[#64748B]/40'
                  )}
                />
                {entry.isCurrent && (
                  <div className="absolute inset-0 size-[10px] rounded-full bg-[#64748B] animate-ping opacity-30" />
                )}
              </div>

              {/* Content card */}
              <Card
                className={cn(
                  'bg-white/[0.02] border-white/[0.08] backdrop-blur-sm overflow-hidden flex-1',
                  entry.isCurrent && 'border-[#64748B]/20'
                )}
              >
                {/* Accent line */}
                {entry.isCurrent && (
                  <div
                    className="h-[2px] opacity-60"
                    style={{
                      background: `linear-gradient(90deg, ${MODULE_COLOR}, transparent)`,
                    }}
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] h-6 px-2 font-mono font-bold',
                        entry.isCurrent
                          ? 'border-[#64748B]/30 text-[#64748B] bg-[#64748B]/10'
                          : 'border-white/[0.08] text-zinc-400 bg-white/[0.03]'
                      )}
                    >
                      {entry.version}
                    </Badge>
                    {entry.isCurrent && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-5 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      >
                        Latest
                      </Badge>
                    )}
                    <span className="text-[11px] text-zinc-600">{entry.date}</span>
                  </div>

                  <ul className="space-y-1.5 mt-3">
                    {entry.highlights.map((highlight, hi) => (
                      <li key={hi} className="flex items-start gap-2">
                        <Check className="size-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
                        <span className="text-sm text-zinc-400 leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Help Centre Page ───────────────────────────────────────────────────

export default function HelpCentre() {
  const [activeTab, setActiveTab] = useState('getting-started');

  const tabConfig = [
    { value: 'getting-started', label: 'Getting Started', icon: Rocket },
    { value: 'faq', label: 'FAQ', icon: HelpCircle },
    { value: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { value: 'contact', label: 'Contact', icon: Mail },
    { value: 'changelog', label: 'Changelog', icon: GitBranch },
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
            <HelpCircle className="size-5" style={{ color: MODULE_COLOR }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Help Centre</h1>
            <p className="text-xs text-zinc-500">Documentation, FAQ, and support resources</p>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 h-auto flex-wrap">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-zinc-100 text-zinc-500 text-xs sm:text-sm gap-1.5 px-2 sm:px-3"
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="getting-started">
          <GettingStartedTab />
        </TabsContent>
        <TabsContent value="faq">
          <FAQTab />
        </TabsContent>
        <TabsContent value="shortcuts">
          <KeyboardShortcutsTab />
        </TabsContent>
        <TabsContent value="contact">
          <ContactSupportTab />
        </TabsContent>
        <TabsContent value="changelog">
          <ChangelogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
