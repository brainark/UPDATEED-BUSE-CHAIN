import React from 'react'
import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { wagmiConfig, chains, isWalletConnectAvailable } from '@/utils/wagmi'

interface WalletProviderProps {
  children: React.ReactNode
}

export default function WalletProvider({ children }: WalletProviderProps) {
  // Create a simplified connector list for development
  const connectors = connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet({ projectId: 'dummy', chains }),
        injectedWallet({ chains }),
      ],
    },
  ])

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        modalSize="compact"
        showRecentTransactions={true}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}