import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="glass-strong rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
              <h3 className="font-display text-lg sm:text-xl font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 overflow-y-auto flex-1">{children}</div>
            {footer && <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
