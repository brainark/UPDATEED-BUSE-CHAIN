import React, { useState, useEffect } from 'react'
import { networkErrorHandler } from '@/utils/networkErrorHandler'

interface NetworkStatusMonitorProps {
  showDetails?: boolean
  className?: string
}

export default function NetworkStatusMonitor({ 
  showDetails = false, 
  className = '' 
}: NetworkStatusMonitorProps) {
  const [networkStatus, setNetworkStatus] = useState({
    blockedRequests: 0,
    activeRetries: 0,
    suppressedErrors: 0,
  })
  
  // DISABLED: Health check functionality temporarily disabled to prevent resource exhaustion
  const healthData = {
    status: 'degraded',
    services: {
      api: 'operational',
      database: 'unavailable', 
      contracts: 'unavailable',
      external: 'unavailable'
    },
    timestamp: new Date().toISOString()
  }
  const [showMonitor, setShowMonitor] = useState(false)

  useEffect(() => {
    // Update network status every 5 seconds
    const interval = setInterval(() => {
      const status = networkErrorHandler.getNetworkStatus()
      setNetworkStatus(status)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Only show in development or when there are issues
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    networkStatus.blockedRequests > 0 || 
                    networkStatus.activeRetries > 0 ||
                    showDetails

  if (!shouldShow && !showMonitor) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-50 hover:opacity-100"
        title="Show Network Status"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'unhealthy': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢'
      case 'degraded': return '🟡'
      case 'unhealthy': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Network Status</h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* System Health */}
      {healthData && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span>{getStatusIcon(healthData.status)}</span>
            <span className={`text-sm font-medium ${getStatusColor(healthData.status)}`}>
              System {healthData.status}
            </span>
          </div>
          
          {showDetails && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">API:</span>
                <span className={healthData.services?.api === 'operational' ? 'text-green-400' : 'text-red-400'}>
                  {healthData.services?.api || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DB:</span>
                <span className={healthData.services?.database === 'operational' ? 'text-green-400' : 'text-red-400'}>
                  {healthData.services?.database || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contracts:</span>
                <span className={healthData.services?.contracts === 'operational' ? 'text-green-400' : 'text-red-400'}>
                  {healthData.services?.contracts || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">External:</span>
                <span className={healthData.services?.external === 'operational' ? 'text-green-400' : 'text-red-400'}>
                  {healthData.services?.external || 'unknown'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Error Handler Stats */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Blocked Requests:</span>
          <span className="text-blue-400 font-medium">{networkStatus.blockedRequests}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Active Retries:</span>
          <span className={`font-medium ${networkStatus.activeRetries > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            {networkStatus.activeRetries}
          </span>
        </div>

        {networkStatus.activeRetries > 0 && (
          <div className="text-yellow-400 text-xs">
            ⏳ Retrying failed requests...
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => networkErrorHandler.clearRetries()}
          className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition-colors"
        >
          Clear Retries
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-2 py-1 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Messages */}
      {networkStatus.blockedRequests > 0 && (
        <div className="mt-2 text-xs text-blue-400">
          🚫 Blocked {networkStatus.blockedRequests} problematic requests
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Development Mode - All errors visible
        </div>
      )}
    </div>
  )
}