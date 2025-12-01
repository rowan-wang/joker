import { HandType, ICard, IJoker } from '../types';

// Types for different trigger contexts
export type JokerTriggerContext = 
  | { type: 'onPlay'; handType: HandType; playedCards: ICard[]; scoringCards: ICard[]; handLevel: number }
  | { type: 'onDiscard'; discardedCards: ICard[] }
  | { type: 'onHeld'; hand: ICard[] }
  | { type: 'onEndRound'; handsLeft: number; money: number }
  | { type: 'onSell'; price: number };

export interface JokerEffectResult {
  multAdd?: number;
  chipsAdd?: number;
  multX?: number;
  moneyAdd?: number;
  sound?: 'chip' | 'mult' | 'xmult' | 'coin';
  message?: string; // For toast or overlay
  triggered: boolean;
  action?: 'create_tarot' | 'create_planet' | 'upgrade_hand'; // New action field
}

// Helper to check array inclusion
// const hasRank = (cards: ICard[], ranks: string[]) => cards.some(c => ranks.includes(c.rank));
// const hasSuit = (cards: ICard[], suit: string) => cards.some(c => c.suit === suit);

// Export a list of jokers that have advanced implementation
export const IMPLEMENTED_JOKERS = [
    'j_greedy_joker', 'j_lusty_joker', 'j_wrathful_joker', 'j_gluttonous_joker',
    'j_scholar', 'j_even_steven', 'j_odd_todd', 'j_fibonacci', 'j_hack', 'j_8_ball',
    'j_jolly', 'j_zany', 'j_mad', 'j_crazy', 'j_droll',
    'j_sly', 'j_wily', 'j_clever', 'j_devious', 'j_crafty',
    'j_half', 'j_gros_michel', 'j_abstract', 'j_supernova',
    'j_space_joker',
    'j_baron', 'j_steel_joker', 'j_shoot_the_moon', 'j_raised_fist',
    'j_golden', 'j_cloud_9', 'j_rocket'
];

