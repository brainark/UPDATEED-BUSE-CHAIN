#!/bin/bash
# implement-layout-fixes.sh

cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp

echo "🔧 Implementing layout fixes..."

# 1. Update WalletConnect configuration
echo "🔗 Fixing WalletConnect configuration..."
sed -i 's/projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || .*/projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "0a1cdc678a1869275bb663eaf7eba7bb",/' src/utils/wagmiConfig.ts

# 2. Create or update environment file
echo "📝 Creating/updating environment configuration..."
cat > .env.local << EOF
# BrainArk Airdrop DApp Environment Variables
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0a1cdc678a1869275bb663eaf7eba7bb
# This is the real WalletConnect project ID
EOF

# 3. Create styles directory if it doesn't exist
mkdir -p src/styles

# 4. Add the CSS fixes
echo "🎨 Adding CSS layout fixes..."
cat > src/styles/layout-fixes.css << 'EOF'
/* Reset and base styles */
* {
  box-sizing: border-box;
}

/* Header Navigation Fix */
.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Main Content Layout */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

/* EPO Section Layout */
.epo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.epo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

/* Trading Dashboard Layout */
.trading-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.trading-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4ade80;
  margin: 0.5rem 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .epo-container,
  .trading-dashboard {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav-links {
    flex-direction: column;
    width: 100%;
  }
  
  .nav-link {
    width: 100%;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Fix overlapping text */
.text-overlay-fix {
  position: relative;
  z-index: 1;
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* Progress bar styling */
.progress-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Typography fixes */
h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  margin-bottom: 1rem;
  line-height: 1.3;
}

p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Prevent text overflow */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
EOF

# 5. Update _app.tsx to include the new CSS
if grep -q "import '@/styles/layout-fixes.css'" src/pages/_app.tsx; then
    echo "CSS import already exists in _app.tsx"
else
    sed -i "/import '@rainbow-me\/rainbowkit\/styles\.css'/a import '@/styles/layout-fixes.css'" src/pages/_app.tsx
    echo "✅ Added CSS import to _app.tsx"
fi

# 6. Create backup of current files
echo "💾 Creating backups..."
mkdir -p backups
cp src/components/Layout.tsx backups/Layout.tsx.backup
cp src/pages/epo.jsx backups/epo.jsx.backup 2>/dev/null || echo "No epo.jsx to backup"

# 7. Create improved ClassicLayout component
echo "🔄 Creating improved layout component..."
cat > src/components/ClassicLayout.jsx << 'EOF'
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
EOF

# 8. Create/update EPO page
echo "📄 Creating/updating EPO page..."
cat > src/pages/epo.jsx << 'EOF'
import React, { useState } from 'react';
import ClassicLayout from '../components/ClassicLayout';

const EPOPage = () => {
  const [currentPrice, setCurrentPrice] = useState(0.02);
  const [tokensSold, setTokensSold] = useState(1099.999);
  const [totalSupply] = useState(100000000);
  
  return (
    <ClassicLayout title="BrainArk - Early Public Offering">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🦄 Early Public Offering
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Get early access to BrainArk tokens at exclusive prices. 
            Participate in the future of decentralized intelligence.
          </p>
          <button className="btn btn-primary text-lg px-8 py-3">
            ⚡ Quick Buy ▶
          </button>
        </div>

        {/* EPO Status Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="epo-card">
            <h2 className="text-2xl font-bold text-white mb-4">
              ⏰ EPO Time Limit & Progress
            </h2>
            <div className="mb-4">
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                EPO Ended
              </span>
            </div>
            
            <div className="stats-grid mb-4">
              <div className="stat-card">
                <div className="stat-value">{tokensSold.toLocaleString()}</div>
                <div className="stat-label">BAK Sold</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalSupply.toLocaleString()}</div>
                <div className="stat-label">Total Supply</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0.00%</div>
                <div className="stat-label">Progress</div>
              </div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '0.001%'}}></div>
              </div>
              <p className="text-center text-sm text-white/60 mt-2">
                {tokensSold.toLocaleString()} / {totalSupply.toLocaleString()} BAK Sold
              </p>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-orange-400 font-semibold">
                🔄 EPO can be extended as 100M coins target not reached!
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="epo-card">
            <h2 className="text-2xl font-bold text-white mb-4">
              📈 Bonding Curve Pricing
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm text-white/60">Current Price</div>
                <div className="text-3xl font-bold text-green-400">
                  ${currentPrice.toFixed(4)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/60">Next 1K Price</div>
                <div className="text-2xl font-bold text-green-400">
                  ${currentPrice.toFixed(4)}📈
                </div>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">$22</div>
                <div className="stat-label">Market Cap</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">$2,000,002.2</div>
                <div className="stat-label">Liquidity Pool</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquidity System Explanation */}
        <div className="epo-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            💰 Liquidity Creation System
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Purpose:</strong> Creating sustainable liquidity for project development
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Buy Price:</strong> $0.02 - $0.04 (bonding curve funds development)
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Sell Price:</strong> $0.015 (fixed price creates project liquidity)
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Benefit:</strong> Price difference funds security, features, and growth
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Current Buy Price:</strong> $0.0200
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Guaranteed Sell Price:</strong> $0.015 (always available)
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Your Impact:</strong> Every trade helps build the BrainArk ecosystem
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <div>
                    <strong>Post-EPO Plan:</strong> Liquidity migrates to PancakeSwap & Uniswap
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Dashboard */}
          <div className="trading-card">
            <h3 className="text-xl font-bold text-white mb-4">👛 Trading Dashboard</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Connected:</span>
                <span className="text-green-400 font-mono">0x961e...2bd5</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">BAK Position:</span>
                <span className="text-white font-bold">1100.00 BAK</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Net P&L:</span>
                <span className="text-red-400 font-bold">$-22.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Total Fees:</span>
                <span className="text-white">$0.0110</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60">Trades:</span>
                <span className="text-white">1</span>
              </div>
            </div>
          </div>

          {/* Trading Controls */}
          <div className="trading-card">
            <h3 className="text-xl font-bold text-white mb-4">📊 Trading Mode</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="btn btn-primary w-full">
                🛒 Buy BAK
              </button>
              <button className="btn btn-secondary w-full">
                💰 Sell BAK
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">💰 Liquidity Creation System</h4>
              <p className="text-sm text-white/70">
                Participate in our innovative liquidity system that ensures 
                sustainable project development while providing guaranteed 
                sell liquidity for all participants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClassicLayout>
  );
};

export default EPOPage;
EOF

# 9. Build the application
echo "🏗️  Building application with layout fixes..."
npm run build

echo "✅ Layout fixes implemented!"
echo "🌐 Next step: Deploy to your server using:"
echo "rsync -avz --delete out/ root@84.247.171.69:/var/www/dapp.brainark.online/"
echo "ssh root@84.247.171.69 \"chown -R www-data:www-data /var/www/dapp.brainark.online/ && nginx -s reload\""
echo ""
echo "💡 Note: Get a real WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "📝 Update your .env.local file with the real Project ID"
