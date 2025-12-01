import { Suit, Rank, ICard, HandType, IHandResult } from '../types';
import { BASE_HAND_STATS, RANK_VALUES } from '../constants';

export const createDeck = (): ICard[] => {
  const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
  const ranks = Object.values(Rank);
  let deck: ICard[] = [];
  
  let idCounter = 0;
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `card_${idCounter++}`,
        suit,
        rank,
        value: RANK_VALUES[rank],
        chips: RANK_VALUES[rank],
        isSelected: false
      });
    }
  }
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: ICard[]): ICard[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Helper to convert rank to sortable numeric value (2=2, ..., A=14)
const getSortValue = (rank: Rank): number => {
    const map: Record<Rank, number> = {
        [Rank.Two]: 2, [Rank.Three]: 3, [Rank.Four]: 4, [Rank.Five]: 5,
        [Rank.Six]: 6, [Rank.Seven]: 7, [Rank.Eight]: 8, [Rank.Nine]: 9,
        [Rank.Ten]: 10, [Rank.Jack]: 11, [Rank.Queen]: 12, [Rank.King]: 13, [Rank.Ace]: 14
    };
    return map[rank];
};

export const evaluateHand = (cards: ICard[]): IHandResult => {
    if (cards.length === 0) return { type: HandType.HighCard, scoringCards: [], baseChips: 0, baseMult: 0 };

    const sorted = [...cards].sort((a, b) => getSortValue(b.rank) - getSortValue(a.rank)); // Descending
    
    // Check Flush
    const isFlush = cards.length === 5 && cards.every(c => c.suit === cards[0].suit);
    
    // Check Straight
    // Unique ranks for straight calculation
    const uniqueRanks = Array.from(new Set(sorted.map(c => getSortValue(c.rank))));
    let isStraight = false;
    
    // Standard straight
    if (uniqueRanks.length >= 5) {
        // Simple check for 5 consecutive
        for(let i = 0; i <= uniqueRanks.length - 5; i++) {
            if (uniqueRanks[i] - uniqueRanks[i+4] === 4) {
                isStraight = true;
                break;
            }
        }
    }
    // Ace low straight (A, 5, 4, 3, 2) -> A is 14, others are 5,4,3,2
    if (!isStraight && uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
        isStraight = true;
    }

    // Check Counts
    const rankCounts: Record<string, number> = {};
    cards.forEach(c => {
        rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    });
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    let type = HandType.HighCard;
    let scoringCards = [...sorted]; // In Balatro, typically only the relevant cards score, but for MVP we might be loose.
    // However, Balatro specific rule: Only 5 cards score.
    // If we play 5 cards, High Card uses the highest one? Actually High Card uses the highest card, others don't score chips.
    // Refinement: Identify strictly Scoring Cards.

    if (isFlush && isStraight) {
        if (sorted[0].rank === Rank.Ace && sorted[1].rank === Rank.King) type = HandType.RoyalFlush;
        else type = HandType.StraightFlush;
    } else if (counts[0] === 4) {
        type = HandType.FourOfAKind;
        // The 4 cards score.
        const rank = Object.keys(rankCounts).find(key => rankCounts[key] === 4);
        scoringCards = sorted.filter(c => c.rank === rank);
    } else if (counts[0] === 3 && counts[1] === 2) {
        type = HandType.FullHouse;
        // All 5 score
    } else if (isFlush) {
        type = HandType.Flush;
    } else if (isStraight) {
        type = HandType.Straight;
    } else if (counts[0] === 3) {
        type = HandType.ThreeOfAKind;
        const rank = Object.keys(rankCounts).find(key => rankCounts[key] === 3);
        scoringCards = sorted.filter(c => c.rank === rank);
    } else if (counts[0] === 2 && counts[1] === 2) {
        type = HandType.TwoPair;
        const ranks = Object.keys(rankCounts).filter(key => rankCounts[key] === 2);
        scoringCards = sorted.filter(c => ranks.includes(c.rank));
    } else if (counts[0] === 2) {
        type = HandType.Pair;
        const rank = Object.keys(rankCounts).find(key => rankCounts[key] === 2);
        scoringCards = sorted.filter(c => c.rank === rank);
    } else {
        type = HandType.HighCard;
        scoringCards = [sorted[0]];
    }

    // Base values
    const scoreData = BASE_HAND_STATS[type];
    
    return {
        type,
        scoringCards,
        baseChips: scoreData.chips,
        baseMult: scoreData.mult
    };
}