const Footer = () => {
  return (
    <footer className="border-t border-slate-100 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-slate-600">
        <p className="font-display text-base text-ink-900">Hirewell</p>
        <p>&copy; {new Date().getFullYear()} Hirewell. Built for people doing the hiring and the looking.</p>
      </div>
    </footer>
  );
};

export default Footer;
