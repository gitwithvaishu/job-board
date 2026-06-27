import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobApi } from '../api/endpoints';
import { Spinner } from '../components/Feedback';
import toast from 'react-hot-toast';

const initialForm = {
  title: '',
  description: '',
  responsibilities: '',
  requirements: '',
  skills: '',
  location: '',
  jobType: 'full-time',
  workMode: 'onsite',
  experienceLevel: 'entry',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  applicationDeadline: '',
};

const PostJobPage = () => {
  const { id } = useParams(); // present only when editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchJob = async () => {
      try {
        const { data } = await jobApi.getById(id);
        const job = data.job;
        setForm({
          title: job.title || '',
          description: job.description || '',
          responsibilities: (job.responsibilities || []).join('\n'),
          requirements: (job.requirements || []).join('\n'),
          skills: (job.skills || []).join(', '),
          location: job.location || '',
          jobType: job.jobType || 'full-time',
          workMode: job.workMode || 'onsite',
          experienceLevel: job.experienceLevel || 'entry',
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          currency: job.currency || 'USD',
          applicationDeadline: job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().slice(0, 10)
            : '',
        });
      } catch {
        toast.error('Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, isEditMode]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      responsibilities: form.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    };

    try {
      if (isEditMode) {
        await jobApi.update(id, payload);
        toast.success('Job updated');
      } else {
        await jobApi.create(payload);
        toast.success('Job posted');
      }
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading job" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">
        {isEditMode ? 'Edit job posting' : 'Post a new job'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Job title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            name="description"
            required
            rows={5}
            value={form.description}
            onChange={handleChange}
            className="input-field resize-none"
            placeholder="Describe the role..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Responsibilities <span className="text-slate-400 font-normal">(one per line)</span>
          </label>
          <textarea
            name="responsibilities"
            rows={4}
            value={form.responsibilities}
            onChange={handleChange}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Requirements <span className="text-slate-400 font-normal">(one per line)</span>
          </label>
          <textarea
            name="requirements"
            rows={4}
            value={form.requirements}
            onChange={handleChange}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="input-field"
            placeholder="React, Node.js, MongoDB"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location</label>
          <input
            name="location"
            required
            value={form.location}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Remote, or New York, NY"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Job type</label>
            <select name="jobType" value={form.jobType} onChange={handleChange} className="input-field">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Work mode</label>
            <select name="workMode" value={form.workMode} onChange={handleChange} className="input-field">
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Experience</label>
            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="input-field"
            >
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Min salary</label>
            <input
              type="number"
              name="salaryMin"
              value={form.salaryMin}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Max salary</label>
            <input
              type="number"
              name="salaryMax"
              value={form.salaryMax}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Currency</label>
            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Application deadline <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="applicationDeadline"
            value={form.applicationDeadline}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-accent w-full">
          {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Post job'}
        </button>
      </form>
    </div>
  );
};

export default PostJobPage;
