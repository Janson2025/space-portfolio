import { Link, useLocation } from 'react-router-dom';

export function Footer() {
  const { pathname } = useLocation();
  return (
    <footer className={`footer${pathname === '/explore' ? ' footer-explore' : ''}`}>
      <Link className="brand" to="/">
        <span className="brand-mark">J<span>/</span></span>
        <span className="brand-name">JAMES<span>PORTFOLIO</span></span>
      </Link>
      <span>SOFTWARE ENGINEER · WEB DEVELOPER · 3D MAKER</span>
      <span>© 2026 JAMES PORTFOLIO</span>
    </footer>
  );
}
