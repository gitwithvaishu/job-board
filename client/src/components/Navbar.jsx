import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';

  return (
    <header className="border-b border-slate-100 bg-paper sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Hirewell
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/jobs" className="hover:text-amber-600 transition-colors">
            Find jobs
          </Link>
          {user?.role === 'employer' && (
            <Link to="/employer/post-job" className="hover:text-amber-600 transition-colors">
              Post a job
            </Link>
          )}
          {user ? (
            <>
              <Link to={dashboardPath} className="hover:text-amber-600 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-outline !px-4 !py-2 text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-amber-600 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="block w-6 h-0.5 bg-ink-900 mb-1.5"></span>
          <span className="block w-6 h-0.5 bg-ink-900 mb-1.5"></span>
          <span className="block w-6 h-0.5 bg-ink-900"></span>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-slate-100 px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link to="/jobs" onClick={() => setMenuOpen(false)}>
            Find jobs
          </Link>
          {user?.role === 'employer' && (
            <Link to="/employer/post-job" onClick={() => setMenuOpen(false)}>
              Post a job
            </Link>
          )}
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-left">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
