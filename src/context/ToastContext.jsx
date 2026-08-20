import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration > 0) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove],
  );

  const api = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d ?? 4000),
    info: (m, d) => toast(m, 'info', d),
    remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-4 z-[100] flex flex-col gap-2 sm:max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`glass-strong rounded-xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 shadow-xl pointer-events-auto ${
                t.type === 'success'
                  ? 'border-emerald-400/40'
                  : t.type === 'error'
                    ? 'border-rose-400/40'
                    : 'border-accent-blue/40'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              ) : t.type === 'error' ? (
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
              ) : (
                <Info className="text-accent-blue shrink-0 mt-0.5" size={18} />
              )}
              <p className="text-xs sm:text-sm flex-1 leading-relaxed">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" aria-label="Close notification">
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
