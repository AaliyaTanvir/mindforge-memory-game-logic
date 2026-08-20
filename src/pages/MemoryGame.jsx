import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3,
  Timer,
  Footprints,
  Lightbulb,
  RotateCcw,
  Trophy,
  Pause,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitGameResult } from '../services/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import GameResultModal from '../components/GameResultModal';

const SYMBOLS = ['🌟', '🔮', '⚡', '🎯', '🎨', '🎵', '🚀', '💎', '🔥', '🌈', '⚡', '🎲', '🧩', '🏆', '🌌', '🎭', '🦋', '🌸', '🪐', '☄️', '🍀', '🎈', '🎮', '🧠', '💡', '🔑', '🛡️', '🗺️', '⏳', '🌀', '💎', '🌟'];

const DIFFICULTIES = {
  easy: { label: '4 x 4', cols: 4, pairs: 8 },
  medium: { label: '6 x 6', cols: 6, pairs: 18 },
  hard: { label: '8 x 8', cols: 8, pairs: 32 },
};

function buildDeck(pairs) {
  const symbols = SYMBOLS.slice(0, pairs);
  const deck = [...symbols, ...symbols]
    .map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export default function MemoryGame() {
  const { refreshProfile } = useAuth();
  const toast = useToast();

  const [difficulty, setDifficulty] = useState('easy');
  const [deck, setDeck] = useState(() => buildDeck(DIFFICULTIES.easy.pairs));
  const [flipped, setFlipped] = useState([]); // indices currently face-up (max 2)
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintPair, setHintPair] = useState(null);
  const [won, setWon] = useState(false);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [best, setBest] = useState(null);

  const config = DIFFICULTIES[difficulty];

  const matchedCount = deck.filter((c) => c.matched).length;
  const totalPairs = config.pairs;

  // Timer
  useEffect(() => {
    if (!running || paused || won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, paused, won]);

  // Win check
  useEffect(() => {
    if (matchedCount > 0 && matchedCount === totalPairs && !won) {
      finishGame(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount, totalPairs]);

  const reset = useCallback(
    (level) => {
      const cfg = DIFFICULTIES[level];
      setDeck(buildDeck(cfg.pairs));
      setFlipped([]);
      setMoves(0);
      setSeconds(0);
      setRunning(false);
      setPaused(false);
      setHintsLeft(3);
      setHintPair(null);
      setWon(false);
      setResult(null);
      setModalOpen(false);
    },
    [],
  );

  const changeDifficulty = (level) => {
    setDifficulty(level);
    reset(level);
  };

  const handleFlip = (idx) => {
    if (won || paused) return;
    const card = deck[idx];
    if (card.flipped || card.matched) return;
    if (flipped.length === 2) return;

    if (!running) setRunning(true);

    const next = [...deck];
    next[idx] = { ...card, flipped: true };
    setDeck(next);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (next[a].symbol === next[b].symbol) {
        // match
        setTimeout(() => {
          setDeck((d) => {
            const upd = [...d];
            upd[a] = { ...upd[a], matched: true };
            upd[b] = { ...upd[b], matched: true };
            return upd;
          });
          setFlipped([]);
        }, 400);
      } else {
        setTimeout(() => {
          setDeck((d) => {
            const upd = [...d];
            upd[a] = { ...upd[a], flipped: false };
            upd[b] = { ...upd[b], flipped: false };
            return upd;
          });
          setFlipped([]);
        }, 900);
      }
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) {
      toast.error('No hints left!');
      return;
    }
    // find a pair that is not matched and not currently flipped
    const unmatched = deck
      .map((c, i) => ({ ...c, i }))
      .filter((c) => !c.matched && !c.flipped);
    const bySymbol = {};
    unmatched.forEach((c) => {
      if (!bySymbol[c.symbol]) bySymbol[c.symbol] = [];
      bySymbol[c.symbol].push(c.i);
    });
    const pair = Object.values(bySymbol).find((arr) => arr.length === 2);
    if (!pair) {
      toast.error('No hint available');
      return;
    }
    setHintsLeft((h) => h - 1);
    setHintPair(pair);
    setTimeout(() => setHintPair(null), 1200);
  };

  const finishGame = async (didWin) => {
    setWon(true);
    setRunning(false);
    const score = Math.max(0, Math.round((totalPairs * 100) - moves * 5 - seconds * 2));
    const durationSeconds = seconds;
    try {
      const res = await submitGameResult({
        game: 'memory',
        difficulty,
        score,
        durationSeconds,
        moves,
        accuracy: totalPairs > 0 ? Math.round((totalPairs / Math.max(1, moves)) * 100) : 0,
        won: didWin,
      });
      setBest(res.better ? score : best);
      setResult({
        won: didWin,
        score,
        xpEarned: score,
        coinsEarned: Math.floor(score / 10) + (didWin ? 20 : 5),
        durationSeconds,
        isBest: res.better,
      });
      setModalOpen(true);
      refreshProfile();
      if (res.better) toast.success('New personal best!');
    } catch (err) {
      toast.error('Failed to save score: ' + err.message);
    }
  };

  const colsClass = useMemo(() => {
    return config.cols === 4
      ? 'grid-cols-4'
      : config.cols === 6
        ? 'grid-cols-4 sm:grid-cols-6'
        : 'grid-cols-4 sm:grid-cols-8';
  }, [config.cols]);

  const cardSize =
    config.cols === 8
      ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
      : config.cols === 6
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-2xl sm:text-3xl md:text-4xl';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Grid3x3 className="text-accent-blue shrink-0" /> Memory Game
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Flip the cards and match every pair.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
          {Object.entries(DIFFICULTIES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => changeDifficulty(key)}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                difficulty === key
                  ? 'gradient-btn text-white'
                  : 'glass text-slate-600 dark:text-slate-300'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Timer className="text-accent-blue shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Time</p>
            <p className="font-display font-semibold text-sm sm:text-base">{seconds}s</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Footprints className="text-accent-purple shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Moves</p>
            <p className="font-display font-semibold text-sm sm:text-base">{moves}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Trophy className="text-amber-500 shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Pairs</p>
            <p className="font-display font-semibold text-sm sm:text-base">{matchedCount}/{totalPairs}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Lightbulb className="text-amber-400 shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Hints</p>
            <p className="font-display font-semibold text-sm sm:text-base">{hintsLeft}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button variant="secondary" size="sm" onClick={() => reset(difficulty)}>
          <RotateCcw size={15} /> Restart
        </Button>
        <Button variant="outline" size="sm" onClick={useHint}>
          <Lightbulb size={15} /> Hint
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPaused((p) => !p)}
          disabled={!running || won}
        >
          {paused ? <><Play size={15} /> Resume</> : <><Pause size={15} /> Pause</>}
        </Button>
      </div>

      {/* Board */}
      <GlassCard className="p-3 sm:p-4 md:p-6 relative">
        {paused && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-2xl">
            <div className="text-center p-4">
              <Pause className="mx-auto text-white mb-2" size={36} />
              <p className="text-white font-display text-lg sm:text-xl">Paused</p>
            </div>
          </div>
        )}
        <div className={`grid ${colsClass} gap-1.5 sm:gap-2.5 md:gap-3 relative`}>
          {deck.map((card, idx) => {
            const isHint = hintPair && hintPair.includes(idx);
            return (
              <motion.button
                key={card.id}
                onClick={() => handleFlip(idx)}
                whileHover={{ scale: card.flipped || card.matched ? 1 : 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center ${cardSize} font-bold transition-all select-none touch-manipulation ${
                  card.matched
                    ? 'bg-gradient-to-br from-emerald-400/30 to-emerald-600/20 border-2 border-emerald-400/50'
                    : card.flipped
                      ? 'glass-strong border-2 border-accent-purple/50'
                      : 'gradient-btn text-white shadow-md sm:shadow-lg shadow-accent-purple/20'
                } ${isHint ? 'ring-4 ring-amber-400' : ''}`}
                style={{ perspective: 1000 }}
              >
                <AnimatePresence mode="wait">
                  {card.flipped || card.matched ? (
                    <motion.span
                      key="front"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {card.symbol}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="back"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="opacity-70"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      <GameResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
        onPlayAgain={() => reset(difficulty)}
        onBackToGames={() => setModalOpen(false)}
      />
    </div>
  );
}
