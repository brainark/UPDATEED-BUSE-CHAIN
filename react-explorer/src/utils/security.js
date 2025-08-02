import DOMPurify from 'dompurify';

// Input validation utilities
export const validateInput = {
  // Validate Ethereum address
  ethereumAddress: (address) => {
    if (!address || typeof address !== 'string') return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Validate transaction hash
  transactionHash: (hash) => {
    if (!hash || typeof hash !== 'string') return false;
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  },

  // Validate block number
  blockNumber: (blockNum) => {
    if (blockNum === 'latest' || blockNum === 'earliest' || blockNum === 'pending') {
      return true;
    }
    const num = parseInt(blockNum);
    return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
  },

  // Validate chain ID
  chainId: (chainId) => {
    if (!chainId || typeof chainId !== 'string') return false;
    return /^0x[a-fA-F0-9]+$/.test(chainId);
  },

  // Validate URL
  url: (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Sanitize string input
  sanitizeString: (input, maxLength = 1000) => {
    if (!input || typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.slice(0, maxLength), { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  // Validate and sanitize HTML
  sanitizeHtml: (html) => {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'br', 'strong', 'em'],
      ALLOWED_ATTR: ['class', 'title'],
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'video', 'audio'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
  }
};

// Rate limiting utility
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// Error handling utilities
export const secureErrorHandler = {
  // Sanitize error messages to prevent information leakage
  sanitizeError: (error) => {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || error.toString();
    
    // Remove sensitive information patterns
    const sanitized = message
      .replace(/0x[a-fA-F0-9]{40}/g, '0x...') // Hide addresses
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, 'xxx.xxx.xxx.xxx') // Hide IP addresses
      .replace(/password|secret|key|token/gi, '[REDACTED]') // Hide sensitive keywords
      .slice(0, 200); // Limit length
    
    return validateInput.sanitizeString(sanitized);
  },

  // Log errors securely
  logError: (error, context = '') => {
    const sanitizedError = secureErrorHandler.sanitizeError(error);
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${context}: ${sanitizedError}`);
  }
};

// Content Security Policy helpers
export const cspHelpers = {
  // Generate nonce for inline scripts (if needed)
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Validate external URLs against whitelist
  isAllowedExternalUrl: (url) => {
    const allowedDomains = [
      'metamask.io',
      'ipfs.io',
      'brainark.online',
      'vercel.app'
    ];
    
    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
};

// Secure storage utilities
export const secureStorage = {
  // Safely store data in localStorage with encryption
  setItem: (key, value) => {
    try {
      const sanitizedKey = validateInput.sanitizeString(key, 100);
      const sanitizedValue = validateInput.sanitizeString(JSON.stringify(value), 10000);
      localStorage.setItem(sanitizedKey, sanitizedValue);
    } catch (error) {
      secureErrorHandler.logError(error, 'secureStorage.setItem');
    }
  },

  // Safely retrieve data from localStorage
  getItem: (key) => {
    try {
      const sanitizedKey = validateInput.sanitizeString(key, 100);
      const value = localStorage.getItem(sanitizedKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      secureErrorHandler.logError(error, 'secureStorage.getItem');
      return null;
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    try {
      const sanitizedKey = validateInput.sanitizeString(key, 100);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      secureErrorHandler.logError(error, 'secureStorage.removeItem');
    }
  }
};

// Web3 security utilities
export const web3Security = {
  // Validate Web3 provider
  isValidProvider: (provider) => {
    return provider && 
           typeof provider.request === 'function' &&
           typeof provider.on === 'function';
  },

  // Sanitize Web3 responses
  sanitizeWeb3Response: (response) => {
    if (!response || typeof response !== 'object') return null;
    
    // Create a clean copy without potentially dangerous properties
    const sanitized = {};
    const allowedKeys = [
      'hash', 'blockNumber', 'transactionIndex', 'from', 'to', 'value',
      'gas', 'gasPrice', 'gasUsed', 'status', 'logs', 'timestamp',
      'number', 'miner', 'transactions', 'gasLimit', 'difficulty'
    ];
    
    allowedKeys.forEach(key => {
      if (response.hasOwnProperty(key)) {
        sanitized[key] = response[key];
      }
    });
    
    return sanitized;
  },

  // Validate transaction data before sending
  validateTransaction: (tx) => {
    if (!tx || typeof tx !== 'object') return false;
    
    // Check required fields
    if (tx.to && !validateInput.ethereumAddress(tx.to)) return false;
    if (tx.from && !validateInput.ethereumAddress(tx.from)) return false;
    
    // Validate value
    if (tx.value && !/^\d+$/.test(tx.value.toString())) return false;
    
    // Validate gas
    if (tx.gas && !/^\d+$/.test(tx.gas.toString())) return false;
    
    return true;
  }
};

export default {
  validateInput,
  RateLimiter,
  secureErrorHandler,
  cspHelpers,
  secureStorage,
  web3Security
};