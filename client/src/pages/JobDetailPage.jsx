import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobApi, applicationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Feedback';
import toast from 'react-hot-toast';

const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return null;
  const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
  if (min && max) return `${currency} ${fmt(min)}–${fmt(max)}`;
  return `${currency} ${fmt(min || max)}+`;
};

const JobDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await jobApi.getById(id);
        setJob(data.job);
      } catch (err) {
        toast.error('Job not found');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    // Check if candidate already applied (best-effort, non-blocking)
    const checkApplied = async () => {
      if (user?.role !== 'candidate') return;
      try {
        const { data } = await applicationApi.getMine();
        setAlreadyApplied(data.applications.some((a) => a.job?._id === id));
      } catch {
        // ignore
      }
    };
    checkApplied();
  }, [user, id]);

  if (loading) return <Spinner label="Loading job" />;
  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-xl font-semibold">Job not found</h2>
        <Link to="/jobs" className="text-amber-600 hover:underline mt-3 inline-block">
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}/apply` } });
      return;
    }
    if (user.role !== 'candidate') {
      toast.error('Only candidate accounts can apply to jobs');
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/jobs" className="text-sm text-slate-600 hover:text-ink-900">
        ← Back to all jobs
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold">{job.title}</h1>
          <p className="text-slate-600 mt-1">
            {job.companyName} · {job.location}
          </p>
        </div>
        {alreadyApplied ? (
          <span className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-sm text-sm font-medium">
            Already applied
          </span>
        ) : (
          <button onClick={handleApplyClick} className="btn-accent">
            Apply now
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-5 text-xs">
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600 capitalize">
          {job.jobType?.replace('-', ' ')}
        </span>
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600 capitalize">
          {job.workMode}
        </span>
        <span className="px-2.5 py-1 bg-slate-50 rounded-sm text-slate-600 capitalize">
          {job.experienceLevel} level
        </span>
        {salary && (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-sm font-medium">
            {salary}
          </span>
        )}
      </div>

      <div className="mt-8 prose-job">
        <h2 className="font-display text-lg font-semibold mb-2">About this role</h2>
        <p className="text-ink-900 whitespace-pre-line leading-relaxed">{job.description}</p>
      </div>

      {job.responsibilities?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold mb-2">Responsibilities</h2>
          <ul className="list-disc list-inside space-y-1 text-ink-900">
            {job.responsibilities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {job.requirements?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold mb-2">Requirements</h2>
          <ul className="list-disc list-inside space-y-1 text-ink-900">
            {job.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {job.skills?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-slate-50 rounded-sm text-sm text-slate-600">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-slate-100">
        {alreadyApplied ? (
          <p className="text-sm text-slate-600">
            You've already applied to this role. Track it from your{' '}
            <Link to="/candidate/dashboard" className="text-amber-600 hover:underline">
              dashboard
            </Link>
            .
          </p>
        ) : (
          <button onClick={handleApplyClick} className="btn-accent">
            Apply now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
