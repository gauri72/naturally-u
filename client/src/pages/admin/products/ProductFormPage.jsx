import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductBySlug } from '../../../api/products.api';
import { uploadImage } from '../../../api/media.api';
import toast from 'react-hot-toast';

function ProductFormPage() {
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
      toast.success('Product saved');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <div>
      <h1>{isEdit ? 'Edit' : 'New'} Product</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="slug" placeholder="Slug" value={form.slug} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button type="submit" className="btn btn--primary">Save Product</button>
      </form>
    </div>
  );
}

export default ProductFormPage;
