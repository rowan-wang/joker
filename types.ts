export enum Suit {
  Hearts = 'Hearts',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
  Spades = 'Spades',
}

export enum Rank {
  Two = '2', Three = '3', Four = '4', Five = '5', Six = '6', Seven = '7', Eight = '8', Nine = '9', Ten = '10',
  Jack = 'J', Queen = 'Q', King = 'K', Ace = 'A'
}

export interface ICard {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // For calculation (2=2, J=10, A=11)
  chips: number; // Base chips provided by card (usually same as value, but modifiers exist)
  isSelected: boolean;
  isDebuffed?: boolean; 
}

export enum HandType {
  HighCard = 'High Card',
  Pair = 'Pair',
  TwoPair = 'Two Pair',
  ThreeOfAKind = 'Three of a Kind',
  Straight = 'Straight',
  Flush = 'Flush',
  FullHouse = 'Full House',
  FourOfAKind = 'Four of a Kind',
  StraightFlush = 'Straight Flush',
  RoyalFlush = 'Royal Flush'
}

export interface IJoker {
  id: string;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  triggerType: 'OnPlay' | 'Passive' | 'Independent' | 'OnDiscard';
  price: number;
  img?: string; // Image URL
  // Simplified effect logic for demo
  multAdd?: number;
  chipsAdd?: number;
  multX?: number;
  condition?: (handType: HandType, cards: ICard[]) => boolean;
  
  // State for scaling jokers (like Green Joker)
  state?: {
    currentMult?: number;
    currentChips?: number;
    [key: string]: any;
  };
  
  // Probability for destroying (1 in X)
  probability?: {
      numerator: number;
      denominator: number;
  };
}

export interface IHandResult {
  type: HandType;
  scoringCards: ICard[];
  baseChips: number;
  baseMult: number;
}

// Legacy IShopItem removed, using the new one below
// export interface IShopItem { ... }

export interface IHandLevel {
  level: number;
  chips: number;
  mult: number;
}

export type ConsumableType = 'Tarot' | 'Planet' | 'Spectral';

export interface IConsumable {
    id: string;
    type: ConsumableType;
    name: string;
    description: string;
    img?: string;
    price: number;
    effect?: string; // e.g. "Flush" for Jupiter
}

export interface IVoucher {
    id: string;
    name: string;
    description: string;
    price: number;
    img?: string;
    redeemed?: boolean;
}

export interface IBoosterPack {
    id: string;
    name: string;
    description: string;
    price: number;
    img?: string;
    type: 'Arcana' | 'Celestial' | 'Standard' | 'Spectral' | 'Buffoon';
}

// Update IShopItem to handle all types
export interface IShopItem {
    id: string;
    type: 'Joker' | 'Voucher' | 'Booster' | 'Consumable';
    price: number;
    itemData: IJoker | IVoucher | IConsumable | IBoosterPack | any;
}