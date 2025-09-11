// Simple API client without network error handler to prevent ERR_INSUFFICIENT_RESOURCES
export class SimpleAPIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string = '', headers: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }
  }

  async get(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<any> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // Use native fetch without any interceptors
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      })

      // Handle different response types
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        return data
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response

    } catch (error: any) {
      console.error(`API request failed: ${url}`, error)
      
      // Return fallback data instead of throwing
      return {
        success: false,
        error: error.message,
        data: null,
        fallback: true,
      }
    }
  }
}

// Export simple API client instance
export const simpleApiClient = new SimpleAPIClient('/api')