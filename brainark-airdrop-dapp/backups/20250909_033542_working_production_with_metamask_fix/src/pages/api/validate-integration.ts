import { NextApiRequest, NextApiResponse } from 'next'
import { createPublicClient, http, parseAbi, formatEther } from 'viem'

// Enhanced validation API endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    validations: {
      contracts: {},
      treasuries: {},
      networks: {},
      configuration: {}
    },
    summary: {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }

  try {
    // 1. Validate Contract Addresses
    console.log('🔍 Validating contract addresses...')
    
    const epoAddress = process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
    const airdropAddress = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5'
    
    // Create BrainArk client
    const brainarkClient = createPublicClient({
      transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online', {
        timeout: 10000,
        retryCount: 3,
      }),
    })

    // Test EPO Contract
    results.validations.contracts.epo = await validateContract(
      brainarkClient, 
      epoAddress, 
      'EPO Contract',
      [
        'function getContractStats() view returns (uint256, uint256, uint256, uint256, uint256)',
        'function currentPrice() view returns (uint256)',
        'function totalBakSold() view returns (uint256)',
      ]
    )

    // Test Airdrop Contract
    results.validations.contracts.airdrop = await validateContract(
      brainarkClient,
      airdropAddress,
      'Airdrop Contract',
      [
        'function getAirdropStats() view returns (uint256, uint256, uint256, uint256, bool, uint256)',
        'function canClaim(address) view returns (bool)',
      ]
    )

    // 2. Validate Treasury Addresses
    console.log('💰 Validating treasury addresses...')
    
    const treasuryAddresses = {
      ethereum: {
        ETH: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY,
        USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY,
        USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY,
      },
      bsc: {
        BNB: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY,
        USDT: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY,
        USDC: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY,
      },
      polygon: {
        MATIC: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY,
        USDT: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY,
        USDC: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY,
      },
    }

    for (const [network, tokens] of Object.entries(treasuryAddresses)) {
      results.validations.treasuries[network] = {}
      for (const [token, address] of Object.entries(tokens)) {
        results.validations.treasuries[network][token] = validateAddress(address, `${network} ${token} Treasury`)
        results.summary.totalChecks++
        if (results.validations.treasuries[network][token].valid) {
          results.summary.passed++
        } else {
          results.summary.failed++
        }
      }
    }

    // 3. Validate Network Connectivity
    console.log('🌐 Validating network connectivity...')
    
    const networks = {
      brainark: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online',
      ethereum: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
      bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
      polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    }

    for (const [network, rpcUrl] of Object.entries(networks)) {
      results.validations.networks[network] = await validateNetworkConnectivity(network, rpcUrl)
      results.summary.totalChecks++
      if (results.validations.networks[network].connected) {
        results.summary.passed++
      } else {
        results.summary.failed++
      }
    }

    // 4. Validate Configuration
    console.log('⚙️ Validating configuration...')
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_EPO_CONTRACT',
      'NEXT_PUBLIC_AIRDROP_CONTRACT',
      'NEXT_PUBLIC_RPC_URL',
      'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    ]

    results.validations.configuration = {
      environment: process.env.NODE_ENV,
      requiredVars: {},
      optional: {
        twitterApi: !!process.env.TWITTER_BEARER_TOKEN,
        telegramBot: !!process.env.TELEGRAM_BOT_TOKEN,
        appwrite: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      }
    }

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      results.validations.configuration.requiredVars[envVar] = {
        present: !!value,
        value: value ? `${value.slice(0, 10)}...` : 'Not set',
      }
      results.summary.totalChecks++
      if (value) {
        results.summary.passed++
      } else {
        results.summary.failed++
      }
    }

    // 5. Test BSC Network Specifically
    console.log('🟡 Testing BSC network specifically...')
    
    const bscTestResults = await testBSCNetwork()
    results.validations.bscSpecific = bscTestResults
    results.summary.totalChecks += 3
    results.summary.passed += bscTestResults.rpcConnectivity ? 1 : 0
    results.summary.failed += bscTestResults.rpcConnectivity ? 0 : 1
    results.summary.passed += bscTestResults.chainIdCorrect ? 1 : 0
    results.summary.failed += bscTestResults.chainIdCorrect ? 0 : 1
    results.summary.passed += bscTestResults.treasuryValid ? 1 : 0
    results.summary.failed += bscTestResults.treasuryValid ? 0 : 1

    // Calculate success rate
    const successRate = results.summary.totalChecks > 0 
      ? (results.summary.passed / results.summary.totalChecks * 100).toFixed(1)
      : '0'

    results.summary.successRate = `${successRate}%`
    results.summary.status = parseFloat(successRate) >= 80 ? 'HEALTHY' : 
                            parseFloat(successRate) >= 60 ? 'WARNING' : 'CRITICAL'

    console.log(`✅ Validation complete: ${results.summary.successRate} success rate`)

    res.status(200).json(results)

  } catch (error: any) {
    console.error('❌ Validation error:', error)
    res.status(500).json({
      error: 'Validation failed',
      message: error.message,
      results: results
    })
  }
}

