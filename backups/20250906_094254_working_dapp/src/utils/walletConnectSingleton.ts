// WalletConnect Singleton - Prevents multiple initialization
let walletConnectInitialized = false
let walletConnectInstance: any = null

// Singleton pattern to prevent multiple WalletConnect initializations
export class WalletConnectSingleton {
  private static instance: WalletConnectSingleton
  private initialized = false
  private initPromise: Promise<any> | null = null

  private constructor() {}

  public static getInstance(): WalletConnectSingleton {
    if (!WalletConnectSingleton.instance) {
      WalletConnectSingleton.instance = new WalletConnectSingleton()
    }
    return WalletConnectSingleton.instance
  }

  public async initialize(config: any): Promise<any> {
    // If already initialized, return existing instance
    if (this.initialized && walletConnectInstance) {
      console.log('🔄 WalletConnect already initialized, returning existing instance')
      return walletConnectInstance
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      console.log('⏳ WalletConnect initialization in progress, waiting...')
      return this.initPromise
    }

    // Start new initialization
    console.log('🚀 Initializing WalletConnect singleton...')
    
    this.initPromise = this.doInitialize(config)
    
    try {
      walletConnectInstance = await this.initPromise
      this.initialized = true
      walletConnectInitialized = true
      console.log('✅ WalletConnect singleton initialized successfully')
      return walletConnectInstance
    } catch (error) {
      console.error('❌ WalletConnect initialization failed:', error)
      this.initPromise = null
      throw error
    }
  }

  private async doInitialize(config: any): Promise<any> {
    // Add timeout to prevent hanging during build
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('WalletConnect initialization timeout'))
      }, 30000) // 30 second timeout
    })

    try {
      // Import WalletConnect dynamically to avoid SSR issues
      const { createConfig } = await import('wagmi')
      const { walletConnect } = await import('wagmi/connectors')
      
      // Create connector with timeout protection
      const connector = walletConnect({
        ...config,
        qrModalOptions: {
          ...config.qrModalOptions,
          enableNetworkView: false, // Disable network view to prevent fetch issues
          enableAccountView: false, // Disable account view to prevent fetch issues
        }
      })

      return Promise.race([
        Promise.resolve(connector),
        timeoutPromise
      ])

    } catch (error: any) {
      console.error('WalletConnect initialization error:', error)
      
      // Return a mock connector for build-time
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        console.log('🏗️ Build-time detected, returning mock connector')
        return {
          id: 'walletConnect',
          name: 'WalletConnect',
          type: 'walletConnect',
          ready: false,
        }
      }
      
      throw error
    }
  }

  public isInitialized(): boolean {
    return this.initialized
  }

  public getInstance(): any {
    return walletConnectInstance
  }

  public reset(): void {
    console.log('🔄 Resetting WalletConnect singleton')
    this.initialized = false
    this.initPromise = null
    walletConnectInstance = null
    walletConnectInitialized = false
  }
}

// Export singleton instance
export const walletConnectSingleton = WalletConnectSingleton.getInstance()

// Helper function to check if WalletConnect is already initialized
export const isWalletConnectInitialized = (): boolean => {
  return walletConnectInitialized
}

// Helper function to safely initialize WalletConnect
export const safeInitializeWalletConnect = async (config: any): Promise<any> => {
  try {
    return await walletConnectSingleton.initialize(config)
  } catch (error) {
    console.error('Safe WalletConnect initialization failed:', error)
    
    // Return a fallback connector
    return {
      id: 'walletConnect-fallback',
      name: 'WalletConnect (Fallback)',
      type: 'walletConnect',
      ready: false,
      connect: async () => {
        throw new Error('WalletConnect not available')
      }
    }
  }
}

export default walletConnectSingleton