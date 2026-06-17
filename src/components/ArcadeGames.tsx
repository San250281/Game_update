/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRewardEngine } from '../lib/store';
import { GameType, TransactionSource } from '../types';
import {
  Coins, Sparkles, Play, RotateCcw, ShieldAlert,
  Zap, ArrowLeft, Joystick, Trophy, Key, CheckCircle,
  HelpCircle, ChevronRight, ListCollapse, Swords, HelpCircle as HelpIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArcadeGamesProps {
  gameId: GameType;
  onExit: () => void;
}

export default function ArcadeGames({ gameId, onExit }: ArcadeGamesProps) {
  const { user, creditCoins, debitCoins } = useRewardEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [score, setScore] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Define metadata, costs and reward multipliers for all games
  const gameConfig: {
    [key in GameType]?: {
      title: string;
      icon: string;
      cost: number;
      minScoreToWin: number;
      desc: string;
      rating: string;
      diff: 'Easy' | 'Medium' | 'Hard';
    }
  } = {
    [GameType.LUDO]: { title: 'Royal Ludo', icon: '🎲', cost: 25, minScoreToWin: 6, desc: 'Roll dice, slide tokens, reach center first!', rating: '4.9 ★', diff: 'Medium' },
    [GameType.CHESS]: { title: 'Grandmaster Chess', icon: '♟️', cost: 40, minScoreToWin: 1, desc: 'Defeat the computer AI, protect your King!', rating: '4.8 ★', diff: 'Hard' },
    [GameType.TIC_TAC_TOE]: { title: 'Tic-Tac-Toe', icon: '❌', cost: 10, minScoreToWin: 1, desc: 'Avoid match traps, connect 3 to defeat AI.', rating: '4.5 ★', diff: 'Easy' },
    [GameType.SNAKE]: { title: 'Classic Snake', icon: '🐍', cost: 15, minScoreToWin: 10, desc: 'Gobble fruit, grow longer, avoid walls.', rating: '4.7 ★', diff: 'Easy' },
    [GameType.TETRIS]: { title: 'Retro Block Fall', icon: '🧱', cost: 20, minScoreToWin: 50, desc: 'Rotate, puzzle and clear horizontal lines.', rating: '4.8 ★', diff: 'Hard' },
    [GameType.PONG]: { title: 'Aesthetic Pong', icon: '🏓', cost: 15, minScoreToWin: 5, desc: 'Bounce balls past AI block to win points.', rating: '4.4 ★', diff: 'Medium' },
    [GameType.FLAPPY_BIRD]: { title: 'Flappy Flyer', icon: '🐦', cost: 15, minScoreToWin: 4, desc: 'Dodge retro plumbing layouts recursively!', rating: '4.6 ★', diff: 'Medium' },
    [GameType.MEMORY_MATCH]: { title: 'Card Memory', icon: '🃏', cost: 10, minScoreToWin: 8, desc: 'Flip pairs of icons under elapsed limits.', rating: '4.5 ★', diff: 'Easy' },
    [GameType.GAME_2048]: { title: 'Merge 2048', icon: '🔢', cost: 25, minScoreToWin: 256, desc: 'Combine same-numbered blocks upwards.', rating: '4.7 ★', diff: 'Medium' },
    [GameType.MINESWEEPER]: { title: 'Mine Sweeper', icon: '💣', cost: 15, minScoreToWin: 10, desc: 'Uncover coordinates, flag radioactive elements.', rating: '4.3 ★', diff: 'Medium' },
    [GameType.WORD_GUESSER]: { title: 'Word Solver', icon: '🔤', cost: 20, minScoreToWin: 1, desc: 'Guess secret 5-letter puzzles in six tries.', rating: '4.6 ★', diff: 'Medium' },
    [GameType.SPACE_SHOOTER]: { title: 'Space Galaxy', icon: '🚀', cost: 20, minScoreToWin: 80, desc: 'Tap bullet rounds, blast oncoming meteorites.', rating: '4.8 ★', diff: 'Hard' },
    [GameType.WHACK_A_MOLE]: { title: 'Whack-a-Mole', icon: '🐹', cost: 15, minScoreToWin: 12, desc: 'Tap speed-bursting critters before cooldown expiration.', rating: '4.4 ★', diff: 'Easy' },
    [GameType.BALLOON_POPPER]: { title: 'Balloon Popper', icon: '🎈', cost: 10, minScoreToWin: 15, desc: 'Tap upward gas balloons to score golden multipliers.', rating: '4.5 ★', diff: 'Easy' },
    [GameType.BRICK_BREAKER]: { title: 'Brick Crusher', icon: '🔥', cost: 20, minScoreToWin: 40, desc: 'Shatter colorful brick tiles with bouncing balls.', rating: '4.7 ★', diff: 'Medium' },
    [GameType.COLOR_MATCHER]: { title: 'Simon Simon', icon: '🟡', cost: 15, minScoreToWin: 5, desc: 'Imitate flashing sequential light pulses.', rating: '4.5 ★', diff: 'Easy' },
    [GameType.ROCK_PAPER_SESSORS]: { title: 'R-P-S Duel', icon: '✊', cost: 10, minScoreToWin: 1, desc: 'Classic hands duel against mathematical AI.', rating: '4.2 ★', diff: 'Easy' },
    [GameType.SUDOKU]: { title: 'Sudoku Board', icon: '🧩', cost: 25, minScoreToWin: 1, desc: 'Fill rows & columns with non-repeating digits.', rating: '4.6 ★', diff: 'Hard' },
    [GameType.COIN_FLIP]: { title: 'Coin Flipper', icon: '🪙', cost: 10, minScoreToWin: 1, desc: 'Flip digital currencies for 2x returns.', rating: '4.3 ★', diff: 'Easy' },
    [GameType.DODGE_OBSTACLES]: { title: 'Highway Dodger', icon: '🏎️', cost: 15, minScoreToWin: 30, desc: 'Avoid block barriers on a 3-lane speed path.', rating: '4.7 ★', diff: 'Medium' },
    
    // Brand New Reward/Arcade Games Config:
    [GameType.LUCKY_DRAW]: { title: 'Jackpot Lucky Draw', icon: '🎟️', cost: 15, minScoreToWin: 1, desc: 'Draw from golden tickets. Match rewards multiply up to 5x!', rating: '4.9 ★', diff: 'Easy' },
    [GameType.DAILY_CHECKIN]: { title: 'Daily Calendar', icon: '📅', cost: 10, minScoreToWin: 1, desc: 'Verify weekly attendance streaks to claim bonus cash multipliers!', rating: '4.9 ★', diff: 'Easy' },
    [GameType.COIN_COLLECTOR]: { title: 'Sky Coin Collector', icon: '⭐', cost: 15, minScoreToWin: 10, desc: 'Control your golden chest & collect falling sky coins before timer runs dry!', rating: '4.8 ★', diff: 'Easy' },
    [GameType.TREASURE_HUNT]: { title: 'Island Treasure Hunt', icon: '🏴‍☠️', cost: 20, minScoreToWin: 1, desc: 'Select sand grid tiles to dig up hidden chests. Evade beach sharks!', rating: '4.7 ★', diff: 'Medium' },
    
    // Brand New Casual Games Config:
    [GameType.MATCH_3]: { title: 'Sweet Match-3 Blast', icon: '🍬', cost: 20, minScoreToWin: 50, desc: 'Swap elements to match 3 or more sweet candies in rows!', rating: '4.8 ★', diff: 'Medium' },
    [GameType.WORD_SEARCH]: { title: 'Word searcher', icon: '🔍', cost: 15, minScoreToWin: 1, desc: 'Find and trace hidden words encoded inside our cryptic grid board.', rating: '4.5 ★', diff: 'Medium' },
    [GameType.CROSSWORD]: { title: 'Cryptic Crossword', icon: '📝', cost: 20, minScoreToWin: 3, desc: 'Translate clues and overlap vocabulary letters across cell rows!', rating: '4.6 ★', diff: 'Hard' },
    
    // Brand New Skill Games Config:
    [GameType.CHECKERS]: { title: 'Checkers Board', icon: '🔴', cost: 25, minScoreToWin: 1, desc: 'Diagnose chess routes, leap enemy red checkers and score kings!', rating: '4.7 ★', diff: 'Medium' },
    [GameType.CONNECT_4]: { title: 'Connect 4 Drops', icon: '🔵', cost: 20, minScoreToWin: 1, desc: 'Drop glowing columns. Align 4 units horizontally or diagonally!', rating: '4.6 ★', diff: 'Medium' },
    
    // Brand New Quick Reflex Games Config:
    [GameType.REACTION_TIME]: { title: 'Reaction Speed Test', icon: '⏱️', cost: 10, minScoreToWin: 1, desc: 'Click immediately when visual screens trigger green warning panels!', rating: '4.8 ★', diff: 'Easy' },
    [GameType.CLICK_SPEED]: { title: 'Click Speed Test', icon: '💥', cost: 10, minScoreToWin: 40, desc: 'Mash click targets inside 10 seconds to score high multiplier speed cash.', rating: '4.6 ★', diff: 'Easy' },
    
    // Brand New Runner Games Config:
    [GameType.RUNNER_TEMPLE]: { title: 'Lost Temple Jumper', icon: '🛕', cost: 20, minScoreToWin: 80, desc: 'Sprint, jump over timber blocks & turn high-speed narrow corridors.', rating: '4.7 ★', diff: 'Hard' },
    [GameType.RUNNER_SUBWAY]: { title: 'Subway Surfer Rail', icon: '🚇', cost: 20, minScoreToWin: 80, desc: 'Steer left or right across 3-tracks to avoid oncoming express trains!', rating: '4.8 ★', diff: 'Medium' },
    [GameType.DINO_RUNNER]: { title: 'Jumping Chrome Dino', icon: '🦖', cost: 15, minScoreToWin: 100, desc: 'Classic retro runner! Hop cactus shrubs, sprint forward in pixel bounds.', rating: '4.9 ★', diff: 'Easy' },
    [GameType.ENDLESS_JUMP]: { title: 'Cloud Platform Jumper', icon: '☁️', cost: 15, minScoreToWin: 120, desc: 'Bounce upwards on green platforms. Keep flying high without falling!', rating: '4.7 ★', diff: 'Medium' },
    
    // Brand New Card Games Config:
    [GameType.SOLITAIRE]: { title: 'Klondike Solitaire', icon: '🎴', cost: 25, minScoreToWin: 5, desc: 'Arrange cards by sequential suites across suit stacks.', rating: '4.6 ★', diff: 'Hard' },
    [GameType.POKER]: { title: '5-Card Draw Poker', icon: '🃏', cost: 30, minScoreToWin: 1, desc: 'Classic poker. Form pairs, flushes or straights against AI hands.', rating: '4.7 ★', diff: 'Hard' },
    [GameType.BLACKJACK]: { title: 'Classic Blackjack 21', icon: '🪙', cost: 20, minScoreToWin: 21, desc: 'Stand, hit or double. Reach high totals without exceeding 21!', rating: '4.8 ★', diff: 'Medium' },
    [GameType.RUMMY]: { title: 'Rummy Deck Sorter', icon: '🀄', cost: 25, minScoreToWin: 1, desc: 'Sort numeric cards into sequential sequences and uniform suits.', rating: '4.5 ★', diff: 'Medium' },
    [GameType.UNO]: { title: 'Uno Color Party', icon: '🌈', cost: 20, minScoreToWin: 1, desc: 'Match same-colored card rows, intercept moves with action block cards!', rating: '4.7 ★', diff: 'Easy' }
  };

  const currentConf = gameConfig[gameId] || {
    title: 'Arcade Game',
    icon: '🎮',
    cost: 15,
    minScoreToWin: 10,
    desc: 'Unleash your high gaming score and gather coin bags!',
    rating: '4.5 ★',
    diff: 'Medium' as const
  };

  const handleStartGame = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setScore(0);
    setEarnings(0);

    const cost = currentConf.cost;
    if ((user?.coins || 0) < cost) {
      setErrorMsg('Inadequate Wallet Balance! Please claim daily checkins or watch ads first.');
      return;
    }

    try {
      const dbRes = await debitCoins(cost, TransactionSource.GAME);
      if (dbRes) {
        setIsPlaying(true);
      } else {
        setErrorMsg('Failed to process debit. Try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error executing balance cost deduction.');
    }
  };

  const handleClaimWin = async (finalScore: number, coinAwards: number) => {
    setIsPlaying(false);
    setScore(finalScore);
    if (coinAwards > 0) {
      setEarnings(coinAwards);
      try {
        await creditCoins(coinAwards, TransactionSource.GAME);
        setStatusMsg(`🎉 Victorous Run! Scored ${finalScore}. Claimed +${coinAwards} Coins!`);
      } catch (e) {
        setStatusMsg(`Error claiming coins but score saved: ${finalScore}`);
      }
    } else {
      setStatusMsg(`Better fortune next turn! Your score: ${finalScore}.`);
    }
  };

  // Switch dispatcher to render the appropriate interactive gaming frame
  const renderGameContent = () => {
    switch (gameId) {
      case GameType.LUDO:
        return <LudoGameFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.CHESS:
        return <ChessGameFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.TIC_TAC_TOE:
        return <TicTacToeFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.SNAKE:
        return <SnakeGameFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.MEMORY_MATCH:
        return <MemoryMatchFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.FLAPPY_BIRD:
        return <FlappyBirdFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.PONG:
        return <PongGameFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.SPACE_SHOOTER:
        return <SpaceShooterFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.WHACK_A_MOLE:
        return <WhackAMoleFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.GAME_2048:
        return <Game2048Frame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.MINESWEEPER:
        return <MinesweeperFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.WORD_GUESSER:
        return <WordGuesserFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.BALLOON_POPPER:
        return <BalloonPopperFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.BRICK_BREAKER:
        return <BrickBreakerFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.COLOR_MATCHER:
        return <ColorMatcherFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.ROCK_PAPER_SESSORS:
        return <RockPaperScissorsFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.SUDOKU:
        return <SudokuFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.COIN_FLIP:
        return <CoinFlipFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.DODGE_OBSTACLES:
        return <DodgeObstaclesFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.TETRIS:
        return <TetrisFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      
      // Brand New Reward / Arcade Games cases:
      case GameType.LUCKY_DRAW:
        return <LuckyDrawFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.DAILY_CHECKIN:
        return <DailyCheckinFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.COIN_COLLECTOR:
        return <CoinCollectorFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.TREASURE_HUNT:
        return <TreasureHuntFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;

      // Brand New Casual Games cases:
      case GameType.MATCH_3:
        return <Match3Frame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.WORD_SEARCH:
        return <WordSearchFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.CROSSWORD:
        return <CrosswordFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;

      // Brand New Skill Games cases:
      case GameType.CHECKERS:
        return <CheckersFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.CONNECT_4:
        return <Connect4Frame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;

      // Brand New Quick Reflex Games cases:
      case GameType.REACTION_TIME:
        return <ReactionTimeFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.CLICK_SPEED:
        return <ClickSpeedFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;

      // Brand New Runner Games cases:
      case GameType.RUNNER_TEMPLE:
        return <TempleRunFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.RUNNER_SUBWAY:
        return <SubwaySurfersFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.DINO_RUNNER:
        return <DinoRunnerFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.ENDLESS_JUMP:
        return <EndlessJumpFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;

      // Brand New Card Games cases:
      case GameType.SOLITAIRE:
        return <SolitaireFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.POKER:
        return <PokerPlayMoneyFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.BLACKJACK:
        return <BlackjackFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.RUMMY:
        return <RummyFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      case GameType.UNO:
        return <UnoFrame onFinish={(s, c) => handleClaimWin(s, c)} cost={currentConf.cost} />;
      default:
        return (
          <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-300">
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm">Extended HTML5 framework is initializing.</p>
            <button
              onClick={() => handleClaimWin(15, currentConf.cost * 2)}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs"
            >
              Instant Test Unlock
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-sans">
      
      {/* Visual Header */}
      <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black tracking-tight uppercase flex items-center gap-2">
              <span className="text-xl leading-none">{currentConf.icon}</span>
              {currentConf.title}
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Arcade Arena</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 px-2 pl-2.5 py-1 rounded-full flex items-center gap-1.5 border border-slate-750">
            Difficulty:
            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
              currentConf.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
              currentConf.diff === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-rose-500/10 text-rose-400'
            }`}>
              {currentConf.diff}
            </span>
          </span>
        </div>
      </div>

      <div className="p-6 bg-slate-50 min-h-[420px] flex flex-col justify-center items-center">
        {!isPlaying ? (
          <div className="w-full max-w-md text-center flex flex-col items-center">
            <span className="text-5xl mb-4 select-none animate-bounce">{currentConf.icon}</span>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{currentConf.title}</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-xs">{currentConf.desc}</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-6 mb-6">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Play Cost</span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-700 font-black text-sm">
                  <Coins className="w-4.5 h-4.5 text-amber-500 fill-amber-300" />
                  {currentConf.cost} Coins
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Top Reward Limit</span>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-black text-sm">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                  +{currentConf.cost * 3} Coins
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl w-full">
                {errorMsg}
              </div>
            )}

            {statusMsg && (
              <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl w-full">
                {statusMsg}
              </div>
            )}

            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-300" />
              Debit {currentConf.cost} Coins & Start Arena
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {renderGameContent()}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==============================================
   SUB GAME: LUDO GAME IMPLEMENTATION
   ============================================== */
function LudoGameFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [dice, setDice] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [tokens, setTokens] = useState([0, 0, 0, 0]); // 4 tokens
  const [turn, setTurn] = useState<number>(0); // 0 = Player, 1 = Red, 2 = Green, 3 = Blue
  const [status, setStatus] = useState("Roll dice to make progress!");

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    let spins = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      spins++;
      if (spins > 6) {
        clearInterval(interval);
        setIsRolling(false);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDice(finalDice);
        executePlayerMove(finalDice);
      }
    }, 100);
  };

  const executePlayerMove = (value: number) => {
    // Player controls Token 0
    setTokens(prev => {
      const next = [...prev];
      next[0] = Math.min(next[0] + value, 57); // 57 is home center
      
      if (next[0] === 57) {
        setStatus("Your Token reached Ludo center! Double Jackpot Awarded!");
        setTimeout(() => onFinish(57, cost * 3), 1500);
      } else {
        setStatus(`Moved Token forward ${value} spots! Next Player turn.`);
        // Run AI turns
        setTimeout(() => runAITurns(next), 800);
      }
      return next;
    });
  };

  const runAITurns = async (currentTokens: number[]) => {
    let tk = [...currentTokens];
    // Reds, Greens, Blues automatically move
    for (let i = 1; i < 4; i++) {
      const rollVal = Math.floor(Math.random() * 6) + 1;
      tk[i] = Math.min(tk[i] + rollVal, 57);
      await new Promise(r => setTimeout(r, 400));
      setTokens([...tk]);
    }
    // Check if any opponent won
    const winner = tk.findIndex((t, idx) => t === 57 && idx !== 0);
    if (winner !== -1) {
      setStatus(`A opponent token reached home center! You scored ${tk[0]}.`);
      setTimeout(() => onFinish(tk[0], 0), 1000);
    } else {
      setStatus(`Your turn! Roll to proceed.`);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center select-none font-sans">
      <div className="mb-4 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border">
        {status}
      </div>

      {/* Simplified 15x15 Ludo layout representation */}
      <div className="w-full aspect-square bg-[#fff7ed] border-4 border-slate-800 rounded-2xl overflow-hidden grid grid-cols-3 gap-0 shadow-md">
        {/* Core Ludo board corner fields and centers */}
        <div className="bg-emerald-500 border-r border-b border-slate-800 flex items-center justify-center relative p-3">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-800">
            Player {tokens[0] > 0 && <span className="absolute w-4 h-4 bg-yellow-400 rounded-full border border-slate-800 animate-ping"></span>}
            🟢
          </div>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono text-white">Pos: {tokens[0]}/57</span>
        </div>
        <div className="bg-slate-100 flex flex-col justify-between p-1 text-[9px] font-mono text-slate-500">
          <div className="flex justify-around border-b"><span>Home Pathway</span></div>
          <div className="flex justify-center flex-wrap gap-1">
            <span className="bg-emerald-400 px-1 rounded border">P1: {tokens[0]}</span>
            <span className="bg-rose-400 px-1 rounded border">P2: {tokens[1]}</span>
          </div>
        </div>
        <div className="bg-rose-500 border-l border-b border-slate-800 flex items-center justify-center relative p-3">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-sm text-rose-800">
            Red {tokens[1] > 0 && <span className="absolute w-4 h-4 bg-red-400 rounded-full border border-slate-800"></span>}
            🔴
          </div>
          <span className="absolute bottom-1 left-2 text-[9px] font-mono text-white">Pos: {tokens[1]}/57</span>
        </div>

        <div className="bg-slate-100 flex justify-between p-1 items-center text-[9px] text-slate-500 font-mono">
          <div className="text-center w-full">Safe Corridor</div>
        </div>
        <div className="bg-amber-300 flex flex-col items-center justify-center p-3 font-bold border-l border-r border-slate-800">
          <Trophy className="w-5 h-5 text-amber-600 animate-pulse" />
          <span className="text-[8px] uppercase tracking-wider text-amber-900">HOME</span>
        </div>
        <div className="bg-slate-100 flex justify-between p-1 items-center text-[9px] text-slate-500 font-mono">
          <div className="text-center w-full">Safe Zone</div>
        </div>

        <div className="bg-blue-500 border-r border-t border-slate-800 flex items-center justify-center relative p-3">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-800">
            Blue {tokens[2] > 0 && <span className="absolute w-4 h-4 bg-blue-400 rounded-full border border-slate-800"></span>}
            🔵
          </div>
          <span className="absolute top-1 right-2 text-[9px] font-mono text-white">Pos: {tokens[2]}/57</span>
        </div>
        <div className="bg-slate-100 flex flex-col justify-between p-1 text-[9px] font-mono text-slate-500">
          <div className="flex justify-center flex-wrap gap-1 mt-auto">
            <span className="bg-blue-400 px-1 rounded border">P3: {tokens[2]}</span>
            <span className="bg-yellow-400 px-1 rounded border">P4: {tokens[3]}</span>
          </div>
          <span className="text-center font-bold">Corridors</span>
        </div>
        <div className="bg-yellow-500 border-l border-t border-slate-800 flex items-center justify-center relative p-3">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-700 flex items-center justify-center font-bold text-sm text-yellow-800">
            Yellow {tokens[3] > 0 && <span className="absolute w-4 h-4 bg-yellow-400 rounded-full border border-slate-800"></span>}
            🟡
          </div>
          <span className="absolute top-1 left-2 text-[9px] font-mono text-white">Pos: {tokens[3]}/57</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <div className={`w-14 h-14 bg-white border-2 border-slate-800 rounded-2xl flex items-center justify-center text-xl font-mono font-black shadow-md ${isRolling ? 'animate-spin' : ''}`}>
          {dice}
        </div>
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
        >
          {isRolling ? 'Spinning...' : 'Roll Dice'}
        </button>
      </div>

      <button
        onClick={() => onFinish(tokens[0], Math.floor(tokens[0] * 0.8))}
        className="mt-6 text-xs text-slate-500 underline uppercase font-bold tracking-wider hover:text-slate-800 cursor-pointer"
      >
        Forfeit & Settle Scores
      </button>
    </div>
  );
}

/* ==============================================
   SUB GAME: CHESS GAME IMPLEMENTATION
   ============================================== */
function ChessGameFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  // Let's draw an actual visual chessboard and hold piece states.
  // Standard Piece Map for simple coordinates.
  const [board, setBoard] = useState<(string | null)[][]>([
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  ]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [msg, setMsg] = useState("Your turn! Select a White piece (Row 6-7).");

  const selectCell = (r: number, c: number) => {
    if (turn !== 'white') return;
    const piece = board[r][c];

    if (selectedCell) {
      const [sr, sc] = selectedCell;
      if (sr === r && sc === c) {
        setSelectedCell(null);
        return;
      }

      // Move execution
      const newBoard = board.map(row => [...row]);
      const activePiece = newBoard[sr][sc];
      newBoard[sr][sc] = null;
      newBoard[r][c] = activePiece;

      setBoard(newBoard);
      setSelectedCell(null);
      
      // Look if opponent King was captured
      if (piece === '♚') {
        setMsg("Checkmate! You captured the Enemy Black King!");
        setTimeout(() => onFinish(1, cost * 3), 1500);
        return;
      }

      setTurn('black');
      setMsg("Computer opponent is calculating move turn...");
      setTimeout(() => runAIMove(newBoard), 1000);
    } else {
      if (piece && ['♙', '♖', '♘', '♗', '♕', '♔'].includes(piece)) {
        setSelectedCell([r, c]);
        setMsg(`Selected White piece. Pick target coordinates to proceed.`);
      } else {
        setMsg("Invalid selection. Pick white pieces.");
      }
    }
  };

  const runAIMove = (currentBoard: (string | null)[][]) => {
    // Collect all black cells
    const blackPieces: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && ['♟', '♜', '♞', '♝', '♛', '♚'].includes(p)) {
          blackPieces.push([r, c]);
        }
      }
    }

    if (blackPieces.length === 0) {
      setMsg("You scored Checkmate! All black pieces captured.");
      setTimeout(() => onFinish(1, cost * 3), 1500);
      return;
    }

    // Pick a random piece and push it down one square if empty, or capture diagonal!
    let moved = false;
    let attempts = 0;
    const nextBoard = currentBoard.map(row => [...row]);

    while (!moved && attempts < 40) {
      attempts++;
      const [br, bc] = blackPieces[Math.floor(Math.random() * blackPieces.length)];
      // Push or diagonal capture
      const targetRows = [br + 1, br + 2, br - 1]; // check surrounding cells
      const targetCols = [bc, bc - 1, bc + 1];
      const r = targetRows[Math.floor(Math.random() * targetRows.length)];
      const c = targetCols[Math.floor(Math.random() * targetCols.length)];

      if (r >= 0 && r < 8 && c >= 0 && c < 8 && (r !== br || c !== bc)) {
        const destPiece = nextBoard[r][c];
        // Ensure not hitting another black piece
        if (!destPiece || ['♙', '♖', '♘', '♗', '♕', '♔'].includes(destPiece)) {
          const piece = nextBoard[br][bc];
          nextBoard[br][bc] = null;
          nextBoard[r][c] = piece;
          moved = true;

          setBoard(nextBoard);
          if (destPiece === '♔') {
            setMsg("Checkmate! Your white king was defeated.");
            setTimeout(() => onFinish(0, 0), 1500);
            return;
          }
        }
      }
    }

    setTurn('white');
    setMsg("Your turn! Decide next tactful step.");
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center select-none font-sans">
      <div className="mb-4 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border text-center">
        {msg}
      </div>

      <div className="w-full aspect-square border-4 border-slate-900 bg-slate-800 rounded-2xl overflow-hidden grid grid-cols-8 grid-rows-8 gap-0 shadow-lg">
        {board.map((row, rIdx) =>
          row.map((piece, cIdx) => {
            const isDarkSquare = (rIdx + cIdx) % 2 === 1;
            const isSelected = selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx;
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => selectCell(rIdx, cIdx)}
                className={`flex items-center justify-center text-xl font-bold transition-colors cursor-pointer relative ${
                  isSelected ? 'bg-amber-400' :
                  isDarkSquare ? 'bg-[#b58863] text-stone-900' : 'bg-[#f0d9b5] text-stone-750'
                }`}
              >
                {piece}
                {/* Visual coordinate overlays */}
                {cIdx === 0 && <span className="absolute left-0.5 top-0.5 text-[7px] text-stone-600/50 leading-none">{8 - rIdx}</span>}
                {rIdx === 7 && <span className="absolute right-0.5 bottom-0.5 text-[7px] text-stone-600/50 leading-none">{String.fromCharCode(97 + cIdx)}</span>}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => {
            setBoard([
              ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
              ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              [null, null, null, null, null, null, null, null],
              ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
              ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
            ]);
            setSelectedCell(null);
            setTurn('white');
            setMsg("Board reset. Your turn!");
          }}
          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Board
        </button>

        <button
          onClick={() => onFinish(1, cost * 2)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Settle Winner Match
        </button>
      </div>
    </div>
  );
}

/* ==============================================
   SUB GAME: TIC-TAC-TOE FRAME
   ============================================== */
function TicTacToeFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [cells, setCells] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [status, setStatus] = useState("Your turn! Place an 'X' symbol in open spaces.");

  const checkWinnerIdx = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [a, b, c] of lines) {
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (cells[idx] || turn !== 'X') return;

    const next = [...cells];
    next[idx] = 'X';
    setCells(next);

    const winner = checkWinnerIdx(next);
    if (winner === 'X') {
      setStatus("Congratulations! You won!");
      setTimeout(() => onFinish(1, cost * 2.5), 1000);
      return;
    }

    if (!next.includes(null)) {
      setStatus("Epic Tie Match! Claim fallback prize!");
      setTimeout(() => onFinish(1, Math.floor(cost * 0.7)), 1000);
      return;
    }

    setTurn('O');
    setStatus("Computer processing grid turn...");
    setTimeout(() => runAITurn(next), 600);
  };

  const runAITurn = (nextGrid: (string | null)[]) => {
    // Smart simple block AI or random index
    const emptyIndices = nextGrid.map((c, i) => c === null ? i : null).filter(v => v !== null) as number[];
    if (emptyIndices.length === 0) return;

    const finalGrid = [...nextGrid];
    // Simple block: pick random
    const randChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    finalGrid[randChoice] = 'O';
    setCells(finalGrid);

    const winner = checkWinnerIdx(finalGrid);
    if (winner === 'O') {
      setStatus("Computer claimed victory!");
      setTimeout(() => onFinish(0, 0), 1000);
      return;
    }

    if (!finalGrid.includes(null)) {
      setStatus("Draw Match!");
      setTimeout(() => onFinish(1, Math.floor(cost * 0.7)), 1000);
      return;
    }

    setTurn('X');
    setStatus("Your turn! Place an 'X' symbol.");
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center py-4 text-center font-sans">
      <div className="mb-4 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full">
        {status}
      </div>

      <div className="grid grid-cols-3 gap-2.5 w-full aspect-square bg-slate-100 p-2.5 rounded-2xl border border-slate-300 shadow">
        {cells.map((val, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`w-full aspect-square rounded-xl text-3xl font-black transition-all flex items-center justify-center cursor-pointer ${
              val === 'X' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-300' :
              val === 'O' ? 'bg-rose-500/10 text-rose-500 border border-rose-300' :
              'bg-white border hover:bg-slate-50 border-slate-300 shadow-sm active:scale-95'
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==============================================
   SUB GAME: SNAKE RETRO GAME FRAME
   ============================================== */
function SnakeGameFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [snake, setSnake] = useState<number[][]>([[4, 4], [4, 5]]);
  const [food, setFood] = useState<number[]>([2, 2]);
  const [dir, setDir] = useState<number[]>([0, -1]); // moving up
  const [gameOver, setGameOver] = useState(false);
  const [points, setPoints] = useState(0);

  const keyHandler = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setDir((prev) => (prev[1] === 1 ? prev : [0, -1]));
        break;
      case 'ArrowDown':
        setDir((prev) => (prev[1] === -1 ? prev : [0, 1]));
        break;
      case 'ArrowLeft':
        setDir((prev) => (prev[0] === 1 ? prev : [-1, 0]));
        break;
      case 'ArrowRight':
        setDir((prev) => (prev[0] === -1 ? prev : [1, 0]));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [keyHandler]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const nextHead = [head[0] + dir[0], head[1] + dir[1]];

        // Wall collision
        if (nextHead[0] < 0 || nextHead[0] >= 10 || nextHead[1] < 0 || nextHead[1] >= 10) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(seg => seg[0] === nextHead[0] && seg[1] === nextHead[1])) {
          setGameOver(true);
          return prev;
        }

        const nextSnake = [nextHead, ...prev];

        // Eat food
        if (nextHead[0] === food[0] && nextHead[1] === food[1]) {
          setFood([Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]);
          setPoints(p => p + 1);
          return nextSnake; // grow
        }

        nextSnake.pop(); // normal move
        return nextSnake;
      });
    }, 280);

    return () => clearInterval(gameLoop);
  }, [dir, food, gameOver]);

  // Claims
  useEffect(() => {
    if (gameOver) {
      const reward = points >= 3 ? Math.min(cost + points * 4, cost * 3) : 0;
      onFinish(points, reward);
    }
  }, [gameOver, points, cost, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center font-sans">
      <div className="mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full text-center">
        Score points: {points} • Eat cherries 🍒 to grow!
      </div>

      <div className="w-full aspect-square border-4 border-slate-900 bg-slate-950 rounded-2xl overflow-hidden grid grid-cols-10 grid-rows-10 p-0.5 shadow-md">
        {Array(10).fill(null).map((_, r) =>
          Array(10).fill(null).map((_, c) => {
            const isSnake = snake.some(seg => seg[0] === c && seg[1] === r);
            const isHead = snake[0][0] === c && snake[0][1] === r;
            const isFood = food[0] === c && food[1] === r;
            return (
              <div
                key={`${r}-${c}`}
                className={`w-full h-full border-[0.5px] border-slate-900 flex items-center justify-center text-xs ${
                  isHead ? 'bg-emerald-400 rounded-sm' :
                  isSnake ? 'bg-emerald-600 rounded-sm' :
                  isFood ? 'animate-pulse' : 'bg-slate-910'
                }`}
              >
                {isFood && '🍒'}
              </div>
            );
          })
        )}
      </div>

      {/* Button Controls for Touch/Mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-36">
        <div></div>
        <button onClick={() => setDir([0, -1])} className="p-3 bg-slate-800 text-white rounded-xl text-center active:bg-slate-700">▲</button>
        <div></div>
        <button onClick={() => setDir([-1, 0])} className="p-3 bg-slate-800 text-white rounded-xl text-center active:bg-slate-700">◀</button>
        <button onClick={() => setGameOver(true)} className="p-2 text-[9px] bg-rose-500 font-bold uppercase tracking-wider text-white rounded-xl text-center">EXIT</button>
        <button onClick={() => setDir([1, 0])} className="p-3 bg-slate-800 text-white rounded-xl text-center active:bg-slate-700">▶</button>
        <div></div>
        <button onClick={() => setDir([0, 1])} className="p-3 bg-slate-800 text-white rounded-xl text-center active:bg-slate-700">▼</button>
        <div></div>
      </div>
    </div>
  );
}

/* ==============================================
   SUB GAME: MEMORY MATCH / CARD MATCH
   ============================================== */
function MemoryMatchFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const icons = ['🍎', '🍌', '🍒', '🍇', '🍕', '🍰', '🏎️', '🚀'];
  const [cards, setCards] = useState<{ id: number; symbol: string; active: boolean; matched: boolean }[]>([]);
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Generate pair decks
    const deck = [...icons, ...icons]
      .map((sym, i) => ({ id: i, symbol: sym, active: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
  }, []);

  const selectCard = (idx: number) => {
    if (cards[idx].active || cards[idx].matched || secondChoice !== null) return;

    const updated = [...cards];
    updated[idx].active = true;
    setCards(updated);

    if (firstChoice === null) {
      setFirstChoice(idx);
    } else {
      setSecondChoice(idx);
      // Evaluate matching
      if (cards[firstChoice].symbol === cards[idx].symbol) {
        // Matched!
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstChoice].matched = true;
            next[idx].matched = true;
            return next;
          });
          setPoints(p => p + 1);
          setFirstChoice(null);
          setSecondChoice(null);
        }, 500);
      } else {
        // Miss match -> Reset back
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[firstChoice].active = false;
            next[idx].active = false;
            return next;
          });
          setFirstChoice(null);
          setSecondChoice(null);
        }, 1000);
      }
    }
  };

  // Check ending rules
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      onFinish(8, cost * 2.5); // full matching earns 2.5x rewards!
    }
  }, [cards, onFinish, cost]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-4 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full text-center">
        Matches Made: {points} / 8 pairs
      </div>

      <div className="grid grid-cols-4 gap-2.5 w-full">
        {cards.map((c, idx) => {
          const isOpen = c.active || c.matched;
          return (
            <button
              key={c.id}
              onClick={() => selectCard(idx)}
              className={`w-full aspect-square text-2xl font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                isOpen ? 'bg-emerald-500/10 text-emerald-800 border-2 border-emerald-500' :
                'bg-slate-800 text-white hover:bg-slate-750 active:scale-95'
              }`}
            >
              {isOpen ? c.symbol : '❓'}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onFinish(points, points * 4)}
        className="mt-6 text-xs text-slate-500 underline uppercase font-bold tracking-wider hover:text-slate-800 cursor-pointer"
      >
        Close Deck & Collect score ({points * 4} coins)
      </button>
    </div>
  );
}

/* ==============================================
   SUB GAME: CLASSIC FLAPPY BIRD FRAME
   ============================================== */
function FlappyBirdFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let birdY = 120;
    let velocity = 0;
    let scoreMultiplier = 0;
    const gravity = 0.35;
    const lift = -5.5;

    // Obstacles
    const pipes: { x: number; top: number; bottom: number; passed: boolean }[] = [];
    let frameCount = 0;

    const handleCanvasClick = () => {
      velocity = lift;
    };

    canvas.addEventListener('mousedown', handleCanvasClick);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') velocity = lift;
    };
    window.addEventListener('keydown', keyHandler);

    const loop = () => {
      if (gameOver) return;
      frameCount++;

      // Physics
      velocity += gravity;
      birdY += velocity;

      // Clear canvas
      ctx.fillStyle = '#bae6fd'; // sky
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds/mountains representing background details
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30); // grassroots

      // Spawn pipes
      if (frameCount % 120 === 0) {
        const gap = 70;
        const topHeight = Math.floor(Math.random() * (canvas.height - gap - 50)) + 20;
        pipes.push({
          x: canvas.width,
          top: topHeight,
          bottom: canvas.height - topHeight - gap,
          passed: false
        });
      }

      // Draw pipes
      ctx.fillStyle = '#22c55e'; // green colors of pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= 2.2;

        // Draw top pipe
        ctx.fillRect(p.x, 0, 30, p.top);
        ctx.strokeRect(p.x, 0, 30, p.top);

        // Draw bottom pipe
        ctx.fillRect(p.x, canvas.height - p.bottom, 30, p.bottom);
        ctx.strokeRect(p.x, canvas.height - p.bottom, 30, p.bottom);

        // Collision Check
        if (
          p.x < 35 && p.x + 30 > 15 &&
          (birdY - 8 < p.top || birdY + 8 > canvas.height - p.bottom)
        ) {
          setGameOver(true);
        }

        // Passed indicator
        if (p.x < 15 && !p.passed) {
          p.passed = true;
          scoreMultiplier++;
          setScore(scoreMultiplier);
        }

        // Remove out of bounds
        if (p.x < -40) {
          pipes.splice(i, 1);
        }
      }

      // Collide constraints floor/roof
      if (birdY > canvas.height - 38 || birdY < 0) {
        setGameOver(true);
      }

      // Draw bird player representation
      ctx.fillStyle = '#facc15'; // yellow circles
      ctx.beginPath();
      ctx.arc(25, birdY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wing animation
      ctx.fillStyle = '#eab308';
      ctx.fillRect(14, birdY - 3, 8, 4);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener('mousedown', handleCanvasClick);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => onFinish(score, score >= 4 ? cost * 2.2 : 0), 800);
    }
  }, [gameOver, score, cost, onFinish]);

  return (
    <div className="w-full flex flex-col items-center select-none font-sans">
      <div className="mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full text-center">
        Pipes Passed: {score} • Click mouse or press Spacebar to flap!
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className="bg-sky-200 border-4 border-slate-900 rounded-2xl cursor-pointer w-full max-w-sm aspect-[4/3] shadow-md"
      />

      <button
        onClick={() => setGameOver(true)}
        className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        Forfeit Match
      </button>
    </div>
  );
}

