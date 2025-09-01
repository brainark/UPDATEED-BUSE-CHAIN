import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Enhanced Components with Shaders
import { EnhancedLayout } from '@/components/enhanced/EnhancedLayout'
import { EnhancedNavigationFixed } from '@/components/enhanced/EnhancedNavigationFixed'
import { EnhancedHero } from '@/components/enhanced/EnhancedHero'
import { EnhancedSectionWrapper } from '@/components/enhanced/EnhancedSectionWrapper'

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
  const [activeSection, setActiveSection] = useState<SectionType>('hero')
  const [isLoading, setIsLoading] = useState(true)

  // Listen for navigation events from Hero component
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail as SectionType)
    }

    window.addEventListener('navigate-to-section', handleNavigation as EventListener)
    
    // Initial loading
    setIsLoading(false)
    
    return () => {
      window.removeEventListener('navigate-to-section', handleNavigation as EventListener)
    }
  }, [])

  const handleSectionNavigation = (section: string) => {
    setActiveSection(section as SectionType)
    
    // Smooth scroll to top when switching sections
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Dispatch custom event for other components
    const event = new CustomEvent('navigate-to-section', { detail: section })
    window.dispatchEvent(event)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading BrainArk...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>BrainArk - Decentralized Intelligence Ecosystem | Airdrop & EPO</title>
        <meta name="description" content="Join the BrainArk ecosystem - the future of decentralized intelligence. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content="BrainArk - Decentralized Intelligence Ecosystem" />
        <meta property="og:description" content="Join the BrainArk ecosystem - the future of decentralized intelligence. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brainark.online" />
        <meta property="og:image" content="https://brainark.online/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BrainArk - Decentralized Intelligence Ecosystem" />
        <meta name="twitter:description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our EPO." />
        <meta name="twitter:image" content="https://brainark.online/twitter-image.png" />
        
        {/* Performance & SEO */}
        <meta name="keywords" content="BrainArk, DeFi, Airdrop, EPO, Blockchain, Decentralized, Intelligence, Crypto" />
        <meta name="author" content="BrainArk Team" />
        <link rel="canonical" href="https://brainark.online" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="" />
      </Head>

      <EnhancedLayout>
        {/* Enhanced Navigation with Shader Background */}
        <EnhancedNavigationFixed 
          activeSection={activeSection}
          onNavigate={handleSectionNavigation}
        />
        
        {/* Main Content with Section-based Rendering */}
        <main className="pt-16">
          {/* Hero Section */}
          {activeSection === 'hero' && (
            <div className="animate-fade-in">
              <EnhancedHero onNavigateToSection={handleSectionNavigation} />
            </div>
          )}
          
          {/* Airdrop Section */}
          {activeSection === 'airdrop' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="airdrop">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      🎁 Claim Your <span className="text-green-400">Airdrop</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      Join thousands of users who have already claimed their BrainArk tokens. 
                      Don't miss out on this exclusive opportunity.
                    </p>
                  </div>
                  <AutoDistributionAirdropWithAppwrite />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}
          
          {/* EPO Section */}
          {activeSection === 'epo' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="epo">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      🦄 Early Public <span className="text-red-400">Offering</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      Get early access to BrainArk tokens at exclusive prices. 
                      Participate in the future of decentralized intelligence.
                    </p>
                  </div>
                  <EnhancedEPOWithBondingCurve />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}

          {/* Use Cases Section */}
          {activeSection === 'usecases' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="default" className="bg-gradient-to-br from-gray-900 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      🚀 Use <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Cases</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      Discover the endless possibilities and real-world applications of the BrainArk ecosystem.
                    </p>
                  </div>
                  <UseCasesSection />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}

          {/* Explorer Section */}
          {activeSection === 'explorer' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="explorer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      🔍 BrainArk <span className="text-purple-400">Explorer</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      Explore the BrainArk ecosystem, track transactions, and discover insights 
                      with our advanced blockchain explorer.
                    </p>
                  </div>
                  <DynamicBrainArkExplorer />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}

          {/* Whitepaper Section */}
          {activeSection === 'whitepaper' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="default" className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      📄 <span className="text-blue-400">Whitepaper</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      Deep dive into the technical details, tokenomics, and vision behind 
                      the BrainArk ecosystem.
                    </p>
                  </div>
                  <ComprehensiveWhitepaper />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}

          {/* Benchmark Section */}
          {activeSection === 'benchmark' && (
            <div className="animate-fade-in">
              <EnhancedSectionWrapper variant="default" className="bg-gradient-to-br from-yellow-900/20 to-red-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      ⚡ Performance <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">Benchmark</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                      See how BrainArk compares to other leading blockchain platforms 
                      in terms of speed, efficiency, and scalability.
                    </p>
                  </div>
                  <BenchmarkComparison />
                </div>
              </EnhancedSectionWrapper>
            </div>
          )}
        </main>

        {/* Enhanced Footer with Gradient */}
        <footer className="relative bg-gradient-to-t from-black via-gray-900 to-transparent border-t border-white/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Column */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">🧠</div>
                  <span className="text-2xl font-bold text-white">BrainArk</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  Building the future of decentralized intelligence through innovative 
                  blockchain technology and community-driven development.
                </p>
                <div className="flex space-x-4 mt-6">
                  {/* Social Links */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Discord</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => handleSectionNavigation('airdrop')} className="text-gray-400 hover:text-white transition-colors">Airdrop</button></li>
                  <li><button onClick={() => handleSectionNavigation('epo')} className="text-gray-400 hover:text-white transition-colors">EPO</button></li>
                  <li><button onClick={() => handleSectionNavigation('explorer')} className="text-gray-400 hover:text-white transition-colors">Explorer</button></li>
                  <li><button onClick={() => handleSectionNavigation('whitepaper')} className="text-gray-400 hover:text-white transition-colors">Whitepaper</button></li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                &copy; 2024 BrainArk. All rights reserved. Building the future of decentralized intelligence.
              </p>
            </div>
          </div>
        </footer>
      </EnhancedLayout>
    </>
  )
}
