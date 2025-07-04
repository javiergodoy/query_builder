import type { QueryResult } from '../types/query'

// Mock data generator for different table types
const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2023-03-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', created_at: '2023-04-05' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', created_at: '2023-05-12' }
  ],
  orders: [
    { id: 1, user_id: 1, product_id: 1, quantity: 2, total: 99.98, order_date: '2023-06-01' },
    { id: 2, user_id: 2, product_id: 2, quantity: 1, total: 299.99, order_date: '2023-06-02' },
    { id: 3, user_id: 3, product_id: 1, quantity: 1, total: 49.99, order_date: '2023-06-03' },
    { id: 4, user_id: 1, product_id: 3, quantity: 3, total: 89.97, order_date: '2023-06-04' },
    { id: 5, user_id: 4, product_id: 2, quantity: 1, total: 299.99, order_date: '2023-06-05' },
    { id: 6, user_id: 2, product_id: 4, quantity: 2, total: 39.98, order_date: '2023-06-06' },
    { id: 7, user_id: 5, product_id: 1, quantity: 1, total: 49.99, order_date: '2023-06-07' },
    { id: 8, user_id: 3, product_id: 3, quantity: 2, total: 59.98, order_date: '2023-06-08' }
  ],
  products: [
    { id: 1, name: 'Laptop', price: 49.99, category_id: 1, description: 'High-performance laptop' },
    { id: 2, name: 'Smartphone', price: 299.99, category_id: 1, description: 'Latest smartphone' },
    { id: 3, name: 'Coffee Mug', price: 29.99, category_id: 2, description: 'Ceramic coffee mug' },
    { id: 4, name: 'Book', price: 19.99, category_id: 3, description: 'Programming guide' }
  ],
  categories: [
    { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets' },
    { id: 2, name: 'Home & Kitchen', description: 'Home and kitchen items' },
    { id: 3, name: 'Books', description: 'Books and educational materials' }
  ]
}

export class QueryExecutor {
  static async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = Date.now()
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    try {
      // Parse basic SELECT queries (mock implementation)
      const result = this.parseAndExecute(sql)
      const executionTime = Date.now() - startTime

      return {
        columns: result.columns,
        rows: result.rows,
        totalRows: result.rows.length,
        executionTime
      }
    } catch (error) {
      console.error('❌ SQL parsing error:', error) // Debug log
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static parseAndExecute(sql: string): { columns: { name: string; type: string }[], rows: Record<string, any>[] } {
    console.log('🔍 Parsing SQL:', sql) // Debug log
    
    // Check for comment-only SQL
    if (sql.trim().startsWith('--')) {
      throw new Error('Please add fields to your query before executing')
    }
    
    // Very basic SQL parsing for demo purposes
    const upperSql = sql.toUpperCase()
    
    // Extract table from FROM clause
    const fromMatch = upperSql.match(/FROM\s+(\w+)/i)
    if (!fromMatch) {
      throw new Error('Could not parse FROM clause')
    }

    const tableName = fromMatch[1].toLowerCase()
    console.log('🗃️ Identified table:', tableName) // Debug log
    
    // Get base data
    let data = this.getTableData(tableName)
    
    // Handle simple WHERE conditions
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/is)
    if (whereMatch) {
      data = this.applyWhereConditions(data, whereMatch[1])
    }

    // Handle simple aggregations - use 's' flag for multiline
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/is)
    if (!selectMatch) {
      throw new Error('Could not parse SELECT clause')
    }

    const selectClause = selectMatch[1].replace(/\s+/g, ' ').trim()
    
    // Check for aggregations
    if (/COUNT|SUM|AVG|MIN|MAX/.test(selectClause.toUpperCase())) {
      return this.executeAggregateQuery(data, selectClause, sql)
    }

    // Handle simple column selection
    const columns = this.parseSelectColumns(selectClause, data[0] || {})
    let rows = data.map(row => {
      const result: Record<string, any> = {}
      columns.forEach(col => {
        // Handle table-qualified column names like 'users.name'
        let value = null
        if (col.name.includes('.')) {
          const columnName = col.name.split('.').pop()
          value = row[columnName || col.name]
        } else {
          value = row[col.name]
        }
        result[col.name] = value !== undefined ? value : null
      })
      return result
    })

    // Handle GROUP BY if present
    const groupByMatch = sql.match(/GROUP\s+BY\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/is)
    if (groupByMatch) {
      const groupByColumns = groupByMatch[1].split(',').map(col => col.trim())
      // Group the data by the specified columns
      const grouped = this.groupData(rows, groupByColumns)
      rows = grouped
    }

