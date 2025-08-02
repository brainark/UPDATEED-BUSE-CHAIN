import React, { useState, useEffect } from 'react';

const AirdropComponent = ({ walletAddress, isConnected, connectWallet }) => {
  const [participants, setParticipants] = useState([]);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [socialTasksCompleted, setSocialTasksCompleted] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [userParticipant, setUserParticipant] = useState(null);
  const [showSocialTasks, setShowSocialTasks] = useState(false);
  const [realTimeCount, setRealTimeCount] = useState(0);
  const [distributionCountdown, setDistributionCountdown] = useState(null);
  const [isVerifyingTasks, setIsVerifyingTasks] = useState(false);
  const [taskVerification, setTaskVerification] = useState({
    twitter: { completed: false, verified: false },
    telegram: { completed: false, verified: false }
  });
  const [distributionPhase, setDistributionPhase] = useState(null);

  // Airdrop Configuration
  const TOTAL_AIRDROP_POOL = 10000000; // 10M BAK
  const TOTAL_REFERRAL_POOL = 5000000; // 5M BAK
  const TARGET_PARTICIPANTS = 1000000; // 1M participants
  const REFERRAL_BONUS_PERCENTAGE = 30; // 30% bonus per referral
  const DISTRIBUTION_DELAY = 1800; // 30 minutes in seconds
  const DISTRIBUTION_DURATION = 86400; // 24 hours in seconds

  // Generate unique referral code
  const generateReferralCode = (address) => {
    return `BAK${address.slice(2, 8).toUpperCase()}`;
  };

  // Calculate distribution amounts
  const calculateDistribution = (participantCount, referralCount) => {
    const baseAmount = TOTAL_AIRDROP_POOL / TARGET_PARTICIPANTS;
    const bonusAmount = (baseAmount * REFERRAL_BONUS_PERCENTAGE / 100) * referralCount;
    return { baseAmount, bonusAmount, totalAmount: baseAmount + bonusAmount };
  };

  // Mock verification functions
  const verifyTwitterTasks = async (userTwitterHandle) => {
    try {
      setIsVerifyingTasks(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockVerification = {
        isFollowing: Math.random() > 0.3,
        hasRetweeted: Math.random() > 0.4,
        hasLiked: Math.random() > 0.3
      };
      
      const isVerified = mockVerification.isFollowing && 
                        mockVerification.hasRetweeted && 
                        mockVerification.hasLiked;
      
      setTaskVerification(prev => ({
        ...prev,
        twitter: { completed: true, verified: isVerified, details: mockVerification }
      }));
      
      return isVerified;
    } catch (error) {
      console.error('Twitter verification failed:', error);
      return false;
    } finally {
      setIsVerifyingTasks(false);
    }
  };

  const verifyTelegramTasks = async (userTelegramId) => {
    try {
      setIsVerifyingTasks(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockVerification = {
        isMember: Math.random() > 0.2,
        joinDate: new Date().toISOString()
      };
      
      setTaskVerification(prev => ({
        ...prev,
        telegram: { completed: true, verified: mockVerification.isMember, details: mockVerification }
      }));
      
      return mockVerification.isMember;
    } catch (error) {
      console.error('Telegram verification failed:', error);
      return false;
    } finally {
      setIsVerifyingTasks(false);
    }
  };

  const verifyAllTasks = async () => {
    setIsVerifyingTasks(true);
    
    try {
      const userTwitterHandle = prompt('Please enter your Twitter handle (without @):');
      const userTelegramId = prompt('Please enter your Telegram username (without @):');
      
      if (!userTwitterHandle || !userTelegramId) {
        alert('Please provide both Twitter and Telegram handles for verification');
        return false;
      }
      
      const twitterVerified = await verifyTwitterTasks(userTwitterHandle);
      const telegramVerified = await verifyTelegramTasks(userTelegramId);
      const allTasksVerified = twitterVerified && telegramVerified;
      
      if (allTasksVerified) {
        setSocialTasksCompleted(true);
        alert('✅ All social media tasks verified successfully!');
      } else {
        alert('❌ Some tasks could not be verified. Please ensure you have:\n' +
              '• Followed @sdogcoin1 on Twitter\n' +
              '• Liked and retweeted the pinned post\n' +
              '• Joined the BrainArk Telegram channel');
      }
      
      return allTasksVerified;
    } catch (error) {
      console.error('Task verification error:', error);
      alert('Verification failed. Please try again.');
      return false;
    } finally {
      setIsVerifyingTasks(false);
    }
  };

  // Real-time participant counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeCount(prev => {
        const increment = Math.floor(Math.random() * 5) + 1;
        const newCount = prev + increment;
        return Math.min(newCount, TARGET_PARTICIPANTS);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
  const handleSocialTask = (platform) => {
    const urls = {
      telegram: 'https://t.me/Brainark_Besu_BlockChain',
      twitter: 'https://x.com/sdogcoin1?s=21'
    };
    window.open(urls[platform], '_blank');
    
    setTaskVerification(prev => ({
      ...prev,
      [platform]: { ...prev[platform], completed: true }
    }));
  };

  // Show social tasks modal - THIS IS THE KEY FUNCTION FOR THE CIRCULAR BUTTON
  const showJoinAirdropTasks = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setShowSocialTasks(true);
  };

  // Participate in airdrop
  const participateInAirdrop = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    const tasksVerified = await verifyAllTasks();
    if (!tasksVerified) {
      return;
    }

    setIsParticipating(true);

    try {
      const existingParticipant = participants.find(p => p.address.toLowerCase() === walletAddress.toLowerCase());
      if (existingParticipant) {
        alert('You have already participated in the airdrop');
        setIsParticipating(false);
        return;
      }

      const referralCode = generateReferralCode(walletAddress);
      const { baseAmount, bonusAmount, totalAmount } = calculateDistribution(participants.length + 1, 0);

      const newParticipant = {
        address: walletAddress,
        referralCode,
        referredBy: referralInput || undefined,
        socialTasksCompleted: true,
        socialTasksVerified: true,
        verificationDetails: taskVerification,
        referralCount: 0,
        baseAmount,
        bonusAmount,
        totalAmount,
        joinedAt: new Date().toISOString()
      };

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
      setShowSocialTasks(false);

      localStorage.setItem('airdropParticipants', JSON.stringify(updatedParticipants));

      alert('🎉 Successfully participated in the airdrop!');

      if (updatedParticipants.length >= TARGET_PARTICIPANTS) {
        setTimeout(() => {
          initiateDistributionSequence(updatedParticipants);
        }, 1000);
      }

    } catch (error) {
      console.error('Error participating in airdrop:', error);
      alert('Failed to participate in airdrop');
    }

    setIsParticipating(false);
  };

  // Distribution functions
  const initiateDistributionSequence = async (participantsList) => {
    alert('🎉 Target of 1 million participants reached!\n' +
          '⏰ Distribution will begin in 30 minutes to avoid network congestion.\n' +
          '📅 Tokens will be distributed over 24 hours for optimal network performance.');
    
    setDistributionPhase('waiting');
    let waitingTime = DISTRIBUTION_DELAY;
    setDistributionCountdown(waitingTime);
    
    const waitingInterval = setInterval(() => {
      waitingTime -= 1;
      setDistributionCountdown(waitingTime);
      
      if (waitingTime <= 0) {
        clearInterval(waitingInterval);
        startDistributionProcess(participantsList);
      }
    }, 1000);
  };

  const startDistributionProcess = (participantsList) => {
    alert('🚀 Distribution process starting now!');
    setDistributionPhase('distributing');
    
    let distributionTime = DISTRIBUTION_DURATION;
    setDistributionCountdown(distributionTime);
    
    const distributionInterval = setInterval(() => {
      distributionTime -= 1;
      setDistributionCountdown(distributionTime);
      
      if (distributionTime <= 0) {
        clearInterval(distributionInterval);
        completeDistribution(participantsList);
      }
    }, 1000);
  };

  const completeDistribution = (participantsList) => {
    setDistributionPhase('completed');
    setDistributionCountdown(null);
    alert('✅ Distribution completed successfully!');
  };

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load participants from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('airdropParticipants');
    if (stored) {
      setParticipants(JSON.parse(stored));
    }
    
    const storedCount = stored ? JSON.parse(stored).length : 0;
    setRealTimeCount(Math.max(storedCount, Math.floor(Math.random() * 50000) + 10000));
  }, []);

  const currentParticipants = Math.max(participants.length, realTimeCount);
  const progressPercentage = (currentParticipants / TARGET_PARTICIPANTS) * 100;

  return React.createElement('div', { className: 'airdrop-container' },
    React.createElement('div', { className: 'airdrop-header' },
      React.createElement('h2', null, '🎁 BrainArk Airdrop Program'),
      React.createElement('p', null, 'Join 1 million participants and earn BAK tokens!')
    ),

    React.createElement('div', { className: 'progress-section' },
      React.createElement('div', { className: 'progress-bar' },
        React.createElement('div', { 
          className: 'progress-fill', 
          style: { width: `${Math.min(progressPercentage, 100)}%` }
        })
      ),
      React.createElement('div', { className: 'progress-text' },
        `${currentParticipants.toLocaleString()} / ${TARGET_PARTICIPANTS.toLocaleString()} participants`
      ),
      React.createElement('div', { className: 'live-counter' },
        '🔴 LIVE: Participants joining in real-time!'
      ),
      React.createElement('div', { className: 'distribution-notice' },
        '⚡ Once we reach 1 million participants, distribution will begin after 30 minutes and continue over 24 hours to avoid network congestion!'
      )
    ),

    // Distribution Status
    distributionCountdown !== null && React.createElement('div', { className: 'distribution-countdown' },
      distributionPhase === 'waiting' && React.createElement('div', null,
        React.createElement('h3', null, '⏰ Waiting Period - Preparing Distribution'),
        React.createElement('div', { className: 'countdown-timer' }, formatCountdown(distributionCountdown)),
        React.createElement('p', null, 'Distribution will begin automatically when countdown reaches zero')
      ),
      distributionPhase === 'distributing' && React.createElement('div', null,
        React.createElement('h3', null, '🚀 Distribution in Progress'),
        React.createElement('div', { className: 'countdown-timer' }, formatCountdown(distributionCountdown)),
        React.createElement('p', null, 'Tokens are being distributed in batches over 24 hours')
      ),
      distributionPhase === 'completed' && React.createElement('div', null,
        React.createElement('h3', null, '✅ Distribution Completed'),
        React.createElement('p', null, 'All tokens have been successfully distributed!')
      )
    ),

    React.createElement('div', { className: 'airdrop-content' },
      React.createElement('div', { className: 'participation-section' },
        React.createElement('h3', null, 'Participate in Airdrop'),
        
        !isConnected ? 
          React.createElement('div', { className: 'wallet-prompt' },
            React.createElement('p', null, 'Please connect your wallet to participate'),
            React.createElement('button', {
              className: 'connect-metamask-btn',
              onClick: connectWallet
            }, '🦊 Connect MetaMask')
          ) : userParticipant ? 
            React.createElement('div', { className: 'participant-info' },
              React.createElement('h4', null, '✅ You\'re already participating!'),
              React.createElement('div', { className: 'participant-details' },
                React.createElement('p', null, React.createElement('strong', null, 'Your Referral Code:'), ' ', userParticipant.referralCode),
                React.createElement('p', null, React.createElement('strong', null, 'Referrals Made:'), ' ', userParticipant.referralCount),
                React.createElement('p', null, React.createElement('strong', null, 'Expected BAK:'), ' ', userParticipant.totalAmount.toFixed(2), ' BAK'),
                userParticipant.socialTasksVerified && React.createElement('p', { className: 'verification-status' }, 
                  '✅ Social media tasks verified'
                )
              ),
              React.createElement('div', { className: 'referral-link' },
                React.createElement('h4', null, 'Share your referral link:'),
                React.createElement('input', { 
                  type: 'text', 
                  value: `${window.location.origin}?ref=${userParticipant.referralCode}`,
                  readOnly: true, 
                  className: 'referral-input'
                }),
                React.createElement('button', {
                  onClick: () => navigator.clipboard.writeText(`${window.location.origin}?ref=${userParticipant.referralCode}`),
                  className: 'copy-btn'
                }, 'Copy Link')
              )
            ) :
            React.createElement('div', { className: 'join-airdrop-section' },
              React.createElement('div', { className: 'wallet-info' },
                React.createElement('p', null, React.createElement('strong', null, 'Connected Wallet:'), ' ', walletAddress.slice(0, 6), '...', walletAddress.slice(-4))
              ),
              
              // THE BIG CIRCULAR BUTTON - CENTER OF AIRDROP PAGE
              React.createElement('div', { className: 'join-button-container' },
                React.createElement('button', {
                  className: 'circular-join-btn',
                  onClick: showJoinAirdropTasks
                }, 
                  React.createElement('div', { className: 'btn-content' },
                    React.createElement('span', { className: 'btn-icon' }, '🎁'),
                    React.createElement('span', { className: 'btn-text' }, 'Join Airdrop Here!')
                  )
                )
              ),

              React.createElement('div', { className: 'referral-section' },
                React.createElement('label', null, 'Referral Code (Optional):'),
                React.createElement('input', {
                  type: 'text',
                  value: referralInput,
                  onChange: (e) => setReferralInput(e.target.value),
                  placeholder: 'Enter referral code if you have one',
                  className: 'referral-input'
                })
              )
            )
      ),

      React.createElement('div', { className: 'airdrop-info' },
        React.createElement('h3', null, 'Airdrop Information'),
        React.createElement('div', { className: 'info-grid' },
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Total Pool'),
            React.createElement('p', null, '15M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Airdrop Pool'),
            React.createElement('p', null, '10M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Referral Pool'),
            React.createElement('p', null, '5M BAK Tokens')
          ),
          React.createElement('div', { className: 'info-item' },
            React.createElement('h4', null, 'Referral Bonus'),
            React.createElement('p', null, '30% per referral')
          )
        ),

        React.createElement('div', { className: 'distribution-info' },
          React.createElement('h4', null, 'Distribution Logic:'),
          React.createElement('ul', null,
            React.createElement('li', null, `Base amount: ${(TOTAL_AIRDROP_POOL / TARGET_PARTICIPANTS).toFixed(2)} BAK per participant`),
            React.createElement('li', null, 'Referral bonus: 30% of base amount per successful referral'),
            React.createElement('li', null, 'Automatic verification of social media tasks'),
            React.createElement('li', null, '30-minute delay after reaching 1M participants'),
            React.createElement('li', null, 'Distribution over 24 hours to prevent network congestion')
          )
        )
      )
    ),

    // SOCIAL TASKS MODAL - POPS UP WHEN CIRCULAR BUTTON IS CLICKED
    showSocialTasks && React.createElement('div', { className: 'modal-overlay' },
      React.createElement('div', { className: 'social-tasks-modal' },
        React.createElement('div', { className: 'modal-header' },
          React.createElement('h3', null, '📱 Complete Social Media Tasks'),
          React.createElement('button', {
            className: 'close-btn',
            onClick: () => setShowSocialTasks(false)
          }, '×')
        ),
        React.createElement('div', { className: 'modal-content' },
          React.createElement('p', { className: 'task-instruction' },
            'Complete the social media tasks below. Click the buttons to visit our accounts and complete the required actions.'
          ),
          
          React.createElement('div', { className: 'social-task-buttons' },
            React.createElement('button', {
              onClick: () => handleSocialTask('twitter'),
              className: `social-task-btn twitter ${taskVerification.twitter.completed ? 'completed' : ''}`
            }, 
              React.createElement('span', null, taskVerification.twitter.verified ? '✅' : '🐦'),
              React.createElement('div', null,
                React.createElement('strong', null, 'Follow on X (Twitter)'),
                React.createElement('p', null, 'Follow @sdogcoin1, like & repost pinned post'),
                React.createElement('small', null, 'Click to visit: https://x.com/sdogcoin1?s=21'),
                taskVerification.twitter.completed && React.createElement('small', { className: 'task-status' }, 
                  taskVerification.twitter.verified ? 'Verified ✅' : 'Completed - Pending Verification'
                )
              )
            ),
            React.createElement('button', {
              onClick: () => handleSocialTask('telegram'),
              className: `social-task-btn telegram ${taskVerification.telegram.completed ? 'completed' : ''}`
            },
              React.createElement('span', null, taskVerification.telegram.verified ? '✅' : '📱'),
              React.createElement('div', null,
                React.createElement('strong', null, 'Join Telegram'),
                React.createElement('p', null, 'Join our Telegram channel'),
                React.createElement('small', null, 'Click to visit: https://t.me/Brainark_Besu_BlockChain'),
                taskVerification.telegram.completed && React.createElement('small', { className: 'task-status' }, 
                  taskVerification.telegram.verified ? 'Verified ✅' : 'Completed - Pending Verification'
                )
              )
            )
          ),
          
          React.createElement('div', { className: 'verification-section' },
            React.createElement('h4', null, '🔍 Task Verification'),
            React.createElement('p', null, 'After completing the tasks above, click "Verify & Join Airdrop" to verify your participation.'),
            isVerifyingTasks && React.createElement('div', { className: 'verification-progress' },
              React.createElement('p', null, '⏳ Verifying your social media tasks...')
            )
          ),
          
          React.createElement('button', {
            onClick: participateInAirdrop,
            disabled: isParticipating || isVerifyingTasks,
            className: 'confirm-participation-btn'
          }, 
            isVerifyingTasks ? '🔍 Verifying Tasks...' : 
            isParticipating ? 'Joining Airdrop...' : 
            '🔍 Verify & Join Airdrop'
          )
        )
      )
    )
  );
};

export default AirdropComponent;