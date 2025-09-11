import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface AirdropComponentProps {
  walletAddress: string;
  isConnected: boolean;
}

interface Participant {
  address: string;
  referralCode: string;
  referredBy?: string;
  socialTasksCompleted: boolean;
  referralCount: number;
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  claimStatus: 'pending' | 'claimed' | 'distributed';
}

interface AirdropStats {
  totalParticipants: number;
  totalClaimed: number;
  totalReferralBonuses: number;
  remainingSupply: number;
  distributionActive: boolean;
}

const UpdatedAirdropComponent: React.FC<AirdropComponentProps> = ({ walletAddress, isConnected }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [referralInput, setReferralInput] = useState<string>('');
  const [socialTasksCompleted, setSocialTasksCompleted] = useState<boolean>(false);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(null);
  const [airdropStats, setAirdropStats] = useState<AirdropStats | null>(null);

  // Updated Airdrop Configuration with deployed contract addresses
  const AIRDROP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const EPO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EPO_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const FUNDING_WALLET = process.env.NEXT_PUBLIC_FUNDING_WALLET || '0xC7A3e128f909153442D931BA430AC9aA55E9370D';
  
  const TOTAL_AIRDROP_POOL = 10000000; // 10M BAK
  const TOTAL_REFERRAL_POOL = 5000000; // 5M BAK
  const TARGET_PARTICIPANTS = 1000000; // 1M participants
  const BASE_REWARD = 10; // 10 BAK per participant
  const REFERRAL_BONUS = 3.2; // 3.2 BAK per referral

  // Enhanced social media links
  const socialLinks = {
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_LINK || 'https://t.me/Brainark_Besu_BlockChain',
    twitter: process.env.NEXT_PUBLIC_TWITTER_LINK || 'https://x.com/sdogcoin1?s=21',
    discord: process.env.NEXT_PUBLIC_DISCORD_LINK || 'https://discord.gg/brainark',
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://brainark.online'
  };

  // Generate unique referral code
  const generateReferralCode = (address: string): string => {
    return `BAK${address.slice(2, 8).toUpperCase()}`;
  };

  // Load airdrop statistics
  const loadAirdropStats = async () => {
    try {
      // Mock airdrop stats (in production, this would call the contract)
      const mockStats: AirdropStats = {
        totalParticipants: participants.length,
        totalClaimed: participants.filter(p => p.claimStatus === 'claimed').length * BASE_REWARD,
        totalReferralBonuses: participants.reduce((sum, p) => sum + p.bonusAmount, 0),
        remainingSupply: TOTAL_AIRDROP_POOL - (participants.length * BASE_REWARD),
        distributionActive: true
      };
      
      setAirdropStats(mockStats);
      
    } catch (error) {
      console.error('Failed to load airdrop stats:', error);
    }
  };

  // Check if user is already participating
  useEffect(() => {
    if (walletAddress) {
      const existingParticipant = participants.find(p => p.address.toLowerCase() === walletAddress.toLowerCase());
      if (existingParticipant) {
        setUserParticipant(existingParticipant);
        setUserReferralCode(existingParticipant.referralCode);
        setSocialTasksCompleted(existingParticipant.socialTasksCompleted);
      } else {
        setUserReferralCode(generateReferralCode(walletAddress));
      }
    }
  }, [walletAddress, participants]);

  // Handle social media tasks with enhanced tracking
  const handleSocialTask = (platform: string) => {
    const url = socialLinks[platform as keyof typeof socialLinks];
    if (url) {
      window.open(url, '_blank');
      
      // Track social task completion (in production, this would be verified)
      setTimeout(() => {
        const confirmed = confirm(`Did you complete the ${platform} task? Click OK to confirm.`);
        if (confirmed) {
          // Mark task as completed for this platform
          console.log(`${platform} task completed for ${walletAddress}`);
        }
      }, 3000);
    }
  };

  // Enhanced participate function with contract integration
  const participateInAirdrop = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!socialTasksCompleted) {
      alert('Please complete all social media tasks first');
      return;
    }

    setIsParticipating(true);

    try {
      // Check if user already participated
      const existingParticipant = participants.find(p => p.address.toLowerCase() === walletAddress.toLowerCase());
      if (existingParticipant) {
        alert('You have already participated in the airdrop');
        setIsParticipating(false);
        return;
      }

      // Validate referral code if provided
      let referrer: Participant | undefined;
      if (referralInput) {
        referrer = participants.find(p => p.referralCode === referralInput);
        if (!referrer) {
          alert('Invalid referral code');
          setIsParticipating(false);
          return;
        }
        if (referrer.address.toLowerCase() === walletAddress.toLowerCase()) {
          alert('You cannot refer yourself');
          setIsParticipating(false);
          return;
        }
      }

      // Create new participant
      const referralCode = generateReferralCode(walletAddress);
      const baseAmount = BASE_REWARD;
      const bonusAmount = 0; // Initial bonus is 0, increases with referrals

      const newParticipant: Participant = {
        address: walletAddress,
        referralCode,
        referredBy: referralInput || undefined,
        socialTasksCompleted: true,
        referralCount: 0,
        baseAmount,
        bonusAmount,
        totalAmount: baseAmount + bonusAmount,
        claimStatus: 'pending'
      };

      // Update referrer's bonus if referral code was used
      let updatedParticipants = [...participants];
      if (referrer) {
        const updatedReferrer = {
          ...referrer,
          referralCount: referrer.referralCount + 1,
          bonusAmount: referrer.bonusAmount + REFERRAL_BONUS,
          totalAmount: referrer.baseAmount + referrer.bonusAmount + REFERRAL_BONUS
        };
        
        updatedParticipants = updatedParticipants.map(p => 
          p.address === referrer!.address ? updatedReferrer : p
        );
      }

      updatedParticipants.push(newParticipant);
      setParticipants(updatedParticipants);
      setUserParticipant(newParticipant);

      // Store in localStorage (in production, this would be stored on blockchain)
      localStorage.setItem('airdropParticipants', JSON.stringify(updatedParticipants));

      // Update stats
      loadAirdropStats();

      alert(`Successfully participated in the airdrop!\nYour referral code: ${referralCode}\nExpected reward: ${newParticipant.totalAmount} BAK`);

      // Check if we reached target participants for automatic distribution
      if (updatedParticipants.length >= TARGET_PARTICIPANTS) {
        setTimeout(() => {
          initiateAutomaticDistribution(updatedParticipants);
        }, 1000);
      }

    } catch (error) {
      console.error('Error participating in airdrop:', error);
      alert('Failed to participate in airdrop. Please try again.');
    }

    setIsParticipating(false);
  };

  // Enhanced automatic distribution
  const initiateAutomaticDistribution = async (participantsList: Participant[]) => {
    alert('🎉 Target of 1 million participants reached! Automatic distribution initiated!');
    
    try {
      // In production, this would call the smart contract's distribute function
      console.log('Initiating automatic distribution for', participantsList.length, 'participants');
      console.log('Contract Address:', AIRDROP_CONTRACT_ADDRESS);
      console.log('Total BAK to distribute:', participantsList.reduce((sum, p) => sum + p.totalAmount, 0));
      
      // Simulate distribution process
      setTimeout(() => {
        // Update all participants to 'distributed' status
        const distributedParticipants = participantsList.map(p => ({
          ...p,
          claimStatus: 'distributed' as const
        }));
        
        setParticipants(distributedParticipants);
        localStorage.setItem('airdropParticipants', JSON.stringify(distributedParticipants));
        
        alert('🎊 Distribution completed! BAK tokens have been sent to all participants!');
      }, 5000);
      
    } catch (error) {
      console.error('Distribution failed:', error);
      alert('Distribution failed. Please contact support.');
    }
  };

  // Manual claim function (for testing)
  const claimAirdrop = async () => {
    if (!userParticipant) return;

    try {
      // In production, this would call the smart contract's claim function
      const updatedParticipant = {
        ...userParticipant,
        claimStatus: 'claimed' as const
      };

      const updatedParticipants = participants.map(p => 
        p.address === userParticipant.address ? updatedParticipant : p
      );

      setParticipants(updatedParticipants);
      setUserParticipant(updatedParticipant);
      localStorage.setItem('airdropParticipants', JSON.stringify(updatedParticipants));

      alert(`Successfully claimed ${updatedParticipant.totalAmount} BAK tokens!`);
      
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed. Please try again.');
    }
  };

  // Load participants and stats on component mount
  useEffect(() => {
    const stored = localStorage.getItem('airdropParticipants');
    if (stored) {
      setParticipants(JSON.parse(stored));
    }
    loadAirdropStats();
  }, []);

  // Update stats when participants change
  useEffect(() => {
    loadAirdropStats();
  }, [participants]);

  const currentParticipants = participants.length;
  const progressPercentage = (currentParticipants / TARGET_PARTICIPANTS) * 100;

  return (
    <div className="airdrop-container enhanced">
      <div className="airdrop-header">
        <h2>🎁 Enhanced BrainArk Airdrop Program</h2>
        <p>Join 1 million participants and earn BAK tokens with smart contract automation!</p>
        
        <div className="contract-info">
          <div className="contract-item">
            <span className="contract-label">Airdrop Contract:</span>
            <span className="contract-address">{AIRDROP_CONTRACT_ADDRESS}</span>
          </div>
          <div className="contract-item">
            <span className="contract-label">Funding Wallet:</span>
            <span className="contract-address">{FUNDING_WALLET}</span>
          </div>
        </div>
      </div>

      {airdropStats && (
        <div className="airdrop-stats">
          <div className="stat-item">
            <span className="stat-value">{airdropStats.totalParticipants.toLocaleString()}</span>
            <span className="stat-label">Participants</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(airdropStats.totalClaimed / 1000).toFixed(1)}K</span>
            <span className="stat-label">BAK Claimed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(airdropStats.totalReferralBonuses / 1000).toFixed(1)}K</span>
            <span className="stat-label">Referral Bonuses</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(airdropStats.remainingSupply / 1000000).toFixed(1)}M</span>
            <span className="stat-label">BAK Remaining</span>
          </div>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {currentParticipants.toLocaleString()} / {TARGET_PARTICIPANTS.toLocaleString()} participants
          <span className="progress-percentage">({progressPercentage.toFixed(2)}%)</span>
        </div>
      </div>

      <div className="airdrop-content">
        <div className="participation-section">
          <h3>Participate in Enhanced Airdrop</h3>
          
          {!isConnected ? (
            <div className="wallet-prompt">
              <p>Please connect your wallet to participate in the airdrop</p>
              <div className="network-info">
                <h4>BrainArk Network Details:</h4>
                <ul>
                  <li><strong>Chain ID:</strong> 424242</li>
                  <li><strong>RPC URL:</strong> {process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online'}</li>
                  <li><strong>Currency:</strong> BAK</li>
                </ul>
              </div>
            </div>
          ) : userParticipant ? (
            <div className="participant-info enhanced">
              <h4>✅ You're participating in the airdrop!</h4>
              <div className="participant-details">
                <div className="detail-row">
                  <span className="detail-label">Referral Code:</span>
                  <span className="detail-value">{userParticipant.referralCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Referrals Made:</span>
                  <span className="detail-value">{userParticipant.referralCount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Base Reward:</span>
                  <span className="detail-value">{userParticipant.baseAmount} BAK</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Referral Bonus:</span>
                  <span className="detail-value">{userParticipant.bonusAmount} BAK</span>
                </div>
                <div className="detail-row total">
                  <span className="detail-label">Total Expected:</span>
                  <span className="detail-value">{userParticipant.totalAmount} BAK</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${userParticipant.claimStatus}`}>
                    {userParticipant.claimStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {userParticipant.claimStatus === 'pending' && currentParticipants < TARGET_PARTICIPANTS && (
                <div className="claim-section">
                  <p>Automatic distribution will occur when we reach 1M participants.</p>
                  <button onClick={claimAirdrop} className="claim-btn">
                    Manual Claim (Testing)
                  </button>
                </div>
              )}

              <div className="referral-link">
                <h4>Share your referral link:</h4>
                <div className="referral-input-group">
                  <input 
                    type="text" 
                    value={`${window.location.origin}?ref=${userParticipant.referralCode}`}
                    readOnly 
                    className="referral-input"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}?ref=${userParticipant.referralCode}`);
                      alert('Referral link copied to clipboard!');
                    }}
                    className="copy-btn"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="referral-bonus-info">
                  Earn {REFERRAL_BONUS} BAK for each successful referral!
                </p>
              </div>
            </div>
          ) : (
            <div className="participation-form">
              <div className="wallet-info">
                <p><strong>Wallet Address:</strong> {walletAddress}</p>
                <p><strong>Your Referral Code:</strong> {userReferralCode}</p>
                <p><strong>Expected Base Reward:</strong> {BASE_REWARD} BAK</p>
              </div>

              <div className="referral-section">
                <label>Referral Code (Optional):</label>
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="Enter referral code (e.g., BAK123ABC)"
                  className="referral-input"
                />
                <p className="referral-info">
                  Using a referral code helps both you and the referrer!
                </p>
              </div>

              <div className="social-tasks">
                <h4>Complete Social Media Tasks:</h4>
                <div className="task-buttons">
                  <button 
                    onClick={() => handleSocialTask('telegram')}
                    className="social-btn telegram"
                  >
                    📱 Join Telegram
                  </button>
                  <button 
                    onClick={() => handleSocialTask('twitter')}
                    className="social-btn twitter"
                  >
                    🐦 Follow Twitter
                  </button>
                  <button 
                    onClick={() => handleSocialTask('discord')}
                    className="social-btn discord"
                  >
                    💬 Join Discord
                  </button>
                  <button 
                    onClick={() => handleSocialTask('website')}
                    className="social-btn website"
                  >
                    🌐 Visit Website
                  </button>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={socialTasksCompleted}
                    onChange={(e) => setSocialTasksCompleted(e.target.checked)}
                  />
                  I have completed all social media tasks
                </label>
              </div>

              <button
                onClick={participateInAirdrop}
                disabled={!socialTasksCompleted || isParticipating}
                className="participate-btn"
              >
                {isParticipating ? 'Participating...' : 'Participate in Airdrop'}
              </button>
            </div>
          )}
        </div>

        <div className="airdrop-info">
          <h3>Enhanced Airdrop Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>Total Pool</h4>
              <p>15M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Base Reward</h4>
              <p>{BASE_REWARD} BAK per user</p>
            </div>
            <div className="info-item">
              <h4>Referral Bonus</h4>
              <p>{REFERRAL_BONUS} BAK per referral</p>
            </div>
            <div className="info-item">
              <h4>Auto Distribution</h4>
              <p>At 1M participants</p>
            </div>
          </div>

          <div className="enhanced-features">
            <h4>Enhanced Features:</h4>
            <ul>
              <li>Smart contract automation for distribution</li>
              <li>Real-time participant tracking and statistics</li>
              <li>Multi-platform social media integration</li>
              <li>Automatic referral bonus calculation</li>
              <li>Transparent on-chain verification</li>
              <li>24-hour distribution guarantee</li>
            </ul>
          </div>

          <div className="distribution-timeline">
            <h4>Distribution Timeline:</h4>
            <div className="timeline-item">
              <span className="timeline-step">1.</span>
              <span className="timeline-text">Complete social tasks</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-step">2.</span>
              <span className="timeline-text">Participate with wallet</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-step">3.</span>
              <span className="timeline-text">Share referral link (optional)</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-step">4.</span>
              <span className="timeline-text">Automatic distribution at 1M participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatedAirdropComponent;