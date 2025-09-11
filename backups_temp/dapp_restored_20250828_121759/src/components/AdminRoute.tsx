import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface AdminAuth {
  isAuthenticated: boolean
  isLoading: boolean
  adminAddress: string | null
  error: string | null
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, fallback }) => {
  const [auth, setAuth] = useState<AdminAuth>({
    isAuthenticated: false,
    isLoading: true,
    adminAddress: null,
    error: null
  })

  // SINGLE ADMIN CONFIGURATION
  // Only this address has admin privileges: 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782
  const SINGLE_ADMIN_ADDRESS = '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782'.toLowerCase()
  
  const AUTHORIZED_ADDRESSES = [
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
    process.env.NEXT_PUBLIC_OWNER_ADDRESS?.toLowerCase(), 
    process.env.NEXT_PUBLIC_TREASURY_ADMIN?.toLowerCase(),
    SINGLE_ADMIN_ADDRESS, // Hardcoded fallback to ensure admin access
  ].filter(Boolean)

  // Check if user is already connected and authorized
  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      if (!window.ethereum) {
        setAuth(prev => ({ ...prev, isLoading: false, error: 'MetaMask not installed' }))
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_accounts', [])
      
      if (accounts.length === 0) {
        setAuth(prev => ({ ...prev, isLoading: false }))
        return
      }

      const currentAddress = accounts[0]
      const isAuthorized = AUTHORIZED_ADDRESSES.includes(currentAddress.toLowerCase())

      if (isAuthorized) {
        setAuth({
          isAuthenticated: true,
          isLoading: false,
          adminAddress: currentAddress,
          error: null
        })
      } else {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          adminAddress: null,
          error: `Unauthorized wallet address. Only ${SINGLE_ADMIN_ADDRESS} has admin access.`
        })
      }

    } catch (error: any) {
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        adminAddress: null,
        error: error.message
      })
    }
  }

  const connectAndVerifyAdmin = async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }))

      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const adminAddress = accounts[0]

      // Check if connected address is the authorized admin
      const isAuthorized = AUTHORIZED_ADDRESSES.includes(adminAddress.toLowerCase())
      
      if (!isAuthorized) {
        throw new Error(`Unauthorized: Only the admin wallet ${SINGLE_ADMIN_ADDRESS} can access this dashboard.`)
      }

      // Additional verification: Sign a message to prove ownership
      const signer = await provider.getSigner()
      const timestamp = Date.now()
      const message = `BrainArk Admin Access Verification\nTimestamp: ${timestamp}\nAddress: ${adminAddress}\nSingle Admin System`
      
      const signature = await signer.signMessage(message)
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error('Signature verification failed')
      }

      setAuth({
        isAuthenticated: true,
        isLoading: false,
        adminAddress,
        error: null
      })

    } catch (error: any) {
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        adminAddress: null,
        error: error.message
      })
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            adminAddress: null,
            error: null
          })
        } else {
          checkExistingConnection()
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // Loading state
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!auth.isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Single Admin Access Required
            </h1>
            <p className="text-gray-600">
              This dashboard is restricted to the authorized admin wallet only
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm font-mono">
                Admin: {SINGLE_ADMIN_ADDRESS.slice(0, 6)}...{SINGLE_ADMIN_ADDRESS.slice(-4)}
              </p>
            </div>
          </div>

          {auth.error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">❌</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 text-sm">{auth.error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={connectAndVerifyAdmin}
            disabled={auth.isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {auth.isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </span>
            ) : (
              '🔐 Connect Admin Wallet'
            )}
          </button>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Single Admin System
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Only one wallet has admin privileges</li>
                    <li>You must sign a verification message</li>
                    <li>All access attempts are logged and monitored</li>
                    <li>This wallet also serves as USDT Treasury</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Contact system administrator if you believe you should have access
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated - render children
  return <>{children}</>
}

export default AdminRoute