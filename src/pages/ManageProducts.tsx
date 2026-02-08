import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, X, Upload, Image as ImageIcon,
  Loader2, Package, Search, Filter, ChevronDown,
  TrendingUp, AlertCircle, CheckCircle2, MoreVertical,
  Layers, Smartphone, Headphones, ArrowUpRight
} from 'lucide-react';
import { useProducts, Product } from '@/context/ProductsContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, mobileBrands } from '@/utils/helpers';
import { toast } from 'sonner';

interface ProductForm {
  brand: string;
  model: string;
  price: string;
  category: 'mobile' | 'accessory';
  ram: string;
  storage: string;
  stock: string;
  rating: string;
  featured: boolean;
  image: string;
  specs: {
    processor: string;
    display: string;
    camera: string;
    battery: string;
  };
}

const emptyForm: ProductForm = {
  brand: '',
  model: '',
  price: '',
  category: 'mobile',
  ram: '',
  storage: '',
  stock: '',
  rating: '',
  featured: false,
  image: '',
  specs: {
    processor: '',
    display: '',
    camera: '',
    battery: ''
  }
};

const ManageProducts = () => {
  const { products, isLoading: productsLoading, fetchProducts } = useProducts();
  const { session } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [filter, setFilter] = useState<'all' | 'mobile' | 'accessory'>('all');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const filtered = products.filter(p => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch = !search ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      brand: p.brand,
      model: p.model,
      price: String(p.price),
      category: p.category,
      ram: p.ram || '',
      storage: p.storage || '',
      stock: String(p.stock || 0),
      rating: String(p.rating || 0),
      featured: p.featured || false,
      image: p.image || '',
      specs: {
        processor: p.specs?.processor || '',
        display: p.specs?.display || '',
        camera: p.specs?.camera || '',
        battery: p.specs?.battery || ''
      }
    });
    setImagePreview(p.image || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      toast.error('Please login as admin');
      return;
    }
    setIsSubmitting(true);

    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploadingImage(true);
        const response = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            image: imagePreview,
            filename: imageFile?.name || 'product-image'
          })
        });
        const data = await response.json();
        if (response.ok && data.url) imageUrl = data.url;
        setUploadingImage(false);
      }

      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating) || 0,
        image: imageUrl
      };

      const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success(editId ? 'Product updated!' : 'Product added!');
        setShowForm(false);
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save product');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all";

  // Counts
  const mobileCount = products.filter(p => p.category === 'mobile').length;
  const accessoryCount = products.filter(p => p.category === 'accessory').length;
  const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Store Catalog</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Manage Products</h1>
            <p className="text-slate-500 mt-1">Add, browse, and edit your store inventory</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Add New Item
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobiles</span>
              <Smartphone className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{mobileCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accessories</span>
              <Headphones className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{accessoryCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">₹{Math.round(products.reduce((s, p) => s + (p.price * (p.stock || 0)), 0) / 100000)}L+</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock</span>
              <AlertCircle className="h-4 w-4 text-rose-500 font-bold" />
            </div>
            <p className="text-2xl font-bold text-rose-600">{lowStockCount}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-all"
              placeholder="Search products by model or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'mobile', 'accessory'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {f === 'all' ? 'All' : f === 'mobile' ? 'Mobiles' : 'Accessories'}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Featured</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                      <p className="text-slate-500 mt-2 font-medium">Fetching inventory...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <ImageIcon className="h-12 w-12 text-slate-200 mx-auto" />
                      <p className="text-slate-400 mt-2 font-medium">No products match your search</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0 border border-slate-200/50 overflow-hidden flex items-center justify-center p-1 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {p.image ? (
                              <img src={p.image} alt={p.model} className="h-full w-full object-contain" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{p.model}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${p.category === 'mobile' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{formatPrice(p.price)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${(p.stock || 0) < 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {p.stock || 0}
                          </span>
                          {(p.stock || 0) < 5 && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.featured ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-medium">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4" onClick={() => setShowForm(false)}>
            <div
              className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                    {editId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{editId ? 'Edit Product' : 'Create New Product'}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Fill in the details for your store catalog</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2.5 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Image Section */}
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Visual Presentation</h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div
                        className="w-full sm:w-40 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden p-2 group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-10 w-10 mx-auto text-slate-300 group-hover:text-primary transition-colors" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Select Image</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Direct Image Link</label>
                          <input
                            className={inputClass}
                            placeholder="https://example.com/product-image.jpg"
                            value={form.image}
                            onChange={e => {
                              setForm(p => ({ ...p, image: e.target.value }));
                              setImagePreview(e.target.value);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                          <p className="text-[10px] text-blue-700 font-medium">Pro-tip: High quality PNGs with white/transparent background look best!</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Identity Section */}
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Product Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Store Category</label>
                        <select className={inputClass} required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as 'mobile' | 'accessory' }))}>
                          <option value="mobile">Mobiles & Tablets</option>
                          <option value="accessory">Accessories</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Manufacturer Brand</label>
                        <select className={inputClass} required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}>
                          <option value="">Choose Brand</option>
                          {mobileBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                          <option value="Other">Other/Generic</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Product Model / Marketing Name</label>
                        <input className={inputClass} placeholder="e.g. Galaxy S24 Ultra" required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
                      </div>
                    </div>
                  </section>

                  {/* Pricing Section */}
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pricing & Stock</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Selling Price (₹)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input className={`${inputClass} pl-10`} placeholder="0.00" required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">Initial Stock Level</label>
                        <input className={inputClass} placeholder="50" required type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                      </div>
                    </div>
                  </section>

                  {form.category === 'mobile' && (
                    <section className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Technical Specs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-1.5 block">RAM</label>
                          <select className={inputClass} value={form.ram} onChange={e => setForm(p => ({ ...p, ram: e.target.value }))}>
                            <option value="">Select RAM</option>
                            {['4GB', '6GB', '8GB', '12GB', '16GB', '24GB'].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-1.5 block">Internal Storage</label>
                          <select className={inputClass} value={form.storage} onChange={e => setForm(p => ({ ...p, storage: e.target.value }))}>
                            <option value="">Select Storage</option>
                            {['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Processor</label>
                            <input className={inputClass} placeholder="Snapdragon..." value={form.specs.processor} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, processor: e.target.value } }))} />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Display</label>
                            <input className={inputClass} placeholder="6.7\" AMOLED..." value={form.specs.display} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, display: e.target.value } }))} />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Market Presence */}
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Visibility</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100"><ArrowUpRight className="h-5 w-5 text-amber-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Featured in Storefront</p>
                          <p className="text-[10px] text-slate-500">Enable this to show product on homepage & top selections</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                        className="w-6 h-6 rounded-lg text-primary focus:ring-primary h-8 w-8"
                      />
                    </div>
                  </section>
                </div>

                {/* Submit Container */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="w-full rounded-2xl bg-primary py-4 text-sm font-black text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {(isSubmitting || uploadingImage) ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    {editId ? 'Apply Update & Save Changes' : 'Publish Product to Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
