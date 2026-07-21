import { X } from '@phosphor-icons/react';
import PageRenderer from '../../../blocks/registry/PageRenderer.jsx';
import './PagePreviewModal.css';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Reuses the exact same PageRenderer the live storefront uses, so
// visibility-filtering and the testimonial+newsletter pairing behave
// identically here - zero risk of the preview drifting from what
// visitors actually see once published.
function PagePreviewModal({ page, onClose }) {
  const { t } = useLang();
  return (
    <div className="page-preview-modal">
      <div className="page-preview-modal__bar">
        <span className="page-preview-modal__label">{t('Draft Preview')} - {page.title}</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('Close preview')}>
          <X size={20} />
        </button>
      </div>
      <div className="page-preview-modal__frame">
        <PageRenderer blocks={page.blocks} />
      </div>
    </div>
  );
}

export default PagePreviewModal;
