import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Badge } from './Badge'
import { Alert, AlertDescription } from './Alert'
import { formatAddress, copyToClipboard } from '../../lib/utils'
import { Copy, ExternalLink, Wallet } from 'lucide-react'
import { CURRENT_NETWORK } from '../../config'

export function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [chainId, setChainId] = useState('')

  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setIsConnected(true)
          setAddress(accounts[0])
          
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setChainId(chainId)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAddress('')
      setBalance('0')
    } else {
      setAddress(accounts[0])
      checkConnection()
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(chainId)
    checkConnection()
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
        checkConnection()
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress('')
    setBalance('0')
    setChainId('')
  }

  const isCorrectNetwork = chainId === CURRENT_NETWORK.CHAIN_ID

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="info">
            <AlertDescription>
              Connect your wallet to interact with the BrainArk blockchain
            </AlertDescription>
          </Alert>
          <Button
            onClick={connectWallet}
            className="w-full"
            size="lg"
          >
            Connect MetaMask
          </Button>
          {!window.ethereum && (
            <Alert variant="warning">
              <AlertDescription>
                MetaMask not detected. Please install MetaMask extension.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </span>
          <Badge variant={isCorrectNetwork ? "success" : "warning"}>
            {isCorrectNetwork ? "Connected" : "Wrong Network"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCorrectNetwork && (
          <Alert variant="warning">
            <AlertDescription>
              Please switch to the BrainArk network (Chain ID: {CURRENT_NETWORK.CHAIN_ID_DECIMAL})
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{formatAddress(address)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(address)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-sm font-mono">
              {balance} BAK
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <Badge variant="outline">
              {isCorrectNetwork ? CURRENT_NETWORK.CHAIN_NAME : `Chain ID: ${parseInt(chainId, 16)}`}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          >
            View on Explorer
          </Button>
          
          <Button
            onClick={disconnect}
            variant="outline"
            className="flex-1"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}