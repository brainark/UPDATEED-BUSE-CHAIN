import React, { useState, useCallback } from 'react'

interface NetworkCleanupToolProps {
  onComplete?: () => void
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function NetworkCleanupTool({ onComplete }: NetworkCleanupToolProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [networks, setNetworks] = useState<any[]>([])
  const [isRemoving, setIsRemoving] = useState(false)
  const [status, setStatus] = useState<string>('')

  const getProvider = useCallback(() => {
    if (typeof window.ethereum === 'undefined') return null
    
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      return window.ethereum.providers.find((p: any) => p.isMetaMask) || window.ethereum
    }
    
    return window.ethereum
  }, [])

  // Check for conflicting networks
  const checkNetworks = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setStatus('MetaMask not detected')
      return
    }

    setIsChecking(true)
    setStatus('Checking for conflicting networks...')

    try {
      // Get current chain ID
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      setStatus(`Current network: ${currentChainId} (${parseInt(currentChainId, 16)})`)

      // Common conflicting networks that use localhost:8545
      const conflictingNetworks = [
        { chainId: '0x7a69', name: 'Hardhat Local', rpc: 'http://localhost:8545' },
        { chainId: '0x539', name: 'Ganache Local', rpc: 'http://localhost:8545' },
        { chainId: '0x1337', name: 'Local Testnet', rpc: 'http://localhost:8545' },
      ]

      const foundNetworks = []
      
      for (const network of conflictingNetworks) {
        try {
          // Try to switch to see if network exists
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.chainId }],
          })
          foundNetworks.push(network)
          setStatus(`Found conflicting network: ${network.name} (${network.chainId})`)
        } catch (error: any) {
          // Network doesn't exist, which is good
          if (error.code !== 4902) {
            console.log(`Network ${network.name} check failed:`, error.message)
          }
        }
      }

      setNetworks(foundNetworks)
      
      if (foundNetworks.length === 0) {
        setStatus('✅ No conflicting networks found')
      } else {
        setStatus(`⚠️ Found ${foundNetworks.length} conflicting network(s)`)
      }

    } catch (error: any) {
      console.error('Error checking networks:', error)
      setStatus('❌ Failed to check networks')
    } finally {
      setIsChecking(false)
    }
  }, [getProvider])

  // Remove conflicting networks (manual instructions)
  const removeConflictingNetworks = useCallback(async () => {
    setIsRemoving(true)
    setStatus('Please follow the manual steps to remove conflicting networks...')

    // Since we can't programmatically remove networks, provide instructions
    const instructions = [
      '1. Open MetaMask extension',
      '2. Click on the network dropdown at the top',
      '3. Find networks using localhost:8545 (like "Hardhat Local")',
      '4. Click the "X" or "Remove" button next to each conflicting network',
      '5. Confirm the removal',
      '6. Come back and try adding BrainArk network again'
    ]

    alert(`To resolve the RPC endpoint conflict:\n\n${instructions.join('\n')}`)
    
    setStatus('📋 Manual removal instructions provided')
    setIsRemoving(false)
    onComplete?.()
  }, [onComplete])

  // Auto-fix by switching to a different RPC
  const switchToAlternativeRPC = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return

    setIsRemoving(true)
    setStatus('Attempting to add BrainArk network with alternative RPC...')

    try {
      // Try adding BrainArk network with a different port
      const brainarkNetwork = {
        chainId: '0x67932',
        chainName: 'BrainArk Besu Network (Alt)',
        nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
        rpcUrls: ['http://localhost:8547'], // Use node2 instead
        blockExplorerUrls: ['http://localhost:3000']
      }

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [brainarkNetwork],
      })

      setStatus('✅ Successfully added BrainArk network with alternative RPC')
      onComplete?.()
    } catch (error: any) {
      console.error('Failed to add alternative network:', error)
      setStatus('❌ Failed to add alternative network')
    } finally {
      setIsRemoving(false)
    }
  }, [getProvider, onComplete])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-yellow-500">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        🔧 Network Conflict Resolution Tool
      </h3>
      
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Issue:</strong> MetaMask detected a network conflict. Multiple networks are trying to use the same RPC endpoint (localhost:8545).
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={checkNetworks}
            disabled={isChecking}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Checking...
              </>
            ) : (
              <>
                🔍 Check Networks
              </>
            )}
          </button>

          {networks.length > 0 && (
            <>
              <button
                onClick={removeConflictingNetworks}
                disabled={isRemoving}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📋 Manual Removal Guide
              </button>

              <button
                onClick={switchToAlternativeRPC}
                disabled={isRemoving}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Use Alternative RPC
              </button>
            </>
          )}
        </div>

        {status && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">{status}</p>
          </div>
        )}

        {networks.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Conflicting Networks Found:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {networks.map((network, index) => (
                <li key={index}>
                  • {network.name} ({network.chainId}) - {network.rpc}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Solutions:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li><strong>Option 1:</strong> Remove conflicting networks manually from MetaMask</li>
            <li><strong>Option 2:</strong> Use alternative RPC endpoint (localhost:8547)</li>
            <li><strong>Option 3:</strong> Change your Besu node to use a different port</li>
          </ol>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Available BrainArk RPC Endpoints:</h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Node 1: http://localhost:8545 (Primary)</li>
            <li>• Node 2: http://localhost:8547 (Alternative)</li>
            <li>• Node 3: http://localhost:8549 (Alternative)</li>
            <li>• Node 4: http://localhost:8551 (Alternative)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}