import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, PencilSimple, Trash, Rows, SquaresFour, Image,
  BookOpen, X, ArrowSquareOut, MagnifyingGlass,
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { getArchivePage, updateArchivePage, addSection, deleteSection } from '../../../api/archive.api';
import './ArchivePageDetailPage.css';

// Small badges surfacing a section's structured meta (price/stock for the
// old product grid, language for non-English testimonials, etc.)
function MetaBadges({ meta }) {
  if (!meta) return null;
  return (
    <>
      {meta.price && <span className="badge badge--neutral">{meta.price}</span>}
      {typeof meta.inStock === 'boolean' && (
        <span className={`badge ${meta.inStock ? 'badge--success' : 'badge--neutral'}`}>
          {meta.inStock ? 'In stock' : 'Out of stock'}
        </span>
      )}
      {meta.language && <span className="badge badge--neutral">{meta.language}</span>}
    </>
  );
}

// Full-screen, document-style reader: the archived page's sections in
// order, with their photos - the closest thing to re-reading the old page.
function ArchivePagePreview({ page, sections, onClose }) {
  return (
    <div className="archive-preview">
      <div className="archive-preview__bar">
        <span className="archive-preview__bar-label">
          <BookOpen size={18} weight="regular" /> Archived page — {page.title}
        </span>
        <a href={page.sourceUrl} target="_blank" rel="noreferrer" className="archive-preview__bar-source">
          <ArrowSquareOut size={14} /> {page.sourceUrl}
        </a>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close preview">
          <X size={20} />
        </button>
      </div>
      <div className="archive-preview__scroll">
        <article className="archive-preview__doc">
          <h1>{page.title}</h1>
          {sections.map((s) => (
            <section key={s._id} className="archive-preview__section">
              <h2>{s.name}</h2>
              <div className="archive-preview__badges"><MetaBadges meta={s.meta} /></div>
              {s.content && s.content.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {s.images.length > 0 && (
                <div className="archive-preview__images">
                  {[...s.images].sort((a, b) => a.order - b.order).map((img) => (
                    <figure key={img._id}>
                      <img src={img.url} alt={img.caption || s.name} loading="lazy" />
                      {img.caption && <figcaption>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function ArchivePageDetailPage() {
  const { pageSlug } = useParams();
  const [page, setPage] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [view, setView] = useState('gallery');
  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = () => getArchivePage(pageSlug).then((res) => setPage(res.data));

  useEffect(() => { load(); }, [pageSlug]);

  const handleFieldBlur = async (field, value) => {
    if (!page || page[field] === value) return;
    await updateArchivePage(pageSlug, { [field]: value });
    toast.success('Saved');
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    await addSection(pageSlug, { name: newSectionName.trim() });
    setNewSectionName('');
    toast.success('Section added');
    load();
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and its images?')) return;
    await deleteSection(pageSlug, sectionId);
    toast.success('Section deleted');
    load();
  };

  if (!page) return <p>Loading...</p>;

  const sections = [...page.sections].sort((a, b) => a.order - b.order);
  const query = search.trim().toLowerCase();
  const visibleSections = query
    ? sections.filter((s) => `${s.name} ${s.content}`.toLowerCase().includes(query))
    : sections;

  return (
    <div>
      <Link to="/admin/media-gallery/archive" className="admin-page-header__back">
        <ArrowLeft size={14} weight="bold" /> Archive
      </Link>
      <div className="admin-page-header">
        <input
          defaultValue={page.title}
          onBlur={(e) => handleFieldBlur('title', e.target.value)}
          className="archive-detail__title-input"
        />
        <div className="admin-page-header__actions">
          <button type="button" className="btn btn--secondary" onClick={() => setPreviewOpen(true)}>
            <BookOpen size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Read Page
          </button>
        </div>
      </div>
      <div className="admin-field" style={{ maxWidth: 480, marginBottom: 'var(--space-xl)' }}>
        <label>Source URL</label>
        <input
          defaultValue={page.sourceUrl}
          onBlur={(e) => handleFieldBlur('sourceUrl', e.target.value)}
        />
      </div>

      <div className="admin-page-header" style={{ marginBottom: 'var(--space-md)' }}>
        <h3>Sections <span className="archive-detail__count">({visibleSections.length}{query ? ` of ${sections.length}` : ''})</span></h3>
        <div className="archive-detail__tools">
          <div className="archive-detail__search">
            <MagnifyingGlass size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections…"
            />
          </div>
          <div className="archive-detail__view-toggle">
            <button
              type="button"
              className={`icon-btn ${view === 'gallery' ? 'is-active' : ''}`}
              onClick={() => setView('gallery')}
              title="Gallery view"
            >
              <SquaresFour size={18} />
            </button>
            <button
              type="button"
              className={`icon-btn ${view === 'table' ? 'is-active' : ''}`}
              onClick={() => setView('table')}
              title="Table view"
            >
              <Rows size={18} />
            </button>
          </div>
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <div className="admin-empty-state">
          <MagnifyingGlass size={32} />
          <p>No sections match “{search}”.</p>
        </div>
      ) : view === 'gallery' ? (
        <div className="admin-grid">
          {visibleSections.map((s) => (
            <div key={s._id} className="admin-card archive-detail__gallery-card">
              {s.images[0] ? (
                <img src={s.images[0].url} alt={s.name} className="archive-detail__gallery-thumb" />
              ) : (
                <div className="archive-detail__gallery-thumb archive-detail__gallery-thumb--empty">
                  <Image size={28} />
                </div>
              )}
              <h4>{s.name}</h4>
              <div className="archive-detail__gallery-badges"><MetaBadges meta={s.meta} /></div>
              <p className="archive-detail__gallery-snippet">{s.content}</p>
              <div className="archive-detail__gallery-actions">
                <span className="badge badge--neutral">{s.images.length} image{s.images.length === 1 ? '' : 's'}</span>
                <div>
                  <Link to={`/admin/media-gallery/archive/${pageSlug}/sections/${s._id}`} className="icon-btn" title="Edit">
                    <PencilSimple size={18} />
                  </Link>
                  <button onClick={() => handleDeleteSection(s._id)} className="icon-btn icon-btn--danger" title="Delete">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Content preview</th>
                <th>Meta</th>
                <th>Images</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleSections.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td className="is-truncated">{s.content}</td>
                  <td><MetaBadges meta={s.meta} /></td>
                  <td>{s.images.length}</td>
                  <td>
                    <Link to={`/admin/media-gallery/archive/${pageSlug}/sections/${s._id}`} className="icon-btn" title="Edit">
                      <PencilSimple size={18} />
                    </Link>
                    <button onClick={() => handleDeleteSection(s._id)} className="icon-btn icon-btn--danger" title="Delete">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleAddSection} className="archive-detail__add-form">
        <input
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name"
        />
        <button type="submit" className="btn btn--primary btn--sm">
          <Plus size={14} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
          Add Section
        </button>
      </form>

      {previewOpen && (
        <ArchivePagePreview page={page} sections={sections} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

export default ArchivePageDetailPage;
