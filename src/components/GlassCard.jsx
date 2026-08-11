import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, onClick, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className={`glass rounded-2xl ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
