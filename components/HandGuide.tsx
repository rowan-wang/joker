import React from 'react';
import { HAND_NAMES } from '../constants';
import { HandType, IHandLevel } from '../types';

interface HandGuideProps {
    isOpen: boolean;
    onClose: () => void;
    handLevels: Record<HandType, IHandLevel>;
}

const HAND_ORDER = [
    HandType.StraightFlush,
    HandType.FourOfAKind,
    HandType.FullHouse,
    HandType.Flush,
    HandType.Straight,
    HandType.ThreeOfAKind,
    HandType.TwoPair,
    HandType.Pair,
    HandType.HighCard
];

const HAND_DESCRIPTIONS: Record<HandType, string> = {
    [HandType.StraightFlush]: "五张同花色的连续牌",
    [HandType.FourOfAKind]: "四张点数相同的牌",
    [HandType.FullHouse]: "三张点数相同 + 两张点数相同",
    [HandType.Flush]: "五张同花色的牌 (非连续)",
    [HandType.Straight]: "五张连续的牌 (非同花)",
    [HandType.ThreeOfAKind]: "三张点数相同的牌",
    [HandType.TwoPair]: "两对点数相同的牌",
    [HandType.Pair]: "一对点数相同的牌",
    [HandType.HighCard]: "无法组成以上牌型，取最大点数",
    [HandType.RoyalFlush]: "同花色的 A, K, Q, J, 10"
};

const HandGuide: React.FC<HandGuideProps> = ({ isOpen, onClose, handLevels }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-[#2C2F33] w-[800px] max-h-[80vh] overflow-y-auto rounded-xl border-4 border-black shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                    <h2 className="text-4xl font-black text-white tracking-tighter">牌型指南 (Run Info)</h2>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                    >
                        关闭
                    </button>
                </div>

                <div className="grid gap-4">
                    {HAND_ORDER.map(handType => {
                        const level = handLevels[handType];
                        return (
                            <div key={handType} className="bg-[#36393F] p-4 rounded-lg flex justify-between items-center border-2 border-gray-700 hover:border-blue-500 transition-colors">
                                <div>
                                    <div className="text-xl font-bold text-blue-300 mb-1">
                                        {HAND_NAMES[handType]} 
                                        <span className="text-xs text-gray-500 ml-2 uppercase tracking-widest">lvl.{level.level}</span>
                                    </div>
                                    <div className="text-sm text-gray-400">{HAND_DESCRIPTIONS[handType]}</div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-[#0099FF] px-3 py-1 rounded text-white font-mono font-bold border border-blue-400 shadow-md min-w-[60px] text-center">
                                        {level.chips}
                                    </div>
                                    <span className="text-red-500 font-black">X</span>
                                    <div className="bg-[#FF4D4D] px-3 py-1 rounded text-white font-mono font-bold border border-red-400 shadow-md min-w-[60px] text-center">
                                        {level.mult}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HandGuide;