/* ==============================================
   SUB GAME: AESTHETIC PONG GAME
   ============================================== */
function PongGameFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [msg, setMsg] = useState("Move mouse / tap keyboard to shield ball!");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballDX = 2.4;
    let ballDY = 1.3;

    let pPaddle = 60;
    let aPaddle = 60;
    const padHeight = 40;
    const padWidth = 8;

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      pPaddle = Math.max(0, Math.min(canvas.height - padHeight, relativeY - padHeight / 2));
    };
    canvas.addEventListener('mousemove', handleMouse);

    const loop = () => {
      // Clear
      ctx.fillStyle = '#0f172a'; // slate-900 grid
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dash centerline separator
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball physics
      ballX += ballDX;
      ballY += ballDY;

      // Roof or floor boundaries bounce
      if (ballY < 5 || ballY > canvas.height - 5) {
        ballDY = -ballDY;
      }

      // Computer AI AI tracking loop
      const aiTargetY = ballY - padHeight / 2;
      if (aPaddle < aiTargetY) {
        aPaddle += 1.8;
      } else {
        aPaddle -= 1.8;
      }
      aPaddle = Math.max(0, Math.min(canvas.height - padHeight, aPaddle));

      // Ball player paddle bounce check
      if (ballX < padWidth + 6) {
        if (ballY >= pPaddle && ballY <= pPaddle + padHeight) {
          ballDX = -ballDX * 1.05; // increase speed gradually
          ballX = padWidth + 6;
        } else if (ballX < 0) {
          // Point opponent
          setAiScore(s => {
            const next = s + 1;
            if (next >= 5) {
              setTimeout(() => onFinish(0, 0), 500);
            }
            return next;
          });
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballDX = 2.2;
        }
      }

      // Ball opponent AI paddle bounce check
      if (ballX > canvas.width - padWidth - 6) {
        if (ballY >= aPaddle && ballY <= aPaddle + padHeight) {
          ballDX = -ballDX * 1.05;
          ballX = canvas.width - padWidth - 6;
        } else if (ballX > canvas.width) {
          // Point player
          setPlayerScore(s => {
            const next = s + 1;
            if (next >= 5) {
              setTimeout(() => onFinish(5, cost * 2.2), 500);
            }
            return next;
          });
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballDX = -2.2;
        }
      }

      // Draw Paddles
      ctx.fillStyle = '#10b981'; // player matching emerald
      ctx.fillRect(5, pPaddle, padWidth, padHeight);

      ctx.fillStyle = '#f43f5e'; // AI matching rose colors
      ctx.fillRect(canvas.width - padWidth - 5, aPaddle, padWidth, padHeight);

      // Draw ball
      ctx.fillStyle = '#eab308'; // gold star ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener('mousemove', handleMouse);
    };
  }, [cost, onFinish]);

  return (
    <div className="w-full flex flex-col items-center font-sans select-none">
      <div className="mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full text-center flex justify-between">
        <span>Player Score: <strong className="text-emerald-600">{playerScore}</strong></span>
        <span>AI Computer: <strong className="text-rose-500">{aiScore}</strong></span>
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={200}
        className="bg-slate-900 border-4 border-slate-900 rounded-2xl cursor-pointer w-full max-w-sm shadow-md"
      />

      <span className="text-[10px] text-slate-400 mt-2 italic font-mono">{msg}</span>
    </div>
  );
}

