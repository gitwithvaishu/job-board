import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ initialSearch = '', initialLocation = '', large = false }) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-2 w-full ${large ? 'sm:gap-3' : ''}`}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Job title, skill, or company"
        className={`input-field flex-1 ${large ? '!py-3.5 !text-base' : ''}`}
        aria-label="Search jobs"
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className={`input-field sm:max-w-[220px] ${large ? '!py-3.5 !text-base' : ''}`}
        aria-label="Location"
      />
      <button type="submit" className={`btn-accent ${large ? '!py-3.5 !px-7' : ''}`}>
        Search
      </button>
    </form>
  );
};

export default SearchBar;
