import { NextApiRequest, NextApiResponse } from 'next'

// Health check API to monitor system status
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      database: 'checking...',
      contracts: 'checking...',
      external: 'checking...'
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    }
  }

  try {
    // Check Appwrite connection
    try {
      const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
      if (appwriteEndpoint) {
        const response = await fetch(`${appwriteEndpoint}/health`, {
          method: 'GET',
          timeout: 5000,
        })
        healthCheck.services.database = response.ok ? 'operational' : 'degraded'
      } else {
        healthCheck.services.database = 'not-configured'
      }
    } catch (error) {
      healthCheck.services.database = 'unavailable'
    }

    // Check contract RPC
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
      if (rpcUrl) {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
          }),
          timeout: 5000,
        })
        const data = await response.json()
        healthCheck.services.contracts = data.result ? 'operational' : 'degraded'
      } else {
        healthCheck.services.contracts = 'not-configured'
      }
    } catch (error) {
      healthCheck.services.contracts = 'unavailable'
    }

    // Check external services
    const externalChecks = [
      'https://api.coingecko.com/api/v3/ping',
      'https://bsc-dataseed1.binance.org',
    ]

    let externalHealthy = 0
    for (const url of externalChecks) {
      try {
        const response = await fetch(url, { 
          method: url.includes('binance') ? 'POST' : 'GET',
          timeout: 3000,
          headers: url.includes('binance') ? { 'Content-Type': 'application/json' } : {},
          body: url.includes('binance') ? JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
          }) : undefined,
        })
        if (response.ok) externalHealthy++
      } catch (error) {
        // External service down
      }
    }

    healthCheck.services.external = externalHealthy > 0 ? 'operational' : 'degraded'

    // Determine overall status
    const services = Object.values(healthCheck.services)
    if (services.every(s => s === 'operational')) {
      healthCheck.status = 'healthy'
    } else if (services.some(s => s === 'operational')) {
      healthCheck.status = 'degraded'
    } else {
      healthCheck.status = 'unhealthy'
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    res.status(statusCode).json(healthCheck)

  } catch (error: any) {
    res.status(503).json({
      ...healthCheck,
      status: 'unhealthy',
      error: error.message,
      services: {
        api: 'operational',
        database: 'unknown',
        contracts: 'unknown',
        external: 'unknown'
      }
    })
  }
}