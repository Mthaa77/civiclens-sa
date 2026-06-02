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
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUGGESTED_PROMPTS } from '@/lib/mock-data';
import { useAIAnalystStore } from '@/store/ai-analyst';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
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

// ── LocalStorage Keys ────────────────────────────────────────────────────────

const STORAGE_KEY_MESSAGES = 'civiclens-ai-analyst-messages';
const STORAGE_KEY_PERSONA = 'civiclens-ai-analyst-persona';

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[];
      // Filter out loading messages from previous sessions
      return parsed.filter((m) => !m.isLoading);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveMessages(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    // Don't save loading messages
    const toSave = messages.filter((m) => !m.isLoading);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(toSave));
  } catch {
    // Ignore storage errors
  }
}

function loadPersona(): AIPersona | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PERSONA);
    if (stored) {
      return stored as AIPersona;
    }
  } catch {
    // Ignore
  }
  return null;
}

function savePersona(persona: AIPersona) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PERSONA, persona);
  } catch {
    // Ignore
  }
}

// ── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let inList = false;
  let listKey = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // Check for bullet list items
    const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!inList) {
        inList = true;
      }
      const indent = bulletMatch[1].length;
      const content = bulletMatch[2];
      nodes.push(
        <div
          key={`list-${lineIdx}`}
          className="flex items-start gap-1.5"
          style={{ paddingLeft: `${Math.min(indent, 16)}px` }}
        >
          <span className="text-[#0F766E] mt-0.5 shrink-0">•</span>
          <span>{renderInlineMarkdown(content)}</span>
        </div>
      );
      continue;
    }

    // If we were in a list and this line isn't a bullet, close the list
    if (inList) {
      inList = false;
    }

    // Check for table rows (pipe-delimited)
    if (line.includes('|') && line.trim().startsWith('|')) {
      // Skip separator rows like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) {
        continue;
      }
      const cells = line.split('|').filter((c) => c.trim() !== '');
      nodes.push(
        <div key={`table-${lineIdx}`} className="flex gap-4 text-[12px]">
          {cells.map((cell, ci) => (
            <span
              key={ci}
              className={cn(
                'min-w-[80px]',
                ci === 0 ? 'font-medium text-zinc-200' : 'text-zinc-400'
              )}
            >
              {renderInlineMarkdown(cell.trim())}
            </span>
          ))}
        </div>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      nodes.push(<div key={`blank-${lineIdx}`} className="h-2" />);
      continue;
    }

    // Regular line with inline markdown
    nodes.push(
      <div key={`line-${lineIdx}`}>{renderInlineMarkdown(line)}</div>
    );
    listKey++;
  }

  return nodes;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern matches: **bold**, *italic*, `code`, and plain text
  const pattern = /(\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > lastIndex) {
      const plainText = text.slice(lastIndex, match.index);
      nodes.push(...renderSpecialTokens(plainText));
    }

    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${match.index}`} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) {
      nodes.push(
        <em key={`i-${match.index}`} className="italic text-zinc-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-[#0F766E]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + token.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(...renderSpecialTokens(text.slice(lastIndex)));
  }

  return nodes;
}

function renderSpecialTokens(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Handle emojis and special chars like ⚠️, 🚨, ✓, ✗
  const parts = text.split(/([\u{1F6A8}\u{26A0}\u{2705}\u{2713}\u{2717}\u{261D}]|⚠️)/u);
  for (let i = 0; i < parts.length; i++) {
    nodes.push(<span key={`st-${i}`}>{parts[i]}</span>);
  }
  return nodes;
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
      <span className={cn('truncate', expanded ? 'max-w-[300px]' : 'max-w-[120px]')}>
        {source}
      </span>
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
  onRetry,
  onReaction,
  onCopy,
}: {
  message: ChatMessage;
  personaConfig: PersonaConfig | undefined;
  onRetry: (messageId: string) => void;
  onReaction: (messageId: string, reaction: 'up' | 'down') => void;
  onCopy: (content: string) => void;
}) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn('flex gap-2.5 group/msg', isUser ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      <div className="max-w-[80%] relative">
        <div
          className={cn(
            'rounded-xl px-3.5 py-2.5',
            isUser
              ? 'bg-[#0F766E]/20 border border-[#0F766E]/25 text-zinc-100'
              : message.isError
                ? 'bg-red-500/[0.06] border border-red-500/20 text-zinc-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-zinc-200'
          )}
        >
          {message.isLoading ? (
            <TypingIndicator />
          ) : (
            <>
              <div className="text-[13px] leading-relaxed break-words">
                {renderMarkdown(message.content)}
              </div>

              {/* Error with retry */}
              {message.isError && (
                <div className="mt-2 pt-2 border-t border-red-500/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1.5 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => onRetry(message.id)}
                  >
                    <RefreshCw className="size-3" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Sources */}
              {!isUser && !message.isError && message.sources && message.sources.length > 0 && (
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

        {/* Action buttons for AI messages (on hover) */}
        {!isUser && !message.isLoading && isHovered && !message.isError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-0.5 mt-1 ml-1"
          >
            {/* Thumbs up */}
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={() => onReaction(message.id, message.reaction === 'up' ? 'up' : 'up')}
              className={cn(
                'flex items-center justify-center size-6 rounded-md transition-colors',
                message.reaction === 'up'
                  ? 'text-[#0F766E] bg-[#0F766E]/10'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]'
              )}
              title="Helpful"
            >
              <ThumbsUp className="size-3" />
            </motion.button>

            {/* Thumbs down */}
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={() => onReaction(message.id, message.reaction === 'down' ? 'down' : 'down')}
              className={cn(
                'flex items-center justify-center size-6 rounded-md transition-colors',
                message.reaction === 'down'
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]'
              )}
              title="Not helpful"
            >
              <ThumbsDown className="size-3" />
            </motion.button>

            <div className="w-px h-3 bg-white/[0.06] mx-0.5" />

            {/* Copy */}
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={() => onCopy(message.content)}
              className="flex items-center justify-center size-6 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-colors"
              title="Copy message"
            >
              <Copy className="size-3" />
            </motion.button>
          </motion.div>
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
    setMessages,
    setMessageReaction,
    updateMessage,
  } = useAIAnalystStore();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLoadedRef = useRef(false);

  const currentPersona = PERSONAS.find((p) => p.id === persona)!;
  const suggestedPrompts = SUGGESTED_PROMPTS[persona] || [];

  // ── Load messages from localStorage on mount ───────────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const savedMessages = loadMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }

    const savedPersona = loadPersona();
    if (savedPersona) {
      setPersona(savedPersona);
    }
  }, [setMessages, setPersona]);

  // ── Save messages to localStorage on change ────────────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) {
      saveMessages(messages);
    }
  }, [messages]);

  // ── Save persona to localStorage on change ─────────────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) {
      savePersona(persona);
    }
  }, [persona]);

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

  // ── API call helper ────────────────────────────────────────────────────
  const callAPI = useCallback(
    async (messageText: string, messagePersona: AIPersona, history: ChatMessage[]) => {
      try {
        const res = await fetch('/api/ai-analyst', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            persona: messagePersona,
            history: history
              .filter((m) => !m.isLoading && !m.isError)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const data = await res.json();
        return {
          content: data.response || data.content || '',
          sources: data.sources || null,
          isError: false,
        };
      } catch (err) {
        console.error('AI Analyst API error:', err);
        return {
          content: 'I encountered an error while processing your request. Please check your connection and try again.',
          sources: null,
          isError: true,
        };
      }
    },
    []
  );

  // ── Send message ───────────────────────────────────────────────────────
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

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Add loading message
      const loadingId = `msg-${Date.now() + 1}`;
      const loadingMessage: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: '',
        persona,
        sources: null,
        timestamp: new Date().toISOString(),
        isLoading: true,
      };

      addMessage(loadingMessage);

      // Call real API
      const result = await callAPI(text.trim(), persona, [
        ...messages,
        userMessage,
      ]);

      updateLastMessage(result.content, result.sources, result.isError);
      setStreaming(false);
    },
    [addMessage, isStreaming, persona, setStreaming, updateLastMessage, messages, callAPI]
  );

  // ── Retry failed message ───────────────────────────────────────────────
  const handleRetry = useCallback(
    async (messageId: string) => {
      // Find the user message that preceded this AI response
      const msgIdx = messages.findIndex((m) => m.id === messageId);
      if (msgIdx < 0) return;

      // Find the last user message before this AI message
      let userMsg: ChatMessage | null = null;
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userMsg = messages[i];
          break;
        }
      }

      if (!userMsg) return;

      // Mark the error message as loading
      updateMessage(messageId, { isLoading: true, isError: false, content: '' });
      setStreaming(true);

      // Call API again
      const result = await callAPI(userMsg.content, persona, messages.slice(0, msgIdx));
      updateMessage(messageId, {
        content: result.content,
        sources: result.sources,
        isLoading: false,
        isError: result.isError,
      });
      setStreaming(false);
    },
    [messages, persona, callAPI, updateMessage, setStreaming]
  );

  // ── Handle reaction ────────────────────────────────────────────────────
  const handleReaction = useCallback(
    (messageId: string, reaction: 'up' | 'down') => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      // Toggle: if same reaction, remove it; otherwise set it
      setMessageReaction(messageId, msg.reaction === reaction ? null : reaction);
    },
    [messages, setMessageReaction]
  );

  // ── Handle copy ────────────────────────────────────────────────────────
  const handleCopy = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        toast({
          title: 'Copied!',
          description: 'Message copied to clipboard',
        });
      } catch {
        toast({
          title: 'Copy failed',
          description: 'Could not copy to clipboard',
        });
      }
    },
    []
  );

  // ── Export chat ────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (messages.length === 0) return;

    const lines = messages
      .filter((m) => !m.isLoading)
      .map((m) => {
        const timestamp = new Date(m.timestamp).toLocaleString('en-ZA');
        const role = m.role === 'user' ? 'You' : 'AI Analyst';
        let line = `[${timestamp}] ${role}:\n${m.content}`;
        if (m.sources && m.sources.length > 0) {
          line += `\nSources: ${m.sources.join(', ')}`;
        }
        return line;
      });

    const content = `CivicLens SA — AI Analyst Chat Export\nExported: ${new Date().toLocaleString('en-ZA')}\nPersona: ${persona}\n${'─'.repeat(60)}\n\n${lines.join('\n\n---\n\n')}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civiclens-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Chat exported',
      description: 'Chat history saved as text file',
    });
  }, [messages, persona]);

  // ── Clear history ──────────────────────────────────────────────────────
  const handleClearHistory = useCallback(() => {
    clearMessages();
    try {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch {
      // Ignore
    }
    toast({
      title: 'Chat cleared',
      description: 'Chat history has been cleared',
    });
  }, [clearMessages]);

  // ── Voice input handler ────────────────────────────────────────────────
  const handleVoiceInput = useCallback(() => {
    if (isListening) return;
    setIsListening(true);

    // Auto-dismiss after 3 seconds (mock)
    setTimeout(() => {
      setIsListening(false);
      toast({
        title: 'Voice input is coming soon',
        description: 'This feature will be available in a future update',
      });
    }, 3000);
  }, [isListening]);

  // ── File attachment handler ────────────────────────────────────────────
  const handleFileAttach = useCallback(() => {
    toast({
      title: 'File attachments coming in the next update',
      description: 'Document and image uploads will be supported soon',
    });
  }, []);

  // ── Handle persona change ──────────────────────────────────────────────
  const handlePersonaChange = useCallback(
    (newPersona: AIPersona) => {
      setPersona(newPersona);
    },
    [setPersona]
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

        <div className="flex items-center gap-1.5">
          {/* Persona Selector */}
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePersonaChange(p.id)}
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

          {/* Export button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 ml-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
            title="Export chat"
            onClick={handleExport}
            disabled={messages.length === 0}
          >
            <Download className="size-3.5" />
          </Button>
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
                    onRetry={handleRetry}
                    onReaction={handleReaction}
                    onCopy={handleCopy}
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
          {/* Voice listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-4 pt-2.5"
              >
                <motion.div
                  className="size-2.5 rounded-full bg-red-500"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0.6, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="text-[11px] text-red-400 font-medium">Listening...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about municipalities, tenders, risk signals... (${currentPersona.label} mode)`}
            rows={1}
            disabled={isListening}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-3 pb-2">
            {/* Quick actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]"
                title="Attach file"
                onClick={handleFileAttach}
              >
                <Paperclip className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'size-7 hover:bg-white/[0.05] transition-colors',
                  isListening
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-zinc-600 hover:text-zinc-400'
                )}
                title="Voice input"
                onClick={handleVoiceInput}
              >
                <Mic className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-zinc-600 hover:text-red-400 hover:bg-white/[0.05]"
                title="Clear history"
                onClick={handleClearHistory}
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
