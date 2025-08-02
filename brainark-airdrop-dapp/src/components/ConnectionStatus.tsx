import React from 'react'
import { useAccount, useNetwork } from 'wagmi'

export default function ConnectionStatus() {
  const { address, isConnected, connector } = useAccount()
  const { chain } = useNetwork()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-semibold mb-2">🔧 Debug Info</div>
      <div className="space-y-1">
        <div>Connected: {isConnected ? '✅' : '❌'}</div>
        {isConnected && (
          <>
            <div>Wallet: {connector?.name || 'Unknown'}</div>
            <div>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
            <div>Chain: {chain?.name || 'Unknown'} ({chain?.id})</div>
            <div>Expected: BrainArk (1337)</div>
          </>
        )}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div>Port: {typeof window !== 'undefined' ? window.location.port : 'N/A'}</div>
          <div>Host: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
        </div>
      </div>
    </div>
  )
}