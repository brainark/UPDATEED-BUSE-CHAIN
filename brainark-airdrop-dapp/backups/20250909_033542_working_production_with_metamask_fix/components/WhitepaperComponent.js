import React, { useState } from 'react';

const WhitepaperComponent = () => {
  const [activeSection, setActiveSection] = useState('overview');

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
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '🚀 BrainArk Project Overview'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'Vision'),
            React.createElement('p', null, 
              'BrainArk aims to create a decentralized blockchain ecosystem that empowers users through innovative DeFi solutions, transparent governance, and community-driven development. Our mission is to bridge the gap between traditional finance and decentralized technologies.'
            ),

            React.createElement('h3', null, 'Core Objectives'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Build a scalable and secure blockchain infrastructure using Hyperledger Besu'),
              React.createElement('li', null, 'Create a fair and transparent token distribution mechanism'),
              React.createElement('li', null, 'Develop user-friendly DeFi applications and tools'),
              React.createElement('li', null, 'Foster a strong community through incentivized participation'),
              React.createElement('li', null, 'Establish sustainable tokenomics for long-term growth')
            ),

            React.createElement('h3', null, 'Key Features'),
            React.createElement('div', { className: 'feature-grid' },
              React.createElement('div', { className: 'feature-item' },
                React.createElement('h4', null, '🎁 Community Airdrop'),
                React.createElement('p', null, 'Fair distribution of 10M BAK tokens to 1 million participants')
              ),
              React.createElement('div', { className: 'feature-item' },
                React.createElement('h4', null, '💰 Early Public Offering'),
                React.createElement('p', null, 'Fixed-price token sale to create initial liquidity')
              ),
              React.createElement('div', { className: 'feature-item' },
                React.createElement('h4', null, '🔍 Blockchain Explorer'),
                React.createElement('p', null, 'Comprehensive tools for network transparency')
              ),
              React.createElement('div', { className: 'feature-item' },
                React.createElement('h4', null, '🤝 Referral System'),
                React.createElement('p', null, 'Incentivized growth through community referrals')
              )
            )
          )
        );

      case 'technology':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '⚙️ Technology Stack'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'Blockchain Infrastructure'),
            React.createElement('p', null, 
              'BrainArk is built on Hyperledger Besu, an enterprise-grade Ethereum client that provides enhanced security, scalability, and privacy features.'
            ),

            React.createElement('h3', null, 'Technical Specifications'),
            React.createElement('div', { className: 'tech-specs' },
              React.createElement('div', { className: 'spec-item' },
                React.createElement('strong', null, 'Consensus Mechanism:'),
                ' Proof of Authority (PoA)'
              ),
              React.createElement('div', { className: 'spec-item' },
                React.createElement('strong', null, 'Block Time:'),
                ' ~15 seconds'
              ),
              React.createElement('div', { className: 'spec-item' },
                React.createElement('strong', null, 'Network ID:'),
                ' 1337'
              ),
              React.createElement('div', { className: 'spec-item' },
                React.createElement('strong', null, 'Virtual Machine:'),
                ' Ethereum Virtual Machine (EVM)'
              ),
              React.createElement('div', { className: 'spec-item' },
                React.createElement('strong', null, 'Smart Contract Language:'),
                ' Solidity'
              )
            ),

            React.createElement('h3', null, 'Architecture Components'),
            React.createElement('ul', null,
              React.createElement('li', null, React.createElement('strong', null, 'Validator Nodes:'), ' Secure network validation using PoA consensus'),
              React.createElement('li', null, React.createElement('strong', null, 'RPC Endpoints:'), ' JSON-RPC API for DApp integration'),
              React.createElement('li', null, React.createElement('strong', null, 'Block Explorer:'), ' Real-time network monitoring and analytics'),
              React.createElement('li', null, React.createElement('strong', null, 'Smart Contracts:'), ' Automated airdrop and EPO mechanisms'),
              React.createElement('li', null, React.createElement('strong', null, 'Web3 Integration:'), ' MetaMask and wallet connectivity')
            ),

            React.createElement('h3', null, 'Security Features'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Multi-signature wallet support'),
              React.createElement('li', null, 'Smart contract auditing and verification'),
              React.createElement('li', null, 'Permissioned validator network'),
              React.createElement('li', null, 'Regular security assessments')
            )
          )
        );

      case 'tokenomics':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '💎 Tokenomics'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'BAK Token Overview'),
            React.createElement('p', null, 
              'BAK is the native utility token of the BrainArk ecosystem, designed to facilitate transactions, governance, and incentivize network participation.'
            ),

            React.createElement('h3', null, 'Token Distribution'),
            React.createElement('div', { className: 'tokenomics-chart' },
              React.createElement('div', { className: 'distribution-item' },
                React.createElement('div', { className: 'percentage' }, '66.7%'),
                React.createElement('div', { className: 'details' },
                  React.createElement('strong', null, 'Community Airdrop'),
                  React.createElement('p', null, '10M BAK tokens for 1M participants')
                )
              ),
              React.createElement('div', { className: 'distribution-item' },
                React.createElement('div', { className: 'percentage' }, '33.3%'),
                React.createElement('div', { className: 'details' },
                  React.createElement('strong', null, 'Referral Rewards'),
                  React.createElement('p', null, '5M BAK tokens for referral bonuses')
                )
              )
            ),

            React.createElement('h3', null, 'Token Utility'),
            React.createElement('ul', null,
              React.createElement('li', null, React.createElement('strong', null, 'Transaction Fees:'), ' Pay for network transactions'),
              React.createElement('li', null, React.createElement('strong', null, 'Governance:'), ' Vote on protocol upgrades and proposals'),
              React.createElement('li', null, React.createElement('strong', null, 'Staking:'), ' Earn rewards by securing the network'),
              React.createElement('li', null, React.createElement('strong', null, 'DeFi:'), ' Participate in lending, borrowing, and yield farming'),
              React.createElement('li', null, React.createElement('strong', null, 'Ecosystem Access:'), ' Access premium features and services')
            )
          )
        );

      case 'airdrop':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '🎁 Airdrop Program'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'Program Overview'),
            React.createElement('p', null, 
              'The BrainArk Airdrop Program is designed to fairly distribute BAK tokens to community members while building a strong, engaged user base.'
            ),

            React.createElement('h3', null, 'Airdrop Mechanics'),
            React.createElement('div', { className: 'airdrop-mechanics' },
              React.createElement('div', { className: 'mechanic-item' },
                React.createElement('h4', null, '📊 Total Allocation'),
                React.createElement('p', null, '10 million BAK tokens reserved for airdrop participants')
              ),
              React.createElement('div', { className: 'mechanic-item' },
                React.createElement('h4', null, '👥 Target Participants'),
                React.createElement('p', null, '1 million participants to ensure wide distribution')
              ),
              React.createElement('div', { className: 'mechanic-item' },
                React.createElement('h4', null, '💰 Base Allocation'),
                React.createElement('p', null, '10 BAK tokens per participant (10M ÷ 1M)')
              ),
              React.createElement('div', { className: 'mechanic-item' },
                React.createElement('h4', null, '🤝 Referral Bonus'),
                React.createElement('p', null, '30% bonus for each successful referral')
              )
            ),

            React.createElement('h3', null, 'Participation Requirements'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Connect EVM-compatible wallet to BrainArk network'),
              React.createElement('li', null, 'Follow BrainArk social media accounts (Telegram & Twitter)'),
              React.createElement('li', null, 'Complete social engagement tasks'),
              React.createElement('li', null, 'Optionally use referral code for bonus rewards')
            )
          )
        );

      case 'epo':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '💰 Early Public Offering (EPO)'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'EPO Overview'),
            React.createElement('p', null, 
              'The Early Public Offering allows early supporters to purchase BAK tokens at a fixed price to help bootstrap liquidity and fund ecosystem development.'
            ),

            React.createElement('h3', null, 'EPO Details'),
            React.createElement('div', { className: 'epo-details' },
              React.createElement('div', { className: 'detail-item' },
                React.createElement('h4', null, '💵 Token Price'),
                React.createElement('p', null, '$0.02 USD per BAK token')
              ),
              React.createElement('div', { className: 'detail-item' },
                React.createElement('h4', null, '🎯 Total Supply'),
                React.createElement('p', null, '5 million BAK tokens available')
              ),
              React.createElement('div', { className: 'detail-item' },
                React.createElement('h4', null, '💳 Payment Methods'),
                React.createElement('p', null, 'USDT, USDC, BNB, ETH')
              ),
              React.createElement('div', { className: 'detail-item' },
                React.createElement('h4', null, '🌐 Network'),
                React.createElement('p', null, 'BrainArk Besu Network')
              )
            )
          )
        );

      case 'roadmap':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '🗺️ Development Roadmap'),
          React.createElement('div', { className: 'content' },
            React.createElement('div', { className: 'roadmap' },
              React.createElement('div', { className: 'roadmap-phase' },
                React.createElement('h3', null, 'Q1 2024 - Foundation'),
                React.createElement('ul', null,
                  React.createElement('li', null, '✅ BrainArk Besu network deployment'),
                  React.createElement('li', null, '✅ Block explorer development'),
                  React.createElement('li', null, '✅ Airdrop DApp launch'),
                  React.createElement('li', null, '✅ EPO smart contract deployment'),
                  React.createElement('li', null, '🔄 Community building and social media presence')
                )
              ),

              React.createElement('div', { className: 'roadmap-phase' },
                React.createElement('h3', null, 'Q2 2024 - Growth'),
                React.createElement('ul', null,
                  React.createElement('li', null, '🔄 Airdrop program execution'),
                  React.createElement('li', null, '��� DEX integration and liquidity pools'),
                  React.createElement('li', null, '📅 Mobile wallet support'),
                  React.createElement('li', null, '📅 Partnership announcements'),
                  React.createElement('li', null, '📅 Security audit completion')
                )
              )
            )
          )
        );

      case 'team':
        return React.createElement('div', { className: 'whitepaper-section' },
          React.createElement('h2', null, '👥 Team & Governance'),
          React.createElement('div', { className: 'content' },
            React.createElement('h3', null, 'Core Team'),
            React.createElement('p', null, 
              'The BrainArk team consists of experienced blockchain developers, DeFi specialists, and community managers dedicated to building a sustainable and innovative ecosystem.'
            ),

            React.createElement('h3', null, 'Contact Information'),
            React.createElement('div', { className: 'contact-info' },
              React.createElement('div', { className: 'contact-item' },
                React.createElement('strong', null, 'Telegram:'),
                React.createElement('a', { 
                  href: 'https://t.me/Brainark_Besu_BlockChain', 
                  target: '_blank', 
                  rel: 'noopener noreferrer' 
                }, '@Brainark_Besu_BlockChain')
              ),
              React.createElement('div', { className: 'contact-item' },
                React.createElement('strong', null, 'Twitter:'),
                React.createElement('a', { 
                  href: 'https://x.com/sdogcoin1?s=21', 
                  target: '_blank', 
                  rel: 'noopener noreferrer' 
                }, '@sdogcoin1')
              )
            )
          )
        );

      default:
        return null;
    }
  };

  return React.createElement('div', { className: 'whitepaper-container' },
    React.createElement('div', { className: 'whitepaper-header' },
      React.createElement('h1', null, '📄 BrainArk Whitepaper'),
      React.createElement('p', null, 'Comprehensive documentation of the BrainArk ecosystem')
    ),

    React.createElement('div', { className: 'whitepaper-content' },
      React.createElement('nav', { className: 'whitepaper-nav' },
        React.createElement('h3', null, 'Table of Contents'),
        React.createElement('ul', null,
          Object.entries(sections).map(([key, title]) =>
            React.createElement('li', { key: key },
              React.createElement('button', {
                className: `nav-link ${activeSection === key ? 'active' : ''}`,
                onClick: () => setActiveSection(key)
              }, title)
            )
          )
        )
      ),

      React.createElement('div', { className: 'whitepaper-main' },
        renderContent()
      )
    ),

    React.createElement('div', { className: 'whitepaper-footer' },
      React.createElement('div', { className: 'download-section' },
        React.createElement('h3', null, 'Download Whitepaper'),
        React.createElement('p', null, 'Get the complete BrainArk whitepaper in PDF format'),
        React.createElement('button', { className: 'download-btn' }, '📥 Download PDF')
      )
    )
  );
};

export default WhitepaperComponent;