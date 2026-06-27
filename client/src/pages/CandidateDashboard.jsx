import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi, userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState } from '../components/Feedback';
import StatusPipeline from '../components/StatusPipeline';
import toast from 'react-hot-toast';

const TABS = { APPLICATIONS: 'applications', PROFILE: 'profile' };

const CandidateDashboard = () => {
  const { user, updateUserInState } = useAuth();
  const [tab, setTab] = useState(TABS.APPLICATIONS);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    headline: user?.candidateProfile?.headline || '',
    bio: user?.candidateProfile?.bio || '',
    skills: (user?.candidateProfile?.skills || []).join(', '),
    experienceYears: user?.candidateProfile?.experienceYears || '',
    location: user?.candidateProfile?.location || '',
    phone: user?.candidateProfile?.phone || '',
    linkedinUrl: user?.candidateProfile?.linkedinUrl || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await applicationApi.getMine();
        setApplications(data.applications);
      } catch (err) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await userApi.updateProfile({
        candidateProfile: {
          ...profile,
          skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
          experienceYears: profile.experienceYears ? Number(profile.experienceYears) : undefined,
        },
      });
      updateUserInState(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const { data } = await userApi.uploadResume(formData);
      updateUserInState(data.user);
      setResumeFile(null);
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold">Welcome, {user?.name?.split(' ')[0]}</h1>

      <div className="flex gap-6 mt-6 border-b border-slate-100">
        {Object.values(TABS).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? 'border-ink-900 text-ink-900' : 'border-transparent text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === TABS.APPLICATIONS && (
        <div className="mt-8">
          {loading ? (
            <Spinner label="Loading applications" />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Once you apply to a job, you'll be able to track its status here."
              action={
                <Link to="/jobs" className="btn-primary">
                  Browse jobs
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="font-display text-lg font-semibold hover:text-amber-600"
                      >
                        {app.job?.title || 'Job removed'}
                      </Link>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {app.job?.companyName} · {app.job?.location}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-5">
                    <StatusPipeline status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === TABS.PROFILE && (
        <div className="mt-8 max-w-xl">
          <div className="card p-6 mb-6">
            <h3 className="font-medium mb-3">Resume</h3>
            {user?.candidateProfile?.resumeUrl && (
              <p className="text-sm text-slate-600 mb-3">
                Current resume:{' '}
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${user.candidateProfile.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  View uploaded resume
                </a>
              </p>
            )}
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="text-sm flex-1"
              />
              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || uploadingResume}
                className="btn-outline !px-4 !py-2 text-sm"
              >
                {uploadingResume ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="card p-6 space-y-4">
            <h3 className="font-medium">Profile details</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Headline</label>
              <input
                name="headline"
                value={profile.headline}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                rows={4}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Skills (comma separated)</label>
              <input
                name="skills"
                value={profile.skills}
                onChange={handleProfileChange}
                className="input-field"
                placeholder="React, Node.js, SQL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Years of experience</label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  value={profile.experienceYears}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Location</label>
                <input
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">LinkedIn URL</label>
              <input
                name="linkedinUrl"
                value={profile.linkedinUrl}
                onChange={handleProfileChange}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
