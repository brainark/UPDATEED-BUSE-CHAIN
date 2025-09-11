import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SOCIAL_LINKS, AIRDROP_CONFIG } from '@/utils/config'
import { contractHelpers, parseContractError, waitForTransaction } from '@/utils/contracts'
import { ensureBrainArkNetwork } from '@/utils/networkSwitcher'
import { brainarkChain } from '@/utils/wagmiConfig'
import AutoWalletConnection from './AutoWalletConnection'

interface SocialTask {
  id: string
  name: string
  description: string
  completed: boolean
  verifying: boolean
  link: string
}

interface AirdropData {
  hasClaimed: boolean
  canClaim: boolean
  referralCount: number
  totalEarned: number
  socialTasks: SocialTask[]
}

interface AirdropSectionProps {
  isConnected?: boolean
  walletAddress?: string
}

export default function AirdropSection() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [loading, setLoading] = useState(true)
  const [networkChecking, setNetworkChecking] = useState(false)
  
  const isOnBrainArkNetwork = chainId === brainarkChain.id
  
  const [airdropData, setAirdropData] = useState<AirdropData>({
    hasClaimed: false,
    canClaim: false,
    referralCount: 0,
    totalEarned: 0,
    socialTasks: [
      {
        id: 'twitter_follow',
        name: 'Follow on Twitter',
        description: 'Follow @sdogcoin1 on Twitter',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TWITTER
      },
      {
        id: 'twitter_retweet',
        name: 'Retweet Pinned Post',
        description: 'Retweet our pinned post',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TWITTER
      },
      {
        id: 'telegram_join',
        name: 'Join Telegram',
        description: 'Join our Telegram channel',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TELEGRAM
      }
    ]
  })
  const [referralCode, setReferralCode] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [timeUntilDistribution, setTimeUntilDistribution] = useState(0)
  const [airdropStats, setAirdropStats] = useState({
    totalParticipants: 0,
    totalClaimed: 0,
    totalReferralBonuses: 0,
    remainingSupply: AIRDROP_CONFIG.TOTAL_SUPPLY,
    distributionActive: false,
    distributionStartTime: 0
  })

  useEffect(() => {
    if (publicClient) {
      loadAirdropStats()
    }
  }, [publicClient])
  
  useEffect(() => {
    if (isConnected && address) {
      loadAirdropData()
    }
  }, [isConnected, address])

  const loadAirdropStats = async () => {
    try {
      setLoading(true)
      const stats = await contractHelpers.getAirdropStats(publicClient)
      
      setAirdropStats({
        totalParticipants: Number(stats.totalParticipants),
        totalClaimed: Number(ethers.formatEther(stats.totalClaimed)),
        totalReferralBonuses: Number(ethers.formatEther(stats.totalReferralBonuses)),
        remainingSupply: Number(ethers.formatEther(stats.remainingSupply)),
        distributionActive: stats.distributionActive,
        distributionStartTime: Number(stats.distributionStartTime)
      })
      
      // Also check for time until distribution
      const timeRemaining = await contractHelpers.getTimeUntilDistribution(publicClient)
      setTimeUntilDistribution(Number(timeRemaining))
    } catch (error) {
      console.error('Error loading airdrop stats:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadAirdropData = async () => {
    try {
      setLoading(true)
      
      // Get user info from contract
      const userInfo = await contractHelpers.getAirdropUserInfo(address, publicClient)
      
      // Check if user can claim
      const canClaim = await contractHelpers.canClaimAirdrop(address, publicClient)
      
      // Set updated data
      setAirdropData({
        hasClaimed: userInfo.hasClaimed,
        canClaim: canClaim,
        referralCount: Number(userInfo.referralCount),
        totalEarned: Number(ethers.formatEther(userInfo.totalEarned)),
        socialTasks: [
          {
            id: 'twitter_follow',
            name: 'Follow on Twitter',
            description: 'Follow @sdogcoin1 on Twitter',
            completed: userInfo.twitterFollowed,
            verifying: false,
            link: SOCIAL_LINKS.TWITTER
          },
          {
            id: 'twitter_retweet',
            name: 'Retweet Pinned Post',
            description: 'Retweet our pinned post',
            completed: userInfo.twitterRetweeted,
            verifying: false,
            link: SOCIAL_LINKS.TWITTER
          },
          {
            id: 'telegram_join',
            name: 'Join Telegram',
            description: 'Join our Telegram channel',
            completed: userInfo.telegramJoined,
            verifying: false,
            link: SOCIAL_LINKS.TELEGRAM
          }
        ]
      })
    } catch (error) {
      console.error('Error loading airdrop data:', error)
      toast.error('Failed to load airdrop data')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialTask = async (taskId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    const taskIndex = airdropData.socialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    // Update task to verifying state
    const updatedTasks = [...airdropData.socialTasks]
    updatedTasks[taskIndex].verifying = true
    setAirdropData({ ...airdropData, socialTasks: updatedTasks })

    try {
      // Open the social link
      const task = airdropData.socialTasks[taskIndex]
      window.open(task.link, '_blank')
      
      // In a production scenario, there would be a backend service verifying social tasks
      // For now, we'll simulate the verification delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, the backend would call this from a verifier address:
      // await contractHelpers.verifySocialTask(address, taskId, true, verifierSigner)
      
      // For demo purposes, simulate successful verification
      updatedTasks[taskIndex].completed = true
      updatedTasks[taskIndex].verifying = false
      
      setAirdropData({ 
        ...airdropData, 
        socialTasks: updatedTasks,
        canClaim: updatedTasks.every(task => task.completed)
      })

      toast.success(`${task.name} completed successfully!`)
    } catch (error) {
      console.error('Error verifying social task:', error)
      updatedTasks[taskIndex].verifying = false
      setAirdropData({ ...airdropData, socialTasks: updatedTasks })
      toast.error('Failed to verify social task')
    }
  }

  const handleClaimAirdrop = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!airdropData.canClaim) {
      toast.error('Please complete all social tasks first')
      return
    }

    setClaiming(true)

    try {
      // Call the actual contract to claim the airdrop
      // Pass null or empty string if no referrer
      const referrer = '0x0000000000000000000000000000000000000000' // No referrer
      const tx = await contractHelpers.claimAirdrop(referrer, walletClient)
      
      // Wait for transaction confirmation
      const receipt = await tx.wait()
      
      // Update the UI with actual claim data
      await loadAirdropData()
      
      // Save transaction data for success page
      const transactionData = {
        type: 'airdrop',
        amount: AIRDROP_CONFIG.COINS_PER_USER,
        txHash: receipt.transactionHash,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('lastTransaction', JSON.stringify(transactionData))

      toast.success('Airdrop claimed successfully!')
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/success'
      }, 2000)

    } catch (error) {
      console.error('Error claiming airdrop:', error)
      toast.error('Failed to claim airdrop')
    } finally {
      setClaiming(false)
    }
  }

  const generateReferralLink = () => {
    if (!address) return ''
    return `${window.location.origin}/airdrop?ref=${address}`
  }

  const copyReferralLink = () => {
    const link = generateReferralLink()
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied to clipboard!')
  }

  const allTasksCompleted = airdropData.socialTasks.every(task => task.completed)

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎁 BrainArk Airdrop
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Claim your free BAK tokens and earn referral bonuses. 
            Complete social tasks to become eligible.
          </p>
        </div>

        {/* Airdrop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-brainark-500 mb-2">
              {AIRDROP_CONFIG.COINS_PER_USER}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">BAK per User</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-brainark-500 mb-2">
              {AIRDROP_CONFIG.REFERRAL_BONUS}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">BAK per Referral</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-brainark-500 mb-2">
              {(AIRDROP_CONFIG.TOTAL_SUPPLY / 1_000_000).toFixed(0)}M
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Total Pool</p>
          </div>
        </div>

        {!isConnected ? (
          /* Connect Wallet */
          <AutoWalletConnection />
        ) : airdropData.hasClaimed ? (
          /* Already Claimed */
          <div className="space-y-8">
            <div className="card text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Airdrop Claimed Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You have successfully claimed {airdropData.totalEarned} BAK tokens
              </p>
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">
                  Your tokens will be distributed automatically once we reach 1 million participants
                </p>
              </div>
            </div>

            {/* Referral Section */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                <UserGroupIcon className="h-6 w-6 inline mr-2" />
                Earn More with Referrals
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Share your referral link and earn {AIRDROP_CONFIG.REFERRAL_BONUS} BAK for each successful referral
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={generateReferralLink()}
                  readOnly
                  className="input-primary flex-1"
                />
                <button
                  onClick={copyReferralLink}
                  className="btn-primary"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Referrals: {airdropData.referralCount} • 
                  Bonus Earned: {airdropData.referralCount * AIRDROP_CONFIG.REFERRAL_BONUS} BAK
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Claim Process */
          <div className="space-y-8">
            {/* Social Tasks */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Complete Social Tasks
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Complete all social tasks below to become eligible for the airdrop
              </p>
              
              <div className="space-y-4">
                {airdropData.socialTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      task.completed
                        ? 'border-green-500 bg-green-50 dark:bg-green-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {task.completed ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : task.verifying ? (
                          <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-gray-400" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {task.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      
                      {!task.completed && (
                        <button
                          onClick={() => handleSocialTask(task.id)}
                          disabled={task.verifying}
                          className="btn-primary"
                        >
                          {task.verifying ? 'Verifying...' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Code Input */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Referral Code (Optional)
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Enter a referral code to give your referrer a bonus
              </p>
              <input
                type="text"
                placeholder="Enter referral address or code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="input-primary"
              />
            </div>

            {/* Claim Button */}
            <div className="card text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Claim Your Airdrop
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {allTasksCompleted
                  ? 'All tasks completed! You can now claim your airdrop.'
                  : 'Complete all social tasks above to claim your airdrop.'
                }
              </p>
              
              <button
                onClick={handleClaimAirdrop}
                disabled={!allTasksCompleted || claiming}
                className={`btn-primary text-lg px-8 py-4 ${
                  !allTasksCompleted || claiming
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {claiming ? (
                  <>
                    <div className="spinner mr-2" />
                    Claiming...
                  </>
                ) : (
                  `Claim ${AIRDROP_CONFIG.COINS_PER_USER} BAK`
                )}
              </button>

              {!allTasksCompleted && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Complete {airdropData.socialTasks.filter(task => !task.completed).length} more task(s) to claim
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}