const STAGES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Hired' },
];

const STATUS_COLORS = {
  submitted: 'bg-slate-400',
  under_review: 'bg-amber-500',
  shortlisted: 'bg-ink-700',
  hired: 'bg-emerald-600',
  rejected: 'bg-red-500',
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  hired: 'Hired',
  rejected: 'Not selected',
};

// Renders the hiring funnel as a track with a filled progress marker.
// Rejected is handled as a distinct end-state badge rather than a pipeline position.
const StatusPipeline = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        <span className="text-sm font-medium text-red-600">Not selected</span>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STAGES.map((stage, idx) => (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  idx <= currentIndex ? STATUS_COLORS[status] || 'bg-ink-900' : 'bg-slate-100'
                }`}
              />
              <span
                className={`text-[11px] whitespace-nowrap ${
                  idx <= currentIndex ? 'text-ink-900 font-medium' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {idx < STAGES.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 ${
                  idx < currentIndex ? 'bg-ink-900' : 'bg-slate-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { STATUS_LABELS, STATUS_COLORS };
export default StatusPipeline;
