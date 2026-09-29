import { useEffect, useState } from 'react';
import {
  Plus, PencilSimple, Trash, ArrowCounterClockwise, MagnifyingGlass, ArrowLeft,
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct,
} from '../../../api/products.api';
import { uploadImage } from '../../../api/media.api';
import { useLang } from '../../../i18n/LanguageContext.jsx';
import './ShopProductsTab.css';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', image: '' };

const slugify = (str) => str
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

function ProductForm({ initial, onCancel, onSaved }) {
  const { t } = useLang();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial._id);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setField('image', res.data.url);
    } catch {
      toast.error(t('Upload failed'));
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: isEdit ? initial.slug : slugify(form.name),
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        images: form.image ? [{ url: form.image, alt: form.name }] : [],
      };
      if (isEdit) await updateProduct(initial._id, payload);
      else await createProduct(payload);
      toast.success(t('Product saved'));
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to save product'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-field">
        <label>{t('Name')}</label>
        <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
      </div>
      <div className="admin-field">
        <label>{t('Description')}</label>
        <textarea rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} required />
      </div>
      <div className="products-tab__row">
        <div className="admin-field">
          <label>{t('Price')}</label>
          <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
        </div>
        <div className="admin-field">
          <label>{t('Stock')}</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => setField('stock', e.target.value)} required />
        </div>
      </div>
      <div className="admin-field">
        <label>{t('Image')}</label>
        {form.image && <img src={form.image} alt="" className="products-tab__form-thumb" />}
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      <div className="products-tab__form-actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>{t('Cancel')}</button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? t('Saving…') : t('Save Product')}
        </button>
      </div>
    </form>
  );
}

// Plain add/modify/delete/restore CRUD for the products shown in the Shop
// page's Products carousel - lives inside BlockEditorPanel's "Products"
// tab for the shopProductGrid block. Each action here saves itself
// immediately via its own API call; independent of the drawer's own Save
// Changes button, which only ever saves the block's cosmetic props (see
// the Section Settings tab).
function ShopProductsTab() {
  const { t } = useLang();
  const [tab, setTab] = useState('active'); // 'active' | 'archived'
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    getProducts({ status: tab, search: search || undefined, limit: 100 })
      .then((res) => setProducts(res.data.products))
      .catch(() => toast.error(t('Failed to load products')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab, search]);

  const startAdd = () => { setEditing(null); setMode('add'); };

  const startEdit = async (product) => {
    try {
      const res = await getProductById(product._id);
      const p = res.data;
      setEditing({
        _id: p._id,
        slug: p.slug,
        name: p.name || '',
        description: p.description || '',
        price: p.price ?? '',
        stock: p.stock ?? '',
        image: p.images?.[0]?.url || '',
      });
      setMode('edit');
    } catch {
      toast.error(t('Failed to load product'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Delete this product?'))) return;
    try {
      await deleteProduct(id);
      toast.success(t('Product deactivated'));
      load();
    } catch {
      toast.error(t('Failed to delete product'));
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreProduct(id);
      toast.success(t('Product restored'));
      load();
    } catch {
      toast.error(t('Failed to restore product'));
    }
  };

  const handleSaved = () => {
    setMode('list');
    setEditing(null);
    load();
  };

  const cancelForm = () => {
    setMode('list');
    setEditing(null);
  };

  if (mode !== 'list') {
    return (
      <div className="products-tab">
        <button type="button" className="products-tab__back" onClick={cancelForm}>
          <ArrowLeft size={14} /> {t('Back to Products')}
        </button>
        <h4 className="products-tab__form-title">{mode === 'edit' ? t('Edit Product') : t('New Product')}</h4>
        <ProductForm
          initial={editing || EMPTY_FORM}
          onCancel={cancelForm}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  return (
    <div className="products-tab">
      <h4 className="products-tab__heading">{t('Products')}</h4>
      <div className="products-tab__toolbar">
        <div className="products-tab__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'active'}
            className={`products-tab__tab ${tab === 'active' ? 'is-active' : ''}`}
            onClick={() => setTab('active')}
          >
            {t('Active')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'archived'}
            className={`products-tab__tab ${tab === 'archived' ? 'is-active' : ''}`}
            onClick={() => setTab('archived')}
          >
            {t('Archived')}
          </button>
        </div>
        <div className="products-tab__search">
          <MagnifyingGlass size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search products…')}
          />
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={startAdd}>
          <Plus size={14} weight="bold" /> {t('New Product')}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('Name')}</th>
              <th>{t('Price')}</th>
              <th>{t('Stock')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="products-tab__name-cell">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="products-tab__thumb" />}
                    {p.name}
                  </div>
                </td>
                <td>€{p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.stock > 0 ? 'badge--success' : 'badge--neutral'}`}>
                    {p.stock > 0 ? t('In Stock') : t('Out of Stock')}
                  </span>
                </td>
                <td>
                  {tab === 'active' ? (
                    <>
                      <button type="button" onClick={() => startEdit(p)} className="icon-btn" title={t('Edit')}>
                        <PencilSimple size={18} />
                      </button>
                      <button type="button" onClick={() => handleDelete(p._id)} className="icon-btn icon-btn--danger" title={t('Delete')}>
                        <Trash size={18} />
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => handleRestore(p._id)} className="icon-btn" title={t('Restore')}>
                      <ArrowCounterClockwise size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && (
          <div className="admin-empty-state">
            <p>{tab === 'archived' ? t('No archived products.') : t('No products yet.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopProductsTab;
