import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AutoWalletConnection from './AutoWalletConnection';

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
}

const AirdropComponent: React.FC<AirdropComponentProps> = ({ walletAddress, isConnected }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [referralInput, setReferralInput] = useState<string>('');
  const [socialTasksCompleted, setSocialTasksCompleted] = useState<boolean>(false);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [userParticipant, setUserParticipant] = useState<Participant | null>(null);

  // Airdrop Configuration
  const TOTAL_AIRDROP_POOL = 10000000; // 10M BAK
  const TOTAL_REFERRAL_POOL = 5000000; // 5M BAK
  const TARGET_PARTICIPANTS = 1000000; // 1M participants
  const REFERRAL_BONUS_PERCENTAGE = 30; // 30% bonus per referral
  const OWNER_WALLET = '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF';

  // Generate unique referral code
  const generateReferralCode = (address: string): string => {
    return `BAK${address.slice(2, 8).toUpperCase()}`;
  };

  // Calculate distribution amounts
  const calculateDistribution = (participantCount: number, referralCount: number) => {
    const baseAmount = TOTAL_AIRDROP_POOL / TARGET_PARTICIPANTS; // Base amount per participant
    const bonusAmount = (baseAmount * REFERRAL_BONUS_PERCENTAGE / 100) * referralCount;
    return { baseAmount, bonusAmount, totalAmount: baseAmount + bonusAmount };
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

  // Handle social media tasks
  const handleSocialTask = (platform: string) => {
    const urls = {
      telegram: 'https://t.me/Brainark_Besu_BlockChain',
      twitter: 'https://x.com/sdogcoin1?s=21'
    };
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  // Participate in airdrop
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

      // Create new participant
      const referralCode = generateReferralCode(walletAddress);
      const { baseAmount, bonusAmount, totalAmount } = calculateDistribution(participants.length + 1, 0);

      const newParticipant: Participant = {
        address: walletAddress,
        referralCode,
        referredBy: referralInput || undefined,
        socialTasksCompleted: true,
        referralCount: 0,
        baseAmount,
        bonusAmount,
        totalAmount
      };

      // Update referrer's bonus if referral code was used
      let updatedParticipants = [...participants];
      if (referralInput) {
        const referrer = participants.find(p => p.referralCode === referralInput);
        if (referrer) {
          const updatedReferrer = {
            ...referrer,
            referralCount: referrer.referralCount + 1,
          };
          const { baseAmount: refBaseAmount, bonusAmount: refBonusAmount, totalAmount: refTotalAmount } = 
            calculateDistribution(participants.length, updatedReferrer.referralCount);
          
          updatedReferrer.bonusAmount = refBonusAmount;
          updatedReferrer.totalAmount = refTotalAmount;
          
          updatedParticipants = updatedParticipants.map(p => 
            p.address === referrer.address ? updatedReferrer : p
          );
        }
      }

      updatedParticipants.push(newParticipant);
      setParticipants(updatedParticipants);
      setUserParticipant(newParticipant);

      // Store in localStorage (in production, this would be stored on blockchain)
      localStorage.setItem('airdropParticipants', JSON.stringify(updatedParticipants));

      alert('Successfully participated in the airdrop!');

      // Check if we reached target participants
      if (updatedParticipants.length >= TARGET_PARTICIPANTS) {
        setTimeout(() => {
          initiateAutomaticDistribution(updatedParticipants);
        }, 1000);
      }

    } catch (error) {
      console.error('Error participating in airdrop:', error);
      alert('Failed to participate in airdrop');
    }

    setIsParticipating(false);
  };

  // Automatic distribution when target is reached
  const initiateAutomaticDistribution = async (participantsList: Participant[]) => {
    alert('🎉 Target of 1 million participants reached! Automatic distribution will begin within 24 hours.');
    
    // In a real implementation, this would trigger the smart contract
    console.log('Initiating automatic distribution for', participantsList.length, 'participants');
    
    // Simulate distribution process
    setTimeout(() => {
      alert('Distribution completed! Check your wallet for BAK tokens.');
    }, 5000);
  };

  // Load participants from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('airdropParticipants');
    if (stored) {
      setParticipants(JSON.parse(stored));
    }
  }, []);

  const currentParticipants = participants.length;
  const progressPercentage = (currentParticipants / TARGET_PARTICIPANTS) * 100;

  return (
    <div className="airdrop-container">
      <div className="airdrop-header">
        <h2>🎁 BrainArk Airdrop Program</h2>
        <p>Join 1 million participants and earn BAK tokens!</p>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {currentParticipants.toLocaleString()} / {TARGET_PARTICIPANTS.toLocaleString()} participants
        </div>
      </div>

      <div className="airdrop-content">
        <div className="participation-section">
          <h3>Participate in Airdrop</h3>
          
          {!isConnected ? (
            <AutoWalletConnection />
          ) : userParticipant ? (
            <div className="participant-info">
              <h4>✅ You're already participating!</h4>
              <div className="participant-details">
                <p><strong>Your Referral Code:</strong> {userParticipant.referralCode}</p>
                <p><strong>Referrals Made:</strong> {userParticipant.referralCount}</p>
                <p><strong>Base Amount:</strong> {userParticipant.baseAmount.toFixed(2)} BAK</p>
                <p><strong>Bonus Amount:</strong> {userParticipant.bonusAmount.toFixed(2)} BAK</p>
                <p><strong>Total Expected:</strong> {userParticipant.totalAmount.toFixed(2)} BAK</p>
              </div>
              <div className="referral-link">
                <h4>Share your referral link:</h4>
                <input 
                  type="text" 
                  value={`${window.location.origin}?ref=${userParticipant.referralCode}`}
                  readOnly 
                  className="referral-input"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}?ref=${userParticipant.referralCode}`)}
                  className="copy-btn"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ) : (
            <div className="participation-form">
              <div className="wallet-info">
                <p><strong>Wallet Address:</strong> {walletAddress}</p>
                <p><strong>Your Referral Code:</strong> {userReferralCode}</p>
              </div>

              <div className="referral-section">
                <label>Referral Code (Optional):</label>
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  placeholder="Enter referral code if you have one"
                  className="referral-input"
                />
              </div>

              <div className="social-tasks">
                <h4>Complete Social Media Tasks:</h4>
                <div className="task-buttons">
                  <button 
                    onClick={() => handleSocialTask('telegram')}
                    className="social-btn telegram"
                  >
                    📱 Follow Telegram
                  </button>
                  <button 
                    onClick={() => handleSocialTask('twitter')}
                    className="social-btn twitter"
                  >
                    🐦 Follow Twitter
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
          <h3>Airdrop Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>Total Pool</h4>
              <p>15M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Airdrop Pool</h4>
              <p>10M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Referral Pool</h4>
              <p>5M BAK Tokens</p>
            </div>
            <div className="info-item">
              <h4>Referral Bonus</h4>
              <p>30% per referral</p>
            </div>
          </div>

          <div className="distribution-info">
            <h4>Distribution Logic:</h4>
            <ul>
              <li>Base amount per participant: {(TOTAL_AIRDROP_POOL / TARGET_PARTICIPANTS).toFixed(2)} BAK</li>
              <li>Referral bonus: 30% of base amount per successful referral</li>
              <li>Automatic distribution when 1M participants reached</li>
              <li>Distribution completes within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirdropComponent;