// StatsCard Component
// This component displays analytics stat cards on the dashboard

'use client';

export default function StatsCard({ icon, label, value, color = 'primary', className = '' }) {
  // Define color variants
  const colorMap = {
    primary: 'bg-primary/10 border-primary/20 text-primary',
    blue: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    amber: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    red: 'bg-red-400/10 border-red-400/20 text-red-400',
    default: 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50',
  };

  const colorClass = colorMap[color] || colorMap.default;

  return (
    <div className={`flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-5 border ${colorClass} ${className}`}>
      {/* Icon */}
      <span className="material-symbols-outlined">{icon}</span>
      {/* Label */}
      <p className="text-slate-500 dark:text-slate-300 text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      {/* Value - bada number */}
      <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{value}</p>
    </div>
  );
}
