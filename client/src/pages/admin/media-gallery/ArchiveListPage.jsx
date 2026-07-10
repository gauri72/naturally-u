import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listArchivePages } from '../../../api/archive.api';

function ArchiveListPage() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    listArchivePages().then((res) => setPages(res.data));
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Archive</h1>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
        Legacy pages from the old naturallyu.nl website.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Original URL</th>
              <th>Sections</th>
              <th>Images</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>
                  <a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceUrl}</a>
                </td>
                <td>{p.sectionCount}</td>
                <td>{p.imageCount}</td>
                <td>
                  <Link to={`/admin/media-gallery/archive/${p.slug}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ArchiveListPage;
