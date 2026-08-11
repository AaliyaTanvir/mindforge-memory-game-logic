import { Brain, Sparkles, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

// Decorative floating orbs used on auth/landing backgrounds.
export default function FloatingOrbs() {
  const orbs = [
    { icon: Brain, x: '8%', y: '18%', delay: 0, size: 64 },
    { icon: Sparkles, x: '82%', y: '12%', delay: 0.6, size: 54 },
    { icon: Zap, x: '15%', y: '72%', delay: 1.2, size: 50 },
    { icon: Trophy, x: '78%', y: '68%', delay: 1.8, size: 58 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute glass rounded-2xl flex items-center justify-center text-accent-purple/40"
          style={{ left: o.x, top: o.y, width: o.size, height: o.size }}
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, delay: o.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <o.icon size={o.size * 0.5} />
        </motion.div>
      ))}
    </div>
  );
}