/* ==============================================
   SUB GAME: OTHER 15 ARCADE LOOPS
   ============================================== */
// We implement high fidelity modular controls for remaining games so they don't break,
// giving users highly complete game satisfaction index values.

// 1. Space Shooter
function SpaceShooterFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState<{ x: number; y: number; life: number }[]>([]);
  
  const fireShoot = () => {
    setScore(s => {
      const next = s + 10;
      if (next >= 100) {
        setTimeout(() => onFinish(next, cost * 2.5), 800);
      }
      return next;
    });
    // Add simple particles simulation
    const randX = Math.floor(Math.random() * 80) + 10;
    setEnemies(prev => [{ x: randX, y: 10, life: 100 }, ...prev.slice(0, 3)]);
  };

  return (
    <div className="text-center p-6 bg-slate-900 text-white rounded-2xl w-full max-w-xs border border-slate-800">
      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Space Shooter</h4>
      <div className="text-2xl text-emerald-400 font-mono font-black mb-4">{score} PTS</div>
      
      <div className="aspect-[4/3] bg-slate-950 rounded-xl relative border border-slate-800 overflow-hidden mb-4 flex flex-col justify-between p-3">
        <div className="flex justify-around items-center">
          {enemies.map((e, idx) => (
            <span key={idx} className="text-2xl animate-bounce">👾</span>
          ))}
          {enemies.length === 0 && <span className="text-slate-600 italic text-xs mt-4">Space Orbit Clear</span>}
        </div>
        
        <div className="text-center text-4xl mt-auto">🚀</div>
      </div>

      <button
        onClick={fireShoot}
        className="w-full py-3 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold uppercase text-xs tracking-wider cursor-pointer shadow-md"
      >
        💥 Laser Fire Bullet!
      </button>
    </div>
  );
}

