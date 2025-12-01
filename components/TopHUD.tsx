import React from 'react';
import { IJoker, IConsumable } from '../types';
import JokerCard from './JokerCard';

interface TopHUDProps {
    jokers: IJoker[];
    consumables: IConsumable[];
    maxJokers?: number;
    maxConsumables?: number;
    triggeringJokerId?: string | null;
    onUseConsumable?: (item: IConsumable) => void;
    onSellJoker?: (joker: IJoker) => void;
}

const TopHUD: React.FC<TopHUDProps> = ({ 
    jokers, 
    consumables, 
    maxJokers = 5, 
    maxConsumables = 3,
    triggeringJokerId,
    onUseConsumable,
    onSellJoker
}) => {
    return (
        <div className="w-full h-32 bg-[#2C2F33]/90 flex items-center justify-between px-8 border-b-4 border-black z-40">
            {/* JOKERS AREA */}
            <div className="flex items-center space-x-2 hover:z-50">
                {jokers.map((joker) => (
                    <div 
                        key={joker.id} 
                        className={`
                            relative w-16 h-24 transition-all duration-200 z-10 hover:z-50 group
                            ${triggeringJokerId === joker.id ? 'scale-125 z-50 ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-joker-shake' : 'hover:scale-110'}
                        `}
                    >
                        <JokerCard joker={joker} showPrice={false} size="sm" />
                        
                        {/* Sell Button Overlay */}
                        {onSellJoker && (
                            <button 
                                type="button"
                                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-red-800 opacity-0 group-hover:opacity-100 transition-opacity z-[60] shadow-lg whitespace-nowrap"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const sellPrice = Math.max(1, Math.floor(joker.price / 2));
                                    if (window.confirm(`确定以 $${sellPrice} 卖出 ${joker.name} 吗?`)) {
                                        onSellJoker(joker);
                                    }
                                }}
                            >
                                卖出 ${Math.max(1, Math.floor(joker.price / 2))}
                            </button>
                        )}
                    </div>
                ))}
                {/* Empty Slots */}
                {[...Array(Math.max(0, maxJokers - jokers.length))].map((_, i) => (
                    <div key={`empty-j-${i}`} className="w-16 h-24 bg-black/20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-xs">小丑</span>
                    </div>
                ))}
                <div className="text-gray-500 text-xs font-bold self-end mb-2 ml-1">{jokers.length}/{maxJokers}</div>
            </div>

            {/* CONSUMABLES AREA */}
            <div className="flex items-center space-x-2">
                {consumables.map((item) => (
                    <div 
                        key={item.id} 
                        className="relative w-16 h-24 bg-purple-900 rounded border-2 border-purple-400 hover:border-yellow-400 hover:scale-110 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-visible z-20 hover:z-50"
                        onClick={() => onUseConsumable && onUseConsumable(item)}
                    >
                        {item.img ? (
                             <img src={item.img} alt={item.name} className="w-12 h-12 object-contain mb-1" />
                        ) : (
                            <div className="text-white text-xs font-bold text-center px-1">{item.name}</div>
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute top-full mt-2 w-32 bg-black/90 border border-white/20 rounded p-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="text-yellow-400 font-bold text-sm text-center mb-1">{item.name}</div>
                            <div className="text-white text-xs text-center">{item.description}</div>
                            <div className="text-gray-400 text-[10px] text-center mt-1">点击使用</div>
                        </div>
                    </div>
                ))}
                {/* Empty Slots */}
                {[...Array(Math.max(0, maxConsumables - consumables.length))].map((_, i) => (
                    <div key={`empty-c-${i}`} className="w-16 h-24 bg-black/20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-xs">道具</span>
                    </div>
                ))}
                 <div className="text-gray-500 text-xs font-bold self-end mb-2 ml-1">{consumables.length}/{maxConsumables}</div>
            </div>
        </div>
    );
};

export default TopHUD;
