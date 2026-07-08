import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn--primary">+ New Product</Link>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <Link to={`/admin/products/${p._id}/edit`}>Edit</Link>{' '}
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsListPage;
