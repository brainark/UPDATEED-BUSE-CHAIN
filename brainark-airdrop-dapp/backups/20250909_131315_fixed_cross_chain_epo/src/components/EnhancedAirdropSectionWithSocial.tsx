import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, ShareIcon, LinkIcon } from '@heroicons/react/24/outline'
import { SOCIAL_LINKS, AIRDROP_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'

interface SocialTask {
  id: string
  name: string
  description: string
  instruction: string
  completed: boolean
  verifying: boolean
  link: string
  icon: string
  color: string
}

interface AirdropData {
  hasClaimed: boolean
  canClaim: boolean
  referralCount: number
  totalEarned: number
  socialTasks: SocialTask[]
  referralCode: string
}

export default function EnhancedAirdropSectionWithSocial() {
  const [address, setAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [airdropData, setAirdropData] = useState<AirdropData>({
    hasClaimed: false,
    canClaim: false,
    referralCount: 0,
    totalEarned: 0,
    referralCode: '',
    socialTasks: [
      {
        id: 'twitter_follow',
        name: 'Follow on X (Twitter)',
        description: 'Follow @sdogcoin1 on X (Twitter)',
        instruction: 'Click the link, follow the page and share the pinned post',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TWITTER,
        icon: '𝕏',
        color: 'bg-black hover:bg-gray-800'
      },
      {
        id: 'telegram_join',
        name: 'Join Telegram Channel',
        description: 'Join our official Telegram channel',
        instruction: 'Join our telegram channel',
        completed: false,
        verifying: false,
        link: SOCIAL_LINKS.TELEGRAM,
        icon: '📱',
        color: 'bg-blue-500 hover:bg-blue-600'
      }
    ]
  })
  const [showReferralCode, setShowReferralCode] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadAirdropData()
      generateReferralCode()
    }
  }, [isConnected, address])

  const loadAirdropData = async () => {
    try {
      // In a real implementation, this would fetch from the smart contract
      const mockData = {
        hasClaimed: false,
        canClaim: false,
        referralCount: 0,
        totalEarned: 0,
        referralCode: '',
        socialTasks: airdropData.socialTasks
      }
      
      setAirdropData(mockData)
    } catch (error) {
      console.error('Error loading airdrop data:', error)
      toast.error('Failed to load airdrop data')
    }
  }

  const generateReferralCode = () => {
    if (!address) return
    
    // Generate a unique referral code based on wallet address
    const referralCode = `BAK${address.slice(2, 8).toUpperCase()}`
    setAirdropData(prev => ({ ...prev, referralCode }))
  }

  const handleSocialTask = async (taskId: string) => {
    const taskIndex = airdropData.socialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    const task = airdropData.socialTasks[taskIndex]

    // Open the social link first
    window.open(task.link, '_blank')

    // Start verification process after a short delay
    setTimeout(() => {
      verifyTask(taskId)
    }, 2000)
  }

  const verifyTask = async (taskId: string) => {
    const taskIndex = airdropData.socialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    // Update task to verifying state
    const updatedTasks = [...airdropData.socialTasks]
    updatedTasks[taskIndex].verifying = true
    setAirdropData({ ...airdropData, socialTasks: updatedTasks })

    try {
      // Simulate verification process (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Mock verification result (80% success rate for demo)
      const verified = Math.random() > 0.2

      updatedTasks[taskIndex].completed = verified
      updatedTasks[taskIndex].verifying = false
      
      // Check if all tasks are completed
      const allCompleted = updatedTasks.every(task => task.completed)
      
      setAirdropData({ 
        ...airdropData, 
        socialTasks: updatedTasks,
        canClaim: allCompleted
      })

      if (verified) {
        toast.success(`${updatedTasks[taskIndex].name} verified successfully! ✅`)
        
        // Show referral code after completing tasks
        if (allCompleted) {
          setShowReferralCode(true)
          toast.success('🎉 All tasks completed! Your referral code is ready!')
        }
      } else {
        toast.error(`Verification failed for ${updatedTasks[taskIndex].name}. Please try again.`)
      }
    } catch (error) {
      console.error('Error verifying social task:', error)
      updatedTasks[taskIndex].verifying = false
      setAirdropData({ ...airdropData, socialTasks: updatedTasks })
      toast.error('Verification failed. Please try again.')
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
      // Simulate claiming process
      await new Promise(resolve => setTimeout(resolve, 3000))

      setAirdropData({
        ...airdropData,
        hasClaimed: true,
        totalEarned: AIRDROP_CONFIG.COINS_PER_USER
      })

      toast.success('🎉 Airdrop claimed successfully!')
      
    } catch (error) {
      console.error('Error claiming airdrop:', error)
      toast.error('Failed to claim airdrop')
    } finally {
      setClaiming(false)
    }
  }

  const generateReferralLink = () => {
    if (!airdropData.referralCode) return ''
    return `${window.location.origin}?ref=${airdropData.referralCode}`
  }

  const copyReferralLink = () => {
    const link = generateReferralLink()
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied to clipboard! 📋')
  }

  const shareOnSocial = (platform: string) => {
    const link = generateReferralLink()
    const text = `Join me on BrainArk and get free BAK tokens! 🎁 Use my referral code: ${airdropData.referralCode}`
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank')
      toast.success(`Sharing on ${platform}! 🚀`)
    }
  }

  const allTasksCompleted = airdropData.socialTasks.every(task => task.completed)

  // Handle wallet connection changes
  const handleConnectionChange = (connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
    setIsCorrectNetwork(correctNetwork || false)
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
            Complete social tasks, get verified, and claim your free BAK tokens. 
            Share your referral code to earn even more!
          </p>
        </div>

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
            <AutoWalletConnection onConnectionChange={handleConnectionChange} />
          </div>
        ) : airdropData.hasClaimed ? (
          /* Already Claimed */
          <div className="space-y-8">
            <div className="card-brilliant text-center p-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Airdrop Claimed Successfully!
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
                Share your referral code and earn {AIRDROP_CONFIG.REFERRAL_BONUS} BAK for each successful referral
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                  <p className="text-2xl font-bold text-blue-600 mb-3">{airdropData.referralCode}</p>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="text"
                      value={generateReferralLink()}
                      readOnly
                      className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="btn-success px-4 py-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  𝕏 Share
                </button>
                <button
                  onClick={() => shareOnSocial('telegram')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  📱 Share
                </button>
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  📘 Share
                </button>
              </div>

              <div className="text-center">
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
                Follow the instructions below to complete each social task and get verified
              </p>
              
              <div className="space-y-6">
                {airdropData.socialTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                      task.completed
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : task.verifying
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          task.completed ? 'bg-green-500 text-white' : 
                          task.verifying ? 'bg-yellow-500 text-white' : 
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {task.completed ? '✅' : task.verifying ? '⏳' : task.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {task.name}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {task.description}
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <strong>Instructions:</strong> {task.instruction}
                            </p>
                          </div>
                          
                          {task.completed && (
                            <div className="mt-3 flex items-center text-green-600">
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              <span className="font-medium">Verified Successfully!</span>
                            </div>
                          )}
                          
                          {task.verifying && (
                            <div className="mt-3 flex items-center text-yellow-600">
                              <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                              <span className="font-medium">Verifying your completion...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!task.completed && (
                        <button
                          onClick={() => handleSocialTask(task.id)}
                          disabled={task.verifying}
                          className={`${task.color} text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                        >
                          {task.verifying ? (
                            <>
                              <ClockIcon className="h-4 w-4 inline mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              {task.icon} Complete Task
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Code Display (shown after completing tasks) */}
            {showReferralCode && allTasksCompleted && (
              <div className="card-brilliant p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎉 Your Personal Referral Code
                </h3>
                <p className="text-gray-600 mb-4">
                  Congratulations! You've completed all tasks. Here's your personal referral code to share:
                </p>
                
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                  <p className="text-3xl font-bold text-purple-600 mb-4">{airdropData.referralCode}</p>
                  
                  <div className="flex gap-2 justify-center mb-4">
                    <input
                      type="text"
                      value={generateReferralLink()}
                      readOnly
                      className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="btn-success px-4 py-2"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => shareOnSocial('twitter')}
                      className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <ShareIcon className="h-4 w-4" />
                      Share on 𝕏
                    </button>
                    <button
                      onClick={() => shareOnSocial('telegram')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <ShareIcon className="h-4 w-4" />
                      Share on Telegram
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Button */}
            <div className="card-brilliant text-center p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Claim Your Airdrop
              </h2>
              <p className="text-gray-600 mb-6">
                {allTasksCompleted
                  ? '🎉 All tasks completed! You can now claim your airdrop.'
                  : `Complete ${airdropData.socialTasks.filter(task => !task.completed).length} more task(s) to claim your airdrop.`
                }
              </p>
              
              <button
                onClick={handleClaimAirdrop}
                disabled={!allTasksCompleted || claiming}
                className={`btn-airdrop text-lg px-8 py-4 ${
                  !allTasksCompleted || claiming
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 transform transition-all duration-200'
                }`}
              >
                {claiming ? (
                  <>
                    <ClockIcon className="h-5 w-5 inline mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  `🎁 Claim ${AIRDROP_CONFIG.COINS_PER_USER} BAK`
                )}
              </button>

              {!allTasksCompleted && (
                <div className="mt-4 flex justify-center">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Complete all social tasks above to unlock the claim button
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}