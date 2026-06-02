'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Mic,
  Paperclip,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Search,
  FileText,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTED_PROMPTS, PROVINCE_SUMMARY, MOCK_MUNICIPALITIES, MOCK_TENDERS, MOCK_RISK_SIGNALS } from '@/lib/mock-data';
import { formatCompactZAR, formatNumber, formatPercent } from '@/lib/formatters';
import { useAIAnalystStore } from '@/store/ai-analyst';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { AIPersona, ChatMessage } from '@/types';

// ── Persona Config ───────────────────────────────────────────────────────────

interface PersonaConfig {
  id: AIPersona;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: 'Citizen',
    label: 'Citizen',
    icon: <User className="size-3.5" />,
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/25',
    description: 'Simple explanations of municipal performance and service delivery',
  },
  {
    id: 'Analyst',
    label: 'Analyst',
    icon: <TrendingUp className="size-3.5" />,
    color: '#0F766E',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/25',
    description: 'Deep analytical insights with data-driven comparisons',
  },
  {
    id: 'Journalist',
    label: 'Journalist',
    icon: <Search className="size-3.5" />,
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/25',
    description: 'Newsworthy findings with narrative context',
  },
  {
    id: 'Government',
    label: 'Government',
    icon: <BookOpen className="size-3.5" />,
    color: '#6366F1',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/25',
    description: 'Policy-oriented briefings with actionable recommendations',
  },
];

// ── Mock Response Generator ──────────────────────────────────────────────────

