export const Spinner = ({ label = 'Loading' }) => (
  <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
    <span className="w-4 h-4 border-2 border-slate-300 border-t-ink-900 rounded-full animate-spin"></span>
    {label}
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="text-center py-16 px-4">
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    {description && <p className="text-slate-600 text-sm mt-1.5 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
