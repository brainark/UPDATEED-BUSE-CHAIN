import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { API_CONFIG } from './config'

// Initialize Firebase
const firebaseConfig = API_CONFIG.FIREBASE_CONFIG

let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const db = getFirestore(app)

// User verification functions
export const userVerification = {
  async storeVerification(address: string, taskType: string, verified: boolean) {
    try {
      const verificationRef = doc(db, 'verifications', `${address}_${taskType}`)
      await setDoc(verificationRef, {
        address,
        taskType,
        verified,
        timestamp: new Date(),
        updatedAt: new Date()
      }, { merge: true })
      
      return true
    } catch (error) {
      console.error('Error storing verification:', error)
      return false
    }
  },

  async getVerification(address: string, taskType: string) {
    try {
      const verificationRef = doc(db, 'verifications', `${address}_${taskType}`)
      const verificationSnap = await getDoc(verificationRef)
      
      if (verificationSnap.exists()) {
        return verificationSnap.data()
      }
      
      return null
    } catch (error) {
      console.error('Error getting verification:', error)
      return null
    }
  },

  async getAllVerifications(address: string) {
    try {
      const verificationsQuery = query(
        collection(db, 'verifications'),
        where('address', '==', address)
      )
      
      const snapshot = await getDocs(verificationsQuery)
      const verifications: any = {}
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        verifications[data.taskType] = data.verified
      })
      
      return verifications
    } catch (error) {
      console.error('Error getting all verifications:', error)
      return {}
    }
  }
}

// Referral system functions
export const referralSystem = {
  async createReferral(referrer: string, referee: string) {
    try {
      // Check if referee already has a referrer
      const existingReferralQuery = query(
        collection(db, 'referrals'),
        where('referee', '==', referee)
      )
      
      const existingSnapshot = await getDocs(existingReferralQuery)
      if (!existingSnapshot.empty) {
        throw new Error('User already has a referrer')
      }

      // Create new referral
      const referralDoc = {
        referrer,
        referee,
        timestamp: new Date(),
        bonusPaid: false,
        bonusAmount: 3.2
      }
      
      await addDoc(collection(db, 'referrals'), referralDoc)
      
      // Update referrer's count
      const referrerRef = doc(db, 'users', referrer)
      await updateDoc(referrerRef, {
        referralCount: increment(1),
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error creating referral:', error)
      return false
    }
  },

  async getReferralStats(address: string) {
    try {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('referrer', '==', address)
      )
      
      const snapshot = await getDocs(referralsQuery)
      const referralCount = snapshot.size
      
      let totalEarned = 0
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.bonusPaid) {
          totalEarned += data.bonusAmount || 3.2
        }
      })
      
      return {
        referralCode: address,
        referralCount,
        totalEarned
      }
    } catch (error) {
      console.error('Error getting referral stats:', error)
      return {
        referralCode: address,
        referralCount: 0,
        totalEarned: 0
      }
    }
  },

  async markBonusPaid(referrer: string, referee: string) {
    try {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('referrer', '==', referrer),
        where('referee', '==', referee)
      )
      
      const snapshot = await getDocs(referralsQuery)
      
      snapshot.forEach(async (docSnapshot) => {
        await updateDoc(docSnapshot.ref, {
          bonusPaid: true,
          bonusPaidAt: new Date()
        })
      })
      
      return true
    } catch (error) {
      console.error('Error marking bonus as paid:', error)
      return false
    }
  }
}

// User data functions
export const userData = {
  async createUser(address: string, data: any = {}) {
    try {
      const userRef = doc(db, 'users', address)
      await setDoc(userRef, {
        address,
        createdAt: new Date(),
        updatedAt: new Date(),
        referralCount: 0,
        totalEarned: 0,
        hasClaimed: false,
        ...data
      }, { merge: true })
      
      return true
    } catch (error) {
      console.error('Error creating user:', error)
      return false
    }
  },

  async getUser(address: string) {
    try {
      const userRef = doc(db, 'users', address)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return userSnap.data()
      }
      
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  async updateUser(address: string, data: any) {
    try {
      const userRef = doc(db, 'users', address)
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }
}

// Transaction tracking
export const transactionTracking = {
  async recordTransaction(txData: {
    hash: string
    from: string
    type: 'airdrop' | 'epo'
    amount: string
    token?: string
    status: 'pending' | 'confirmed' | 'failed'
  }) {
    try {
      const txRef = doc(db, 'transactions', txData.hash)
      await setDoc(txRef, {
        ...txData,
        timestamp: new Date(),
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error recording transaction:', error)
      return false
    }
  },

  async updateTransactionStatus(hash: string, status: string) {
    try {
      const txRef = doc(db, 'transactions', hash)
      await updateDoc(txRef, {
        status,
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error updating transaction status:', error)
      return false
    }
  },

  async getUserTransactions(address: string) {
    try {
      const txQuery = query(
        collection(db, 'transactions'),
        where('from', '==', address)
      )
      
      const snapshot = await getDocs(txQuery)
      const transactions: any[] = []
      
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error getting user transactions:', error)
      return []
    }
  }
}

// Analytics and stats
export const analytics = {
  async recordPageView(page: string, address?: string) {
    try {
      await addDoc(collection(db, 'analytics'), {
        type: 'page_view',
        page,
        address: address || 'anonymous',
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      })
      
      return true
    } catch (error) {
      console.error('Error recording page view:', error)
      return false
    }
  },

  async recordEvent(event: string, data: any = {}, address?: string) {
    try {
      await addDoc(collection(db, 'analytics'), {
        type: 'event',
        event,
        data,
        address: address || 'anonymous',
        timestamp: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error recording event:', error)
      return false
    }
  }
}

export default {
  userVerification,
  referralSystem,
  userData,
  transactionTracking,
  analytics
}