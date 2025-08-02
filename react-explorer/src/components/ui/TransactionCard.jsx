import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'
import { Alert, AlertDescription, AlertTitle } from './Alert'
import { formatTxHash, formatAddress, copyToClipboard } from '../../lib/utils'
import { Search, Copy, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function TransactionCard({ web3 }) {
  const [txHash, setTxHash] = useState('')
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchTransaction = async () => {
    if (!txHash.trim()) {
      setError('Please enter a transaction hash')
      return
    }

    if (!web3) {
      setError('Web3 not initialized. Please check blockchain connection.')
      return
    }

    setLoading(true)
    setError('')
    setTransaction(null)

    try {
      console.log('Searching for transaction:', txHash)
      
      // Validate transaction hash format
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        setError('Invalid transaction hash format. Must be 66 characters starting with 0x')
        return
      }

      // Test connection first
      try {
        await web3.eth.getBlockNumber()
      } catch (connErr) {
        setError('Cannot connect to blockchain node. Please check if the node is running.')
        return
      }

      const tx = await web3.eth.getTransaction(txHash)
      console.log('Transaction result:', tx)
      
      if (!tx) {
        setError('Transaction not found. Please check the hash and try again.')
        return
      }

      let receipt = null
      let block = null
      
      try {
        receipt = await web3.eth.getTransactionReceipt(txHash)
        console.log('Transaction receipt:', receipt)
      } catch (receiptErr) {
        console.warn('Could not fetch receipt:', receiptErr.message)
      }
      
      if (tx.blockNumber) {
        try {
          block = await web3.eth.getBlock(tx.blockNumber)
          console.log('Block info:', block)
        } catch (blockErr) {
          console.warn('Could not fetch block:', blockErr.message)
        }
      }
      
      setTransaction({
        ...tx,
        receipt,
        block,
        timestamp: block ? new Date(Number(block.timestamp) * 1000) : null
      })
    } catch (err) {
      console.error('Transaction search error:', err)
      if (err.message.includes('CONNECTION ERROR') || err.message.includes('connect ECONNREFUSED')) {
        setError('Cannot connect to blockchain node. Please check if the node is running on the correct port.')
      } else if (err.message.includes('Invalid JSON RPC')) {
        setError('Invalid response from blockchain node.')
      } else if (err.message.includes('timeout')) {
        setError('Request timeout. The blockchain node may be slow or unresponsive.')
      } else {
        setError('Failed to fetch transaction: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTransaction()
    }
  }

  const getStatusBadge = (receipt) => {
    if (!receipt) {
      return <Badge variant="warning">Pending</Badge>
    }
    
    if (receipt.status === true || receipt.status === '0x1' || receipt.status === 1) {
      return <Badge variant="success">Success</Badge>
    } else {
      return <Badge variant="destructive">Failed</Badge>
    }
  }

  const getStatusIcon = (receipt) => {
    if (!receipt) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    
    if (receipt.status === true || receipt.status === '0x1' || receipt.status === 1) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Transaction Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter transaction hash (0x...)"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={searchTransaction}
              disabled={loading}
              className="min-w-[100px]"
              variant="primary"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!web3 && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>
                Web3 connection not available. Please check if the blockchain node is running.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getStatusIcon(transaction.receipt)}
                Transaction Details
              </span>
              {getStatusBadge(transaction.receipt)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Hash</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono break-all text-white">{formatTxHash(transaction.hash)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => copyToClipboard(transaction.hash)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Block</h4>
                  <span className="text-sm font-mono text-white">
                    {transaction.blockNumber ? `#${transaction.blockNumber}` : 'Pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Timestamp</h4>
                  <span className="text-sm text-white">
                    {transaction.timestamp ? transaction.timestamp.toLocaleString() : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">From</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{formatAddress(transaction.from)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.from)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">To</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">
                      {transaction.to ? formatAddress(transaction.to) : 'Contract Creation'}
                    </span>
                    {transaction.to && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(transaction.to)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Value</h4>
                  <span className="text-sm font-mono text-white">
                    {web3.utils.fromWei(transaction.value, 'ether')} BAK
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Gas Used</h4>
                  <span className="text-sm font-mono text-white">
                    {transaction.receipt ? 
                      `${transaction.receipt.gasUsed.toLocaleString()} / ${transaction.gas.toLocaleString()}` :
                      transaction.gas.toLocaleString()
                    }
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Gas Price</h4>
                  <span className="text-sm font-mono text-white">
                    {web3.utils.fromWei(transaction.gasPrice, 'gwei')} Gwei
                  </span>
                </div>
              </div>

              {transaction.receipt && transaction.receipt.logs && transaction.receipt.logs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Events</h4>
                  <div className="bg-gray-700 rounded-md p-3">
                    <span className="text-sm text-white">{transaction.receipt.logs.length} event(s) emitted</span>
                  </div>
                </div>
              )}

              {transaction.input && transaction.input !== '0x' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-400">Input Data</h4>
                  <div className="bg-gray-700 rounded-md p-3 max-h-32 overflow-y-auto">
                    <span className="text-xs font-mono break-all text-white">{transaction.input}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}