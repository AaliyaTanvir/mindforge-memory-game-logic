import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'gradient-btn shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40',
  secondary:
    'bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20',
  outline:
    'bg-transparent border-2 border-accent-blue/60 text-accent-blue hover:bg-accent-blue/10',
};

const SIZES = {
  sm: 'px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm min-h-[34px]',
  md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm min-h-[38px] sm:min-h-[42px]',
  lg: 'px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
