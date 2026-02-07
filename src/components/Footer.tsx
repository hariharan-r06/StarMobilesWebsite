import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-card mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-extrabold">★</span>
            Star Mobiles
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your trusted destination for smartphones, accessories, and expert repair services in India since 2015.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: '/mobiles', label: 'Mobiles' },
              { to: '/accessories', label: 'Accessories' },
              { to: '/services', label: 'Services' },
              { to: '/about', label: 'About Us' },
              { to: '/contact', label: 'Contact' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-heading font-semibold mb-3">Services</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Screen Repair</span>
            <span>Battery Replacement</span>
            <span>Software Update</span>
            <span>Water Damage Repair</span>
            <span>Camera Repair</span>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-semibold mb-3">Contact Us</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>123 MG Road, Bangalore, Karnataka 560001</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>info@starmobiles.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Star Mobiles. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
