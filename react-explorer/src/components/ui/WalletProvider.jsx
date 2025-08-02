import React from 'react'
import { CURRENT_NETWORK, RPC_URL } from '../../config'

// Simplified wallet provider for now - we'll enhance this later
export function WalletProvider({ children }) {
  return (
    <div>
      {children}
    </div>
  )
}