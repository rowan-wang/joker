import jokersData from '@/src/data/jokers.json';
import decksData from '@/src/data/decks.json';
import blindsData from '@/src/data/blinds.json';
import { IJoker } from '../types';
import { translateText } from './translation';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface IDeckDef {
    id: string;
    name: string;
    description: string;
    img: string;
    effect?: (state: any) => void; // Placeholder for logic
}

export interface IBlindDef {
    id: string;
    name: string;
    description: string;
    scoreMult: number; // e.g. 2 for 2x base
    img: string;
}

// ----------------------------------------------------------------------
// Parsers & Normalizers
// ----------------------------------------------------------------------

const parseJoker = (raw: any): IJoker => {
    const description = translateText(raw.description || '');
    const name = translateText(raw.name || 'Unknown');
    const id = raw.id;
    
    // Clean Rarity
    let rarity = raw.rarity || 'Common';
    if (rarity.includes('Common')) rarity = 'Common';
    if (rarity.includes('Uncommon')) rarity = 'Uncommon';
    if (rarity.includes('Rare')) rarity = 'Rare';
    if (rarity.includes('Legendary')) rarity = 'Legendary';

    const joker: IJoker = {
        id,
        name,
        description,
        rarity: rarity as any,
        price: raw.price || 4,
        triggerType: 'Passive', // Default
        img: id === 'j_hologram' ? `/assets/jokers/${id}.gif` : `/assets/jokers/${id}.png`
    };

    // Auto-detect simple effects using RAW description (English) to avoid translation issues
    const rawDesc = (raw.description || '').toLowerCase();

    // +X Mult
    const multMatch = raw.description?.match(/\+(\d+)\s*Mult/i);
    if (multMatch) {
        joker.multAdd = parseInt(multMatch[1]);
        joker.triggerType = 'OnPlay';
    }

    // +X Chips
    const chipsMatch = raw.description?.match(/\+(\d+)\s*Chips/i);
    if (chipsMatch) {
        joker.chipsAdd = parseInt(chipsMatch[1]);
        joker.triggerType = 'OnPlay';
    }

    // X3 Mult
    const xMultMatch = raw.description?.match(/X(\d+(\.\d+)?)\s*Mult/i);
    if (xMultMatch) {
        joker.multX = parseFloat(xMultMatch[1]);
        joker.triggerType = 'OnPlay';
    }

    // Suits
    if (rawDesc.includes('spade')) {
        joker.condition = (_, cards) => cards.some(c => c.suit === 'Spades');
        joker.triggerType = 'OnPlay';
    }
    if (rawDesc.includes('heart')) {
        joker.condition = (_, cards) => cards.some(c => c.suit === 'Hearts');
        joker.triggerType = 'OnPlay';
    }
    if (rawDesc.includes('club')) {
        joker.condition = (_, cards) => cards.some(c => c.suit === 'Clubs');
        joker.triggerType = 'OnPlay';
    }
    if (rawDesc.includes('diamond')) {
        joker.condition = (_, cards) => cards.some(c => c.suit === 'Diamonds');
        joker.triggerType = 'OnPlay';
    }

    // Ranks
    if (rawDesc.includes('even')) {
        joker.condition = (_, cards) => cards.some(c => ['2','4','6','8','10'].includes(c.rank));
        joker.triggerType = 'OnPlay';
    }
    if (rawDesc.includes('odd')) {
        joker.condition = (_, cards) => cards.some(c => ['A','3','5','7','9'].includes(c.rank));
        joker.triggerType = 'OnPlay';
    }
    if (rawDesc.includes('face card')) {
        joker.condition = (_, cards) => cards.some(c => ['K','Q','J'].includes(c.rank));
        joker.triggerType = 'OnPlay';
    }

    return joker;
};

// ----------------------------------------------------------------------
// Registry
// ----------------------------------------------------------------------

export const ALL_JOKERS = jokersData.map(parseJoker);

export const ALL_DECKS: IDeckDef[] = decksData.map((d: any) => ({
    id: d.id,
    name: translateText(d.name),
    description: translateText(d.description),
    img: d.img
}));

// Filter out Small/Big blinds to get Boss Blinds
export const BOSS_BLINDS: IBlindDef[] = blindsData
    .filter((b: any) => !['Small Blind', 'Big Blind'].includes(b.name))
    .map((b: any) => ({
        id: b.id,
        name: translateText(b.name),
        description: translateText(b.scoreBase), // Mapped from scraping issue
        scoreMult: parseFloat(b.effect?.replace(/x\s*base/i, '')) || 2,
        img: b.img
    }));

export const getJokerById = (id: string) => ALL_JOKERS.find(j => j.id === id);
