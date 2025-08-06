// WalletConnect Configuration
export const WALLETCONNECT_CONFIG = {
  // Project ID from WalletConnect Cloud
  projectId: "138029c5ee4c7a8ecfbe38fddcca1818",
  
  // Metadata for your dApp
  metadata: {
    name: "BrainArk Blockchain Explorer",
    description: "Explore the BrainArk blockchain with real-time data and analytics",
    url: "https://explorer.brainark.online",
    icons: ["https://explorer.brainark.online/favicon.ico"]
  },
  
  // Supported chains
  chains: [424242, 31337], // BrainArk production and local
  
  // Optional: Recommended wallet IDs
  recommendedWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
    "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // Coinbase Wallet
    "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f", // Safe
    "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927", // Ledger Live
  ],
  
  // Optional: Explorer recommended wallets
  explorerRecommendedWalletIds: "NONE",
  
  // Optional: Enable analytics
  enableAnalytics: true,
  
  // Optional: Enable email login
  enableEmail: false,
  
  // Optional: Enable social logins
  enableSocials: [],
  
  // Optional: Enable wallet features
  enableWalletFeatures: true
};

// Legacy WalletConnect v1 config (fallback)
export const WALLETCONNECT_V1_CONFIG = {
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  qrcodeModalOptions: {
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
      "coinbase",
      "safe",
      "ledger"
    ],
    desktopLinks: [
      "ledger",
      "tokenary",
      "wallet",
      "wallet 3",
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar"
    ]
  }
};