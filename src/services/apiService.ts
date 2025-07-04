// API service for connecting to PostgreSQL backend
export interface DatabaseColumn {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  nullable: boolean
  default?: string
  constraint?: string
}

export interface DatabaseTable {
  name: string
  columns: DatabaseColumn[]
}

export interface QueryResult {
  columns: { name: string; type: string }[]
  rows: Record<string, any>[]
  rowCount: number
  executionTime: number
}

export interface ApiError {
  error: string
  detail?: string
  hint?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  }

  async fetchSchema(): Promise<DatabaseTable[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schema`)
      
      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Failed to fetch schema')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Schema fetch error:', error)
      throw error
    }
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql })
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Query execution failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Query execution error:', error)
      throw error
    }
  }

  async getTablePreview(tableName: string, limit = 10): Promise<QueryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/tables/${tableName}/preview?limit=${limit}`)
      
      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.error || 'Failed to fetch table preview')
      }
      
      const data = await response.json()
      return {
        ...data,
        executionTime: 0 // Preview doesn't track execution time
      }
    } catch (error) {
      console.error('Table preview error:', error)
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      
      if (!response.ok) {
        throw new Error('Health check failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export default apiService
