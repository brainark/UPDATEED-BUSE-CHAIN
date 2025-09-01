import React from 'react'

export default function ComprehensiveWhitepaper() {
  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            📄 BrainArk Hyperledger Besu Blockchain: A High-Performance Layer 1 Solution
          </h1>
          <p className="text-xl text-gray-300">
            Whitepaper v1.0 - January 2025
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Abstract */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Abstract</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              BrainArk represents a revolutionary approach to blockchain technology, delivering unprecedented speed and cost efficiency through innovative consensus mechanisms and optimized network architecture. Built on Hyperledger Besu with Istanbul Byzantine Fault Tolerance (IBFT) consensus, BrainArk achieves sub-2-second block times and transaction costs that are 99.95% lower than Ethereum mainnet, making it the ideal platform for high-frequency applications, DeFi protocols, and enterprise solutions.
            </p>
          </div>

          {/* Introduction */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Introduction</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              The blockchain industry faces a fundamental trilemma: achieving scalability, security, and decentralization simultaneously. While first-generation blockchains like Bitcoin prioritized security and decentralization, they sacrificed scalability. Second-generation platforms like Ethereum improved programmability but still struggle with high fees and slow transaction times.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              BrainArk emerges as a third-generation blockchain solution that solves these challenges through:
            </p>
            <ul className="space-y-2 text-gray-700 text-lg">
              <li><strong>Ultra-fast transactions:</strong> 2-second block times with instant finality</li>
              <li><strong>Minimal costs:</strong> 1,000 wei gas price (99.95% cheaper than Ethereum)</li>
              <li><strong>Enterprise-grade security:</strong> IBFT consensus with Byzantine fault tolerance</li>
              <li><strong>Full EVM compatibility:</strong> Seamless migration of existing Ethereum applications</li>
              <li><strong>Sustainable architecture:</strong> Energy-efficient consensus mechanism</li>
            </ul>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1.1 Vision Statement</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                To create a blockchain infrastructure that enables mass adoption of decentralized applications by eliminating the barriers of high costs and slow transaction speeds, while maintaining the security and decentralization principles that make blockchain technology revolutionary.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1.2 Mission</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                BrainArk's mission is to provide developers, enterprises, and users with a blockchain platform that combines the best aspects of existing technologies while introducing innovative solutions for scalability and cost-effectiveness.
              </p>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Problem Statement</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2.1 Current Blockchain Limitations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">High Transaction Costs</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li><strong>Ethereum:</strong> $2-50 per transaction</li>
                      <li><strong>Bitcoin:</strong> $1-20 during congestion</li>
                      <li><strong>Impact:</strong> Excludes micropayments</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Slow Transaction Speeds</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li><strong>Ethereum:</strong> 15-second blocks, 15 TPS</li>
                      <li><strong>Bitcoin:</strong> 10-minute blocks, 7 TPS</li>
                      <li><strong>Impact:</strong> Poor real-time UX</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">Network Congestion</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li><strong>Peak usage:</strong> 10-100x fee spikes</li>
                      <li><strong>Unpredictable costs</strong></li>
                      <li><strong>Scalability bottleneck</strong></li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Energy Consumption</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li><strong>Bitcoin:</strong> 150 TWh annually</li>
                      <li><strong>Environmental impact</strong></li>
                      <li><strong>Sustainability concerns</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BrainArk Solution */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. BrainArk Solution</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3.1 Core Innovation: Ultra-Low Cost Architecture</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  BrainArk introduces a revolutionary cost structure that makes blockchain transactions accessible to everyone:
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <div className="text-gray-800 font-mono">
                    <div>BrainArk Gas Price: 1,000 wei (0.000000001 BAK)</div>
                    <div>Ethereum Gas Price: 20,000,000,000 wei (20 gwei)</div>
                    <div className="font-bold text-green-600">Cost Reduction: 99.995% lower than Ethereum</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Network</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Gas Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Standard Transfer Cost</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">DeFi Swap Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-green-50">
                        <td className="border border-gray-300 px-4 py-2 font-bold">BrainArk</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold">1,000 wei</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold">$0.000021</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold">$0.0001</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Ethereum</td>
                        <td className="border border-gray-300 px-4 py-2">20 gwei</td>
                        <td className="border border-gray-300 px-4 py-2">$2.10</td>
                        <td className="border border-gray-300 px-4 py-2">$15-50</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">BSC</td>
                        <td className="border border-gray-300 px-4 py-2">5 gwei</td>
                        <td className="border border-gray-300 px-4 py-2">$0.15</td>
                        <td className="border border-gray-300 px-4 py-2">$0.50</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Polygon</td>
                        <td className="border border-gray-300 px-4 py-2">30 gwei</td>
                        <td className="border border-gray-300 px-4 py-2">$0.01</td>
                        <td className="border border-gray-300 px-4 py-2">$0.05</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3.2 Speed Innovation: Sub-2-Second Finality</h3>
                <ul className="space-y-2 text-gray-700 text-lg mb-4">
                  <li><strong>Instant finality:</strong> Transactions are final upon block inclusion</li>
                  <li><strong>Predictable timing:</strong> Consistent 2-second block intervals</li>
                  <li><strong>No reorganizations:</strong> Eliminates chain reorganization risks</li>
                </ul>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-gray-800 font-mono space-y-1">
                    <div>Block Time: 2 seconds</div>
                    <div>Transaction Finality: Instant (no confirmations needed)</div>
                    <div>Theoretical TPS: 10,500+ transactions per second</div>
                    <div>Practical TPS: 1,000+ transactions per second</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Technical Architecture</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Consensus Mechanism: Istanbul Byzantine Fault Tolerance (IBFT)</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  IBFT is a practical Byzantine Fault Tolerance consensus algorithm specifically designed for blockchain networks. It provides:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Immediate finality:</strong> No need for multiple confirmations</li>
                  <li><strong>Byzantine fault tolerance:</strong> Tolerates up to 1/3 malicious validators</li>
                  <li><strong>Deterministic block production:</strong> Predictable block times</li>
                  <li><strong>Energy efficiency:</strong> No computational waste like Proof of Work</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Network Architecture</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-gray-800 font-mono space-y-1">
                    <div>Validator Node 1: Primary block producer</div>
                    <div>Validator Node 2: Secondary validator</div>
                    <div>Validator Node 3: Tertiary validator</div>
                    <div>Validator Node 4: Quaternary validator</div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div>Fault Tolerance: Can tolerate 1 Byzantine node (25% failure rate)</div>
                      <div>Minimum Consensus: 3 out of 4 nodes (75% agreement)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 Hyperledger Besu Foundation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Java-based implementation:</strong> Robust, battle-tested codebase</li>
                  <li><strong>Modular design:</strong> Pluggable consensus mechanisms</li>
                  <li><strong>Enterprise features:</strong> Privacy, permissioning, monitoring</li>
                  <li><strong>100% Ethereum compatibility:</strong> Existing contracts work without modification</li>
                  <li><strong>Developer tools:</strong> Full support for Remix, Truffle, Hardhat</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Performance Analysis</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 Transaction Throughput Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Metric</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">BrainArk</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ethereum</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">BSC</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Polygon</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">Block Time</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold text-green-600">2 seconds</td>
                        <td className="border border-gray-300 px-4 py-2">12 seconds</td>
                        <td className="border border-gray-300 px-4 py-2">3 seconds</td>
                        <td className="border border-gray-300 px-4 py-2">2 seconds</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">Finality</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold text-green-600">Instant</td>
                        <td className="border border-gray-300 px-4 py-2">12+ minutes</td>
                        <td className="border border-gray-300 px-4 py-2">15 seconds</td>
                        <td className="border border-gray-300 px-4 py-2">2 seconds</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-semibold">TPS (Practical)</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold text-green-600">1,000+</td>
                        <td className="border border-gray-300 px-4 py-2">12</td>
                        <td className="border border-gray-300 px-4 py-2">60</td>
                        <td className="border border-gray-300 px-4 py-2">300</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 Cost Savings Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Simple Transfer (21,000 gas)</h4>
                    <div className="text-green-800 text-sm space-y-1">
                      <div>BrainArk: $0.0000004</div>
                      <div>Ethereum: $1.00</div>
                      <div className="font-bold">Savings: 99.96%</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">DeFi Swap (150,000 gas)</h4>
                    <div className="text-blue-800 text-sm space-y-1">
                      <div>BrainArk: $0.000003</div>
                      <div>Ethereum: $7.50</div>
                      <div className="font-bold">Savings: 99.96%</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Contract Deploy (2M gas)</h4>
                    <div className="text-purple-800 text-sm space-y-1">
                      <div>BrainArk: $0.00004</div>
                      <div>Ethereum: $100</div>
                      <div className="font-bold">Savings: 99.96%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Model & Tokenomics */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Economic Model & Tokenomics</h2>
            
            <div className="space-y-8">
              {/* Token Specifications */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6.1 BAK Token Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div><strong>Token Name:</strong> BrainArk (BAK)</div>
                    <div><strong>Token Standard:</strong> ERC-20 Compatible</div>
                    <div><strong>Total Supply:</strong> 1,000,000,000 BAK (Fixed)</div>
                    <div><strong>Circulating at Launch:</strong> 600,000,000 BAK</div>
                    <div><strong>Decimals:</strong> 18</div>
                  </div>
                  <div className="space-y-3">
                    <div><strong>Initial Price:</strong> $0.02 USD</div>
                    <div><strong>Network:</strong> BrainArk Besu Chain</div>
                    <div><strong>Chain ID:</strong> 424242</div>
                    <div><strong>Time-Locked:</strong> 400,000,000 BAK (30 years)</div>
                    <div><strong>Annual Release:</strong> 13,333,333 BAK</div>
                  </div>
                </div>
              </div>

              {/* Token Distribution */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6.2 Token Distribution Model</h3>
                <div className="bg-gray-100 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Primary Allocation (1,000,000,000 BAK Total)</h4>
                  <div className="text-gray-800 font-mono text-sm space-y-2">
                    <div className="font-bold">Network Operations: 985,000,000 BAK (98.5%)</div>
                    <div className="ml-4">├── Validator Rewards Pool: 500,000,000 BAK (50%)</div>
                    <div className="ml-8">│   ├── Active Circulation: 100,000,000 BAK (10%)</div>
                    <div className="ml-8 text-blue-700 font-semibold">│   └── Time-Locked Reserve: 400,000,000 BAK (40%)</div>
                    <div className="ml-4">├── Development Fund: 300,000,000 BAK (30%)</div>
                    <div className="ml-4">├── Ecosystem Growth: 150,000,000 BAK (15%)</div>
                    <div className="ml-4">└── Strategic Reserve: 35,000,000 BAK (3.5%)</div>
                    <div className="mt-3 font-bold">Community Distribution: 15,000,000 BAK (1.5%)</div>
                    <div className="ml-4">├── Airdrop Program: 10,000,000 BAK (1%)</div>
                    <div className="ml-4">└── Referral Rewards: 5,000,000 BAK (0.5%)</div>
                  </div>
                </div>
              </div>

              {/* Time-Lock Mechanism */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">6.3 Validator Reward Time-Lock Mechanism</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">🔒 Long-Term Supply Control System</h4>
                    <p className="text-blue-700 mb-4">
                      <strong>Objective:</strong> Ensure long-term network stability and controlled token inflation through a sophisticated time-lock mechanism.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Time-Lock Parameters</h5>
                        <div className="space-y-2 text-sm">
                          <div><strong>Total Validator Pool:</strong> 500,000,000 BAK</div>
                          <div><strong>Immediate Circulation:</strong> 100,000,000 BAK</div>
                          <div><strong>Time-Locked Reserve:</strong> 400,000,000 BAK</div>
                          <div><strong>Lock Duration:</strong> 30 years</div>
                          <div><strong>Annual Release:</strong> 13,333,333 BAK</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">Release Schedule</h5>
                        <div className="space-y-2 text-sm">
                          <div><strong>Monthly Release:</strong> 1,111,111 BAK</div>
                          <div><strong>Daily Release:</strong> ~36,496 BAK</div>
                          <div><strong>Per Block:</strong> ~18.25 BAK (2-sec blocks)</div>
                          <div><strong>Contract Type:</strong> Immutable time-lock</div>
                          <div><strong>Release Method:</strong> Automated</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">📊 Circulation Control Benefits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-blue-800 text-sm">
                        <li><strong>✓ Predictable Inflation:</strong> Fixed 1.33% annual increase</li>
                        <li><strong>✓ Long-term Stability:</strong> 30-year network commitment</li>
                        <li><strong>✓ Validator Sustainability:</strong> Guaranteed rewards</li>
                      </ul>
                      <ul className="space-y-2 text-blue-800 text-sm">
                        <li><strong>✓ Market Confidence:</strong> Transparent release schedule</li>
                        <li><strong>✓ Deflationary Pressure:</strong> Burn mechanism counteracts inflation</li>
                        <li><strong>✓ Supply Scarcity:</strong> 40% locked for three decades</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6.4 Fee Structure & Economic Incentives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Transaction Fee Model</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Base Gas Price:</strong> 1,000 wei (0.000000001 BAK)</div>
                      <div><strong>Priority Fee:</strong> 0-500 wei (optional fast lane)</div>
                      <div><strong>Maximum Gas Price:</strong> 10,000 wei (congestion protection)</div>
                      <div><strong>Average Cost:</strong> ~$0.00001 USD (99% cheaper than Ethereum)</div>
                      <div><strong>Fee Predictability:</strong> 99.9% use base price</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">Fee Distribution</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Validator Rewards:</strong> 70% (Network security)</div>
                      <div><strong>Development Fund:</strong> 20% (Continuous improvement)</div>
                      <div><strong>Burn Mechanism:</strong> 10% (Deflationary pressure)</div>
                    </div>
                    <div className="mt-4 p-3 bg-white rounded border">
                      <div className="text-xs text-purple-700">
                        <strong>Economic Impact:</strong> Self-sustaining ecosystem growth with gradual supply reduction over time.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Circulation Dynamics */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6.5 Long-Term Supply Projection</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Year-by-Year Circulation Increase</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                    <div className="bg-white p-3 rounded text-center">
                      <div className="font-bold text-blue-600">Year 1</div>
                      <div>613.3M BAK</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="font-bold text-blue-600">Year 5</div>
                      <div>666.7M BAK</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="font-bold text-blue-600">Year 10</div>
                      <div>733.3M BAK</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="font-bold text-blue-600">Year 20</div>
                      <div>866.7M BAK</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="font-bold text-blue-600">Year 25</div>
                      <div>933.3M BAK</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center border-2 border-green-500">
                      <div className="font-bold text-green-600">Year 30</div>
                      <div>1B BAK</div>
                      <div className="text-xs text-green-600">Full Supply</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Economic Security */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-xl font-semibold text-yellow-900 mb-4">6.6 Economic Security Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-3">Value Drivers</h4>
                    <ul className="space-y-2 text-yellow-800 text-sm">
                      <li><strong>• Transaction Demand:</strong> Higher usage increases validator rewards</li>
                      <li><strong>• Staking Requirements:</strong> Validators must hold BAK for consensus</li>
                      <li><strong>• Fee Burn:</strong> Gradual supply reduction creates scarcity</li>
                      <li><strong>• Ecosystem Growth:</strong> dApps and services increase utility demand</li>
                      <li><strong>• Time-Lock Scarcity:</strong> 40% of supply locked for 30 years</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-3">Risk Mitigation</h4>
                    <ul className="space-y-2 text-yellow-800 text-sm">
                      <li><strong>• Gradual Release:</strong> Prevents supply shocks</li>
                      <li><strong>• Burn Mechanism:</strong> Counteracts inflation pressure</li>
                      <li><strong>• Validator Alignment:</strong> Long-term commitment required</li>
                      <li><strong>• Fee Stability:</strong> Predictable transaction costs</li>
                      <li><strong>• Reserve Management:</strong> Strategic fund for crisis scenarios</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Use Cases and Applications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💰 Decentralized Finance (DeFi)</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Micro-transactions enabled</li>
                  <li>• High-frequency trading</li>
                  <li>• Cost-effective yield farming</li>
                  <li>• Flash loans & arbitrage</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🎮 Gaming and NFTs</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Virtually free item transfers</li>
                  <li>• Play-to-earn without fee erosion</li>
                  <li>• Real-time gaming transactions</li>
                  <li>• NFT marketplace operations</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🏢 Enterprise Applications</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Supply chain tracking</li>
                  <li>• Authenticity verification</li>
                  <li>• Compliance reporting</li>
                  <li>• Multi-party workflows</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">💳 Micropayments</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Pay-per-article journalism</li>
                  <li>• Real-time creator rewards</li>
                  <li>• Social media tipping</li>
                  <li>• Educational content payments</li>
                </ul>
              </div>
              
              <div className="p-4 bg-teal-50 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">🌐 Internet of Things (IoT)</h4>
                <ul className="text-sm text-teal-800 space-y-1">
                  <li>• Device-to-device payments</li>
                  <li>• Sensor data monetization</li>
                  <li>• Smart city infrastructure</li>
                  <li>• Peer-to-peer energy trading</li>
                </ul>
              </div>
              
              <div className="p-4 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">🏛️ Government & Identity</h4>
                <ul className="text-sm text-pink-800 space-y-1">
                  <li>• Digital identity management</li>
                  <li>• Secure voting systems</li>
                  <li>• Medical records</li>
                  <li>• Land title registration</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-center">
                <strong>BrainArk enables 1000+ use cases across all major blockchain verticals with 99.95% cost reduction</strong>
              </p>
            </div>
          </div>

          {/* Security and Decentralization */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Security and Decentralization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8.1 Security Architecture</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Byzantine Fault Tolerance:</strong> Withstands up to 33% malicious validators</li>
                  <li><strong>Cryptographic Security:</strong> Keccak-256 hash, ECDSA signatures</li>
                  <li><strong>Network Security:</strong> TLS encryption for all communications</li>
                  <li><strong>Audit Trail:</strong> Complete transaction history</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8.2 Decentralization Roadmap</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Phase 1:</strong> 4 validators (current)</li>
                  <li><strong>Phase 2:</strong> 10 validators (Q2 2025)</li>
                  <li><strong>Phase 3:</strong> 25 validators (Q4 2025)</li>
                  <li><strong>Phase 4:</strong> 100+ validators (2026)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Roadmap and Future Development</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <strong className="text-green-900">Phase 1: Foundation (Q1 2025) ✅</strong>
                  <div className="text-green-800 text-sm mt-1">
                    IBFT consensus, 4-node validator network, EVM compatibility, block explorer, MetaMask integration
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div>
                  <strong className="text-blue-900">Phase 2: Optimization (Q2 2025)</strong>
                  <div className="text-blue-800 text-sm mt-1">
                    Performance optimization (5,000 TPS), mobile wallet integration, developer tools enhancement
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <strong className="text-yellow-900">Phase 3: Scaling (Q3-Q4 2025)</strong>
                  <div className="text-yellow-800 text-sm mt-1">
                    Validator network expansion (25 nodes), sharding implementation, Layer 2 integration
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div>
                  <strong className="text-purple-900">Phase 4: Ecosystem (2026)</strong>
                  <div className="text-purple-800 text-sm mt-1">
                    100+ validator network, advanced DeFi protocols, NFT marketplace, global adoption
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-gray-800 font-mono text-sm space-y-1">
                <div><strong>Network Configuration:</strong></div>
                <div className="ml-4">Chain ID: 424242</div>
                <div className="ml-4">Network ID: 424242</div>
                <div className="ml-4">Consensus: IBFT (Istanbul Byzantine Fault Tolerance)</div>
                <div className="ml-4">Block Time: 2 seconds</div>
                <div className="ml-4">Gas Limit: 30,000,000 per block</div>
                <div className="ml-4">Gas Price: 1,000 wei</div>
                <div className="ml-4">Validators: 4 nodes</div>
                <div className="mt-2"><strong>Performance Metrics:</strong></div>
                <div className="ml-4">TPS (Sustained): 1,000+</div>
                <div className="ml-4">TPS (Peak): 2,000+</div>
                <div className="ml-4">Finality: Instant</div>
                <div className="ml-4">Uptime: 99.95%</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card-brilliant p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Official Channels</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Website:</strong>
                    <a href="https://brainark.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      https://brainark.online
                    </a>
                  </div>
                  <div>
                    <strong>Block Explorer:</strong>
                    <a href="https://explorer.brainark.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      https://explorer.brainark.online
                    </a>
                  </div>
                  <div>
                    <strong>RPC Endpoint:</strong>
                    <span className="text-gray-600 ml-2">https://rpc.brainark.online</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Community</h3>
                <div className="space-y-2">
                  <div>
                    <strong>Twitter:</strong>
                    <a href="https://x.com/sdogcoin1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      @sdogcoin1
                    </a>
                  </div>
                  <div>
                    <strong>Telegram:</strong>
                    <a href="https://t.me/Brainark_Besu_BlockChain" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      @Brainark_Besu_BlockChain
                    </a>
                  </div>
                  <div>
                    <strong>GitHub:</strong>
                    <a href="https://github.com/brainark" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                      https://github.com/brainark
                    </a>
                  </div>
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
              Experience blockchain technology as it was meant to be - fast, affordable, and accessible to everyone
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

          {/* Document Information */}
          <div className="card-brilliant p-8 text-center">
            <div className="text-gray-600 text-sm space-y-1">
              <div><strong>Document Version:</strong> 1.0</div>
              <div><strong>Last Updated:</strong> January 2025</div>
              <div><strong>Authors:</strong> BrainArk Core Team</div>
              <div><strong>License:</strong> Creative Commons Attribution 4.0 International</div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <em>This whitepaper is a living document and will be updated as the BrainArk ecosystem evolves. For the latest version, please visit https://brainark.online/whitepaper</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}