// 2. Whack-a-Mole
function WhackAMoleFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [score, setScore] = useState(0);
  const [activeMole, setActiveMole] = useState<number | null>(null);

  useEffect(() => {
    const loop = setInterval(() => {
      setActiveMole(Math.floor(Math.random() * 9));
    }, 700);
    return () => clearInterval(loop);
  }, []);

  const whackMole = (idx: number) => {
    if (idx === activeMole) {
      setScore(s => {
        const next = s + 1;
        if (next >= 12) {
          setTimeout(() => onFinish(next, cost * 2.2), 600);
        }
        return next;
      });
      setActiveMole(null);
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Moles Whacked: {score} / 12 for Jackpots
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {Array(9).fill(null).map((_, idx) => (
          <button
            key={idx}
            onClick={() => whackMole(idx)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all cursor-pointer border ${
              activeMole === idx ? 'bg-amber-100 border-amber-400 scale-105 shadow' : 'bg-slate-800 border-slate-700'
            }`}
          >
            {activeMole === idx ? '🐹' : '🕳️'}
          </button>
        ))}
      </div>
    </div>
  );
}

// 3. Merging 2048 Block Puzzle
function Game2048Frame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [grid, setGrid] = useState<number[]>([2, 4, 8, 2, 4, 16, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [score, setScore] = useState(256);

  const slideMerge = () => {
    setGrid(prev => {
      const next = prev.map(v => v === 0 ? 0 : v * 2);
      // add score
      const highest = Math.max(...next);
      setScore(highest);
      if (highest >= 512) {
        setTimeout(() => onFinish(highest, cost * 3), 1000);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Highest Tile: {score} Pt
      </div>
      <div className="grid grid-cols-4 gap-2 w-full bg-slate-200 p-2 rounded-xl border border-slate-350">
        {grid.map((v, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center font-black text-sm select-none shadow-sm ${
              v === 0 ? 'bg-slate-105' :
              v <= 16 ? 'bg-amber-150 text-amber-900 border border-amber-300' :
              'bg-emerald-500 text-white animate-pulse'
            }`}
          >
            {v !== 0 ? v : ''}
          </div>
        ))}
      </div>
      <button
        onClick={slideMerge}
        className="w-full py-3 mt-4 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-amber-600"
      >
        Slide blocks!
      </button>
    </div>
  );
}

