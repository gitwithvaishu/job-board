import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center">
    <h1 className="font-display text-4xl font-semibold">404</h1>
    <p className="text-slate-600 mt-2">This page doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6 inline-block">
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
