// CivicLens SA — Watchlist Store (Zustand + Persist)
// Manages municipality watchlist with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_WATCHLIST = ['2', '1', '3']; // Johannesburg, Cape Town, eThekwini

interface WatchlistState {
  watchlistMunis: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlistMunis: DEFAULT_WATCHLIST,

      addToWatchlist: (id: string) => {
        const current = get().watchlistMunis;
        if (!current.includes(id)) {
          set({ watchlistMunis: [...current, id] });
        }
      },

      removeFromWatchlist: (id: string) => {
        set({ watchlistMunis: get().watchlistMunis.filter((mId) => mId !== id) });
      },

      isInWatchlist: (id: string) => {
        return get().watchlistMunis.includes(id);
      },
    }),
    {
      name: 'civiclens-watchlist',
    }
  )
);
