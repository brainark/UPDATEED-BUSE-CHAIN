import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function SuccessPage() {
  const router = useRouter()
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    // Get transaction data from query params or localStorage
    const { type, txHash, amount, token } = router.query
    
    if (type) {
      setTransactionData({
        type,
        txHash,
        amount,
        token,
        timestamp: new Date().toISOString()
      })
    } else {
      // Try to get from localStorage
      const savedData = localStorage.getItem('lastTransaction')
      if (savedData) {
        setTransactionData(JSON.parse(savedData))
        localStorage.removeItem('lastTransaction')
      }
    }
  }, [router.query])

  const getSuccessMessage = () => {
    if (!transactionData) return 'Transaction Successful!'
    
    switch (transactionData.type) {
      case 'airdrop':
        return 'Airdrop Claimed Successfully!'
      case 'epo':
        return 'EPO Purchase Successful!'
      default:
        return 'Transaction Successful!'
    }
  }

  const getSuccessDescription = () => {
    if (!transactionData) return 'Your transaction has been completed successfully.'
    
    switch (transactionData.type) {
      case 'airdrop':
        return `You have successfully claimed ${transactionData.amount || '10'} BAK native coins from the airdrop!`
      case 'epo':
        return `You have successfully purchased ${transactionData.amount || 'N/A'} BAK native coins for ${transactionData.token || 'N/A'}!`
      default:
        return 'Your transaction has been completed successfully.'
    }
  }

  return (
    <>
      <Head>
        <title>Success - BrainArk DApp</title>
        <meta name="description" content="Transaction completed successfully on BrainArk DApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main className="min-h-screen flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="card text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <CheckCircleIcon className="h-20 w-20 text-green-500" />
              </div>

              {/* Success Message */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {getSuccessMessage()}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {getSuccessDescription()}
              </p>

              {/* Transaction Details */}
              {transactionData && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Transaction Details
                  </h3>
                  
                  {transactionData.txHash && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Transaction Hash:
                      </span>
                      <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                        {transactionData.txHash}
                      </p>
                    </div>
                  )}
                  
                  {transactionData.amount && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Amount:
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transactionData.amount} BAK
                      </p>
                    </div>
                  )}
                  
                  {transactionData.token && transactionData.type === 'epo' && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Payment Token:
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {transactionData.token}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Time:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(transactionData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href="/"
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  Return to Home
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>

                <div className="flex space-x-4">
                  <Link
                    href="/airdrop"
                    className="btn-secondary flex-1 text-center"
                  >
                    Airdrop
                  </Link>
                  <Link
                    href="/epo"
                    className="btn-secondary flex-1 text-center"
                  >
                    EPO
                  </Link>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your native coins will appear in your wallet shortly. If you don't see them, 
                  try refreshing your wallet or adding the BAK native coin contract address.
                </p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}