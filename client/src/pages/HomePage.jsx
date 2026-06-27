import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../api/endpoints';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import { Spinner, EmptyState } from '../components/Feedback';

const HomePage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await jobApi.getFeatured();
        setFeaturedJobs(data.jobs);
      } catch (err) {
        console.error('Failed to load featured jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink-900 text-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <p className="text-amber-500 text-sm font-medium tracking-wide uppercase mb-4">
            For people doing the hiring, and the looking
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold max-w-2xl leading-tight">
            Find work that fits. Find people who fit.
          </h1>
          <p className="text-slate-100/80 mt-4 max-w-xl text-lg">
            Hirewell connects employers and candidates with a job board built
            around clarity — no noise, no clutter, just the roles that matter.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar large />
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold">Featured openings</h2>
          <Link to="/jobs" className="text-sm font-medium text-amber-600 hover:underline">
            View all jobs →
          </Link>
        </div>

        {loading ? (
          <Spinner label="Loading featured jobs" />
        ) : featuredJobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            description="Check back soon, or be the first employer to post an opening."
            action={
              <Link to="/register" className="btn-primary">
                Post a job
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Dual CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-6">
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold">Hiring?</h3>
          <p className="text-slate-600 mt-2 text-sm">
            Post a role in minutes and track applicants from one dashboard.
          </p>
          <Link to="/register" className="btn-primary mt-5 inline-block">
            Post a job
          </Link>
        </div>
        <div className="card p-8">
          <h3 className="font-display text-xl font-semibold">Looking for work?</h3>
          <p className="text-slate-600 mt-2 text-sm">
            Build a profile once, apply everywhere, and track every application.
          </p>
          <Link to="/jobs" className="btn-outline mt-5 inline-block">
            Browse jobs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
