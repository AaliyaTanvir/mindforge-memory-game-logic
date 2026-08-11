import { motion } from 'framer-motion';
import { Trophy, Coins, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function GameResultModal({
  open,
  onClose,
  result,
  onPlayAgain,
  onBackToGames,
}) {
  if (!result) return null;
  const { won, score, xpEarned, coinsEarned, durationSeconds, isBest } = result;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={won ? 'Challenge Complete!' : 'Game Over'}
      footer={
        <>
          <Button variant="secondary" onClick={onPlayAgain}>
            <RotateCcw size={16} /> Play Again
          </Button>
          <Button onClick={onBackToGames}>
            <ArrowRight size={16} /> Back to Games
          </Button>
        </>
      }
    >
      <div className="text-center py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
            won ? 'gradient-btn' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <Trophy size={28} className={won ? 'text-white' : 'text-slate-500'} />
        </motion.div>

        {isBest && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide gradient-text mb-2">
            New personal best!
          </span>
        )}

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="glass rounded-xl p-3">
            <Zap size={18} className="mx-auto text-accent-blue mb-1" />
            <p className="text-xs text-slate-400">Score</p>
            <p className="font-display font-semibold">{score}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <Coins size={18} className="mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-slate-400">Coins</p>
            <p className="font-display font-semibold">+{coinsEarned}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <Trophy size={18} className="mx-auto text-accent-purple mb-1" />
            <p className="text-xs text-slate-400">XP</p>
            <p className="font-display font-semibold">+{xpEarned}</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Time: <span className="font-medium">{durationSeconds}s</span>
        </p>
      </div>
    </Modal>
  );
}
