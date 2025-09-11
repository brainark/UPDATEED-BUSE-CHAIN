import { useState, useEffect, useMemo, useCallback } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Brazilian-themed UI Components
import BrazilianShaderBackground from '@/components/BrazilianShaderBackground'
import { BrazilianAnimatedTabs, TabItem } from '@/components/ui/AnimatedTabs'
import { ElegantButton } from '@/components/ui/ElegantButton'
import ExodusButton from '@/components/ExodusButton'
import ExodusMigrationModal from '@/components/ExodusMigrationModal'
import MobileEPOTradingPanel from '@/components/MobileEPOTradingPanel'

// Original Components (wrapped with shader backgrounds)
import AutoDistributionAirdropWithAppwrite from '@/components/AutoDistributionAirdropWithAppwrite'
import EnhancedEPOWithBondingCurve from '@/components/EnhancedEPOWithBondingCurve'
import BrainArkExplorer from '@/components/BrainArkExplorer'
import UseCasesSection from '@/components/UseCasesSection'
import ComprehensiveWhitepaper from '@/components/ComprehensiveWhitepaper'
import BenchmarkComparison from '@/components/BenchmarkComparison'

// Dynamically load performance-heavy components with better optimization
const DynamicBrainArkExplorer = dynamic(() => import('@/components/BrainArkExplorer'), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-white animate-pulse">Loading Explorer...</div></div>,
  ssr: false
})

const DynamicMobileOptimizedExplorer = dynamic(() => import('@/components/MobileOptimizedExplorer'), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-white animate-pulse">Loading Explorer...</div></div>,
  ssr: false
})

const DynamicMobileOptimizedUseCases = dynamic(() => import('@/components/MobileOptimizedUseCases'), {
  loading: () => <div className="flex items-center justify-center min-h-[400px]"><div className="text-white animate-pulse">Loading Use Cases...</div></div>,
  ssr: false
})

const DynamicAutoDistributionAirdrop = dynamic(() => import('@/components/AutoDistributionAirdropWithAppwrite'), {
  loading: () => <div className="flex items-center justify-center min-h-[300px]"><div className="text-white animate-pulse">Loading Airdrop...</div></div>,
  ssr: false
})

const DynamicEnhancedEPO = dynamic(() => import('@/components/EnhancedEPOWithBondingCurve'), {
  loading: () => <div className="flex items-center justify-center min-h-[300px]"><div className="text-white animate-pulse">Loading EPO...</div></div>,
  ssr: false
})

