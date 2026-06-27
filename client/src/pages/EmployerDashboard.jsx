import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobApi, applicationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState } from '../components/Feedback';
import { STATUS_LABELS } from '../components/StatusPipeline';
import toast from 'react-hot-toast';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJobId, setActiveJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const fetchJobs = async () => {
    try {
      const { data } = await jobApi.getMine();
      setJobs(data.jobs);
    } catch {
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleViewApplicants = async (jobId) => {
    if (activeJobId === jobId) {
      setActiveJobId(null);
      return;
    }
    setActiveJobId(jobId);
    setLoadingApplicants(true);
    try {
      const { data } = await applicationApi.getForJob(jobId);
      setApplicants(data.applications);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      await applicationApi.updateStatus(applicationId, status);
      setApplicants((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
      );
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await jobApi.remove(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'published' ? 'closed' : 'published';
    try {
      const { data } = await jobApi.update(job._id, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? data.job : j)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {user?.employerProfile?.companyName || 'Your jobs'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">Manage your postings and applicants.</p>
        </div>
        <Link to="/employer/post-job" className="btn-accent">
          Post a job
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading your jobs" />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="You haven't posted any jobs yet"
            description="Post your first opening to start receiving applications."
            action={
              <Link to="/employer/post-job" className="btn-primary">
                Post a job
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{job.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-sm font-medium capitalize ${
                          job.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {job.location} · {job.applicationsCount} applicant
                      {job.applicationsCount === 1 ? '' : 's'} · {job.viewsCount} views
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewApplicants(job._id)}
                      className="btn-outline !px-3 !py-1.5 text-sm"
                    >
                      {activeJobId === job._id ? 'Hide applicants' : 'View applicants'}
                    </button>
                    <Link
                      to={`/employer/edit-job/${job._id}`}
                      className="btn-outline !px-3 !py-1.5 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className="btn-outline !px-3 !py-1.5 text-sm"
                    >
                      {job.status === 'published' ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-red-600 text-sm px-3 py-1.5 hover:bg-red-50 rounded-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {activeJobId === job._id && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    {loadingApplicants ? (
                      <Spinner label="Loading applicants" />
                    ) : applicants.length === 0 ? (
                      <p className="text-sm text-slate-600">No applicants yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {applicants.map((app) => (
                          <div
                            key={app._id}
                            className="flex items-center justify-between gap-3 flex-wrap bg-slate-50 p-3.5 rounded-sm"
                          >
                            <div>
                              <p className="font-medium text-sm">{app.candidate?.name}</p>
                              <p className="text-xs text-slate-600">{app.candidate?.email}</p>
                              {app.candidate?.candidateProfile?.skills?.length > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {app.candidate.candidateProfile.skills.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${app.resumeUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-600 text-sm font-medium hover:underline"
                              >
                                View resume
                              </a>
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                className="input-field !w-auto !py-1.5 text-sm"
                              >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
