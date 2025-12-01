import React, { useState, useEffect, useRef } from 'react';
import { createDeck, evaluateHand } from './services/pokerLogic';
import { Suit, ICard, IJoker, HandType, IShopItem, IHandLevel, IConsumable, IVoucher } from './types';
import { JOKER_POOL, MAX_HAND_SIZE, MAX_PLAY_SIZE, HAND_NAMES, BASE_HAND_STATS, ANTE_BASE_SCORES } from './constants';
import Card from './components/Card';
import * as Audio from './services/audio';
import { calculateJokerEffect, IMPLEMENTED_JOKERS } from './services/jokerLogic'; // Import new logic

import StartMenu from './components/StartMenu';
import DeckSelect from './components/DeckSelect';
import Sidebar from './components/Sidebar';
import TopHUD from './components/TopHUD';
import Shop from './components/Shop';
import HandGuide from './components/HandGuide'; // Import HandGuide
// import ParticleSystem from './components/ParticleSystem';
// import ScoreBox from './components/ScoreBox'; // Removed unused import
import { BOSS_BLINDS, IBlindDef } from './services/gameData';

import { PLANET_CARDS } from './services/planetData';

// ----------------------------------------------------------------------
// Types & States for Animation
// ----------------------------------------------------------------------
type Phase = 'startMenu' | 'idle' | 'scoring' | 'discarding' | 'gameover' | 'victory' | 'shop' | 'deckSelect';

