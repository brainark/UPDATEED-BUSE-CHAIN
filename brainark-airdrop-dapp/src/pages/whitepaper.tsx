import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { DocumentTextIcon, ArrowTopRightOnSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function WhitepaperPage() {
  const [pdfUploaded, setPdfUploaded] = useState(false)

  return (
    <>
      <Head>
        <title>BrainArk Whitepaper - Technical Documentation</title>
        <meta name="description" content="Read the BrainArk whitepaper and explore our blockchain explorer for detailed technical information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main className="min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <DocumentTextIcon className="h-16 w-16 text-brainark-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                BrainArk Whitepaper
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Comprehensive technical documentation and vision for the BrainArk ecosystem
              </p>
            </div>

            {/* Whitepaper Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* PDF Viewer/Upload */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Whitepaper Document
                </h2>
                
                {!pdfUploaded ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Whitepaper Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      The official BrainArk whitepaper will be uploaded here soon. 
                      It will contain detailed information about our technology, native coin economics, and roadmap.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expected release: Q1 2024
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-8 w-8 text-brainark-500 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              BrainArk_Whitepaper_v1.0.pdf
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              2.4 MB • Last updated: Today
                            </p>
                          </div>
                        </div>
                        <button className="btn-outline">
                          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                    
                    {/* PDF Viewer Placeholder */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        PDF Viewer will be embedded here
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                {/* Explorer Link */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    🔍 Blockchain Explorer
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Explore the BrainArk Besu blockchain in real-time. View transactions, 
                    blocks, and network statistics.
                  </p>
                  <Link
                    href="https://explorer.brainark.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center"
                  >
                    Open Explorer
                    <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                {/* Key Features */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    📋 Key Features
                  </h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-brainark-500 mr-2">•</span>
                      Native EVM-compatible blockchain built with Hyperledger Besu
                    </li>
                    <li className="flex items-start">
                      <span className="text-brainark-500 mr-2">•</span>
                      IBFT consensus mechanism for fast and secure transactions
                    </li>
                    <li className="flex items-start">
                      <span className="text-brainark-500 mr-2">•</span>
                      10M BAK native coin airdrop with referral system
                    </li>
                    <li className="flex items-start">
                      <span className="text-brainark-500 mr-2">•</span>
                      Early Public Offering (EPO) at $0.02 per native coin
                    </li>
                    <li className="flex items-start">
                      <span className="text-brainark-500 mr-2">•</span>
                      Multi-cryptocurrency payment support (ETH, USDT, USDC, BNB)
                    </li>
                  </ul>
                </div>

                {/* Technical Specs */}
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    ⚙️ Technical Specifications
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Blockchain:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">Hyperledger Besu</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Consensus:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">IBFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Chain ID:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">1337</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Native Token:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">BAK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">RPC Endpoint:</span>
                      <span className="text-gray-900 dark:text-white font-semibold">https://rpc.brainark.online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📚 Additional Resources
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-brainark-100 dark:bg-brainark-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Airdrop Guide
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Learn how to participate in the BrainArk airdrop and earn referral bonuses.
                  </p>
                  <Link href="/airdrop" className="btn-outline text-sm">
                    View Guide
                  </Link>
                </div>

                <div className="text-center">
                  <div className="bg-brainark-100 dark:bg-brainark-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    EPO Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Understand the Early Public Offering and how to purchase BAK native coins.
                  </p>
                  <Link href="/epo" className="btn-outline text-sm">
                    Learn More
                  </Link>
                </div>

                <div className="text-center">
                  <div className="bg-brainark-100 dark:bg-brainark-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Network Setup
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Instructions for adding BrainArk network to your wallet.
                  </p>
                  <button className="btn-outline text-sm">
                    Setup Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}