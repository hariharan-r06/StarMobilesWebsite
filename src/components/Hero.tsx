import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative bg-[#0a0a0a] min-h-[600px] flex items-center overflow-hidden">
            {/* Background Image Container with Masking */}
            <div className="absolute inset-0 z-0 flex justify-end">
                <div
                    className="relative w-full h-full md:w-[70%]"
                    style={{
                        // This mask creates the smooth fade effect from the left side, removing the hard edge
                        maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)'
                    }}
                >
                    <img
                        src="/Airbrush-IMAGE-ENHANCER-1770469209437-1770469209437.png"
                        alt="Hero Background"
                        className="w-full h-full object-cover object-center md:object-right opacity-40 md:opacity-100"
                    />
                    {/* Extra Overlay for Mobile Text Readability */}
                    <div className="absolute inset-0 bg-black/60 md:bg-transparent" />
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                {/* Text Content */}
                <div className="space-y-6 pt-10 md:pt-0 text-center md:text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold tracking-wider mb-2 shadow-lg shadow-orange-500/20">
                        NEW ARRIVALS 2025
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                        Find Your Perfect <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300">
                            Smartphone
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mx-auto md:mx-0">
                        Explore the latest flagship smartphones, premium accessories, and expert repair services — all under one roof.
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <Link
                            to="/mobiles"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 transform hover:-translate-y-1"
                        >
                            Browse Mobiles <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/services"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold transition-all backdrop-blur-sm hover:bg-white/20"
                        >
                            Our Services
                        </Link>
                    </div>
                </div>

                {/* Empty column to push text to left */}
                <div className="hidden md:block"></div>
            </div>

            {/* Decorative Glows (Behind everything but above bg color) */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Chat Bubble */}
            <button className="absolute bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-50 animate-bounce-subtle">
                <MessageCircle className="w-6 h-6" />
            </button>
        </section>
    );
};

export default Hero;
