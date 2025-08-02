import React, { useState } from 'react';

const WhitepaperComponent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = {
    overview: 'Project Overview',
    technology: 'Technology Stack',
    tokenomics: 'Tokenomics',
    airdrop: 'Airdrop Program',
    epo: 'Early Public Offering',
    roadmap: 'Roadmap',
    team: 'Team & Governance'
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="whitepaper-section">
            <h2>🚀 BrainArk Project Overview</h2>
            <div className="content">
              <h3>Vision</h3>
              <p>
                BrainArk aims to create a decentralized blockchain ecosystem that empowers users 
                through innovative DeFi solutions, transparent governance, and community-driven development. 
                Our mission is to bridge the gap between traditional finance and decentralized technologies.
              </p>

              <h3>Core Objectives</h3>
              <ul>
                <li>Build a scalable and secure blockchain infrastructure using Hyperledger Besu</li>
                <li>Create a fair and transparent token distribution mechanism</li>
                <li>Develop user-friendly DeFi applications and tools</li>
                <li>Foster a strong community through incentivized participation</li>
                <li>Establish sustainable tokenomics for long-term growth</li>
              </ul>

              <h3>Key Features</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <h4>🎁 Community Airdrop</h4>
                  <p>Fair distribution of 10M BAK tokens to 1 million participants</p>
                </div>
                <div className="feature-item">
                  <h4>💰 Early Public Offering</h4>
                  <p>Fixed-price token sale to create initial liquidity</p>
                </div>
                <div className="feature-item">
                  <h4>🔍 Blockchain Explorer</h4>
                  <p>Comprehensive tools for network transparency</p>
                </div>
                <div className="feature-item">
                  <h4>🤝 Referral System</h4>
                  <p>Incentivized growth through community referrals</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'technology':
        return (
          <div className="whitepaper-section">
            <h2>⚙️ Technology Stack</h2>
            <div className="content">
              <h3>Blockchain Infrastructure</h3>
              <p>
                BrainArk is built on Hyperledger Besu, an enterprise-grade Ethereum client 
                that provides enhanced security, scalability, and privacy features.
              </p>

              <h3>Technical Specifications</h3>
              <div className="tech-specs">
                <div className="spec-item">
                  <strong>Consensus Mechanism:</strong> Proof of Authority (PoA)
                </div>
                <div className="spec-item">
                  <strong>Block Time:</strong> ~15 seconds
                </div>
                <div className="spec-item">
                  <strong>Network ID: 424242
                </div>
                <div className="spec-item">
                  <strong>Virtual Machine:</strong> Ethereum Virtual Machine (EVM)
                </div>
                <div className="spec-item">
                  <strong>Smart Contract Language:</strong> Solidity
                </div>
              </div>

              <h3>Architecture Components</h3>
              <ul>
                <li><strong>Validator Nodes:</strong> Secure network validation using PoA consensus</li>
                <li><strong>RPC Endpoints:</strong> JSON-RPC API for DApp integration</li>
                <li><strong>Block Explorer:</strong> Real-time network monitoring and analytics</li>
                <li><strong>Smart Contracts:</strong> Automated airdrop and EPO mechanisms</li>
                <li><strong>Web3 Integration:</strong> MetaMask and wallet connectivity</li>
              </ul>

              <h3>Security Features</h3>
              <ul>
                <li>Multi-signature wallet support</li>
                <li>Smart contract auditing and verification</li>
                <li>Permissioned validator network</li>
                <li>Regular security assessments</li>
              </ul>
            </div>
          </div>
        );

      case 'tokenomics':
        return (
          <div className="whitepaper-section">
            <h2>💎 Tokenomics</h2>
            <div className="content">
              <h3>BAK Token Overview</h3>
              <p>
                BAK is the native utility token of the BrainArk ecosystem, designed to facilitate 
                transactions, governance, and incentivize network participation.
              </p>

              <h3>Token Distribution</h3>
              <div className="tokenomics-chart">
                <div className="distribution-item">
                  <div className="percentage">66.7%</div>
                  <div className="details">
                    <strong>Community Airdrop</strong>
                    <p>10M BAK tokens for 1M participants</p>
                  </div>
                </div>
                <div className="distribution-item">
                  <div className="percentage">33.3%</div>
                  <div className="details">
                    <strong>Referral Rewards</strong>
                    <p>5M BAK tokens for referral bonuses</p>
                  </div>
                </div>
              </div>

              <h3>Token Utility</h3>
              <ul>
                <li><strong>Transaction Fees:</strong> Pay for network transactions</li>
                <li><strong>Governance:</strong> Vote on protocol upgrades and proposals</li>
                <li><strong>Staking:</strong> Earn rewards by securing the network</li>
                <li><strong>DeFi:</strong> Participate in lending, borrowing, and yield farming</li>
                <li><strong>Ecosystem Access:</strong> Access premium features and services</li>
              </ul>

              <h3>Economic Model</h3>
              <div className="economic-model">
                <div className="model-item">
                  <h4>Deflationary Mechanism</h4>
                  <p>Transaction fees are burned to reduce total supply over time</p>
                </div>
                <div className="model-item">
                  <h4>Staking Rewards</h4>
                  <p>Validators and delegators earn BAK for securing the network</p>
                </div>
                <div className="model-item">
                  <h4>Liquidity Incentives</h4>
                  <p>Rewards for providing liquidity to DEX pools</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'airdrop':
        return (
          <div className="whitepaper-section">
            <h2>🎁 Airdrop Program</h2>
            <div className="content">
              <h3>Program Overview</h3>
              <p>
                The BrainArk Airdrop Program is designed to fairly distribute BAK tokens to 
                community members while building a strong, engaged user base.
              </p>

              <h3>Airdrop Mechanics</h3>
              <div className="airdrop-mechanics">
                <div className="mechanic-item">
                  <h4>📊 Total Allocation</h4>
                  <p>10 million BAK tokens reserved for airdrop participants</p>
                </div>
                <div className="mechanic-item">
                  <h4>👥 Target Participants</h4>
                  <p>1 million participants to ensure wide distribution</p>
                </div>
                <div className="mechanic-item">
                  <h4>💰 Base Allocation</h4>
                  <p>10 BAK tokens per participant (10M ÷ 1M)</p>
                </div>
                <div className="mechanic-item">
                  <h4>🤝 Referral Bonus</h4>
                  <p>30% bonus for each successful referral</p>
                </div>
              </div>

              <h3>Participation Requirements</h3>
              <ul>
                <li>Connect EVM-compatible wallet to BrainArk network</li>
                <li>Follow BrainArk social media accounts (Telegram & Twitter)</li>
                <li>Complete social engagement tasks</li>
                <li>Optionally use referral code for bonus rewards</li>
              </ul>

              <h3>Distribution Timeline</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <strong>Phase 1:</strong> Airdrop registration opens
                </div>
                <div className="timeline-item">
                  <strong>Phase 2:</strong> Community building and referrals
                </div>
                <div className="timeline-item">
                  <strong>Phase 3:</strong> Automatic distribution upon reaching 1M participants
                </div>
                <div className="timeline-item">
                  <strong>Phase 4:</strong> Token distribution completed within 24 hours
                </div>
              </div>

              <h3>Referral Program Details</h3>
              <p>
                Participants can earn additional BAK tokens by referring new users. 
                For each successful referral, the referrer receives a 30% bonus based 
                on their base allocation.
              </p>
              <div className="referral-example">
                <h4>Example Calculation:</h4>
                <p>Base allocation: 10 BAK</p>
                <p>Successful referrals: 5 users</p>
                <p>Bonus: 10 × 0.30 × 5 = 15 BAK</p>
                <p><strong>Total: 25 BAK tokens</strong></p>
              </div>
            </div>
          </div>
        );

      case 'epo':
        return (
          <div className="whitepaper-section">
            <h2>💰 Early Public Offering (EPO)</h2>
            <div className="content">
              <h3>EPO Overview</h3>
              <p>
                The Early Public Offering allows early supporters to purchase BAK tokens 
                at a fixed price to help bootstrap liquidity and fund ecosystem development.
              </p>

              <h3>EPO Details</h3>
              <div className="epo-details">
                <div className="detail-item">
                  <h4>💵 Token Price</h4>
                  <p>$0.02 USD per BAK token</p>
                </div>
                <div className="detail-item">
                  <h4>🎯 Total Supply</h4>
                  <p>5 million BAK tokens available</p>
                </div>
                <div className="detail-item">
                  <h4>💳 Payment Methods</h4>
                  <p>USDT, USDC, BNB, ETH</p>
                </div>
                <div className="detail-item">
                  <h4>🌐 Network</h4>
                  <p>BrainArk Besu Network</p>
                </div>
              </div>

              <h3>Use of Funds</h3>
              <div className="funds-allocation">
                <div className="allocation-item">
                  <div className="percentage">40%</div>
                  <div className="description">
                    <strong>Development</strong>
                    <p>Smart contract development, DApp features, security audits</p>
                  </div>
                </div>
                <div className="allocation-item">
                  <div className="percentage">30%</div>
                  <div className="description">
                    <strong>Liquidity</strong>
                    <p>DEX liquidity pools, market making, trading support</p>
                  </div>
                </div>
                <div className="allocation-item">
                  <div className="percentage">20%</div>
                  <div className="description">
                    <strong>Marketing</strong>
                    <p>Community growth, partnerships, ecosystem expansion</p>
                  </div>
                </div>
                <div className="allocation-item">
                  <div className="percentage">10%</div>
                  <div className="description">
                    <strong>Operations</strong>
                    <p>Infrastructure, legal, administrative costs</p>
                  </div>
                </div>
              </div>

              <h3>Benefits for EPO Participants</h3>
              <ul>
                <li>Fixed price guarantee at $0.02 per BAK</li>
                <li>Early access before public trading</li>
                <li>Support ecosystem development</li>
                <li>Potential for value appreciation</li>
                <li>Priority access to future features</li>
              </ul>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="whitepaper-section">
            <h2>🗺️ Development Roadmap</h2>
            <div className="content">
              <div className="roadmap">
                <div className="roadmap-phase">
                  <h3>Q1 2024 - Foundation</h3>
                  <ul>
                    <li>✅ BrainArk Besu network deployment</li>
                    <li>✅ Block explorer development</li>
                    <li>✅ Airdrop DApp launch</li>
                    <li>✅ EPO smart contract deployment</li>
                    <li>🔄 Community building and social media presence</li>
                  </ul>
                </div>

                <div className="roadmap-phase">
                  <h3>Q2 2024 - Growth</h3>
                  <ul>
                    <li>🔄 Airdrop program execution</li>
                    <li>📅 DEX integration and liquidity pools</li>
                    <li>📅 Mobile wallet support</li>
                    <li>📅 Partnership announcements</li>
                    <li>📅 Security audit completion</li>
                  </ul>
                </div>

                <div className="roadmap-phase">
                  <h3>Q3 2024 - Expansion</h3>
                  <ul>
                    <li>📅 DeFi protocol launch (lending/borrowing)</li>
                    <li>📅 Governance token functionality</li>
                    <li>📅 Cross-chain bridge development</li>
                    <li>📅 NFT marketplace integration</li>
                    <li>📅 Staking rewards program</li>
                  </ul>
                </div>

                <div className="roadmap-phase">
                  <h3>Q4 2024 - Maturity</h3>
                  <ul>
                    <li>📅 DAO governance implementation</li>
                    <li>📅 Enterprise partnerships</li>
                    <li>📅 Layer 2 scaling solutions</li>
                    <li>📅 Advanced analytics dashboard</li>
                    <li>📅 Ecosystem fund establishment</li>
                  </ul>
                </div>
              </div>

              <div className="legend">
                <div className="legend-item">
                  <span className="status completed">✅</span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="status in-progress">🔄</span>
                  <span>In Progress</span>
                </div>
                <div className="legend-item">
                  <span className="status planned">📅</span>
                  <span>Planned</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="whitepaper-section">
            <h2>👥 Team & Governance</h2>
            <div className="content">
              <h3>Core Team</h3>
              <p>
                The BrainArk team consists of experienced blockchain developers, 
                DeFi specialists, and community managers dedicated to building 
                a sustainable and innovative ecosystem.
              </p>

              <h3>Governance Model</h3>
              <div className="governance-model">
                <div className="governance-phase">
                  <h4>Phase 1: Foundation Governance</h4>
                  <p>
                    Initial development and deployment managed by the core team 
                    to ensure rapid progress and technical excellence.
                  </p>
                </div>
                <div className="governance-phase">
                  <h4>Phase 2: Community Governance</h4>
                  <p>
                    Gradual transition to community-driven governance with 
                    BAK token holders voting on key protocol decisions.
                  </p>
                </div>
                <div className="governance-phase">
                  <h4>Phase 3: Full DAO</h4>
                  <p>
                    Complete decentralization with autonomous governance 
                    mechanisms and community-elected representatives.
                  </p>
                </div>
              </div>

              <h3>Advisory Board</h3>
              <p>
                Strategic advisors from blockchain, finance, and technology 
                sectors provide guidance on ecosystem development and growth.
              </p>

              <h3>Community Involvement</h3>
              <ul>
                <li>Regular community calls and updates</li>
                <li>Open-source development contributions</li>
                <li>Bug bounty and security programs</li>
                <li>Ambassador and moderator programs</li>
                <li>Developer grants and hackathons</li>
              </ul>

              <h3>Contact Information</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>Telegram:</strong>
                  <a href="https://t.me/Brainark_Besu_BlockChain" target="_blank" rel="noopener noreferrer">
                    @Brainark_Besu_BlockChain
                  </a>
                </div>
                <div className="contact-item">
                  <strong>Twitter:</strong>
                  <a href="https://x.com/sdogcoin1?s=21" target="_blank" rel="noopener noreferrer">
                    @sdogcoin1
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="whitepaper-container">
      <div className="whitepaper-header">
        <h1>📄 BrainArk Whitepaper</h1>
        <p>Comprehensive documentation of the BrainArk ecosystem</p>
      </div>

      <div className="whitepaper-content">
        <nav className="whitepaper-nav">
          <h3>Table of Contents</h3>
          <ul>
            {Object.entries(sections).map(([key, title]) => (
              <li key={key}>
                <button
                  className={`nav-link ${activeSection === key ? 'active' : ''}`}
                  onClick={() => setActiveSection(key)}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="whitepaper-main">
          {renderContent()}
        </div>
      </div>

      <div className="whitepaper-footer">
        <div className="download-section">
          <h3>Download Whitepaper</h3>
          <p>Get the complete BrainArk whitepaper in PDF format</p>
          <button className="download-btn">
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperComponent;