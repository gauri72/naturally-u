import { useEffect, useState } from 'react';
import { EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { submitContactMessage } from '../../api/contact.api';
import { getPageBySlug } from '../../api/pages.api';
import PageHeroBlock from '../../blocks/PageHeroBlock/PageHeroBlock.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './ContactPage.css';

// Hero copy + contact info come from the 'contact' CMS page
// (/admin/pages/contact); the form itself stays fully functional/code-driven.
function ContactPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('contact')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[ContactPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success(t("Message sent! We'll get back to you soon."));
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error(t('Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p className="page-error">{t(error)}</p>;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};
  const content = page.blocks.find((b) => b.blockType === 'contactPageContent')?.props || {};
  const telHref = content.phone ? `tel:${content.phone.replace(/[^\d+]/g, '')}` : undefined;

  return (
    <section className="contact-page">
      <PageHeroBlock variant="contact" heading={hero.heading} subtext={hero.subtext} />

      <div className="contact-page__layout">
        <div className="contact-page__info">
          <div className="contact-page__info-card">
            <EnvelopeSimple size={24} weight="regular" />
            <div>
              <h3>{t('Email')}</h3>
              <a href={`mailto:${content.email}`}>{content.email}</a>
            </div>
          </div>
          <div className="contact-page__info-card">
            <Phone size={24} weight="regular" />
            <div>
              <h3>{t('Phone')}</h3>
              <a href={telHref}>{content.phone}</a>
            </div>
          </div>
          <div className="contact-page__info-card">
            <MapPin size={24} weight="regular" />
            <div>
              <h3>{t('Location')}</h3>
              <p>{t(content.location)}</p>
            </div>
          </div>
        </div>

        <form className="contact-page__form" onSubmit={handleSubmit}>
          <label>
            {t('Name')}
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            {t('Email')}
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            {t('Message')}
            <textarea name="message" rows={5} value={form.message} onChange={handleChange} required />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? t('Sending…') : t('Send Message')}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;
