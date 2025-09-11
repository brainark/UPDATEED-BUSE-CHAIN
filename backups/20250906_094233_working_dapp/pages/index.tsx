import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAccount, useChainId } from 'wagmi'

// Import all optimized components
import EnhancedEPOTradingPanel from '@/components/EnhancedEPOTradingPanel'
import EnhancedNetworkSwitcher from '@/components/EnhancedNetworkSwitcher'
import AutoDistributionAirdropWithAppwrite from '@/components/AutoDistributionAirdropWithAppwrite'
import BrainArkExplorer from '@/components/BrainArkExplorer'
import UseCasesSection from '@/components/UseCasesSection'
import ComprehensiveWhitepaper from '@/components/ComprehensiveWhitepaper'
import BenchmarkComparison from '@/components/BenchmarkComparison'
import BrazilianShaderBackground from '@/components/BrazilianShaderBackground'
import { BrazilianAnimatedTabs, TabItem } from '@/components/ui/AnimatedTabs'
import ExodusButton from '@/components/ExodusButton'
import ExodusMigrationModal from '@/components/ExodusMigrationModal'

// Use enhanced hooks with all fixes
import { useEnhancedEPOContract } from '@/hooks/useEnhancedEPOContract'
import { useEnhancedAPI } from '@/hooks/useEnhancedAPI'

export default function OptimizedBrainArkDApp() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [activeTab, setActiveTab] = useState<string>('epo')
  const [showExodusMigration, setShowExodusMigration] = useState(false)

  // Use enhanced EPO contract with BigInt fixes
  const { stats, isLoading, refetch } = useEnhancedEPOContract()

  useEffect(() => {
    // Initialize enhanced features
    refetch()
  }, [refetch])

  const tabs: TabItem[] = [
    {
      id: 'epo',
      label: '🚀 EPO Trading',
      content: (
        <div className="space-y-6">
          <EnhancedEPOTradingPanel />
        </div>
      )
    },
    {
      id: 'airdrop',
      label: '🎁 Airdrop',
      content: (
        <div className="space-y-6">
          <AutoDistributionAirdropWithAppwrite />
        </div>
      )
    },
    {
      id: 'explorer',
      label: '🔍 Explorer',
      content: (
        <div className="space-y-6">
          <BrainArkExplorer />
        </div>
      )
    },
    {
      id: 'usecases', 
      label: '💡 Use Cases',
      content: (
        <div className="space-y-6">
          <UseCasesSection />
        </div>
      )
    },
    {
      id: 'whitepaper',
      label: '📄 Whitepaper', 
      content: (
        <div className="space-y-6">
          <ComprehensiveWhitepaper />
        </div>
      )
    },
    {
      id: 'benchmarks',
      label: '📊 Benchmarks',
      content: (
        <div className="space-y-6">
          <BenchmarkComparison />
        </div>
      )
    }
  ]

  return (
    <>
      <Head>
        <title>BrainArk DApp - Enhanced & Optimized</title>
        <meta name="description" content="BrainArk Besu Chain DApp with enhanced performance and optimized trading" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
          {/* Enhanced Header */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  BrainArk DApp
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mt-2">
                  Enhanced & Optimized Trading Platform
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <EnhancedNetworkSwitcher />
                <ExodusButton />
              </div>
            </div>

            {/* Status Display */}
            {isConnected && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Connected Account</p>
                    <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Network</p>
                    <p className="text-sm">{chainId === 424242 ? 'BrainArk' : `Chain ${chainId}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">EPO Status</p>
                    <p className="text-sm">{isLoading ? 'Loading...' : stats ? 'Connected' : 'Disconnected'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content with Enhanced Tabs */}
            <BrazilianAnimatedTabs
              tabs={tabs}
              className="w-full"
            />
          </div>

          {/* Exodus Migration Modal */}
          <ExodusMigrationModal
            isOpen={showExodusMigration}
            onClose={() => setShowExodusMigration(false)}
          />
        </div>
      </div>
    </>
  )
}