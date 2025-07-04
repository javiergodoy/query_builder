// Real query executor using PostgreSQL API
import type { QueryResult } from '../types/query'
import { apiService } from './apiService'

export class RealQueryExecutor {
  static async executeQuery(sql: string): Promise<QueryResult> {
    try {
      console.log('🚀 Executing SQL via API:', sql)
      
      const result = await apiService.executeQuery(sql)
      
      console.log('✅ Query result:', result)
      
      return {
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount || result.rows.length,
        executionTime: result.executionTime,
        success: true
      }
    } catch (error) {
      console.error('❌ Query execution failed:', error)
      
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      await apiService.healthCheck()
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }

  static async getTablePreview(tableName: string, limit = 10): Promise<QueryResult> {
    try {
      const result = await apiService.getTablePreview(tableName, limit)
      
      return {
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount || result.rows.length,
        executionTime: result.executionTime,
        success: true
      }
    } catch (error) {
      console.error('Table preview failed:', error)
      
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch table preview'
      }
    }
  }
}

export default RealQueryExecutor
