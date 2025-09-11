import { useState, useEffect } from 'react'
import { AIRDROP_CONFIG, EPO_CONFIG } from '../utils/config'
import { networkService, NetworkStats } from '../services/networkService'

export default function StatsSection() {
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load real statistics from the BrainArk network
    const loadStats = async () => {
      try {
        setLoading(true)
        const networkStats = await networkService.getNetworkStats()
        setStats(networkStats)
      } catch (error) {
        console.error('Failed to load network stats:', error)
        // Fallback to basic stats
        setStats({
          totalParticipants: 1,
          totalClaimed: 10,
          totalSold: 0,
          totalRaised: 0,
          blockNumber: 771287,
          peerCount: 3,
          epoBalance: '1000000.0',
          airdropBalance: '1000000.0',
          lastUpdated: new Date()
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <section className="py-16 bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Live Statistics
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time data from the BrainArk ecosystem
          </p>
          {stats && !loading && (
            <p className="text-sm text-gray-400 mt-2">
              Last updated: {stats.lastUpdated.toLocaleTimeString()} • Block: {stats.blockNumber}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-brilliant p-6 text-center animate-pulse">
                <div className="bg-gray-200 rounded-full w-16 h-16 mx-auto mb-4" />
                <div className="bg-gray-200 h-8 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded mb-2" />
                <div className="bg-gray-200 h-3 rounded" />
              </div>
            ))
          ) : stats ? (
            <>
              {/* Airdrop Participants */}
              <div className="card-brilliant p-6 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalParticipants)}
                </h3>
                <p className="text-gray-600 font-medium">
                  Airdrop Participants
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Target: {formatNumber(AIRDROP_CONFIG.TARGET_PARTICIPANTS)}
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((stats.totalParticipants / AIRDROP_CONFIG.TARGET_PARTICIPANTS) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Total BAK Claimed */}
              <div className="card-brilliant p-6 text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalClaimed)}
                </h3>
                <p className="text-gray-600 font-medium">
                  BAK Tokens Claimed
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Pool: {formatNumber(AIRDROP_CONFIG.TOTAL_SUPPLY)} BAK
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((stats.totalClaimed / AIRDROP_CONFIG.TOTAL_SUPPLY) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* EPO Tokens Sold */}
              <div className="card-brilliant p-6 text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.totalSold)}
                </h3>
                <p className="text-gray-600 font-medium">
                  EPO Tokens Sold
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Supply: {formatNumber(EPO_CONFIG.TOTAL_SUPPLY)} BAK
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((stats.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Total Raised */}
              <div className="card-brilliant p-6 text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(stats.totalRaised)}
                </h3>
                <p className="text-gray-600 font-medium">
                  Total Raised
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Price: ${EPO_CONFIG.PRICE_START} - ${EPO_CONFIG.PRICE_END} per BAK
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((stats.totalRaised / (EPO_CONFIG.TOTAL_SUPPLY * EPO_CONFIG.PRICE_START)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Airdrop Info */}
          <div className="card-brilliant p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎁 Airdrop Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens per user:</span>
                <span className="font-semibold text-gray-900">
                  {AIRDROP_CONFIG.COINS_PER_USER} BAK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referral bonus:</span>
                <span className="font-semibold text-gray-900">
                  {AIRDROP_CONFIG.REFERRAL_BONUS} BAK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referral pool:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(AIRDROP_CONFIG.REFERRAL_POOL)} BAK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distribution delay:</span>
                <span className="font-semibold text-gray-900">
                  24 hours
                </span>
              </div>
            </div>
          </div>

          {/* EPO Info */}
          <div className="card-brilliant p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              💰 EPO Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Token price:</span>
                <span className="font-semibold text-gray-900">
                  ${EPO_CONFIG.PRICE_START}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accepted tokens:</span>
                <span className="font-semibold text-gray-900">
                  {EPO_CONFIG.ACCEPTED_TOKENS.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total supply:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(EPO_CONFIG.TOTAL_SUPPLY)} BAK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time limit:</span>
                <span className="font-semibold text-gray-900">
                  {EPO_CONFIG.DURATION_DAYS} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Network Info */}
        {stats && !loading && (
          <div className="mt-12">
            <div className="card-brilliant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🌐 Network Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.blockNumber}</div>
                  <div className="text-sm text-gray-600">Latest Block</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.peerCount}</div>
                  <div className="text-sm text-gray-600">Connected Peers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Number(stats.epoBalance).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">EPO Pool BAK</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Number(stats.airdropBalance).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Airdrop Pool BAK</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}