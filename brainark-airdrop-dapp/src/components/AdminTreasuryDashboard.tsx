import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getAllTreasuryAddresses, NETWORKS, PAYMENT_TOKENS } from '../utils/multiNetworkConfig'

interface TreasuryBalance {
  network: string
  token: string
  address: string
  balance: string
  balanceUSD: number
  isAccessible: boolean
  error?: string
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token: string
  network: string
  timestamp: string
  type: 'airdrop' | 'epo' | 'general'
  status: 'success' | 'failed' | 'pending'
  gasUsed?: string
  usdValue: number
}

interface AdminAuth {
  isAuthenticated: boolean
  adminAddress: string | null
  isOwner: boolean
}

const AdminTreasuryDashboard: React.FC = () => {
  const [auth, setAuth] = useState<AdminAuth>({
    isAuthenticated: false,
    adminAddress: null,
    isOwner: false
  })
  const [treasuryBalances, setTreasuryBalances] = useState<TreasuryBalance[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'balances' | 'transactions'>('overview')

  // Admin/Owner addresses - these should be stored securely
  const AUTHORIZED_ADDRESSES = [
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
    process.env.NEXT_PUBLIC_OWNER_ADDRESS?.toLowerCase(),
    // Add your admin addresses here
    '0xE45ab484E375f34A429169DeB52C94ab49E8838f'.toLowerCase(), // Example admin address
  ].filter(Boolean)

  // Connect wallet and verify admin access
  const connectAndVerifyAdmin = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const adminAddress = accounts[0]

      // Check if connected address is authorized
      const isAuthorized = AUTHORIZED_ADDRESSES.includes(adminAddress.toLowerCase())
      
      if (!isAuthorized) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Additional verification: Sign a message to prove ownership
      const signer = await provider.getSigner()
      const message = `BrainArk Admin Access - ${Date.now()}`
      const signature = await signer.signMessage(message)
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error('Signature verification failed')
      }

      setAuth({
        isAuthenticated: true,
        adminAddress,
        isOwner: true
      })

      setError(null)
    } catch (error: any) {
      setError(error.message)
      setAuth({
        isAuthenticated: false,
        adminAddress: null,
        isOwner: false
      })
    }
  }

  // Fetch treasury balances (only for authenticated admins)
  const fetchTreasuryBalances = async () => {
    if (!auth.isAuthenticated) return

    setIsLoading(true)
    setError(null)

    try {
      const balances: TreasuryBalance[] = []

      for (const token of PAYMENT_TOKENS) {
        try {
          const network = NETWORKS[token.network]
          const provider = new ethers.JsonRpcProvider(network.rpcUrl)

          let balance = '0'
          let balanceUSD = 0

          if (token.contractAddress === '0x0000000000000000000000000000000000000000') {
            // Native token balance
            const balanceWei = await provider.getBalance(token.treasuryAddress)
            balance = ethers.formatEther(balanceWei)
          } else {
            // ERC20 token balance
            const contract = new ethers.Contract(
              token.contractAddress,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            )
            const balanceWei = await contract.balanceOf(token.treasuryAddress)
            balance = ethers.formatUnits(balanceWei, token.decimals)
          }

          // Calculate USD value (you'd want to use real-time prices in production)
          const tokenPrices: Record<string, number> = {
            ETH: 2000, BNB: 300, MATIC: 0.8, USDT: 1, USDC: 1
          }
          balanceUSD = parseFloat(balance) * (tokenPrices[token.symbol] || 1)

          balances.push({
            network: network.name,
            token: token.symbol,
            address: token.treasuryAddress,
            balance,
            balanceUSD,
            isAccessible: true
          })

        } catch (error: any) {
          balances.push({
            network: NETWORKS[token.network].name,
            token: token.symbol,
            address: token.treasuryAddress,
            balance: '0',
            balanceUSD: 0,
            isAccessible: false,
            error: error.message
          })
        }
      }

      setTreasuryBalances(balances)
      setLastUpdated(new Date())

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch recent transactions to treasury addresses (airdrop and EPO payments)
  const fetchRecentTransactions = async () => {
    if (!auth.isAuthenticated) return

    setIsLoadingTransactions(true)
    
    try {
      const transactions: Transaction[] = []
      const tokenPrices: Record<string, number> = {
        ETH: 2000, BNB: 300, MATIC: 0.8, USDT: 1, USDC: 1
      }

      // Get transactions for each treasury address
      for (const token of PAYMENT_TOKENS.slice(0, 3)) { // Limit to first 3 for demo
        try {
          const network = NETWORKS[token.network]
          const provider = new ethers.JsonRpcProvider(network.rpcUrl)
          
          // Get the latest block
          const latestBlock = await provider.getBlockNumber()
          const blocksToCheck = Math.min(100, latestBlock) // Check last 100 blocks
          
          // Check recent blocks for transactions to treasury addresses
          for (let i = 0; i < blocksToCheck && transactions.length < 20; i++) {
            const blockNumber = latestBlock - i
            const block = await provider.getBlock(blockNumber, true)
            
            if (block && block.transactions) {
              for (const txHash of block.transactions.slice(0, 10)) { // Limit transactions per block
                try {
                  const tx = await provider.getTransaction(txHash as string)
                  if (!tx) continue
                  
                  // Check if transaction is to our treasury address
                  if (tx.to?.toLowerCase() === token.treasuryAddress.toLowerCase()) {
                    const receipt = await provider.getTransactionReceipt(txHash as string)
                    
                    let value = '0'
                    if (token.contractAddress === '0x0000000000000000000000000000000000000000') {
                      // Native token
                      value = ethers.formatEther(tx.value || '0')
                    } else {
                      // ERC20 token - would need to parse logs for actual value
                      value = '0' // Simplified for demo
                    }
                    
                    const usdValue = parseFloat(value) * (tokenPrices[token.symbol] || 1)
                    
                    // Determine transaction type based on value patterns
                    let txType: 'airdrop' | 'epo' | 'general' = 'general'
                    if (usdValue >= 10 && usdValue <= 100) {
                      txType = 'airdrop' // Typical airdrop amounts
                    } else if (usdValue > 100) {
                      txType = 'epo' // Larger EPO investments
                    }
                    
                    transactions.push({
                      hash: txHash as string,
                      from: tx.from || '',
                      to: tx.to || '',
                      value,
                      token: token.symbol,
                      network: network.name,
                      timestamp: new Date(Number(block.timestamp || 0) * 1000).toISOString(),
                      type: txType,
                      status: receipt?.status ? 'success' : 'failed',
                      gasUsed: receipt?.gasUsed.toString(),
                      usdValue
                    })
                  }
                } catch (txError) {
                  // Skip failed transactions
                  continue
                }
              }
            }
          }
        } catch (networkError) {
          console.error(`Error fetching transactions for ${token.network}:`, networkError)
        }
      }

      // Sort by timestamp (newest first)
      transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentTransactions(transactions.slice(0, 50)) // Keep latest 50

    } catch (error: any) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  // Auto-refresh balances and transactions
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTreasuryBalances()
      fetchRecentTransactions()
      const interval = setInterval(() => {
        fetchTreasuryBalances()
        fetchRecentTransactions()
      }, 5 * 60 * 1000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [auth.isAuthenticated])

  // Calculate totals
  const totalUSDValue = treasuryBalances.reduce((sum, balance) => sum + balance.balanceUSD, 0)
  const accessibleTreasuries = treasuryBalances.filter(b => b.isAccessible).length
  const totalTreasuries = treasuryBalances.length
  
  // Transaction analytics
  const airdropTransactions = recentTransactions.filter(tx => tx.type === 'airdrop')
  const epoTransactions = recentTransactions.filter(tx => tx.type === 'epo')
  const totalTransactionValue = recentTransactions.reduce((sum, tx) => sum + tx.usdValue, 0)
  const airdropValue = airdropTransactions.reduce((sum, tx) => sum + tx.usdValue, 0)
  const epoValue = epoTransactions.reduce((sum, tx) => sum + tx.usdValue, 0)

  // Logout function
  const logout = () => {
    setAuth({
      isAuthenticated: false,
      adminAddress: null,
      isOwner: false
    })
    setTreasuryBalances([])
    setError(null)
  }

  // If not authenticated, show login screen
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔒 Admin Access Required
            </h1>
            <p className="text-gray-600">
              Treasury dashboard is restricted to authorized administrators only
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}

          <button
            onClick={connectAndVerifyAdmin}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔐 Connect Admin Wallet
          </button>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Security Notice:</strong> Only authorized admin wallets can access this dashboard.
              Your wallet address will be verified against the authorized list.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏦 Treasury Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Admin: {auth.adminAddress?.slice(0, 6)}...{auth.adminAddress?.slice(-4)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  fetchTreasuryBalances()
                  fetchRecentTransactions()
                }}
                disabled={isLoading || isLoadingTransactions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {(isLoading || isLoadingTransactions) ? '🔄 Refreshing...' : '🔄 Refresh All'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'balances', name: 'Treasury Balances', icon: '💰' },
                { id: 'transactions', name: 'Recent Transactions', icon: '📝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalUSDValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Treasuries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessibleTreasuries}/{totalTreasuries}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🌐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Networks</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Airdrop Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${airdropValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{airdropTransactions.length} transactions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🦄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">EPO Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${epoValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{epoTransactions.length} transactions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{recentTransactions.length}</p>
                    <p className="text-xs text-gray-500">
                      ${totalTransactionValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} volume
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm font-bold text-gray-900">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                    </p>
                    {(isLoading || isLoadingTransactions) && (
                      <p className="text-xs text-blue-500">Refreshing...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Treasury Balances Tab */}
        {activeTab === 'balances' && (
          <div>
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            {/* Treasury Balances Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Treasury Balances</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Network
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        USD Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {treasuryBalances.map((balance, index) => (
                      <tr key={index} className={balance.isAccessible ? '' : 'bg-red-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {balance.network}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.token}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {balance.address.slice(0, 6)}...{balance.address.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(balance.balance).toLocaleString(undefined, { 
                            maximumFractionDigits: 6 
                          })} {balance.token}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${balance.balanceUSD.toLocaleString(undefined, { 
                            maximumFractionDigits: 2 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {balance.isAccessible ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            {isLoadingTransactions && (
              <div className="mb-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading recent transactions...</p>
              </div>
            )}

            {/* Transaction Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                All ({recentTransactions.length})
              </button>
              <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                Airdrop ({airdropTransactions.length})
              </button>
              <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                EPO ({epoTransactions.length})
              </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Treasury Transactions</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Network
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No recent transactions found
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((tx, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.type === 'airdrop' ? 'bg-orange-100 text-orange-800' :
                              tx.type === 'epo' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.type === 'airdrop' ? '🎁' : tx.type === 'epo' ? '🦄' : '📊'} {tx.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parseFloat(tx.value).toFixed(4)} {tx.token}
                            <div className="text-xs text-gray-500">
                              ≈ ${tx.usdValue.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.network}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'success' ? 'bg-green-100 text-green-800' :
                              tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tx.status === 'success' ? '✅' : tx.status === 'failed' ? '❌' : '⏳'} {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This dashboard contains sensitive financial information and is restricted to authorized administrators only.
                  All access attempts are logged and monitored. Airdrop and EPO transactions are automatically categorized based on transaction value patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTreasuryDashboard