import renderInlineLinks from '../../utils/renderInlineLinks.jsx';
import '../../pages/storefront/LegalPage.css';

// Props: { heading, body }
// One titled prose section on the Privacy Policy / Terms pages. `body`
// paragraphs are blank-line separated.
function LegalSectionBlock({ heading, body }) {
  const paragraphs = body ? body.split(/\n{2,}/) : [];
  return (
    <div className="legal-page__section">
      {heading && <h3>{heading}</h3>}
      {paragraphs.map((p, i) => <p key={i}>{renderInlineLinks(p)}</p>)}
    </div>
  );
}

export default LegalSectionBlock;
