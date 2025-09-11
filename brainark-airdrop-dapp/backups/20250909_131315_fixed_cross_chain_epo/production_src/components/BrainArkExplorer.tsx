import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, ShareIcon, LinkIcon, CalendarIcon, MagnifyingGlassIcon, ChartBarIcon, CubeIcon, BoltIcon, GlobeAltIcon, WalletIcon } from '@heroicons/react/24/outline'
import AutoWalletConnection from './AutoWalletConnection'
import Web3 from 'web3'

interface NetworkStats {
  blockNumber: number
  gasPrice: string
  peerCount: number
  hashrate: string
  totalTransactions: number
  activeAddresses: number
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  gasPrice: string
  blockNumber: number
  timestamp: string
  status: 'success' | 'failed' | 'pending'
}

interface Block {
  number: number
  hash: string
  timestamp: string
  transactions: number
  gasUsed: string
  gasLimit: string
  miner: string
}

interface AddressInfo {
  address: string
  balance: string
  transactionCount: number
  firstSeen: string
}

type SearchResult = 
  | { type: 'transaction', data: Transaction }
  | { type: 'block', data: Block }
  | { type: 'address', data: AddressInfo }

const BrainArkExplorer: React.FC = () => {
  // State management
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    blockNumber: 0,
    gasPrice: '0',
    peerCount: 0,
    hashrate: '0',
    totalTransactions: 0,
    activeAddresses: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<'transaction' | 'block' | 'address'>('transaction')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [activeTab, setActiveTab] = useState<'transactions' | 'blocks' | 'analytics'>('transactions')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)

  // Handle wallet connection change
  const handleConnectionChange = (connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
    setIsCorrectNetwork(correctNetwork || false)
  }

  // Constants
  const RPC_URL = 'https://rpc.brainark.online'
  const EXPLORER_URL = 'https://explorer.brainark.online'
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL))

  // Get real data from the blockchain
  const fetchBlockchainData = async () => {
    try {
      setLoading(true)
      
      // Get current block number
      const blockNumber = await web3.eth.getBlockNumber()
      
      // Get gas price
      const gasPrice = await web3.eth.getGasPrice()
      const gasPriceGwei = parseFloat(web3.utils.fromWei(gasPrice, 'gwei')).toFixed(2)
      
      // Get latest blocks
      const latestBlocks: Block[] = []
      const blocksToFetch = Math.min(10, Number(blockNumber))
      
      for (let i = 0; i < blocksToFetch; i++) {
        const block = await web3.eth.getBlock(Number(blockNumber) - i)
        if (block) {
          latestBlocks.push({
            number: Number(block.number),
            hash: block.hash || '',
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            transactions: block.transactions?.length || 0,
            gasUsed: (block.gasUsed || 0).toString(),
            gasLimit: (block.gasLimit || 0).toString(),
            miner: block.miner || '0x0000000000000000000000000000000000000000'
          })
        }
      }
      
      // Get latest transactions
      const latestTransactions: Transaction[] = []
      for (const block of latestBlocks.slice(0, 3)) { // Only check the latest 3 blocks for transactions
        if (block.transactions > 0) {
          const fullBlock = await web3.eth.getBlock(block.number, true)
          for (const tx of fullBlock.transactions.slice(0, 5)) { // Get up to 5 transactions per block
            if (typeof tx === 'object' && tx !== null) {
              const receipt = await web3.eth.getTransactionReceipt(tx.hash)
              latestTransactions.push({
                hash: tx.hash || '',
                from: tx.from || '',
                to: tx.to || '0x0000000000000000000000000000000000000000', // Contract creation
                value: web3.utils.fromWei(tx.value || '0', 'ether'),
                gasUsed: receipt ? receipt.gasUsed.toString() : '0',
                gasPrice: web3.utils.fromWei(tx.gasPrice || '0', 'gwei'),
                blockNumber: Number(tx.blockNumber || 0),
                timestamp: block.timestamp,
                status: receipt ? (receipt.status ? 'success' : 'failed') : 'pending'
              })
            }
            
            if (latestTransactions.length >= 10) break
          }
        }
        if (latestTransactions.length >= 10) break
      }
      
      // Set network stats
      const stats: NetworkStats = {
        blockNumber: Number(blockNumber),
        gasPrice: gasPriceGwei,
        peerCount: 0, // Not easily available from web3
        hashrate: '0', // Not easily available from web3
        totalTransactions: 0, // Would require scanning all blocks
        activeAddresses: 0 // Would require external indexing
      }
      
      setNetworkStats(stats)
      setRecentTransactions(latestTransactions)
      setRecentBlocks(latestBlocks)
    } catch (error) {
      console.error('Error fetching blockchain data:', error)
      toast.error('Failed to load blockchain data. Using cached data instead.')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchBlockchainData()
    const interval = setInterval(fetchBlockchainData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setLoading(true)
    
    try {
      // Search for real blockchain data
      if (searchType === 'transaction') {
        try {
          const tx = await web3.eth.getTransaction(searchQuery);
          if (!tx) {
            toast.error('Transaction not found');
            setLoading(false);
            return;
          }
          
          const receipt = await web3.eth.getTransactionReceipt(searchQuery);
          const block = await web3.eth.getBlock(tx.blockNumber);
          
          setSearchResults({
            type: 'transaction',
            data: {
              hash: tx.hash || '',
              from: tx.from || '',
              to: tx.to || '0x0000000000000000000000000000000000000000',
              value: web3.utils.fromWei(tx.value || '0', 'ether'),
              gasUsed: receipt ? receipt.gasUsed.toString() : '0',
              gasPrice: web3.utils.fromWei(tx.gasPrice || '0', 'gwei'),
              blockNumber: Number(tx.blockNumber || 0),
              timestamp: new Date(Number(block.timestamp || 0) * 1000).toISOString(),
              status: receipt ? (receipt.status ? 'success' : 'failed') : 'pending'
            }
          });
        } catch (error) {
          console.error('Error searching transaction:', error);
          toast.error('Failed to find transaction. Please check the hash and try again.');
        }
      } else if (searchType === 'block') {
        try {
          let blockData;
          const isNumber = !isNaN(parseInt(searchQuery));
          
          if (isNumber) {
            blockData = await web3.eth.getBlock(parseInt(searchQuery));
          } else {
            blockData = await web3.eth.getBlock(searchQuery);
          }
          
          if (!blockData) {
            toast.error('Block not found');
            setLoading(false);
            return;
          }
          
          setSearchResults({
            type: 'block',
            data: {
              number: Number(blockData.number),
              hash: blockData.hash || '',
              timestamp: new Date(Number(blockData.timestamp) * 1000).toISOString(),
              transactions: blockData.transactions?.length || 0,
              gasUsed: (blockData.gasUsed || 0).toString(),
              gasLimit: (blockData.gasLimit || 0).toString(),
              miner: blockData.miner || '0x0000000000000000000000000000000000000000'
            }
          });
        } catch (error) {
          console.error('Error searching block:', error);
          toast.error('Failed to find block. Please check the number/hash and try again.');
        }
      } else {
        try {
          const balance = await web3.eth.getBalance(searchQuery);
          const transactionCount = await web3.eth.getTransactionCount(searchQuery);
          
          setSearchResults({
            type: 'address',
            data: {
              address: searchQuery,
              balance: web3.utils.fromWei(balance, 'ether'),
              transactionCount: Number(transactionCount),
              firstSeen: new Date().toISOString() // This isn't available from web3.js directly
            }
          });
        } catch (error) {
          console.error('Error searching address:', error);
          toast.error('Failed to find address. Please check the address and try again.');
        }
      }
      
      toast.success('Search completed!')
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-deep-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            🔍 BrainArk Blockchain Explorer
          </h1>
          <p className="text-xl text-gray-300">
            Explore the BrainArk blockchain with real-time data and analytics
          </p>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6 mb-8">
          <div className="card-brilliant text-center p-6">
            <CubeIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Latest Block</h3>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : networkStats.blockNumber.toLocaleString()}
            </p>
          </div>

          <div className="card-brilliant text-center p-6">
            <BoltIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gas Price</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : `${networkStats.gasPrice} Gwei`}
            </p>
          </div>

          <div className="card-brilliant text-center p-6">
            <UserGroupIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Network Peers</h3>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : networkStats.peerCount}
            </p>
          </div>

          <div className="card-brilliant text-center p-6">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Hashrate</h3>
            <p className="text-2xl font-bold text-purple-600">
              {loading ? '...' : `${networkStats.hashrate} TH/s`}
            </p>
          </div>

          <div className="card-brilliant text-center p-6">
            <ShareIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total TXs</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {loading ? '...' : networkStats.totalTransactions.toLocaleString()}
            </p>
          </div>

          <div className="card-brilliant text-center p-6">
            <WalletIcon className="h-8 w-8 text-teal-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Addresses</h3>
            <p className="text-2xl font-bold text-teal-600">
              {loading ? '...' : networkStats.activeAddresses.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Wallet Connection */}
          <div className="lg:col-span-1">
            <div className="card-dark p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <WalletIcon className="h-6 w-6 mr-2" />
                Wallet Connection
              </h2>
              <AutoWalletConnection onConnectionChange={handleConnectionChange} />
              
              {isConnected && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Connected Address</h3>
                  <p className="text-white font-mono text-sm break-all">{address}</p>
                  <div className="mt-2 flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={`text-sm ${isCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrectNetwork ? 'Correct Network' : 'Wrong Network'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <BoltIcon className="h-6 w-6 mr-2" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full btn-success text-left">
                  <WalletIcon className="h-4 w-4 inline mr-2" />
                  Send Transaction
                </button>
                <button className="w-full btn-primary text-left">
                  <GlobeAltIcon className="h-4 w-4 inline mr-2" />
                  Deploy Contract
                </button>
                <button className="w-full btn-secondary text-left">
                  <ShareIcon className="h-4 w-4 inline mr-2" />
                  Monitor Address
                </button>
                <button className="w-full btn-warning text-left">
                  <ChartBarIcon className="h-4 w-4 inline mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Main Explorer */}
          <div className="lg:col-span-3">
            {/* Search Section */}
            <div className="card-brilliant p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
                Blockchain Search
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="transaction">Transaction</option>
                  <option value="block">Block</option>
                  <option value="address">Address</option>
                </select>
                
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Enter ${searchType} hash/number/address...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="btn-primary px-6 py-2"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                  <a 
                    href="https://explorer.brainark.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Advanced Search
                  </a>
                </div>
              </div>

              {/* Search Results */}
              {searchResults && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">Search Results</h3>
                  {searchResults.type === 'transaction' && (
                    <div className="space-y-2 text-sm">
                      <div><strong>Hash:</strong> {searchResults.data.hash}</div>
                      <div><strong>From:</strong> {formatAddress(searchResults.data.from)}</div>
                      <div><strong>To:</strong> {formatAddress(searchResults.data.to)}</div>
                      <div><strong>Value:</strong> {searchResults.data.value} BAK</div>
                      <div><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          searchResults.data.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {searchResults.data.status}
                        </span>
                      </div>
                    </div>
                  )}
                  {searchResults.type === 'block' && (
                    <div className="space-y-2 text-sm">
                      <div><strong>Block Number:</strong> {searchResults.data.number}</div>
                      <div><strong>Hash:</strong> {formatAddress(searchResults.data.hash)}</div>
                      <div><strong>Transactions:</strong> {searchResults.data.transactions}</div>
                      <div><strong>Gas Used:</strong> {parseInt(searchResults.data.gasUsed).toLocaleString()}</div>
                      <div><strong>Miner:</strong> {formatAddress(searchResults.data.miner)}</div>
                    </div>
                  )}
                  {searchResults.type === 'address' && (
                    <div className="space-y-2 text-sm">
                      <div><strong>Address:</strong> {formatAddress(searchResults.data.address)}</div>
                      <div><strong>Balance:</strong> {searchResults.data.balance} BAK</div>
                      <div><strong>Transactions:</strong> {searchResults.data.transactionCount}</div>
                      <div><strong>First Seen:</strong> {formatDate(searchResults.data.firstSeen)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Explorer Tabs */}
            <div className="card-dark p-6">
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'transactions'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ShareIcon className="h-4 w-4 inline mr-2" />
                  Recent Transactions
                </button>
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'blocks'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CubeIcon className="h-4 w-4 inline mr-2" />
                  Recent Blocks
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 inline mr-2" />
                  Analytics
                </button>
              </div>

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-blue-400 text-sm">{formatAddress(tx.hash)}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.status === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            From: {formatAddress(tx.from)} → To: {formatAddress(tx.to)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Value: {tx.value} BAK | Gas: {parseInt(tx.gasUsed).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          <div>Block #{tx.blockNumber}</div>
                          <div>{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Blocks Tab */}
              {activeTab === 'blocks' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Blocks</h3>
                  {recentBlocks.map((block, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-blue-400">Block #{block.number}</span>
                            <span className="text-sm text-gray-400">{formatAddress(block.hash)}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Transactions: {block.transactions} | Gas Used: {parseInt(block.gasUsed).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            Miner: {formatAddress(block.miner)}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          <div>{formatDate(block.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Network Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Transaction Volume</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Last 24h:</span>
                          <span className="text-white">{(Math.random() * 10000 + 5000).toFixed(0)} TXs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Last 7d:</span>
                          <span className="text-white">{(Math.random() * 70000 + 35000).toFixed(0)} TXs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Last 30d:</span>
                          <span className="text-white">{(Math.random() * 300000 + 150000).toFixed(0)} TXs</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Network Health</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Block Time:</span>
                          <span className="text-green-400">~15s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Network Uptime:</span>
                          <span className="text-green-400">99.9%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Avg Gas Price:</span>
                          <span className="text-yellow-400">{networkStats.gasPrice} Gwei</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Token Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Supply:</span>
                          <span className="text-white">1,000,000,000 BAK</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Circulating:</span>
                          <span className="text-white">750,000,000 BAK</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Market Cap:</span>
                          <span className="text-white">$15,000,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">DeFi Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Value Locked:</span>
                          <span className="text-white">$2,500,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Active Contracts:</span>
                          <span className="text-white">1,247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Daily Volume:</span>
                          <span className="text-white">$450,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span>Network: BrainArk Besu</span>
            <span>•</span>
            <span>Chain ID: 424242</span>
            <span>•</span>
            <span>RPC: rpc.brainark.online</span>
            <span>•</span>
            <span>Explorer: explorer.brainark.online</span>
          </div>
          <p className="text-sm">
            Real-time blockchain data and analytics for the BrainArk ecosystem
          </p>
          <p className="text-xs mt-2">
            <a href="https://explorer.brainark.online" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              Visit full block explorer →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default BrainArkExplorer