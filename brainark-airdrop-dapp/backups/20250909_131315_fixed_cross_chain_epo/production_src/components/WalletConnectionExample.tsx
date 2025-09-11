import React, { useState } from 'react'
import AutoWalletConnectionFixed from './AutoWalletConnection_Fixed'
import WalletTroubleshooter from './WalletTroubleshooter'

/**
 * Example implementation showing how to use the fixed wallet connection components
 * This demonstrates the recommended pattern for handling wallet connections
 */
export default function WalletConnectionExample() {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: '',
    isCorrectNetwork: false
  })
  
  const [showTroubleshooter, setShowTroubleshooter] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  const handleConnectionChange = (isConnected: boolean, address?: string, isCorrectNetwork?: boolean) => {
    console.log('Wallet state changed:', { isConnected, address, isCorrectNetwork })
    
    setWalletState({
      isConnected: isConnected || false,
      address: address || '',
      isCorrectNetwork: isCorrectNetwork || false
    })

    // Auto-show troubleshooter after multiple failed attempts
    if (!isConnected && connectionAttempts > 2) {
      setShowTroubleshooter(true)
    }
    
    // Track connection attempts
    if (!isConnected) {
      setConnectionAttempts(prev => prev + 1)
    } else {
      setConnectionAttempts(0)
      setShowTroubleshooter(false)
    }
  }

  // Show troubleshooter if user is having issues
  if (showTroubleshooter) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-bold text-blue-800 mb-2">
            🔧 Connection Issues Detected
          </h2>
          <p className="text-blue-700">
            We've detected some issues with your wallet connection. 
            Let's run some diagnostics to get you connected.
          </p>
        </div>
        
        <WalletTroubleshooter 
          onResolved={() => {
            setShowTroubleshooter(false)
            setConnectionAttempts(0)
          }}
        />
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowTroubleshooter(false)}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to wallet connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧠 BrainArk Wallet Connection
        </h1>
        
        {/* Wallet Connection Component */}
        <div className="mb-6">
          <AutoWalletConnectionFixed 
            onConnectionChange={handleConnectionChange}
          />
        </div>

        {/* Connection Status Display */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Connection Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connected:</span>
                <span className={`font-medium ${walletState.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {walletState.isConnected ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Correct Network:</span>
                <span className={`font-medium ${walletState.isCorrectNetwork ? 'text-green-600' : 'text-yellow-600'}`}>
                  {walletState.isCorrectNetwork ? '✅ Yes' : '⚠️ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Attempts:</span>
                <span className="font-medium text-gray-700">
                  {connectionAttempts}
                </span>
              </div>
            </div>
            
            {walletState.address && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-mono text-sm text-gray-800">
                  {walletState.address}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setShowTroubleshooter(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔧 Having Issues?
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Refresh Page
            </button>
            
            <button
              onClick={() => setConnectionAttempts(0)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Reset Counter
            </button>
          </div>

          {/* Help Section */}
          <details className="mt-6">
            <summary className="cursor-pointer text-gray-700 font-medium">
              📚 Need Help?
            </summary>
            <div className="mt-3 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <h4 className="font-medium mb-2">Common Issues:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Make sure MetaMask is installed and unlocked</li>
                <li>Check that your Besu blockchain is running (for local development)</li>
                <li>Remove conflicting networks (Hardhat, Ganache) from MetaMask</li>
                <li>Try refreshing the page if MetaMask becomes unresponsive</li>
                <li>Use the troubleshooter tool for automatic diagnosis</li>
              </ul>
            </div>
          </details>

          {/* Success Message */}
          {walletState.isConnected && walletState.isCorrectNetwork && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                🎉 Successfully Connected!
              </h3>
              <p className="text-green-700">
                Your wallet is connected to the BrainArk network. 
                You can now interact with the dApp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}