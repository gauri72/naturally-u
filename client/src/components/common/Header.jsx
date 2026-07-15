import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ShoppingBag, X } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import desktopLogo from '../../assets/images/home/desktop-header-logo.png';
import mobileLogo from '../../assets/images/home/mobile-header-logo.png';
import './Header.css';

const navLinks = [
  { label: 'Shop', path: '/shop' },
  { label: 'Gift Sets', path: '/gift-sets' },
  { label: 'About', path: '/about-the-maker' },
  { label: 'Workshops', path: '/workshops' },
  { label: 'Contact', path: '/contact' },
];

function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Site-wide search (products + CMS pages), not just the shop catalog
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <button
          className={`site-header__menu-toggle ${menuOpen ? 'site-header__menu-toggle--open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="site-header__logo" onClick={() => setMenuOpen(false)}>
          <img
            src={desktopLogo}
            alt="NaturallyU"
            className="site-header__logo-img site-header__logo-img--desktop"
          />
          <img
            src={mobileLogo}
            alt="NaturallyU"
            className="site-header__logo-img site-header__logo-img--mobile"
          />
        </Link>

        <nav className={`site-header__nav ${menuOpen ? 'site-header__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          {searchOpen ? (
            <form className="site-header__search-form" onSubmit={handleSearchSubmit}>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search the site…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className="site-header__icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} weight="bold" />
              </button>
            </form>
          ) : (
            <button className="site-header__icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <MagnifyingGlass size={20} weight="regular" />
            </button>
          )}
          <Link to="/cart" className="site-header__icon-btn site-header__cart" aria-label="Cart">
            <ShoppingBag size={20} weight="regular" />
            {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
