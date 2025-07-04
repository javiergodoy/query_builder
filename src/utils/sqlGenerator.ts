import type { AdvancedQuery, QueryField, QueryFilter } from '../types/query'

export class SqlGenerator {
  static generateSql(query: AdvancedQuery): string {
    const parts: string[] = []

    // SELECT clause
    if (query.select.length === 0) {
      return '-- Please add fields to SELECT'
    }

    const selectFields = query.select.map(field => {
      let sql = this.formatFieldForSelect(field)
      if (field.alias) {
        sql += ` AS "${field.alias}"`
      }
      return sql
    })

    parts.push(`SELECT ${selectFields.join(',\n       ')}`)

    // FROM clause - Generate based on the fields used
    const tables = this.extractTablesFromQuery(query)
    if (tables.length === 0) {
      return '-- Unable to determine tables from selected fields'
    }

    parts.push(`FROM ${tables.join(', ')}`)

    // WHERE clause
    if (query.where.length > 0) {
      const whereConditions = query.where
        .filter(filter => filter.value !== '' && filter.value !== null && filter.value !== undefined)
        .map(filter => this.formatFilter(filter))
        .filter(condition => condition)

      if (whereConditions.length > 0) {
        parts.push(`WHERE ${whereConditions.join('\n  AND ')}`)
      }
    }

    // GROUP BY clause
    if (query.groupBy.length > 0) {
      const groupByFields = query.groupBy.map(field => 
        `${field.field.sourceTable}.${field.field.sourceColumn}`
      )
      parts.push(`GROUP BY ${groupByFields.join(', ')}`)
    } else if (this.hasAggregates(query)) {
      // Auto-generate GROUP BY for dimensions when metrics are present
      const dimensions = query.select.filter(field => field.field.type === 'dimension')
      if (dimensions.length > 0) {
        const groupByFields = dimensions.map(field => 
          `${field.field.sourceTable}.${field.field.sourceColumn}`
        )
        parts.push(`GROUP BY ${groupByFields.join(', ')}`)
      }
    }

    // ORDER BY clause
    if (query.orderBy.length > 0) {
      const orderByFields = query.orderBy.map(field => {
        const fieldRef = field.alias || 
          (field.field.aggregation 
            ? `${field.field.aggregation}(${field.field.sourceTable}.${field.field.sourceColumn})`
            : `${field.field.sourceTable}.${field.field.sourceColumn}`)
        return fieldRef
      })
      parts.push(`ORDER BY ${orderByFields.join(', ')}`)
    }

    // LIMIT clause
    if (query.limit && query.limit > 0) {
      parts.push(`LIMIT ${query.limit}`)
    }

    const finalSql = parts.join('\n')
    return finalSql
  }

  private static formatFieldForSelect(field: QueryField): string {
    const { sourceTable, sourceColumn, aggregation } = field.field
    
    if (aggregation) {
      return `${aggregation}(${sourceTable}.${sourceColumn})`
    }
    
    return `${sourceTable}.${sourceColumn}`
  }

  private static formatFilter(filter: QueryFilter): string {
    const { sourceTable, sourceColumn, dataType } = filter.field
    const { operator, value } = filter
    const fieldRef = `${sourceTable}.${sourceColumn}`

    // Handle NULL operators
    if (operator === 'IS NULL') {
      return `${fieldRef} IS NULL`
    }
    if (operator === 'IS NOT NULL') {
      return `${fieldRef} IS NOT NULL`
    }

    // Handle IN and NOT IN operators
    if (operator === 'IN' || operator === 'NOT IN') {
      const values = String(value).split(',').map(v => this.formatValue(v.trim(), dataType))
      return `${fieldRef} ${operator} (${values.join(', ')})`
    }

    // Handle BETWEEN operator
    if (operator === 'BETWEEN') {
      const values = String(value).split(',').map(v => v.trim())
      if (values.length === 2) {
        return `${fieldRef} BETWEEN ${this.formatValue(values[0], dataType)} AND ${this.formatValue(values[1], dataType)}`
      }
    }

    // Handle LIKE operator
    if (operator === 'LIKE') {
      return `${fieldRef} LIKE '%${String(value).replace(/'/g, "''")}%'`
    }

    // Standard operators
    return `${fieldRef} ${operator} ${this.formatValue(value, dataType)}`
  }

  private static formatValue(value: string | number | Date, dataType: string): string {
    if (value === null || value === undefined || value === '') {
      return 'NULL'
    }

    switch (dataType) {
      case 'string':
        return `'${String(value).replace(/'/g, "''")}'`
      case 'number':
        return String(value)
      case 'date':
        if (value instanceof Date) {
          return `'${value.toISOString().split('T')[0]}'`
        }
        return `'${value}'`
      case 'boolean':
        return String(value).toLowerCase() === 'true' ? 'TRUE' : 'FALSE'
      default:
        return `'${String(value).replace(/'/g, "''")}'`
    }
  }

  private static extractTablesFromQuery(query: AdvancedQuery): string[] {
    const tables = new Set<string>()

    // Collect tables from SELECT fields
    query.select.forEach(field => {
      tables.add(field.field.sourceTable)
    })

    // Collect tables from WHERE filters
    query.where.forEach(filter => {
      tables.add(filter.field.sourceTable)
    })

    // Collect tables from GROUP BY fields
    query.groupBy.forEach(field => {
      tables.add(field.field.sourceTable)
    })

    // Collect tables from ORDER BY fields
    query.orderBy.forEach(field => {
      tables.add(field.field.sourceTable)
    })

    return Array.from(tables).sort()
  }

  private static hasAggregates(query: AdvancedQuery): boolean {
    return query.select.some(field => field.field.aggregation)
  }

  static validateSql(sql: string): { isValid: boolean; error?: string } {
    try {
      // Basic SQL validation
      const trimmed = sql.trim().toUpperCase()
      
      if (!trimmed) {
        return { isValid: false, error: 'SQL query is empty' }
      }

      if (!trimmed.startsWith('SELECT')) {
        return { isValid: false, error: 'Query must start with SELECT' }
      }

      if (!trimmed.includes('FROM')) {
        return { isValid: false, error: 'Query must include FROM clause' }
      }

      // Check for basic SQL injection patterns
      const dangerousPatterns = [
        /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\s+/i,
        /UNION\s+SELECT/i,
        /--\s*$/m
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(sql)) {
          return { isValid: false, error: 'Potentially dangerous SQL detected' }
        }
      }

      return { isValid: true }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid SQL syntax' 
      }
    }
  }
}
