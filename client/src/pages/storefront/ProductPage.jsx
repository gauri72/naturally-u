import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  CaretDown,
  ShieldCheck,
  Truck,
  ArrowUUpLeft,
  Sparkle,
  Leaf,
} from '@phosphor-icons/react';
import { getProductBySlug } from '../../api/products.api';
import { getPageBySlug } from '../../api/pages.api';
import { useCart } from '../../context/CartContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './ProductPage.css';

// The product's own name/price/description/images are data-driven; the
// surrounding editorial copy (eyebrow, usage tips, shipping/returns
// blurbs, disclaimer) is shared across every product and comes from the
// 'product-template' CMS page (/admin/pages/product-template).

function AccordionSection({ id, icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="product-page__accordion-item">
      <button
        type="button"
        className="product-page__accordion-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="product-page__accordion-label">
          {icon}
          {title}
        </span>
        <CaretDown weight="bold" className={`product-page__accordion-caret ${open ? 'is-open' : ''}`} />
      </button>
      <div id={id} className={`product-page__accordion-panel ${open ? 'is-open' : ''}`}>
        <div className="product-page__accordion-panel-inner">{children}</div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { t } = useLang();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [content, setContent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedImage(0);
    getProductBySlug(slug).then((res) => setProduct(res.data)).catch(console.error);
  }, [slug]);

  useEffect(() => {
    getPageBySlug('product-template')
      .then((res) => setContent(res.data.blocks.find((b) => b.blockType === 'productPageContent')?.props || {}))
      .catch(console.error);
  }, []);

  if (!product || !content) return <p className="page-loading">{t('Loading…')}</p>;

  const images = product.images || [];
  const usageByTag = content.usageByTag || [];
  const primaryTag = (product.tags || []).find((t) => usageByTag.some((u) => u.tag === t));
  const usage = usageByTag.find((u) => u.tag === primaryTag)?.text || content.defaultUsage;
  const inStock = product.stock > 0;

  return (
    <section className="product-page">
      <div className="product-page__gallery">
        <div className="product-page__main-image-wrap">
          <img
            className="product-page__main-image"
            src={images[selectedImage]?.url}
            alt={images[selectedImage]?.alt || product.name}
          />
          <Leaf size={34} weight="regular" className="product-page__image-badge" aria-hidden="true" />
        </div>
        {images.length > 1 && (
          <div className="product-page__thumbs">
            {images.map((img, i) => (
              <button
                key={img._id || img.url}
                type="button"
                className={`product-page__thumb ${i === selectedImage ? 'is-selected' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img src={img.url} alt={img.alt || product.name} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-page__details">
        <span className="product-page__eyebrow">
          <Sparkle size={14} weight="fill" /> {t(content.eyebrow)}
        </span>
        <h1>{t(product.name)}</h1>
        {product.shortDescription && <p className="product-page__tagline">{t(product.shortDescription)}</p>}

        <div className="product-page__buy-box">
          <div className="product-page__price-row">
            <p className="product-page__price">€{product.price.toFixed(2)}</p>
            <span className={`product-page__stock ${inStock ? 'is-in-stock' : 'is-out-of-stock'}`}>
              {inStock ? t('In stock') : t('Out of stock')}
            </span>
          </div>
          <p className="product-page__tax-note">{t('Sales tax included.')}</p>
          <button
            className="btn btn--primary product-page__add-btn"
            onClick={() => addItem(product)}
            disabled={!inStock}
          >
            {inStock ? t('Add to Cart') : t('Out of Stock')}
          </button>
        </div>

        <p className="product-page__description">{t(product.description)}</p>

        <div className="product-page__accordions">
          <AccordionSection
            id="product-info"
            icon={<Sparkle size={18} weight="regular" />}
            title={t('Product Info')}
            defaultOpen
          >
            <dl className="product-page__info-list">
              <div>
                <dt>{t('Made')}</dt>
                <dd>{t(content.madeText)}</dd>
              </div>
              <div>
                <dt>{t('Ingredients')}</dt>
                <dd>
                  {product.ingredients?.length > 0 ? (
                    <ul className="product-page__ingredients">
                      {product.ingredients.map((ingredient) => (
                        <li key={ingredient}>{t(ingredient)}</li>
                      ))}
                    </ul>
                  ) : (
                    t('See product description above')
                  )}
                </dd>
              </div>
              <div>
                <dt>{t('Free from')}</dt>
                <dd>{t(content.freeFromText)}</dd>
              </div>
            </dl>
          </AccordionSection>

          <AccordionSection
            id="how-to-use"
            icon={<Leaf size={18} weight="regular" />}
            title={t('How to Use')}
          >
            <p>{t(usage)}</p>
          </AccordionSection>

          <AccordionSection
            id="shipping-info"
            icon={<Truck size={18} weight="regular" />}
            title={t('Shipping Info')}
          >
            <p>{t(content.shippingBlurb)}</p>
            <Link to="/shipping-returns" className="product-page__accordion-link">
              {t('Full shipping details →')}
            </Link>
          </AccordionSection>

          <AccordionSection
            id="returns-policy"
            icon={<ArrowUUpLeft size={18} weight="regular" />}
            title={t('Return & Refund Policy')}
          >
            <p>{t(content.returnsBlurb)}</p>
            <Link to="/contact" className="product-page__accordion-link">
              {t('Contact us →')}
            </Link>
          </AccordionSection>
        </div>

        <div className="product-page__disclaimer">
          <ShieldCheck size={20} weight="regular" className="product-page__disclaimer-icon" aria-hidden="true" />
          <p>{t(content.disclaimerText)}</p>
        </div>
      </div>
    </section>
  );
}

export default ProductPage;
