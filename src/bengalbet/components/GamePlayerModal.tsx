// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Sparkles, 
  Trophy, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameItem, Language, UserAccount } from '../types';
import { getProviderInfo } from '../data/providers';
import { useFavorites } from '../hooks/useFavorites';
import { AviatorGame } from '../games/aviator/AviatorGame';
import { SuperAceGame } from '../games/superace/SuperAceGame';
import { SuperAceDeluxeGame } from '../games/superace/SuperAceDeluxeGame';
import { SuperAceIIGame } from '../games/superace/SuperAceIIGame';
import { HeadTailGame } from '../games/headtail/HeadTailGame';
import { FortuneGems3Game } from '../games/fortunegems/FortuneGems3Game';
import { BoxingKingGame } from '../games/boxingking/BoxingKingGame';
import { SuperElementsGame } from '../games/superelements/SuperElementsGame';
import { WildBountyGame } from '../games/wildbounty/WildBountyGame';
import { HappyFishingGame } from '../games/happyfishing/HappyFishingGame';
import { AlibabaGame } from '../games/alibaba/AlibabaGame';
import { FortuneTreeGame } from '../games/fortunetree/FortuneTreeGame';
import { Crazy777Game } from '../games/crazy777/Crazy777Game';
import { SevenCoinsGame } from '../games/sevencoins/SevenCoinsGame';
import { AnubisGame } from '../games/anubis/AnubisGame';
import { PinataGame } from '../games/pinata/PinataGame';
import { MoneyComingGame } from '../games/moneycoming/MoneyComingGame';
import { MagicAceGame } from '../games/magicace/MagicAceGame';
import { SweetBonanzaGame } from '../games/sweetbonanza/SweetBonanzaGame';
import { TreasuresOfAztecGame } from '../games/aztec/TreasuresOfAztecGame';
import { GatesOfOlympusGame } from '../games/olympus/GatesOfOlympusGame';
import { CircusJokerGame } from '../games/circus/CircusJokerGame';
import { gameEngine } from '../services/gameEngine';
import { api } from '../services/api';

interface GamePlayerModalProps {
  game: GameItem | null;
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
  /** Real wallet balance after a server-decided round. */
  onWalletSettled?: (newBalance: number) => void;
}

