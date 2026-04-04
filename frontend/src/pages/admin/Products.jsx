import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { Plus, Pencil, Trash2, X, Save, Tag, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', categories: [], price: '', description: '', img: '', isAvailable: true };

/* ── Multi-select dropdown ── */
const MultiSelect = ({ options, selected, onChange, placeholder = 'Select categories…' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
      >
        <span className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-slate-500">{placeholder}</span>
          ) : (
            selected.map(v => (
              <span key={v} className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium">
                {v}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(v); }} className="hover:text-white">
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </span>
        <ChevronDown size={15} className={`shrink-0 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">No categories yet — add one below</div>
          ) : (
            <div className="max-h-48 overflow-y-auto py-1">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 text-sm transition-colors"
                >
                  <span className={selected.includes(opt) ? 'text-white' : 'text-slate-400'}>{opt}</span>
                  {selected.includes(opt) && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main page ── */
const ProductsManagement = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]); // string list of category names
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);

  // Category manager states
  const [newCat, setNewCat]         = useState('');
  const [addingCat, setAddingCat]   = useState(false);
  const [showCatPanel, setShowCatPanel] = useState(false);

  const [filterCat, setFilterCat]   = useState('All');

  /* ── Fetch ── */
  const fetchProducts = () =>
    api.get('/api/v1/product')
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));

  const fetchCategories = () =>
    api.get('/api/v1/category')
      .then(({ data }) => setCategories(data.map(c => c.name)));

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  /* ── Category CRUD ── */
  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setAddingCat(true);
    try {
      await api.post('/api/v1/category', { name: newCat.trim() });
      setNewCat('');
      await fetchCategories();
      toast.success('Category added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const allCats = await api.get('/api/v1/category');
      const found = allCats.data.find(c => c.name === name);
      if (found) await api.delete(`/api/v1/category/${found._id}`);
      await fetchCategories();
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  /* ── Product CRUD ── */
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit   = (p) => {
    setForm({
      ...p,
      price: String(p.price),
      categories: p.categories || (p.category ? [p.category] : []),
    });
    setEditId(p._id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        category: form.categories[0] || '',   // keep legacy field in sync
      };
      if (editId) {
        await api.put(`/api/v1/product/${editId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/api/v1/product', payload);
        toast.success('Product created');
      }
      setModal(false);
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

  /* ── Filter logic ── */
  const displayed = filterCat === 'All' ? products : products.filter(p =>
    p.categories?.includes(filterCat) || p.category === filterCat
  );

  const catOptions = ['All', ...categories];

  return (
    <Layout>
      <div className="p-6 space-y-5 slide-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Products</h1>
            <p className="text-slate-400 text-sm mt-0.5">{products.length} items in menu</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatPanel(!showCatPanel)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showCatPanel ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
            >
              <Tag size={15} /> Categories
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* ── Category Manager Panel ── */}
        {showCatPanel && (
          <div className="glass rounded-2xl p-5 border border-purple-500/20 space-y-4 slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-purple-400" />
                <h2 className="font-semibold text-white">Manage Categories</h2>
              </div>
              <span className="text-xs text-slate-500">{categories.length} categories</span>
            </div>

            {/* Existing categories */}
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-slate-500 text-sm">No categories yet</span>
              ) : categories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl">
                  {cat}
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-slate-600 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add new category */}
            <div className="flex gap-2">
              <input
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                placeholder="New category name…"
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={addingCat || !newCat.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        )}

        {/* ── Category filter tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {catOptions.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                filterCat === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c}
              {c !== 'All' && (
                <span className="ml-1 text-xs opacity-60">
                  ({products.filter(p => p.categories?.includes(c) || p.category === c).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Products grid ── */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map(p => {
              const cats = p.categories?.length ? p.categories : (p.category ? [p.category] : []);
              return (
                <div key={p._id} className="glass rounded-2xl overflow-hidden card-hover group">
                  <div className="relative h-36 bg-slate-800 flex items-center justify-center">
                    <img
                      src={p.img || 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'}
                      alt={p.name}
                      className="h-24 w-24 object-contain"
                      onError={e => { e.target.src = 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'; }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 bg-red-600 rounded-lg hover:bg-red-500 text-white"><Trash2 size={14} /></button>
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cats.map(c => (
                            <span key={c} className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-white shrink-0">₹{p.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                  </div>
                </div>
              );
            })}
            {displayed.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-600">No products in this category</div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Basic fields */}
              {[
                { label: 'Name',         key: 'name',        type: 'text',   required: true },
                { label: 'Price (₹)',    key: 'price',       type: 'number', required: true },
                { label: 'Description',  key: 'description', type: 'text' },
                { label: 'Image URL',    key: 'img',         type: 'url' },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    min={type === 'number' ? '0' : undefined}
                    step={type === 'number' ? '0.01' : undefined}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              {/* Multi-select categories */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Categories
                  {categories.length === 0 && (
                    <span className="ml-2 text-yellow-400">— add categories first using the Categories button</span>
                  )}
                </label>
                <MultiSelect
                  options={categories}
                  selected={form.categories}
                  onChange={vals => setForm({ ...form, categories: vals })}
                />
              </div>

              {/* Available toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avail"
                  checked={form.isAvailable}
                  onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500"
                />
                <label htmlFor="avail" className="text-sm text-slate-300">Available on menu</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium py-2.5 transition-all">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save'}
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
