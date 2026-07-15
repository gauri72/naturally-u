import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, PencilSimple, Trash, ArrowSquareOut, X } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { listPages, createPage, deletePage } from '../../../api/pages.api';
import './BlockEditorPanel.css'; // reuse the modal overlay/panel styling

// Storefront path for a page slug ('home' is the site root).
const storefrontPath = (slug) => (slug === 'home' ? '/' : `/${slug}`);

// title -> url-safe slug (lowercased, non-alphanumerics collapsed to hyphens)
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function CreatePageModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleTitleChange = (e) => {
    const next = e.target.value;
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanSlug = slugify(slug);
    if (!title.trim() || !cleanSlug) {
      toast.error('Title and slug are required');
      return;
    }
    setSubmitting(true);
    try {
      await createPage({ slug: cleanSlug, title: title.trim() });
      toast.success('Page created');
      onCreated();
      navigate(`/admin/pages/${cleanSlug}`); // jump straight into the builder
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create page');
      setSubmitting(false);
    }
  };

  return (
    <div className="block-editor-panel__overlay" onClick={onClose}>
      <div className="block-editor-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-page-header" style={{ marginBottom: 'var(--space-md)' }}>
          <h3>New Page</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
          <div className="admin-field">
            <label htmlFor="new-page-title">Title</label>
            <input
              id="new-page-title"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Our Ingredients"
              autoFocus
            />
          </div>
          <div className="admin-field">
            <label htmlFor="new-page-slug">Slug (URL)</label>
            <input
              id="new-page-slug"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="our-ingredients"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Published at <code>{storefrontPath(slugify(slug) || 'slug')}</code>
            </span>
          </div>
          <div className="block-editor-panel__actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create & Edit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    listPages()
      .then((res) => setPages(res.data))
      .catch(() => toast.error('Failed to load pages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (page) => {
    if (page.slug === 'home') {
      toast.error('The home page cannot be deleted');
      return;
    }
    if (!window.confirm(`Delete the "${page.title}" page? This removes all its blocks and cannot be undone.`)) return;
    try {
      await deletePage(page.slug);
      toast.success('Page deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete page');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Pages</h1>
        <div className="admin-page-header__actions">
          <button className="btn btn--primary" onClick={() => setCreating(true)}>
            <Plus size={16} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
            New Page
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', maxWidth: 620 }}>
        Every page here is built from blocks — drag to reorder, edit content, and publish, just like the
        homepage. Create a new page and it becomes reachable on the storefront at its slug once published.
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Slug</th><th>Status</th><th>Last updated</th><th></th></tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page._id || page.slug}>
                <td>
                  <Link
                    to={`/admin/pages/${page.slug}`}
                    style={{ fontWeight: 600, color: 'var(--color-text)' }}
                  >
                    {page.title}
                  </Link>
                </td>
                <td><code>{page.slug}</code></td>
                <td>
                  <span className={`badge ${page.status === 'published' ? 'badge--success' : 'badge--neutral'}`}>
                    {page.status}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                  {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/admin/pages/${page.slug}`} className="icon-btn" title="Edit in page builder">
                      <PencilSimple size={18} />
                    </Link>
                    {page.status === 'published' && (
                      <a
                        href={storefrontPath(page.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        title="View live page"
                      >
                        <ArrowSquareOut size={18} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(page)}
                      className="icon-btn icon-btn--danger"
                      title={page.slug === 'home' ? 'The home page cannot be deleted' : 'Delete page'}
                      disabled={page.slug === 'home'}
                      style={page.slug === 'home' ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && pages.length === 0 && (
          <div className="admin-empty-state">
            <p>No pages yet. Create your first one.</p>
          </div>
        )}
      </div>

      {creating && (
        <CreatePageModal
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

export default PagesListPage;
