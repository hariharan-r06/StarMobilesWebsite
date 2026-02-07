import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '@/components/ServiceCard';
import LoginModal from '@/components/LoginModal';
import { services } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const Services = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleBook = () => {
    if (isAuthenticated) navigate('/book-service');
    else setLoginOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Repair Services</h1>
      <p className="text-muted-foreground mt-1">Professional mobile repair with warranty on all services</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(s => (
          <ServiceCard key={s.id} {...s} onBook={handleBook} />
        ))}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Services;
