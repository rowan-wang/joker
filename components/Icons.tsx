import React from 'react';
import { Suit } from '../types';

export const SuitIcon = ({ suit, className = "w-6 h-6" }: { suit: Suit, className?: string }) => {
    switch (suit) {
        case Suit.Hearts:
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                     <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            );
        case Suit.Diamonds:
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M12 2L2 12l10 10 10-10L12 2z"/>
                </svg>
            );
        case Suit.Clubs:
            return (
                 <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M19.5 13c-2.48 0-4.5 2.02-4.5 4.5 0 .86.25 1.66.67 2.34L13.5 22h-3l-2.17-2.16c.42-.68.67-1.48.67-2.34 0-2.48-2.02-4.5-4.5-4.5-1.29 0-2.47.55-3.3 1.44C1.08 14.28 1 14.14 1 14c0-3.31 2.69-6 6-6 1.41 0 2.7.49 3.72 1.3C10.66 6.8 9 4.6 9 2h6c0 2.6-1.66 4.8-1.72 7.3C14.3 8.49 15.59 8 17 8c3.31 0 6 2.69 6 6 0 .14-.08.28-.2.44-.83-.89-2.01-1.44-3.3-1.44z"/>
                </svg>
            );
        case Suit.Spades:
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                   <path d="M12 2C9 7.4 5.34 9.6 2.6 12.33 1.6 13.33 1 14.6 1 16c0 3.31 2.69 6 6 6 1.66 0 3-.67 4-1.88C12 21.33 13.34 22 15 22c3.31 0 6-2.69 6-6 0-1.4-.6-2.67-1.6-3.67C16.66 9.6 13 7.4 12 2z"/>
                </svg>
            );
        default: return null;
    }
};