import React, { useState, useEffect, useCallback } from 'react'
import NetworkCleanupTool from './NetworkCleanupTool'

interface WalletTroubleshooterProps {
  onResolved?: () => void
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletTroubleshooter({ onResolved }: WalletTroubleshooterProps) {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [isRunning, setIsRunning] = useState(false)
  const [showCleanupTool, setShowCleanupTool] = useState(false)
  const [step, setStep] = useState(0)

  const getProvider = useCallback(() => {
    if (typeof window.ethereum === 'undefined') return null
    
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      return window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum
    }
    
    return window.ethereum
  }, [])

  // Run comprehensive diagnostics
  const runDiagnostics = useCallback(async () => {
    setIsRunning(true)
    setStep(0)
    
    const results: any = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
      url: window.location.href
    }

    try {
      // Step 1: Check MetaMask installation
      setStep(1)
      results.metamaskInstalled = !!window.ethereum
      results.isMetaMask = window.ethereum?.isMetaMask
      results.providers = window.ethereum?.providers?.length || 0
      
      if (!results.metamaskInstalled) {
        results.issue = 'MetaMask not installed'
        results.solution = 'Install MetaMask extension'
        setDiagnostics(results)
        setIsRunning(false)
        return
      }

      // Step 2: Check provider
      setStep(2)
      const provider = getProvider()
      results.providerFound = !!provider
      
      if (!provider) {
        results.issue = 'MetaMask provider not accessible'
        results.solution = 'Refresh page or restart browser'
        setDiagnostics(results)
        setIsRunning(false)
        return
      }

      // Step 3: Check connection
      setStep(3)
      try {
        const accounts = await provider.request({ method: 'eth_accounts' })
        results.connected = accounts && accounts.length > 0
        results.account = accounts?.[0] || null
      } catch (error: any) {
        results.connected = false
        results.connectionError = error.message
      }

      // Step 4: Check current network
      setStep(4)
      try {
        const chainId = await provider.request({ method: 'eth_chainId' })
        results.currentChainId = chainId
        results.currentChainIdDecimal = parseInt(chainId, 16)
        results.isBrainArk = chainId === '0x67932'
      } catch (error: any) {
        results.networkError = error.message
      }

      // Step 5: Test BrainArk network connectivity
      setStep(5)
      const rpcEndpoints = [
        'http://localhost:8545',
        'http://localhost:8547', 
        'http://localhost:8549',
        'http://localhost:8551'
      ]
      
      results.networkTests = {}
      
      for (const rpc of rpcEndpoints) {
        try {
          const response = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_blockNumber',
              params: [],
              id: 1
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            results.networkTests[rpc] = {
              status: 'online',
              blockNumber: data.result ? parseInt(data.result, 16) : null
            }
          } else {
            results.networkTests[rpc] = { status: 'error', error: response.statusText }
          }
        } catch (error: any) {
          results.networkTests[rpc] = { status: 'offline', error: error.message }
        }
      }

      // Step 6: Check for network conflicts
      setStep(6)
      const conflictingChains = ['0x7a69', '0x539', '0x1337'] // Hardhat, Ganache, Local
      results.conflicts = []
      
      for (const chainId of conflictingChains) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          })
          results.conflicts.push(chainId)
        } catch (error: any) {
          // Network doesn't exist, which is good
        }
      }

      // Determine main issue and solution
      if (results.conflicts.length > 0) {
        results.issue = 'Network RPC conflict detected'
        results.solution = 'Remove conflicting networks or use alternative RPC'
        setShowCleanupTool(true)
      } else if (!results.connected) {
        results.issue = 'Wallet not connected'
        results.solution = 'Connect MetaMask wallet'
      } else if (!results.isBrainArk) {
        results.issue = 'Wrong network'
        results.solution = 'Switch to BrainArk network'
      } else if (Object.values(results.networkTests).every((test: any) => test.status !== 'online')) {
        results.issue = 'BrainArk blockchain not running'
        results.solution = 'Start your Besu blockchain nodes'
      } else {
        results.issue = 'No issues detected'
        results.solution = 'System appears to be working correctly'
      }

    } catch (error: any) {
      results.issue = 'Diagnostic error'
      results.solution = 'Refresh page and try again'
      results.error = error.message
    }

    setDiagnostics(results)
    setIsRunning(false)
  }, [getProvider])

  // Auto-run diagnostics on mount
  useEffect(() => {
    runDiagnostics()
  }, [runDiagnostics])

  const getStepName = (stepNum: number) => {
    const steps = [
      'Initializing...',
      'Checking MetaMask installation...',
      'Checking provider access...',
      'Checking wallet connection...',
      'Checking current network...',
      'Testing network connectivity...',
      'Checking for conflicts...'
    ]
    return steps[stepNum] || 'Complete'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50'
      case 'offline': return 'text-red-600 bg-red-50'
      case 'error': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          🔧 Wallet Connection Troubleshooter
        </h2>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isRunning ? 'Running...' : '🔄 Re-run Diagnostics'}
        </button>
      </div>

      {isRunning && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 dark:text-blue-300">{getStepName(step)}</span>
          </div>
          <div className="mt-2 bg-blue-200 dark:bg-blue-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {diagnostics.issue && (
        <div className={`mb-4 p-4 rounded-lg ${
          diagnostics.issue === 'No issues detected' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <h3 className={`font-bold mb-2 ${
            diagnostics.issue === 'No issues detected' 
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {diagnostics.issue === 'No issues detected' ? '✅ Status: Good' : '⚠️ Issue Detected'}
          </h3>
          <p className={`text-sm mb-2 ${
            diagnostics.issue === 'No issues detected' 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            <strong>Problem:</strong> {diagnostics.issue}
          </p>
          <p className={`text-sm ${
            diagnostics.issue === 'No issues detected' 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            <strong>Solution:</strong> {diagnostics.solution}
          </p>
        </div>
      )}

      {showCleanupTool && (
        <NetworkCleanupTool onComplete={() => {
          setShowCleanupTool(false)
          runDiagnostics()
          onResolved?.()
        }} />
      )}

      {/* Detailed Diagnostics */}
      <details className="mb-4">
        <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
          📊 Detailed Diagnostics
        </summary>
        
        <div className="mt-4 space-y-4">
          {/* MetaMask Status */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">MetaMask Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Installed:</span>
                <span className={`ml-2 ${diagnostics.metamaskInstalled ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.metamaskInstalled ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Is MetaMask:</span>
                <span className={`ml-2 ${diagnostics.isMetaMask ? 'text-green-600' : 'text-yellow-600'}`}>
                  {diagnostics.isMetaMask ? '✅ Yes' : '⚠️ Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Providers:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{diagnostics.providers || 0}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                <span className={`ml-2 ${diagnostics.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.connected ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
            {diagnostics.account && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Account:</span>
                <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">{diagnostics.account}</span>
              </div>
            )}
          </div>

          {/* Network Status */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Network Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Current Chain:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {diagnostics.currentChainId} ({diagnostics.currentChainIdDecimal})
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Is BrainArk:</span>
                <span className={`ml-2 ${diagnostics.isBrainArk ? 'text-green-600' : 'text-red-600'}`}>
                  {diagnostics.isBrainArk ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
            {diagnostics.conflicts && diagnostics.conflicts.length > 0 && (
              <div className="mt-2 text-sm">
                <span className="text-red-600">⚠️ Conflicting networks:</span>
                <span className="ml-2 text-red-700">{diagnostics.conflicts.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Network Connectivity */}
          {diagnostics.networkTests && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">BrainArk Network Connectivity</h4>
              <div className="space-y-2">
                {Object.entries(diagnostics.networkTests).map(([rpc, test]: [string, any]) => (
                  <div key={rpc} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{rpc}:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(test.status)}`}>
                      {test.status === 'online' ? `✅ Block ${test.blockNumber}` : 
                       test.status === 'offline' ? '❌ Offline' : 
                       '⚠️ Error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.open('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html', '_blank')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
              >
                🦊 Open MetaMask
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => setShowCleanupTool(!showCleanupTool)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              >
                🔧 Network Cleanup
              </button>
            </div>
          </div>
        </div>
      </details>

      {diagnostics.issue === 'No issues detected' && (
        <button
          onClick={onResolved}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ✅ Continue with Wallet Connection
        </button>
      )}
    </div>
  )
}