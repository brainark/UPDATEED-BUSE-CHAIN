import { useState, useEffect, useCallback } from 'react'
import AppwriteService, { User, AirdropRegistration, SocialTask, Referral } from '@/lib/appwrite'
import { toast } from 'react-hot-toast'

export interface UseAppwriteReturn {
  user: User | null
  airdropRegistration: AirdropRegistration | null
  socialTasks: SocialTask[]
  referrals: Referral[]
  loading: boolean
  error: string | null
  
  // User operations
  createUser: (walletAddress: string) => Promise<User | null>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  
  // Airdrop operations
  registerForAirdrop: (referralCode?: string) => Promise<boolean>
  
  // Social task operations
  completeSocialTask: (taskId: string, platform: string) => Promise<boolean>
  
  // Referral operations
  processReferral: (refereeWalletAddress: string) => Promise<boolean>
  
  // Stats
  getAirdropStats: () => Promise<{
    totalParticipants: number
    totalDistributed: number
    currentBatch: number
  }>
}

export function useAppwrite(walletAddress?: string): UseAppwriteReturn {
  const [user, setUser] = useState<User | null>(null)
  const [airdropRegistration, setAirdropRegistration] = useState<AirdropRegistration | null>(null)
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user data when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadUserData(walletAddress)
    } else {
      // Clear data when wallet disconnected
      setUser(null)
      setAirdropRegistration(null)
      setSocialTasks([])
      setReferrals([])
    }
  }, [walletAddress])

  const loadUserData = async (address: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Load user
      const userData = await AppwriteService.getUserByWallet(address)
      setUser(userData)

      if (userData) {
        // Load related data
        const [registration, tasks, userReferrals] = await Promise.all([
          AppwriteService.getAirdropRegistration(address),
          AppwriteService.getUserSocialTasks(userData.$id!),
          AppwriteService.getUserReferrals(userData.$id!)
        ])

        setAirdropRegistration(registration)
        setSocialTasks(tasks)
        setReferrals(userReferrals)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const createUser = useCallback(async (address: string): Promise<User | null> => {
    setLoading(true)
    setError(null)

    try {
      // Check if user already exists
      const existingUser = await AppwriteService.getUserByWallet(address)
      if (existingUser) {
        setUser(existingUser)
        return existingUser
      }

      // Create new user
      const referralCode = AppwriteService.generateReferralCode(address)
      const newUser = await AppwriteService.createUser({
        walletAddress: address,
        referralCode,
        totalEarned: 0,
        registrationDate: new Date().toISOString(),
        distributionStatus: 'pending'
      })

      setUser(newUser)
      toast.success('User profile created successfully!')
      return newUser
    } catch (err) {
      console.error('Error creating user:', err)
      setError('Failed to create user profile')
      toast.error('Failed to create user profile')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    if (!user?.$id) return false

    setLoading(true)
    setError(null)

    try {
      const updatedUser = await AppwriteService.updateUser(user.$id, userData)
      setUser(updatedUser)
      return true
    } catch (err) {
      console.error('Error updating user:', err)
      setError('Failed to update user')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const registerForAirdrop = useCallback(async (referralCode?: string): Promise<boolean> => {
    if (!user || !walletAddress) return false

    setLoading(true)
    setError(null)

    try {
      // Check if already registered
      const existingRegistration = await AppwriteService.getAirdropRegistration(walletAddress)
      if (existingRegistration) {
        toast('Already registered for airdrop')
        return true
      }

      // Get current stats to calculate batch
      const stats = await AppwriteService.getAirdropStats()
      const distributionBatch = AppwriteService.calculateDistributionBatch(stats.totalParticipants + 1)

      // Create registration
      const registration = await AppwriteService.createAirdropRegistration({
        userId: user.$id!,
        walletAddress,
        referralCode: user.referralCode,
        referredBy: referralCode,
        socialTasksCompleted: socialTasks.every(task => task.completed),
        registrationDate: new Date().toISOString(),
        distributionBatch,
        tokensEarned: 10, // Base airdrop amount
        status: 'pending'
      })

      setAirdropRegistration(registration)

      // Process referral if provided
      if (referralCode && referralCode !== user.referralCode) {
        await processReferral(walletAddress, referralCode)
      }

      // Update user with distribution info
      await updateUser({
        distributionBatch,
        distributionStatus: 'pending',
        estimatedDistributionTime: `${distributionBatch}h after distribution starts`
      })

      toast.success('Successfully registered for airdrop!')
      return true
    } catch (err) {
      console.error('Error registering for airdrop:', err)
      setError('Failed to register for airdrop')
      toast.error('Failed to register for airdrop')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, walletAddress, socialTasks, updateUser])

  const completeSocialTask = useCallback(async (taskId: string, platform: string): Promise<boolean> => {
    if (!user?.$id) return false

    setLoading(true)
    setError(null)

    try {
      // Check if task already exists
      const existingTask = socialTasks.find(task => task.taskId === taskId)
      
      if (existingTask) {
        // Update existing task
        const updatedTask = await AppwriteService.updateSocialTask(existingTask.$id!, {
          completed: true,
          verifiedAt: new Date().toISOString()
        })
        
        setSocialTasks(prev => prev.map(task => 
          task.$id === updatedTask.$id ? updatedTask : task
        ))
      } else {
        // Create new task
        const newTask = await AppwriteService.createSocialTask({
          userId: user.$id,
          taskId,
          taskName: `${platform} Task`,
          completed: true,
          verifiedAt: new Date().toISOString(),
          platform
        })
        
        setSocialTasks(prev => [...prev, newTask])
      }

      toast.success(`${platform} task completed successfully!`)
      return true
    } catch (err) {
      console.error('Error completing social task:', err)
      setError('Failed to complete social task')
      toast.error('Failed to complete social task')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, socialTasks])

  const processReferral = useCallback(async (refereeWalletAddress: string, referralCode?: string): Promise<boolean> => {
    if (!user?.$id) return false

    try {
      let referrerId = user.$id

      // If referralCode provided, find the referrer
      if (referralCode) {
        const referrer = await AppwriteService.getReferralByCode(referralCode)
        if (referrer && referrer.$id !== user.$id) {
          referrerId = referrer.$id!
          
          // Create referral record
          await AppwriteService.createReferral({
            referrerId,
            refereeId: user.$id,
            refereeWalletAddress,
            bonusEarned: 3.2, // Referral bonus amount
            createdAt: new Date().toISOString(),
            status: 'completed'
          })

          // Update referrer's total earned
          await AppwriteService.updateUser(referrerId, {
            totalEarned: (referrer.totalEarned || 0) + 3.2
          })

          toast.success('Referral bonus applied!')
        }
      }

      return true
    } catch (err) {
      console.error('Error processing referral:', err)
      return false
    }
  }, [user])

  const getAirdropStats = useCallback(async () => {
    try {
      return await AppwriteService.getAirdropStats()
    } catch (err) {
      console.error('Error getting airdrop stats:', err)
      return { totalParticipants: 0, totalDistributed: 0, currentBatch: 0 }
    }
  }, [])

  return {
    user,
    airdropRegistration,
    socialTasks,
    referrals,
    loading,
    error,
    createUser,
    updateUser,
    registerForAirdrop,
    completeSocialTask,
    processReferral,
    getAirdropStats
  }
}

export default useAppwrite