    // Handle ORDER BY
    const orderByMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/is)
    if (orderByMatch) {
      const orderByColumns = orderByMatch[1].split(',').map(col => col.trim())
      rows = this.sortData(rows, orderByColumns)
    }

    // Handle LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
    if (limitMatch) {
      const limit = parseInt(limitMatch[1])
      rows = rows.slice(0, limit)
    }

    return { columns, rows }
  }

  private static getTableData(tableName: string): Record<string, any>[] {
    const table = mockData[tableName as keyof typeof mockData]
    if (!table) {
      throw new Error(`Table '${tableName}' not found`)
    }
    return [...table] // Return a copy
  }

  private static applyWhereConditions(data: Record<string, any>[], whereClause: string): Record<string, any>[] {
    // Very basic WHERE clause parsing - supports simple conditions
    return data.filter(row => {
      // Simple equality check for demo
      const conditions = whereClause.split(/\s+AND\s+/i)
      return conditions.every(condition => {
        const match = condition.trim().match(/(\w+)\.(\w+)\s*=\s*'(.+)'/i)
        if (match) {
          const [, , column, value] = match
          return String(row[column]) === value
        }
        return true
      })
    })
  }

  private static parseSelectColumns(selectClause: string, sampleRow: Record<string, any>): { name: string; type: string }[] {
    if (selectClause.trim() === '*') {
      return Object.keys(sampleRow).map(key => ({
        name: key,
        type: this.inferType(sampleRow[key])
      }))
    }

    return selectClause.split(',').map(col => {
      const trimmed = col.trim()
      const aliasMatch = trimmed.match(/(.+)\s+AS\s+(.+)/i)
      
      if (aliasMatch) {
        return {
          name: aliasMatch[2].replace(/"/g, ''),
          type: 'string'
        }
      }

      // Keep the full field name for table-qualified columns
      const fieldName = trimmed.replace(/^\w+\./, '') // Remove table prefix for display
      return {
        name: fieldName || trimmed,
        type: 'string'
      }
    })
  }

  private static executeAggregateQuery(data: Record<string, any>[], selectClause: string, _fullSql: string): { columns: { name: string; type: string }[], rows: Record<string, any>[] } {
    // Handle COUNT() queries
    if (selectClause.toUpperCase().includes('COUNT(')) {
      const countMatch = selectClause.match(/COUNT\(([^)]+)\)/i)
      if (countMatch) {
        const column = countMatch[1]
        let count = 0
        if (column === '*' || column.toUpperCase() === 'DISTINCT') {
          count = data.length
        } else {
          // Count non-null values
          const columnName = column.includes('.') ? column.split('.').pop() : column
          count = data.filter(row => row[columnName!] != null).length
        }
        return {
          columns: [{ name: 'count', type: 'number' }],
          rows: [{ count }]
        }
      }
    }

    // Handle SUM queries
    if (selectClause.toUpperCase().includes('SUM(')) {
      const sumMatch = selectClause.match(/SUM\(([^)]+)\)/i)
      if (sumMatch) {
        const column = sumMatch[1]
        const columnName = column.includes('.') ? column.split('.').pop() : column
        const sum = data.reduce((acc, row) => {
          const value = Number(row[columnName!])
          return acc + (isNaN(value) ? 0 : value)
        }, 0)
        return {
          columns: [{ name: 'sum', type: 'number' }],
          rows: [{ sum }]
        }
      }
    }

    // Handle AVG queries
    if (selectClause.toUpperCase().includes('AVG(')) {
      const avgMatch = selectClause.match(/AVG\(([^)]+)\)/i)
      if (avgMatch) {
        const column = avgMatch[1]
        const columnName = column.includes('.') ? column.split('.').pop() : column
        const validValues = data.map(row => Number(row[columnName!])).filter(val => !isNaN(val))
        const avg = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0
        return {
          columns: [{ name: 'avg', type: 'number' }],
          rows: [{ avg: Math.round(avg * 100) / 100 }]
        }
      }
    }

    // Handle MAX queries
    if (selectClause.toUpperCase().includes('MAX(')) {
      const maxMatch = selectClause.match(/MAX\(([^)]+)\)/i)
      if (maxMatch) {
        const column = maxMatch[1]
        const columnName = column.includes('.') ? column.split('.').pop() : column
        const max = data.reduce((acc, row) => {
          const value = Number(row[columnName!])
          return Math.max(acc, isNaN(value) ? -Infinity : value)
        }, -Infinity)
        return {
          columns: [{ name: 'max', type: 'number' }],
          rows: [{ max: max === -Infinity ? 0 : max }]
        }
      }
    }

    // Handle MIN queries
    if (selectClause.toUpperCase().includes('MIN(')) {
      const minMatch = selectClause.match(/MIN\(([^)]+)\)/i)
      if (minMatch) {
        const column = minMatch[1]
        const columnName = column.includes('.') ? column.split('.').pop() : column
        const min = data.reduce((acc, row) => {
          const value = Number(row[columnName!])
          return Math.min(acc, isNaN(value) ? Infinity : value)
        }, Infinity)
        return {
          columns: [{ name: 'min', type: 'number' }],
          rows: [{ min: min === Infinity ? 0 : min }]
        }
      }
    }

    // Handle multiple aggregations or mixed queries
    const aggregationMatches = selectClause.match(/(COUNT|SUM|AVG|MIN|MAX)\([^)]+\)/gi)
    if (aggregationMatches && aggregationMatches.length > 1) {
      // Handle multiple aggregations
      const result: Record<string, any> = {}
      const columns: { name: string; type: string }[] = []
      
      aggregationMatches.forEach(match => {
        const type = match.split('(')[0].toLowerCase()
        const column = match.match(/\(([^)]+)\)/)?.[1]
        const columnName = column?.includes('.') ? column.split('.').pop() : column
        
        columns.push({ name: type, type: 'number' })
        
        switch (type.toUpperCase()) {
          case 'COUNT':
            result[type] = data.length
            break
          case 'SUM':
            result[type] = data.reduce((acc, row) => acc + (Number(row[columnName!]) || 0), 0)
            break
          case 'AVG':
            const validValues = data.map(row => Number(row[columnName!])).filter(val => !isNaN(val))
            result[type] = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0
            break
          case 'MAX':
            result[type] = data.reduce((acc, row) => Math.max(acc, Number(row[columnName!]) || -Infinity), -Infinity)
            break
          case 'MIN':
            result[type] = data.reduce((acc, row) => Math.min(acc, Number(row[columnName!]) || Infinity), Infinity)
            break
        }
      })
      
      return {
        columns,
        rows: [result]
      }
    }

    // If no aggregations found, return actual data
    const firstRow = data[0] || {}
    const columns = Object.keys(firstRow).map(key => ({
      name: key,
      type: this.inferType(firstRow[key])
    }))
    
    return {
      columns,
      rows: data.slice(0, 10) // Return first 10 rows
    }
  }

  private static inferType(value: any): string {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (value instanceof Date) return 'date'
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date'
    return 'string'
  }

  static async createTable(tableName: string, sql: string): Promise<void> {
    // Simulate table creation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In a real implementation, this would execute the CREATE TABLE statement
    console.log(`Mock: Creating table '${tableName}' with query:`, sql)
    
    // Simulate success or failure
    if (tableName.toLowerCase().includes('error')) {
      throw new Error('Table name contains invalid characters')
    }
    
    // Mock success
    return Promise.resolve()
  }

  private static groupData(data: Record<string, any>[], groupByColumns: string[]): Record<string, any>[] {
    // Simple grouping implementation - groups by first column for demo
    const groupBy = groupByColumns[0]
    const columnName = groupBy.includes('.') ? groupBy.split('.').pop() : groupBy
    
    const grouped = data.reduce((acc, row) => {
      const key = row[columnName!]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(row)
      return acc
    }, {} as Record<string, any[]>)
    
    // Return first row of each group
    return Object.values(grouped).map(group => group[0])
  }

  private static sortData(data: Record<string, any>[], orderByColumns: string[]): Record<string, any>[] {
    if (orderByColumns.length === 0) return data
    
    const sortColumn = orderByColumns[0]
    const isDesc = sortColumn.toUpperCase().includes('DESC')
    const columnName = sortColumn.replace(/\s+(ASC|DESC)/i, '').trim()
    const actualColumn = columnName.includes('.') ? columnName.split('.').pop() : columnName
    
    return [...data].sort((a, b) => {
      const aVal = a[actualColumn!]
      const bVal = b[actualColumn!]
      
      if (aVal === bVal) return 0
      
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else {
        comparison = (aVal || 0) - (bVal || 0)
      }
      
      return isDesc ? -comparison : comparison
    })
  }
}
