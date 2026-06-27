import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobApi } from '../api/endpoints';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { Spinner, EmptyState } from '../components/Feedback';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

const JobListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const jobType = searchParams.get('jobType') || '';
  const workMode = searchParams.get('workMode') || '';
  const experienceLevel = searchParams.get('experienceLevel') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await jobApi.getAll({
        search: search || undefined,
        location: location || undefined,
        jobType: jobType || undefined,
        workMode: workMode || undefined,
        experienceLevel: experienceLevel || undefined,
        page,
        limit: 9,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  }, [search, location, jobType, workMode, experienceLevel, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // reset pagination on filter change
    setSearchParams(next);
  };

  const goToPage = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage);
    setSearchParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">Find your next role</h1>

      <div className="mb-6">
        <SearchBar initialSearch={search} initialLocation={location} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={jobType}
          onChange={(e) => updateFilter('jobType', e.target.value)}
          className="input-field !w-auto text-sm"
        >
          <option value="">All job types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('-', ' ')}
            </option>
          ))}
        </select>
        <select
          value={workMode}
          onChange={(e) => updateFilter('workMode', e.target.value)}
          className="input-field !w-auto text-sm"
        >
          <option value="">All work modes</option>
          {WORK_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={experienceLevel}
          onChange={(e) => updateFilter('experienceLevel', e.target.value)}
          className="input-field !w-auto text-sm"
        >
          <option value="">All experience levels</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {(jobType || workMode || experienceLevel || search || location) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-amber-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading jobs" />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs match your search"
          description="Try removing a filter or searching a broader term."
        />
      ) : (
        <>
          <p className="text-sm text-slate-600 mb-4">{pagination?.total} jobs found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-sm text-sm font-medium ${
                    p === pagination.page
                      ? 'bg-ink-900 text-paper'
                      : 'bg-slate-50 text-ink-900 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobListingsPage;
