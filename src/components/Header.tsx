import { useState, type MouseEvent } from 'react';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
  onPlannedLink: () => void;
}

export function Header({ onPlannedLink }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handlePlannedLink(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setMenuOpen(false);
    onPlannedLink();
  }

  return (
    <header className="topbar">
      <NavLink className="brand" to="/" aria-label="James Portfolio home" onClick={() => setMenuOpen(false)}>
        <span className="brand-mark">J<span>/</span></span>
        <span className="brand-name">JAMES<span>PORTFOLIO</span></span>
      </NavLink>

      <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/projects" onClick={() => setMenuOpen(false)}>Projects</NavLink>
        <a className="nav-link" href="#journal" onClick={handlePlannedLink}>Blog</a>
        <a className="nav-link" href="#about" onClick={handlePlannedLink}>About</a>
        <a className="nav-link" href="#store" onClick={handlePlannedLink}>Store</a>
      </nav>

      <a className="contact-link" href="mailto:callajames2025@gmail.com">Let&apos;s talk <span>↗</span></a>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span></span><span></span>
      </button>
    </header>
  );
}