function generateMockResponse(question: string, persona: AIPersona): { content: string; sources: string[] } {
  const q = question.toLowerCase();
  const sources: string[] = [];

  // Municipality-related
  if (q.includes('municipal') || q.includes('muni') || q.includes('city') || q.includes('town')) {
    sources.push('Municipal Money API — National Treasury', 'Stats SA Census 2022', 'MFMA 2023/24 Audit Data');
    const muni = MOCK_MUNICIPALITIES[Math.floor(Math.random() * MOCK_MUNICIPALITIES.length)];
    if (persona === 'Citizen') {
      return {
        content: `Based on the latest data, **${muni.name}** has a Financial Health Score of **${muni.financialHealthScore}/100** and a Service Delivery Pressure Score of **${muni.serviceDeliveryScore}/100**. ${muni.financialHealthScore && muni.financialHealthScore >= 50 ? 'The municipality is performing relatively well financially.' : 'The municipality is facing significant financial challenges.'} Water access stands at **${muni.waterAccess}%** of households, and sanitation access is at **${muni.sanitationAccess}%**. ${muni.section139Status === 'Intervention' ? '⚠️ This municipality is currently under Section 139 intervention.' : muni.section139Status === 'Warning' ? '⚠️ This municipality is under a Section 139 warning.' : 'The municipality is not currently under Section 139 intervention.'}`,
        sources,
      };
    }
    return {
      content: `**${muni.name}** (${muni.code}) — Category ${muni.category} in ${muni.province}\n\n` +
        `| Metric | Value | Assessment |\n|--------|-------|------------|\n` +
        `| Financial Health Score | ${muni.financialHealthScore}/100 | ${muni.financialHealthScore && muni.financialHealthScore >= 65 ? 'Good' : muni.financialHealthScore && muni.financialHealthScore >= 45 ? 'Fair' : 'Poor'} |\n` +
        `| Service Delivery Pressure | ${muni.serviceDeliveryScore}/100 | ${muni.serviceDeliveryScore && muni.serviceDeliveryScore <= 30 ? 'Low' : muni.serviceDeliveryScore && muni.serviceDeliveryScore <= 55 ? 'Moderate' : 'High'} |\n` +
        `| Cash Coverage | ${muni.cashCoverageDays} days | ${muni.cashCoverageDays && muni.cashCoverageDays < 30 ? '⚠️ Below 30-day threshold' : 'Above threshold'} |\n` +
        `| Debtor Collection | ${muni.debtorCollectionRate}% | ${muni.debtorCollectionRate && muni.debtorCollectionRate < 80 ? '⚠️ Below 80% target' : 'On target'} |\n` +
        `| Audit Outcome | ${muni.auditOutcome} | ${muni.auditOutcome === 'Clean' ? '✓ Strong' : muni.auditOutcome === 'Disclaimer' ? '✗ Critical' : '⚠ Concern'} |\n` +
        `\nSection 139 Status: **${muni.section139Status}** | Early Alert Score: **${muni.earlyAlertScore}/100**`,
      sources,
    };
  }

  // Tender-related
  if (q.includes('tender') || q.includes('procurement') || q.includes('bid') || q.includes('award')) {
    sources.push('eTenders OCDS Database', 'CSD Supplier Registry', 'National Treasury PFMA Reports');
    const tender = MOCK_TENDERS[Math.floor(Math.random() * MOCK_TENDERS.length)];
    if (persona === 'Citizen') {
      return {
        content: `I found information about **"${tender.title}"** in ${tender.province}. This is a ${tender.status.toLowerCase()} tender worth approximately **${formatCompactZAR(tender.estimatedValue)}**. The buyer is ${tender.buyerName}, and it requires **B-BBEE Level ${tender.bbbeeRequirement}**. ${tender.status === 'Active' ? `The closing date is ${tender.closingDate}.` : tender.status === 'Awarded' ? `It was awarded for ${formatCompactZAR(tender.awardValue)}.` : `The tender status is ${tender.status}.`}`,
        sources,
      };
    }
    return {
      content: `**Tender Intelligence Report**\n\n` +
        `**OCID:** ${tender.ocid}\n` +
        `**Title:** ${tender.title}\n` +
        `**Status:** ${tender.status} | **Category:** ${tender.category}\n` +
        `**Buyer:** ${tender.buyerName} (${tender.province})\n` +
        `**Estimated Value:** ${formatCompactZAR(tender.estimatedValue)}${tender.awardValue ? ` | **Award Value:** ${formatCompactZAR(tender.awardValue)}` : ''}\n` +
        `**B-BBEE:** Level ${tender.bbbeeRequirement} | **Contract:** ${tender.contractPeriodDays} days\n\n` +
        `**AI Assessment:** ${tender.aiSummary}\n\n` +
        `**Bid Recommendation:** ${tender.bidRecommendation || 'N/A'} (Confidence: ${tender.confidenceScore ? `${Math.round(tender.confidenceScore * 100)}%` : 'N/A'})`,
      sources,
    };
  }

  // Risk-related
  if (q.includes('risk') || q.includes('anomal') || q.includes('fraud') || q.includes('signal') || q.includes('alert')) {
    sources.push('CivicLens Risk Engine v2.1', 'AGSA Audit Reports 2023/24', 'MFMA Section 139 Database');
    const signal = MOCK_RISK_SIGNALS[Math.floor(Math.random() * MOCK_RISK_SIGNALS.length)];
    if (persona === 'Citizen') {
      return {
        content: `A **${signal.severity}** risk signal has been detected: **${signal.type}**. This means ${signal.description.toLowerCase()} It was detected on ${new Date(signal.detectedAt).toLocaleDateString('en-ZA')} and is currently **${signal.status}**. ${signal.severity === 'Critical' ? '🚨 This requires immediate attention from authorities.' : signal.severity === 'High' ? '⚠️ This should be investigated promptly.' : 'This is being monitored.'}`,
        sources,
      };
    }
    return {
      content: `**Risk Signal Analysis**\n\n` +
        `**Type:** ${signal.type} | **Severity:** ${signal.severity} | **Status:** ${signal.status}\n\n` +
        `**Description:** ${signal.description}\n\n` +
        `**Indicator:** ${signal.indicator}\n` +
        `**Detected Value:** ${signal.indicatorValue} (Threshold: ${signal.threshold})\n` +
        `**Entity:** ${signal.entityId} (${signal.entityType})${signal.municipalityCode ? ` | Municipality: ${signal.municipalityCode}` : ''}\n\n` +
        `**Detection Timestamp:** ${new Date(signal.detectedAt).toISOString()}\n\n` +
        `There are currently **234 active risk signals** across the system, with **18 classified as Critical**. The most common risk type is Award Concentration, followed by Financial Distress signals.`,
      sources,
    };
  }

  // Financial-related
  if (q.includes('financial') || q.includes('budget') || q.includes('fiscal') || q.includes('revenue') || q.includes('cash')) {
    sources.push('Municipal Money API — National Treasury', 'MFMA Section 71 Reports', 'Stats SA P9114 Financial Census');
    const prov = PROVINCE_SUMMARY[Math.floor(Math.random() * PROVINCE_SUMMARY.length)];
    return {
      content: `**Financial Health Analysis: ${prov.province}**\n\n` +
        `**Average Financial Health Score:** ${prov.avgFHS}/100\n` +
        `**Municipalities:** ${prov.municipalities} | **Section 139 Interventions:** ${prov.section139} | **Clean Audits:** ${prov.cleanAudit}\n\n` +
        `${prov.avgFHS >= 50 ? 'The province shows moderate financial resilience, though significant variation exists between municipalities.' : 'The province faces systemic financial challenges with a majority of municipalities in distress.'}\n\n` +
        `**Key Financial Indicators:**\n` +
        `- Operating Budget Growth: +4.2% YoY (national average)\n` +
        `- Irregular Expenditure: R45B nationally in 2024/25\n` +
        `- Average Cash Coverage: 38 days (threshold: 30 days)\n` +
        `- Debtor Collection Rate: 72.4% nationally (target: 95%)\n\n` +
        `Nationally, **162 of 257 municipalities** are classified as in financial distress, with **43 under Section 139 intervention**.`,
      sources,
    };
  }

  // Province/comparison-related
  if (q.includes('province') || q.includes('compare') || q.includes('eastern cape') || q.includes('gauteng') || q.includes('western cape') || q.includes('limpopo') || q.includes('kwazulu') || q.includes('mpumalanga') || q.includes('free state') || q.includes('north west') || q.includes('northern cape')) {
    sources.push('Stats SA Census 2022', 'Municipal Money API — National Treasury', 'AGSA MFMA 2023/24');
    const best = PROVINCE_SUMMARY.reduce((a, b) => (a.avgFHS > b.avgFHS ? a : b));
    const worst = PROVINCE_SUMMARY.reduce((a, b) => (a.avgFHS < b.avgFHS ? a : b));
    return {
      content: `**Provincial Comparison Analysis**\n\n` +
        `| Province | Municipalities | Avg FHS | Avg SDS | §139 | Clean Audits |\n|----------|---------------|---------|---------|------|-------------|\n` +
        PROVINCE_SUMMARY.map(p =>
          `| ${p.province} | ${p.municipalities} | ${p.avgFHS} | ${p.avgSDS} | ${p.section139} | ${p.cleanAudit} |`
        ).join('\n') + '\n\n' +
        `**Best Performer:** ${best.province} (FHS: ${best.avgFHS}/100, ${best.cleanAudit} clean audits)\n` +
        `**Worst Performer:** ${worst.province} (FHS: ${worst.avgFHS}/100, ${worst.section139} §139 interventions)\n\n` +
        `The national average Financial Health Score is **${Math.round(PROVINCE_SUMMARY.reduce((s, p) => s + p.avgFHS, 0) / 9)}/100**. There is a **${best.avgFHS - worst.avgFHS}-point gap** between the best and worst performing provinces, highlighting significant geographic inequality in municipal financial management.`,
      sources,
    };
  }

  // General / default
  sources.push('CivicLens Intelligence Database', 'Municipal Money API', 'Stats SA', 'National Treasury MFMA Reports');
  return {
    content: `I can help you explore South Africa's municipal intelligence data. Based on your question, here are some relevant insights:\n\n` +
      `**National Overview:**\n` +
      `- 257 municipalities across 9 provinces\n` +
      `- 162 municipalities classified as in financial distress\n` +
      `- 43 under Section 139 intervention\n` +
      `- 25 achieved clean audit outcomes in 2023/24\n` +
      `- 234 active risk signals detected\n\n` +
      `**Key Trends:**\n` +
      `- Financial health scores have declined 3.2% year-over-year\n` +
      `- Service delivery pressure has increased in 6 of 9 provinces\n` +
      `- Irregular expenditure reached R45B in the latest cycle\n` +
      `- Procurement concentration risk has increased 14% YoY\n\n` +
      `You can ask me about specific municipalities, tenders, risk signals, financial data, or provincial comparisons. Try being specific — for example, "What is the financial health of Johannesburg?" or "Show me risk signals in Gauteng."`,
    sources,
  };
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function SourceChip({ source, expanded, onToggle }: { source: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all',
        expanded
          ? 'border-[#0F766E]/30 bg-[#0F766E]/10 text-[#0F766E]'
          : 'border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/[0.15] hover:text-zinc-400'
      )}
    >
      <FileText className="size-2.5" />
      <span className="truncate max-w-[120px]">{source}</span>
      {expanded ? <ChevronUp className="size-2.5" /> : <ChevronDown className="size-2.5" />}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="size-1.5 rounded-full bg-[#0F766E]/60"
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function ChatMessageBubble({
  message,
  personaConfig,
}: {
  message: ChatMessage;
  personaConfig: PersonaConfig | undefined;
}) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5',
          isUser
            ? 'bg-[#0F766E]/15 border border-[#0F766E]/25'
            : 'bg-white/[0.05] border border-white/[0.08]'
        )}
      >
        {isUser ? (
          <User className="size-3.5 text-[#0F766E]" />
        ) : (
          <Bot className="size-3.5 text-zinc-400" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-3.5 py-2.5',
          isUser
            ? 'bg-[#0F766E]/20 border border-[#0F766E]/25 text-zinc-100'
            : 'bg-white/[0.03] border border-white/[0.06] text-zinc-200'
        )}
      >
        {message.isLoading ? (
          <TypingIndicator />
        ) : (
          <>
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={i} className="font-semibold text-zinc-100">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>

            {/* Sources */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((source, i) => (
                    <SourceChip
                      key={i}
                      source={source}
                      expanded={sourcesExpanded}
                      onToggle={() => setSourcesExpanded(!sourcesExpanded)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div
              className={cn(
                'mt-1.5 text-[9px] text-zinc-600',
                isUser ? 'text-right' : 'text-left'
              )}
            >
              {new Date(message.timestamp).toLocaleTimeString('en-ZA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function SuggestedPromptCard({
  prompt,
  onClick,
  personaColor,
}: {
  prompt: string;
  onClick: () => void;
  personaColor: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200 group"
    >
      <div
        className="flex size-6 shrink-0 items-center justify-center rounded-md mt-0.5"
        style={{
          backgroundColor: `${personaColor}15`,
          border: `1px solid ${personaColor}25`,
        }}
      >
        <Sparkles className="size-3" style={{ color: personaColor }} />
      </div>
      <span className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
        {prompt}
      </span>
    </motion.button>
  );
}

// ── Main AI Analyst Component ────────────────────────────────────────────────

export default function AIAnalyst() {
  const {
    messages,
    persona,
    isStreaming,
    setPersona,
    addMessage,
    updateLastMessage,
    clearMessages,
    setStreaming,
  } = useAIAnalystStore();

  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentPersona = PERSONAS.find((p) => p.id === persona)!;
  const suggestedPrompts = SUGGESTED_PROMPTS[persona] || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        persona: null,
        sources: null,
        timestamp: new Date().toISOString(),
      };

      addMessage(userMessage);
      setInput('');
      setStreaming(true);

      // Add loading message
      const loadingMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        persona,
        sources: null,
        timestamp: new Date().toISOString(),
        isLoading: true,
      };

      addMessage(loadingMessage);

      // Try real API first, fall back to mock
      let isSimulated = false;
      let responseContent = '';
      let responseSources: string[] | null = null;

      try {
        const res = await fetch('/api/ai-analyst', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            persona,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          responseContent = data.content || '';
          responseSources = data.sources || null;
        } else {
          throw new Error(`API returned ${res.status}`);
        }
      } catch {
        // Fallback to mock response
        isSimulated = true;
        const mockResponse = generateMockResponse(text, persona);
        responseContent = mockResponse.content;
        responseSources = mockResponse.sources;

        // Simulate delay for mock responses
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

      updateLastMessage(responseContent, responseSources);
      // Store isSimulated flag on the last message
      // We need to update the message to include isSimulated
      setStreaming(false);

      // Update the isSimulated flag on the last message
      // Since updateLastMessage doesn't support isSimulated, we use a workaround
      // by appending a marker in the sources or content - but actually we can
      // use a custom approach by directly updating the store
      if (isSimulated) {
        // We'll use a small delay and update the message metadata
        setTimeout(() => {
          // Access the store directly to update isSimulated
          const state = useAIAnalystStore.getState();
          const msgs = [...state.messages];
          if (msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            msgs[msgs.length - 1] = { ...last, isSimulated: true };
            useAIAnalystStore.setState({ messages: msgs });
          }
        }, 0);
      }
    },
    [addMessage, isStreaming, persona, setStreaming, updateLastMessage, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const charCount = input.length;
  const maxChars = 2000;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-0">
      {/* ── Module Header + Persona Selector ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-3 pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#0F766E]/15 border border-[#0F766E]/25">
            <Bot className="size-5 text-[#0F766E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">AI Analyst</h1>
            <p className="text-[11px] text-zinc-500">Natural language interface to all platform data</p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="flex items-center gap-1.5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                persona === p.id
                  ? `${p.bgColor} ${p.borderColor} border text-zinc-200`
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent'
              )}
              title={p.description}
            >
              <span style={{ color: persona === p.id ? p.color : undefined }}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Persona Description ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 pb-3"
      >
        <Badge
          variant="outline"
          className={cn('text-[10px] h-5 px-2', currentPersona.bgColor, currentPersona.borderColor)}
          style={{ color: currentPersona.color }}
        >
          {currentPersona.icon}
          <span className="ml-1">{currentPersona.label} Mode</span>
        </Badge>
        <span className="text-[10px] text-zinc-500">{currentPersona.description}</span>
      </motion.div>

      {/* ── Chat Messages Area ──────────────────────────────────── */}
      <Card className="flex-1 border-white/[0.08] bg-white/[0.01] backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              /* Empty state with suggested prompts */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center py-8"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#0F766E]/10 border border-[#0F766E]/20 mb-5">
                  <Bot className="size-8 text-[#0F766E]/60" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-1">Start a Conversation</h3>
                <p className="text-[11px] text-zinc-500 mb-6 text-center max-w-sm">
                  Ask questions about South African municipalities, tenders, risk signals, or financial data. Choose a prompt below or type your own.
                </p>

                <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <SuggestedPromptCard
                      key={i}
                      prompt={prompt}
                      onClick={() => sendMessage(prompt)}
                      personaColor={currentPersona.color}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Chat messages */
              <>
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    personaConfig={currentPersona}
                  />
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Suggested prompts row (when chat has messages) */}
        {messages.length > 0 && (
          <div className="border-t border-white/[0.06] px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium shrink-0">
                Suggest:
              </span>
              {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300 hover:bg-white/[0.04] transition-all truncate max-w-[200px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Input Area ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="pt-3"
      >
        <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm focus-within:border-[#0F766E]/30 focus-within:bg-white/[0.04] transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about municipalities, tenders, risk signals... (${currentPersona.label} mode)`}
            rows={1}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />

          <div className="flex items-center justify-between px-3 pb-2">
            {/* Quick actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]"
                title="Attach file"
              >
                <Paperclip className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]"
                title="Voice input"
              >
                <Mic className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-zinc-600 hover:text-red-400 hover:bg-white/[0.05]"
                title="Clear chat"
                onClick={clearMessages}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            {/* Right side: char count + send */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-600 tabular-nums">
                {charCount}/{maxChars}
              </span>
              <span className="text-[9px] text-zinc-700 hidden sm:inline">
                Shift+Enter for new line
              </span>
              <Button
                size="icon"
                className={cn(
                  'size-8 rounded-lg transition-all duration-200',
                  input.trim() && !isStreaming
                    ? 'bg-[#0F766E] hover:bg-[#0F766E]/80 text-white'
                    : 'bg-white/[0.05] text-zinc-600 cursor-not-allowed'
                )}
                disabled={!input.trim() || isStreaming}
                onClick={() => sendMessage(input)}
              >
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center mt-2 gap-1.5">
          <Sparkles className="size-2.5 text-[#0F766E]/40" />
          <span className="text-[9px] text-zinc-600">Powered by CivicLens AI</span>
          <span className="text-[9px] text-zinc-700">·</span>
          <span className="text-[9px] text-zinc-700">Data may be simulated for demo purposes</span>
        </div>
      </motion.div>
    </div>
  );
}
