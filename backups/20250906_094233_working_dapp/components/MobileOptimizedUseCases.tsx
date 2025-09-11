import React, { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

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

export default function MobileOptimizedUseCases() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Financial Systems']))
  const [isMobileView, setIsMobileView] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const useCaseCategories: UseCaseCategory[] = [
    {
      category: 'Financial Systems',
      icon: '💰',
      color: 'from-green-500 to-green-600',
      cases: [
        {
          id: 1,
          title: 'Stablecoin Issuance',
          description: 'Launch a fiat-pegged BAKUSD for stable value transactions.',
          integration: 'Deploy ERC20 contracts with mint/burn functions and price oracles.'
        },
        {
          id: 2,
          title: 'Cross-Border Payments',
          description: 'Enable instant, low-fee international transfers.',
          integration: 'Build payment gateways with multi-currency support.'
        },
        {
          id: 3,
          title: 'DeFi Lending & Borrowing',
          description: 'Create yield farming and liquidity mining protocols.',
          integration: 'Smart contracts for automated lending pools and interest calculations.'
        },
        {
          id: 4,
          title: 'Decentralized Exchange (DEX)',
          description: 'Trade BAK tokens with automated market making.',
          integration: 'AMM contracts with liquidity pools and swap interfaces.'
        }
      ]
    },
    {
      category: 'Identity & Access',
      icon: '🔐',
      color: 'from-blue-500 to-blue-600',
      cases: [
        {
          id: 5,
          title: 'Decentralized Identity (DID)',
          description: 'Self-sovereign identity management system.',
          integration: 'ERC-725 identity contracts with IPFS document storage.'
        },
        {
          id: 6,
          title: 'Access Control Systems',
          description: 'Blockchain-based authentication for applications.',
          integration: 'Role-based smart contracts with permission management.'
        },
        {
          id: 7,
          title: 'Digital Credentials',
          description: 'Issue and verify certificates on-chain.',
          integration: 'NFT-based credential system with verification APIs.'
        }
      ]
    },
    {
      category: 'Supply Chain & IoT',
      icon: '📦',
      color: 'from-purple-500 to-purple-600',
      cases: [
        {
          id: 8,
          title: 'Product Traceability',
          description: 'Track products from origin to consumer.',
          integration: 'QR codes linked to smart contract records.'
        },
        {
          id: 9,
          title: 'IoT Device Management',
          description: 'Secure communication between IoT devices.',
          integration: 'Device identity contracts with encrypted messaging.'
        },
        {
          id: 10,
          title: 'Carbon Credit Tracking',
          description: 'Monitor and trade environmental credits.',
          integration: 'Tokenized carbon credits with verification systems.'
        }
      ]
    },
    {
      category: 'Gaming & NFTs',
      icon: '🎮',
      color: 'from-pink-500 to-pink-600',
      cases: [
        {
          id: 11,
          title: 'NFT Marketplace',
          description: 'Trade unique digital assets and collectibles.',
          integration: 'ERC-721/1155 contracts with marketplace interfaces.'
        },
        {
          id: 12,
          title: 'Play-to-Earn Gaming',
          description: 'Reward players with BAK tokens for achievements.',
          integration: 'Game logic contracts with token reward mechanisms.'
        },
        {
          id: 13,
          title: 'Virtual Land Ownership',
          description: 'Buy, sell, and develop virtual real estate.',
          integration: 'NFT land parcels with development smart contracts.'
        }
      ]
    },
    {
      category: 'Governance & DAOs',
      icon: '🏛️',
      color: 'from-orange-500 to-orange-600',
      cases: [
        {
          id: 14,
          title: 'DAO Governance',
          description: 'Decentralized decision making for organizations.',
          integration: 'Governance tokens with proposal and voting systems.'
        },
        {
          id: 15,
          title: 'Transparent Voting',
          description: 'Secure, verifiable election systems.',
          integration: 'Anonymous voting contracts with public verification.'
        },
        {
          id: 16,
          title: 'Community Treasury',
          description: 'Manage shared funds through collective decisions.',
          integration: 'Multi-signature treasury with spending proposals.'
        }
      ]
    }
  ]

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredCategories = useCaseCategories.map(category => ({
    ...category,
    cases: category.cases.filter(useCase =>
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    selectedCategory === 'all' || 
    category.category === selectedCategory ||
    category.cases.length > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Mobile-First Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            🚀 BrainArk Use Cases
          </h1>
          <p className="text-gray-400 text-center mt-1 text-sm md:text-base">
            Real-world blockchain applications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar - Mobile Optimized */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         touch-manipulation text-base" // text-base prevents zoom on iOS
            />
          </div>
        </div>

        {/* Category Filter Pills - Mobile Scrollable */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                         touch-manipulation ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({useCaseCategories.reduce((sum, cat) => sum + cat.cases.length, 0)})
            </button>
            {useCaseCategories.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                           touch-manipulation ${
                  selectedCategory === category.category
                    ? `bg-gradient-to-r ${category.color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.icon} {category.category} ({category.cases.length})
              </button>
            ))}
          </div>
        </div>

        {/* Use Cases - Collapsible Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.category} className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.category)}
                className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${category.color} 
                           hover:opacity-90 transition-opacity touch-manipulation`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">{category.category}</h3>
                    <p className="text-white/80 text-sm">{category.cases.length} use cases</p>
                  </div>
                </div>
                {expandedCategories.has(category.category) ? (
                  <ChevronDownIcon className="h-5 w-5 text-white" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-white" />
                )}
              </button>

              {/* Category Content */}
              {expandedCategories.has(category.category) && (
                <div className="divide-y divide-gray-700/50">
                  {category.cases.map((useCase) => (
                    <div key={useCase.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {useCase.title}
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {useCase.description}
                          </p>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-blue-500">
                          <h5 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
                            Technical Implementation
                          </h5>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {useCase.integration}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {useCaseCategories.reduce((sum, cat) => sum + cat.cases.length, 0)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Use Cases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {useCaseCategories.length}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                100%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Open Source</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                24/7
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Network Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}