const App: React.FC = () => {
  // Game State
  const [deck, setDeck] = useState<ICard[]>([]);
  const [hand, setHand] = useState<ICard[]>([]);
  // const [discardPile, setDiscardPile] = useState<ICard[]>([]); // Removed unused state
  const [jokers, setJokers] = useState<IJoker[]>([]);
  const [consumables, setConsumables] = useState<IConsumable[]>([]);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  
  // Stats
  const [handLevels, setHandLevels] = useState<Record<HandType, IHandLevel>>(JSON.parse(JSON.stringify(BASE_HAND_STATS)));
  const [money, setMoney] = useState(4); // Starting money
  
  // Round State
  const [roundScore, setRoundScore] = useState(0);
  const [targetScore, setTargetScore] = useState(300);
  const [handsLeft, setHandsLeft] = useState(4);
  const [discardsLeft, setDiscardsLeft] = useState(3);
  const [roundLevel, setRoundLevel] = useState(1); // Ante
  const [currentBlind, setCurrentBlind] = useState<IBlindDef | null>(null);
  
  // Shop State
  const [shopItems, setShopItems] = useState<IShopItem[]>([]);

  // UI State
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [currentHandType, setCurrentHandType] = useState<HandType>(HandType.HighCard);
  const [phase, setPhase] = useState<Phase>('startMenu');
  const [showHandGuide, setShowHandGuide] = useState(false); // New State
  const [showTutorial, setShowTutorial] = useState(false); // New State
  
  // Animation specific states
  const [exitingCardIds, setExitingCardIds] = useState<string[]>([]);
  const [dealingCardIds, setDealingCardIds] = useState<string[]>([]);
  const [playedCards, setPlayedCards] = useState<ICard[]>([]); // New state for cards in play area
  const [scoreIntensity, setScoreIntensity] = useState<'none' | 'medium' | 'high'>('none');
  const [triggeringJokerId, setTriggeringJokerId] = useState<string | null>(null);
  const [triggeringCardId, setTriggeringCardId] = useState<string | null>(null); // New state for highlighting scoring card

  // Scoring Animation State
  const [displayChips, setDisplayChips] = useState(0);
  const [displayMult, setDisplayMult] = useState(0);
  // const [displayTotal, setDisplayTotal] = useState(0); 

  const audioInitialized = useRef(false);
  // const [isMuted, setIsMuted] = useState(false);

  const handleInitAudio = () => {
      if (!audioInitialized.current) {
          Audio.initAudio();
          Audio.startBGM();
          audioInitialized.current = true;
      }
  };

  // const toggleMute = () => {
  //    const m = Audio.toggleMute();
  //    setIsMuted(m);
  // };

  const startNewRound = (level: number, resetDeck: boolean) => {
    // Level in this context is cumulative round number
    // Ante calculation: 1, 2, 3 -> Ante 1; 4, 5, 6 -> Ante 2
    const ante = Math.ceil(level / 3);
    const roundInAnte = (level - 1) % 3 + 1; // 1=Small, 2=Big, 3=Boss
    
    // Determine Blind Type
    let blindType: 'Small' | 'Big' | 'Boss' = 'Small';
    if (roundInAnte === 2) blindType = 'Big';
    if (roundInAnte === 3) blindType = 'Boss';
    
    // Boss Logic
    if (blindType === 'Boss') {
        const randomBlind = BOSS_BLINDS[Math.floor(Math.random() * BOSS_BLINDS.length)];
        setCurrentBlind(randomBlind);
        
        // Boss Effects Implementation
        // 1. The Needle: Play only 1 hand (Set handsLeft to 1)
        if (randomBlind.name === 'The Needle' || randomBlind.name === '针') {
             setHandsLeft(1);
        }
    } else {
        setCurrentBlind(null);
    }
    
    // Calculate Target Score based on Ante Base
    // Safe fallback if ante exceeds defined array
    const baseScore = ANTE_BASE_SCORES[ante - 1] || ANTE_BASE_SCORES[ANTE_BASE_SCORES.length - 1] * Math.pow(2, ante - ANTE_BASE_SCORES.length);
    
    let target = baseScore;
    if (blindType === 'Big') target = Math.floor(baseScore * 1.5);
    if (blindType === 'Boss') {
        // Apply boss multiplier if present, otherwise 2x
        // Note: currentBlind state might not update immediately in this render cycle, but logic is fine as we just set it
        // Actually, we need to use the randomBlind reference if we just generated it
        // Re-logic:
        if (roundInAnte === 3) {
             // We haven't set state yet effectively for read, so rely on base 2x for now or refactor
             // Ideally we use the variable we just picked
             // Let's just use 2x Base for now as standard, special bosses might have custom mults in future
             target = baseScore * 2;
        }
    }
    
    setTargetScore(target);
    
    setHandsLeft(4);
    setDiscardsLeft(currentBlind?.name === 'The Water' || currentBlind?.name === '水' ? 0 : 3);
    
    let currentDeck = deck;
    if (resetDeck || deck.length < MAX_HAND_SIZE) {
        currentDeck = createDeck();
    } else {
        // Simple reshuffle logic for MVP
        currentDeck = createDeck(); 
    }

    const dealtHand = currentDeck.splice(0, MAX_HAND_SIZE);

    setDeck(currentDeck);
    setHand(dealtHand);
    // setDiscardPile([]);
    setRoundScore(0);
    setRoundLevel(level);
    setSelectedCardIds([]);
    setPhase('idle');
    // setDisplayTotal(0);
    setDisplayChips(0);
    setDisplayMult(0);

    // Trigger deal animation for all cards
    setDealingCardIds(dealtHand.map(c => c.id));
    // Play sound staggered
    dealtHand.forEach((_, i) => {
        setTimeout(() => Audio.playSfx('deal'), i * 50);
    });
    setTimeout(() => setDealingCardIds([]), 1000);
  };

  const handleRestart = () => {
      Audio.playSfx('select');
      setJokers([]);
      setConsumables([]);
      setMoney(4);
      setHandLevels(JSON.parse(JSON.stringify(BASE_HAND_STATS)));
      setPhase('deckSelect');
      // startNewRound will be called after deck select
  };

  // ----------------------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------------------
  useEffect(() => {
    // Start initial game with Start Menu
    setPhase('startMenu');
    // Show tutorial on first load (mock)
    if (!localStorage.getItem('balatro_tutorial_seen')) {
         setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
      setShowTutorial(false);
      localStorage.setItem('balatro_tutorial_seen', 'true');
  };

  // ----------------------------------------------------------------------
  // Shop Logic
  // ----------------------------------------------------------------------
  const generateShop = () => {
      const items: IShopItem[] = [];
      
      // 1. Two Random Jokers
      for(let i=0; i<2; i++) {
          const randomJoker = JOKER_POOL[Math.floor(Math.random() * JOKER_POOL.length)];
          items.push({
              id: `shop_joker_${Date.now()}_${i}`,
              type: 'Joker',
              price: randomJoker.price,
              itemData: randomJoker
          });
      }

      // 2. One Consumable (Planet Card)
      const randomPlanet = PLANET_CARDS[Math.floor(Math.random() * PLANET_CARDS.length)];
      items.push({
          id: `shop_consumable_${Date.now()}`,
          type: 'Consumable',
          price: 4,
          itemData: {
              id: `c_${Date.now()}`,
              type: 'Planet',
              name: randomPlanet.name,
              description: randomPlanet.desc,
              price: 4,
              effect: randomPlanet.effect,
              img: randomPlanet.img
          }
      });

      // 3. One Voucher (Mock)
      items.push({
          id: `shop_voucher_${Date.now()}`,
          type: 'Voucher',
          price: 10,
          itemData: {
              id: 'v_telescope',
              name: '望远镜',
              description: '星球包总是有你最常用的牌型',
              price: 10,
              redeemed: false
          }
      });

       // 4. One Booster Pack (Mock)
       items.push({
        id: `shop_pack_${Date.now()}`,
        type: 'Booster',
        price: 4,
        itemData: {
            id: 'p_standard',
            name: '标准包',
            description: '包含3张扑克牌',
            price: 4,
            type: 'Standard'
        }
    });

      setShopItems(items);
  };

  const buyItem = (item: IShopItem) => {
      if (money < item.price) {
          Audio.playSfx('error');
          return;
      }

      if (item.type === 'Joker') {
          if (jokers.length >= 5) {
              alert("小丑槽位已满!"); 
              return;
          }
          setJokers([...jokers, item.itemData as IJoker]);
          Audio.playSfx('chip');
      } else if (item.type === 'Consumable') {
           if (consumables.length >= 3) {
               alert("消耗品槽位已满!");
               return;
           }
           setConsumables([...consumables, item.itemData as IConsumable]);
           Audio.playSfx('chip');
      } else if (item.type === 'Voucher') {
           // Apply voucher effect
           setVouchers([...vouchers, item.itemData as IVoucher]);
           Audio.playSfx('chip');
      } else if (item.type === 'Booster') {
          // Open pack logic (Simplified: just alert for now)
          alert("补充包暂未完全实现!");
          return;
      }

      setMoney(prev => prev - item.price);
      setShopItems(prev => prev.filter(i => i.id !== item.id));
  };

  const skipShop = () => {
      Audio.playSfx('select');
      startNewRound(roundLevel + 1, true);
  };

  // ----------------------------------------------------------------------
  // Interaction Logic
  // ----------------------------------------------------------------------
  const toggleCardSelection = (id: string) => {
    handleInitAudio();
    if (phase !== 'idle') return;

    Audio.playSfx('select');

    setHand(prev => prev.map(c => 
        c.id === id ? { ...c, isSelected: !c.isSelected } : c
    ));

    setSelectedCardIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id);
      } else {
        if (prev.length >= MAX_PLAY_SIZE) return prev;
        return [...prev, id];
      }
    });
  };

  // Update Hand Type Preview
  useEffect(() => {
    const selectedCards = hand.filter(c => selectedCardIds.includes(c.id));
    if (selectedCards.length > 0) {
      const evalResult = evaluateHand(selectedCards);
      setCurrentHandType(evalResult.type);
    } else {
      setCurrentHandType(HandType.HighCard); 
    }
  }, [selectedCardIds, hand]);

  // ----------------------------------------------------------------------
  // Game Actions
  // ----------------------------------------------------------------------
  const handleDiscard = () => {
    handleInitAudio();
    if (phase !== 'idle' || discardsLeft <= 0 || selectedCardIds.length === 0) return;

    Audio.playSfx('discard');
    setPhase('discarding');
    
    // Mark cards for animation
    setExitingCardIds([...selectedCardIds]);

    // Update Green Joker on Discard
    const newJokers = jokers.map(j => {
        if (j.id === 'j_green_joker' && j.state) {
             // Green Joker: -1 Mult per discard
             const currentMult = j.state.currentMult || 0;
             return { ...j, state: { ...j.state, currentMult: Math.max(0, currentMult - 1) } };
        }
        return j;
    });
    if (JSON.stringify(newJokers) !== JSON.stringify(jokers)) {
        setJokers(newJokers);
    }

    setTimeout(() => {
        const remainingHand = hand.filter(c => !selectedCardIds.includes(c.id));
        // const discardedCards = hand.filter(c => selectedCardIds.includes(c.id));
        
        // setDiscardPile(prev => [...prev, ...discardedCards]);

        const cardsNeeded = MAX_HAND_SIZE - remainingHand.length;
        let currentDeck = [...deck];
        
        if (currentDeck.length < cardsNeeded) {
            currentDeck = [...currentDeck, ...createDeck()]; 
        }

        const newCards = currentDeck.splice(0, cardsNeeded);
        
        // Trigger deal animation for new cards
        setDealingCardIds(newCards.map(c => c.id));
        newCards.forEach((_, i) => setTimeout(() => Audio.playSfx('deal'), i * 50));

        setHand([...remainingHand, ...newCards]);
        setDeck(currentDeck);
        setDiscardsLeft(prev => prev - 1);
        setSelectedCardIds([]);
        setExitingCardIds([]);
        
        setPhase('idle');
        // Clear dealing animation state after a bit
        setTimeout(() => setDealingCardIds([]), 1000);
    }, 500); // Wait for animation
  };

  // Helper to calculate debuff state
  const checkDebuff = (card: ICard, blind: IBlindDef | null): boolean => {
      if (!blind) return false;
      const name = blind.name;
      
      // Suit Debuffs
      if ((name === 'The Club' || name === '梅花') && card.suit === Suit.Clubs) return true;
      if ((name === 'The Goad' || name === '刺棒') && card.suit === Suit.Spades) return true;
      if ((name === 'The Window' || name === '窗户') && card.suit === Suit.Diamonds) return true;
      if ((name === 'The Head' || name === '头') && card.suit === Suit.Hearts) return true;
      
      // Face Card Debuff (The Plant)
      if ((name === 'The Plant' || name === '植物') && ['K', 'Q', 'J'].includes(card.rank)) return true;
      
      return false;
  };

  // Computed Hand with Debuffs
  const visibleHand = hand.map(c => ({
      ...c,
      isDebuffed: checkDebuff(c, currentBlind)
  }));

  // Dynamic Game Stats
  const currentMaxHandSize = currentBlind?.name === 'The Manacle' || currentBlind?.name === '镣铐' ? MAX_HAND_SIZE - 1 : MAX_HAND_SIZE;
  
  // New State for visual score count
  const [visualScore, setVisualScore] = useState(0);

  const animateScoreCount = (totalToAdd: number) => {
      return new Promise<void>(resolve => {
          const startScore = roundScore;
          const targetTotal = roundScore + totalToAdd;
          
          let startTime: number | null = null;
          const duration = Math.min(2000, Math.max(800, totalToAdd / 5)); // 0.8s to 2s depending on score size

          const animate = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              
              // Ease out expo
              const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              
              const currentAdded = Math.floor(totalToAdd * ease);
              setVisualScore(startScore + currentAdded);

              // Play sound occasionally based on progress to simulate "ticking"
              // We can't easily do precise sound triggers in RAF without state, 
              // so we rely on a separate interval or just play a loop during this time.
              // For now, let's just play a few distinct 'chip' sounds or a loop if we had one.
              // Simplified: play sound every 10% progress
              
              if (progress < 1) {
                  requestAnimationFrame(animate);
              } else {
                  setVisualScore(targetTotal);
                  Audio.playSfx('chip'); // Final ping
                  resolve();
              }
          };
          
          // Start a sound loop or rapid fire
          const soundInterval = setInterval(() => {
              Audio.playSfx('chip');
          }, 100); // Fast ticking

          requestAnimationFrame((ts) => {
              animate(ts);
              // Stop sound when animation done (handled by promise resolution cleanup? No, need to clear interval)
              setTimeout(() => clearInterval(soundInterval), duration);
          });
      });
  };

  const handlePlayHand = async () => {
    handleInitAudio();
    if (phase !== 'idle' || handsLeft <= 0 || selectedCardIds.length === 0) return;
    
    Audio.playSfx('play');
    setPhase('scoring');

    // Move cards to Played Area (Use visibleHand for debuff info)
    const cardsToPlay = visibleHand.filter(c => selectedCardIds.includes(c.id));
    const rawRemainingHand = hand.filter(c => !selectedCardIds.includes(c.id));
    
    setPlayedCards(cardsToPlay);
    setHand(rawRemainingHand);
    setSelectedCardIds([]);
    
    // Wait for visual transition
    await new Promise(resolve => { setTimeout(resolve, 600); });

    const evalResult = evaluateHand(cardsToPlay);
    
    // 1. Base Score from Hand Level
    const levelStats = handLevels[evalResult.type];
    let chips = levelStats.chips;
    let mult = levelStats.mult;

    // Boss Blind: The Flint (Halve Base Stats)
    if (currentBlind?.name === 'The Flint' || currentBlind?.name === '燧石') {
        chips = Math.floor(chips / 2);
        mult = Math.floor(mult / 2);
    }

    setDisplayChips(chips);
    setDisplayMult(mult);

    // 2. Card Modifiers (Chips from cards)
    // Iterate through played cards for visual feedback
    for (const card of cardsToPlay) {
         const isScoring = evalResult.scoringCards.some(sc => sc.id === card.id);
         
         if (isScoring) {
             setTriggeringCardId(card.id);
             
             if (!card.isDebuffed) {
                 chips += card.chips;
                 Audio.playSfx('chip'); 
             } else {
                 // Debuffed: No chips
             }
             
             setDisplayChips(chips);
             await new Promise(resolve => { setTimeout(resolve, 400); }); 
             setTriggeringCardId(null);
             await new Promise(resolve => { setTimeout(resolve, 100); }); 
         }
    }

    // 3. Joker Modifiers
    const survivingJokers: IJoker[] = [];

    // PRE-CALCULATION: Check "Held in Hand" Jokers (e.g. Baron, Shoot the Moon)
    // These usually trigger BEFORE the main scoring loop or integrated into it.
    // In Balatro, they trigger card by card or at specific timing. 
    // For MVP, we'll apply them to the base Mult/Chips before OnPlay jokers, 
    // OR iterate them separately to show visual feedback.
    // Let's iterate them first to set base state? 
    // Actually, standard order: Card triggers -> Held triggers -> Joker triggers.
    // So we should do Held triggers right after Card Modifiers loop.
    
    // --- HELD IN HAND JOKER LOOP ---
    // We do this before the main joker loop to accumulate stats, 
    // but to show animation we might need a separate loop or integrate carefully.
    // Let's integrate into the main loop but check context. 
    // Wait, standard jokers trigger left to right. 
    // But Held effects (like Baron) are tied to cards held.
    // If we follow Balatro exactly: 
    // 1. Played cards score
    // 2. Held in hand abilities trigger (Steel, Baron etc)
    // 3. Jokers trigger (Left to Right)
    
    // So let's insert a "Held Card" phase here.
     const heldCards = rawRemainingHand; // Cards not played
     for (const card of heldCards) {
          // Check if any joker interacts with this held card
          for (const joker of jokers) {
              calculateJokerEffect(joker, { type: 'onHeld', hand: [card] }); // Check per card?
              // Our logic in calculateJokerEffect for 'onHeld' currently takes the WHOLE hand.
              // Let's adjust: we should run 'onHeld' ONCE per joker, or iterate cards?
              // If we run once per joker, we can't easily animate per-card.
              // But for now, let's just run it as a phase.
          }
     }

    // SIMPLIFIED HELD TRIGGER (Run once per joker, apply to total)
    // Ideally we iterate jokers and if they are 'Held' type, we calculate.
    // But since we want to respect Left-to-Right order for XMult, we should probably keep them in the main loop?
    // NO, Baron triggers BEFORE other jokers usually? 
    // Actually Baron is a Joker. It triggers when it's its turn? 
    // No, Baron says "Each King held in hand gives X1.5 Mult".
    // This usually happens during the "Card Scoring" phase or "Held Card" phase.
    // Let's add a specific phase for "Held Card Triggers" before main Jokers.
    
    // ... After Card Modifiers (Step 2) ...
    
    // 2.5 Held Card Triggers (Steel, Baron, etc)
    // We iterate held cards, and for each card, check if any Joker boosts it.
    // This allows us to animate the card triggering.
    for (const card of rawRemainingHand) {
        let cardTriggered = false;
        for (const joker of jokers) {
             // We need a specific check for "Does this joker react to this specific card being held?"
             // Our current `calculateJokerEffect` is bulk. 
             // Let's hack it: We pass the single card as "hand".
             const effect = calculateJokerEffect(joker, { type: 'onHeld', hand: [card] });
             
             if (effect && effect.triggered) {
                 setTriggeringCardId(card.id); // Highlight the held card
                 setTriggeringJokerId(joker.id); // Highlight the joker
                 
                 if (effect.multAdd) mult += effect.multAdd;
                 if (effect.multX) mult *= effect.multX;
                 if (effect.chipsAdd) chips += effect.chipsAdd;
                 
                 if (effect.sound === 'xmult') Audio.playSfx('xmult');
                 else Audio.playSfx('mult'); // Default
                 
                 setDisplayChips(chips);
                 setDisplayMult(mult);
                 await new Promise(resolve => { setTimeout(resolve, 400); });
                 cardTriggered = true;
             }
        }
        if (cardTriggered) {
            setTriggeringCardId(null);
            setTriggeringJokerId(null);
        }
    }

    for (let i = 0; i < jokers.length; i++) {
        const joker = jokers[i];
        let jokerTriggered = false;
        let triggerType: 'chip' | 'mult' | 'xmult' | null = null;

        const prevChips = chips;
        const prevMult = mult;

        // Special Logic: Bull (Money -> Chips)
        if (joker.id === 'j_bull') {
             chips += (money * 2);
             jokerTriggered = true;
        }

        // Special Logic: Ice Cream (Chips -> Decay)
        if (joker.id === 'j_ice_cream') {
            if (joker.state?.currentChips) {
                chips += joker.state.currentChips;
                // Decay
                joker.state.currentChips = Math.max(0, joker.state.currentChips - 5);
                jokerTriggered = true;
            }
        }

        // Special Logic: Green Joker (Scaling Mult)
        if (joker.id === 'j_green_joker') {
            if (joker.state) {
                 joker.state.currentMult = (joker.state.currentMult || 0) + 1;
                 mult += joker.state.currentMult;
                 jokerTriggered = true;
            }
        }
        
        // Special Logic: Misprint (Random Mult)
        if (joker.id === 'j_misprint') {
             const randomMult = Math.floor(Math.random() * 24); // 0-23
             mult += randomMult;
             jokerTriggered = true;
        }

        // 1. Try New Advanced Logic First
        const effect = calculateJokerEffect(joker, { 
            type: 'onPlay', 
            handType: evalResult.type, 
            playedCards: cardsToPlay, 
            scoringCards: evalResult.scoringCards,
            handLevel: handLevels[evalResult.type].level
        });

        if (effect && effect.triggered) {
            if (effect.multAdd) mult += effect.multAdd;
            if (effect.chipsAdd) chips += effect.chipsAdd;
            if (effect.multX) mult *= effect.multX;
            jokerTriggered = true;
            // Allow overriding sound
            if (effect.sound === 'xmult') triggerType = 'xmult';
            else if (effect.sound === 'coin') triggerType = 'chip'; // Use chip sound for coin for now

            // Handle Actions
            if (effect.action === 'upgrade_hand') {
                // Upgrade current hand level
                setHandLevels(prev => {
                    const current = prev[currentHandType];
                    return {
                        ...prev,
                        [currentHandType]: {
                            ...current,
                            level: current.level + 1,
                            chips: current.chips + (BASE_HAND_STATS[currentHandType]?.chips || 10), // Simplified upgrade
                            mult: current.mult + 1
                        }
                    };
                });
                // Show toast
                const toast = document.createElement('div');
                toast.className = "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-4 rounded-xl border-2 border-purple-400 z-[100] animate-bounce-in pointer-events-none";
                toast.innerHTML = `<div class="text-xl font-bold text-purple-300">${effect.message || '牌型升级!'}</div>`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            }
            
            if (effect.action === 'create_tarot') {
                // Mock: Add a random Planet instead for now as Tarot system isn't fully linked
                // Or just show toast
                const toast = document.createElement('div');
                toast.className = "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-4 rounded-xl border-2 border-purple-400 z-[100] animate-bounce-in pointer-events-none";
                toast.innerHTML = `<div class="text-xl font-bold text-purple-300">${effect.message || '生成塔罗牌!'}</div><div class="text-sm text-gray-400">(暂以星球牌代替)</div>`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);

                // Add a random planet to consumables if space
                if (consumables.length < 3) {
                     const randomPlanet = PLANET_CARDS[Math.floor(Math.random() * PLANET_CARDS.length)];
                     setConsumables(prev => [...prev, {
                          id: `c_gen_${Date.now()}`,
                          type: 'Planet',
                          name: randomPlanet.name,
                          description: randomPlanet.desc,
                          price: 0,
                          effect: randomPlanet.effect,
                          img: randomPlanet.img
                     }]);
                }
            }
        } 

        // 2. Fallback to Basic Logic (if not fully handled by advanced, or cumulative)
        // Note: Some jokers might be handled by both if not careful, but our advanced logic returns null if not matched.
        // However, generic ones like "OnPlay" with simple `multAdd` in JSON might still be needed.
        // STRICT RULE: If a joker is in IMPLEMENTED_JOKERS, we MUST NOT fallback to basic logic.
        // This prevents "double dipping" or "triggered when condition failed" scenarios.
        const isImplemented = IMPLEMENTED_JOKERS.includes(joker.id);
        
        if (!effect && !isImplemented && (joker.triggerType === 'OnPlay' || joker.triggerType === 'OnDiscard')) { 
            if (joker.triggerType === 'OnPlay') {
                if (!joker.condition || joker.condition(evalResult.type, cardsToPlay)) {
                    if (joker.multAdd) mult += joker.multAdd;
                    if (joker.multX) mult *= joker.multX;
                    if (joker.chipsAdd) chips += joker.chipsAdd;
                    jokerTriggered = true;
                }
            }
        }

        // Determine Sound Type
        if (mult > prevMult) {
            if (joker.multX) {
                 triggerType = 'xmult';
            } else {
                 triggerType = 'mult';
            }
        } else if (chips > prevChips) {
            triggerType = 'chip';
        }
        
        // Handle Destruction (Gros Michel)
        if (joker.probability && jokerTriggered) {
            const roll = Math.random();
            const threshold = joker.probability.numerator / joker.probability.denominator;
            if (roll < threshold) {
                // Joker Destroyed!
                Audio.playSfx('discard'); // Re-use discard sound for now
                // Don't add to surviving jokers
                continue; 
            }
        }
        
        survivingJokers.push(joker);
        
        if (jokerTriggered) {
             setTriggeringJokerId(joker.id);
             if (triggerType === 'xmult') Audio.playSfx('xmult');
             else if (triggerType === 'mult') Audio.playSfx('mult');
             else Audio.playSfx('chip');

             setDisplayChips(chips);
             setDisplayMult(mult);
             
             await new Promise(resolve => { setTimeout(resolve, 600); });
             setTriggeringJokerId(null);
             await new Promise(resolve => { setTimeout(resolve, 100); });
        }
    }
    
    // Update Jokers List (if any died or updated state)
    setJokers(survivingJokers);

    const banner = survivingJokers.find(j => j.id === 'j_banner');
    if (banner && banner.chipsAdd) {
        const bonus = (banner.chipsAdd * discardsLeft);
        if (bonus > 0) {
             chips += bonus;
             setTriggeringJokerId(banner.id);
             Audio.playSfx('chip');
             setDisplayChips(chips);
             await new Promise(resolve => { setTimeout(resolve, 500); });
             setTriggeringJokerId(null);
        }
    }

    setDisplayChips(chips);
    setDisplayMult(mult);
    
    const finalHandScore = Math.floor(chips * mult);
    
    // Determine intensity
    if (finalHandScore > targetScore * 1.5) setScoreIntensity('high');
    else if (finalHandScore > targetScore * 0.5) setScoreIntensity('medium');
    else setScoreIntensity('none');
          
    await animateScoreCount(finalHandScore);
    setScoreIntensity('none');

    const newTotalScore = roundScore + finalHandScore;
    setRoundScore(newTotalScore);
    setVisualScore(newTotalScore); // Sync visual score
    setHandsLeft(prev => prev - 1);

    // Clean up played cards
    // setDiscardPile(prev => [...prev, ...cardsToPlay]);
    setPlayedCards([]);

    // Draw new cards
    const cardsNeeded = currentMaxHandSize - rawRemainingHand.length;
    let currentDeck = [...deck];

    if (currentDeck.length < cardsNeeded) {
        currentDeck = [...currentDeck, ...createDeck()]; 
    }

    const newCards = currentDeck.splice(0, cardsNeeded);
    
    // Animation reset delay
    setTimeout(() => {
        setDealingCardIds(newCards.map(c => c.id));
        newCards.forEach((_, i) => setTimeout(() => Audio.playSfx('deal'), i * 50));
        
        setHand([...rawRemainingHand, ...newCards]);
        setDeck(currentDeck);
        setDisplayChips(0);
        setDisplayMult(0);
        // setDisplayTotal(0);
        
        // Clear dealing animation
        setTimeout(() => setDealingCardIds([]), 1000);

        if (newTotalScore >= targetScore) {
            // Calculate Interest: $1 per $5 held, max $5 interest (at $25)
            const interest = Math.min(5, Math.floor(money / 5));
            const handBonus = handsLeft - 1; // $1 per remaining hand
            const income = 3 + handBonus + interest; 
            
            setMoney(prev => prev + income);
            Audio.playSfx('win');
            
            // Show victory toast with income breakdown
            const toast = document.createElement('div');
            toast.className = "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-8 py-6 rounded-xl border-4 border-yellow-400 z-[100] animate-bounce-in shadow-2xl flex flex-col items-center pointer-events-none";
            toast.innerHTML = `
               <div class="text-3xl font-black text-yellow-400 mb-4">回合胜利!</div>
               <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-lg w-full">
                   <div class="text-gray-300 text-right">基础奖励:</div>
                   <div class="text-white font-bold text-left">$3</div>
                   
                   <div class="text-gray-300 text-right">剩余出牌 (${handBonus}):</div>
                   <div class="text-white font-bold text-left">$${handBonus}</div>
                   
                   <div class="text-gray-300 text-right">利息 ($${interest}):</div>
                   <div class="text-white font-bold text-left">$${interest}</div>
                   
                   <div class="col-span-2 border-t border-gray-600 my-2"></div>
                   
                   <div class="text-yellow-400 font-black text-right text-2xl">总计:</div>
                   <div class="text-yellow-400 font-black text-left text-2xl">$${income}</div>
               </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            generateShop();
            setTimeout(() => setPhase('victory'), 2000); // Delay slightly more to see toast
        } else if (handsLeft - 1 <= 0) {
             setTimeout(() => setPhase('gameover'), 1000);
        } else {
            setPhase('idle');
        }
    }, 500);
  };

  const handleSellJoker = (joker: IJoker) => {
    if (phase !== 'idle' && phase !== 'shop') return;
    Audio.playSfx('chip'); // Reuse chip/coin sound
    
    // Sell Logic: Half price rounded down, minimum 1 if price > 0
    const sellValue = Math.max(1, Math.floor(joker.price / 2));
    
    setMoney(prev => prev + sellValue);
    setJokers(prev => prev.filter(j => j.id !== joker.id));
  };

  const handleEnterShop = () => {
      Audio.playSfx('select');
      setPhase('shop');
  };

  const handleUseConsumable = (item: IConsumable) => {
    if (phase !== 'idle' && phase !== 'shop') return;
    
    // Planet Card Logic
    if (item.type === 'Planet' && item.effect) {
         // item.effect is the HandType key (e.g. "Flush")
         const handType = item.effect as HandType;
         
         if (handLevels[handType]) {
             Audio.playSfx('chip'); // Re-use chip sound for now
             
             // Visual Feedback (Toast)
             const toast = document.createElement('div');
             toast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-4 rounded-xl border-2 border-yellow-400 z-[100] animate-bounce-in shadow-2xl flex flex-col items-center pointer-events-none";
             
             setHandLevels(prev => {
                 const current = prev[handType];
                 // const baseStats = BASE_HAND_STATS[handType] || { level: 1, chips: 10, mult: 2 }; // Unused for now
                 
                 // Balatro Upgrade Logic:
                 // Usually +X Chips and +Y Mult per level.
                 // Standard planet upgrade:
                 // High Card: +10 Chips, +1 Mult
                 // Pair: +15 Chips, +1 Mult
                 // Two Pair: +20 Chips, +1 Mult
                 // Three of a Kind: +20 Chips, +2 Mult
                 // Straight: +30 Chips, +3 Mult
                 // Flush: +15 Chips, +2 Mult
                 // Full House: +25 Chips, +2 Mult
                 // Four of a Kind: +30 Chips, +3 Mult
                 // Straight Flush: +40 Chips, +4 Mult
                 // Royal Flush: +40 Chips, +4 Mult (Same as SF usually)

                 let chipsAdd = 10;
                 let multAdd = 1;

                 switch(handType) {
                     case HandType.HighCard: chipsAdd=10; multAdd=1; break;
                     case HandType.Pair: chipsAdd=15; multAdd=1; break;
                     case HandType.TwoPair: chipsAdd=20; multAdd=1; break;
                     case HandType.ThreeOfAKind: chipsAdd=20; multAdd=2; break;
                     case HandType.Straight: chipsAdd=30; multAdd=3; break;
                     case HandType.Flush: chipsAdd=15; multAdd=2; break;
                     case HandType.FullHouse: chipsAdd=25; multAdd=2; break;
                     case HandType.FourOfAKind: chipsAdd=30; multAdd=3; break;
                     case HandType.StraightFlush: chipsAdd=40; multAdd=4; break;
                     case HandType.RoyalFlush: chipsAdd=40; multAdd=4; break;
                 }

                 // Visual Feedback (Toast) content update
                 toast.innerHTML = `
                    <div class="text-2xl font-black text-yellow-400 mb-1">升级!</div>
                    <div class="text-lg font-bold">${HAND_NAMES[handType]}</div>
                    <div class="flex items-center space-x-2 mt-2">
                        <span class="bg-blue-600 px-2 rounded text-sm">+${chipsAdd} 筹码</span>
                        <span class="bg-red-600 px-2 rounded text-sm">+${multAdd} 倍率</span>
                    </div>
                 `;
                 document.body.appendChild(toast);
                 setTimeout(() => toast.remove(), 2000);

                 return {
                     ...prev,
                     [handType]: {
                         ...current,
                         level: current.level + 1,
                         chips: current.chips + chipsAdd, 
                         mult: current.mult + multAdd
                     }
                 };
             });

             // Remove from inventory
             setConsumables(prev => prev.filter(c => c.id !== item.id));
         }
    } else {
        // Tarot or Spectral logic would go here
        alert("该卡牌暂未实现效果");
    }
  };

  // ----------------------------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------------------------
  if (phase === 'startMenu') {
      return <StartMenu onStart={() => {
          Audio.playSfx('select');
          setPhase('deckSelect');
      }} />;
  }

  if (phase === 'deckSelect') {
        return <DeckSelect onSelect={() => { // deckId param removed to satisfy linter for now
            // Future: Customize deck based on ID
            // For now, just start default
            setJokers([]);
            startNewRound(1, true);
        }} />;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a]" onClick={handleInitAudio}>
             {/* Particle Systems Removed as requested */}
             
             {/* LEFT SIDEBAR */}
             <Sidebar 
                roundScore={visualScore > 0 ? visualScore : roundScore}
                targetScore={targetScore}
                chips={phase === 'scoring' ? displayChips : handLevels[currentHandType].chips}
                mult={phase === 'scoring' ? displayMult : handLevels[currentHandType].mult}
                handsLeft={handsLeft}
                discardsLeft={discardsLeft}
                money={money}
                ante={Math.ceil(roundLevel / 3)} // Pass actual calculated Ante
                round={roundLevel} // Pass cumulative round directly
                currentHandType={currentHandType}
                phase={phase}
                handLevel={handLevels[currentHandType]}
                onOpenRunInfo={() => setShowHandGuide(true)}
                scoreIntensity={scoreIntensity}
             />

             {/* RIGHT COLUMN */}
             <div className="flex-1 flex flex-col relative">
                  {/* BACKGROUND */}
                  <div className="absolute inset-0 bg-[url('/assets/backgrounds/bg.jpg')] bg-cover opacity-30 z-0 pointer-events-none"></div>
                  
                  {/* TOP HUD */}
                  <TopHUD 
                    jokers={jokers} 
                    consumables={consumables} 
                    triggeringJokerId={triggeringJokerId} 
                    onUseConsumable={handleUseConsumable}
                    onSellJoker={handleSellJoker}
                  />

                  {/* MAIN CONTENT */}
                  <div className="flex-1 relative z-10 p-4 flex flex-col">
                      
                      {phase === 'shop' ? (
                          <Shop 
                            shopItems={shopItems}
                            money={money}
                            rerollCost={5}
                            onBuy={buyItem}
                            onReroll={() => {
                                if (money >= 5) {
                                    setMoney(prev => prev - 5);
                                    generateShop();
                                    // Audio.playSfx('reroll');
                                } else {
                                    Audio.playSfx('error');
                                }
                            }}
                            onNextRound={skipShop}
                          />
                      ) : (
                          <div className="flex-1 flex flex-col">
                              {/* BOSS BLIND INDICATOR */}
                              {currentBlind && (
                                <div className="absolute top-4 right-4 w-48 z-20 animate-pulse">
                                    <div className="bg-red-900/90 border-4 border-red-500 rounded-xl p-2 flex items-center space-x-3 shadow-xl">
                                        <div className="w-12 h-12 bg-black rounded-full overflow-hidden border-2 border-red-400">
                                             <img src={currentBlind.img} alt={currentBlind.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-red-300 font-black text-sm uppercase tracking-wider">Boss 盲注</div>
                                            <div className="text-white font-bold leading-tight">{currentBlind.name}</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/80 text-white text-xs p-2 rounded mt-1 text-center border border-red-500/30">
                                        {currentBlind.description}
                                    </div>
                                </div>
                              )}

                              {/* SCORING ANIMATION OVERLAY */}
                              <div className="flex-1 flex items-center justify-center flex-col">
                                   {/* PLAYED CARDS AREA (Top) */}
                                   <div className="h-48 flex items-center justify-center space-x-2 mb-4 transform scale-90">
                                       {playedCards.map((card) => (
                                           <Card 
                                                key={card.id}
                                                card={card}
                                                onClick={() => {}} // No interaction
                                                className={`
                                                    transition-all duration-300 transform shadow-2xl
                                                    ${triggeringCardId === card.id ? 'scale-110 z-50 ring-4 ring-yellow-400 shadow-[0_20px_50px_rgba(0,0,0,0.5)] translate-y-[-10px]' : 'scale-100 shadow-xl'}
                                                `}
                                           />
                                       ))}
                                   </div>
                              </div>

                              {/* CARDS AREA */}
                              <div className="h-64 flex flex-col justify-end pb-4 px-8">
                                  <div className="flex justify-center items-end h-48 w-full perspective-1000" style={{ marginLeft: `${Math.min(hand.length * 10, 100)}px` }}>
                                       {hand.map((card, idx) => {
                                           let animClass = '';
                                           if (exitingCardIds.includes(card.id)) {
                                               animClass = phase === 'discarding' ? 'animate-discard' : 'animate-play';
                                           } else if (dealingCardIds.includes(card.id)) {
                                               animClass = 'animate-deal';
                                           }
                                           
                                           const isSelected = selectedCardIds.includes(card.id);
                                           // Calculate fan effect (subtle rotation and spacing)
                                           const total = hand.length;
                                           const center = (total - 1) / 2;
                                           const relIdx = idx - center;
                                           const rotation = relIdx * 2; // Slight fan rotation
                                           const yOffset = Math.abs(relIdx) * 2; // Slight arch

                                           return (
                                               <div 
                                                  key={card.id}
                                                  className={`relative transition-all duration-200 ${isSelected ? 'z-50' : 'hover:z-50'}`}
                                                  style={{
                                                      width: '80px', // Reserve space
                                                      marginRight: '-30px', // Negative margin for overlap
                                                      zIndex: isSelected ? 50 : idx, // Selected on top, otherwise ordered
                                                  }}
                                               >
                                                   <Card 
                                                       card={card} 
                                                       onClick={toggleCardSelection}
                                                       animationClass={animClass}
                                                       animationDelay={dealingCardIds.includes(card.id) ? idx * 0.05 : 0}
                                                       className={`
                                                        cursor-pointer transform transition-transform duration-200
                                                        ${isSelected ? '-translate-y-16 shadow-[0_20px_30px_rgba(0,0,0,0.6)] scale-110' : 'hover:-translate-y-12 hover:shadow-[0_20px_30px_rgba(0,0,0,0.5)] hover:scale-105'}
                                                        shadow-[0_10px_20px_rgba(0,0,0,0.4)]
                                                   `}
                                                   style={{
                                                        transform: `rotate(${rotation}deg) translateY(${yOffset}px) ${isSelected ? 'translateY(-60px)' : ''}`
                                                   }}
                                                   />
                                               </div>
                                           );
                                       })}
                                  </div>

                                  {/* ACTION BUTTONS */}
                                  <div className="flex justify-center space-x-6 mt-8">
                                      <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handlePlayHand(); }}
                                          disabled={phase !== 'idle' || selectedCardIds.length === 0}
                                          className={`
                                              px-12 py-4 rounded-xl text-2xl font-black uppercase tracking-widest shadow-[0_6px_0_rgba(0,0,0,0.5)] border-b-4 transition-all transform active:translate-y-2 active:shadow-none
                                              ${phase === 'idle' && selectedCardIds.length > 0
                                                  ? 'bg-[#0099FF] border-[#005588] hover:bg-[#33adff] text-white' 
                                                  : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'}
                                          `}
                                      >
                                          出牌
                                      </button>
                                      <button 
                                           type="button"
                                           onClick={(e) => { e.stopPropagation(); handleDiscard(); }}
                                           disabled={phase !== 'idle' || selectedCardIds.length === 0 || discardsLeft <= 0}
                                           className={`
                                              px-10 py-4 rounded-xl text-xl font-black uppercase tracking-widest shadow-[0_6px_0_rgba(0,0,0,0.5)] border-b-4 transition-all transform active:translate-y-2 active:shadow-none
                                              ${phase === 'idle' && selectedCardIds.length > 0 && discardsLeft > 0
                                                  ? 'bg-[#FF4D4D] border-[#990000] hover:bg-[#ff6666] text-white' 
                                                  : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed'}
                                          `}
                                      >
                                          弃牌
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* DECK VIEW (Bottom Right) */}
                  <div className="absolute bottom-4 right-4 z-20 group cursor-pointer">
                      <div className="relative w-24 h-32 bg-[#FF4D4D] rounded-lg border-4 border-white shadow-xl transform rotate-3 group-hover:-translate-y-2 transition-transform">
                          <div className="absolute inset-0 bg-[url('/assets/deck_back.png')] bg-cover rounded opacity-50"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-black text-xl drop-shadow-md">{deck.length}/52</span>
                          </div>
                      </div>
                  </div>
             </div>

             {/* HAND GUIDE MODAL */}
             <HandGuide 
                isOpen={showHandGuide} 
                onClose={() => setShowHandGuide(false)} 
                handLevels={handLevels}
             />

             {/* TUTORIAL OVERLAY */}
             {showTutorial && (
                 <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center" onClick={closeTutorial}>
                     <div className="bg-[#2C2F33] max-w-2xl p-8 rounded-xl border-4 border-blue-500 shadow-2xl text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
                         <h2 className="text-4xl font-black text-blue-400 mb-4">欢迎来到 BALATRO CLONE!</h2>
                         <div className="text-left space-y-4 text-gray-300 mb-8">
                             <p>🃏 <strong className="text-white">目标:</strong> 通过打出扑克牌赚取筹码，击败每一轮的目标分数。</p>
                             <p>🤡 <strong className="text-white">小丑牌:</strong> 收集小丑牌来获得强大的被动效果（倍率、筹码、特效）。</p>
                             <p>🪐 <strong className="text-white">星球牌:</strong> 升级你的扑克牌型等级。</p>
                             <p>💰 <strong className="text-white">利息:</strong> 每回合结束保留金钱可以赚取利息（每$5赚$1，上限$5）。</p>
                         </div>
                         <button 
                            type="button"
                            onClick={closeTutorial}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-12 rounded-xl shadow-lg text-xl"
                         >
                             开始游戏
                         </button>
                     </div>
                 </div>
             )}

             {/* OVERLAYS */}
             {phase === 'victory' && (
                 <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                     <div className="bg-[#2C2F33] border-4 border-[#FEAC34] p-12 rounded-3xl shadow-2xl text-center animate-bounce-in">
                         <h2 className="text-6xl font-black text-[#FEAC34] mb-4 drop-shadow-lg">胜利!</h2>
                         <p className="text-white text-xl mb-8 font-bold">回合完成</p>
                         <button 
                            type="button"
                            onClick={handleEnterShop} 
                            className="bg-[#4CAF50] hover:bg-[#5cb860] text-white font-black py-4 px-12 rounded-xl shadow-[0_6px_0_#2e7d32] text-2xl transform hover:scale-105 transition-all active:translate-y-2 active:shadow-none"
                         >
                             前往商店
                         </button>
                     </div>
                 </div>
             )}
 
             {phase === 'gameover' && (
                 <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
                     <div className="text-center">
                         <h1 className="text-9xl font-black text-[#FF4D4D] mb-4 drop-shadow-[0_0_10px_red] animate-pulse">游戏结束</h1>
                         <p className="text-3xl text-gray-400 mb-12 font-bold">分数: {roundScore}</p>
                         <button 
                           type="button"
                           onClick={handleRestart}
                           className="bg-white text-black font-black py-4 px-16 rounded-full text-3xl hover:scale-110 transition-transform shadow-[0_0_20px_white]"
                         >
                             再玩一次
                         </button>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default App;