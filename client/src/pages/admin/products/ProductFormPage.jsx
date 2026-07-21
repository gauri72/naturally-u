import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductBySlug } from '../../../api/products.api';
import { uploadImage } from '../../../api/media.api';
import toast from 'react-hot-toast';
import { useLang } from '../../../i18n/LanguageContext.jsx';

function ProductFormPage() {
  const { t } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', stock: '', images: [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadImage(file);
    setForm({ ...form, images: [...form.images, { url: res.data.url, alt: form.name }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      toast.success(t('Product saved'));
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || t('Failed to save product'));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{isEdit ? t('Edit Product') : t('New Product')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-field">
          <label>{t('Name')}</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="admin-field">
          <label>{t('Slug')}</label>
          <input name="slug" value={form.slug} onChange={handleChange} required />
        </div>
        <div className="admin-field">
          <label>{t('Description')}</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} required />
        </div>
        <div className="admin-field">
          <label>{t('Price')}</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </div>
        <div className="admin-field">
          <label>{t('Stock')}</label>
          <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
        </div>
        <div className="admin-field">
          <label>{t('Image')}</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>{t('Save Product')}</button>
      </form>
    </div>
  );
}

export default ProductFormPage;
