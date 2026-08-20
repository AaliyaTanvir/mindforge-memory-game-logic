export default function Stat({ icon: Icon, label, value, accent = 'blue', subtitle }) {
  const accents = {
    blue: 'from-accent-blue/20 to-accent-blue/5 text-accent-blue',
    purple: 'from-accent-purple/20 to-accent-purple/5 text-accent-purple',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-500',
  };
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 min-w-0">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center shrink-0`}>
        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-display font-semibold leading-tight truncate">{value}</p>
        {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
