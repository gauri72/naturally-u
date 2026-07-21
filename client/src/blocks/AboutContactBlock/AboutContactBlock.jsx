import { MapPin, EnvelopeSimple, Phone, Leaf } from '@phosphor-icons/react';
import '../../pages/storefront/AboutMakerPage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

// Props: { heading, address, email, phone }
// The About the Maker page's "Want to know more? Write to us!" section.
function AboutContactBlock({ heading, address, email, phone }) {
  const { t } = useLang();
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;
  return (
    <div className="about-maker__contact">
      <div className="about-maker__contact-text">
        {heading && <h2>{t(heading)}</h2>}
        {address && (
          <div className="about-maker__contact-item">
            <MapPin size={20} weight="regular" />
            <span>{t(address)}</span>
          </div>
        )}
        {email && (
          <div className="about-maker__contact-item">
            <EnvelopeSimple size={20} weight="regular" />
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        )}
        {phone && (
          <div className="about-maker__contact-item">
            <Phone size={20} weight="regular" />
            <a href={telHref}>{phone}</a>
          </div>
        )}
      </div>
      <Leaf size={44} weight="regular" className="about-maker__contact-leaf" aria-hidden="true" />
    </div>
  );
}

export default AboutContactBlock;
