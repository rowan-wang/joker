import React from 'react';
import { IJoker } from '../types';
import { playSfx } from '../services/audio';

interface JokerProps {
  joker: IJoker;
  onClick?: () => void;
  showPrice?: boolean;
  size?: 'sm' | 'md';
}

const JokerCard: React.FC<JokerProps> = ({ joker, onClick, showPrice = false, size = 'md' }) => {
    const [imageError, setImageError] = React.useState(false);

    const widthClass = size === 'sm' ? 'w-16' : 'w-24';
    const heightClass = size === 'sm' ? 'h-24' : 'h-36';

    // Rarity Colors
    const borderColor = {
        'Common': 'border-blue-400',
        'Uncommon': 'border-green-400',
        'Rare': 'border-red-500',
        'Legendary': 'border-purple-500'
    }[joker.rarity];

    const bgColor = {
        'Common': 'bg-blue-900',
        'Uncommon': 'bg-green-900',
        'Rare': 'bg-red-900',
        'Legendary': 'bg-purple-900'
    }[joker.rarity];
    
    const rarityCN = {
        'Common': '普通',
        'Uncommon': '罕见',
        'Rare': '稀有',
        'Legendary': '传奇'
    }[joker.rarity];

  return (
    <div 
        onClick={onClick}
        onMouseEnter={() => playSfx('focus')}
        className={`
        relative ${widthClass} ${heightClass} ${bgColor} rounded-md border-2 ${borderColor}
        shadow-lg flex flex-col items-center justify-center
        transform hover:scale-105 transition-transform duration-200 cursor-help
        group select-none overflow-visible
    `}>
        {showPrice && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold px-2 py-0.5 rounded-full border border-black z-20 shadow-md text-sm">
                ${joker.price}
            </div>
        )}

        <div className="w-full h-full overflow-hidden rounded-[4px]">
             {imageError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-1">
                     <div className="text-white font-bold text-xs leading-tight mb-1 text-center">{joker.name}</div>
                     <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-2xl">
                        🤡
                    </div>
                </div>
             ) : (
                <img 
                    src={joker.img || `/assets/jokers/${joker.id}.png`} 
                    alt={joker.name}
                    className="w-full h-full object-cover rendering-pixelated"
                    onError={() => setImageError(true)}
                />
             )}
        </div>

        {/* Tooltip */}
        <div className="absolute top-1/2 left-full ml-3 w-56 bg-black/95 text-white p-4 rounded-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border-2 border-white/20 shadow-2xl transform -translate-y-1/2">
            <div className={`absolute top-1/2 -left-2 w-4 h-4 bg-black/95 border-l-2 border-b-2 border-white/20 transform rotate-45 -translate-y-1/2`}></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2 border-b border-white/20 pb-2">
                    <h3 className="font-bold text-lg text-[#FE5F55] leading-none">{joker.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${bgColor} border ${borderColor}`}>
                        {rarityCN}
                    </span>
                </div>
                <p className="text-sm leading-relaxed font-medium text-gray-200">{joker.description}</p>
                <div className="mt-3 text-[10px] text-gray-500 font-mono uppercase">
                    价格: ${joker.price}
                </div>
            </div>
        </div>
    </div>
  );
};

export default JokerCard;