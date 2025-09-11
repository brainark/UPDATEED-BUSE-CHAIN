import type { NextApiRequest, NextApiResponse } from 'next'

interface ReferralRequest {
  referrer: string
  referee: string
}

interface ReferralResponse {
  success: boolean
  message: string
  data?: {
    referralCode: string
    referralCount: number
    totalEarned: number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReferralResponse>
) {
  try {
    if (req.method === 'POST') {
      return await handleCreateReferral(req, res)
    } else if (req.method === 'GET') {
      return await handleGetReferralStats(req, res)
    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      })
    }
  } catch (error) {
    console.error('Referral API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

async function handleCreateReferral(
  req: NextApiRequest,
  res: NextApiResponse<ReferralResponse>
) {
  const { referrer, referee }: ReferralRequest = req.body

  if (!referrer || !referee) {
    return res.status(400).json({
      success: false,
      message: 'Missing referrer or referee address'
    })
  }

  if (referrer === referee) {
    return res.status(400).json({
      success: false,
      message: 'Cannot refer yourself'
    })
  }

  // In a real implementation, this would:
  // 1. Validate that referrer has claimed airdrop
  // 2. Check that referee hasn't been referred before
  // 3. Store referral relationship in database
  // 4. Update referrer's referral count

  const success = await storeReferral(referrer, referee)

  if (success) {
    return res.status(200).json({
      success: true,
      message: 'Referral recorded successfully'
    })
  } else {
    return res.status(400).json({
      success: false,
      message: 'Failed to record referral'
    })
  }
}

async function handleGetReferralStats(
  req: NextApiRequest,
  res: NextApiResponse<ReferralResponse>
) {
  const { address } = req.query

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid address parameter'
    })
  }

  const stats = await getReferralStats(address)

  return res.status(200).json({
    success: true,
    message: 'Referral stats retrieved successfully',
    data: stats
  })
}

async function storeReferral(referrer: string, referee: string): Promise<boolean> {
  // Simulate database operation
  await new Promise(resolve => setTimeout(resolve, 500))

  // In a real implementation, this would:
  // const db = getFirestore()
  // const referralDoc = {
  //   referrer,
  //   referee,
  //   timestamp: new Date(),
  //   bonusPaid: false
  // }
  // await addDoc(collection(db, 'referrals'), referralDoc)
  // 
  // // Update referrer's count
  // const referrerRef = doc(db, 'users', referrer)
  // await updateDoc(referrerRef, {
  //   referralCount: increment(1)
  // })

  console.log(`Stored referral: ${referrer} -> ${referee}`)
  return true
}

async function getReferralStats(address: string) {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 300))

  // In a real implementation, this would query the database:
  // const db = getFirestore()
  // const referralsQuery = query(
  //   collection(db, 'referrals'),
  //   where('referrer', '==', address)
  // )
  // const snapshot = await getDocs(referralsQuery)
  // const referralCount = snapshot.size

  const mockStats = {
    referralCode: address,
    referralCount: Math.floor(Math.random() * 20), // 0-19 referrals
    totalEarned: Math.floor(Math.random() * 20) * 3.2 // referrals * 3.2 BAK
  }

  return mockStats
}