import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import mobilesData from '@/data/mobiles.json';
import accessoriesData from '@/data/accessories.json';
import { formatPrice, mobileBrands } from '@/utils/helpers';
import { toast } from 'sonner';

type Product = {
  id: number;
  brand: string;
  model?: string;
  name?: string;
  price: number;
  stock: number;
  category: string;
};

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    ...mobilesData.map(m => ({ id: m.id, brand: m.brand, model: m.model, price: m.price, stock: m.stock, category: 'mobile' })),
    ...accessoriesData.map(a => ({ id: a.id, brand: a.brand, name: a.name, price: a.price, stock: a.stock, category: 'accessory' })),
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ brand: '', model: '', price: '', stock: '', category: 'mobile' });
  const [filter, setFilter] = useState<'all' | 'mobile' | 'accessory'>('all');

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  const openAdd = () => { setEditId(null); setForm({ brand: '', model: '', price: '', stock: '', category: 'mobile' }); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ brand: p.brand, model: p.model || p.name || '', price: String(p.price), stock: String(p.stock), category: p.category });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { brand: form.brand, price: Number(form.price), stock: Number(form.stock), category: form.category };
    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...data, model: form.model, name: form.model } : p));
      toast.success('Product updated!');
    } else {
      setProducts(prev => [...prev, { ...data, id: Date.now(), model: form.model, name: form.model }]);
      toast.success('Product added!');
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Manage Products</h1>
          <p className="text-muted-foreground mt-1">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'mobile', 'accessory'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
            {f === 'all' ? 'All' : f === 'mobile' ? 'Mobiles' : 'Accessories'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Model/Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{p.brand}</td>
                <td className="px-4 py-3">{p.model || p.name}</td>
                <td className="px-4 py-3 price-text font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock < 5 ? 'text-destructive font-semibold' : ''}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="rounded-md p-1.5 hover:bg-muted"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 p-1 text-muted-foreground hover:bg-muted rounded-md"><X className="h-5 w-5" /></button>
            <h2 className="font-heading text-xl font-bold mb-4">{editId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select className={inputClass} required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="mobile">Mobile</option>
                <option value="accessory">Accessory</option>
              </select>
              <input className={inputClass} placeholder="Brand" required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
              <input className={inputClass} placeholder="Model / Name" required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
              <input className={inputClass} placeholder="Price (₹)" required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              <input className={inputClass} placeholder="Stock" required type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
              <button type="submit" className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                {editId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
