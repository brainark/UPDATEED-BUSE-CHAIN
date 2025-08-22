import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import AutoDistributionAirdropWithAppwrite from '@/components/AutoDistributionAirdropWithAppwrite'
import EnhancedEPOWithBondingCurve from '@/components/EnhancedEPOWithBondingCurve'
import BrainArkExplorer from '@/components/BrainArkExplorer'
import UseCasesSection from '@/components/UseCasesSection'
import ComprehensiveWhitepaper from '@/components/ComprehensiveWhitepaper'
import BenchmarkComparison from '@/components/BenchmarkComparison'
import StatsSection from '@/components/StatsSection'

export default function Home() {
  const [activeSection, setActiveSection] = useState<'hero' | 'airdrop' | 'epo' | 'usecases' | 'explorer' | 'whitepaper' | 'benchmark'>('hero')

  // Listen for navigation events from Hero component
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      setActiveSection(event.detail as any)
    }

    window.addEventListener('navigate-to-section', handleNavigation as EventListener)
    
    return () => {
      window.removeEventListener('navigate-to-section', handleNavigation as EventListener)
    }
  }, [])

  return (
    <>
      <Head>
        <title>BrainArk Airdrop & EPO - Decentralized Future</title>
        <meta name="description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="BrainArk Airdrop & EPO" />
        <meta property="og:description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brainark.online" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BrainArk Airdrop & EPO" />
        <meta name="twitter:description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
      </Head>

      <Layout>
        <main className="min-h-screen bg-deep-black">
          {/* Enhanced Navigation Tabs with Colorful Buttons */}
          <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <nav className="flex justify-start sm:justify-center space-x-1 sm:space-x-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveSection('hero')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'hero'
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">🏠 Home</span>
                  <span className="sm:hidden">🏠</span>
                </button>
                <button
                  onClick={() => setActiveSection('airdrop')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'airdrop'
                      ? 'btn-airdrop shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">🎁 Airdrop</span>
                  <span className="sm:hidden">🎁</span>
                </button>
                <button
                  onClick={() => setActiveSection('epo')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'epo'
                      ? 'btn-epo shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">🦄 EPO</span>
                  <span className="sm:hidden">🦄</span>
                </button>
                <button
                  onClick={() => setActiveSection('usecases')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'usecases'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">🚀 Use Cases</span>
                  <span className="sm:hidden">🚀</span>
                </button>
                <button
                  onClick={() => setActiveSection('explorer')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'explorer'
                      ? 'btn-explorer shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">🔍 Explorer</span>
                  <span className="sm:hidden">🔍</span>
                </button>
                <button
                  onClick={() => setActiveSection('whitepaper')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'whitepaper'
                      ? 'btn-whitepaper shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">📄 Whitepaper</span>
                  <span className="sm:hidden">📄</span>
                </button>
                <button
                  onClick={() => setActiveSection('benchmark')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center ${
                    activeSection === 'benchmark'
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">⚡ Benchmark</span>
                  <span className="sm:hidden">⚡</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Sections */}
          <div className="relative">
            {activeSection === 'hero' && (
              <div className="animate-fade-in">
                <Hero onNavigateToSection={(section: string) => setActiveSection(section as any)} />
                <StatsSection />
              </div>
            )}
            
            {activeSection === 'airdrop' && (
              <div className="animate-fade-in">
                <AutoDistributionAirdropWithAppwrite />
              </div>
            )}
            
            {activeSection === 'epo' && (
              <div className="animate-fade-in">
                <EnhancedEPOWithBondingCurve />
              </div>
            )}

            {activeSection === 'usecases' && (
              <div className="animate-fade-in">
                <UseCasesSection />
              </div>
            )}

            {activeSection === 'explorer' && (
              <div className="animate-fade-in">
                <BrainArkExplorer />
              </div>
            )}

            {activeSection === 'whitepaper' && (
              <div className="animate-fade-in">
                <ComprehensiveWhitepaper />
              </div>
            )}

            {activeSection === 'benchmark' && (
              <div className="animate-fade-in">
                <BenchmarkComparison />
              </div>
            )}
          </div>
        </main>
      </Layout>
    </>
  )
}