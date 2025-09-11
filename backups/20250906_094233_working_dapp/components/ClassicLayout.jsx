import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Layout = ({ children, title = "BrainArk - Decentralized Intelligence" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const navigation = [
    { name: '🏠 Home', href: '/' },
    { name: '🎁 Airdrop', href: '/airdrop' },
    { name: '🦄 EPO', href: '/epo' },
    { name: '🚀 Use Cases', href: '/use-cases' },
    { name: '🔍 Explorer', href: '/explorer' },
    { name: '📄 Whitepaper', href: '/whitepaper' },
    { name: '⚡ Benchmark', href: '/benchmark' },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="BrainArk - The future of decentralized intelligence" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation Header */}
        <nav className="header-nav">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-brainark-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-white">BrainArk</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex nav-links">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className="nav-link"
              >
                {item.name}
              </Link>
            ))}
            <ConnectButton />
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <ConnectButton accountStatus="avatar" />
            <button
              type="button"
              className="ml-2 p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </nav>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-md">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-2 text-center text-white hover:bg-white/10 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black/20 border-t border-white/10 p-6 text-center text-white/60">
          <p>&copy; 2025 BrainArk. Building the future of decentralized intelligence.</p>
        </footer>
      </div>
    </>
  );
};

export default Layout;
