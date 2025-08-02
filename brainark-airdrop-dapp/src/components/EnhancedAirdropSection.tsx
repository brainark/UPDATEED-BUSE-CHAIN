import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SOCIAL_LINKS, AIRDROP_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'

interface SocialTask {
  id: string
  name: string
  description: string
  completed: boolean
  verifying: boolean
  link: string
  apiEndpoint?: string
  requiredActions?: string[]
}

interface AirdropData {
  hasClaimed: boolean
  canClaim: boolean
  referralCount: number
  totalEarned: number
  socialTasks: SocialTask[]
}

interface SocialVerificationModal {
  isOpen: boolean
  taskId: string
  taskName: string
}

export default function EnhancedAirdropSection() {
  const { address, isConnected } = useAccount()
  const [airdropData, setAirdropData] = useState<AirdropData>({
    hasClaimed: false,
    canClaim: false,
    referralCount: 0,
    totalEarned: 0,
    socialTasks: [
      {
        id: 'twitter_follow',
        name: 'Follow on X (Twitter)',
        description: 'Follow @sdogcoin1 on X (Twitter)',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TWITTER,
        apiEndpoint: '/api/verify-twitter-follow',
        requiredActions: ['follow']
      },
      {
        id: 'twitter_retweet',
        name: 'Retweet Pinned Post',
        description: 'Retweet and like our pinned post',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TWITTER,
        apiEndpoint: '/api/verify-twitter-engagement',
        requiredActions: ['like', 'retweet']
      },
      {
        id: 'telegram_join',
        name: 'Join Telegram',
        description: 'Join our Telegram channel',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TELEGRAM,
        apiEndpoint: '/api/verify-telegram-membership',
        requiredActions: ['join']
      }
    ]
  })
  const [referralCode, setReferralCode] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [verificationModal, setVerificationModal] = useState<SocialVerificationModal>({
    isOpen: false,
    taskId: '',
    taskName: ''
  })
  const [userSocialHandles, setUserSocialHandles] = useState({
    twitter: '',
    telegram: ''
  })
  const [apiStatus, setApiStatus] = useState({
    twitter: false,
    telegram: false,
    backend: false
  })

  useEffect(() => {
    if (isConnected && address) {
      loadAirdropData()
      checkApiStatus()
    }
  }, [isConnected, address])

  const checkApiStatus = async () => {
    // Check if social media APIs are configured
    try {
      // Check Twitter API
      const twitterResponse = await fetch('/api/check-twitter-api')
      const twitterStatus = twitterResponse.ok

      // Check Telegram API
      const telegramResponse = await fetch('/api/check-telegram-api')
      const telegramStatus = telegramResponse.ok

      // Check backend API
      const backendResponse = await fetch('/api/health')
      const backendStatus = backendResponse.ok

      setApiStatus({
        twitter: twitterStatus,
        telegram: telegramStatus,
        backend: backendStatus
      })

      if (!twitterStatus || !telegramStatus || !backendStatus) {
        toast.error('Some social media verification APIs are not configured. Using mock verification.')
      }
    } catch (error) {
      console.error('Error checking API status:', error)
      setApiStatus({ twitter: false, telegram: false, backend: false })
    }
  }

  const loadAirdropData = async () => {
    try {
      // In a real implementation, this would fetch from the smart contract
      const mockData = {
        hasClaimed: false,
        canClaim: false,
        referralCount: 0,
        totalEarned: 0,
        socialTasks: airdropData.socialTasks
      }
      
      setAirdropData(mockData)
    } catch (error) {
      console.error('Error loading airdrop data:', error)
      toast.error('Failed to load airdrop data')
    }
  }

  // Real API verification function
  const verifyTaskWithAPI = async (taskId: string, userHandle: string): Promise<boolean> => {
    const task = airdropData.socialTasks.find(t => t.id === taskId)
    if (!task || !task.apiEndpoint) return false

    try {
      const response = await fetch(task.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userHandle,
          walletAddress: address,
          requiredActions: task.requiredActions
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.verified === true
    } catch (error) {
      console.error(`Error verifying ${taskId}:`, error)
      return false
    }
  }

  // Mock verification function (fallback)
  const verifyTaskMock = async (taskId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock verification logic
    const mockResults = {
      twitter_follow: Math.random() > 0.3, // 70% success rate
      twitter_retweet: Math.random() > 0.4, // 60% success rate
      telegram_join: Math.random() > 0.2 // 80% success rate
    }
    
    return mockResults[taskId as keyof typeof mockResults] || false
  }

  const handleSocialTask = async (taskId: string) => {
    const task = airdropData.socialTasks.find(t => t.id === taskId)
    if (!task) return

    // Open the social link first
    window.open(task.link, '_blank')

    // Show verification modal
    setVerificationModal({
      isOpen: true,
      taskId,
      taskName: task.name
    })
  }

  const handleVerification = async () => {
    const { taskId } = verificationModal
    const taskIndex = airdropData.socialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    // Update task to verifying state
    const updatedTasks = [...airdropData.socialTasks]
    updatedTasks[taskIndex].verifying = true
    setAirdropData({ ...airdropData, socialTasks: updatedTasks })

    // Close modal
    setVerificationModal({ isOpen: false, taskId: '', taskName: '' })

    try {
      let verified = false

      // Determine which handle to use
      const userHandle = taskId.includes('twitter') ? userSocialHandles.twitter : userSocialHandles.telegram

      if (!userHandle) {
        throw new Error('Please provide your social media handle')
      }

      // Try real API first, fallback to mock
      if (apiStatus.backend && (apiStatus.twitter || apiStatus.telegram)) {
        verified = await verifyTaskWithAPI(taskId, userHandle)
      } else {
        verified = await verifyTaskMock(taskId)
      }

      updatedTasks[taskIndex].completed = verified
      updatedTasks[taskIndex].verifying = false
      
      setAirdropData({ 
        ...airdropData, 
        socialTasks: updatedTasks,
        canClaim: updatedTasks.every(task => task.completed)
      })

      if (verified) {
        toast.success(`${updatedTasks[taskIndex].name} verified successfully!`)
      } else {
        toast.error(`Failed to verify ${updatedTasks[taskIndex].name}. Please ensure you completed all required actions.`)
      }
    } catch (error) {
      console.error('Error verifying social task:', error)
      updatedTasks[taskIndex].verifying = false
      setAirdropData({ ...airdropData, socialTasks: updatedTasks })
      toast.error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      // In a real implementation, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 3000))

      setAirdropData({
        ...airdropData,
        hasClaimed: true,
        totalEarned: AIRDROP_CONFIG.COINS_PER_USER
      })

      const transactionData = {
        type: 'airdrop',
        amount: AIRDROP_CONFIG.COINS_PER_USER,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('lastTransaction', JSON.stringify(transactionData))

      toast.success('Airdrop claimed successfully!')
      
    } catch (error) {
      console.error('Error claiming airdrop:', error)
      toast.error('Failed to claim airdrop')
    } finally {
      setClaiming(false)
    }
  }

  const generateReferralLink = () => {
    if (!address) return ''
    return `${window.location.origin}?ref=${address}`
  }

  const copyReferralLink = () => {
    const link = generateReferralLink()
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied to clipboard!')
  }

  const allTasksCompleted = airdropData.socialTasks.every(task => task.completed)

  // API Status Warning Component
  const APIStatusWarning = () => {
    const hasApiIssues = !apiStatus.twitter || !apiStatus.telegram || !apiStatus.backend

    if (!hasApiIssues) return null

    return (
      <div className="card-brilliant p-4 mb-6 border-l-4 border-yellow-500">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Social Media API Status</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              <div>Twitter API: {apiStatus.twitter ? '✅ Connected' : '❌ Not configured'}</div>
              <div>Telegram API: {apiStatus.telegram ? '✅ Connected' : '❌ Not configured'}</div>
              <div>Backend API: {apiStatus.backend ? '✅ Connected' : '❌ Not configured'}</div>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              {hasApiIssues && 'Some APIs are not configured. Using mock verification for demonstration.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Social Verification Modal
  const SocialVerificationModal = () => {
    if (!verificationModal.isOpen) return null

    const isTwitterTask = verificationModal.taskId.includes('twitter')

    return (
      <div className="modal-overlay">
        <div className="modal-content p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Verify {verificationModal.taskName}
            </h3>
            <button
              onClick={() => setVerificationModal({ isOpen: false, taskId: '', taskName: '' })}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide your {isTwitterTask ? 'Twitter' : 'Telegram'} handle to verify completion:
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isTwitterTask ? 'Twitter Handle' : 'Telegram Username'}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                  @
                </span>
                <input
                  type="text"
                  value={isTwitterTask ? userSocialHandles.twitter : userSocialHandles.telegram}
                  onChange={(e) => setUserSocialHandles(prev => ({
                    ...prev,
                    [isTwitterTask ? 'twitter' : 'telegram']: e.target.value
                  }))}
                  placeholder={isTwitterTask ? 'your_twitter_handle' : 'your_telegram_username'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Required actions:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                {verificationModal.taskId === 'twitter_follow' && (
                  <li>Follow @sdogcoin1 on Twitter</li>
                )}
                {verificationModal.taskId === 'twitter_retweet' && (
                  <>
                    <li>Like the pinned post</li>
                    <li>Retweet the pinned post</li>
                  </>
                )}
                {verificationModal.taskId === 'telegram_join' && (
                  <li>Join the BrainArk Telegram channel</li>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setVerificationModal({ isOpen: false, taskId: '', taskName: '' })}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                disabled={!(isTwitterTask ? userSocialHandles.twitter : userSocialHandles.telegram)}
                className="flex-1 btn-success"
              >
                Verify Completion
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-deep-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
            🎁 BrainArk Airdrop
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Claim your free BAK tokens and earn referral bonuses. 
            Complete social tasks to become eligible.
          </p>
        </div>

        {/* API Status Warning */}
        <APIStatusWarning />

        {/* Airdrop Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-brilliant text-center p-6">
            <h3 className="text-3xl font-bold text-red-500 mb-2">
              {AIRDROP_CONFIG.COINS_PER_USER}
            </h3>
            <p className="text-gray-600">BAK per User</p>
          </div>
          <div className="card-brilliant text-center p-6">
            <h3 className="text-3xl font-bold text-red-500 mb-2">
              {AIRDROP_CONFIG.REFERRAL_BONUS}
            </h3>
            <p className="text-gray-600">BAK per Referral</p>
          </div>
          <div className="card-brilliant text-center p-6">
            <h3 className="text-3xl font-bold text-red-500 mb-2">
              {(AIRDROP_CONFIG.TOTAL_SUPPLY / 1_000_000).toFixed(0)}M
            </h3>
            <p className="text-gray-600">Total Pool</p>
          </div>
        </div>

        {!isConnected ? (
          /* Connect Wallet */
          <div className="card-brilliant text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to participate in the BrainArk airdrop
            </p>
            <AutoWalletConnection />
          </div>
        ) : airdropData.hasClaimed ? (
          /* Already Claimed */
          <div className="space-y-8">
            <div className="card-brilliant text-center p-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Airdrop Claimed Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                You have successfully claimed {airdropData.totalEarned} BAK tokens
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800">
                  Your tokens will be distributed automatically once we reach 1 million participants
                </p>
              </div>
            </div>

            {/* Referral Section */}
            <div className="card-brilliant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <UserGroupIcon className="h-6 w-6 inline mr-2" />
                Earn More with Referrals
              </h3>
              <p className="text-gray-600 mb-4">
                Share your referral link and earn {AIRDROP_CONFIG.REFERRAL_BONUS} BAK for each successful referral
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={generateReferralLink()}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyReferralLink}
                  className="btn-success"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
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
            <div className="card-brilliant p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Social Tasks
              </h2>
              <p className="text-gray-600 mb-6">
                Complete all social tasks below to become eligible for the airdrop
              </p>
              
              <div className="space-y-4">
                {airdropData.socialTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      task.completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
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
                          <h3 className="font-semibold text-gray-900">
                            {task.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      
                      {!task.completed && (
                        <button
                          onClick={() => handleSocialTask(task.id)}
                          disabled={task.verifying}
                          className={task.id.includes('twitter') ? 'btn-twitter' : 'btn-telegram'}
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
            <div className="card-brilliant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Referral Code (Optional)
              </h3>
              <p className="text-gray-600 mb-4">
                Enter a referral code to give your referrer a bonus
              </p>
              <input
                type="text"
                placeholder="Enter referral address or code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Claim Button */}
            <div className="card-brilliant text-center p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Claim Your Airdrop
              </h2>
              <p className="text-gray-600 mb-6">
                {allTasksCompleted
                  ? 'All tasks completed! You can now claim your airdrop.'
                  : 'Complete all social tasks above to claim your airdrop.'
                }
              </p>
              
              <button
                onClick={handleClaimAirdrop}
                disabled={!allTasksCompleted || claiming}
                className={`btn-airdrop text-lg px-8 py-4 ${
                  !allTasksCompleted || claiming
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {claiming ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Claiming...
                  </>
                ) : (
                  `Claim ${AIRDROP_CONFIG.COINS_PER_USER} BAK`
                )}
              </button>

              {!allTasksCompleted && (
                <p className="text-sm text-gray-500 mt-4">
                  Complete {airdropData.socialTasks.filter(task => !task.completed).length} more task(s) to claim
                </p>
              )}
            </div>
          </div>
        )}

        {/* Social Verification Modal */}
        <SocialVerificationModal />
      </div>
    </section>
  )
}