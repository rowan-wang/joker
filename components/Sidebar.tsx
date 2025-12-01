import React from 'react';
import { HandType, IHandLevel } from '../types';
import { HAND_NAMES } from '../constants';
import ScoreBox from './ScoreBox';

interface SidebarProps {
    roundScore: number;
    targetScore: number;
    chips: number;
    mult: number;
    handsLeft: number;
    discardsLeft: number;
    money: number;
    ante: number;
    round: number;
    currentHandType: HandType;
    phase: string;
    handLevel: IHandLevel;
    onOpenRunInfo: () => void;
    scoreIntensity?: 'none' | 'medium' | 'high';
}

const Sidebar: React.FC<SidebarProps> = ({
    roundScore,
    targetScore,
    chips,
    mult,
    handsLeft,
    discardsLeft,
    money,
    // ante, // Unused now, derived from round
    round,
    currentHandType,
    phase,
    handLevel,
    onOpenRunInfo,
    scoreIntensity = 'none'
}) => {
    return (
        <div className="w-72 bg-[#2C2F33] flex flex-col h-screen border-r-4 border-black shadow-2xl z-50 relative">
            {/* LOGO AREA */}
            <div className="h-32 bg-[#FF4D4D] flex flex-col items-center justify-center border-b-4 border-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/backgrounds/bg.jpg')] opacity-20 bg-cover"></div>
                <h1 className="text-5xl font-black text-[#FEAC34] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-tighter z-10 stroke-black" style={{ WebkitTextStroke: '2px black' }}>
                    BALATRO
                </h1>
                <p className="text-white font-bold text-sm mt-1 drop-shadow-md z-10">来变强吧!</p>
                
                {/* Bulb Lights Effect */}
                <div className="absolute inset-0 border-4 border-dashed border-[#FEAC34]/50 m-2 rounded-lg pointer-events-none"></div>
            </div>

            {/* ROUND SCORE */}
            <div className="bg-[#2C2F33] p-4 border-b-4 border-black">
                <div className="text-center">
                    <div className="text-gray-400 text-xs font-bold mb-1">回合分数</div>
                    <div className="flex items-center justify-center space-x-2">
                         <span className="text-2xl">❄️</span>
                         <span className="text-3xl font-black text-white tracking-widest">{roundScore}</span>
                    </div>
                    <div className="text-red-400 text-xs font-bold mt-1">目标: {targetScore}</div>
                </div>
            </div>

            {/* CALCULATOR */}
            <div className="bg-[#2C2F33] p-6 flex flex-col items-center justify-center border-b-4 border-black min-h-[120px]">
                <div className="flex items-center space-x-2 text-4xl font-black tracking-tighter">
                    <div className={`transform transition-transform ${phase === 'scoring' ? 'scale-110' : ''}`}>
                        <ScoreBox 
                            label="" 
                            value={phase === 'scoring' ? chips : handLevel.chips} 
                            color="blue" 
                            showFire={scoreIntensity === 'high' || scoreIntensity === 'medium'} 
                        />
                    </div>
                    <span className="text-red-500 text-2xl">X</span>
                    <div className={`transform transition-transform ${phase === 'scoring' ? 'scale-110' : ''}`}>
                        <ScoreBox 
                            label="" 
                            value={phase === 'scoring' ? mult : handLevel.mult} 
                            color="red" 
                            showFire={scoreIntensity === 'high' || scoreIntensity === 'medium'} 
                        />
                    </div>
                </div>
                <div className="mt-2 text-gray-400 text-xs font-bold uppercase">{HAND_NAMES[currentHandType]} LVL.{handLevel.level}</div>
            </div>

            {/* STATS GRID */}
            <div className="flex-1 bg-[#2C2F33] p-4 flex flex-col gap-3">
                
                <div className="flex space-x-2">
                    <div className="flex-1 bg-[#FF4D4D] rounded-lg p-2 flex flex-col items-center justify-center border-2 border-black shadow-[2px_2px_0_black]">
                        <span className="text-white text-xs font-bold">比赛信息</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="bg-[#0099FF] rounded p-1 flex justify-between px-2 items-center border border-black">
                            <span className="text-[10px] text-white font-bold">出牌</span>
                            <span className="text-white font-black text-lg">{handsLeft}</span>
                        </div>
                        <div className="bg-[#FF4D4D] rounded p-1 flex justify-between px-2 items-center border border-black">
                            <span className="text-[10px] text-white font-bold">弃牌</span>
                            <span className="text-white font-black text-lg">{discardsLeft}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#2C2F33] rounded-lg border-2 border-black p-2 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors"></div>
                    <span className="text-[#FEAC34] font-black text-4xl drop-shadow-md">$ {money}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                     <div 
                        className="bg-[#FEAC34] rounded-lg p-2 flex flex-col items-center justify-center border-2 border-black shadow-[2px_2px_0_black] cursor-pointer hover:bg-[#ffbc5c] transition-colors active:translate-y-1 active:shadow-none"
                        onClick={onOpenRunInfo}
                     >
                        <span className="text-black font-black text-sm">选项 / 指南</span>
                    </div>
                    <div className="flex flex-col gap-1">
                         <div className="bg-[#333] rounded p-1 flex justify-between px-2 items-center border border-gray-600">
                            <span className="text-[10px] text-gray-400 font-bold">底注</span>
                            <span className="text-[#FEAC34] font-bold text-lg">{Math.ceil(round / 3)}/8</span>
                        </div>
                        <div className="bg-[#333] rounded p-1 flex justify-between px-2 items-center border border-gray-600">
                            <span className="text-[10px] text-gray-400 font-bold">回合</span>
                            <span className="text-[#FEAC34] font-bold text-lg">{round}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
