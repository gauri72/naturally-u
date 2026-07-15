import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, FileText } from '@phosphor-icons/react';
import { searchSite } from '../../api/search.api';
import { getPageBySlug } from '../../api/pages.api';
import ProductCard from '../../components/product/ProductCard.jsx';
import './SearchPage.css';

// Storefront path for a CMS page slug ('home' is the site root).
const pagePath = (slug) => (slug === 'home' ? '/' : `/${slug}`);

// The eyebrow label and empty-state copy come from the 'search' CMS page
// (/admin/pages/search); the search results themselves stay fully
// data-driven (query-dependent text like "Results for X" stays code).
function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], pages: [] });
      return;
    }
    setLoading(true);
    searchSite(query)
      .then((res) => setResults(res.data))
      .catch(() => setResults({ products: [], pages: [] }))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    getPageBySlug('search')
      .then((res) => setContent(res.data.blocks.find((b) => b.blockType === 'searchPageContent')?.props || {}))
      .catch(console.error);
  }, []);

  const products = results?.products || [];
  const pages = results?.pages || [];
  const total = products.length + pages.length;

  return (
    <section className="search-page">
      <div className="search-page__header">
        <p className="search-page__eyebrow">{content?.eyebrow}</p>
        <h1>
          {query ? <>Results for <span>“{query}”</span></> : 'Search'}
        </h1>
        {!loading && query && (
          <p className="search-page__count">
            {total} {total === 1 ? 'result' : 'results'} across products and pages
          </p>
        )}
      </div>

      {loading ? (
        <p className="page-loading">Searching…</p>
      ) : total === 0 ? (
        <div className="search-page__empty">
          <MagnifyingGlass size={40} weight="regular" />
          <p>{query ? `No results found for “${query}”.` : content?.emptyPromptText}</p>
          <Link to="/shop" className="btn btn--secondary">{content?.browseAllLabel}</Link>
        </div>
      ) : (
        <>
          {pages.length > 0 && (
            <div className="search-page__section">
              <h2 className="search-page__section-title">Pages</h2>
              <ul className="search-page__pages">
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link to={pagePath(p.slug)} className="search-page__page-card">
                      <FileText size={22} weight="regular" className="search-page__page-icon" />
                      <div>
                        <h3>{p.title}</h3>
                        <p>{p.snippet}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {products.length > 0 && (
            <div className="search-page__section">
              <h2 className="search-page__section-title">Products</h2>
              <div className="search-page__grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SearchPage;
