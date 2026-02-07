import React from 'react';
import { Shield, Smartphone, PenTool, Globe, Award, Users } from 'lucide-react';

const About = () => (
  // Main Container
  <div className="container mx-auto px-4 py-12 md:py-20 bg-gray-50 min-h-screen">

    {/* Hero / Header Section */}
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
        About Star Mobiles
      </h1>
      <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mb-6"></div>
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
        Your trusted partner for mobile solutions in Ponnamaravathi since 2022.
      </p>
    </div>

    <div className="grid gap-12 lg:grid-cols-2 items-center">
      {/* Left Column: Business Description */}
      <div className="space-y-8 animate-fade-in-up">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Who We Are
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            Star Mobiles is a premier mobile service and SIM card shop located in <span className="font-semibold text-blue-700">Ponnamaravathi, Pudukkottai</span>.
            Established in 2022, we have been serving our local community and travelers with dedication and expertise.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            Located conveniently near the bus stand on <span className="font-semibold text-gray-900">Annasalai Main Road</span>, we make it easy for everyone to access top-notch mobile services, recharges, and repairs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Award, val: '2022', label: 'Established' },
            { icon: Users, val: 'Happy', label: 'Customers' },
            { icon: Shield, val: '100%', label: 'Genuine Parts' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <s.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="font-bold text-xl text-gray-900">{s.val}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Services */}
      <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up delay-100">
        {[
          { icon: Smartphone, title: 'Mobile Sales', desc: 'New and second-hand phones from top brands including Apple.' },
          { icon: PenTool, title: 'Expert Repairs', desc: 'Professional display screen repair and general mobile servicing.' },
          { icon: Globe, title: 'SIM Services', desc: 'Authorized dealers for Jio, Airtel, and VI. New connections & porting.' },
          { icon: Shield, title: 'Recharges', desc: 'Instant online mobile recharge services for all operators.' },
        ].map((service, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <service.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
