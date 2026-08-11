export default function Stat({ icon: Icon, label, value, accent = 'blue', subtitle }) {
  const accents = {
    blue: 'from-accent-blue/20 to-accent-blue/5 text-accent-blue',
    purple: 'from-accent-purple/20 to-accent-purple/5 text-accent-purple',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-500',
  };
  return (
    <div className={`glass rounded-2xl p-4 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-display font-semibold leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
