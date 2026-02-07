import React, { useState } from 'react';
import { MapPin, Phone, Clock, Send, Globe, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.length > 100 || form.email.length > 255 || form.message.length > 1000) {
      toast.error('Please check field lengths'); return;
    }
    // In a real app, this would send data to a backend
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-300";

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen bg-white">
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-500">We'd love to hear from you. Visit us or send us a message.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">

        {/* Contact Info Side */}
        <div className="space-y-8 animate-fade-in-up delay-100">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Our Location</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mt-1">
                    No 309, Kaliyappan Complex, Anna Salai,<br />
                    Ponnamaravathi, Pudukkottai - 622407,<br />
                    Tamil Nadu. (Near Bus Stand)
                  </p>
                  <a
                    href="https://www.google.com/maps/place/STAR+MOBILES/@10.2777544,78.5415253,17z/data=!4m15!1m8!3m7!1s0x3b0085b59f53cabb:0xca1bda7e6990574c!2sSTAR+MOBILES!8m2!3d10.277647!4d78.541673!10e5!16s%2Fg%2F11cjhn6x45!3m5!1s0x3b0085b59f53cabb:0xca1bda7e6990574c!8m2!3d10.277647!4d78.541673!16s%2Fg%2F11cjhn6x45?entry=ttu&g_ep=EgoyMDI2MDIwNC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold mt-3 hover:underline"
                  >
                    View on Google Maps <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white text-green-600 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Phone Number</h3>
                  <p className="text-gray-600 text-sm mt-1">+91 97878 71771</p>
                  <p className="text-gray-600 text-sm">+91 98656 56166</p>
                  <div className="flex gap-3 mt-3">
                    <a href="tel:+919787871771" className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-200 transition-colors">Call Now</a>
                    <a href="https://wa.me/919787871771" className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white text-orange-500 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Business Hours</h3>
                  <p className="text-gray-600 text-sm mt-1">Open Daily: 8:00 AM - 10:00 PM</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg border border-green-200">
                    Open Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 animate-fade-in-up delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Name</label>
              <input
                className={inputClass}
                placeholder="Name"
                required
                maxLength={100}
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="Email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone</label>
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="Phone"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Message</label>
              <textarea
                className={`${inputClass} min-h-[150px] resize-none`}
                placeholder="How can we help you?"
                required
                maxLength={1000}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-2 text-right">{form.message.length}/1000</p>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-1">
              <Send className="w-5 h-5" /> Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
