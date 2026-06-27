import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [role, setRole] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ ...form, role });
      toast.success('Account created');
      navigate(role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="text-slate-600 text-sm mt-1">Join Hirewell as a candidate or employer.</p>

      <div className="flex gap-2 mt-6">
        <button
          type="button"
          onClick={() => setRole('candidate')}
          className={`flex-1 py-2.5 rounded-sm text-sm font-medium border ${
            role === 'candidate'
              ? 'bg-ink-900 text-paper border-ink-900'
              : 'border-slate-100 text-slate-600'
          }`}
        >
          I'm looking for a job
        </button>
        <button
          type="button"
          onClick={() => setRole('employer')}
          className={`flex-1 py-2.5 rounded-sm text-sm font-medium border ${
            role === 'employer'
              ? 'bg-ink-900 text-paper border-ink-900'
              : 'border-slate-100 text-slate-600'
          }`}
        >
          I'm hiring
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Jane Doe"
          />
        </div>
        {role === 'employer' && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Company name</label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="input-field"
              placeholder="Acme Inc."
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="input-field"
            placeholder="At least 6 characters"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-amber-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
