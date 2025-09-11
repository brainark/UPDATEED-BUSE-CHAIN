import { NextApiRequest, NextApiResponse } from 'next'

// Lightweight health check to prevent ERR_INSUFFICIENT_RESOURCES
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set aggressive cache headers to prevent excessive requests
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  res.setHeader('X-Health-Check', 'optimized')
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple, fast response without external calls
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      contracts: process.env.NEXT_PUBLIC_EPO_CONTRACT ? 'configured' : 'not-configured',
      network: process.env.NEXT_PUBLIC_RPC_URL ? 'configured' : 'not-configured',
      database: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? 'configured' : 'not-configured'
    },
    metrics: {
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    }
  }

  // Return immediately without any external calls to prevent resource exhaustion
  res.status(200).json(healthCheck)
}