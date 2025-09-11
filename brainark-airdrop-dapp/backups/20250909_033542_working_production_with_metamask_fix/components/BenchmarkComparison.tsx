import React from 'react'

export default function BenchmarkComparison() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            ⚡ BrainArk Network Benchmark
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Gas Fees & Performance Analysis vs Major Networks
          </p>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white font-bold text-lg">
            🚀 Revolutionary Cost Efficiency: 20M - 100M times cheaper than Ethereum
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Executive Summary */}
          <div className="card-brilliant p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🏆</span>
              Executive Summary
            </h2>
            <p className="text-gray-800 text-lg leading-relaxed">
              BrainArk delivers <strong className="text-orange-600">revolutionary cost efficiency</strong> with gas fees that are 
              <strong className="text-red-600"> 20 million to 100 million times cheaper</strong> than Ethereum, while maintaining 
              high throughput and instant finality through IBFT consensus.
            </p>
          </div>

          {/* Gas Fee Comparison Table */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">⛽</span>
              Gas Fee Comparison with Major Networks
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Network</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Gas Price Range</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">BAK Gas Price</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Cost vs BAK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">🧠 BrainArk (BAK)</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">1,000 wei</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">1,000 wei</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">1x (Baseline)</td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100">
                    <td className="border border-gray-300 px-4 py-3">🔷 Ethereum</td>
                    <td className="border border-gray-300 px-4 py-3">20-100 Gwei (20B - 100B wei)</td>
                    <td className="border border-gray-300 px-4 py-3">1,000 wei</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-red-600">20M - 100M times MORE</td>
                  </tr>
                  <tr className="bg-purple-50 hover:bg-purple-100">
                    <td className="border border-gray-300 px-4 py-3">🟣 Polygon</td>
                    <td className="border border-gray-300 px-4 py-3">30-200 Gwei (30B - 200B wei)</td>
                    <td className="border border-gray-300 px-4 py-3">1,000 wei</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-purple-600">30M - 200M times MORE</td>
                  </tr>
                  <tr className="bg-yellow-50 hover:bg-yellow-100">
                    <td className="border border-gray-300 px-4 py-3">🟡 BSC</td>
                    <td className="border border-gray-300 px-4 py-3">5-20 Gwei (5B - 20B wei)</td>
                    <td className="border border-gray-300 px-4 py-3">1,000 wei</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-yellow-600">5M - 20M times MORE</td>
                  </tr>
                  <tr className="bg-blue-50 hover:bg-blue-100">
                    <td className="border border-gray-300 px-4 py-3">🌟 Solana</td>
                    <td className="border border-gray-300 px-4 py-3">~5,000 lamports (≈ $0.0001)</td>
                    <td className="border border-gray-300 px-4 py-3">1,000 wei (≈ $0.00000002)</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-blue-600">5,000x MORE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TPS Comparison */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🏎️</span>
              Transaction Throughput (TPS) & Performance
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Network</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Theoretical TPS</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Practical TPS</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Block Time</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Finality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">🧠 BrainArk</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">10,500+</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">1,000+</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">2 seconds</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-800">⚡ Instant</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">🔷 Ethereum</td>
                    <td className="border border-gray-300 px-4 py-3">15</td>
                    <td className="border border-gray-300 px-4 py-3">12-15</td>
                    <td className="border border-gray-300 px-4 py-3">12 seconds</td>
                    <td className="border border-gray-300 px-4 py-3">12+ minutes</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">🟣 Polygon</td>
                    <td className="border border-gray-300 px-4 py-3">7,000</td>
                    <td className="border border-gray-300 px-4 py-3">300-500</td>
                    <td className="border border-gray-300 px-4 py-3">2 seconds</td>
                    <td className="border border-gray-300 px-4 py-3">2 seconds</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">🟡 BSC</td>
                    <td className="border border-gray-300 px-4 py-3">100</td>
                    <td className="border border-gray-300 px-4 py-3">60-80</td>
                    <td className="border border-gray-300 px-4 py-3">3 seconds</td>
                    <td className="border border-gray-300 px-4 py-3">15 seconds</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">🌟 Solana</td>
                    <td className="border border-gray-300 px-4 py-3">65,000</td>
                    <td className="border border-gray-300 px-4 py-3">2,000-4,000</td>
                    <td className="border border-gray-300 px-4 py-3">0.4 seconds</td>
                    <td className="border border-gray-300 px-4 py-3">2-3 seconds</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-World Cost Comparison */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">💰</span>
              Real-World Transaction Cost Comparison
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simple Transfer */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💸</span>
                  Simple Transfer (21,000 gas)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                    <span>🧠 BrainArk:</span>
                    <span className="text-green-600">$0.0000004</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                    <span>🔷 Ethereum:</span>
                    <span className="text-red-600">$2.10 - $10.50</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded">
                    <span>🟣 Polygon:</span>
                    <span className="text-purple-600">$0.01 - $0.07</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                    <span>🟡 BSC:</span>
                    <span className="text-yellow-600">$0.15 - $0.60</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span>🌟 Solana:</span>
                    <span className="text-blue-600">$0.0001</span>
                  </div>
                </div>
              </div>

              {/* DeFi Swap */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔄</span>
                  DeFi Swap (150,000 gas)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                    <span>🧠 BrainArk:</span>
                    <span className="text-green-600">$0.000003</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                    <span>🔷 Ethereum:</span>
                    <span className="text-red-600">$15.00 - $75.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded">
                    <span>🟣 Polygon:</span>
                    <span className="text-purple-600">$0.05 - $0.35</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                    <span>🟡 BSC:</span>
                    <span className="text-yellow-600">$0.50 - $2.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span>🌟 Solana:</span>
                    <span className="text-blue-600">$0.0001</span>
                  </div>
                </div>
              </div>

              {/* Smart Contract Deploy */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📜</span>
                  Contract Deploy (2M gas)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                    <span>🧠 BrainArk:</span>
                    <span className="text-green-600">$0.00004</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                    <span>🔷 Ethereum:</span>
                    <span className="text-red-600">$100 - $500</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded">
                    <span>🟣 Polygon:</span>
                    <span className="text-purple-600">$0.30 - $2.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                    <span>🟡 BSC:</span>
                    <span className="text-yellow-600">$3.00 - $12.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span>🌟 Solana:</span>
                    <span className="text-blue-600">$0.002</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BAK's Unique Advantages */}
          <div className="card-brilliant p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🎯</span>
              BAK's Unique Advantages
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                <h4 className="font-bold text-red-900 mb-2 flex items-center">
                  <span className="text-xl mr-2">🔥</span>
                  Ultra-Low Cost
                </h4>
                <ul className="text-red-800 text-sm space-y-1">
                  <li>• Micropayments enabled</li>
                  <li>• DeFi accessibility</li>
                  <li>• Gaming integration</li>
                  <li>• IoT scalability</li>
                  <li>• Global adoption ready</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                  <span className="text-xl mr-2">⚡</span>
                  Performance
                </h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Instant finality</li>
                  <li>• Predictable timing</li>
                  <li>• High throughput</li>
                  <li>• No congestion</li>
                  <li>• Enterprise ready</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                <h4 className="font-bold text-green-900 mb-2 flex items-center">
                  <span className="text-xl mr-2">🛡️</span>
                  Security & Reliability
                </h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• IBFT consensus</li>
                  <li>• No reorganizations</li>
                  <li>• 99.95% uptime</li>
                  <li>• EVM compatible</li>
                  <li>• Battle-tested</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Annual Savings Analysis */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">📈</span>
              Annual Cost Savings Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DeFi Protocol */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🏦 DeFi Protocol (1,000 daily transactions)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                    <span>🧠 BrainArk:</span>
                    <span className="text-green-600">$1.10/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                    <span>🔷 Ethereum:</span>
                    <span className="text-red-600">$2,737,500/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded">
                    <span>🟣 Polygon:</span>
                    <span className="text-purple-600">$18,250/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                    <span>🟡 BSC:</span>
                    <span className="text-yellow-600">$182,500/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span>🌟 Solana:</span>
                    <span className="text-blue-600">$36.50/year</span>
                  </div>
                </div>
              </div>

              {/* Gaming Platform */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎮 Gaming Platform (100,000 daily transactions)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded font-bold">
                    <span>🧠 BrainArk:</span>
                    <span className="text-green-600">$110/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                    <span>🔷 Ethereum:</span>
                    <span className="text-red-600">$273,750,000/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-100 rounded">
                    <span>🟣 Polygon:</span>
                    <span className="text-purple-600">$1,825,000/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                    <span>🟡 BSC:</span>
                    <span className="text-yellow-600">$18,250,000/year</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
                    <span>🌟 Solana:</span>
                    <span className="text-blue-600">$3,650/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revolutionary Impact */}
          <div className="card-brilliant p-8 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-400">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-3">🌟</span>
              Why BrainArk is Revolutionary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💥 Cost Revolution</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong className="text-red-600">20-100 million times cheaper</strong> than Ethereum</li>
                  <li><strong className="text-yellow-600">5-20 million times cheaper</strong> than BSC</li>
                  <li><strong className="text-purple-600">30-200 million times cheaper</strong> than Polygon</li>
                  <li><strong className="text-blue-600">250-5,000 times cheaper</strong> than Solana</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Performance Excellence</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong className="text-green-600">Instant finality</strong> (unique among major networks)</li>
                  <li><strong className="text-blue-600">1,000+ TPS</strong> practical throughput</li>
                  <li><strong className="text-purple-600">2-second blocks</strong> with predictable timing</li>
                  <li><strong className="text-orange-600">99.95% uptime</strong> enterprise reliability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="card-brilliant p-8 text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-400">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              🎯 The Numbers Don't Lie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                <div className="text-2xl font-bold text-green-600">99.995%</div>
                <div className="text-sm text-green-800">Cost Reduction vs Ethereum</div>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                <div className="text-2xl font-bold text-blue-600">Instant</div>
                <div className="text-sm text-blue-800">Transaction Finality</div>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg border border-purple-300">
                <div className="text-2xl font-bold text-purple-600">1,000+</div>
                <div className="text-sm text-purple-800">TPS Sustained</div>
              </div>
              <div className="p-4 bg-orange-100 rounded-lg border border-orange-300">
                <div className="text-2xl font-bold text-orange-600">99.95%</div>
                <div className="text-sm text-orange-800">Network Uptime</div>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 mb-6">
              BrainArk doesn't just compete with existing networks - it <strong className="text-indigo-600">revolutionizes</strong> blockchain economics by making transactions <strong className="text-red-600">millions of times cheaper</strong> while maintaining enterprise-grade performance and security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const buttons = document.querySelectorAll('button');
                  const airdropBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Airdrop'));
                  if (airdropBtn) airdropBtn.click();
                }}
                className="btn-airdrop text-lg px-8 py-4"
              >
                🎁 Join Airdrop Now
              </button>
              <button
                onClick={() => {
                  const buttons = document.querySelectorAll('button');
                  const epoBtn = Array.from(buttons).find(btn => btn.textContent?.includes('EPO'));
                  if (epoBtn) epoBtn.click();
                }}
                className="btn-epo text-lg px-8 py-4"
              >
                🦄 Participate in EPO
              </button>
            </div>
          </div>

          {/* Document Info */}
          <div className="card-brilliant p-6 text-center">
            <div className="text-gray-600 text-sm space-y-1">
              <div><strong>Last Updated:</strong> January 2025</div>
              <div><strong>Source:</strong> BrainArk Technical Documentation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}