type SectionType = 'hero' | 'airdrop' | 'epo' | 'usecases' | 'explorer' | 'whitepaper' | 'benchmark'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [showExodusMigration, setShowExodusMigration] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileTradingOpen, setIsMobileTradingOpen] = useState(false)

  useEffect(() => {
    // Initial loading with performance optimization
    const timer = setTimeout(() => setIsLoading(false), 100)
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const navigateToAirdrop = () => {
    setActiveTab('airdrop')
  }

  const navigateToEPO = () => {
    setActiveTab('epo')
  }

  const navigateToARKDEX = () => {
    setActiveTab('arkdex')
  }

  // Memoize tabs to prevent unnecessary re-renders
  const brazilianTabs: TabItem[] = useMemo(() => [
    {
      id: 'hero',
      label: 'Welcome',
      emoji: '🏠',
      content: (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-4">
              BrainArk Besu Chain
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-400 mb-6">
              A Layer 1 blockchain
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed max-w-4xl mx-auto">
              Building the future of decentralized intelligence through innovative blockchain technology 
              powered by Hyperledger Besu Istanbul Byzantine Fault Tolerance (IBFT) consensus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <ElegantButton variant="gold" size="lg" glow shimmer onClick={navigateToAirdrop}>
                🚀 Join the Airdrop
              </ElegantButton>
              <ElegantButton variant="emerald" size="lg" glow shimmer onClick={navigateToEPO}>
                📖 Join the EPO
              </ElegantButton>
              <ElegantButton variant="blue" size="lg" glow shimmer onClick={navigateToARKDEX}>
                🏛️ ARK DEX
              </ElegantButton>
            </div>
            
            {/* EXODUS Migration Button */}
            <div className="mb-8">
              <ExodusButton 
                onOpenMigration={() => setShowExodusMigration(true)}
                className="mx-auto"
              />
            </div>
            
            {/* Performance Benchmark Section */}
            <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-700/50">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-300 mb-4">
                🏎️ Performance Benchmark
              </h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-xl md:text-2xl">
                <div className="text-green-400 font-semibold">
                  ✅ Cheaper
                </div>
                <div className="text-blue-400 font-semibold">
                  ⚡ Faster
                </div>
                <div className="text-purple-400 font-semibold">
                  🏆 Unbeatable
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      emoji: '🎁',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              🎁 Claim Your Airdrop
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users in the BrainArk Besu Chain community. Claim your share of 
              native BAK coin rewards through our innovative airdrop system.
            </p>
          </div>
          <DynamicAutoDistributionAirdrop />
        </div>
      )
    },
    {
      id: 'epo',
      label: 'EPO',
      emoji: '💰',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              💰 Early Public Offering
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get early access to BrainArk native BAK coins at discounted prices. 
              Join the revolution of decentralized intelligence powered by Hyperledger Besu IBFT consensus.
            </p>
          </div>
          <DynamicEnhancedEPO />
        </div>
      )
    },
    {
      id: 'usecases',
      label: 'Use Cases',
      emoji: '🚀',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              ⚡ Infinite Possibilities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover real-world applications powered by Hyperledger Besu IBFT consensus and innovative blockchain technology. 
              The future is efficient and decentralized.
            </p>
          </div>
          <UseCasesSection />
        </div>
      )
    },
    {
      id: 'explorer',
      label: 'Explorer',
      emoji: '🔍',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              🗺️ Blockchain Explorer
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Navigate the BrainArk Besu Chain ecosystem with advanced tools. Explore transactions, 
              discover insights, and witness the power of Hyperledger Besu IBFT consensus.
            </p>
          </div>
          <DynamicBrainArkExplorer />
        </div>
      )
    },
    {
      id: 'whitepaper',
      label: 'Whitepaper',
      emoji: '📄',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              📚 Technical Documentation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Dive deep into the technical brilliance behind BrainArk Besu Chain. Discover the vision, 
              Hyperledger Besu IBFT consensus architecture, and native BAK coin economics crafted with precision.
            </p>
          </div>
          <ComprehensiveWhitepaper />
        </div>
      )
    },
    {
      id: 'arkdex',
      label: 'ARK DEX',
      emoji: '🏛️',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-4 sm:mb-6 px-4">
              🏛️ ARK DEX - Decentralized Exchange
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Experience seamless trading on the ARK DEX platform. Discover the future of decentralized finance.
            </p>
          </div>
          
          {/* IPFS Content Display */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-700/50 rounded-lg p-4 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-4 text-center">
                🌐 ARK DEX Platform
              </h3>
              
              {/* Responsive Video Display */}
              <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden border border-gray-600/50 bg-gray-900">
                <video 
                  autoPlay
                  muted
                  loop
                  className="w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] xl:h-[70vh] min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] max-h-[800px] object-cover rounded-lg cursor-pointer"
                  preload="metadata"
                  onClick={(e) => {
                    const video = e.target as HTMLVideoElement;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                  onTouchStart={(e) => {
                    // Improve mobile touch handling
                    e.preventDefault();
                  }}
                >
                  <source src="/ark-dex-demo.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-[40vh] sm:h-[50vh] lg:h-[60vh] text-gray-400">
                    <div className="text-center p-4">
                      <div className="text-2xl sm:text-4xl mb-2">🎬</div>
                      <p className="text-sm sm:text-base">Video not available</p>
                      <p className="text-xs sm:text-sm mt-2">Please add ark-dex-demo.mp4 to the public folder</p>
                    </div>
                  </div>
                </video>
                
                {/* Mobile-friendly video controls hint */}
                <div className="sm:hidden text-center text-xs text-gray-500 mt-2 px-2">
                  Tap to play/pause video
                </div>
              </div>
              
              {/* Liquidity Message */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4 sm:p-6 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-3">
                  <span className="text-2xl sm:text-3xl mb-1 sm:mb-0 sm:mr-2">💫</span>
                  <h4 className="text-lg sm:text-xl font-bold text-blue-300">Liquidity Distribution</h4>
                </div>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  At the end of the EPO, liquidity will be sent to <span className="font-bold text-blue-400">Uniswap</span>, 
                  <span className="font-bold text-yellow-400"> PancakeSwap</span>, and the 
                  <span className="font-bold text-purple-400"> ARK Swap</span> for easy trading, 
                  so we can buy and sell our <span className="font-bold text-orange-400">BAK coin</span> to enjoy this new revolution.
                </p>
                
                {/* Exchange Icons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🦄</div>
                    <span className="text-xs sm:text-sm text-blue-400">Uniswap</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🥞</div>
                    <span className="text-xs sm:text-sm text-yellow-400">PancakeSwap</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏛️</div>
                    <span className="text-xs sm:text-sm text-purple-400">ARK Swap</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'benchmark',
      label: 'Performance',
      emoji: '⚡',
      content: (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 mb-6">
              🏎️ Performance Benchmark
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Witness the speed and efficiency that powers BrainArk Besu Chain. Performance metrics 
              that showcase Hyperledger Besu IBFT consensus engineering excellence.
            </p>
          </div>
          <BenchmarkComparison />
        </div>
      )
    }
  ], [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading BrainArk...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>🧠 BrainArk - Decentralized Intelligence | Innovation Meets Global Vision</title>
        <meta name="description" content="Experience cutting-edge innovation with BrainArk. Join our vibrant community, claim exclusive native coin airdrops, and participate in the EPO with the power of blockchain technology." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FFD700" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content="🧠 BrainArk - Innovation Meets Blockchain" />
        <meta property="og:description" content="Join the vibrant BrainArk ecosystem powered by native coin economics and global blockchain technology." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brainark.online" />
        <meta property="og:image" content="https://brainark.online/og-image-brazil.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="🧠 BrainArk - Blockchain Innovation" />
        <meta name="twitter:description" content="Experience blockchain with advanced features. Efficient, powerful, and revolutionary." />
        <meta name="twitter:image" content="https://brainark.online/twitter-image-brazil.png" />
        
        {/* Performance & SEO */}
        <meta name="keywords" content="BrainArk, Native Coin, DeFi, Airdrop, EPO, Blockchain, Layer1, EVM, Innovative, Efficient" />
        <meta name="author" content="BrainArk Team" />
        <link rel="canonical" href="https://brainark.online" />
        
        {/* Remove missing font preload */}
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Brazilian Shader Background - Optimized */}
        <BrazilianShaderBackground 
          variant="classic" 
          intensity="low" 
          animated={true}
        />
        
        {/* Main Content with Brazilian Tabs */}
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* BrainArk Header */}
            <header className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-4xl">🧠</span>
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700">
                  BrainArk
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Building the future of decentralized intelligence with innovative blockchain technology 
                powered <span className="font-bold text-gray-400">BY</span> Hyperledger Besu Istanbul Byzantine Fault Tolerance (IBFT) consensus
                <br />
                <span className="font-bold text-gray-400"> Join the revolution!</span>
              </p>
            </header>

            {/* Brazilian Animated Tabs */}
            <BrazilianAnimatedTabs
              tabs={brazilianTabs}
              defaultTabId={activeTab}
              variant="brazilian"
              className="max-w-7xl mx-auto"
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Enhanced BrainArk Footer */}
        <footer className="relative z-10 bg-gradient-to-t from-black via-gray-900/90 to-transparent border-t border-gray-500/20 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Column */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🧠</div>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700">
                    BrainArk
                  </span>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-4">
                  Building the future of decentralized intelligence with innovative blockchain technology 
                  powered BY Hyperledger Besu Istanbul Byzantine Fault Tolerance (IBFT) consensus.
                  <br />
                  Join the revolution!
                </p>
                
                {/* Social Links */}
                <div className="flex space-x-4 mt-6">
                  <ElegantButton variant="gold" size="sm">
                    🐦 Twitter
                  </ElegantButton>
                  <ElegantButton variant="emerald" size="sm">
                    💬 Telegram
                  </ElegantButton>
                  <ElegantButton variant="royal" size="sm">
                    💻 GitHub
                  </ElegantButton>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-gray-400 font-bold text-lg mb-4">🚀 Navigation</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">🎁 Airdrop</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">💰 EPO</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">🔍 Explorer</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">📄 Whitepaper</li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="text-gray-400 font-bold text-lg mb-4">📚 Resources</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">📖 Documentation</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">⚡ API</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">🤝 Support</li>
                  <li className="text-gray-300 hover:text-gray-400 cursor-pointer transition-colors">📋 Terms</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-500/20 mt-12 pt-8 text-center">
              <p className="text-gray-400 mb-2">
                <span className="text-gray-400">⚡</span> Powered by Hyperledger Besu IBFT consensus and innovative blockchain technology <span className="text-gray-400">⚡</span>
              </p>
              <p className="text-gray-500 text-sm">
                &copy; 2024 BrainArk Besu Chain. All rights reserved. Building the future of decentralized intelligence.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Trading Button - Fixed position */}
      {isMobile && (
        <button
          onClick={() => setIsMobileTradingOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 animate-pulse md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </button>
      )}

      {/* Mobile Trading Panel */}
      {isMobileTradingOpen && (
        <MobileEPOTradingPanel 
          onClose={() => setIsMobileTradingOpen(false)}
        />
      )}

      {/* EXODUS Migration Modal */}
      <ExodusMigrationModal 
        isOpen={showExodusMigration}
        onClose={() => setShowExodusMigration(false)}
      />
    </>
  )
}