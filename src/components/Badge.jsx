export default function Badge({ icon: Icon, label, earned = true }) {
  return (
    <div
      className={`glass rounded-xl p-3 flex flex-col items-center gap-2 text-center transition-all ${
        earned ? 'opacity-100' : 'opacity-40 grayscale'
      }`}
      title={label}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          earned
            ? 'bg-gradient-to-br from-accent-blue to-accent-purple text-white'
            : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
        }`}
      >
        {Icon && <Icon size={20} />}
      </div>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </div>
  );
}
