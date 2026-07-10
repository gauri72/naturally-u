import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { getProducts, deleteProduct } from '../../../api/products.api';
import toast from 'react-hot-toast';

function ProductsListPage() {
  const [products, setProducts] = useState([]);

  const load = () => getProducts({ limit: 100 }).then((res) => setProducts(res.data.products));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    toast.success('Product deactivated');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products</h1>
        <div className="admin-page-header__actions">
          <Link to="/admin/products/new" className="btn btn--primary">
            <Plus size={16} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
            New Product
          </Link>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>€{p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.stock > 0 ? 'badge--success' : 'badge--neutral'}`}>
                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {' '}
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{p.stock}</span>
                </td>
                <td>
                  <Link to={`/admin/products/${p._id}/edit`} className="icon-btn" title="Edit">
                    <PencilSimple size={18} />
                  </Link>
                  <button onClick={() => handleDelete(p._id)} className="icon-btn icon-btn--danger" title="Delete">
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="admin-empty-state">
            <p>No products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsListPage;
