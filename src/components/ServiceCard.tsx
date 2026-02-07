import React from 'react';
import { Smartphone, Battery, RefreshCw, Droplets, Camera, Plug } from 'lucide-react';
import { formatPrice } from '@/utils/helpers';

const iconMap: Record<string, React.ElementType> = {
  Smartphone, Battery, RefreshCw, Droplets, Camera, Plug,
};

interface ServiceCardProps {
  name: string;
  icon: string;
  price: number;
  time: string;
  description: string;
  onBook?: () => void;
}

const ServiceCard = ({ name, icon, price, time, description, onBook }: ServiceCardProps) => {
  const Icon = iconMap[icon] || Smartphone;

  return (
    <div className="card-hover rounded-xl border border-border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-heading text-base font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-3 flex items-center justify-center gap-3 text-sm">
        <span className="price-text font-bold">From {formatPrice(price)}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{time}</span>
      </div>
      {onBook && (
        <button onClick={onBook} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Book Service
        </button>
      )}
    </div>
  );
};

export default ServiceCard;
