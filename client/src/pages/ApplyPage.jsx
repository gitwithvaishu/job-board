import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobApi, applicationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Feedback';
import toast from 'react-hot-toast';

const MAX_FILE_MB = 5;

const ApplyPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await jobApi.getById(id);
        setJob(data.job);
      } catch {
        toast.error('Job not found');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const hasProfileResume = !!user?.candidateProfile?.resumeUrl;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) {
      setResumeFile(null);
      return;
    }
    const validExt = ['.pdf', '.doc', '.docx'].some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!validExt) {
      setFileError('Please upload a PDF, DOC, or DOCX file');
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File must be smaller than ${MAX_FILE_MB}MB`);
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !hasProfileResume) {
      setFileError('Please upload a resume to apply');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      if (coverLetter) formData.append('coverLetter', coverLetter);

      await applicationApi.apply(id, formData);
      toast.success('Application submitted!');
      navigate('/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading" />;
  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p>Job not found.</p>
        <Link to="/jobs" className="text-amber-600 hover:underline">
          ← Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link to={`/jobs/${id}`} className="text-sm text-slate-600 hover:text-ink-900">
        ← Back to job
      </Link>

      <h1 className="font-display text-2xl font-semibold mt-3">Apply to {job.title}</h1>
      <p className="text-slate-600 text-sm mt-1">
        {job.companyName} · {job.location}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Resume</label>
          {hasProfileResume && !resumeFile && (
            <p className="text-sm text-slate-600 mb-2">
              We'll use the resume on your profile unless you upload a new one below.
            </p>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm border border-slate-100 rounded-sm p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-slate-50 file:text-sm file:font-medium hover:file:bg-slate-100"
          />
          {fileError && <p className="text-red-600 text-sm mt-1.5">{fileError}</p>}
          <p className="text-xs text-slate-400 mt-1.5">PDF, DOC, or DOCX. Max {MAX_FILE_MB}MB.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Cover letter <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            maxLength={3000}
            className="input-field resize-none"
            placeholder="Tell the employer why you're a good fit..."
          />
          <p className="text-xs text-slate-400 mt-1">{coverLetter.length}/3000</p>
        </div>

        <button type="submit" disabled={submitting} className="btn-accent w-full">
          {submitting ? 'Submitting...' : 'Submit application'}
        </button>
      </form>
    </div>
  );
};

export default ApplyPage;
