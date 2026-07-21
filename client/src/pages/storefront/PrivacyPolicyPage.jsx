import { useEffect, useState } from 'react';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import './LegalPage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

// CMS-driven: fetch the 'privacy-policy' Page document (ordered blocks) and
// hand it to PageRenderer. To edit this page's content, use
// /admin/pages/privacy-policy - no code changes needed.
function PrivacyPolicyPage() {
  const { t } = useLang();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('privacy-policy')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[PrivacyPolicyPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{t(error)}</p>;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  return (
    <section className="shop-page legal-page">
      <PageRenderer blocks={page.blocks} />
    </section>
  );
}

export default PrivacyPolicyPage;