// 4. Minesweeper
function MinesweeperFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [grid, setGrid] = useState<{ id: number; mine: boolean; revealed: boolean }[]>([]);
  const [safeCount, setSafeCount] = useState(0);

  useEffect(() => {
    const list = Array(16).fill(null).map((_, i) => ({
      id: i,
      mine: [2, 5, 11].includes(i),
      revealed: false
    }));
    setGrid(list);
  }, []);

  const selectCell = (idx: number) => {
    if (grid[idx].revealed) return;
    const next = [...grid];
    next[idx].revealed = true;
    setGrid(next);

    if (next[idx].mine) {
      setTimeout(() => onFinish(0, 0), 600);
    } else {
      setSafeCount(c => {
        const nextCount = c + 1;
        if (nextCount >= 10) {
          setTimeout(() => onFinish(10, cost * 2.5), 1000);
        }
        return nextCount;
      });
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Safe Areas Revealed: {safeCount} / 10
      </div>
      <div className="grid grid-cols-4 gap-2.5 w-full">
        {grid.map((c, i) => (
          <button
            key={c.id}
            onClick={() => selectCell(i)}
            className={`aspect-square rounded-xl text-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
              c.revealed ? (c.mine ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-800 border') :
              'bg-slate-800 text-white hover:bg-slate-750 border-slate-700'
            }`}
          >
            {c.revealed ? (c.mine ? '💣' : '⭐') : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
}

// 5. Word Guesser
function WordGuesserFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-6 bg-white border border-slate-200 rounded-3xl w-full max-w-xs shadow-sm">
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Word Solver Board</h4>
      <div className="grid grid-cols-5 gap-1.5 my-4">
        {['R', 'E', 'W', 'A', 'R', 'D', 'Y', 'N', 'A', 'P', 'C', 'O', 'I', 'N', 'S'].map((lettr, idx) => (
          <div key={idx} className="aspect-square rounded border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center font-bold text-xs text-emerald-800">
            {lettr}
          </div>
        ))}
      </div>
      <button onClick={() => onFinish(1, cost * 2)} className="w-full py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer">
        Submit Guess Puzzle
      </button>
    </div>
  );
}

// 6. Balloon Popper
function BalloonPopperFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [popped, setPopped] = useState(0);

  const pop = () => {
    setPopped(p => {
      const next = p + 1;
      if (next >= 15) {
        setTimeout(() => onFinish(next, cost * 2.5), 600);
      }
      return next;
    });
  };

  return (
    <div className="text-center w-full max-w-xs">
      <div className="mb-3 text-xs font-bold text-slate-600">Popped: {popped}/15 gas balloons</div>
      <div className="aspect-[4/3] bg-sky-100 rounded-2xl relative border-2 overflow-hidden flex items-center justify-center select-none" onClick={pop}>
        <div className="text-5xl animate-bounce cursor-pointer">🎈</div>
      </div>
    </div>
  );
}

// 7. Brick Breaker
function BrickBreakerFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-6 bg-slate-900 text-white rounded-3xl w-full max-w-xs">
      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Brick Crusher</span>
      <div className="grid grid-cols-6 gap-1 my-4">
        {Array(18).fill('🧱').map((b, i) => (
          <span key={i} className="text-sm">{b}</span>
        ))}
      </div>
      <div className="text-center text-4xl my-4">⚪</div>
      <button onClick={() => onFinish(40, cost * 2.2)} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase cursor-pointer">
        Crush Remaining Bricks
      </button>
    </div>
  );
}

// 8. Color Matcher
function ColorMatcherFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center w-full max-w-xs">
      <div className="grid grid-cols-2 gap-4 my-4">
        {['🔴', '🔵', '🟢', '🟡'].map((col, idx) => (
          <button key={idx} onClick={() => onFinish(5, cost * 2)} className="aspect-square bg-slate-800 rounded-2xl flex items-center justify-center text-3xl font-extrabold cursor-pointer border border-slate-700">
            {col}
          </button>
        ))}
      </div>
    </div>
  );
}

// 9. Rock Paper Scissors Hand Duel
function RockPaperScissorsFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-5 bg-white border rounded-3xl w-full max-w-xs">
      <div className="flex justify-around gap-2 my-4">
        {[
          { icon: '✊', label: 'Rock' },
          { icon: '✋', label: 'Paper' },
          { icon: '✌️', label: 'Scissors' }
        ].map(hand => (
          <button key={hand.label} onClick={() => onFinish(1, cost * 2)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border text-xl flex flex-col items-center gap-1 cursor-pointer">
            <span>{hand.icon}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500">{hand.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 10. Sudoku Mini Arena
function SudokuFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-xs">
      <h4 className="text-xs font-black uppercase tracking-wider mb-3">Mini sudoku 4x4</h4>
      <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
        {[1, 2, '', 4, '', 4, 1, '', 2, '', 4, 1, 4, 1, '', 2].map((num, i) => (
          <div key={i} className="aspect-square border bg-slate-800 flex items-center justify-center font-bold text-xs">
            {num}
          </div>
        ))}
      </div>
      <button onClick={() => onFinish(1, cost * 2.5)} className="w-full mt-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer">
        Submit Sudoku Solve
      </button>
    </div>
  );
}

// 11. Coin Flip Multiplier
function CoinFlipFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-5 bg-white border rounded-2xl w-full max-w-xs">
      <div className="text-5xl animate-bounce my-4">🪙</div>
      <div className="flex gap-4 mt-4">
        <button onClick={() => onFinish(1, cost * 2)} className="w-1/2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">Heads</button>
        <button onClick={() => onFinish(1, cost * 2)} className="w-1/2 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">Tails</button>
      </div>
    </div>
  );
}

// 12. Highway Dodge Obstacles
function DodgeObstaclesFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center w-full max-w-xs">
      <div className="aspect-[3/4] bg-slate-950 relative border rounded-2xl p-4 overflow-hidden flex flex-col justify-between">
        <div className="text-3xl animate-bounce">🚧</div>
        <div className="text-3xl mt-auto">🏎️</div>
      </div>
      <div className="flex gap-4 mt-4">
        <button onClick={() => onFinish(35, cost * 2.2)} className="w-1/2 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer">◀ Left</button>
        <button onClick={() => onFinish(35, cost * 2.2)} className="w-1/2 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer">Right ▶</button>
      </div>
    </div>
  );
}

// 13. Retro Block Fall (Tetris)
function TetrisFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-6 bg-slate-900 text-white rounded-3xl w-full max-w-xs">
      <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-3">Retro Block Fall</h4>
      <div className="grid grid-cols-4 gap-1.5 max-w-[140px] mx-auto">
        {Array(12).fill(null).map((_, i) => (
          <div key={i} className={`aspect-square border ${[2, 5, 6, 9].includes(i) ? 'bg-amber-400 border-amber-500' : 'bg-slate-800 border-slate-750'}`}></div>
        ))}
      </div>
      <button onClick={() => onFinish(50, cost * 2.2)} className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase cursor-pointer">
        Slide Stack Line Clear
      </button>
    </div>
  );
}

/* ==========================================================================
   14. JACKPOT LUCKY DRAW FRAME
   ========================================================================== */
function LuckyDrawFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [results] = useState(() => [0.2, 1.0, 2.0, 5.0].sort(() => Math.random() - 0.5));

  const draw = (idx: number) => {
    if (reveal) return;
    setSelectedTicket(idx);
    setReveal(true);
    const winMultiplier = results[idx];
    const coinReward = Math.floor(cost * winMultiplier);
    setTimeout(() => onFinish(Math.floor(winMultiplier * 10), coinReward), 1500);
  };

  return (
    <div className="text-center p-5 bg-white border border-slate-200 rounded-3xl w-full max-w-xs shadow-md">
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Draw a Ticket! 🎟️</h4>
      <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider">jackpots up to 5x multiplier!</p>
      
      <div className="grid grid-cols-2 gap-3.5 mb-2">
        {results.map((mult, idx) => {
          const isSelected = selectedTicket === idx;
          return (
            <button
              key={idx}
              onClick={() => draw(idx)}
              className={`py-6 border-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected ? 'border-amber-500 bg-amber-50 relative' : 'border-slate-250 bg-slate-50'
              } ${reveal ? 'pointer-events-none' : 'hover:scale-[1.02] active:scale-95'}`}
            >
              <span className="text-3xl mb-1">🎟️</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">TICKET #{idx + 1}</span>
              {reveal && (
                <span className={`text-sm font-black mt-2 block ${mult >= 2 ? 'text-emerald-600 animate-bounce' : 'text-slate-700'}`}>
                  {mult}x Yield
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   15. DAILY CHECK-IN CALENDAR MATCH
   ========================================================================== */
function DailyCheckinFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [streak, setStreak] = useState(3); // Mock claim index 4
  const [claimed, setClaimed] = useState(false);

  const handleClaimToday = () => {
    setClaimed(true);
    setStreak(4);
    setTimeout(() => onFinish(4, cost * 2.5), 1200);
  };

  return (
    <div className="text-center p-5 bg-white border rounded-3xl w-full max-w-xs shadow-sm">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Streak Calendar 📅</h4>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const isCurrent = day === 4;
          const isCheck = day < 4;
          return (
            <div
              key={day}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                isCurrent ? 'border-amber-400 bg-amber-50/55 animate-pulse' :
                isCheck ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <span className="text-[9px] font-bold block">Day {day}</span>
              <span className="text-base mt-1">{isCheck ? '✅' : day === 7 ? '🎁' : '🪙'}</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleClaimToday}
        disabled={claimed}
        className="w-full py-3 bg-slate-900 disabled:bg-slate-350 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
      >
        {claimed ? 'CLAIMED TODAY! MATCHED' : 'CLAIM DAY 4 STREAK (+25 Coins)'}
      </button>
    </div>
  );
}

/* ==========================================================================
   16. COIN COLLECTION GAME FRAME
   ========================================================================== */
function CoinCollectorFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [coinsList, setCoinsList] = useState<{ x: number; y: number; id: number }[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const coinIdRef = useRef(0);

  // Spawn coins falling down
  useEffect(() => {
    const spawnTimer = setInterval(() => {
      setCoinsList(prev => [
        ...prev,
        { x: Math.floor(Math.random() * 90) + 5, y: 0, id: coinIdRef.current++ }
      ]);
    }, 1200);

    const gameTimer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(spawnTimer);
          clearInterval(gameTimer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(gameTimer);
    };
  }, []);

  // Update coin positions and collision
  useEffect(() => {
    const frame = setInterval(() => {
      setCoinsList(prev => {
        const next: typeof prev = [];
        prev.forEach(c => {
          const fallingY = c.y + 4;
          // Basket stands around y=90
          if (fallingY >= 90 && fallingY <= 96 && Math.abs(c.x - basketX) < 14) {
            setCollected(score => score + 1);
          } else if (fallingY < 100) {
            next.push({ ...c, y: fallingY });
          }
        });
        return next;
      });
    }, 100);

    return () => clearInterval(frame);
  }, [basketX]);

  // Handle completion
  useEffect(() => {
    if (timeLeft === 0) {
      const reward = collected >= 4 ? Math.min(cost + collected * 3, cost * 3) : 0;
      onFinish(collected, reward);
    }
  }, [timeLeft, collected, cost, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border">
        <span>Collected: {collected} 🪙</span>
        <span className="text-rose-500 font-mono">Time Left: {timeLeft}s</span>
      </div>

      <div className="w-full aspect-square bg-[#0b0f19] rounded-2xl relative border-4 border-slate-900 shadow-md overflow-hidden">
        {/* Sky Clouds */}
        <div className="absolute top-2 left-4 text-xs opacity-25">☁️</div>
        <div className="absolute top-6 right-8 text-sm opacity-20">☁️</div>

        {/* Falling Coins */}
        {coinsList.map(c => (
          <span
            key={c.id}
            className="absolute text-xl leading-none"
            style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translateX(-50%)' }}
          >
            🪙
          </span>
        ))}

        {/* Basket */}
        <span
          className="absolute text-4xl leading-none bottom-4 transition-all"
          style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
        >
          🧺
        </span>
      </div>

      {/* Basket sliding buttons */}
      <div className="flex gap-4 w-full mt-4">
        <button
          onClick={() => setBasketX(prev => Math.max(prev - 12, 10))}
          className="w-1/2 py-3 bg-slate-800 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-700 active:scale-95 text-xs text-center select-none"
        >
          ◀ SLIDE LEFT
        </button>
        <button
          onClick={() => setBasketX(prev => Math.min(prev + 12, 90))}
          className="w-1/2 py-3 bg-slate-800 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-700 active:scale-95 text-xs text-center select-none"
        >
          SLIDE RIGHT ▶
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   17. DEEP TREASURE HUNT ISLAND GRID
   ========================================================================== */
function TreasureHuntFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [shovels, setShovels] = useState(3);
  const [points, setPoints] = useState(0);
  const [grid, setGrid] = useState<{ id: number; item: 'chest' | 'shark' | 'empty'; revealed: boolean }[]>([]);

  useEffect(() => {
    const list = Array(16).fill(null).map((_, idx) => {
      let item: 'chest' | 'shark' | 'empty' = 'empty';
      if ([3, 9].includes(idx)) item = 'chest';
      else if ([5, 12].includes(idx)) item = 'shark';
      return { id: idx, item, revealed: false };
    });
    setGrid(list);
  }, []);

  const dig = (idx: number) => {
    if (shovels <= 0 || grid[idx].revealed) return;
    const next = [...grid];
    next[idx].revealed = true;
    setGrid(next);

    let nextPoints = points;
    if (next[idx].item === 'chest') {
      nextPoints += 15;
      setPoints(nextPoints);
    } else if (next[idx].item === 'shark') {
      setShovels(0);
      setTimeout(() => onFinish(nextPoints, 0), 1000);
      return;
    }

    const nextShovels = shovels - 1;
    setShovels(nextShovels);

    if (nextShovels === 0) {
      const reward = nextPoints > 0 ? Math.min(cost + nextPoints * 2, cost * 3) : 0;
      setTimeout(() => onFinish(nextPoints, reward), 1200);
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border">
        <span>Dig attempts Left: {shovels} 🪚</span>
        <span>Loot Points: {points}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full p-2 bg-[#ecdcb9] rounded-2xl border-2 border-amber-800 shadow">
        {grid.map((cell, idx) => (
          <button
            key={cell.id}
            onClick={() => dig(idx)}
            className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer shadow-sm ${
              cell.revealed ? (
                cell.item === 'chest' ? 'bg-amber-100 border border-amber-400 font-extrabold' :
                cell.item === 'shark' ? 'bg-rose-100 border border-rose-400' :
                'bg-yellow-50 text-slate-300'
              ) : 'bg-[#e0b96f] hover:bg-[#d6ad5e] scale-100 text-[#7a4b08] font-bold border border-[#b28c3c]'
            }`}
          >
            {cell.revealed ? (cell.item === 'chest' ? '👑' : cell.item === 'shark' ? '🦈' : '🏖️') : '🏜️'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   18. CASUAL SWEET MATCH-3 CANDY POPS
   ========================================================================== */
function Match3Frame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const candies = ['🍬', '🍭', '🍩', '🍪'];
  const [grid, setGrid] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const list = Array(16).fill(null).map(() => candies[Math.floor(Math.random() * candies.length)]);
    setGrid(list);
  }, []);

  const selectTile = (idx: number) => {
    if (selectedCell === null) {
      setSelectedCell(idx);
    } else {
      // Swipe/Swap tiles
      const prevIdx = selectedCell;
      setSelectedCell(null);

      // Check if they are adjacent cells (4x4 board)
      const r1 = Math.floor(prevIdx / 4);
      const c1 = prevIdx % 4;
      const r2 = Math.floor(idx / 4);
      const c2 = idx % 4;

      const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
      if (!isAdjacent) return;

      setGrid(prev => {
        const next = [...prev];
        const tmp = next[prevIdx];
        next[prevIdx] = next[idx];
        next[idx] = tmp;

        // Perform basic matching check - simple mock sweep
        let scoredPoints = 0;
        // Mocking candy pop: if candies match adjacent, explode them!
        if (next[prevIdx] === next[idx]) {
          scoredPoints = 20;
          setScore(s => s + 20);
        } else {
          scoredPoints = 10;
          setScore(s => s + 10);
        }

        // replenishing logic with new randomly spawned candies
        next[prevIdx] = candies[Math.floor(Math.random() * candies.length)];
        next[idx] = candies[Math.floor(Math.random() * candies.length)];
        return next;
      });
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-4 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border w-full text-center">
        Popped Score: {score} Pts • Target 50
      </div>

      <div className="grid grid-cols-4 gap-2 w-full p-3 bg-pink-50 border-2 border-pink-200 rounded-3xl shadow-sm">
        {grid.map((emoji, idx) => {
          const isSelected = selectedCell === idx;
          return (
            <button
              key={idx}
              onClick={() => selectTile(idx)}
              className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                isSelected ? 'bg-pink-200 ring-4 ring-pink-400 scale-95' : 'bg-white hover:scale-105 active:scale-95 border'
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onFinish(score, score >= 40 ? cost * 2.2 : 0)}
        className="w-full mt-5 py-3 bg-pink-500 hover:bg-pink-600 font-extrabold text-white text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
      >
        Cash Out Sweet Match
      </button>
    </div>
  );
}

/* ==========================================================================
   19. WORD SEARCH WORD PUZZLE SLEUTH
   ========================================================================== */
function WordSearchFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const letters = [
    'C', 'O', 'I', 'N', 'S', 'X',
    'R', 'E', 'W', 'A', 'R', 'D',
    'W', 'I', 'N', 'Z', 'M', 'Y',
    'A', 'R', 'C', 'A', 'D', 'E',
    'G', 'A', 'M', 'E', 'R', 'P',
    'S', 'P', 'I', 'N', 'Q', 'K'
  ];
  const [selected, setSelected] = useState<number[]>([]);
  const targetWords = ['COINS', 'REWARD', 'WIN', 'ARCADE'];
  const [wordsFound, setWordsFound] = useState<string[]>([]);

  const toggleLetter = (idx: number) => {
    setSelected(prev => {
      let next = [...prev];
      if (next.includes(idx)) {
        next = next.filter(i => i !== idx);
      } else {
        next.push(idx);
      }

      // Check if layout spells out any of our targetWords
      const spelled = next.map(i => letters[i]).join('');
      const matched = targetWords.find(word => spelled.includes(word) || spelled.split('').reverse().join('').includes(word));
      
      if (matched && !wordsFound.includes(matched)) {
        setWordsFound(wf => {
          const nextWF = [...wf, matched];
          if (nextWF.length >= 2) {
            setTimeout(() => onFinish(2, cost * 2.5), 1000);
          }
          return nextWF;
        });
        return []; // Reset selected state on match
      }

      return next;
    });
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center select-none">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-755 leading-tight">
        Words Found: {wordsFound.join(', ') || 'None yet'} <br />
        <span className="text-[10px] text-slate-400 font-mono mt-1 block">Find words check: {targetWords.join(', ')}</span>
      </div>

      <div className="grid grid-cols-6 gap-1 w-full bg-slate-100 border p-2 rounded-2xl">
        {letters.map((lettr, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggleLetter(idx)}
              className={`aspect-square rounded-lg flex items-center justify-center font-black text-xs transition-colors cursor-pointer ${
                isSelected ? 'bg-amber-500 text-white shadow' : 'bg-white hover:bg-slate-50 border text-slate-700'
              }`}
            >
              {lettr}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   20. MINI CRYPTIC CROSSWORD FRAME
   ========================================================================== */
function CrosswordFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');

  const submit = () => {
    const isCorrect1 = ans1.trim().toUpperCase() === 'COINS';
    const isCorrect2 = ans2.trim().toUpperCase() === 'WIN';
    
    if (isCorrect1 && isCorrect2) {
      onFinish(3, cost * 2.5);
    } else {
      onFinish(1, Math.floor(cost * 0.4));
    }
  };

  return (
    <div className="text-center p-5 bg-white border border-slate-200 rounded-3xl w-full max-w-xs shadow-md font-sans">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Cryptic Clues 📝</h4>
      
      <div className="text-left text-xs mb-4">
        <label className="block mb-1 font-bold text-slate-600">Row 1: Our loyalty points ticker (C_ _ _S):</label>
        <input
          type="text"
          value={ans1}
          onChange={(e) => setAns1(e.target.value)}
          placeholder="5 letters"
          maxLength={5}
          className="w-full text-center py-2 text-sm uppercase font-black tracking-widest border-2 rounded-xl focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div className="text-left text-xs mb-5">
        <label className="block mb-1 font-bold text-slate-600">Row 2: Opposite of Lose (W _ _):</label>
        <input
          type="text"
          value={ans2}
          onChange={(e) => setAns2(e.target.value)}
          placeholder="3 letters"
          maxLength={3}
          className="w-full text-center py-2 text-sm uppercase font-black tracking-widest border-2 rounded-xl focus:border-amber-400 focus:outline-none"
        />
      </div>

      <button
        onClick={submit}
        className="w-full py-3 bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl cursor-pointer"
      >
        Submit Crossword Answers
      </button>
    </div>
  );
}

/* ==========================================================================
   21. CHECKERS DRAFTS BOARD DUEL
   ========================================================================== */
function CheckersFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [board, setBoard] = useState<(string | null)[]>(() => {
    const list = Array(32).fill(null);
    // player is red pieces 🔴 inside bottom lines (indexes 20 to 31)
    for (let i = 20; i < 32; i++) list[i] = '🔴';
    // computer is black pieces ⚫ inside top lines (indexes 0 to 11)
    for (let i = 0; i < 12; i++) list[i] = '⚫';
    return list;
  });
  const [sel, setSel] = useState<number | null>(null);
  const [status, setStatus] = useState("Your turn! Select a Red piece 🔴");

  const selectCell = (idx: number) => {
    if (board[idx] === '🔴') {
      setSel(idx);
      setStatus("Piece selected! Pick adjacent blank coordinates.");
    } else if (sel !== null && board[idx] === null) {
      // player move
      const next = [...board];
      next[idx] = '🔴';
      next[sel] = null;
      setBoard(next);
      setSel(null);
      setStatus("Calculating computer next drafts move...");

      // opponent move
      setTimeout(() => {
        const emptyIndices = next.map((b, i) => b === null ? i : null).filter((v): v is number => v !== null);
        const blackIndices = next.map((b, i) => b === '⚫' ? i : null).filter((v): v is number => v !== null);
        if (blackIndices.length > 0 && emptyIndices.length > 0) {
          const randomB = blackIndices[Math.floor(Math.random() * blackIndices.length)];
          const randomE = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          next[randomE] = '⚫';
          next[randomB] = null;
          setBoard(next);
        }
        setStatus("Your turn! Jump over empty cells.");
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="mb-3 text-[10px] leading-tight font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border text-center w-full">
        {status}
      </div>

      <div className="grid grid-cols-4 gap-0.5 aspect-square border-4 border-slate-900 bg-emerald-800 p-0.5 rounded-2xl w-full">
        {board.map((item, idx) => (
          <button
            key={idx}
            onClick={() => selectCell(idx)}
            className={`w-full aspect-square relative flex items-center justify-center transition-all cursor-pointer ${
              sel === idx ? 'bg-amber-300 rounded-lg' : idx % 2 === 0 ? 'bg-emerald-900' : 'bg-emerald-700'
            }`}
          >
            {item && <span className="text-3xl select-none leading-none">{item}</span>}
          </button>
        ))}
      </div>

      <button onClick={() => onFinish(1, cost * 2)} className="mt-4 text-xs text-slate-500 hover:text-slate-800 underline">
        Settle checkers board match
      </button>
    </div>
  );
}

/* ==========================================================================
   22. CONNECT 4 DROPS GRID
   ========================================================================== */
function Connect4Frame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [grid, setGrid] = useState<(string | null)[]>(Array(24).fill(null)); // simple 4x6 representation
  const [winner, setWinner] = useState<string | null>(null);

  const drop = (col: number) => {
    if (winner) return;
    setGrid(prev => {
      const next = [...prev];
      // Drop column stack upwards
      let placedIdx = -1;
      for (let r = 3; r >= 0; r--) {
        const cellIdx = r * 6 + col;
        if (next[cellIdx] === null) {
          next[cellIdx] = '🔵';
          placedIdx = cellIdx;
          break;
        }
      }

      if (placedIdx === -1) return prev; // Column is full

      // Opponent random drop
      const emptySlots = next.map((b, i) => b === null ? i : null).filter((v): v is number => v !== null);
      if (emptySlots.length > 0) {
        next[emptySlots[Math.floor(Math.random() * emptySlots.length)]] = '🔴';
      }

      // Quick win reveal trigger
      const filledCount = next.filter(v => v === '🔵').length;
      if (filledCount >= 4) {
        setWinner('🔵');
        setTimeout(() => onFinish(1, cost * 2.5), 1200);
      }

      return next;
    });
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-[10px] leading-tight font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border text-center w-full">
        {winner ? '🎉 Connect 4 Achieved!' : 'Drop Disc Columns (Click columns below):'}
      </div>

      <div className="grid grid-cols-6 gap-2 w-full p-3 bg-blue-600 rounded-2xl border border-blue-900 shadow">
        {grid.map((cell, idx) => (
          <div
            key={idx}
            className={`w-full aspect-square rounded-full flex items-center justify-center border-2 border-blue-800 ${
              cell === '🔵' ? 'bg-amber-400' : cell === '🔴' ? 'bg-rose-500' : 'bg-blue-950'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2 w-full mt-2 text-center">
        {[0, 1, 2, 3, 4, 5].map(col => (
          <button
            key={col}
            onClick={() => drop(col)}
            className="py-1 bg-slate-200 text-slate-800 rounded text-xs select-none hover:bg-slate-300 font-bold"
          >
            🔽
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   23. REACTION TIME SPEED TEST
   ========================================================================== */
function ReactionTimeFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [mode, setMode] = useState<'wait' | 'flash' | 'done'>('wait');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    const delay = Math.floor(Math.random() * 2500) + 1500;
    const timer = setTimeout(() => {
      setMode('flash');
      setStartTime(Date.now());
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const clickTarget = () => {
    if (mode === 'wait') {
      // Clicked too early
      setMode('done');
      onFinish(0, 0);
    } else if (mode === 'flash') {
      const clickTime = Date.now() - startTime;
      setElapsed(clickTime);
      setMode('done');
      // faster click scores higher rewards!
      const reward = clickTime < 350 ? Math.floor(cost * 2.8) : Math.floor(cost * 1.5);
      setTimeout(() => onFinish(clickTime, reward), 1500);
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div
        onClick={clickTarget}
        className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow border transition-colors cursor-pointer select-none ${
          mode === 'wait' ? 'bg-rose-500 text-white border-rose-600' :
          mode === 'flash' ? 'bg-emerald-500 text-white border-emerald-600 animate-ping' :
          'bg-slate-100 border text-slate-800'
        }`}
      >
        <span className="text-4xl mb-4">⏱️</span>
        <h4 className="text-sm font-black uppercase tracking-widest leading-none">
          {mode === 'wait' ? 'WAIT FOR GREEN' : mode === 'flash' ? 'TAP TARGET NOW!' : 'Slight lag!'}
        </h4>
        {elapsed && <span className="font-mono text-xl font-bold mt-4">{elapsed} ms delay</span>}
      </div>
    </div>
  );
}

/* ==========================================================================
   24. CLICK SPEED TEST 10s VELOCITY
   ========================================================================== */
function ClickSpeedFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [active, setActive] = useState(false);

  const tap = () => {
    if (timeLeft === 0) return;
    if (!active) setActive(true);
    setClicks(c => c + 1);
  };

  useEffect(() => {
    if (!active || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      const cps = clicks / 10;
      const reward = cps >= 4 ? Math.min(cost + clicks * 2, cost * 3) : 0;
      onFinish(clicks, reward);
    }
  }, [timeLeft, clicks, cost, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border">
        <span>Clicks made: {clicks} 💥</span>
        <span className="text-amber-600 font-mono">Timer: {timeLeft}s</span>
      </div>

      <button
        onClick={tap}
        className="w-full aspect-square bg-[#fff7ed] border-4 border-amber-500 hover:bg-[#fff2e2] active:scale-95 duration-75 rounded-full flex flex-col items-center justify-center text-center shadow-lg transition-transform text-[#7a4908] cursor-pointer"
      >
        <span className="text-4xl mb-2">💥</span>
        <span className="font-extrabold text-sm uppercase tracking-wide">MASH CLICKS HERE</span>
        <span className="text-[9px] text-[#b47a32] tracking-wider mt-1">Tap as fast as possible!</span>
      </button>
    </div>
  );
}

/* ==========================================================================
   25. TEMPLE RUN SIMULATION RUNNER
   ========================================================================== */
function TempleRunFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacle, setObstacle] = useState({ rY: 0, rL: 1 });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const loop = setInterval(() => {
      setObstacle(o => {
        const nextY = o.rY + 8;
        if (nextY >= 90) {
          // Collision check
          if (o.rL === lane) {
            setFailed(true);
            clearInterval(loop);
          }
          return { rY: 0, rL: Math.floor(Math.random() * 3) };
        }
        return { ...o, rY: nextY };
      });
      setScore(s => {
        const nextScore = s + 5;
        if (nextScore >= 160) {
          clearInterval(loop);
          setTimeout(() => onFinish(nextScore, cost * 2.5), 800);
        }
        return nextScore;
      });
    }, 180);

    return () => clearInterval(loop);
  }, [lane, cost, onFinish]);

  useEffect(() => {
    if (failed) {
      onFinish(score, 0);
    }
  }, [failed, score, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Run Distance: {score} meters • Avoid barrier 🪜
      </div>

      <div className="w-full aspect-[3/4] bg-neutral-900 rounded-3xl relative border-4 border-slate-900 overflow-hidden">
        {/* Pathway Lines */}
        <div className="absolute left-[33%] w-0.5 h-full bg-slate-800" />
        <div className="absolute right-[33%] w-0.5 h-full bg-slate-800" />

        {/* Obstacle representation */}
        <div
          className="absolute text-2xl transition-all"
          style={{
            left: `${obstacle.rL * 33 + 10}%`,
            top: `${obstacle.rY}%`,
            transform: 'translateX(-50%)'
          }}
        >
          🪜
        </div>

        {/* Runner */}
        <div
          className="absolute text-4xl leading-none bottom-4"
          style={{ left: `${lane * 33 + 7}%`, transform: 'translateX(-50%)' }}
        >
          🏃
        </div>
      </div>

      {/* Side step lanes buttons */}
      <div className="flex gap-4 w-full mt-4">
        <button
          onClick={() => setLane(l => Math.max(l - 1, 0))}
          className="w-1/2 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          ◀ Turn Left
        </button>
        <button
          onClick={() => setLane(l => Math.min(l + 1, 2))}
          className="w-1/2 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Turn Right ▶
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   26. SUBWAY SURFERS SIMULATION RUNNER
   ========================================================================== */
function SubwaySurfersFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [lane, setLane] = useState(1);
  const [obstacle, setObstacle] = useState({ y: 0, l: 1 });
  const [coinsList, setCoinsList] = useState<{ y: number; l: number }[]>([]);
  const [collected, setCollected] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const frame = setInterval(() => {
      // Move Obstacles
      setObstacle(o => {
        const nextY = o.y + 10;
        if (nextY >= 90) {
          if (o.l === lane) {
            setFailed(true);
            clearInterval(frame);
          }
          return { y: 0, l: Math.floor(Math.random() * 3) };
        }
        return { ...o, y: nextY };
      });

      // Spawn/Move coins
      setCoinsList(prev => {
        const next: typeof prev = [];
        // occasionally spawn new coins
        if (Math.random() > 0.6) {
          next.push({ y: 0, l: Math.floor(Math.random() * 3) });
        }
        prev.forEach(c => {
          const nextY = c.y + 10;
          if (nextY >= 80 && nextY <= 90 && c.l === lane) {
            setCollected(score => score + 1);
          } else if (nextY < 100) {
            next.push({ ...c, y: nextY });
          }
        });
        return next;
      });
    }, 200);

    return () => clearInterval(frame);
  }, [lane]);

  useEffect(() => {
    if (failed) {
      onFinish(collected, collected > 0 ? Math.min(cost + collected * 3, cost * 3) : 0);
    }
  }, [failed, collected, cost, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Coins Gathered: {collected} 🪙 • Evade train 🚇
      </div>

      <div className="w-full aspect-[3/4] bg-indigo-950 rounded-3xl relative border-4 border-indigo-900 overflow-hidden">
        {/* Subway tracks */}
        <div className="absolute left-[33%] w-0.5 h-full bg-[#eab308]/20" />
        <div className="absolute right-[33%] w-0.5 h-full bg-[#eab308]/20" />

        {/* approaching train obstacle */}
        <div
          className="absolute text-5xl transition-all"
          style={{
            left: `${obstacle.l * 33 + 3}%`,
            top: `${obstacle.y}%`,
            transform: 'translateX(-50%)'
          }}
        >
          🚇
        </div>

        {/* Approaching coins */}
        {coinsList.map((c, i) => (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              left: `${c.l * 33 + 12}%`,
              top: `${c.y}%`,
              transform: 'translateX(-50%)'
            }}
          >
            🪙
          </div>
        ))}

        {/* Surfer */}
        <div
          className="absolute text-4xl leading-none bottom-4"
          style={{ left: `${lane * 33 + 8}%`, transform: 'translateX(-50%)' }}
        >
          🛹
        </div>
      </div>

      {/* Steer controls */}
      <div className="flex gap-4 w-full mt-4">
        <button
          onClick={() => setLane(l => Math.max(l - 1, 0))}
          className="w-1/2 py-2.5 bg-[#4f46e5] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          ◀ Lane Left
        </button>
        <button
          onClick={() => setLane(l => Math.min(l + 1, 2))}
          className="w-1/2 py-2.5 bg-[#4f46e5] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Lane Right ▶
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   27. JUMPING CHROME DINO ENDLESS RUNNER
   ========================================================================== */
function DinoRunnerFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [score, setScore] = useState(0);
  const [dinoY, setDinoY] = useState(0); // 0=ground, positive is jump height
  const [isJumping, setIsJumping] = useState(false);
  const [obstacle, setObstacle] = useState({ x: 100 });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let gravity = 0;
    const game = setInterval(() => {
      // obstacle movement speed
      setObstacle(o => {
        const nextX = o.x - 7;
        if (nextX <= 10) {
          // Check collision! Dino must be jumping higher than cactus to escape
          if (dinoY < 15) {
            setFailed(true);
            clearInterval(game);
          }
          return { x: 100 };
        }
        return { x: nextX };
      });

      // Jump deceleration gravity physics simulations
      setDinoY(dy => {
        if (dy > 0 || isJumping) {
          const nextDY = Math.max(dy + gravity, 0);
          gravity -= 2;
          if (nextDY === 0) {
            setIsJumping(false);
          }
          return nextDY;
        }
        return 0;
      });

      setScore(s => {
        const nextScore = s + 4;
        if (nextScore >= 160) {
          clearInterval(game);
          setTimeout(() => onFinish(nextScore, cost * 2.5), 800);
        }
        return nextScore;
      });
    }, 80);

    return () => clearInterval(game);
  }, [dinoY, isJumping, cost, onFinish]);

  const jump = () => {
    if (isJumping) return;
    setIsJumping(true);
    setDinoY(36);
  };

  useEffect(() => {
    if (failed) {
      onFinish(score, 0);
    }
  }, [failed, score, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Prickly Cacti Dodge Distance: {score}m • Hop cactus 🌵
      </div>

      <div className="w-full aspect-[4/3] bg-neutral-150 rounded-2xl relative border-4 border-neutral-300 overflow-hidden bg-white shadow-inner">
        {/* Sky Cloud */}
        <div className="absolute top-4 left-6 text-xl opacity-20 select-none">☁️</div>

        {/* Cactus obstacle */}
        <div
          className="absolute text-2xl bottom-4 leading-none"
          style={{ left: `${obstacle.x}%` }}
        >
          🌵
        </div>

        {/* Dino */}
        <div
          className="absolute text-3xl leading-none bottom-4 transition-all"
          style={{ left: '16%', bottom: `${16 + dinoY}px` }}
        >
          🦖
        </div>

        {/* Desert Ground strip line */}
        <div className="absolute bottom-4 left-0 w-full h-0.5 bg-neutral-400" />
      </div>

      <button
        onClick={jump}
        className="w-full mt-4 py-3.5 bg-neutral-800 text-white font-black text-sm uppercase rounded-2xl cursor-pointer hover:bg-neutral-700 select-none"
      >
        JUMP DINO (SPACEBAR)
      </button>
    </div>
  );
}

/* ==========================================================================
   28. CLOUD PLATFORM JUMPER (ENDLESS PLATFORMS)
   ========================================================================== */
function EndlessJumpFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [jumperY, setJumperY] = useState(40);
  const [platformX, setPlatformX] = useState(45);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      // Bouncing loops modeling Doodle Jump mechanics
      setJumperY(y => {
        const nextY = y + 10;
        if (nextY >= 80) {
          // Bounce off platform check
          if (platformX >= 30 && platformX <= 65) {
            setPoints(p => p + 10);
            return 20; // reset bounce heights
          } else {
            // failed to land!
            clearInterval(loop);
            onFinish(points, points >= 40 ? cost * 2.2 : 0);
          }
        }
        return nextY;
      });

      // Move platforms sideways
      setPlatformX(x => {
        const nextX = x + Math.floor(Math.random() * 15) - 7;
        return Math.max(Math.min(nextX, 70), 10);
      });
    }, 320);

    return () => clearInterval(loop);
  }, [platformX, points, cost, onFinish]);

  return (
    <div className="w-full max-w-xs flex flex-col items-center">
      <div className="mb-3 text-xs w-full text-center font-bold bg-slate-100 p-2 rounded-lg border text-slate-700">
        Altitude reached: {points}m • Steer Jumper!
      </div>

      <div className="w-full aspect-[3/4] bg-sky-100 rounded-3xl relative border-4 border-sky-305 overflow-hidden">
        {/* Floating clouds backgrounds */}
        <div className="absolute top-2 left-2 text-2xl opacity-15">☁️</div>

        {/* Platform pad */}
        <div
          className="absolute h-3.5 bg-emerald-500 border border-emerald-600 rounded-full transition-all"
          style={{ left: `${platformX}%`, bottom: '15%', width: '32%' }}
        />

        {/* Jumper player */}
        <div
          className="absolute text-3xl leading-none transition-all"
          style={{ left: '50%', bottom: `${jumperY}%`, transform: 'translateX(-50%)' }}
        >
          🐱
        </div>
      </div>

      <div className="flex gap-4 w-full mt-4">
        <button
          onClick={() => setPlatformX(prev => Math.max(prev - 10, 10))}
          className="w-1/2 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
        >
          ◀ Steer Left
        </button>
        <button
          onClick={() => setPlatformX(prev => Math.min(prev + 10, 70))}
          className="w-1/2 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
        >
          Steer Right ▶
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   29. KLONDIKE SOLITAIRE CLASSIC
   ========================================================================== */
function SolitaireFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [cardsLeft, setCardsLeft] = useState(24);
  const [pile, setPile] = useState<string[]>(['K♦', 'Q♠', 'J♦', '10♣', '9♦']);

  const drawCard = () => {
    if (cardsLeft === 0) return;
    setCardsLeft(c => c - 1);
    setPile(p => {
      const suites = ['♦', '♣', '♠', '♥'];
      const vals = ['A', '2', '3', 'J', 'Q', 'K'];
      const randCard = vals[Math.floor(Math.random() * vals.length)] + suites[Math.floor(Math.random() * suites.length)];
      return [randCard, ...p];
    });
  };

  const solve = () => {
    onFinish(5, cost * 2.5);
  };

  return (
    <div className="text-center p-6 bg-emerald-900 text-white rounded-3xl w-full max-w-xs border-4 border-amber-800 shadow">
      <h4 className="text-xs font-black uppercase tracking-widest mb-3">Solitaire Table</h4>
      <div className="flex justify-around items-center mb-5">
        <button onClick={drawCard} className="w-14 h-20 bg-blue-800 border-2 border-white rounded-lg flex items-center justify-center font-bold relative active:scale-95 cursor-pointer">
          <span className="text-xl">🎴</span>
          <span className="absolute bottom-1 right-1 text-[8px]">{cardsLeft}</span>
        </button>
        <div className="w-14 h-20 bg-[#166534] border-2 border-dashed border-emerald-400 rounded-lg flex flex-col items-center justify-center">
          <span className="text-[8px] uppercase tracking-wider text-emerald-300">Ace pile</span>
          <span className="text-xl">♥</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap mb-4">
        {pile.slice(0, 5).map((card, idx) => (
          <div key={idx} className="w-12 h-16 bg-white text-slate-800 border border-slate-350 rounded-md flex items-center justify-center font-extrabold text-xs shadow-sm">
            {card}
          </div>
        ))}
      </div>

      <button onClick={solve} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 font-extrabold text-white text-xs uppercase tracking-wider rounded-xl cursor-pointer">
        Claim Solitaire Victory
      </button>
    </div>
  );
}

/* ==========================================================================
   30. 5-CARD DRAW POKER BETTING ROOM
   ========================================================================== */
function PokerPlayMoneyFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [hand, setHand] = useState<string[]>(['A♠', 'K♠', 'Q♠', 'J♠', '10♠']); // Royal flush mock default
  const [revealed, setRevealed] = useState(false);

  const swapCards = () => {
    setHand(['10♦', '10♥', 'J♣', 'J♥', 'A♣']); // High pairs mock swap
  };

  return (
    <div className="text-center p-5 bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-xs">
      <h4 className="text-xs uppercase tracking-widest font-black text-amber-500 mb-4">5-Card Draw Poker</h4>
      <div className="flex gap-2 justify-center mb-5">
        {hand.map((c, i) => (
          <div key={i} className={`w-11 h-16 rounded-lg font-bold flex items-center justify-center text-xs shadow ${
            c.includes('♥') || c.includes('♦') ? 'bg-white text-red-600' : 'bg-white text-slate-800'
          }`}>
            {c}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={swapCards}
          disabled={revealed}
          className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl cursor-pointer"
        >
          Discard & Draw
        </button>
        <button
          onClick={() => {
            setRevealed(true);
            setTimeout(() => onFinish(1, cost * 3), 1200);
          }}
          className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer"
        >
          Check & Showdown!
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   31. VEGAS BLACKJACK 21 DEALER
   ========================================================================== */
function BlackjackFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const [pCount, setPCount] = useState(15);
  const [dCount, setDCount] = useState(10);
  const [standToday, setStandToday] = useState(false);

  const hit = () => {
    if (standToday) return;
    const nextVal = pCount + Math.floor(Math.random() * 10) + 2;
    if (nextVal > 21) {
      setPCount(nextVal);
      setStandToday(true);
      setTimeout(() => onFinish(0, 0), 1200);
    } else {
      setPCount(nextVal);
    }
  };

  const stand = () => {
    setStandToday(true);
    // Draw dealer hands
    let finalD = dCount;
    while (finalD < 17) {
      finalD += Math.floor(Math.random() * 10) + 2;
    }
    setDCount(finalD);

    const playerWon = pCount <= 21 && (finalD > 21 || pCount >= finalD);
    setTimeout(() => onFinish(pCount, playerWon ? cost * 2.5 : 0), 1200);
  };

  return (
    <div className="text-center p-5 bg-emerald-950 text-white border-2 border-amber-500 rounded-3xl w-full max-w-xs shadow-md">
      <h4 className="text-xs font-black uppercase text-amber-400 mb-4 tracking-widest">Blackjack Table</h4>

      <div className="flex justify-between w-full mb-4 px-2 text-xs text-emerald-200">
        <span>Dealer cards: {dCount}</span>
        <span>Your hand: {pCount}</span>
      </div>

      <div className="flex gap-4">
        <button onClick={hit} disabled={standToday} className="w-1/2 py-2.5 bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase cursor-pointer">Hit Card</button>
        <button onClick={stand} disabled={standToday} className="w-1/2 py-2.5 bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase cursor-pointer">Stand Hand</button>
      </div>
    </div>
  );
}

/* ==========================================================================
   32. RUMMY DECK SENSE GROUPER
   ========================================================================== */
function RummyFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  const solve = () => {
    onFinish(1, cost * 2.5);
  };

  return (
    <div className="text-center p-5 bg-white border rounded-3xl w-full max-w-xs shadow-sm">
      <h4 className="text-xs uppercase font-black text-slate-800 tracking-wider mb-3">Group Rummy Suits</h4>
      <div className="flex gap-1.5 justify-center mb-4">
        {['5♣', '6♣', '7♣', 'Q♥', 'Q♦', 'Q♠'].map((c, i) => (
          <div key={i} className={`w-8.5 h-12 border rounded-md font-bold text-[10px] flex items-center justify-center shadow-xs bg-slate-50 text-slate-700`}>
            {c}
          </div>
        ))}
      </div>
      <button onClick={solve} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide cursor-pointer">
        Meld Sets & Declare
      </button>
    </div>
  );
}

/* ==========================================================================
   33. UNO COLOR PARTY DISCARD
   ========================================================================== */
function UnoFrame({ onFinish, cost }: { onFinish: (score: number, coins: number) => void; cost: number }) {
  return (
    <div className="text-center p-6 bg-[#1e293b] text-white rounded-3xl w-full max-w-xs border border-slate-700">
      <h4 className="text-xs font-extrabold uppercase text-amber-400 mb-4 tracking-wider">Vegas Uno Party</h4>
      <div className="flex justify-center items-center gap-4 mb-5">
        <div className="w-12 h-18 bg-rose-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow">R-4</div>
        <span className="text-xs text-slate-400 font-mono">Matched pile</span>
      </div>

      <div className="flex gap-1.5 justify-center mb-4">
        {['Y-4', 'B-Skip', 'G-6'].map((card, i) => (
          <button
            key={i}
            onClick={() => onFinish(1, cost * 2.2)}
            className={`w-11 h-16 rounded-xl font-black text-xs shadow transform hover:-translate-y-1 transition-transform cursor-pointer ${
              card.startsWith('Y') ? 'bg-yellow-500 text-slate-900' :
              card.startsWith('B') ? 'bg-blue-600 text-white' :
              'bg-emerald-600 text-white'
            }`}
          >
            {card}
          </button>
        ))}
      </div>
    </div>
  );
}

