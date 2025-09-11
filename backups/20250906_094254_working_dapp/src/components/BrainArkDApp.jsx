import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useViewportHeight, useResponsiveBreakpoints } from '@/hooks/useViewportHeight';

const BrainArkDApp = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useResponsiveBreakpoints();
  
  // Set viewport height
  useViewportHeight();

  // Handle mounting for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const layoutClass = isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${layoutClass}`}>
      {/* Navigation Header */}
      <header className="glass border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">🧠</span>
                <span>BrainArk</span>
              </Link>
            </div>
            
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/airdrop" className="nav-link">🎁 Airdrop</Link>
                <Link href="/epo" className="nav-link">🦄 EPO</Link>
                <Link href="/explorer" className="nav-link">🔍 Explorer</Link>
                <Link href="/whitepaper" className="nav-link">📄 Whitepaper</Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <ConnectButton />
              
              {isMobile && (
                <button 
                  className="mobile-menu-button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Menu - Hidden by default */}
          <div className={`mobile-menu md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/airdrop" className="nav-link block px-3 py-2">🎁 Airdrop</Link>
              <Link href="/epo" className="nav-link block px-3 py-2">🦄 EPO</Link>
              <Link href="/explorer" className="nav-link block px-3 py-2">🔍 Explorer</Link>
              <Link href="/whitepaper" className="nav-link block px-3 py-2">📄 Whitepaper</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section full-height flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">BrainArk</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              The Future of Decentralized Intelligence
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`button-grid ${isMobile ? 'flex flex-col gap-4' : 'flex flex-wrap justify-center gap-4 md:gap-6'}`}>
            <Link href="/airdrop" className="btn-airdrop px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              🎯 Claim Airdrop
            </Link>
            <Link href="/epo" className="btn-epo px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              🚀 Join EPO
            </Link>
            <Link href="/explorer" className="btn-explorer px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              🔍 Explorer
            </Link>
            <Link href="/whitepaper" className="btn-whitepaper px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              📄 Whitepaper
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Platform Features
          </h2>
          <div className="card-grid grid gap-6">
            <div className="glass rounded-3xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-white mb-4">Airdrop Program</h3>
              <p className="text-gray-300">
                Participate in our exclusive airdrop campaign and earn BrainArk tokens.
              </p>
            </div>
            
            <div className="glass rounded-3xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-4">Early Project Offering</h3>
              <p className="text-gray-300">
                Get early access to BrainArk tokens through our EPO program.
              </p>
            </div>
            
            <div className="glass rounded-3xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-white mb-4">Neural Networks</h3>
              <p className="text-gray-300">
                Advanced AI-powered decentralized intelligence platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">$50M+</div>
              <div className="text-gray-300">Total Value Locked</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 BrainArk. All rights reserved. Building the future of decentralized intelligence.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .mobile-layout {
          font-size: 16px;
          line-height: 1.6;
        }
        .mobile-layout .hero-section {
          padding: 1rem;
          min-height: calc(var(--vh, 1vh) * 100);
        }
        .mobile-layout .card-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 0 1rem;
        }
        .mobile-layout .button-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          padding: 0 1rem;
        }
        .tablet-layout {
          font-size: 16px;
          line-height: 1.6;
        }
        .tablet-layout .card-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 0 1.5rem;
        }
        .desktop-layout {
          font-size: 18px;
          line-height: 1.7;
        }
        .desktop-layout .card-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding: 0;
        }
        
        .full-height {
          min-height: calc(var(--vh, 1vh) * 100);
        }
        .section-padding {
          padding: 2rem;
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .nav-link {
          color: #f3f4f6;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .btn-airdrop {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }
        .btn-epo {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
        }
        .btn-explorer {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
        }
        .btn-whitepaper {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        @media (max-width: 768px) {
          button, a.btn-airdrop, a.btn-epo, a.btn-explorer, a.btn-whitepaper {
            min-height: 48px;
            padding: 12px 16px;
            font-size: 16px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

// Export the component

export default BrainArkDApp;
