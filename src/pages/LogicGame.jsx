import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle,
  Timer,
  Target,
  Lightbulb,
  RotateCcw,
  Check,
  X,
  Play,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitGameResult } from '../services/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import GameResultModal from '../components/GameResultModal';

// Puzzle generators by type and difficulty level
function generatePuzzle(level) {
  const types = ['number', 'shape', 'missing'];
  const type = types[(level - 1) % types.length];

  if (type === 'number') {
    // What comes next in the sequence
    const start = Math.floor(Math.random() * 5) + 1;
    const step = Math.floor(Math.random() * 4) + 2 + (level % 3);
    const seq = Array.from({ length: 4 }, (_, i) => start + i * step);
    const answer = start + 4 * step;
    const options = new Set([answer]);
    while (options.size < 4) {
      options.add(answer + (Math.floor(Math.random() * 6) - 3) * step);
    }
    return {
      type: 'number',
      prompt: 'What number comes next?',
      visual: seq.join(',  ') + ',  ?',
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      hint: `The step between numbers is ${step}.`,
    };
  }

  if (type === 'shape') {
    // Odd shape out — pick the shape that doesn't match
    const shapes = ['▲', '●', '■', '◆', '★', '⬟'];
    const common = shapes[Math.floor(Math.random() * shapes.length)];
    const odd = shapes.filter((s) => s !== common)[Math.floor(Math.random() * 5)];
    const line = [common, common, common, odd];
    // shuffle
    line.sort(() => Math.random() - 0.5);
    return {
      type: 'shape',
      prompt: 'Which shape is the odd one out?',
      visual: line.join('   '),
      answer: odd,
      options: Array.from(new Set(line)).sort(() => Math.random() - 0.5),
      hint: 'Look for the shape that appears only once.',
    };
  }

  // missing object — which item is missing from the set
  const sets = [
    { name: 'primary colors', items: ['Red', 'Blue', 'Yellow'], pool: ['Red', 'Blue', 'Yellow', 'Green'] },
    { name: 'vowels', items: ['A', 'E', 'I', 'O', 'U'], pool: ['A', 'E', 'I', 'O', 'U', 'Y'] },
    { name: 'seasons', items: ['Spring', 'Summer', 'Autumn', 'Winter'], pool: ['Spring', 'Summer', 'Autumn', 'Winter', 'Monsoon'] },
    { name: 'planets', items: ['Mercury', 'Venus', 'Earth', 'Mars'], pool: ['Mercury', 'Venus', 'Earth', 'Mars', 'Pluto'] },
  ];
  const set = sets[level % sets.length];
  const present = set.items.slice(0, set.items.length - 1);
  const missing = set.items[set.items.length - 1];
  const distractor = set.pool.find((x) => !set.items.includes(x));
  const options = [missing, ...present.slice(0, 3)];
  return {
    type: 'missing',
    prompt: `Which item is missing from "${set.name}"?`,
    visual: present.join(',  '),
    answer: missing,
    options: options.sort(() => Math.random() - 0.5),
    hint: `The full set has ${set.items.length} items.`,
  };
}

export default function LogicGame() {
  const { refreshProfile } = useAuth();
  const toast = useToast();

  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(1));
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setLevel(1);
    setScore(0);
    setSeconds(0);
    setHintsLeft(3);
    setSelected(null);
    setFeedback(null);
    setShowHint(false);
    setSolvedCount(0);
    setPuzzle(generatePuzzle(1));
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
    setShowHint(false);
    setPuzzle(generatePuzzle(level));
  }, [level]);

  const handleAnswer = (opt) => {
    if (feedback || !running) return;
    setSelected(opt);
    if (opt === puzzle.answer) {
      setFeedback('correct');
      const gained = 80 + level * 15;
      setScore((s) => s + gained);
      setSolvedCount((c) => c + 1);
      toast.success(`Correct! +${gained}`, 1200);
      setTimeout(() => {
        setLevel((l) => l + 1);
        nextRound();
      }, 800);
    } else {
      setFeedback('wrong');
      toast.error('Not quite - correct answer shown', 1800);
      setTimeout(() => nextRound(), 1500);
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) {
      toast.error('No hints left!');
      return;
    }
    setHintsLeft((h) => h - 1);
    setShowHint(true);
  };

  const finishGame = async () => {
    setRunning(false);
    clearInterval(timerRef.current);
    const didWin = solvedCount >= 5;
    try {
      const res = await submitGameResult({
        game: 'logic',
        difficulty: `level-${level}`,
        score,
        durationSeconds: seconds,
        moves: solvedCount,
        accuracy: solvedCount > 0 ? Math.round((solvedCount / (solvedCount + 1)) * 100) : 0,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Puzzle className="text-emerald-500 shrink-0" /> Logic Challenge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Number sequences, shape puzzles, and missing objects.
          </p>
        </div>
        {!running && !modalOpen && (
          <Button onClick={start} className="self-start sm:self-auto">
            <Play size={16} /> Start Game
          </Button>
        )}
      </div>

      {/* HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Target className="text-emerald-500 shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Level</p>
            <p className="font-display font-semibold text-sm sm:text-base">{level}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Puzzle className="text-accent-purple shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Score</p>
            <p className="font-display font-semibold text-sm sm:text-base">{score}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Check className="text-emerald-500 shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Solved</p>
            <p className="font-display font-semibold text-sm sm:text-base">{solvedCount}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          <Timer className="text-accent-blue shrink-0" size={18} />
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Time</p>
            <p className="font-display font-semibold text-sm sm:text-base">{seconds}s</p>
          </div>
        </div>
      </div>

      {running ? (
        <GlassCard className="p-4 sm:p-6 md:p-10">
          <div className="text-center mb-4 sm:mb-6">
            <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-wide gradient-text mb-1.5 sm:mb-2">
              {puzzle.type} puzzle
            </span>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 px-2">{puzzle.prompt}</p>
            <motion.div
              key={level}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold tracking-wider my-4 sm:my-6 break-words px-2"
            >
              {puzzle.visual}
            </motion.div>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2"
              >
                <Lightbulb size={16} className="shrink-0" /> <span>{puzzle.hint}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {puzzle.options.map((opt, i) => {
              const isCorrect = opt === puzzle.answer;
              const isWrong = selected === opt && feedback === 'wrong';
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== null}
                  className={`py-3 sm:py-4 px-2 sm:px-3 rounded-xl font-display font-bold text-base sm:text-lg transition-all touch-manipulation break-words ${
                    isCorrect && feedback
                      ? 'bg-emerald-500 text-white'
                      : isWrong
                        ? 'bg-rose-500 text-white'
                        : 'glass-strong hover:border-accent-purple'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isCorrect && feedback === 'correct' && <Check className="inline ml-1.5 shrink-0" size={16} />}
                  {isWrong && <X className="inline ml-1.5 shrink-0" size={16} />}
                </motion.button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button variant="outline" size="sm" onClick={useHint}>
              <Lightbulb size={15} /> Hint ({hintsLeft})
            </Button>
            <Button variant="ghost" size="sm" onClick={finishGame}>
              <RotateCcw size={15} /> End game
            </Button>
          </div>
        </GlassCard>
      ) : (
        !modalOpen && (
          <GlassCard className="p-6 sm:p-10 text-center">
            <Puzzle className="mx-auto text-emerald-500 mb-3 sm:mb-4" size={42} />
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Logic puzzles await</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto">
              Solve 5 puzzles in a row to win. Difficulty rises with every level.
            </p>
            <Button size="lg" onClick={start}>
              <Play size={18} /> Start Game <ChevronRight size={16} />
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
