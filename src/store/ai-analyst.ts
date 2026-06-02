// CivicLens SA — AI Analyst Chat Store (Zustand)

import { create } from 'zustand';
import type { AIPersona, ChatMessage } from '@/types';

interface AIAnalystState {
  messages: ChatMessage[];
  persona: AIPersona;
  isStreaming: boolean;
  setPersona: (persona: AIPersona) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string, sources?: string[] | null, isError?: boolean) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setMessageReaction: (messageId: string, reaction: 'up' | 'down' | null) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
}

export const useAIAnalystStore = create<AIAnalystState>((set) => ({
  messages: [],
  persona: 'Analyst',
  isStreaming: false,
  setPersona: (persona) => set({ persona }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content, sources, isError) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = {
          ...last,
          content,
          isLoading: false,
          sources: sources !== undefined ? sources : last.sources,
          isError: isError !== undefined ? isError : false,
        };
      }
      return { messages };
    }),
  clearMessages: () => set({ messages: [] }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setMessages: (messages) => set({ messages }),
  setMessageReaction: (messageId, reaction) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, reaction } : m
      ),
    })),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    })),
}));
