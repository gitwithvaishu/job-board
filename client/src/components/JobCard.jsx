import { Link } from 'react-router-dom';

const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return null;
  const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  return `${currency} ${fmt(min || max)}+`;
};

const JobCard = ({ job }) => {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card block p-5 hover:border-ink-900 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold group-hover:text-amber-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">{job.companyName}</p>
        </div>
        <span className="text-xs uppercase tracking-wide text-slate-400 whitespace-nowrap pt-1">
          {postedDate}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 text-xs">
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600 capitalize">
          {job.jobType?.replace('-', ' ')}
        </span>
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600 capitalize">
          {job.workMode}
        </span>
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600">{job.location}</span>
      </div>

      {salary && (
        <p className="text-sm font-medium text-ink-900 mt-3">{salary}</p>
      )}
    </Link>
  );
};

export default JobCard;
