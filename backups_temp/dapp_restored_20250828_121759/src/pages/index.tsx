import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Brazilian-themed UI Components
import BrazilianShaderBackground from '@/components/BrazilianShaderBackground'
import { BrazilianAnimatedTabs, TabItem } from '@/components/ui/AnimatedTabs'
import { ElegantButton } from '@/components/ui/ElegantButton'

// Original Components (wrapped with shader backgrounds)
import AutoDistributionAirdropWithAppwrite from '@/components/AutoDistributionAirdropWithAppwrite'
import EnhancedEPOWithBondingCurve from '@/components/EnhancedEPOWithBondingCurve'
import BrainArkExplorer from '@/components/BrainArkExplorer'
import UseCasesSection from '@/components/UseCasesSection'
import ComprehensiveWhitepaper from '@/components/ComprehensiveWhitepaper'
import BenchmarkComparison from '@/components/BenchmarkComparison'

// Dynamically load performance-heavy components
const DynamicBrainArkExplorer = dynamic(() => import('@/components/BrainArkExplorer'), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-white">Loading Explorer...</div></div>
})

type SectionType = 'hero' | 'airdrop' | 'epo' | 'usecases' | 'explorer' | 'whitepaper' | 'benchmark'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial loading
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading BrainArk...</div>
      </div>
    )
  }

  // Define tabs for Brazilian-themed interface
  const brazilianTabs: TabItem[] = [
    {
      id: 'hero',
      label: 'Welcome',
      emoji: '🏠',
      content: (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 mb-6">
              BrainArk
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Building the future of decentralized intelligence through innovative 
              blockchain technology with Brazilian passion and global vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ElegantButton variant="brazil" size="lg" glow shimmer>
                🚀 Start Your Journey
              </ElegantButton>
              <ElegantButton variant="gold" size="lg" glow shimmer>
                📖 Learn More
              </ElegantButton>
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600 mb-6">
              🇧🇷 Claim Your Airdrop
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users in the BrainArk community. Experience the warmth of Brazilian 
              hospitality with exclusive token rewards.
            </p>
          </div>
          <AutoDistributionAirdropWithAppwrite />
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-500 to-orange-500 mb-6">
              🏆 Early Public Offering
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get early access to BrainArk tokens with the spirit of Brazilian innovation. 
              Join the revolution of decentralized intelligence.
            </p>
          </div>
          <EnhancedEPOWithBondingCurve />
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6">
              ⚡ Infinite Possibilities
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover real-world applications powered by Brazilian creativity and global innovation. 
              The future is bright and colorful.
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
              🗺️ Blockchain Explorer
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Navigate the BrainArk ecosystem with Brazilian flair. Explore transactions, 
              discover insights, and witness the beauty of decentralized networks.
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6">
              📚 Technical Documentation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Dive deep into the technical brilliance behind BrainArk. Discover the vision, 
              architecture, and tokenomics crafted with Brazilian precision.
            </p>
          </div>
          <ComprehensiveWhitepaper />
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
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 mb-6">
              🏎️ Performance Benchmark
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Witness the speed and efficiency that powers BrainArk. Performance metrics 
              that showcase Brazilian engineering excellence on a global scale.
            </p>
          </div>
          <BenchmarkComparison />
        </div>
      )
    }
  ]

  return (
    <>
      <Head>
        <title>🇧🇷 BrainArk - Decentralized Intelligence | Brazilian Innovation Meets Global Vision</title>
        <meta name="description" content="Experience the warmth of Brazilian innovation with BrainArk. Join our vibrant community, claim exclusive airdrops, and participate in the EPO with the spirit of samba and the power of blockchain." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FFD700" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content="🇧🇷 BrainArk - Brazilian Innovation Meets Blockchain" />
        <meta property="og:description" content="Join the vibrant BrainArk ecosystem powered by Brazilian creativity and global blockchain technology." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brainark.online" />
        <meta property="og:image" content="https://brainark.online/og-image-brazil.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="🇧🇷 BrainArk - Brazilian Blockchain Innovation" />
        <meta name="twitter:description" content="Experience blockchain with Brazilian flair. Colorful, vibrant, and revolutionary." />
        <meta name="twitter:image" content="https://brainark.online/twitter-image-brazil.png" />
        
        {/* Performance & SEO */}
        <meta name="keywords" content="BrainArk, Brasil, Brazil, DeFi, Airdrop, EPO, Blockchain, Samba, Colorful, Vibrant" />
        <meta name="author" content="BrainArk Brasil Team" />
        <link rel="canonical" href="https://brainark.online" />
        
        {/* Brazilian-themed preloads */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Brazilian Shader Background */}
        <BrazilianShaderBackground 
          variant="classic" 
          intensity="medium" 
          animated={true}
        />
        
        {/* Main Content with Brazilian Tabs */}
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Brazilian Header */}
            <header className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-4xl">🧠</span>
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600">
                  BrainArk
                </h1>
                <span className="text-4xl">🇧🇷</span>
              </div>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Where Brazilian creativity meets blockchain innovation. 
                <span className="font-bold text-yellow-400"> Bem-vindos </span> 
                to the future of decentralized intelligence!
              </p>
            </header>

            {/* Brazilian Animated Tabs */}
            <BrazilianAnimatedTabs
              tabs={brazilianTabs}
              defaultTabId="hero"
              variant="brazilian"
              className="max-w-7xl mx-auto"
            />
          </div>
        </div>

        {/* Enhanced Brazilian Footer */}
        <footer className="relative z-10 bg-gradient-to-t from-black via-gray-900/90 to-transparent border-t border-yellow-500/20 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Column with Brazilian Flair */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🧠</div>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-500 to-blue-600">
                    BrainArk Brasil
                  </span>
                  <div className="text-2xl">🇧🇷</div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-4">
                  Construindo o futuro da inteligência descentralizada com a paixão brasileira 
                  e visão global. Junte-se à revolução colorida!
                </p>
                <p className="text-gray-400 text-sm">
                  Building the future of decentralized intelligence with Brazilian passion and global vision.
                </p>
                
                {/* Social Links with Brazilian theme */}
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
                <h3 className="text-yellow-400 font-bold text-lg mb-4">🚀 Navegação</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors">🎁 Airdrop</li>
                  <li className="text-gray-300 hover:text-green-400 cursor-pointer transition-colors">💰 EPO</li>
                  <li className="text-gray-300 hover:text-blue-400 cursor-pointer transition-colors">🔍 Explorer</li>
                  <li className="text-gray-300 hover:text-purple-400 cursor-pointer transition-colors">📄 Whitepaper</li>
                </ul>
              </div>
              
              {/* Resources with Brazilian touch */}
              <div>
                <h3 className="text-green-400 font-bold text-lg mb-4">📚 Recursos</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors">📖 Documentação</li>
                  <li className="text-gray-300 hover:text-green-400 cursor-pointer transition-colors">⚡ API</li>
                  <li className="text-gray-300 hover:text-blue-400 cursor-pointer transition-colors">🤝 Suporte</li>
                  <li className="text-gray-300 hover:text-purple-400 cursor-pointer transition-colors">📋 Termos</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-yellow-500/20 mt-12 pt-8 text-center">
              <p className="text-gray-400 mb-2">
                <span className="text-yellow-400">⚡</span> Powered by Brazilian creativity and global innovation <span className="text-green-400">⚡</span>
              </p>
              <p className="text-gray-500 text-sm">
                &copy; 2024 BrainArk Brasil. Todos os direitos reservados. 🇧🇷 Made with ❤️ for the world.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}