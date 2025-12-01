import React from 'react';
import { ICard, Suit } from '../types';
import { SuitIcon } from './Icons';
import { playSfx } from '../services/audio';

interface CardProps {
  card: ICard;
  onClick: (id: string) => void;
  className?: string;
  animationDelay?: number;
  animationClass?: string;
  style?: React.CSSProperties; // Added style prop
}

const Card: React.FC<CardProps> = ({ card, onClick, className = '', animationDelay = 0, animationClass = '', style = {} }) => {
  const isRed = card.suit === Suit.Hearts || card.suit === Suit.Diamonds;
  const colorClass = isRed ? 'text-[#FE5F55]' : 'text-[#3E424B]'; // Balatro Red / Dark Grey
  
  // High contrast pixel-art-esque look
  return (
    <div
      onClick={() => onClick(card.id)}
      onMouseEnter={() => playSfx('focus')}
      className={`
        relative w-24 h-36 bg-[#EFEFEF] rounded-lg cursor-pointer
        border-[3px] border-gray-300 shadow-xl
        transition-all duration-100 ease-out select-none
        hover:brightness-110
        ${card.isDebuffed ? 'brightness-50 grayscale opacity-80' : ''}
        ${card.isSelected ? 'border-[#FE5F55] ring-2 ring-[#FE5F55]' : ''}
        ${className}
        ${animationClass}
      `}
      style={{
        boxShadow: card.isSelected 
            ? '0 10px 0px rgba(0,0,0,0.3)' 
            : '0 4px 0px rgba(0,0,0,0.3)',
        animationDelay: `${animationDelay}s`,
        ...style // Merge custom styles
      }}
    >
        {/* Inner Border for design detail */}
        <div className="absolute inset-1 border border-gray-200 rounded opacity-50 pointer-events-none"></div>

        {/* Top Left Rank/Suit */}
        <div className={`absolute top-1 left-1 flex flex-col items-center ${colorClass}`}>
            <span className="font-bold text-2xl leading-none font-mono tracking-tighter">{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-4 h-4" />
        </div>

        {/* Center Suit */}
        <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
            <SuitIcon suit={card.suit} className="w-12 h-12 opacity-90" />
        </div>

        {/* Rotated Center Suit (Design choice similar to Balatro/standard cards) */}
        {['J', 'Q', 'K'].includes(card.rank) && (
             <div className={`absolute inset-0 flex items-center justify-center ${colorClass} opacity-20`}>
                <span className="text-6xl font-black font-mono">{card.rank}</span>
             </div>
        )}
    </div>
  );
};

export default Card;