import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const LOGO_SRC = 'https://omrania10.figma.site/assets/omrania2_logo-D25BDk5f.png';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Brands & Partners', href: '/brands' },
  { label: 'Projects', href: '/projects' },
  { label: 'Accreditations', href: '/accreditations' },
  { label: 'Contact Us', href: '/contact' },
];

function navTo(href, pathname) {
  if (href.startsWith('#') && pathname !== '/') return `/${href}`;
  return href;
}

function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} dir="ltr">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <img className="site-header__logo" src={LOGO_SRC} alt="Al Omrania" />
        </div>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} className="site-header__link" to={navTo(item.href, pathname)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <button className="site-header__icon-btn" type="button" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <span className="site-header__lang">EN</span>
          <Link className="site-header__quote" to="/quote">
            Request a Quote
          </Link>
          <button
            className="site-header__menu-btn"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="site-header__mobile-nav" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              className="site-header__link"
              to={navTo(item.href, pathname)}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
