import React from 'react';

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-between overflow-hidden bg-black py-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: 'url(assets/backgrounds/bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Title Section */}
      <div className="z-10 flex flex-col items-center animate-fade-in">
        {/* Game Title */}
        <h1 className="text-8xl font-bold text-white tracking-wider drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: 'Belwe, serif' }}>
          BALATRO
        </h1>
      </div>
        
      {/* Interaction Section */}
      <div className="z-10 flex flex-col items-center animate-fade-in">
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20 shadow-2xl">
            <button 
            type="button"
            onClick={onStart}
            className="group relative px-12 py-4 bg-red-600 hover:bg-red-500 text-white text-2xl font-bold rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] hover:scale-105 active:scale-95 flex items-center gap-3"
            >
        
            <span>PLAY</span>
            
            {/* CRT/Glitch effect overlay on hover could go here */}
            </button>
        </div>
        
        <p className="mt-8 text-white/50 text-sm">
            Cloned with React & ❤️
        </p>
      </div>
      
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_4px,6px_100%]" />
    </div>
  );
};

export default StartMenu;
