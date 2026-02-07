import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import accessoriesData from '@/data/accessories.json';
import { accessoryTypes, formatPrice } from '@/utils/helpers';

const Accessories = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filtered = useMemo(() => {
    return accessoriesData.filter(a => {
      const matchesSearch = !search || `${a.brand} ${a.name}`.toLowerCase().includes(search.toLowerCase());
      const matchesType = !selectedType || a.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Accessories</h1>
      <p className="text-muted-foreground mt-1">Cases, chargers, earphones & more</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Search accessories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setSelectedType('')} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!selectedType ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
          All
        </button>
        {accessoryTypes.map(t => (
          <button key={t.value} onClick={() => setSelectedType(t.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedType === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(a => (
          <ProductCard key={a.id} id={a.id} brand={a.brand} model={a.name} price={a.price} rating={a.rating} category="accessory" />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-20 text-center"><p className="font-heading text-lg text-muted-foreground">No accessories found</p></div>
      )}
    </div>
  );
};

export default Accessories;