export const GamePlayerModal: React.FC<GamePlayerModalProps> = ({
  game,
  language,
  user: account,
  onClose,
  onUpdateBalance: _onUpdateCashBalance,
  onWalletSettled
}) => {
  // Signed-in members play real server-decided rounds in the standard game screen; others play a demo
  const realPlay = Boolean(account?.isLoggedIn);
  const [simulationBalance, setSimulationBalance] = useState(2500);
  const user = { ...account, balance: simulationBalance };
  const onUpdateBalance = (value: number) => {
    if (Number.isFinite(value) && value >= 0) setSimulationBalance(value);
  };
  const [currentSubGame, setCurrentSubGame] = useState<'classic' | 'superace2' | 'deluxe' | null>(() => {
    if (!game) return null;
    const isSuperAce2 =
      game.id === 'game-super-ace-2' ||
      game.id === 'slot-super-ace-2' ||
      game.name.toLowerCase().includes('super ace 2') ||
      game.name.toLowerCase().includes('super ace ii') ||
      game.name.toLowerCase().includes('super ace 11') ||
      game.name.includes('সুপার এস ১১') ||
      game.name.includes('সুপার এস II') ||
      game.name.includes('সুপার এস ২');
    if (isSuperAce2) return 'superace2';

    const isDeluxe = 
      game.id === 'game-super-ace-deluxe' ||
      game.id === 'slot-super-ace-deluxe' ||
      game.name.toLowerCase().includes('deluxe') ||
      game.name.includes('ডিলাক্স');
    if (isDeluxe) return 'deluxe';

    const isClassic =
      game.id === 'game-super-ace' ||
      game.id === 'slot-super-ace' ||
      game.name.toLowerCase().includes('super ace') ||
      game.name.includes('সুপার এস');
    if (isClassic) return 'classic';

    return null;
  });

  useEffect(() => {
    if (!game) {
      setCurrentSubGame(null);
      return;
    }
    const isSuperAce2 =
      game.id === 'game-super-ace-2' ||
      game.id === 'slot-super-ace-2' ||
      game.name.toLowerCase().includes('super ace 2') ||
      game.name.toLowerCase().includes('super ace ii') ||
      game.name.toLowerCase().includes('super ace 11') ||
      game.name.includes('সুপার এস ১১') ||
      game.name.includes('সুপার এস II') ||
      game.name.includes('সুপার এস ২');
    if (isSuperAce2) {
      setCurrentSubGame('superace2');
      return;
    }

    const isDeluxe = 
      game.id === 'game-super-ace-deluxe' ||
      game.id === 'slot-super-ace-deluxe' ||
      game.name.toLowerCase().includes('deluxe') ||
      game.name.includes('ডিলাক্স');
    if (isDeluxe) {
      setCurrentSubGame('deluxe');
      return;
    }

    const isClassic =
      game.id === 'game-super-ace' ||
      game.id === 'slot-super-ace' ||
      game.name.toLowerCase().includes('super ace') ||
      game.name.includes('সুপার এস');
    if (isClassic) {
      setCurrentSubGame('classic');
      return;
    }

    setCurrentSubGame(null);
  }, [game?.id, game?.name]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [betAmount, setBetAmount] = useState(50);
  const [gameBalance, setGameBalance] = useState(realPlay ? Number(account.balance) || 0 : (user.balance || 2500));
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.00);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [gameStateMessage, setGameStateMessage] = useState<string>('Ready to play');
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!game) return null;

  // 1. Authentic Spribe Aviator Recreation Engine
  if (game.id === 'game-aviator' || game.name.toLowerCase().includes('aviator') || game.category === 'crash') {
    return (
      <AviatorGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 2. Authentic JILI Super Ace II / 11 Engine (14,000X, Golden Bet +50%, Buy Bonus, Big Joker Double Strike)
  if (currentSubGame === 'superace2') {
    return (
      <SuperAceIIGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
        onSwitchToClassic={() => setCurrentSubGame('classic')}
        onSwitchToDeluxe={() => setCurrentSubGame('deluxe')}
      />
    );
  }

  // 3. Authentic JILI Super Ace Deluxe Engine (10,000X, Star Card, Buy Bonus, 5-Step Multiplier x1-x10 / x2-x20)
  if (currentSubGame === 'deluxe') {
    return (
      <SuperAceDeluxeGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
        onSwitchToClassic={() => setCurrentSubGame('classic')}
        onSwitchToSuperAce2={() => setCurrentSubGame('superace2')}
      />
    );
  }

  // 4. Authentic JILI Super Ace Classic Engine (1,500X, Classic Poker Felt, Golden Card Jokers, 4-Step Multiplier x1-x5 / x2-x10)
  if (currentSubGame === 'classic') {
    return (
      <SuperAceGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
        onSwitchToDeluxe={() => setCurrentSubGame('deluxe')}
        onSwitchToSuperAce2={() => setCurrentSubGame('superace2')}
      />
    );
  }

  // 4. Authentic Head & Tail Casino Engine (3D Coin Toss, Single 1.96X, Streak 215X with Cashout, Double Coin)
  const isHeadTail =
    game.id === 'game-head-tail' ||
    game.id.includes('head-tail') ||
    game.name.toLowerCase().includes('head') ||
    game.name.toLowerCase().includes('tail') ||
    game.name.includes('হেড') ||
    game.name.includes('টেল');

  if (isHeadTail) {
    return (
      <HeadTailGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 5. Authentic JILI Fortune Gems 3 Engine (Split Symbols ⚡, 4th Multiplier Reel, Extra Bet +50%, Garuda Lucky Wheel)
  const isFortuneGems =
    game.id === 'game-fortune-gems-3' ||
    game.id === 'game-fortune-gems-2' ||
    game.id === 'slot-fortune-gems-3' ||
    game.id === 'slot-fortune-gems-2' ||
    game.id.includes('fortune-gems') ||
    game.name.toLowerCase().includes('fortune gem') ||
    game.name.toLowerCase().includes('fortene') ||
    game.name.includes('ফরচুন জেমস');

  if (isFortuneGems) {
    return (
      <FortuneGems3Game
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
        onSwitchToSuperAce={() => setCurrentSubGame('superace2')}
      />
    );
  }

  // 6. Authentic JILI Boxing King Engine (5x5, Cascading Elimination, x8 Multiplier, Title Match ExMATCH Wilds, Free Spins)
  const isBoxingKing =
    game.id === 'game-boxing-king' ||
    game.id === 'slot-boxing-king' ||
    game.id.includes('boxing-king') ||
    game.name.toLowerCase().includes('boxing') ||
    game.name.toLowerCase().includes('boxingjking') ||
    game.name.includes('বক্সিং কিং');

  if (isBoxingKing) {
    return (
      <BoxingKingGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 7. Authentic FA CHAI Super Elements 2 Engine (6x5, 3600 Ways, Cascading 10X/20X, Golden Symbols to Wilds, Free Spins)
  const isSuperElements =
    game.id === 'game-super-elements-2' ||
    game.id === 'slot-super-elements-2' ||
    game.id === 'game-super-elements' ||
    game.id === 'slot-super-elements' ||
    game.id.includes('super-elements') ||
    game.name.toLowerCase().includes('super elements') ||
    game.name.toLowerCase().includes('superelements') ||
    game.name.includes('সুপার এলিমেন্টস');

  if (isSuperElements) {
    return (
      <SuperElementsGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 8. Authentic PG Soft Wild Bounty Showdown Engine (3-4-5-5-4-3, 3600 Ways, Doubling Multipliers up to 1024X, Gold to Wilds, Free Spins Showdown)
  const isWildBounty =
    game.id === 'game-wild-bounty' ||
    game.id === 'slot-wild-bounty' ||
    game.id.includes('wild-bounty') ||
    game.name.toLowerCase().includes('wild bounty') ||
    game.name.toLowerCase().includes('wildbounty') ||
    game.name.toLowerCase().includes('bounty showdown') ||
    game.name.includes('ওয়াইল্ড বাউন্টি') ||
    game.name.includes('বন্য বাউন্টি');

  if (isWildBounty) {
    return (
      <WildBountyGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 9. Authentic JILI Happy Fishing Arcade Shooter (Cannons, Torpedoes, Laser, Mega Octopus 950X Wheel)
  const isHappyFishing =
    game.id === 'game-happy-fishing' ||
    game.id === 'fish-happy-fishing' ||
    game.id === 'game-happy-fishing-hot' ||
    game.id.includes('happy-fishing') ||
    game.name.toLowerCase().includes('happy fishing') ||
    game.name.includes('হ্যাপি ফিশিং');

  if (isHappyFishing) {
    return (
      <HappyFishingGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 10. Authentic Alibaba's Cave of Fortune (5x4, 1024 Ways, Cascading wins, Urn Pick Bonus, YouTube Walkthrough)
  const isAlibaba =
    game.id === 'game-alibaba' ||
    game.id === 'slot-alibaba' ||
    game.id.includes('alibaba') ||
    game.name.toLowerCase().includes('ali baba') ||
    game.name.toLowerCase().includes('alibaba') ||
    game.name.includes('আলিবাবা');

  if (isAlibaba) {
    return (
      <AlibabaGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 11. Authentic JILI Fortune Tree Slot Engine (5x3, 30 Paylines, Tree Shake Wilds & Multipliers, Hongbao Bonus, 15K Win YouTube Video)
  const isFortuneTree =
    game.id === 'game-fortune-tree' ||
    game.id === 'slot-fortune-tree' ||
    game.id.includes('fortune-tree') ||
    game.name.toLowerCase().includes('fortune tree') ||
    game.name.toLowerCase().includes('fortunetree') ||
    game.name.includes('ফরচুন ট্রি');

  if (isFortuneTree) {
    return (
      <FortuneTreeGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 12. Authentic JILI Crazy 777 Slot Engine (3 Reels + 4th Special Reel, Multipliers, Respins, YouTube Walkthrough)
  const isCrazy777 =
    game.id === 'game-crazy-777' ||
    game.id === 'slot-crazy-777' ||
    game.id.includes('crazy-777') ||
    game.name.toLowerCase().includes('crazy 777') ||
    game.name.toLowerCase().includes('crazy777') ||
    game.name.includes('ক্রেজি৭৭৭') ||
    game.name.includes('ক্রেজি ৭৭৭');

  if (isCrazy777) {
    return (
      <Crazy777Game
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 13. Authentic 3 Oaks 777 Coins Hold & Win Engine (3x3, 5 Paylines, Collect Coin, 2,000X Grand Jackpot, YouTube Walkthrough)
  const isSevenCoins =
    game.id === 'game-777-coins' ||
    game.id === 'slot-777-coins' ||
    game.id.includes('777-coins') ||
    game.name.toLowerCase().includes('777 coins') ||
    game.name.toLowerCase().includes('777coins') ||
    game.name.includes('777 কয়েন') ||
    game.name.includes('৭৭৭ কয়েন');

  if (isSevenCoins) {
    return (
      <SevenCoinsGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 14. Authentic PG Soft Anubis Wrath (5x4, Cascades, Wrath Roar, YouTube Gameplay Walkthrough)
  const isAnubis =
    game.id === 'game-anubis' ||
    game.id === 'slot-anubis' ||
    game.id.includes('anubis') ||
    game.name.toLowerCase().includes('anubis') ||
    game.name.includes('আনুবিস');

  if (isAnubis) {
    return (
      <AnubisGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 15. Authentic PG Soft Piñata Wins (5x3, 20 Lines, Star Multipliers up to 100x, YouTube Walkthrough)
  const isPinataWins =
    game.id === 'game-pinata-wins' ||
    game.id === 'slot-pinata-wins' ||
    game.id.includes('pinata') ||
    game.name.toLowerCase().includes('pinata') ||
    game.name.toLowerCase().includes('piñata') ||
    game.name.includes('পিনাটা');

  if (isPinataWins) {
    return (
      <PinataGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 16. Authentic JILI Money Coming Engine (3 Number Reels + 4th Special Reel, Respin, 10,000X Lucky Wheel, YouTube Walkthrough)
  const isMoneyComing =
    game.id === 'game-money-coming' ||
    game.id === 'slot-money-coming' ||
    game.id.includes('money-coming') ||
    game.id.includes('moneycoming') ||
    game.name.toLowerCase().includes('money coming') ||
    game.name.toLowerCase().includes('moneycoming') ||
    game.name.includes('মানি কামিং');

  if (isMoneyComing) {
    return (
      <MoneyComingGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 17. Authentic JILI Magic Ace Wild Lock Engine (5x4, 1024 Ways, Golden Cards, Wild Lock, Buy Feature, YouTube Walkthrough)
  const isMagicAce =
    game.id === 'game-magic-ace' ||
    game.id === 'slot-magic-ace' ||
    game.id.includes('magic-ace') ||
    game.id.includes('magicace') ||
    game.name.toLowerCase().includes('magic ace') ||
    game.name.toLowerCase().includes('magicace') ||
    game.name.includes('ম্যাজিক এস');

  if (isMagicAce) {
    return (
      <MagicAceGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 18. Pragmatic Play Sweet Bonanza Candy Engine (6x5, Scatter Pays 8+, Tumbles, Candy Bombs up to 100X, Buy Feature)
  const isSweetBonanza =
    game.id === 'game-sweet-bonanza' ||
    game.id === 'slot-sweet-bonanza' ||
    game.id.includes('sweet-bonanza') ||
    game.id.includes('sweetbonanza') ||
    game.name.toLowerCase().includes('sweet bonanza') ||
    game.name.toLowerCase().includes('sweetbonanza') ||
    game.name.includes('সুইট বোনানজা');

  if (isSweetBonanza) {
    return (
      <SweetBonanzaGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 19. Authentic PG Soft Treasures of Aztec (6x5 + Top Reel, Cascades, Wilds-on-the-Way, Increasing Multipliers)
  const isAztec =
    game.id === 'game-treasures-aztec' ||
    game.id === 'slot-aztec-treasure' ||
    game.id.includes('aztec') ||
    game.name.toLowerCase().includes('aztec') ||
    game.name.includes('আজটেক');

  if (isAztec) {
    return (
      <TreasuresOfAztecGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 20. Authentic Pragmatic Play Gates of Olympus (6x5, Scatter Pays, Zeus Multiplier Orbs up to 500X, Free Spins)
  const isOlympus =
    game.id === 'game-gates-of-olympus' ||
    game.id === 'slot-gates-of-olympus' ||
    game.id.includes('olympus') ||
    game.name.toLowerCase().includes('olympus') ||
    game.name.toLowerCase().includes('gates of olympus') ||
    game.name.includes('অলিম্পাস') ||
    game.name.includes('জিউস');

  if (isOlympus) {
    return (
      <GatesOfOlympusGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  // 21. Authentic JILI Circus Joker 4096 (6x4, 4096 Ways to Win, Multiplier Wheel up to 4096X)
  const isCircusJoker =
    game.id === 'game-circus-joker' ||
    game.id === 'slot-circus-joker' ||
    game.id.includes('circus') ||
    game.name.toLowerCase().includes('circus joker') ||
    game.name.toLowerCase().includes('circus') ||
    game.name.includes('সার্কাস জোকার');

  if (isCircusJoker) {
    return (
      <CircusJokerGame
        language={language}
        user={user}
        onClose={onClose}
        onUpdateBalance={onUpdateBalance}
      />
    );
  }

  if (!game) return null;
  const isFav = isFavorite(game.id);

  // Aviator / Crash or Slot simulation
  const handlePlayRound = async () => {
    if (isPlaying || gameBalance < betAmount) return;
    setLastWin(null);
    if (realPlay) {
      // The server picks the result and moves the money; the screen only shows it
      setIsPlaying(true);
      setGameStateMessage('Round in progress...');
      try {
        const res = await api.games.playRound({ gameId: game.id, category: game.category, gameName: game.name, vendor: game.provider, betAmount });
        setGameBalance(res.newBalance);
        onWalletSettled?.(res.newBalance);
        if (res.round.isWin) {
          setLastWin(res.round.payout);
          setGameStateMessage(res.round.isJackpot ? `💥 মেগা জ্যাকপট! ৳ ${res.round.payout}` : `MEGA WIN! ৳ ${res.round.payout} (x${res.round.multiplier})`);
          confetti({ particleCount: res.round.isJackpot ? 140 : 80, spread: 70 });
        } else {
          setGameStateMessage('Better luck next spin!');
        }
      } catch (e: any) {
        setGameStateMessage(e?.message || 'রাউন্ড সম্পন্ন হয়নি।');
      } finally {
        setIsPlaying(false);
      }
      return;
    }
    setGameBalance(prev => prev - betAmount);
    onUpdateBalance(gameBalance - betAmount);
    setIsPlaying(true);
    setGameStateMessage('Round in progress...');

    // Slots / Live round simulation powered by Game Engine (0-100% RTP)
    setTimeout(() => {
      setIsPlaying(false);
      const outcome = gameEngine.evaluateSpinOutcome(game.id, game.category, betAmount);
      if (outcome.isWin) {
        const winCash = outcome.payout;
        setLastWin(winCash);
        setGameBalance(prev => prev + winCash);
        onUpdateBalance(gameBalance - betAmount + winCash);
        setGameStateMessage(outcome.isJackpot ? `💥 মেগা জ্যাকপট! ৳ ${winCash}` : `MEGA WIN! ৳ ${winCash}`);
        confetti({ particleCount: outcome.isJackpot ? 140 : 80, spread: 70 });
        gameEngine.recordRound(betAmount, winCash, {
          gameId: game.id,
          gameName: game.name,
          category: game.category,
          vendor: game.provider
        });
      } else {
        setGameStateMessage(outcome.isNearMiss ? '😱 অল্পের জন্য মিস! একটুর জন্য জিতলেন না' : 'Better luck next spin!');
        gameEngine.recordRound(betAmount, 0, {
          gameId: game.id,
          gameName: game.name,
          category: game.category,
          vendor: game.provider
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-[#030d08] flex flex-col overflow-hidden select-none animate-in fade-in">
      <div 
        id="game-player-frame"
        className="relative w-full h-full flex flex-col overflow-hidden"
      >
        {/* Game Stage Top Bar */}
        <div className="bg-[#051c13] px-4 py-2.5 border-b border-[#14593e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src={game.image} 
              alt={game.name} 
              className="w-8 h-8 rounded-lg object-cover border border-yellow-400/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white font-game tracking-wider">
                  {language === 'bn' && game.nameBn ? game.nameBn : game.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <img 
                  src={getProviderInfo(game.provider).logo} 
                  alt={game.provider} 
                  className="w-3 h-3 object-contain" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] text-yellow-300 font-bold">
                  {getProviderInfo(game.provider).name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#092c1e] border border-[#14593e] px-3 py-1 rounded-full text-xs font-bold text-yellow-300 font-game">
              ৳ {gameBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            {/* Favorite Toggle in Game */}
            <button
              onClick={() => toggleFavorite(game.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isFav 
                  ? 'bg-rose-950/60 border-rose-600 text-rose-500 hover:bg-rose-900/80' 
                  : 'bg-[#0e432f] border-[#14593e] text-gray-300 hover:text-white'
              }`}
              title={isFav ? (language === 'bn' ? 'সংগ্রহ থেকে সরান' : 'Remove from Favorites') : (language === 'bn' ? 'সংগ্রহে যুক্ত করুন' : 'Add to Favorites')}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-[#0e432f] text-gray-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Play Arena */}
        <div className="flex-1 bg-gradient-to-b from-[#062419] via-[#03150e] to-black relative flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Game Visual Arena */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-64 h-48 sm:w-80 sm:h-56 rounded-2xl bg-gradient-to-b from-[#0b3b28] to-[#041a11] border-2 border-yellow-400/60 p-4 flex flex-col items-center justify-center shadow-2xl relative">
              <div className="text-5xl sm:text-6xl mb-2 filter drop-shadow animate-pulse">
                🎰💎🪙
              </div>
              <span className="text-lg sm:text-xl font-bold text-white font-game">
                {isPlaying ? 'SPINNING REELS...' : (lastWin ? `WON ৳ ${lastWin}!` : game.name)}
              </span>
              <span className="text-xs text-yellow-300 mt-1">{gameStateMessage}</span>
            </div>
          </div>
        </div>

        {/* Game Controller Bottom Bar */}
        <div className="bg-[#051c13] p-3 sm:p-4 border-t border-[#14593e] flex flex-wrap items-center justify-between gap-3">
          {/* Bet Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-300">{language === 'bn' ? 'বাজির পরিমাণ:' : 'Bet Amount:'}</span>
            {[20, 50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                disabled={isPlaying}
                onClick={() => setBetAmount(amt)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-bold font-game tracking-wide transition-all
                  ${betAmount === amt 
                    ? 'bg-yellow-400 text-black shadow' 
                    : 'bg-[#092c1e] text-gray-300 border border-[#14593e] hover:border-yellow-400'
                  }
                `}
              >
                ৳ {amt}
              </button>
            ))}
          </div>

          {/* Action Play Button */}
          <button
            onClick={handlePlayRound}
            disabled={isPlaying || gameBalance < betAmount}
            className={`
              btn-bdt-gold px-8 py-2.5 rounded-xl font-black text-sm sm:text-base tracking-wider uppercase shadow-xl flex items-center gap-2
              ${isPlaying ? 'opacity-70 animate-pulse' : 'hover:scale-105 active:scale-95'}
            `}
          >
            <Play className="w-4 h-4 fill-amber-950" />
            <span>{isPlaying ? 'PLAYING...' : (language === 'bn' ? 'প্লে করুন' : 'PLAY NOW')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
