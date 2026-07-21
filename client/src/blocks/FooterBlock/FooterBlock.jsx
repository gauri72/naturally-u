import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FacebookLogo, InstagramLogo, PinterestLogo, EnvelopeSimple, Phone, MapPin, CaretDown,
} from '@phosphor-icons/react';
import { getSettings } from '../../api/settings.api';
import { useLang } from '../../i18n/LanguageContext.jsx';
import footerStamp from '../../assets/images/home/footer-stamp.png';
import './FooterBlock.css';

const socialIcons = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  pinterest: PinterestLogo,
};

// Shop/Customer Care/Connect collapse into an accordion on mobile
// (closed by default) but always render fully expanded, non-interactive
// on desktop — see FooterBlock.css for how the breakpoint controls this
// off of the same `is-open` class.
function FooterSection({ title, sectionKey, openSection, onToggle, children }) {
  const isOpen = openSection === sectionKey;
  return (
    <div className="footer-block__col">
      <button
        type="button"
        className="footer-block__col-toggle"
        onClick={() => onToggle(sectionKey)}
        aria-expanded={isOpen}
      >
        {title}
        <CaretDown weight="bold" className={`footer-block__caret ${isOpen ? 'is-open' : ''}`} />
      </button>
      <div className={`footer-block__col-content ${isOpen ? 'is-open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

// Footer content is global (Settings model), not per-page block props,
// since it should stay consistent across every page. This block just
// renders whatever the admin has configured in Site Settings. The
// "Made with love / Handcrafted" stamp is fixed brand creative (same
// approach as Hero/GiftBanner/Testimonial) and only shows on desktop.
function FooterBlock() {
  const { t } = useLang();
  const [settings, setSettings] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    getSettings().then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  if (!settings) return null;

  const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));
  const social = settings.footer?.connect?.social || [];

  return (
    <footer className="footer-block">
      <div className="footer-block__grid">
        <div className="footer-block__col footer-block__col--brand">
          <div className="footer-block__brand-text">
            <h4>{settings.siteName}</h4>
            <p>{t('Handmade soaps & skin care crafted with nature’s goodness.')}</p>
            {social.length > 0 && (
              <div className="footer-block__social">
                {social.map((s) => {
                  const Icon = socialIcons[s.platform];
                  if (!Icon) return null;
                  return (
                    <a href={s.url} key={s.platform} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                      <Icon weight="fill" size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <img
            src={footerStamp}
            alt="Made with love, handcrafted"
            className="footer-block__stamp footer-block__stamp--mobile"
          />
        </div>

        <FooterSection title={t('Shop')} sectionKey="shop" openSection={openSection} onToggle={toggleSection}>
          <ul>
            {settings.footer?.shopLinks?.map((link) => (
              <li key={link.path}><Link to={link.path}>{t(link.label)}</Link></li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection title={t('Customer Care')} sectionKey="care" openSection={openSection} onToggle={toggleSection}>
          <ul>
            {settings.footer?.customerCareLinks?.map((link) => (
              <li key={link.path}><Link to={link.path}>{t(link.label)}</Link></li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection title={t('Connect')} sectionKey="connect" openSection={openSection} onToggle={toggleSection}>
          {settings.footer?.connect?.email && (
            <p className="footer-block__connect-line"><EnvelopeSimple size={16} /> {settings.footer.connect.email}</p>
          )}
          {settings.footer?.connect?.phone && (
            <p className="footer-block__connect-line"><Phone size={16} /> {settings.footer.connect.phone}</p>
          )}
          <p className="footer-block__connect-line"><MapPin size={16} /> {t('We ship worldwide')}</p>
        </FooterSection>

        <div className="footer-block__col footer-block__col--stamp">
          <img src={footerStamp} alt="Made with love, handcrafted" className="footer-block__stamp" />
        </div>
      </div>

      <div className="footer-block__bottom">
        <p className="footer-block__copyright">{t(settings.footer?.copyrightText)}</p>
      </div>
    </footer>
  );
}

export default FooterBlock;
