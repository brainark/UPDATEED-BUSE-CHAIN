import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAccount, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import EnhancedEPOTradingPanel from '@/components/EnhancedEPOTradingPanel'
import EnhancedNetworkSwitcher from '@/components/EnhancedNetworkSwitcher'
import { useEnhancedEPOContract } from '@/hooks/useEnhancedEPOContract'

interface ValidationResult {
  timestamp: string
  validations: {
    contracts: any
    treasuries: any
    networks: any
    bscSpecific: any
  }
  summary: {
    totalChecks: number
    passed: number
    failed: number
    successRate: string
    status: string
  }
}

export default function TestEnhancedEPO() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const { stats, isLoading, error, refetch } = useEnhancedEPOContract()

  // Run validation on component mount
  useEffect(() => {
    runValidation()
  }, [])

  const runValidation = async () => {
    setIsValidating(true)
    try {
      const response = await fetch('/api/validate-integration')
      if (response.ok) {
        const results = await response.json()
        setValidationResults(results)
        
        if (results.summary.status === 'HEALTHY') {
          toast.success(`✅ System validation passed (${results.summary.successRate})`)
        } else if (results.summary.status === 'WARNING') {
          toast.error(`⚠️ System validation warnings (${results.summary.successRate})`)
        } else {
          toast.error(`❌ System validation failed (${results.summary.successRate})`)
        }
      } else {
        throw new Error('Validation API failed')
      }
    } catch (error: any) {
      console.error('Validation error:', error)
      toast.error('Failed to run system validation')
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-400'
      case 'WARNING': return 'text-yellow-400'
      case 'CRITICAL': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 56: return 'BSC'
      case 137: return 'Polygon'
      case 424242: return 'BrainArk'
      default: return 'Unknown'
    }
  }

  return (
    <>
      <Head>
        <title>Enhanced EPO Testing - BrainArk</title>
        <meta name="description" content="Test the enhanced EPO trading system with multi-network support" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              🧪 Enhanced EPO Testing Suite
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Comprehensive testing environment for the enhanced EPO trading system with multi-network support, 
              improved BSC integration, and advanced wallet connectivity.
            </p>
          </div>

          {/* System Status */}
          <div className="mb-8">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">🔍 System Status</h2>
                <button
                  onClick={runValidation}
                  disabled={isValidating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {isValidating ? '⏳ Validating...' : '🔄 Run Validation'}
                </button>
              </div>

              {validationResults && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm">Overall Status</div>
                    <div className={`text-xl font-bold ${getStatusColor(validationResults.summary.status)}`}>
                      {validationResults.summary.status}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm">Success Rate</div>
                    <div className="text-white text-xl font-bold">
                      {validationResults.summary.successRate}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm">Tests Passed</div>
                    <div className="text-green-400 text-xl font-bold">
                      {validationResults.summary.passed}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm">Tests Failed</div>
                    <div className="text-red-400 text-xl font-bold">
                      {validationResults.summary.failed}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowValidation(!showValidation)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                {showValidation ? 'Hide' : 'Show'} Detailed Results
              </button>

              {showValidation && validationResults && (
                <div className="mt-4 space-y-4">
                  {/* BSC Specific Tests */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h3 className="text-yellow-400 font-semibold mb-3">🟡 BSC Network Tests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>RPC Connectivity:</span>
                        <span className={validationResults.validations.bscSpecific?.rpcConnectivity ? 'text-green-400' : 'text-red-400'}>
                          {validationResults.validations.bscSpecific?.rpcConnectivity ? '✅ Connected' : '❌ Failed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chain ID (56):</span>
                        <span className={validationResults.validations.bscSpecific?.chainIdCorrect ? 'text-green-400' : 'text-red-400'}>
                          {validationResults.validations.bscSpecific?.chainIdCorrect ? '✅ Correct' : '❌ Wrong'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Treasury Addresses:</span>
                        <span className={validationResults.validations.bscSpecific?.treasuryValid ? 'text-green-400' : 'text-red-400'}>
                          {validationResults.validations.bscSpecific?.treasuryValid ? '✅ Valid' : '❌ Invalid'}
                        </span>
                      </div>
                    </div>
                    {validationResults.validations.bscSpecific?.blockNumber && (
                      <div className="mt-2 text-xs text-gray-400">
                        Latest Block: {validationResults.validations.bscSpecific.blockNumber.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Contract Tests */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-blue-400 font-semibold mb-3">📄 Contract Tests</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(validationResults.validations.contracts).map(([key, contract]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span>{contract.name}:</span>
                          <span className={contract.valid ? 'text-green-400' : 'text-red-400'}>
                            {contract.valid ? '✅ Working' : '❌ Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Network Tests */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h3 className="text-purple-400 font-semibold mb-3">🌐 Network Connectivity</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(validationResults.validations.networks).map(([network, data]: [string, any]) => (
                        <div key={network} className="flex justify-between">
                          <span>{network.charAt(0).toUpperCase() + network.slice(1)}:</span>
                          <span className={data.connected ? 'text-green-400' : 'text-red-400'}>
                            {data.connected ? `✅ ${data.latency}ms` : '❌ Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Connection Status */}
          <div className="mb-8">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">🔗 Current Connection</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">Wallet Status</div>
                  <div className={`text-xl font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                  </div>
                  {address && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      {address.slice(0, 10)}...{address.slice(-8)}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">Current Network</div>
                  <div className="text-white text-xl font-bold">
                    {getNetworkName(chainId)}
                  </div>
                  {chainId && (
                    <div className="text-xs text-gray-500 mt-1">
                      Chain ID: {chainId}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-gray-400 text-sm">EPO Contract</div>
                  <div className={`text-xl font-bold ${stats?.contractFound ? 'text-green-400' : 'text-red-400'}`}>
                    {isLoading ? '⏳ Loading' : stats?.contractFound ? '✅ Found' : '❌ Not Found'}
                  </div>
                  {error && (
                    <div className="text-xs text-red-400 mt-1">
                      {error.slice(0, 30)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced EPO Trading Panel */}
          <div className="mb-8">
            <EnhancedEPOTradingPanel />
          </div>

          {/* Test Instructions */}
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">📋 Testing Instructions</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">1. BSC Network Testing</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Use the network switcher to connect to BSC (Chain ID: 56)</li>
                  <li>Verify that BNB, USDT, and USDC options are available</li>
                  <li>Check that treasury addresses are properly configured</li>
                  <li>Test network switching timeout and retry logic</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">2. Multi-Network Support</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Switch between Ethereum, BSC, and Polygon networks</li>
                  <li>Verify token options change based on selected network</li>
                  <li>Test cross-chain payment processing</li>
                  <li>Validate treasury address mapping for each network</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">3. EPO Trading Panel</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Test BAK token calculation based on payment amount</li>
                  <li>Verify quick amount buttons work correctly</li>
                  <li>Test purchase flow with different tokens</li>
                  <li>Check transaction status and error handling</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">4. Error Handling</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Test network mismatch warnings</li>
                  <li>Verify timeout handling for slow connections</li>
                  <li>Test wallet rejection scenarios</li>
                  <li>Check fallback mechanisms for failed operations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>Enhanced EPO Testing Suite - BrainArk Besu Chain</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  )
}