// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Zap, 
  Target, 
  Rocket, 
  Crosshair, 
  Coins, 
  Plus, 
  Minus,
  Sparkles,
  Award
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  FishType, 
  ActiveFish, 
  Bullet, 
  FloatingCoin, 
  WeaponType, 
  FISH_SPECIES 
} from './happyFishingTypes';
import { happyFishingAudio } from './happyFishingAudio';
import { OctopusWheelModal } from './OctopusWheelModal';
import { gameEngine } from '../../services/gameEngine';

interface HappyFishingGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

let fishIdCounter = 0;
let bulletIdCounter = 0;
let coinIdCounter = 0;

export const HappyFishingGame: React.FC<HappyFishingGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const isBn = language === 'bn';
  const balance = user?.balance ?? 5000;

  // Betting & Weapons
  const [betAmount, setBetAmount] = useState<number>(20);
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('standard');
  const [isAutoShoot, setIsAutoShoot] = useState<boolean>(false);
  const [isLockOn, setIsLockOn] = useState<boolean>(false);
  const [targetedFishId, setTargetedFishId] = useState<string | null>(null);

  // Audio & Settings
  const [isMuted, setIsMuted] = useState<boolean>(happyFishingAudio.getMuted());
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showOctopusWheel, setShowOctopusWheel] = useState<boolean>(false);

  // Game Arena Entities
  const [fishList, setFishList] = useState<ActiveFish[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [cannonAngle, setCannonAngle] = useState<number>(0);

  // Canvas / Stage dimensions ref
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 800, height: 500 });

  // Refs for tracking mutable loop state
  const fishRef = useRef<ActiveFish[]>([]);
  fishRef.current = fishList;
  const bulletsRef = useRef<Bullet[]>([]);
  bulletsRef.current = bullets;
  const balanceRef = useRef(balance);
  balanceRef.current = balance;
  const betRef = useRef(betAmount);
  betRef.current = betAmount;
  const weaponRef = useRef(activeWeapon);
  weaponRef.current = activeWeapon;
  const autoShootRef = useRef(isAutoShoot);
  autoShootRef.current = isAutoShoot;
  const lockOnRef = useRef(isLockOn);
  lockOnRef.current = isLockOn;
  const targetIdRef = useRef(targetedFishId);
  targetIdRef.current = targetedFishId;

  // Measure stage dimensions
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        setStageSize({
          width: stageRef.current.clientWidth,
          height: stageRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Spawn new fish periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setFishList(prev => {
        if (prev.length >= 18) return prev; // max 18 fish swimming simultaneously

        const types: FishType[] = [
          'clownfish', 'clownfish', 'puffer', 'puffer', 'jellyfish', 
          'lionfish', 'swordfish', 'hammerhead'
        ];

        // Rare boss or golden turtle spawn
        const rand = Math.random();
        let chosenType: FishType = types[Math.floor(Math.random() * types.length)];
        if (rand < 0.05 && !prev.some(f => f.type === 'mega_octopus')) {
          chosenType = 'mega_octopus';
          happyFishingAudio.playBossAlarm();
        } else if (rand < 0.12 && !prev.some(f => f.type === 'golden_turtle')) {
          chosenType = 'golden_turtle';
        }

        const config = FISH_SPECIES[chosenType];
        const fromLeft = Math.random() < 0.5;
        const startX = fromLeft ? -60 : stageSize.width + 60;
        const startY = Math.random() * (stageSize.height * 0.65) + 40;
        const vx = (fromLeft ? 1 : -1) * (config.speed + Math.random() * 0.4);
        const vy = (Math.random() - 0.5) * 0.8;

        const newFish: ActiveFish = {
          id: `fish_${++fishIdCounter}`,
          type: chosenType,
          x: startX,
          y: startY,
          vx,
          vy,
          currentHp: config.health,
          maxHp: config.health,
          angle: vx > 0 ? 0 : 180
        };

        return [...prev, newFish];
      });
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [stageSize]);

  // Fire Cannon toward (targetX, targetY)
  const fireCannon = useCallback((targetX: number, targetY: number) => {
    const cannonX = stageSize.width / 2;
    const cannonY = stageSize.height - 30;

    const currentBet = betRef.current;
    const currentWeapon = weaponRef.current;
    const costMultiplier = currentWeapon === 'torpedo' ? 6 : currentWeapon === 'laser' ? 3 : 1;
    const shotCost = currentBet * costMultiplier;

    if (balanceRef.current < shotCost) {
      return;
    }

    // Deduct cost
    const newBal = balanceRef.current - shotCost;
    onUpdateBalance(newBal);

    // Calculate angle & trajectory
    const dx = targetX - cannonX;
    const dy = targetY - cannonY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI + 90;
    setCannonAngle(angleDeg);

    const speed = currentWeapon === 'torpedo' ? 12 : 18;
    const vx = Math.cos(angleRad) * speed;
    const vy = Math.sin(angleRad) * speed;

    if (currentWeapon === 'torpedo') {
      happyFishingAudio.playTorpedoLaunch();
    } else if (currentWeapon === 'laser') {
      happyFishingAudio.playLaserBeam();
    } else {
      happyFishingAudio.playCannonShot();
    }

    const newBullet: Bullet = {
      id: `bullet_${++bulletIdCounter}`,
      x: cannonX,
      y: cannonY,
      vx,
      vy,
      weapon: currentWeapon,
      betValue: currentBet,
      targetFishId: targetIdRef.current || undefined
    };

    setBullets(prev => [...prev, newBullet]);
  }, [stageSize, onUpdateBalance]);

  // Handle stage click to shoot or lock-on
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked directly on a fish to lock-on
    const clickedFish = fishRef.current.find(f => {
      const config = FISH_SPECIES[f.type];
      const dist = Math.hypot(f.x - clickX, f.y - clickY);
      return dist <= config.size * 1.5;
    });

    if (clickedFish) {
      setTargetedFishId(clickedFish.id);
      setIsLockOn(true);
    }

    fireCannon(clickX, clickY);
  };

  // Main game animation physics loop
  useEffect(() => {
    let animFrame: number;

    const gameTick = () => {
      const { width, height } = stageSize;

      // 1. Move fish
      setFishList(prevFish => {
        return prevFish
          .map(fish => {
            const nextX = fish.x + fish.vx;
            let nextY = fish.y + fish.vy;

            // Bounce slightly off top and bottom water boundary
            let nextVy = fish.vy;
            if (nextY < 30 || nextY > height * 0.75) {
              nextVy = -fish.vy;
            }

            return {
              ...fish,
              x: nextX,
              y: nextY,
              vy: nextVy
            };
          })
          .filter(fish => {
            // Remove if swam off screen
            return fish.x >= -120 && fish.x <= width + 120;
          });
      });

      // 2. Move bullets & check collisions
      setBullets(prevBullets => {
        const remainingBullets: Bullet[] = [];
        const currentFishes = [...fishRef.current];

        for (const bullet of prevBullets) {
          // If locked onto a fish, home in slightly
          let vx = bullet.vx;
          let vy = bullet.vy;

          if (bullet.targetFishId) {
            const target = currentFishes.find(f => f.id === bullet.targetFishId);
            if (target) {
              const angle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
              const speed = Math.hypot(vx, vy);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
            }
          }

          const nextX = bullet.x + vx;
          const nextY = bullet.y + vy;

          // Check boundary
          if (nextX < 0 || nextX > width || nextY < 0 || nextY > height) {
            continue; // off screen
          }

          // Check hit against fish
          let hit = false;
          for (const fish of currentFishes) {
            const config = FISH_SPECIES[fish.type];
            const dist = Math.hypot(fish.x - nextX, fish.y - nextY);

            // Radius check
            const hitRadius = bullet.weapon === 'torpedo' ? config.size * 1.6 : config.size;
            if (dist <= hitRadius) {
              hit = true;
              const dmg = bullet.weapon === 'torpedo' ? 3 : bullet.weapon === 'laser' ? 2 : 1;
              fish.currentHp -= dmg;

              // Check if fish is defeated/captured!
              if (fish.currentHp <= 0) {
                // Award winnings!
                const payoutMultiplier = config.multiplier;
                const winAmount = bullet.betValue * payoutMultiplier;

                happyFishingAudio.playFishCaptured(payoutMultiplier);

                // If Mega Octopus boss is defeated, trigger the 950X Octopus Wheel!
                if (fish.type === 'mega_octopus') {
                  happyFishingAudio.playOctopusWheelFanfare();
                  setShowOctopusWheel(true);
                } else {
                  onUpdateBalance(balanceRef.current + winAmount);
                  gameEngine.recordRound(bullet.betValue, winAmount, {
                    gameId: 'game-happy-fishing',
                    gameName: 'Happy Fishing',
                    category: 'arcade',
                    vendor: 'JILI'
                  });
                }

                // Add floating coin animation
                setFloatingCoins(coins => [
                  ...coins,
                  {
                    id: `coin_${++coinIdCounter}`,
                    x: fish.x,
                    y: fish.y,
                    amount: winAmount,
                    multiplier: payoutMultiplier
                  }
                ]);

                // Remove fish from current list
                setFishList(fList => fList.filter(f => f.id !== fish.id));
              }
              break;
            }
          }

          if (!hit) {
            remainingBullets.push({
              ...bullet,
              x: nextX,
              y: nextY,
              vx,
              vy
            });
          }
        }

        return remainingBullets;
      });

      // 3. Float coins upward & remove
      setFloatingCoins(coins =>
        coins
          .map(c => ({ ...c, y: c.y - 1.5 }))
          .filter(c => c.y > 20)
      );

      animFrame = requestAnimationFrame(gameTick);
    };

    animFrame = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animFrame);
  }, [stageSize, onUpdateBalance]);

  // Auto-shoot loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoShoot) {
      timer = setInterval(() => {
        let targetX = stageSize.width / 2;
        let targetY = 150;

        if (targetedFishId) {
          const target = fishRef.current.find(f => f.id === targetedFishId);
          if (target) {
            targetX = target.x;
            targetY = target.y;
          }
        } else if (fishRef.current.length > 0) {
          // Shoot at random active fish
          const randomFish = fishRef.current[Math.floor(Math.random() * fishRef.current.length)];
          targetX = randomFish.x;
          targetY = randomFish.y;
        }

        fireCannon(targetX, targetY);
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isAutoShoot, targetedFishId, stageSize, fireCannon]);

  const toggleSound = () => {
    const muted = happyFishingAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-1 md:p-3 overflow-hidden select-none">
      {/* Game Outer Cabinet */}
      <div 
        ref={stageRef}
        onClick={handleStageClick}
        className="relative w-full max-w-5xl h-[92vh] max-h-[750px] bg-gradient-to-b from-[#031525] via-[#052b48] to-[#011424] rounded-3xl border-2 border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col justify-between overflow-hidden cursor-crosshair"
      >
        {/* Deep Ocean Water Caustic & Bubble Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top Header Bar */}
        <div 
          onClick={e => e.stopPropagation()} 
          className="relative z-30 flex items-center justify-between px-3 py-2 md:px-5 md:py-2.5 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/60"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              <span className="text-lg">🐠</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-yellow-300 font-mono tracking-wider">
                  HAPPY FISHING
                </span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                  JILI
                </span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono hidden sm:block">
                MEGA OCTOPUS 950X • TORPEDO ROCKETS • CANNON MULTIPLIER
              </div>
            </div>
          </div>

          {/* Balance & Settings */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-xl shadow-inner font-mono">
              <Coins className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-[9px] text-cyan-300/80 uppercase">{isBn ? 'ব্যালেন্স' : 'BALANCE'}</div>
                <div className="text-xs md:text-sm font-bold text-yellow-300">
                  ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 transition"
              title="Fish Paytable"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 transition"
              title="Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/50 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Swimming Fish Entities in Ocean */}
        <div className="relative flex-1 w-full overflow-hidden pointer-events-none">
          {fishList.map(fish => {
            const config = FISH_SPECIES[fish.type];
            const hpPercent = (fish.currentHp / fish.maxHp) * 100;
            const isTargeted = targetedFishId === fish.id;

            return (
              <div
                key={fish.id}
                className="absolute flex flex-col items-center justify-center transition-transform duration-75"
                style={{
                  left: `${fish.x}px`,
                  top: `${fish.y}px`,
                  transform: `translate(-50%, -50%) scaleX(${fish.vx > 0 ? 1 : -1})`
                }}
              >
                {/* Target Lock Reticle */}
                {isTargeted && (
                  <div className="absolute -inset-4 border-2 border-red-500 rounded-full animate-ping pointer-events-none" />
                )}

                {/* HP Bar if damaged */}
                {fish.currentHp < fish.maxHp && (
                  <div className="w-10 h-1 bg-black/60 rounded-full overflow-hidden mb-1 border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-yellow-400" 
                      style={{ width: `${hpPercent}%` }} 
                    />
                  </div>
                )}

                {/* Fish Visual Representation */}
                <div
                  className={`relative flex items-center justify-center rounded-full shadow-lg ${
                    config.isBoss ? 'animate-pulse' : ''
                  }`}
                  style={{
                    width: `${config.size * 2}px`,
                    height: `${config.size * 2}px`,
                    backgroundColor: `${config.color}25`,
                    border: `2px solid ${config.color}`,
                    boxShadow: `0 0 15px ${config.glowColor}`
                  }}
                >
                  <span className={`${config.isBoss ? 'text-4xl' : 'text-2xl'}`}>
                    {fish.type === 'clownfish' && '🐠'}
                    {fish.type === 'puffer' && '🐡'}
                    {fish.type === 'jellyfish' && '🪼'}
                    {fish.type === 'lionfish' && '🐟'}
                    {fish.type === 'swordfish' && '🐬'}
                    {fish.type === 'hammerhead' && '🦈'}
                    {fish.type === 'golden_turtle' && '🐢'}
                    {fish.type === 'mega_octopus' && '🐙'}
                  </span>

                  {/* Multiplier Badge */}
                  <span className="absolute -bottom-2 bg-black/80 text-yellow-300 text-[9px] font-black font-mono px-1 rounded border border-yellow-400/60 shadow">
                    {config.multiplier}X
                  </span>
                </div>
              </div>
            );
          })}

          {/* Active Flying Bullets */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              className={`absolute rounded-full pointer-events-none transition-all ${
                bullet.weapon === 'torpedo'
                  ? 'w-4 h-4 bg-gradient-to-r from-red-500 to-yellow-400 shadow-[0_0_12px_#ef4444]'
                  : bullet.weapon === 'laser'
                  ? 'w-3 h-3 bg-cyan-300 shadow-[0_0_10px_#06b6d4]'
                  : 'w-2.5 h-2.5 bg-yellow-400 shadow-[0_0_8px_#facc15]'
              }`}
              style={{
                left: `${bullet.x}px`,
                top: `${bullet.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          {/* Floating Coin Rewards */}
          {floatingCoins.map(coin => (
            <div
              key={coin.id}
              className="absolute pointer-events-none flex flex-col items-center justify-center font-mono font-black z-30 animate-in fade-in"
              style={{
                left: `${coin.x}px`,
                top: `${coin.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-base md:text-xl text-yellow-300 drop-shadow-[0_0_10px_#facc15] flex items-center space-x-1">
                <span>+৳{coin.amount.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-amber-200 bg-black/70 px-1.5 rounded-full border border-yellow-400/40">
                {coin.multiplier}X WIN
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Mounted High-Power Laser Cannon */}
        <div className="relative w-full flex flex-col items-center justify-end z-20 pointer-events-none">
          {/* Cannon Turret Barrel */}
          <div 
            className="relative w-12 h-14 md:w-16 md:h-20 transition-transform duration-75 flex items-center justify-center"
            style={{ transform: `rotate(${cannonAngle}deg)`, transformOrigin: '50% 80%' }}
          >
            <div className="w-4 md:w-5 h-10 md:h-14 bg-gradient-to-t from-cyan-600 via-blue-500 to-yellow-400 rounded-t-lg border-2 border-white shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
            <div className="absolute bottom-0 w-10 md:w-12 h-6 bg-slate-900 rounded-t-full border-2 border-cyan-400 shadow-md" />
          </div>
        </div>

        {/* Bottom Controls Cockpit */}
        <div 
          onClick={e => e.stopPropagation()} 
          className="relative z-30 bg-slate-950/95 border-t border-cyan-800/60 p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-2"
        >
          {/* Weapon Selector */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase hidden sm:inline">
              {isBn ? 'অস্ত্র:' : 'WEAPON:'}
            </span>

            <button
              onClick={() => setActiveWeapon('standard')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 border transition ${
                activeWeapon === 'standard'
                  ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_10px_#06b6d4]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{isBn ? 'ক্যানন (১X)' : 'CANNON (1X)'}</span>
            </button>

            <button
              onClick={() => setActiveWeapon('torpedo')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-black flex items-center space-x-1 border transition ${
                activeWeapon === 'torpedo'
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white border-yellow-300 shadow-[0_0_15px_#ef4444]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isBn ? 'টর্পেডো (৬X)' : 'TORPEDO (6X)'}</span>
            </button>

            <button
              onClick={() => setActiveWeapon('laser')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1 border transition ${
                activeWeapon === 'laser'
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 border-white shadow-[0_0_12px_#14b8a6]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBn ? 'লেজার (৩X)' : 'LASER (3X)'}</span>
            </button>
          </div>

          {/* Bet Adjuster */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-900 border border-cyan-800 rounded-xl p-1">
              <button
                onClick={() => setBetAmount(prev => Math.max(10, prev - 10))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="px-3 text-center">
                <div className="text-[9px] text-cyan-400 font-mono uppercase">{isBn ? 'বেট' : 'BET'}</div>
                <div className="text-xs md:text-sm font-bold text-yellow-300 font-mono">
                  ৳{betAmount}
                </div>
              </div>

              <button
                onClick={() => setBetAmount(prev => Math.min(2000, prev + 10))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-Shoot and Lock-On */}
            <button
              onClick={() => setIsAutoShoot(!isAutoShoot)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1 transition ${
                isAutoShoot 
                  ? 'bg-amber-500 text-slate-950 border-yellow-300 shadow-[0_0_12px_#f59e0b] animate-pulse' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isAutoShoot ? 'AUTO: ON' : 'AUTO: OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/50 rounded-2xl p-5 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowPaytable(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-mono font-black text-cyan-300 mb-3 flex items-center space-x-2">
              <span className="text-2xl">🐠</span>
              <span>{isBn ? 'হ্যাপি ফিশিং পে-টেবিল ও নিয়মাবলী' : 'Happy Fishing Paytable & Multipliers'}</span>
            </h3>

            <div className="space-y-2">
              {Object.entries(FISH_SPECIES).map(([key, sp]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {key === 'clownfish' && '🐠'}
                      {key === 'puffer' && '🐡'}
                      {key === 'jellyfish' && '🪼'}
                      {key === 'lionfish' && '🐟'}
                      {key === 'swordfish' && '🐬'}
                      {key === 'hammerhead' && '🦈'}
                      {key === 'golden_turtle' && '🐢'}
                      {key === 'mega_octopus' && '🐙'}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-200">
                        {isBn ? sp.nameBn : sp.nameEn}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        HP: {sp.health} • Speed: {sp.speed}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-yellow-400 font-mono">
                      {key === 'mega_octopus' ? '300X - 950X' : `${sp.multiplier}X`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Octopus Wheel Jackpot Modal */}
      {showOctopusWheel && (
        <OctopusWheelModal
          betAmount={betAmount}
          language={language}
          onCollect={(totalWin) => {
            onUpdateBalance(balance + totalWin);
            setShowOctopusWheel(false);
            gameEngine.recordRound(betAmount, totalWin, {
              gameId: 'game-happy-fishing',
              gameName: 'Happy Fishing (Octopus Wheel)',
              category: 'arcade',
              vendor: 'JILI'
            });
          }}
        />
      )}
    </div>
  );
};
