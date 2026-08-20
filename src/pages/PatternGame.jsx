import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Spline,
  Timer,
  Target,
  Flame,
  RotateCcw,
  Lightbulb,
  Check,
  X,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitGameResult } from '../services/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import GameResultModal from '../components/GameResultModal';

// Generates a random numeric pattern with a missing piece.
// Types: arithmetic, geometric, fibonacci-like, squares
function generatePattern(level) {
  const types = ['arithmetic', 'geometric', 'squares', 'fibonacci'];
  const type = types[Math.floor(Math.random() * types.length)];
  let seq = [];
  let answer = 0;

  if (type === 'arithmetic') {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 1 + level;
    seq = Array.from({ length: 5 }, (_, i) => start + i * step);
  } else if (type === 'geometric') {
    const start = Math.floor(Math.random() * 3) + 2;
    const ratio = 2 + (level % 3);
    seq = Array.from({ length: 5 }, (_, i) => start * ratio ** i);
  } else if (type === 'squares') {
    const offset = Math.floor(Math.random() * 3);
    seq = Array.from({ length: 5 }, (_, i) => (i + 1 + offset) ** 2);
  } else {
    // fibonacci-like
    let a = Math.floor(Math.random() * 3) + 1;
    let b = a + Math.floor(Math.random() * 3) + 1;
    seq = [a, b];
    for (let i = 0; i < 3; i++) {
      const next = a + b;
      seq.push(next);
      a = b;
      b = next;
    }
  }

  const missingIdx = Math.floor(Math.random() * 5);
  answer = seq[missingIdx];
  const display = seq.map((n, i) => (i === missingIdx ? null : n));

  // Generate 4 options
  const options = new Set([answer]);
  while (options.size < 4) {
    const delta = Math.floor(Math.random() * 10) + 1;
    options.add(answer + delta);
    options.add(Math.max(1, answer - delta));
  }
  return {
    type,
    display,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

export default function PatternGame() {
  const { refreshProfile } = useAuth();
  const toast = useToast();

  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState(() => generatePattern(1));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [lives, setLives] = useState(3);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setLevel(1);
    setScore(0);
    setCombo(0);
    setSeconds(0);
    setLives(3);
    setHintsLeft(3);
    setSelected(null);
    setFeedback(null);
    setPattern(generatePattern(1));
    setRunning(true);
    setResult(null);
    setModalOpen(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const nextRound = useCallback(() => {
    setSelected(null);
    setFeedback(null);
    setPattern(generatePattern(level));
  }, [level]);

  const handleAnswer = (opt) => {
    if (feedback || !running) return;
    setSelected(opt);
    if (opt === pattern.answer) {
      setFeedback('correct');
      const gained = 100 + combo * 20 + level * 10;
      setScore((s) => s + gained);
      setCombo((c) => c + 1);
      toast.success(`+${gained} ${combo > 0 ? `(${combo + 1}x combo!)` : ''}`, 1500);
      setTimeout(() => {
        setLevel((l) => l + 1);
        nextRound();
      }, 700);
    } else {
      setFeedback('wrong');
      setCombo(0);
      setLives((l) => l - 1);
      toast.error('Wrong answer');
      setTimeout(() => {
        if (lives - 1 <= 0) {
          finishGame(false);
        } else {
          nextRound();
        }
      }, 900);
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) {
      toast.error('No hints left!');
      return;
    }
    setHintsLeft((h) => h - 1);
    // remove two wrong options visually by marking them disabled
    const wrong = pattern.options.filter((o) => o !== pattern.answer);
    const toDisable = wrong.slice(0, 2);
    setPattern((p) => ({ ...p, options: p.options.map((o) => (toDisable.includes(o) ? null : o)) }));
  };

  const finishGame = async (didWin) => {
    setRunning(false);
    clearInterval(timerRef.current);
    try {
      const res = await submitGameResult({
        game: 'pattern',
        difficulty: `level-${level}`,
        score,
        durationSeconds: seconds,
        moves: level - 1,
        accuracy: level > 1 ? Math.round((combo / (level - 1)) * 100) : 100,
        won: didWin,
      });
      setResult({
        won: didWin,
        score,
        xpEarned: score,
        coinsEarned: Math.floor(score / 10) + (didWin ? 20 : 5),
        durationSeconds: seconds,
        isBest: res.better,
      });
      setModalOpen(true);
      refreshProfile();
    } catch (err) {
      toast.error('Failed to save score: ' + err.message);
    }
  };

  const multiplier = 1 + combo * 0.2;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Spline className="text-accent-purple shrink-0" /> Pattern Recognition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Identify the missing number in the sequence.
          </p>
        </div>
        {!running && !modalOpen && (
          <Button onClick={start} className="self-start sm:self-auto">
            <Play size={16} /> Start Game
          </Button>
        )}
      </div>

      {/* HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Target className="text-accent-blue shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Level</p>
            <p className="font-display font-semibold text-sm sm:text-base">{level}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Spline className="text-accent-purple shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Score</p>
            <p className="font-display font-semibold text-sm sm:text-base">{score}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Flame className="text-amber-500 shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Combo</p>
            <p className="font-display font-semibold text-sm sm:text-base">{combo}x</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Timer className="text-accent-blue shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Time</p>
            <p className="font-display font-semibold text-sm sm:text-base">{seconds}s</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 col-span-2 sm:col-span-1">
          <span className="text-rose-500 text-base sm:text-lg shrink-0">{'♥'.repeat(lives)}{'♡'.repeat(3 - lives)}</span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400">Lives</p>
            <p className="font-display font-semibold text-sm sm:text-base">{lives}/3</p>
          </div>
        </div>
      </div>

      {/* Combo multiplier banner */}
      {running && combo > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-strong rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold"
        >
          <Flame className="text-amber-500 shrink-0" size={16} />
          Score multiplier: {multiplier.toFixed(1)}x
        </motion.div>
      )}

      {running ? (
        <GlassCard className="p-4 sm:p-6 md:p-10">
          <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-400 mb-3 sm:mb-4 text-center">
            {pattern.type} sequence - find the missing value
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            {pattern.display.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-display font-bold ${
                  n === null
                    ? 'gradient-btn text-white border-2 border-dashed border-white/60'
                    : 'glass-strong'
                }`}
              >
                {n === null ? '?' : n}
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-400 mb-2.5 sm:mb-3">Choose the correct answer</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {pattern.options.map((opt, i) => {
              const isCorrect = opt === pattern.answer;
              const isWrong = selected === opt && feedback === 'wrong';
              return (
                <motion.button
                  key={i}
                  whileHover={opt !== null ? { scale: 1.03 } : {}}
                  whileTap={opt !== null ? { scale: 0.96 } : {}}
                  onClick={() => opt !== null && handleAnswer(opt)}
                  disabled={opt === null || feedback !== null}
                  className={`py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-display font-bold text-lg sm:text-xl transition-all touch-manipulation ${
                    opt === null
                      ? 'glass opacity-30 cursor-not-allowed line-through'
                      : isCorrect && feedback
                        ? 'bg-emerald-500 text-white'
                        : isWrong
                          ? 'bg-rose-500 text-white'
                          : 'glass-strong hover:border-accent-purple'
                  }`}
                >
                  {opt !== null ? opt : '—'}
                  {isCorrect && feedback === 'correct' && <Check className="inline ml-1.5" size={16} />}
                  {isWrong && <X className="inline ml-1.5" size={16} />}
                </motion.button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button variant="outline" size="sm" onClick={useHint}>
              <Lightbulb size={15} /> Hint ({hintsLeft})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => finishGame(false)}>
              <RotateCcw size={15} /> End game
            </Button>
          </div>
        </GlassCard>
      ) : (
        !modalOpen && (
          <GlassCard className="p-6 sm:p-10 text-center">
            <Spline className="mx-auto text-accent-purple mb-3 sm:mb-4" size={42} />
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Ready to test your pattern skills?</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto">
              Each correct answer builds your combo. One wrong move costs a life.
            </p>
            <Button size="lg" onClick={start}>
              <Play size={18} /> Start Game
            </Button>
          </GlassCard>
        )
      )}

      <GameResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
        onPlayAgain={start}
        onBackToGames={() => setModalOpen(false)}
      />
    </div>
  );
}
