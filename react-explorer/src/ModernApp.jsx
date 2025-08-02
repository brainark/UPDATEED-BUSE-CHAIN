import React, { useState, useEffect } from 'react'
import { WalletProvider } from './components/ui/WalletProvider'
import { ConnectWallet } from './components/ui/ConnectWallet'
import { TransactionCard } from './components/ui/TransactionCard'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { Badge } from './components/ui/Badge'
import { Alert, AlertDescription } from './components/ui/Alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import Web3 from 'web3'
import { CURRENT_NETWORK, RPC_URL } from './config'
import { 
  Activity, 
  BarChart3, 
  Search, 
  Wallet, 
  Globe, 
  Zap,
  TrendingUp,
  Users,
  Database
} from 'lucide-react'

function ModernApp() {
  const [web3] = useState(new Web3(new Web3.providers.HttpProvider(RPC_URL)))
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    gasPrice: '0',
    peerCount: 0,
    hashrate: '0'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const [blockNumber, gasPrice] = await Promise.all([
          web3.eth.getBlockNumber(),
          web3.eth.getGasPrice()
        ])

        setNetworkStats({
          blockNumber,
          gasPrice: web3.utils.fromWei(gasPrice, 'gwei'),
          peerCount: Math.floor(Math.random() * 20) + 5, // Mock data
          hashrate: (Math.random() * 100).toFixed(2) // Mock data
        })
      } catch (error) {
        console.error('Failed to fetch network stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNetworkStats()
    const interval = setInterval(fetchNetworkStats, 15000)
    return () => clearInterval(interval)
  }, [web3])

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-blockchain rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🧠</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      BrainArk Explorer
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Blockchain Analytics & DApp Interface
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="hidden sm:flex">
                  {CURRENT_NETWORK.CHAIN_NAME}
                </Badge>
                <Badge variant="success" className="animate-pulse-glow">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Latest Block
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : networkStats.blockNumber.toLocaleString()}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-blockchain-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Gas Price
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : `${parseFloat(networkStats.gasPrice).toFixed(2)} Gwei`}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-blockchain-warning" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Network Peers
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : networkStats.peerCount}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blockchain-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Hashrate
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : `${networkStats.hashrate} TH/s`}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blockchain-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wallet Connection */}
              <div className="lg:col-span-1">
                <ConnectWallet />
              </div>

              {/* Explorer Tabs */}
              <div className="lg:col-span-2">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Blockchain Explorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="transactions" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Transactions
                        </TabsTrigger>
                        <TabsTrigger value="blocks" className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Blocks
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="transactions" className="mt-6">
                        <TransactionCard web3={web3} />
                      </TabsContent>
                      
                      <TabsContent value="blocks" className="mt-6">
                        <Alert>
                          <Database className="h-4 w-4" />
                          <AlertDescription>
                            Block explorer functionality coming soon. Search for specific blocks and view their contents.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                      
                      <TabsContent value="analytics" className="mt-6">
                        <Alert>
                          <BarChart3 className="h-4 w-4" />
                          <AlertDescription>
                            Advanced analytics dashboard coming soon. View network statistics, transaction volumes, and more.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    <span>Send Transaction</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Globe className="h-6 w-6" />
                    <span>Deploy Contract</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Activity className="h-6 w-6" />
                    <span>Monitor Address</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-blockchain rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">🧠</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  BrainArk Blockchain Explorer
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Network: {CURRENT_NETWORK.CHAIN_NAME}</span>
                <span>•</span>
                <span>Chain ID: {CURRENT_NETWORK.CHAIN_ID_DECIMAL}</span>
                <span>•</span>
                <span>Built with React & Wagmi</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletProvider>
  )
}

export default ModernApp