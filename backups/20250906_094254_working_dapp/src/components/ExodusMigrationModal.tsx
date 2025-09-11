import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExodusMigrationModalProps {
  isOpen: boolean
  onClose: () => void
}

const MIGRATION_STEPS = [
  {
    id: 1,
    title: "Choose Your Current Network",
    icon: "🌐",
    description: "Select which blockchain your dApp is currently deployed on"
  },
  {
    id: 2,
    title: "Prepare Your Smart Contracts",
    icon: "📝",
    description: "Get your Solidity contracts ready for deployment"
  },
  {
    id: 3,
    title: "Deploy to BrainArk",
    icon: "🚀",
    description: "Deploy your contracts to the BrainArk Besu chain"
  },
  {
    id: 4,
    title: "Update Your Frontend",
    icon: "💻",
    description: "Configure your dApp to connect to BrainArk"
  },
  {
    id: 5,
    title: "Test & Launch",
    icon: "✅",
    description: "Test your migrated dApp and go live"
  }
]

const NETWORK_CONFIGS = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    color: "from-blue-400 to-blue-600",
    icon: "🔷",
    gasPrice: "50-100 gwei",
    blockTime: "12-15 seconds",
    finality: "2-5 minutes"
  },
  bsc: {
    name: "BSC",
    chainId: 56,
    symbol: "BNB",
    color: "from-yellow-400 to-yellow-600",
    icon: "🟡",
    gasPrice: "5-10 gwei",
    blockTime: "3 seconds",
    finality: "45 seconds"
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    symbol: "MATIC",
    color: "from-purple-400 to-purple-600",
    icon: "🟣",
    gasPrice: "30-50 gwei",
    blockTime: "2 seconds",
    finality: "8-10 minutes"
  },
  brainark: {
    name: "BrainArk",
    chainId: 424242,
    symbol: "BAK",
    color: "from-green-400 to-green-600",
    icon: "🧠",
    gasPrice: "0.001 gwei",
    blockTime: "2 seconds",
    finality: "Instant"
  }
}

const ExodusMigrationModal: React.FC<ExodusMigrationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNetwork, setSelectedNetwork] = useState<keyof typeof NETWORK_CONFIGS | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const nextStep = () => {
    if (currentStep < MIGRATION_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors text-2xl"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4">
              <motion.div
                className="text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🚀
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">EXODUS Migration Guide</h1>
                <p className="text-white/90">Migrate your dApp from Ethereum, BSC, or Polygon to BrainArk</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Step {currentStep} of {MIGRATION_STEPS.length}</span>
                <span className="text-sm">{Math.round((currentStep / MIGRATION_STEPS.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / MIGRATION_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Choose Network */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {MIGRATION_STEPS[currentStep - 1].icon} {MIGRATION_STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">{MIGRATION_STEPS[currentStep - 1].description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(NETWORK_CONFIGS).filter(([key]) => key !== 'brainark').map(([key, network]) => (
                    <motion.button
                      key={key}
                      onClick={() => setSelectedNetwork(key as keyof typeof NETWORK_CONFIGS)}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-300 text-left
                        ${selectedNetwork === key 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${network.color} flex items-center justify-center text-2xl mb-4`}>
                        {network.icon}
                      </div>
                      <h3 className="font-bold text-lg">{network.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">Chain ID: {network.chainId}</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>⚡ {network.blockTime}</div>
                        <div>💰 {network.gasPrice}</div>
                        <div>✅ {network.finality}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* BrainArk Comparison */}
                <div className="mt-8 p-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-300 shadow-lg">
                  <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">🧠 Migrating to BrainArk gives you:</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md">
                      <span className="text-4xl">⚡</span>
                      <span className="font-bold text-lg text-gray-800">2-second finality</span>
                      <span className="text-sm text-gray-600 text-center">Instant transaction confirmation</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md">
                      <span className="text-4xl">💰</span>
                      <span className="font-bold text-lg text-gray-800">Ultra-low fees</span>
                      <span className="text-sm text-gray-600 text-center">Save 99% on transaction costs</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md">
                      <span className="text-4xl">✅</span>
                      <span className="font-bold text-lg text-gray-800">Enterprise security</span>
                      <span className="text-sm text-gray-600 text-center">IBFT 2.0 consensus protection</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Prepare Contracts */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {MIGRATION_STEPS[currentStep - 1].icon} {MIGRATION_STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">{MIGRATION_STEPS[currentStep - 1].description}</p>
                </div>

                <div className="space-y-6">
                  {/* Contract Checklist */}
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">✅ Pre-Migration Checklist</h3>
                    <div className="space-y-3">
                      {[
                        "Ensure your contracts are written in Solidity 0.8.x or compatible",
                        "Remove any chain-specific dependencies (like Polygon PoS)",
                        "Check for hardcoded addresses that need updating",
                        "Prepare constructor parameters for new deployment",
                        "Backup your current contract ABIs and addresses"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-blue-600 mt-0.5">✅</span>
                          <span className="text-blue-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compatible Features */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h4 className="text-lg font-bold text-green-800 mb-4">✅ Fully Compatible</h4>
                      <div className="space-y-2 text-green-700">
                        <div>• Standard ERC20/ERC721/ERC1155 tokens</div>
                        <div>• OpenZeppelin contracts</div>
                        <div>• Uniswap V2/V3 style DEXes</div>
                        <div>• DAO governance contracts</div>
                        <div>• NFT marketplaces</div>
                        <div>• Staking and farming contracts</div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-xl">
                      <h4 className="text-lg font-bold text-yellow-800 mb-4">⚠️ Needs Adaptation</h4>
                      <div className="space-y-2 text-yellow-700">
                        <div>• Chainlink oracles (use BrainArk oracles)</div>
                        <div>• Cross-chain bridges (redesign)</div>
                        <div>• Network-specific validators</div>
                        <div>• External protocol integrations</div>
                        <div>• Layer 2 specific features</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Deploy to BrainArk */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {MIGRATION_STEPS[currentStep - 1].icon} {MIGRATION_STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">{MIGRATION_STEPS[currentStep - 1].description}</p>
                </div>

                {/* Network Configuration */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🌐 BrainArk Network Configuration</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Network Name</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="BrainArk"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => copyToClipboard("BrainArk", "Network Name")}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedText === "Network Name" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">RPC URL</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="https://rpc.brainark.online"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => copyToClipboard("https://rpc.brainark.online", "RPC URL")}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedText === "RPC URL" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Chain ID</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="424242"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => copyToClipboard("424242", "Chain ID")}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedText === "Chain ID" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Currency Symbol</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="BAK"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => copyToClipboard("BAK", "Currency Symbol")}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedText === "Currency Symbol" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Block Explorer</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value="https://explorer.brainark.online"
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => copyToClipboard("https://explorer.brainark.online", "Block Explorer")}
                            className="p-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedText === "Block Explorer" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <a
                          href="https://brainark.online"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Get BAK Tokens
                          <span>🔗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardhat Configuration */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-800 mb-4">⚙️ Hardhat Configuration</h3>
                  <p className="text-purple-700 mb-4">Add this network configuration to your hardhat.config.js:</p>
                  
                  <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm relative">
                    <button
                      onClick={() => copyToClipboard(`networks: {
  brainark: {
    url: "https://rpc.brainark.online",
    chainId: 424242,
    accounts: [process.env.PRIVATE_KEY],
    gas: 75000000,
    gasPrice: 1000
  }
}`, "Hardhat Config")}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
                    >
                      {copiedText === "Hardhat Config" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                    </button>
                    <pre className="pr-10">{`networks: {
  brainark: {
    url: "https://rpc.brainark.online",
    chainId: 424242,
    accounts: [process.env.PRIVATE_KEY],
    gas: 75000000,
    gasPrice: 1000
  }
}`}</pre>
                  </div>
                </div>

                {/* Deploy Command */}
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-green-800 mb-4">🚀 Deploy Your Contracts</h3>
                  <p className="text-green-700 mb-4">Run this command to deploy to BrainArk:</p>
                  
                  <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm relative">
                    <button
                      onClick={() => copyToClipboard("npx hardhat run scripts/deploy.js --network brainark", "Deploy Command")}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
                    >
                      {copiedText === "Deploy Command" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                    </button>
                    <pre className="pr-10">npx hardhat run scripts/deploy.js --network brainark</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Update Frontend */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {MIGRATION_STEPS[currentStep - 1].icon} {MIGRATION_STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">{MIGRATION_STEPS[currentStep - 1].description}</p>
                </div>

                {/* Wagmi Configuration */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">⚛️ Wagmi Configuration</h3>
                  <p className="text-blue-700 mb-4">Add BrainArk to your wagmi configuration:</p>
                  
                  <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm relative overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(`const brainarkChain = {
  id: 424242,
  name: 'BrainArk',
  network: 'brainark',
  nativeCurrency: {
    decimals: 18,
    name: 'BrainArk Token',
    symbol: 'BAK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.brainark.online'] },
    public: { http: ['https://rpc.brainark.online'] },
  },
  blockExplorers: {
    default: { 
      name: 'BrainArk Explorer', 
      url: 'https://explorer.brainark.online' 
    },
  },
}`, "Wagmi Config")}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
                    >
                      {copiedText === "Wagmi Config" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                    </button>
                    <pre className="pr-10 whitespace-pre-wrap">{`const brainarkChain = {
  id: 424242,
  name: 'BrainArk',
  network: 'brainark',
  nativeCurrency: {
    decimals: 18,
    name: 'BrainArk Token',
    symbol: 'BAK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.brainark.online'] },
    public: { http: ['https://rpc.brainark.online'] },
  },
  blockExplorers: {
    default: { 
      name: 'BrainArk Explorer', 
      url: 'https://explorer.brainark.online' 
    },
  },
}`}</pre>
                  </div>
                </div>

                {/* Contract Addresses */}
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-yellow-800 mb-4">📝 Update Contract Addresses</h3>
                  <p className="text-yellow-700 mb-4">Update your contract addresses configuration:</p>
                  
                  <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm relative">
                    <button
                      onClick={() => copyToClipboard(`const CONTRACT_ADDRESSES = {
  [1]: "0x...", // Ethereum
  [56]: "0x...", // BSC
  [137]: "0x...", // Polygon
  [424242]: "0x..." // BrainArk - YOUR NEW ADDRESS
}`, "Contract Addresses")}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
                    >
                      {copiedText === "Contract Addresses" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                    </button>
                    <pre className="pr-10">{`const CONTRACT_ADDRESSES = {
  [1]: "0x...", // Ethereum
  [56]: "0x...", // BSC
  [137]: "0x...", // Polygon
  [424242]: "0x..." // BrainArk - YOUR NEW ADDRESS
}`}</pre>
                  </div>
                </div>

                {/* Network Switching */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-800 mb-4">🔄 Network Switching</h3>
                  <p className="text-purple-700 mb-4">Add network switching functionality:</p>
                  
                  <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm relative overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(`const switchToBrainArk = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x67932' }], // 424242 in hex
    })
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x67932',
          chainName: 'BrainArk',
          rpcUrls: ['https://rpc.brainark.online'],
          nativeCurrency: {
            name: 'BrainArk Token',
            symbol: 'BAK',
            decimals: 18
          },
          blockExplorerUrls: ['https://explorer.brainark.online']
        }]
      })
    }
  }
}`, "Network Switching")}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
                    >
                      {copiedText === "Network Switching" ? <span className="text-green-500">✅</span> : <span>📋</span>}
                    </button>
                    <pre className="pr-10 whitespace-pre-wrap">{`const switchToBrainArk = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x67932' }], // 424242 in hex
    })
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x67932',
          chainName: 'BrainArk',
          rpcUrls: ['https://rpc.brainark.online'],
          nativeCurrency: {
            name: 'BrainArk Token',
            symbol: 'BAK',
            decimals: 18
          },
          blockExplorerUrls: ['https://explorer.brainark.online']
        }]
      })
    }
  }
}`}</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Test & Launch */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {MIGRATION_STEPS[currentStep - 1].icon} {MIGRATION_STEPS[currentStep - 1].title}
                  </h2>
                  <p className="text-gray-600">{MIGRATION_STEPS[currentStep - 1].description}</p>
                </div>

                {/* Testing Checklist */}
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-green-800 mb-4">🧪 Testing Checklist</h3>
                  <div className="space-y-3">
                    {[
                      "Connect your wallet to BrainArk network",
                      "Verify all contract functions work correctly",
                      "Test token transfers and approvals",
                      "Check frontend displays correct data",
                      "Verify transaction confirmations are fast (2 seconds)",
                      "Test with different wallet types (MetaMask, WalletConnect)",
                      "Ensure error handling works properly",
                      "Test on mobile devices"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-green-600 mt-0.5">✅</span>
                        <span className="text-green-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Benefits */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">🚀 Performance Benefits</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="font-bold text-lg">2 Seconds</div>
                      <div className="text-sm text-gray-600">Transaction Finality</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-bold text-lg">~$0.00001</div>
                      <div className="text-sm text-gray-600">Transaction Cost</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl mb-2">🔒</div>
                      <div className="font-bold text-lg">Enterprise</div>
                      <div className="text-sm text-gray-600">Security Level</div>
                    </div>
                  </div>
                </div>

                {/* Launch Support */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-800 mb-4">🎉 Ready to Launch?</h3>
                  <div className="space-y-4">
                    <p className="text-purple-700">
                      Congratulations! Your dApp is now ready to run on BrainArk. Here are some next steps:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Announce your migration to users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Update documentation and guides</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Monitor performance and user feedback</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Join BrainArk developer community</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Share your success story</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">✅</span>
                          <span className="text-purple-800">Explore advanced BrainArk features</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center p-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-200">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Welcome to BrainArk!</h3>
                  <p className="text-green-700">
                    Your dApp migration is complete. Enjoy lightning-fast transactions and ultra-low fees!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                ◀
                Previous
              </button>

              <div className="flex gap-2">
                {MIGRATION_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index + 1)}
                    className={`
                      w-8 h-8 rounded-full font-medium transition-colors
                      ${currentStep === index + 1
                        ? 'bg-blue-600 text-white'
                        : currentStep > index + 1
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === MIGRATION_STEPS.length}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${currentStep === MIGRATION_STEPS.length
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                Next
                ▶
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExodusMigrationModal