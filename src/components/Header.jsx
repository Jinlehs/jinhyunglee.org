import { useState } from "react";
import { Link } from "react-router-dom";
import { navLinks, site } from "../data/portfolio";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" to="/" onClick={closeMenu}>
          {site.name}
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
        </button>
        <nav
          id="site-nav"
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.href} to={link.href} onClick={closeMenu}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
