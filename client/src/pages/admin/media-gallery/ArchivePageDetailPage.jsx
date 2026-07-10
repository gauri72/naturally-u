import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, PencilSimple, Trash, Rows, SquaresFour, Image } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { getArchivePage, updateArchivePage, addSection, deleteSection } from '../../../api/archive.api';
import './ArchivePageDetailPage.css';

function ArchivePageDetailPage() {
  const { pageSlug } = useParams();
  const [page, setPage] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [view, setView] = useState('gallery');

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
      </div>
      <div className="admin-field" style={{ maxWidth: 480, marginBottom: 'var(--space-xl)' }}>
        <label>Source URL</label>
        <input
          defaultValue={page.sourceUrl}
          onBlur={(e) => handleFieldBlur('sourceUrl', e.target.value)}
        />
      </div>

      <div className="admin-page-header" style={{ marginBottom: 'var(--space-md)' }}>
        <h3>Sections</h3>
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

      {view === 'gallery' ? (
        <div className="admin-grid">
          {sections.map((s) => (
            <div key={s._id} className="admin-card archive-detail__gallery-card">
              {s.images[0] ? (
                <img src={s.images[0].url} alt={s.name} className="archive-detail__gallery-thumb" />
              ) : (
                <div className="archive-detail__gallery-thumb archive-detail__gallery-thumb--empty">
                  <Image size={28} />
                </div>
              )}
              <h4>{s.name}</h4>
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
                <th>Images</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td className="is-truncated">{s.content}</td>
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
    </div>
  );
}

export default ArchivePageDetailPage;
