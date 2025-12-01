import { HandType, IJoker, Rank, IHandLevel } from './types';
import { ALL_JOKERS } from './services/gameData';

// Chinese Display Names for Hands
export const HAND_NAMES: Record<HandType, string> = {
  [HandType.HighCard]: '高牌',
  [HandType.Pair]: '对子',
  [HandType.TwoPair]: '两对',
  [HandType.ThreeOfAKind]: '三条',
  [HandType.Straight]: '顺子',
  [HandType.Flush]: '同花',
  [HandType.FullHouse]: '葫芦',
  [HandType.FourOfAKind]: '四条',
  [HandType.StraightFlush]: '同花顺',
  [HandType.RoyalFlush]: '皇家同花顺',
};

// Base Stats (Level 1)
export const BASE_HAND_STATS: Record<HandType, IHandLevel> = {
  [HandType.HighCard]: { level: 1, chips: 5, mult: 1 },
  [HandType.Pair]: { level: 1, chips: 10, mult: 2 },
  [HandType.TwoPair]: { level: 1, chips: 20, mult: 2 },
  [HandType.ThreeOfAKind]: { level: 1, chips: 30, mult: 3 },
  [HandType.Straight]: { level: 1, chips: 30, mult: 4 },
  [HandType.Flush]: { level: 1, chips: 35, mult: 4 },
  [HandType.FullHouse]: { level: 1, chips: 40, mult: 4 },
  [HandType.FourOfAKind]: { level: 1, chips: 60, mult: 7 },
  [HandType.StraightFlush]: { level: 1, chips: 100, mult: 8 },
  [HandType.RoyalFlush]: { level: 1, chips: 100, mult: 8 },
};

export const RANK_VALUES: Record<Rank, number> = {
  [Rank.Two]: 2, [Rank.Three]: 3, [Rank.Four]: 4, [Rank.Five]: 5,
  [Rank.Six]: 6, [Rank.Seven]: 7, [Rank.Eight]: 8, [Rank.Nine]: 9,
  [Rank.Ten]: 10, [Rank.Jack]: 10, [Rank.Queen]: 10, [Rank.King]: 10,
  [Rank.Ace]: 11,
};

// Extended Joker Pool (Merged with Scraped Data)
export const JOKER_POOL: IJoker[] = [
  ...ALL_JOKERS
];

export const MAX_HAND_SIZE = 8;
export const MAX_PLAY_SIZE = 5;

// Ante Scaling (Standard Balatro Curve approximation)
export const ANTE_BASE_SCORES = [
    300,       // Ante 1
    800,       // Ante 2
    2000,      // Ante 3
    5000,      // Ante 4
    11000,     // Ante 5
    20000,     // Ante 6
    35000,     // Ante 7
    50000,     // Ante 8 (Win)
    110000,    // Ante 9
    560000,    // Ante 10
    3000000,   // Ante 11
    18000000,  // Ante 12
    150000000  // Ante 13
];