// Manual implementation of complex Joker logic
// Returns null if no special logic applies (fallback to generic parsing)
export const calculateJokerEffect = (joker: IJoker, context: JokerTriggerContext): JokerEffectResult | null => {
  const result: JokerEffectResult = { triggered: false };
  
  // ----------------------------------------------------------------
  // ON PLAY TRIGGERS
  // ----------------------------------------------------------------
  if (context.type === 'onPlay') {
    const { playedCards, scoringCards, handType } = context; // Use scoringCards for accuracy

    switch (joker.id) {
      // --- SUIT JOKERS ---
      case 'j_greedy_joker': // Diamonds
        {
            const diamonds = scoringCards.filter(c => c.suit === 'Diamonds');
            if (diamonds.length > 0) {
                result.multAdd = 4 * diamonds.length;
                result.triggered = true;
            }
        }
        break;
      case 'j_lusty_joker': // Hearts
        {
            const hearts = scoringCards.filter(c => c.suit === 'Hearts');
            if (hearts.length > 0) {
                result.multAdd = 4 * hearts.length; // Standard +4
                result.triggered = true;
            }
        }
        break;
      case 'j_wrathful_joker': // Spades
        {
            const spades = scoringCards.filter(c => c.suit === 'Spades');
            if (spades.length > 0) {
                result.multAdd = 4 * spades.length;
                result.triggered = true;
            }
        }
        break;
      case 'j_gluttonous_joker': // Clubs
        {
            const clubs = scoringCards.filter(c => c.suit === 'Clubs');
            if (clubs.length > 0) {
                result.multAdd = 4 * clubs.length;
                result.triggered = true;
            }
        }
        break;

      // --- RANK JOKERS ---
      case 'j_scholar': {
        // Played Aces and Face cards give +4 Mult and +20 Chips
        // Usually applies to SCORING cards
        const scholarCards = scoringCards.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank));
        if (scholarCards.length > 0) {
           result.multAdd = 4 * scholarCards.length;
           result.chipsAdd = 20 * scholarCards.length;
           result.triggered = true;
        }
        break;
      }
      
      case 'j_even_steven': {
        // Played even rank cards give +4 Mult
        const evenCards = scoringCards.filter(c => ['10', '8', '6', '4', '2'].includes(c.rank));
        if (evenCards.length > 0) {
            result.multAdd = 4 * evenCards.length;
            result.triggered = true;
        }
        break;
      }

      case 'j_odd_todd': {
        // Played odd rank cards give +30 Chips
        const oddCards = scoringCards.filter(c => ['A', '9', '7', '5', '3'].includes(c.rank));
        if (oddCards.length > 0) {
            result.chipsAdd = 30 * oddCards.length;
            result.triggered = true;
        }
        break;
      }
      
      case 'j_fibonacci': {
        // Played Ace, 2, 3, 5, 8 gives +8 Mult
        const fibCards = scoringCards.filter(c => ['A', '2', '3', '5', '8'].includes(c.rank));
        if (fibCards.length > 0) {
            result.multAdd = 8 * fibCards.length;
            result.triggered = true;
        }
        break;
      }

      case 'j_hack': {
        // Retrigger 2, 3, 4, 5
        // Simplified for MVP: just add copies of their chips/mult logic?
        // Actually Hack retriggers SCORING.
        // Hard to do retrigger in this simple loop.
        // For MVP: Add flat +1 Mult per card? Or just simulate retrigger as +Chips?
        // Let's just add +10 chips per relevant card as a placeholder for "retrigger".
        const hackCards = scoringCards.filter(c => ['2', '3', '4', '5'].includes(c.rank));
        if (hackCards.length > 0) {
             // Mock retrigger: add their base chips again (approx)
             // Rank 2-5 have value 2-5.
             const extraChips = hackCards.reduce((sum, c) => sum + c.value, 0);
             result.chipsAdd = extraChips;
             result.triggered = true;
        }
        break;
      }
      
      case 'j_8_ball': {
        const eights = scoringCards.filter(c => c.rank === '8');
        if (eights.length > 0) {
             let created = false;
             for (let i = 0; i < eights.length; i++) {
                 if (Math.random() < 0.25) {
                     created = true;
                     break; 
                 }
             }
             if (created) {
                 result.action = 'create_tarot';
                 result.message = '生成塔罗牌!';
                 result.triggered = true;
             }
        }
        break;
      }
      
      // ...

      // --- HAND TYPE JOKERS ---
      case 'j_jolly': // Pair
        if (handType.includes('Pair') || handType === 'Full House') { // Loose check
           result.multAdd = 8;
           result.triggered = true;
        }
        break;
      case 'j_zany': // Three of a Kind
        if (handType.includes('Three') || handType === 'Full House') {
           result.multAdd = 12;
           result.triggered = true;
        }
        break;
      case 'j_mad': // Two Pair
        if (handType === 'Two Pair') {
           result.multAdd = 20; // Actual value varies
           result.triggered = true;
        }
        break;
      case 'j_crazy': // Straight
        if (handType === 'Straight' || handType === 'Straight Flush') {
           result.multAdd = 12;
           result.triggered = true;
        }
        break;
      case 'j_droll': // Flush
        if (handType === 'Flush' || handType === 'Straight Flush') {
           result.multAdd = 10;
           result.triggered = true;
        }
        break;
      
      case 'j_sly': // Pair +50 Chips
        if (handType.includes('Pair')) { result.chipsAdd = 50; result.triggered = true; }
        break;
      case 'j_wily': // Three of a Kind +100 Chips
        if (handType.includes('Three')) { result.chipsAdd = 100; result.triggered = true; }
        break;
      case 'j_clever': // Two Pair +80 Chips
        if (handType === 'Two Pair') { result.chipsAdd = 80; result.triggered = true; }
        break;
      case 'j_devious': // Straight +100 Chips
        if (handType.includes('Straight')) { result.chipsAdd = 100; result.triggered = true; }
        break;
      case 'j_crafty': // Flush +80 Chips
        if (handType.includes('Flush')) { result.chipsAdd = 80; result.triggered = true; }
        break;

      // --- OTHER ---
      case 'j_half': // +20 Mult if played <= 3 cards
        if (playedCards.length <= 3) {
            result.multAdd = 20;
            result.triggered = true;
        }
        break;
        
      case 'j_gros_michel':
        result.multAdd = 15;
        result.triggered = true;
        break;

      case 'j_abstract': // +3 Mult for each Joker
         // We need joker count. Not passed in context. 
         break;

      case 'j_supernova':
         // Adds Mult equal to the number of times poker hand has been played
         // Using handLevel as proxy for now (minus 1 for base level 1)
         // Need to cast context to access optional property safely or use 'in' check
         if ('handLevel' in context && typeof context.handLevel === 'number') {
             result.multAdd = context.handLevel; // Approximation
             result.triggered = true;
         }
         break;
    }
  }

  // ----------------------------------------------------------------
  // ON HELD TRIGGERS
  // ----------------------------------------------------------------
  if (context.type === 'onHeld') {
      const { hand } = context;
      switch (joker.id) {
          case 'j_baron': { // King held -> x1.5 Mult
             const kings = hand.filter(c => c.rank === 'K');
             if (kings.length > 0) {
                 result.multX = Math.pow(1.5, kings.length);
                 result.triggered = true;
                 result.sound = 'xmult';
             }
             break;
          }
          case 'j_steel_joker': // Steel cards held -> x0.25 Mult (Not impl steel yet)
             break;
          case 'j_shoot_the_moon': { // +13 Mult per Queen held
             const queens = hand.filter(c => c.rank === 'Q');
             if (queens.length > 0) {
                 result.multAdd = 13 * queens.length;
                 result.triggered = true;
             }
             break;
          }
          case 'j_raised_fist': // Lowest rank card held adds double its rank to Mult
             // Simplify: just add 10 mult if you have cards
             if (hand.length > 0) {
                 result.multAdd = 10; // Mock logic
                 result.triggered = true;
             }
             break;
      }
  }

  // ----------------------------------------------------------------
  // ON END ROUND
  // ----------------------------------------------------------------
  if (context.type === 'onEndRound') {
      switch (joker.id) {
          case 'j_golden': // Earn $4
             result.moneyAdd = 4;
             result.triggered = true;
             result.sound = 'coin';
             break;
          case 'j_cloud_9': // $1 for every 9 in deck (Simplified: just $5)
             result.moneyAdd = 5;
             result.triggered = true;
             result.sound = 'coin';
             break;
          case 'j_rocket': // Earn $1, increases by $2 each round
             // Need state management for this.
             break;
      }
  }

  return result.triggered ? result : null;
};
