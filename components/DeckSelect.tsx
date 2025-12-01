import React from 'react';
import { ALL_DECKS } from '../services/gameData';

interface DeckSelectProps {
    onSelect: (deckId: string) => void;
}

const DeckSelect: React.FC<DeckSelectProps> = ({ onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">选择牌组</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[70vh] w-full max-w-6xl px-4 scrollbar-hide">
                {ALL_DECKS.map((deck) => (
                    <div 
                        key={deck.id}
                        onClick={() => onSelect(deck.id)}
                        className="relative group cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border-4 border-gray-700 group-hover:border-yellow-400 shadow-2xl bg-gray-800 relative">
                             {deck.img ? (
                                <img src={deck.img} alt={deck.name} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🃏</div>
                             )}
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 rounded-b-xl backdrop-blur-sm">
                            <h3 className="text-white font-bold text-lg leading-tight mb-1">{deck.name}</h3>
                            <p className="text-gray-300 text-xs leading-tight">{deck.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeckSelect;
