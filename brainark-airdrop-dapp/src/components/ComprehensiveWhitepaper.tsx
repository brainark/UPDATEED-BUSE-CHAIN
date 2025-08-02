import React from 'react'

export default function ComprehensiveWhitepaper() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            📄 BrainArk Besu Blockchain White Paper
          </h1>
          <p className="text-xl text-gray-300">
            Comprehensive technical and commercial overview
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Executive Summary */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Summary</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              BrainArk is a next-generation, EVM-compatible blockchain platform built on Hyperledger Besu and powered by the IBFT consensus mechanism. Designed for modularity, scalability, and energy efficiency, BrainArk aims to bridge real-world assets, DeFi, enterprise, and Web3 infrastructure with a robust, developer-friendly ecosystem. The project features a native token (BAK), airdrop and EPO (Early Public Offering) mechanisms, and a suite of tools for rapid dApp and enterprise integration.
            </p>
          </div>

          {/* Vision */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Vision</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              To become the leading modular blockchain for real-world decentralized solutions, enabling seamless integration of finance, identity, supply chain, gaming, and enterprise applications on a secure, scalable, and eco-friendly infrastructure.
            </p>
          </div>

          {/* Technology Overview */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology Overview</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Core Blockchain</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Hyperledger Besu:</strong> Enterprise-grade, open-source Ethereum client.</li>
                  <li><strong>IBFT Consensus:</strong> Fast, final, and energy-efficient block finality.</li>
                  <li><strong>EVM Compatibility:</strong> Supports all Ethereum smart contracts and tools.</li>
                  <li><strong>Modular Design:</strong> Easily extendable for custom business logic and sector-specific modules.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Network Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Native Token (BAK):</strong> Utility and governance token for transactions, staking, and ecosystem rewards.</li>
                  <li><strong>Airdrop & EPO:</strong> Community-driven token distribution and fundraising.</li>
                  <li><strong>Multi-Asset Support:</strong> USDT, USDC, BNB, ETH, and custom tokens.</li>
                  <li><strong>DAO Governance:</strong> On-chain proposals, voting, and treasury management.</li>
                  <li><strong>Integrated Explorer:</strong> Real-time chain data and analytics.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Developer & Enterprise Tools</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>SDKs & APIs:</strong> For rapid dApp, DeFi, and enterprise integration.</li>
                  <li><strong>WalletConnect & MetaMask:</strong> Seamless wallet integration.</li>
                  <li><strong>Social Media APIs:</strong> For airdrop and community engagement.</li>
                  <li><strong>Modular Smart Contracts:</strong> For DeFi, NFTs, DAOs, and more.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tokenomics */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tokenomics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div><strong>Token Name:</strong> BrainArk (BAK)</div>
                <div><strong>Total Supply:</strong> 1,000,000,000 BAK</div>
                <div><strong>Utility:</strong> Transaction fees, staking, governance, DeFi, NFT minting, and cross-chain bridges.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Airdrop Allocation</h4>
                <p className="text-red-800">10,000,000 BAK (1%)</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="font-semibold text-teal-900 mb-2">EPO Allocation</h4>
                <p className="text-teal-800">100,000,000 BAK (10%)</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Development Fund</h4>
                <p className="text-blue-800">200,000,000 BAK (20%)</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Treasury/DAO</h4>
                <p className="text-purple-800">200,000,000 BAK (20%)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 md:col-span-2">
                <h4 className="font-semibold text-green-900 mb-2">Ecosystem/Partnerships</h4>
                <p className="text-green-800">490,000,000 BAK (49%)</p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases</h2>
            <p className="text-lg text-gray-700 mb-6">
              <strong>BrainArk supports more than 1000 use cases and 50+ real-world use cases across:</strong>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💰 Finance</h4>
                <p className="text-sm text-green-800">Stablecoins, cross-border payments, DeFi, DEX, payroll, charity, micro-lending.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🔐 Identity</h4>
                <p className="text-sm text-blue-800">Decentralized IDs, on-chain KYC, digital certificates, secure voting.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">📦 Supply Chain</h4>
                <p className="text-sm text-orange-800">Product authenticity, IoT monitoring, logistics audits.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🎮 Gaming/Metaverse</h4>
                <p className="text-sm text-purple-800">In-game NFTs, play-to-earn, virtual real estate, gaming DAOs.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🏢 Enterprise</h4>
                <p className="text-sm text-gray-800">Document timestamping, audit trails, insurance, carbon credits.</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">🎨 Education/Creative</h4>
                <p className="text-sm text-pink-800">NFT certificates, copyright, royalties, crowdfunding.</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">👥 Community</h4>
                <p className="text-sm text-indigo-800">Referral rewards, loyalty points, social DAOs, influencer coins.</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">🌐 Web3 Infra</h4>
                <p className="text-sm text-teal-800">RPC services, explorer, wallet connection, IPFS anchoring, meta-transactions.</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">🏛️ Government</h4>
                <p className="text-sm text-red-800">Medical records, land titles, event ticketing, on-chain wills, fractional investment.</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-center">
                <strong>See the "50 Use Cases" section in the dApp for complete details.</strong>
              </p>
            </div>
          </div>

          {/* Competitive Advantages */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitive Advantages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-gray-700">
                <li><strong>Enterprise-Ready:</strong> Hyperledger Besu foundation, modular architecture, and compliance features.</li>
                <li><strong>Scalable & Efficient:</strong> IBFT consensus for high throughput and low energy use.</li>
                <li><strong>Developer Ecosystem:</strong> EVM compatibility, SDKs, and open APIs.</li>
              </ul>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Community-Driven:</strong> DAO governance, transparent airdrop, and EPO.</li>
                <li><strong>Interoperability:</strong> Multi-chain and multi-asset support.</li>
                <li><strong>Security:</strong> Multi-sig wallets, on-chain KYC, and audit trails.</li>
              </ul>
            </div>
          </div>

          {/* Roadmap */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Roadmap</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <strong className="text-green-900">Q1 2025:</strong>
                  <span className="text-green-800 ml-2">Mainnet launch, airdrop, EPO, explorer, and wallet integration</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div>
                  <strong className="text-blue-900">Q2 2025:</strong>
                  <span className="text-blue-800 ml-2">DEX, CEX, DeFi suite, DAO governance, enterprise SDKs</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <strong className="text-yellow-900">Q3 2025:</strong>
                  <span className="text-yellow-800 ml-2">NFT marketplace, gaming/metaverse modules, cross-chain bridges</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div>
                  <strong className="text-purple-900">Q4 2025:</strong>
                  <span className="text-purple-800 ml-2">Enterprise partnerships, carbon credits, government pilots, global expansion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Model & Investment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-brilliant p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Model</h2>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Transaction Fees:</strong> Sustainable revenue from network usage.</li>
                <li><strong>Token Sales:</strong> EPO and ecosystem grants.</li>
                <li><strong>Enterprise Solutions:</strong> Custom modules, private chains, and support.</li>
                <li><strong>Staking & DeFi:</strong> Yield products and liquidity incentives.</li>
                <li><strong>Partnerships:</strong> Revenue sharing with dApps and service providers.</li>
              </ul>
            </div>

            <div className="card-brilliant p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Proposition</h2>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Early Access:</strong> Participate in the EPO and airdrop for early token allocation.</li>
                <li><strong>Growth Potential:</strong> Exposure to DeFi, enterprise, and Web3 sectors.</li>
                <li><strong>Ecosystem Incentives:</strong> Staking, governance, and referral rewards.</li>
                <li><strong>Transparency:</strong> Open-source code, on-chain governance, and public roadmap.</li>
                <li><strong>Scalability:</strong> Designed for mass adoption and real-world integration.</li>
              </ul>
            </div>
          </div>

          {/* Team & Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-brilliant p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Team & Partners</h2>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Core Team:</strong> Blockchain engineers, enterprise architects, and DeFi experts.</li>
                <li><strong>Advisors:</strong> Industry leaders in finance, technology, and compliance.</li>
                <li><strong>Partners:</strong> Integration with leading wallets, oracles, and infrastructure providers.</li>
              </ul>
            </div>

            <div className="card-brilliant p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Next Steps</h2>
              <div className="space-y-3">
                <div>
                  <strong>Website:</strong>
                  <a href="https://brainark.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    https://brainark.online
                  </a>
                </div>
                <div>
                  <strong>Telegram:</strong>
                  <a href="https://t.me/Brainark_Besu_BlockChain" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    @Brainark_Besu_BlockChain
                  </a>
                </div>
                <div>
                  <strong>Twitter:</strong>
                  <a href="https://x.com/sdogcoin1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    @sdogcoin1
                  </a>
                </div>
                <div>
                  <strong>Email:</strong>
                  <a href="mailto:info@brainark.online" className="text-blue-600 hover:underline ml-2">
                    info@brainark.online
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="card-brilliant p-8 text-center bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the BrainArk Revolution
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Where real-world utility meets next-gen blockchain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const buttons = document.querySelectorAll('button');
                  const airdropBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Airdrop'));
                  if (airdropBtn) airdropBtn.click();
                }}
                className="btn-airdrop"
              >
                🎁 Join Airdrop
              </button>
              <button
                onClick={() => {
                  const buttons = document.querySelectorAll('button');
                  const epoBtn = Array.from(buttons).find(btn => btn.textContent?.includes('EPO'));
                  if (epoBtn) epoBtn.click();
                }}
                className="btn-epo"
              >
                🦄 Participate in EPO
              </button>
            </div>
          </div>

          {/* Appendix */}
          <div className="card-brilliant p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appendix</h2>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Technical Documentation:</strong> Available on request.</li>
              <li><strong>Smart Contract Audits:</strong> Underway with leading security firms.</li>
              <li><strong>Open Source:</strong> Codebase available on GitHub.</li>
            </ul>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Disclaimer:</strong> This white paper is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}