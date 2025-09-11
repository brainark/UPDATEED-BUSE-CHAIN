import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, ShareIcon, LinkIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { SOCIAL_LINKS, AIRDROP_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'
import { useAppwrite } from '@/hooks/useAppwrite'
import { AirdropShaderBackground } from './shaders'

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

interface AirdropStats {
  totalParticipants: number
  targetParticipants: number
  progressPercentage: number
  isTargetReached: boolean
  distributionStarted: boolean
  distributionProgress: number
  currentBatch: number
  totalBatches: number
  nextBatchTime?: string
}

export default function AutoDistributionAirdropWithAppwrite() {
  const [address, setAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  
  // Appwrite integration
  const {
    user,
    airdropRegistration,
    socialTasks: dbSocialTasks,
    referrals,
    loading: appwriteLoading,
    error: appwriteError,
    createUser,
    registerForAirdrop,
    completeSocialTask,
    getAirdropStats
  } = useAppwrite(address)

  const [localSocialTasks, setLocalSocialTasks] = useState<SocialTask[]>([
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
  ])

  const [airdropStats, setAirdropStats] = useState<AirdropStats>({
    totalParticipants: 0,
    targetParticipants: 1000000,
    progressPercentage: 0,
    isTargetReached: false,
    distributionStarted: false,
    distributionProgress: 0,
    currentBatch: 0,
    totalBatches: 24
  })

  const [showReferralCode, setShowReferralCode] = useState(false)
  const [registering, setRegistering] = useState(false)

  // Sync local social tasks with database
  useEffect(() => {
    if (dbSocialTasks.length > 0) {
      setLocalSocialTasks(prev => prev.map(localTask => {
        const dbTask = dbSocialTasks.find(db => db.taskId === localTask.id)
        return {
          ...localTask,
          completed: dbTask?.completed || false
        }
      }))
    }
  }, [dbSocialTasks])

  // Load stats when connected
  useEffect(() => {
    if (isConnected) {
      loadAirdropStats()
      const interval = setInterval(loadAirdropStats, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isConnected])

  // Create user when wallet connects
  useEffect(() => {
    if (isConnected && address && !user) {
      createUser(address)
    }
  }, [isConnected, address, user, createUser])

  const loadAirdropStats = async () => {
    try {
      const stats = await getAirdropStats()
      const progressPercentage = (stats.totalParticipants / airdropStats.targetParticipants) * 100
      const isTargetReached = stats.totalParticipants >= airdropStats.targetParticipants

      setAirdropStats(prev => ({
        ...prev,
        totalParticipants: stats.totalParticipants,
        progressPercentage,
        isTargetReached,
        distributionStarted: isTargetReached,
        currentBatch: stats.currentBatch,
        distributionProgress: isTargetReached ? (stats.currentBatch / prev.totalBatches) * 100 : 0
      }))
    } catch (error) {
      console.error('Error loading airdrop stats:', error)
    }
  }

  const handleSocialTask = async (taskId: string) => {
    const taskIndex = localSocialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    const task = localSocialTasks[taskIndex]

    // Open the social link first
    window.open(task.link, '_blank')

    // Start verification process after a short delay
    setTimeout(() => {
      verifyTask(taskId)
    }, 2000)
  }

  const verifyTask = async (taskId: string) => {
    const taskIndex = localSocialTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) return

    // Update task to verifying state
    const updatedTasks = [...localSocialTasks]
    updatedTasks[taskIndex].verifying = true
    setLocalSocialTasks(updatedTasks)

    try {
      // Simulate verification process (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Mock verification result (80% success rate for demo)
      const verified = Math.random() > 0.2

      if (verified) {
        // Update in database
        const platform = taskId === 'twitter_follow' ? 'Twitter' : 'Telegram'
        const success = await completeSocialTask(taskId, platform)
        
        if (success) {
          updatedTasks[taskIndex].completed = true
          updatedTasks[taskIndex].verifying = false
          setLocalSocialTasks(updatedTasks)

          // Check if all tasks are completed
          const allCompleted = updatedTasks.every(task => task.completed)
          if (allCompleted) {
            setShowReferralCode(true)
            toast.success('🎉 All tasks completed! You can now register for the airdrop!')
          }
        } else {
          updatedTasks[taskIndex].verifying = false
          setLocalSocialTasks(updatedTasks)
        }
      } else {
        updatedTasks[taskIndex].verifying = false
        setLocalSocialTasks(updatedTasks)
        toast.error(`Verification failed for ${updatedTasks[taskIndex].name}. Please try again.`)
      }
    } catch (error) {
      console.error('Error verifying social task:', error)
      updatedTasks[taskIndex].verifying = false
      setLocalSocialTasks(updatedTasks)
      toast.error('Verification failed. Please try again.')
    }
  }

  const handleRegisterForAirdrop = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    const allTasksCompleted = localSocialTasks.every(task => task.completed)
    if (!allTasksCompleted) {
      toast.error('Please complete all social tasks first')
      return
    }

    setRegistering(true)

    try {
      // Get referral code from URL if present
      const urlParams = new URLSearchParams(window.location.search)
      const referralCode = urlParams.get('ref')

      const success = await registerForAirdrop(referralCode || undefined)
      
      if (success) {
        // Reload stats after registration
        await loadAirdropStats()
      }
    } catch (error) {
      console.error('Error registering for airdrop:', error)
      toast.error('Failed to register for airdrop')
    } finally {
      setRegistering(false)
    }
  }

  const generateReferralLink = () => {
    if (!user?.referralCode) return ''
    return `${window.location.origin}?ref=${user.referralCode}`
  }

  const copyReferralLink = () => {
    const link = generateReferralLink()
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied to clipboard! 📋')
  }

  const shareOnSocial = (platform: string) => {
    const link = generateReferralLink()
    const text = `Join me on BrainArk and get free BAK tokens! 🎁 Use my referral code: ${user?.referralCode}`
    
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

  const allTasksCompleted = localSocialTasks.every(task => task.completed)

  // Handle wallet connection changes
  const handleConnectionChange = (connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
    setIsCorrectNetwork(correctNetwork || false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNextBatchTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins <= 0) return 'Starting now...'
    if (diffMins < 60) return `${diffMins} minutes`
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  // Show loading state
  if (appwriteLoading && isConnected) {
    return (
      <section className="min-h-screen bg-deep-black py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white">Loading your airdrop data...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-deep-black py-12 relative">
      {/* Shader Background */}
      <AirdropShaderBackground />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
            🎁 BrainArk Airdrop
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete social tasks, get verified, and register for automatic token distribution. 
            Powered by Appwrite Cloud for secure data storage!
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="card-brilliant p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2" />
            Airdrop Progress
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Participants</span>
              <span className="font-bold text-gray-900">
                {airdropStats.totalParticipants.toLocaleString()} / {airdropStats.targetParticipants.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(airdropStats.progressPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{airdropStats.progressPercentage.toFixed(2)}% Complete</span>
              <span className="text-gray-600">
                {(airdropStats.targetParticipants - airdropStats.totalParticipants).toLocaleString()} remaining
              </span>
            </div>

            {airdropStats.isTargetReached && airdropStats.distributionStarted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <div>
                    <p className="font-bold text-blue-800">🚀 Distribution In Progress</p>
                    <p className="text-blue-700 text-sm">
                      Spreading across 24 hours to prevent network congestion
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600">Distribution Progress</span>
                    <span className="text-blue-800 font-medium">
                      Batch {airdropStats.currentBatch + 1} of {airdropStats.totalBatches}
                    </span>
                  </div>
                  
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${airdropStats.distributionProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>{airdropStats.distributionProgress.toFixed(1)}% distributed</span>
                    {airdropStats.nextBatchTime && (
                      <span>Next batch: {formatNextBatchTime(airdropStats.nextBatchTime)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Airdrop Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="card-brilliant text-center p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-red-500 mb-2">
              {AIRDROP_CONFIG.COINS_PER_USER}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">BAK per User</p>
          </div>
          <div className="card-brilliant text-center p-4 sm:p-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-red-500 mb-2">
              {AIRDROP_CONFIG.REFERRAL_BONUS}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">BAK per Referral</p>
          </div>
          <div className="card-brilliant text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-red-500 mb-2">
              {referrals.length}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">Your Referrals</p>
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
        ) : airdropRegistration ? (
          /* Already Registered */
          <div className="space-y-8">
            <div className="card-brilliant text-center p-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Successfully Registered!
              </h2>
              <p className="text-gray-600 mb-6">
                You are registered to receive {airdropRegistration.tokensEarned} BAK tokens
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium text-blue-800">Distribution Schedule</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Registered: {formatDate(airdropRegistration.registrationDate)}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  <strong>Your Batch:</strong> {airdropRegistration.distributionBatch} of 24
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  <strong>Status:</strong> {airdropRegistration.status}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Tokens will be automatically sent to your wallet address: 
                  <span className="font-mono text-xs block mt-1">{address}</span>
                </p>
              </div>
            </div>

            {/* Referral Section */}
            <div className="card-brilliant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <UserGroupIcon className="h-6 w-6 inline mr-2" />
                Earn More with Referrals ({referrals.length} referrals)
              </h3>
              <p className="text-gray-600 mb-4">
                Share your referral code and earn {AIRDROP_CONFIG.REFERRAL_BONUS} BAK for each successful referral
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                  <p className="text-2xl font-bold text-blue-600 mb-3">{user?.referralCode}</p>
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
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Total Earned: {user?.totalEarned || 0} BAK
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Process */
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
                {localSocialTasks.map((task) => (
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
            {showReferralCode && allTasksCompleted && user && (
              <div className="card-brilliant p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎉 Your Personal Referral Code
                </h3>
                <p className="text-gray-600 mb-4">
                  Congratulations! You've completed all tasks. Here's your personal referral code to share:
                </p>
                
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                  <p className="text-3xl font-bold text-purple-600 mb-4">{user.referralCode}</p>
                  
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

            {/* Register Button */}
            <div className="card-brilliant text-center p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Register for Automatic Distribution
              </h2>
              <p className="text-gray-600 mb-6">
                {allTasksCompleted
                  ? '🎉 All tasks completed! Register now for automatic token distribution.'
                  : `Complete ${localSocialTasks.filter(task => !task.completed).length} more task(s) to register for the airdrop.`
                }
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-blue-800 mb-2">📅 Distribution Schedule</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tokens will be automatically distributed to your wallet</li>
                  <li>• Distribution begins when we reach 1 million participants</li>
                  <li>• Distribution is spread across 24 hours (24 batches)</li>
                  <li>• You'll receive {AIRDROP_CONFIG.COINS_PER_USER} BAK + referral bonuses</li>
                  <li>• Data securely stored with Appwrite Cloud</li>
                </ul>
              </div>
              
              <button
                onClick={handleRegisterForAirdrop}
                disabled={!allTasksCompleted || registering || appwriteLoading}
                className={`btn-airdrop text-lg px-8 py-4 ${
                  !allTasksCompleted || registering || appwriteLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 transform transition-all duration-200'
                }`}
              >
                {registering || appwriteLoading ? (
                  <>
                    <ClockIcon className="h-5 w-5 inline mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  `📝 Register for ${AIRDROP_CONFIG.COINS_PER_USER} BAK`
                )}
              </button>

              {!allTasksCompleted && (
                <div className="mt-4 flex justify-center">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Complete all social tasks above to register for automatic distribution
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appwrite Error Display */}
        {appwriteError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Database Error:</strong> {appwriteError}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}