import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

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

  const uploadImage = async (): Promise<string> => {
    if (!imageFile && !imagePreview) return form.image;

    // If we have a preview (either from file or URL paste)
    const imageToUpload = imagePreview || form.image;

    // If it's already a proper URL (not base64), return as-is
    if (imageToUpload.startsWith('http://') || imageToUpload.startsWith('https://')) {
      return imageToUpload;
    }

    setUploadingImage(true);
    try {
      // Send base64 image as JSON to backend
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          image: imageToUpload,
          filename: imageFile?.name || 'product-image'
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        console.log('Image uploaded successfully:', data.url);
        if (data.warning) {
          console.warn('Upload warning:', data.warning);
        }
        return data.url;
      } else {
        console.log('Image upload failed, using base64:', data.error);
        return imageToUpload; // Fallback to base64
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return imageToUpload; // Fallback to base64
    } finally {
      setUploadingImage(false);
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
      // Upload image if new file selected
      let imageUrl = form.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const productData = {
        brand: form.brand,
        model: form.model,
        price: Number(form.price),
        category: form.category,
        ram: form.ram,
        storage: form.storage,
        stock: Number(form.stock),
        rating: Number(form.rating) || 0,
        featured: form.featured,
        image: imageUrl,
        specs: form.specs
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
        fetchProducts(); // Refresh products list
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
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
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

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Image</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Model/Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Featured</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  {p.image ? (
                    <img src={p.image} alt={p.model} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.brand}</td>
                <td className="px-4 py-3">{p.model}</td>
                <td className="px-4 py-3 price-text font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={(p.stock || 0) < 5 ? 'text-destructive font-semibold' : ''}>{p.stock || 0}</span>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3">
                  {p.featured ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Yes</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">No</span>
                  )}
                </td>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 p-1 text-muted-foreground hover:bg-muted rounded-md"><X className="h-5 w-5" /></button>
            <h2 className="font-heading text-xl font-bold mb-4">{editId ? 'Edit Product' : 'Add Product'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image</label>
                <div className="flex items-start gap-4">
                  <div
                    className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <input
                      className={inputClass}
                      placeholder="Or paste image URL"
                      value={form.image}
                      onChange={e => {
                        setForm(p => ({ ...p, image: e.target.value }));
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Upload an image or paste a URL</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select className={inputClass} required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as 'mobile' | 'accessory' }))}>
                    <option value="mobile">Mobile</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <select className={inputClass} required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}>
                    <option value="">Select Brand</option>
                    {mobileBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="text-sm font-medium">Model / Name</label>
                <input className={inputClass} placeholder="e.g. iPhone 15 Pro Max" required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input className={inputClass} placeholder="e.g. 79999" required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input className={inputClass} placeholder="e.g. 50" required type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                </div>
              </div>

              {form.category === 'mobile' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* RAM */}
                    <div>
                      <label className="text-sm font-medium">RAM</label>
                      <select className={inputClass} value={form.ram} onChange={e => setForm(p => ({ ...p, ram: e.target.value }))}>
                        <option value="">Select RAM</option>
                        {['4GB', '6GB', '8GB', '12GB', '16GB'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Storage */}
                    <div>
                      <label className="text-sm font-medium">Storage</label>
                      <select className={inputClass} value={form.storage} onChange={e => setForm(p => ({ ...p, storage: e.target.value }))}>
                        <option value="">Select Storage</option>
                        {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specifications</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input className={inputClass} placeholder="Processor (e.g. Snapdragon 8 Gen 3)" value={form.specs.processor} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, processor: e.target.value } }))} />
                      <input className={inputClass} placeholder="Display (e.g. 6.7&quot; AMOLED)" value={form.specs.display} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, display: e.target.value } }))} />
                      <input className={inputClass} placeholder="Camera (e.g. 200MP)" value={form.specs.camera} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, camera: e.target.value } }))} />
                      <input className={inputClass} placeholder="Battery (e.g. 5000mAh)" value={form.specs.battery} onChange={e => setForm(p => ({ ...p, specs: { ...p.specs, battery: e.target.value } }))} />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Rating */}
                <div>
                  <label className="text-sm font-medium">Rating (0-5)</label>
                  <input className={inputClass} placeholder="e.g. 4.5" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} />
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">Featured Product</label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(isSubmitting || uploadingImage) && <Loader2 className="h-4 w-4 animate-spin" />}
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
