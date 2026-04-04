import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', category: '', price: '', description: '', img: '', isAvailable: true };

const categories = ['Burgers', 'Pizza', 'Salads', 'Beverages', 'Desserts', 'Snacks', 'Mains', 'Other'];

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    api.get('/api/v1/product')
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price) }); setEditId(p._id); setModal(true); };
  const closeModal = () => setModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editId) {
        await api.put(`/api/v1/product/${editId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/api/v1/product', payload);
        toast.success('Product created');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/v1/product/${id}`);
      toast.success('Product deleted');
      setProducts(p => p.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-slate-400 text-sm mt-0.5">{products.length} items in menu</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p._id} className="glass rounded-2xl overflow-hidden card-hover group">
                <div className="relative h-36 bg-slate-800 flex items-center justify-center">
                  <img
                    src={p.img || 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'}
                    alt={p.name}
                    className="h-24 w-24 object-contain"
                    onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'; }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 bg-red-600 rounded-lg hover:bg-red-500 text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {!p.isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <span className="text-xs text-red-400 font-medium bg-slate-900 px-2 py-1 rounded-full">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{p.category}</span>
                    </div>
                    <span className="text-lg font-bold text-white">₹{p.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text', required: true },
                { label: 'Price (₹)', key: 'price', type: 'number', required: true },
                { label: 'Description', key: 'description', type: 'text' },
                { label: 'Image URL', key: 'img', type: 'url' },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    min={type === 'number' ? '0' : undefined}
                    step={type === 'number' ? '0.01' : undefined}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <label htmlFor="avail" className="text-sm text-slate-300">Available</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium py-2.5 transition-all">
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductsManagement;
