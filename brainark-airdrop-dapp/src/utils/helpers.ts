import { ethers } from 'ethers'

// Number formatting utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K'
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export const formatCurrency = (num: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num)
}

export const formatPercentage = (num: number, decimals: number = 2): string => {
  return `${num.toFixed(decimals)}%`
}

// Address utilities
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address)
  } catch {
    return false
  }
}

// Time utilities
export const formatTimeAgo = (timestamp: number | Date): string => {
  const now = new Date().getTime()
  const time = typeof timestamp === 'number' ? timestamp : timestamp.getTime()
  const diff = now - time

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`
}

export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

// Token utilities
export const parseTokenAmount = (amount: string, decimals: number = 18): ethers.BigNumber => {
  try {
    return ethers.utils.parseUnits(amount, decimals)
  } catch {
    return ethers.BigNumber.from(0)
  }
}

export const formatTokenAmount = (amount: ethers.BigNumber, decimals: number = 18, displayDecimals: number = 4): string => {
  try {
    const formatted = ethers.utils.formatUnits(amount, decimals)
    const num = parseFloat(formatted)
    return num.toFixed(displayDecimals)
  } catch {
    return '0'
  }
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateTwitterUsername = (username: string): boolean => {
  const twitterRegex = /^[A-Za-z0-9_]{1,15}$/
  return twitterRegex.test(username.replace('@', ''))
}

export const validateTelegramUsername = (username: string): boolean => {
  const telegramRegex = /^[A-Za-z0-9_]{5,32}$/
  return telegramRegex.test(username.replace('@', ''))
}

// URL utilities
export const buildReferralLink = (baseUrl: string, referrerAddress: string): string => {
  return `${baseUrl}/airdrop?ref=${referrerAddress}`
}

export const extractReferralCode = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('ref')
  } catch {
    return null
  }
}

// Local storage utilities
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return false
  }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.reason) return error.reason
  if (error?.data?.message) return error.data.message
  return 'An unknown error occurred'
}

export const isUserRejectedError = (error: any): boolean => {
  const message = getErrorMessage(error).toLowerCase()
  return message.includes('user rejected') || 
         message.includes('user denied') || 
         message.includes('cancelled')
}

// Network utilities
export const getNetworkName = (chainId: number): string => {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    5: 'Goerli Testnet',
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    1337: 'BrainArk Besu Network'
  }
  
  return networks[chainId] || `Unknown Network (${chainId})`
}

// Social media utilities
export const socialLinks = {
  twitter: (username: string) => `https://twitter.com/${username.replace('@', '')}`,
  telegram: (username: string) => `https://t.me/${username.replace('@', '')}`,
  discord: (invite: string) => `https://discord.gg/${invite}`,
  github: (username: string) => `https://github.com/${username}`,
  medium: (username: string) => `https://medium.com/@${username}`
}

// Random utilities
export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Type guards
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isArray = (value: any): value is any[] => {
  return Array.isArray(value)
}

// Export all utilities as default
export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  shortenAddress,
  isValidAddress,
  formatTimeAgo,
  formatDuration,
  parseTokenAmount,
  formatTokenAmount,
  validateEmail,
  validateTwitterUsername,
  validateTelegramUsername,
  buildReferralLink,
  extractReferralCode,
  storage,
  copyToClipboard,
  debounce,
  throttle,
  getErrorMessage,
  isUserRejectedError,
  getNetworkName,
  socialLinks,
  generateRandomId,
  sleep,
  isString,
  isNumber,
  isObject,
  isArray
}