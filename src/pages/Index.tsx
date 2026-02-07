import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Award, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import Hero from '@/components/Hero';
import mobilesData from '@/data/mobiles.json';
import { services } from '@/utils/helpers';

const featured = mobilesData.filter(m => m.featured).slice(0, 10);

const Index = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Trust Badges - Premium Strip */}
      <section className="bg-white border-b border-gray-100 shadow-sm relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-8 items-center justify-items-center md:justify-items-start">
          {[
            { icon: Shield, title: '100% Genuine', desc: 'Authorized Dealer' },
            { icon: Clock, title: 'Quick Service', desc: 'Same Day Repair' },
            { icon: Award, title: '10+ Years', desc: 'Trusted Experience' },
            { icon: Star, title: '50,000+', desc: 'Happy Customers' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Our Selection</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Featured Smartphones</h2>
          </div>
          <Link to="/mobiles" className="group flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
            View All Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {featured.map(p => (
            <ProductCard
              key={p.id}
              {...p}
              category="mobile"
              featured={true} // Force featured logic for home page
            />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link to="/mobiles" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-bold text-sm">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-900 py-24 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">Expert Care</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Professional Repair Services</h2>
            <p className="text-gray-400">
              We don't just sell phones; we keep them running like new. Genuine parts, expert technicians, and warranty on all repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map(s => (
              <ServiceCard key={s.id} {...s} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/services" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all shadow-lg shadow-orange-500/20 hover:scale-105">
              Book a Service <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