// Helper function to validate contract
async function validateContract(client: any, address: string, name: string, functions: string[]) {
  const result = {
    address,
    name,
    valid: false,
    deployed: false,
    functions: {},
    error: null as string | null,
  }

  try {
    // Check if contract is deployed
    const code = await client.getBytecode({ address: address as `0x${string}` })
    result.deployed = !!(code && code !== '0x')

    if (!result.deployed) {
      result.error = 'Contract not deployed'
      return result
    }

    // Test each function
    const abi = parseAbi(functions)
    
    for (const func of functions) {
      const functionName = func.split('(')[0].split(' ').pop()
      if (!functionName) continue

      try {
        await client.readContract({
          address: address as `0x${string}`,
          abi,
          functionName,
          args: functionName === 'canClaim' ? ['0x0000000000000000000000000000000000000000'] : [],
        })
        result.functions[functionName] = { working: true, error: null }
      } catch (funcError: any) {
        result.functions[functionName] = { 
          working: false, 
          error: funcError.message?.slice(0, 100) || 'Unknown error'
        }
      }
    }

    result.valid = result.deployed && Object.values(result.functions).some((f: any) => f.working)

  } catch (error: any) {
    result.error = error.message?.slice(0, 200) || 'Unknown error'
  }

  return result
}

// Helper function to validate address format
function validateAddress(address: string | undefined, name: string) {
  return {
    name,
    address: address || 'Not set',
    valid: !!(address && /^0x[a-fA-F0-9]{40}$/.test(address)),
    format: address ? 'Valid format' : 'Missing or invalid format',
  }
}

// Helper function to validate network connectivity
async function validateNetworkConnectivity(network: string, rpcUrl: string) {
  const result = {
    network,
    rpcUrl,
    connected: false,
    chainId: null as number | null,
    latency: null as number | null,
    error: null as string | null,
  }

  try {
    const startTime = Date.now()
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    result.latency = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      if (data.result) {
        result.chainId = parseInt(data.result, 16)
        result.connected = true
      } else {
        result.error = 'Invalid response format'
      }
    } else {
      result.error = `HTTP ${response.status}: ${response.statusText}`
    }

  } catch (error: any) {
    result.error = error.message?.slice(0, 100) || 'Connection failed'
  }

  return result
}

// Helper function to specifically test BSC network
async function testBSCNetwork() {
  const result = {
    rpcConnectivity: false,
    chainIdCorrect: false,
    treasuryValid: false,
    blockNumber: null as number | null,
    gasPrice: null as string | null,
    errors: [] as string[],
  }

  try {
    // Test multiple BSC RPC endpoints
    const bscRpcUrls = [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-rpc.publicnode.com',
    ]

    for (const rpcUrl of bscRpcUrls) {
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const data = await response.json()
          const chainId = parseInt(data.result, 16)
          
          if (chainId === 56) {
            result.rpcConnectivity = true
            result.chainIdCorrect = true
            
            // Get additional BSC info
            try {
              const blockResponse = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_blockNumber',
                  params: [],
                  id: 2,
                }),
                signal: AbortSignal.timeout(5000),
              })
              
              if (blockResponse.ok) {
                const blockData = await blockResponse.json()
                result.blockNumber = parseInt(blockData.result, 16)
              }
            } catch (blockError) {
              // Non-critical error
            }
            
            break // Success, no need to try other RPCs
          }
        }
      } catch (rpcError: any) {
        result.errors.push(`${rpcUrl}: ${rpcError.message}`)
      }
    }

    // Validate BSC treasury addresses
    const bscTreasuries = [
      process.env.NEXT_PUBLIC_BNB_BSC_TREASURY,
      process.env.NEXT_PUBLIC_USDT_BSC_TREASURY,
      process.env.NEXT_PUBLIC_USDC_BSC_TREASURY,
    ]

    result.treasuryValid = bscTreasuries.every(addr => 
      addr && /^0x[a-fA-F0-9]{40}$/.test(addr)
    )

  } catch (error: any) {
    result.errors.push(`BSC test failed: ${error.message}`)
  }

  return result
}