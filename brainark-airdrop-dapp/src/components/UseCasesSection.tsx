import React, { useState } from 'react'

interface UseCase {
  id: number
  title: string
  description: string
  integration: string
}

interface UseCaseCategory {
  category: string
  icon: string
  color: string
  cases: UseCase[]
}

export default function UseCasesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const useCaseCategories: UseCaseCategory[] = [
    {
      category: 'Financial Systems',
      icon: '💰',
      color: 'from-green-500 to-green-600',
      cases: [
        {
          id: 1,
          title: 'Stablecoin Issuance',
          description: 'Launch a fiat-pegged BAKUSD.',
          integration: 'Integrate mint/burn logic in a smart contract.'
        },
        {
          id: 2,
          title: 'Cross-Border Payments',
          description: 'Enable low-fee global transfers.',
          integration: 'Use Web3 payment interfaces and multi-currency settlement.'
        },
        {
          id: 3,
          title: 'Tokenized Real-World Assets',
          description: 'Represent real estate or gold.',
          integration: 'Smart contracts manage ownership transfer.'
        },
        {
          id: 4,
          title: 'DeFi Lending & Staking',
          description: 'Deploy yield farming protocols.',
          integration: 'Combine Solidity logic and Web3 UI.'
        },
        {
          id: 5,
          title: 'Micro-Lending Platforms',
          description: 'Peer-to-peer collateralized loans.',
          integration: 'Lock assets via smart contract automation.'
        },
        {
          id: 6,
          title: 'Charity & Donations',
          description: 'Transparent, traceable giving.',
          integration: 'Use contract vaults and activity logs.'
        },
        {
          id: 7,
          title: 'Payroll on Blockchain',
          description: 'Automate salary payments with programmable contracts.',
          integration: 'Deploy automated payment contracts.'
        },
        {
          id: 8,
          title: 'Decentralized Exchange (DEX)',
          description: 'Enable BAK token swaps with AMM models.',
          integration: 'Implement liquidity pools and trading interfaces.'
        },
        {
          id: 9,
          title: 'Multi-Signature Wallets',
          description: 'Secure DAO or business funds.',
          integration: 'Use contract-based multisig wallets.'
        },
        {
          id: 10,
          title: 'Treasury & DAO Governance',
          description: 'Manage community treasuries with proposal voting systems.',
          integration: 'Deploy governance contracts with voting mechanisms.'
        }
      ]
    },
    {
      category: 'Identity & Access',
      icon: '🔐',
      color: 'from-blue-500 to-blue-600',
      cases: [
        {
          id: 11,
          title: 'Decentralized Identity (DID)',
          description: 'Self-sovereign IDs built on ERC-725 and IPFS.',
          integration: 'Implement identity contracts with IPFS storage.'
        },
        {
          id: 12,
          title: 'On-chain KYC/AML',
          description: 'Store encrypted hashes after verification via oracles.',
          integration: 'Use oracle services for identity verification.'
        },
        {
          id: 13,
          title: 'Digital Certificates',
          description: 'NFT-based diplomas or licenses linked to identity.',
          integration: 'Deploy certificate NFTs with metadata verification.'
        },
        {
          id: 14,
          title: 'Secure Online Voting',
          description: 'Transparent, tamper-proof elections.',
          integration: 'Frontend + voting contract implementation.'
        },
        {
          id: 15,
          title: 'Access Control via NFTs',
          description: 'NFTs grant physical or app access.',
          integration: 'Verify via wallet signature authentication.'
        }
      ]
    },
    {
      category: 'Logistics & Supply Chain',
      icon: '📦',
      color: 'from-orange-500 to-orange-600',
      cases: [
        {
          id: 16,
          title: 'Product Authenticity',
          description: 'On-chain product tags for anti-counterfeiting.',
          integration: 'Deploy product verification smart contracts.'
        },
        {
          id: 17,
          title: 'Supply Chain Transparency',
          description: 'Track product journey using updated NFT metadata.',
          integration: 'Implement tracking NFTs with journey logs.'
        },
        {
          id: 18,
          title: 'Logistics Audits',
          description: 'Immutable tracking logs pushed from warehouse systems via APIs.',
          integration: 'Connect warehouse APIs to blockchain logging.'
        },
        {
          id: 19,
          title: 'IoT + Blockchain Monitoring',
          description: 'IoT sensors write cold-chain data to chain via gateways.',
          integration: 'Deploy IoT gateways with blockchain integration.'
        },
        {
          id: 20,
          title: 'Inventory Tokenization',
          description: 'Token-based stock management for manufacturers.',
          integration: 'Create inventory tokens with real-time updates.'
        }
      ]
    },
    {
      category: 'Gaming & Metaverse',
      icon: '🎮',
      color: 'from-purple-500 to-purple-600',
      cases: [
        {
          id: 21,
          title: 'In-Game NFTs',
          description: 'Items like weapons or skins represented as NFTs.',
          integration: 'Deploy game asset NFTs with metadata.'
        },
        {
          id: 22,
          title: 'Play-to-Earn Rewards',
          description: 'Distribute BAK tokens for user achievements via smart contracts.',
          integration: 'Implement achievement-based token distribution.'
        },
        {
          id: 23,
          title: 'Virtual Real Estate',
          description: 'NFT parcels in virtual worlds.',
          integration: 'Create land NFTs with coordinate mapping.'
        },
        {
          id: 24,
          title: 'Gaming Guild DAOs',
          description: 'Group-based governance for shared game rewards.',
          integration: 'Deploy guild governance contracts.'
        },
        {
          id: 25,
          title: 'Cross-Platform Avatars',
          description: 'Avatars standardized and interoperable via NFT specs.',
          integration: 'Implement avatar NFTs with cross-game compatibility.'
        }
      ]
    },
    {
      category: 'Enterprise & Data',
      icon: '🏢',
      color: 'from-gray-500 to-gray-600',
      cases: [
        {
          id: 26,
          title: 'Document Timestamping',
          description: 'Hash and store legal or business documents.',
          integration: 'Deploy document hash storage contracts.'
        },
        {
          id: 27,
          title: 'Regulatory Audit Trails',
          description: 'Immutable logs of operations.',
          integration: 'Push logs from systems to chain via APIs.'
        },
        {
          id: 28,
          title: 'DAO Corporate Structures',
          description: 'Decentralize business decisions with smart voting.',
          integration: 'Implement corporate governance DAOs.'
        },
        {
          id: 29,
          title: 'Insurance Payout Automation',
          description: 'Auto-approve claims via oracles.',
          integration: 'Connect insurance systems with oracle networks.'
        },
        {
          id: 30,
          title: 'Carbon Credit Marketplace',
          description: 'Issue verifiable carbon offset tokens.',
          integration: 'Deploy carbon credit tokenization platform.'
        }
      ]
    },
    {
      category: 'Education & Creative Work',
      icon: '🎨',
      color: 'from-pink-500 to-pink-600',
      cases: [
        {
          id: 31,
          title: 'Course Completion Badges',
          description: 'On-chain skill certifications in NFT form.',
          integration: 'Deploy educational NFT certificates.'
        },
        {
          id: 32,
          title: 'Creator Copyright Protection',
          description: 'Timestamped NFT or hash storage.',
          integration: 'Implement copyright protection contracts.'
        },
        {
          id: 33,
          title: 'Royalty Enforcement',
          description: 'Auto payouts from secondary NFT sales.',
          integration: 'Deploy royalty distribution smart contracts.'
        },
        {
          id: 34,
          title: 'Crowdfunding for Artists',
          description: 'Fans fund creators through NFT-based tiers.',
          integration: 'Create crowdfunding platforms with NFT rewards.'
        },
        {
          id: 35,
          title: 'Interactive Learning NFTs',
          description: 'IPFS-hosted content embedded in metadata.',
          integration: 'Deploy educational content NFTs with IPFS.'
        }
      ]
    },
    {
      category: 'Social & Community',
      icon: '👥',
      color: 'from-indigo-500 to-indigo-600',
      cases: [
        {
          id: 36,
          title: 'Referral Rewards',
          description: 'Track and reward invitations to platforms via smart contracts.',
          integration: 'Implement referral tracking and reward systems.'
        },
        {
          id: 37,
          title: 'Loyalty Points System',
          description: 'Tokenize user rewards for brand engagement.',
          integration: 'Deploy loyalty token contracts.'
        },
        {
          id: 38,
          title: 'On-chain Community Voting',
          description: 'Community DAOs for event planning or funds.',
          integration: 'Create community governance platforms.'
        },
        {
          id: 39,
          title: 'Decentralized Social Media',
          description: 'Web3 apps store posts + tips on BrainArk + IPFS.',
          integration: 'Build social platforms with blockchain integration.'
        },
        {
          id: 40,
          title: 'Influencer Coin Launch',
          description: 'Tokenize personal brands.',
          integration: 'Enable staking or trading of personal tokens.'
        }
      ]
    },
    {
      category: 'Web3 Infrastructure',
      icon: '🌐',
      color: 'from-teal-500 to-teal-600',
      cases: [
        {
          id: 41,
          title: 'Public RPC Services',
          description: 'Provide developers with RPC access via Besu + NGINX.',
          integration: 'Deploy RPC infrastructure with load balancing.'
        },
        {
          id: 42,
          title: 'Blockchain Explorer',
          description: 'Deploy a BrainArk Explorer to view chain data.',
          integration: 'Build block explorer with transaction indexing.'
        },
        {
          id: 43,
          title: 'Wallet Connection Layer',
          description: 'Plug DApps into MetaMask or WalletConnect.',
          integration: 'Implement wallet integration libraries.'
        },
        {
          id: 44,
          title: 'IPFS File Anchoring',
          description: 'Store file hash on-chain, content off-chain.',
          integration: 'Deploy IPFS integration with hash storage.'
        },
        {
          id: 45,
          title: 'Meta Transactions',
          description: 'Enable gasless transactions using relayers.',
          integration: 'Implement meta-transaction relay services.'
        }
      ]
    },
    {
      category: 'Government & Specialized Sectors',
      icon: '🏛️',
      color: 'from-red-500 to-red-600',
      cases: [
        {
          id: 46,
          title: 'Medical Records',
          description: 'Patients store encrypted IPFS pointers on-chain.',
          integration: 'Deploy healthcare data management systems.'
        },
        {
          id: 47,
          title: 'Digital Land Titles',
          description: 'Tokenize land ownership, resolve disputes via contracts.',
          integration: 'Create land registry smart contracts.'
        },
        {
          id: 48,
          title: 'Event Ticketing',
          description: 'Issue tamper-proof tickets with NFT and QR code.',
          integration: 'Deploy ticketing NFTs with verification.'
        },
        {
          id: 49,
          title: 'On-Chain Wills',
          description: 'Smart contracts execute inheritance after legal trigger.',
          integration: 'Implement inheritance automation contracts.'
        },
        {
          id: 50,
          title: 'Fractional Investment Tools',
          description: 'Tokenize revenue-sharing or equity models.',
          integration: 'Deploy fractional ownership platforms.'
        }
      ]
    }
  ]

  // Get all use cases for search
  const allUseCases = useCaseCategories.flatMap(category => 
    category.cases.map(useCase => ({ ...useCase, category: category.category, icon: category.icon }))
  )

  // Filter use cases based on category and search
  const filteredUseCases = selectedCategory === 'all' 
    ? allUseCases.filter(useCase => 
        useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        useCase.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : useCaseCategories
        .find(cat => cat.category === selectedCategory)
        ?.cases.filter(useCase => 
          useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          useCase.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            🚀 50 Use Cases of BrainArk Besu Blockchain
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            BrainArk Blockchain, built on Hyperledger Besu and powered by IBFT consensus, is a modular, 
            scalable, and energy-efficient infrastructure for real-world decentralized solutions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🌟 All Categories
            </button>
            {useCaseCategories.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.category
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.icon} {category.category}
              </button>
            ))}
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(selectedCategory === 'all' ? filteredUseCases : filteredUseCases).map((useCase) => (
            <div
              key={useCase.id}
              className="card-brilliant p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="text-2xl">
                  {selectedCategory === 'all' ? useCase.icon : 
                   useCaseCategories.find(cat => cat.category === selectedCategory)?.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    #{useCase.id}. {useCase.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {useCase.description}
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Integration:</strong> {useCase.integration}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Section */}
        <div className="card-brilliant p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🤝 Partner With BrainArk
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We offer SDKs, explorer tools, and enterprise APIs to help your team integrate any use case above.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://brainark.online"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-explorer inline-flex items-center justify-center"
            >
              🔗 Website
            </a>
            <a
              href="https://t.me/Brainark_Besu_BlockChain"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-telegram inline-flex items-center justify-center"
            >
              💬 Telegram
            </a>
            <a
              href="https://x.com/sdogcoin1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-twitter inline-flex items-center justify-center"
            >
              📢 Twitter
            </a>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-bold text-white">50</div>
            <div className="text-sm text-gray-400">Use Cases</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-bold text-white">9</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-gray-400">Possibilities</div>
          </div>
          <div className="card-dark p-4 text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
        </div>
      </div>
    </div>
  )
}