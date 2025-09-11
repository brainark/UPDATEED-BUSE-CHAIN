import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import AutoDistributionAirdrop from '@/components/AutoDistributionAirdrop'
import EnhancedEPOSection from '@/components/EnhancedEPOSection'
import UseCasesSection from '@/components/UseCasesSection'
import ComprehensiveWhitepaper from '@/components/ComprehensiveWhitepaper'
// import StatsSection from '@/components/StatsSection' // Temporarily commented for build

export default function Home() {
  const [activeSection, setActiveSection] = useState<'hero' | 'airdrop' | 'epo' | 'usecases' | 'explorer' | 'whitepaper'>('hero')

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex justify-center space-x-2 py-4 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('hero')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'hero'
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => setActiveSection('airdrop')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'airdrop'
                      ? 'btn-airdrop shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🎁 Airdrop
                </button>
                <button
                  onClick={() => setActiveSection('epo')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'epo'
                      ? 'btn-epo shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🦄 EPO
                </button>
                <button
                  onClick={() => setActiveSection('usecases')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'usecases'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🚀 Use Cases
                </button>
                <button
                  onClick={() => setActiveSection('explorer')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'explorer'
                      ? 'btn-explorer shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  🔍 Explorer
                </button>
                <button
                  onClick={() => setActiveSection('whitepaper')}
                  className={`px-4 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === 'whitepaper'
                      ? 'btn-whitepaper shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  📄 Whitepaper
                </button>
              </nav>
            </div>
          </div>

          {/* Content Sections */}
          <div className="relative">
            {activeSection === 'hero' && (
              <div className="animate-fade-in">
                <Hero onNavigateToSection={(section: string) => setActiveSection(section as any)} />
                {/* <StatsSection /> Temporarily commented for build */}
              </div>
            )}
            
            {activeSection === 'airdrop' && (
              <div className="animate-fade-in">
                <AutoDistributionAirdrop />
              </div>
            )}
            
            {activeSection === 'epo' && (
              <div className="animate-fade-in">
                <EnhancedEPOSection />
              </div>
            )}

            {activeSection === 'usecases' && (
              <div className="animate-fade-in">
                <UseCasesSection />
              </div>
            )}

            {activeSection === 'explorer' && (
              <div className="animate-fade-in">
                <div className="min-h-screen bg-deep-black py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                        🔍 BrainArk Explorer
                      </h1>
                      <p className="text-xl text-gray-300">
                        Explore the BrainArk blockchain and network statistics
                      </p>
                    </div>
                    <div className="card-brilliant p-8 text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Explorer Coming Soon
                      </h2>
                      <p className="text-gray-600 mb-6">
                        The BrainArk blockchain explorer is currently under development.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-2">Block Explorer</h3>
                          <p className="text-sm text-blue-700">View blocks, transactions, and addresses</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Network Stats</h3>
                          <p className="text-sm text-green-700">Real-time network statistics and metrics</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h3 className="font-semibold text-purple-900 mb-2">Token Analytics</h3>
                          <p className="text-sm text-purple-700">BAK token distribution and analytics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'whitepaper' && (
              <div className="animate-fade-in">
                <ComprehensiveWhitepaper />
              </div>
            )}
          </div>
        </main>
      </Layout>
    </>
  )
}