'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlist';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface WatchlistStarProps {
  municipalityId: string;
  size?: number;
}

export default function WatchlistStar({ municipalityId, size = 18 }: WatchlistStarProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const isWatched = isInWatchlist(municipalityId);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isWatched) {
      removeFromWatchlist(municipalityId);
    } else {
      addToWatchlist(municipalityId);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handleToggle}
          className="relative inline-flex items-center justify-center shrink-0 transition-colors duration-200 focus:outline-none cursor-pointer"
          whileTap={{ scale: 0.8 }}
          animate={{ scale: isWatched ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star
            size={size}
            className="transition-colors duration-200"
            fill={isWatched ? '#D97706' : 'none'}
            stroke={isWatched ? '#D97706' : 'currentColor'}
            strokeWidth={isWatched ? 0 : 1.5}
            style={{
              color: isWatched ? undefined : '#71717a',
              filter: isWatched ? 'drop-shadow(0 0 4px rgba(217,119,6,0.4))' : 'none',
            }}
          />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      </TooltipContent>
    </Tooltip>
  );
}
