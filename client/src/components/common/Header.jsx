import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MagnifyingGlass, User, ShoppingBag } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import desktopLogo from '../../assets/images/home/desktop-header-logo.png';
import mobileLogo from '../../assets/images/home/mobile-header-logo.png';
import './Header.css';

const navLinks = [
  { label: 'Shop', path: '/shop' },
  { label: 'Gift Sets', path: '/gift-sets' },
  { label: 'Ingredients', path: '/ingredients' },
  { label: 'About the Maker', path: '/about-the-maker' },
  { label: 'Workshops', path: '/workshops' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
            alt="Naturally You"
            className="site-header__logo-img site-header__logo-img--desktop"
          />
          <img
            src={mobileLogo}
            alt="Naturally You"
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
          <button className="site-header__icon-btn" aria-label="Search">
            <MagnifyingGlass size={20} weight="regular" />
          </button>
          <button className="site-header__icon-btn site-header__icon-btn--account" aria-label="Account">
            <User size={20} weight="regular" />
          </button>
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
