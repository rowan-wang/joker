import React from 'react';
import { IShopItem, IJoker, IVoucher, IBoosterPack, IConsumable } from '../types';
import JokerCard from './JokerCard';

interface ShopProps {
    shopItems: IShopItem[];
    money: number;
    rerollCost: number;
    onBuy: (item: IShopItem) => void;
    onReroll: () => void;
    onNextRound: () => void;
}

const Shop: React.FC<ShopProps> = ({
    shopItems,
    money,
    rerollCost,
    onBuy,
    onReroll,
    onNextRound
}) => {
    // Split items by type
    const cards = shopItems.filter(i => i.type === 'Joker');
    const consumables = shopItems.filter(i => i.type === 'Consumable'); // Added consumables
    const vouchers = shopItems.filter(i => i.type === 'Voucher');
    const packs = shopItems.filter(i => i.type === 'Booster');

    const renderJoker = (item: IShopItem) => {
        const joker = item.itemData as IJoker;
        return (
            <div key={item.id} className="flex flex-col items-center group relative hover:z-50">
                <div className="bg-[#2C2F33] text-[#FEAC34] font-black text-lg px-3 py-1 rounded-t-lg border-2 border-b-0 border-gray-600 -mb-1 z-10">
                    ${item.price}
                </div>
                <div 
                    className="relative w-32 h-48 bg-[#36393F] border-4 border-gray-600 rounded-xl hover:border-yellow-500 transition-all cursor-pointer shadow-xl overflow-visible hover:-translate-y-2"
                    onClick={() => onBuy(item)}
                >
                    <div className="w-full h-full p-2">
                         <JokerCard joker={joker} showPrice={false} />
                    </div>
                    
                    {/* Redundant overlay tooltip removed since JokerCard has one, 
                        but JokerCard tooltip position might be clipped in shop. 
                        Let's trust JokerCard's internal tooltip or adjust z-index. 
                        Actually, JokerCard tooltip is absolute left-full. In shop that might be off-screen for rightmost items.
                        Better to implement a shop-specific tooltip if needed, but JokerCard's is pretty good.
                        Let's ensure z-index is high.
                    */}
                </div>
            </div>
        );
    };

    const renderConsumable = (item: IShopItem) => {
        const consumable = item.itemData as IConsumable; // Assuming type safety
        return (
            <div key={item.id} className="flex flex-col items-center group relative hover:z-50">
                <div className="bg-[#2C2F33] text-[#FEAC34] font-black text-lg px-3 py-1 rounded-t-lg border-2 border-b-0 border-gray-600 -mb-1 z-10">
                    ${item.price}
                </div>
                <div 
                    className="relative w-32 h-48 bg-[#2C2F33] border-4 border-gray-600 rounded-xl hover:border-yellow-500 transition-all cursor-pointer shadow-xl flex flex-col items-center justify-center p-2 hover:-translate-y-2"
                    onClick={() => onBuy(item)}
                >
                    {consumable.img ? (
                         <img src={consumable.img} alt={consumable.name} className="w-24 h-24 object-contain mb-2" />
                    ) : (
                         <div className="w-24 h-36 bg-purple-900 rounded border-2 border-purple-400 flex items-center justify-center text-white text-xs text-center p-1 mb-2">
                             {consumable.name}
                         </div>
                    )}
                    <div className="text-white font-bold text-center text-sm leading-tight">{consumable.name}</div>
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute top-full mt-2 w-40 bg-black/90 border border-white/20 rounded p-3 hidden group-hover:block z-[100] pointer-events-none shadow-2xl">
                    <div className="text-yellow-400 font-bold text-base text-center mb-1">{consumable.name}</div>
                    <div className="text-white text-sm text-center leading-snug">{consumable.description}</div>
                </div>
            </div>
        );
    };

    const renderVoucher = (item: IShopItem) => {
        const voucher = item.itemData as IVoucher;
        return (
            <div key={item.id} className="flex flex-col items-center group relative hover:z-50">
                <div className="bg-[#2C2F33] text-[#FEAC34] font-black text-lg px-3 py-1 rounded-t-lg border-2 border-b-0 border-gray-600 -mb-1 z-10">
                    ${item.price}
                </div>
                <div 
                    className="relative w-32 h-48 bg-[#2C2F33] border-4 border-gray-600 rounded-xl hover:border-yellow-500 transition-all cursor-pointer shadow-xl flex flex-col items-center justify-center p-2 hover:-translate-y-2"
                    onClick={() => onBuy(item)}
                >
                    {voucher.img ? (
                         <img src={voucher.img} alt={voucher.name} className="w-24 h-24 object-contain mb-2" />
                    ) : (
                         <div className="text-6xl mb-2">🎟️</div>
                    )}
                    <div className="text-white font-bold text-center text-sm leading-tight">{voucher.name}</div>
                    {/* <div className="text-gray-400 text-[10px] text-center mt-1 leading-tight">{voucher.description}</div> */}
                </div>
            </div>
        );
    };

    const renderPack = (item: IShopItem) => {
        const pack = item.itemData as IBoosterPack;
        return (
            <div key={item.id} className="flex flex-col items-center group relative hover:z-50">
                 <div className="bg-[#2C2F33] text-[#FEAC34] font-black text-lg px-3 py-1 rounded-t-lg border-2 border-b-0 border-gray-600 -mb-1 z-10">
                    ${item.price}
                </div>
                <div 
                    className="relative w-32 h-48 bg-gradient-to-b from-blue-900 to-blue-700 border-4 border-gray-600 rounded-xl hover:border-yellow-500 transition-all cursor-pointer shadow-xl flex flex-col items-center justify-center p-2 hover:-translate-y-2"
                    onClick={() => onBuy(item)}
                >
                    {pack.img ? (
                         <img src={pack.img} alt={pack.name} className="w-full h-full object-cover rounded" />
                    ) : (
                         <div className="text-6xl mb-2">📦</div>
                    )}
                    <div className="absolute bottom-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">
                        {pack.name}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-[#2C2F33] border-4 border-[#FF4D4D] rounded-3xl p-8 flex shadow-2xl relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 bg-[url('/assets/backgrounds/bg.jpg')] opacity-10 bg-cover pointer-events-none"></div>

             {/* LEFT CONTROLS */}
             <div className="w-48 flex flex-col gap-4 z-10 mr-8">
                <button 
                    type="button"
                    onClick={onNextRound}
                    className="h-32 bg-[#FF4D4D] hover:bg-[#ff6666] border-b-8 border-[#990000] active:border-b-0 active:translate-y-2 rounded-xl flex flex-col items-center justify-center shadow-xl transition-all"
                >
                    <span className="text-white font-black text-2xl leading-tight text-center">下一个<br/>回合</span>
                </button>

                <button 
                    type="button"
                    onClick={onReroll}
                    disabled={money < rerollCost}
                    className={`h-32 bg-[#4CAF50] hover:bg-[#5cb860] border-b-8 border-[#2e7d32] active:border-b-0 active:translate-y-2 rounded-xl flex flex-col items-center justify-center shadow-xl transition-all ${money < rerollCost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-white font-black text-xl mb-1">重掷</span>
                    <span className="text-[#FEAC34] font-black text-3xl drop-shadow-md">${rerollCost}</span>
                </button>
                
                <div className="mt-auto">
                    <div className="text-gray-500 font-bold text-lg transform -rotate-90 origin-bottom-left whitespace-nowrap translate-x-8 -translate-y-8">
                        底注 {8} 优惠券
                    </div>
                </div>
             </div>

             {/* ITEMS GRID */}
             <div className="flex-1 flex flex-col gap-8 z-10">
                 {/* TOP ROW: CARDS/JOKERS & CONSUMABLES */}
                 <div className="flex gap-6 h-1/2 items-center px-4 bg-black/20 rounded-2xl border-2 border-gray-700/50">
                     {cards.map(renderJoker)}
                     {consumables.map(renderConsumable)}
                     {/* Fillers if empty */}
                     {cards.length === 0 && consumables.length === 0 && <div className="text-gray-500 font-bold text-2xl w-full text-center">售罄</div>}
                 </div>

                 {/* BOTTOM ROW: VOUCHERS & PACKS */}
                 <div className="flex gap-6 h-1/2 items-center px-4 bg-black/20 rounded-2xl border-2 border-gray-700/50">
                     {vouchers.map(renderVoucher)}
                     <div className="w-px h-32 bg-gray-600 mx-2"></div>
                     {packs.map(renderPack)}
                 </div>
             </div>
        </div>
    );
};

export default Shop;
