import React, { useState, useEffect } from 'react'
import { useSharedWallet, formatAddress, copyToClipboard } from '@/utils/sharedWallet'
import Web3 from 'web3'

interface NetworkStats {
  blockNumber: number
  gasPrice: string
  peerCount: number
  hashrate: string
  totalTransactions: number
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  gasUsed: string
  blockNumber: number
  timestamp: number
  status: 'success' | 'failed' | 'pending'
}

interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  gasUsed: string
  gasLimit: string
  miner: string
}

export default function IntegratedExplorer() {
  const wallet = useSharedWallet()
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'blocks' | 'search'>('overview')
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    blockNumber: 0,
    gasPrice: '0',
    peerCount: 0,
    hashrate: '0',
    totalTransactions: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch network statistics
  useEffect(() => {
    const fetchNetworkStats = async () => {
      if (!wallet.web3) return

      try {
        const [blockNumber, gasPrice] = await Promise.all([
          wallet.web3.eth.getBlockNumber(),
          wallet.web3.eth.getGasPrice()
        ])

        // Fetch recent blocks
        const blocks: Block[] = []
        for (let i = 0; i < 5; i++) {
          try {
            const block = await wallet.web3.eth.getBlock(Number(blockNumber) - i, true)
            if (block) {
              blocks.push({
                number: Number(block.number),
                hash: block.hash || 'Unknown',
                timestamp: Number(block.timestamp),
                transactions: block.transactions.length,
                gasUsed: block.gasUsed.toString(),
                gasLimit: block.gasLimit.toString(),
                miner: block.miner || 'Unknown'
              })
            }
          } catch (error) {
            console.error(`Error fetching block ${Number(blockNumber) - i}:`, error)
          }
        }

        // Fetch recent transactions from latest block
        const transactions: Transaction[] = []
        try {
          const latestBlock = await wallet.web3.eth.getBlock(blockNumber, true)
          if (latestBlock && latestBlock.transactions) {
            for (let i = 0; i < Math.min(10, latestBlock.transactions.length); i++) {
              const tx = latestBlock.transactions[i]
              if (typeof tx === 'object' && tx.hash) {
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to || 'Contract Creation',
                  value: wallet.web3.utils.fromWei(tx.value || '0', 'ether'),
                  gasPrice: wallet.web3.utils.fromWei(tx.gasPrice || '0', 'gwei'),
                  gasUsed: tx.gas?.toString() || '0',
                  blockNumber: Number(tx.blockNumber) || Number(blockNumber),
                  timestamp: Number(latestBlock.timestamp),
                  status: 'success'
                })
              }
            }
          }
        } catch (error) {
          console.error('Error fetching transactions:', error)
        }

        setNetworkStats({
          blockNumber: Number(blockNumber),
          gasPrice: wallet.web3.utils.fromWei(gasPrice, 'gwei'),
          peerCount: Math.floor(Math.random() * 20) + 5, // Mock data
          hashrate: (Math.random() * 100).toFixed(2), // Mock data
          totalTransactions: blocks.reduce((sum, block) => sum + block.transactions, 0)
        })

        setRecentBlocks(blocks)
        setRecentTransactions(transactions)
      } catch (error) {
        console.error('Failed to fetch network stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNetworkStats()
    const interval = setInterval(fetchNetworkStats, 15000)
    return () => clearInterval(interval)
  }, [wallet.web3])

  // Search functionality
  const handleSearch = async () => {
    if (!wallet.web3 || !searchQuery.trim()) return

    setLoading(true)
    try {
      let result = null

      // Check if it's a transaction hash
      if (searchQuery.startsWith('0x') && searchQuery.length === 66) {
        try {
          const tx = await wallet.web3.eth.getTransaction(searchQuery)
          const receipt = await wallet.web3.eth.getTransactionReceipt(searchQuery)
          result = {
            type: 'transaction',
            data: {
              ...tx,
              status: receipt?.status ? 'success' : 'failed',
              gasUsed: receipt?.gasUsed?.toString() || '0'
            }
          }
        } catch (error) {
          console.error('Transaction not found:', error)
        }
      }
      // Check if it's a block number
      else if (/^\d+$/.test(searchQuery)) {
        try {
          const block = await wallet.web3.eth.getBlock(parseInt(searchQuery), true)
          result = { type: 'block', data: block }
        } catch (error) {
          console.error('Block not found:', error)
        }
      }
      // Check if it's an address
      else if (searchQuery.startsWith('0x') && searchQuery.length === 42) {
        try {
          const balance = await wallet.web3.eth.getBalance(searchQuery)
          const code = await wallet.web3.eth.getCode(searchQuery)
          result = {
            type: 'address',
            data: {
              address: searchQuery,
              balance: wallet.web3.utils.fromWei(balance, 'ether'),
              isContract: code !== '0x'
            }
          }
        } catch (error) {
          console.error('Address not found:', error)
        }
      }

      setSearchResult(result)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            🔍 BrainArk Blockchain Explorer
          </h1>
          <p className="text-xl text-gray-300">
            Real-time blockchain data and analytics
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-8">
          <div className="card-brilliant p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {wallet.isConnected ? `Connected: ${formatAddress(wallet.address)}` : 'Wallet Not Connected'}
                </span>
                {wallet.isConnected && (
                  <span className="text-sm text-gray-600">
                    Balance: {wallet.balance} {wallet.networkConfig.CURRENCY_SYMBOL}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!wallet.isConnected ? (
                  <button
                    onClick={wallet.connectWallet}
                    disabled={wallet.loading}
                    className="btn-explorer"
                  >
                    {wallet.loading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <>
                    {!wallet.isCorrectNetwork && (
                      <button
                        onClick={wallet.switchNetwork}
                        className="btn-warning"
                      >
                        Switch Network
                      </button>
                    )}
                    <button
                      onClick={wallet.disconnect}
                      className="btn-danger"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'transactions', label: '💸 Transactions', icon: '💸' },
              { id: 'blocks', label: '🧱 Blocks', icon: '🧱' },
              { id: 'search', label: '🔍 Search', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'btn-explorer shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Network Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-brilliant p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Latest Block</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : networkStats.blockNumber.toLocaleString()}
                  </p>
                </div>

                <div className="card-brilliant p-6 text-center">
                  <div className="text-3xl mb-2">⛽</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gas Price</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : `${parseFloat(networkStats.gasPrice).toFixed(2)} Gwei`}
                  </p>
                </div>

                <div className="card-brilliant p-6 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Peers</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? '...' : networkStats.peerCount}
                  </p>
                </div>

                <div className="card-brilliant p-6 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hashrate</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '...' : `${networkStats.hashrate} TH/s`}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-brilliant p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🧱 Recent Blocks</h3>
                  <div className="space-y-3">
                    {recentBlocks.map((block) => (
                      <div key={block.number} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">Block #{block.number}</div>
                          <div className="text-sm text-gray-600">{block.transactions} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{formatTimestamp(block.timestamp)}</div>
                          <div className="text-xs text-gray-500">{formatAddress(block.hash)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-brilliant p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">💸 Recent Transactions</h3>
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div key={tx.hash} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{formatAddress(tx.hash)}</div>
                          <div className="text-sm text-gray-600">
                            {formatAddress(tx.from)} → {formatAddress(tx.to)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{parseFloat(tx.value).toFixed(4)} BAK</div>
                          <div className="text-xs text-gray-500">Gas: {tx.gasPrice} Gwei</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="card-brilliant p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💸 Transaction Explorer</h3>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.hash} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">Transaction Hash:</div>
                        <div className="font-mono text-sm text-blue-600 break-all">{tx.hash}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Status:</div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">From:</div>
                        <div className="font-mono text-sm">{tx.from}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">To:</div>
                        <div className="font-mono text-sm">{tx.to}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Value:</div>
                        <div>{tx.value} BAK</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Gas Price:</div>
                        <div>{tx.gasPrice} Gwei</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blocks Tab */}
          {activeTab === 'blocks' && (
            <div className="card-brilliant p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🧱 Block Explorer</h3>
              <div className="space-y-4">
                {recentBlocks.map((block) => (
                  <div key={block.number} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">Block Number:</div>
                        <div className="text-lg font-bold text-blue-600">{block.number}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Timestamp:</div>
                        <div>{formatTimestamp(block.timestamp)}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Block Hash:</div>
                        <div className="font-mono text-sm break-all">{block.hash}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Transactions:</div>
                        <div>{block.transactions}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Gas Used:</div>
                        <div>{parseInt(block.gasUsed).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Gas Limit:</div>
                        <div>{parseInt(block.gasLimit).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="card-brilliant p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🔍 Search Blockchain</h3>
              
              <div className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter transaction hash, block number, or address..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="btn-explorer px-6"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Search Result: {searchResult.type}
                  </h4>
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(searchResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}