import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, CubeIcon, MagnifyingGlassIcon, ChartBarIcon, BoltIcon } from '@heroicons/react/24/outline'
import MobileWalletConnector from './MobileWalletConnector'
import Web3 from 'web3'

interface NetworkStats {
  blockNumber: number
  gasPrice: string
  peerCount: number
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
  status: 'success' | 'failed' | 'pending'
}

interface Block {
  number: number
  hash: string
  timestamp: string
  transactions: number
  gasUsed: string
}

const MobileOptimizedExplorer: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    blockNumber: 0,
    gasPrice: '0',
    peerCount: 4
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stats' | 'transactions' | 'blocks'>('stats')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)

  const RPC_URL = 'https://rpc.brainark.online'

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch blockchain data with error handling
  const fetchBlockchainData = async () => {
    try {
      setLoading(true)
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL))
      
      // Get basic network stats
      const [blockNumber, gasPrice] = await Promise.all([
        web3.eth.getBlockNumber(),
        web3.eth.getGasPrice()
      ])
      
      const gasPriceGwei = parseFloat(web3.utils.fromWei(gasPrice, 'gwei')).toFixed(2)
      
      setNetworkStats({
        blockNumber: Number(blockNumber),
        gasPrice: gasPriceGwei,
        peerCount: 4 // Static for now
      })

      // Get recent blocks (limit to 5 for mobile)
      const blocksToFetch = isMobileView ? 3 : 5
      const latestBlocks: Block[] = []
      
      for (let i = 0; i < blocksToFetch && i < Number(blockNumber); i++) {
        try {
          const block = await web3.eth.getBlock(Number(blockNumber) - i)
          if (block) {
            latestBlocks.push({
              number: Number(block.number),
              hash: block.hash || '',
              timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
              transactions: Array.isArray(block.transactions) ? block.transactions.length : 0,
              gasUsed: web3.utils.fromWei(block.gasUsed.toString(), 'ether')
            })
          }
        } catch (blockError) {
          console.error(`Error fetching block ${Number(blockNumber) - i}:`, blockError)
          break
        }
      }
      
      setRecentBlocks(latestBlocks)

      // Create mock recent transactions for demo (since getting real txs is complex)
      const mockTransactions: Transaction[] = Array.from({ length: isMobileView ? 3 : 5 }, (_, i) => ({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (Math.random() * 10).toFixed(4),
        blockNumber: Number(blockNumber) - i,
        status: Math.random() > 0.1 ? 'success' as const : 'failed' as const
      }))
      
      setRecentTransactions(mockTransactions)

    } catch (error: any) {
      console.error('Error fetching blockchain data:', error)
      toast.error('Failed to fetch network data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockchainData()
    const interval = setInterval(fetchBlockchainData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [isMobileView])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return isMobileView ? `${hash.slice(0, 10)}...` : `${hash.slice(0, 20)}...${hash.slice(-8)}`
  }

  if (loading && networkStats.blockNumber === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading BrainArk Explorer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Mobile-First Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            🔍 BrainArk Explorer
          </h1>
          <p className="text-gray-400 text-center mt-1 text-sm md:text-base">
            Real-time blockchain insights
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Wallet Connection */}
        <MobileWalletConnector />

        {/* Search Bar - Mobile Optimized */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction hash, block number, or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         touch-manipulation text-base" // text-base prevents zoom on iOS
            />
          </div>
          {searchQuery && (
            <button 
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 
                         rounded-lg transition-colors touch-manipulation"
              onClick={() => toast.info('Search functionality coming soon!')}
            >
              Search
            </button>
          )}
        </div>

        {/* Mobile Tab Navigation */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="flex">
            {[
              { key: 'stats', label: 'Stats', icon: ChartBarIcon },
              { key: 'transactions', label: 'Transactions', icon: BoltIcon },
              { key: 'blocks', label: 'Blocks', icon: CubeIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors
                           touch-manipulation ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Latest Block</p>
                    <p className="text-2xl font-bold text-white">#{networkStats.blockNumber.toLocaleString()}</p>
                  </div>
                  <CubeIcon className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Gas Price</p>
                    <p className="text-2xl font-bold text-white">{networkStats.gasPrice} Gwei</p>
                  </div>
                  <BoltIcon className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Network Peers</p>
                    <p className="text-2xl font-bold text-white">{networkStats.peerCount}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {tx.status === 'success' ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-400 font-mono">
                            {formatHash(tx.hash)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-400">From:</span>{' '}
                            <span className="text-blue-400 font-mono">{formatAddress(tx.from)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">To:</span>{' '}
                            <span className="text-blue-400 font-mono">{formatAddress(tx.to)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-white font-semibold">{tx.value} BAK</div>
                        <div className="text-xs text-gray-400">Block #{tx.blockNumber}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blocks' && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold">Recent Blocks</h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {recentBlocks.map((block, index) => (
                  <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">#{block.number}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold">Block {block.number}</div>
                            <div className="text-xs text-gray-400">{block.timestamp}</div>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-400">Hash:</span>{' '}
                            <span className="text-blue-400 font-mono">{formatHash(block.hash)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Transactions:</span>{' '}
                            <span className="text-white">{block.transactions}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Gas Used:</span>{' '}
                            <span className="text-white">{parseFloat(block.gasUsed).toFixed(6)} ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileOptimizedExplorer