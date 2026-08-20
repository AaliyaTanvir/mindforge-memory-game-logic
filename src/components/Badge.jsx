export default function Badge({ icon: Icon, label, earned = true }) {
  return (
    <div
      className={`glass rounded-xl p-2 sm:p-3 flex flex-col items-center gap-1.5 sm:gap-2 text-center transition-all min-w-0 ${
        earned ? 'opacity-100' : 'opacity-40 grayscale'
      }`}
      title={label}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
          earned
            ? 'bg-gradient-to-br from-accent-blue to-accent-purple text-white'
            : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
      </div>
      <span className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2">{label}</span>
    </div>
  );
}
