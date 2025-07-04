// Dynamic semantic layer generator from database schema
import type { FieldMetadata, SemanticLayer } from '../types/semanticLayer'
import type { DatabaseTable } from './apiService'
import { apiService } from './apiService'

export class SemanticLayerService {
  private static instance: SemanticLayerService
  private semanticLayer: SemanticLayer | null = null

  private constructor() {}

  static getInstance(): SemanticLayerService {
    if (!SemanticLayerService.instance) {
      SemanticLayerService.instance = new SemanticLayerService()
    }
    return SemanticLayerService.instance
  }

  async generateSemanticLayer(): Promise<SemanticLayer> {
    try {
      const tables = await apiService.fetchSchema()
      
      const dimensions: FieldMetadata[] = []
      const metrics: FieldMetadata[] = []
      const filters: FieldMetadata[] = []

      tables.forEach(table => {
        table.columns.forEach(column => {
          // Create dimension fields for most columns
          if (this.shouldCreateDimension(column, table)) {
            dimensions.push(this.createDimensionField(column, table))
          }

          // Create metric fields for numeric columns
          if (this.shouldCreateMetric(column, table)) {
            metrics.push(...this.createMetricFields(column, table))
          }

          // Create filter fields for filterable columns
          if (this.shouldCreateFilter(column, table)) {
            filters.push(this.createFilterField(column, table))
          }
        })
      })

      this.semanticLayer = {
        dimensions,
        metrics,
        filters
      }

      return this.semanticLayer
    } catch (error) {
      console.error('Failed to generate semantic layer:', error)
      throw error
    }
  }

  getSemanticLayer(): SemanticLayer | null {
    return this.semanticLayer
  }

  private shouldCreateDimension(column: any, _table: DatabaseTable): boolean {
    // Create dimensions for columns that are useful for grouping
    const isDimensionType = ['string', 'date', 'boolean'].includes(column.type)
    const isPrimaryKey = column.constraint === 'PRIMARY KEY'
    
    // Allow string and date columns, but exclude primary keys unless they're meaningful IDs
    if (isDimensionType && !isPrimaryKey) {
      return true
    }
    
    // Allow foreign keys as dimensions (they're useful for joining)
    if (column.constraint === 'FOREIGN KEY') {
      return true
    }
    
    return false
  }

  private shouldCreateMetric(column: any, _table: DatabaseTable): boolean {
    // Create metrics for numeric columns that can be aggregated
    const isNumeric = column.type === 'number'
    
    if (!isNumeric) return false
    
    const isId = this.isIdField(column.name)
    const isPrice = this.isPriceField(column.name)
    const isQuantity = this.isQuantityField(column.name)
    
    // Create metrics for IDs (for counting), prices, quantities, and other numeric fields
    return isId || isPrice || isQuantity
  }

  private shouldCreateFilter(column: any, _table: DatabaseTable): boolean {
    // Create filters for commonly filtered columns
    const isFilterable = ['string', 'date', 'number', 'boolean'].includes(column.type)
    const isUsefulForFiltering = this.isCommonFilterField(column.name) || 
                                column.type === 'date' || 
                                column.type === 'boolean'
    
    return isFilterable && isUsefulForFiltering
  }

  private createDimensionField(column: any, table: DatabaseTable): FieldMetadata {
    return {
      id: `${table.name}_${column.name}`,
      name: `${table.name}_${column.name}`,
      displayName: this.formatDisplayName(table.name, column.name),
      description: `${this.formatDisplayName(table.name, column.name)} from ${table.name} table`,
      type: 'dimension',
      dataType: column.type,
      sourceTable: table.name,
      sourceColumn: column.name,
      category: this.getCategory(table.name),
      format: this.getFormat(column.type, column.name)
    }
  }

  private createMetricFields(column: any, table: DatabaseTable): FieldMetadata[] {
    const metrics: FieldMetadata[] = []
    const baseId = `${table.name}_${column.name}`
    const baseName = this.formatDisplayName(table.name, column.name)

    if (this.isIdField(column.name)) {
      // Create COUNT for ID fields
      metrics.push({
        id: `${baseId}_count`,
        name: `${baseId}_count`,
        displayName: `Total ${table.name.replace(/s$/, '')}s`,
        description: `Count of ${table.name}`,
        type: 'metric',
        dataType: 'number',
        sourceTable: table.name,
        sourceColumn: column.name,
        aggregation: 'COUNT',
        category: this.getCategory(table.name)
      })

      // Create COUNT DISTINCT for ID fields
      metrics.push({
        id: `${baseId}_count_distinct`,
        name: `${baseId}_count_distinct`,
        displayName: `Unique ${table.name.replace(/s$/, '')}s`,
        description: `Count of unique ${table.name}`,
        type: 'metric',
        dataType: 'number',
        sourceTable: table.name,
        sourceColumn: column.name,
        aggregation: 'COUNT_DISTINCT',
        category: this.getCategory(table.name)
      })
    }

    if (this.isPriceField(column.name) || this.isQuantityField(column.name)) {
      const aggregations: Array<'SUM' | 'AVG' | 'MIN' | 'MAX'> = ['SUM', 'AVG', 'MIN', 'MAX']
      
      aggregations.forEach(agg => {
        metrics.push({
          id: `${baseId}_${agg.toLowerCase()}`,
          name: `${baseId}_${agg.toLowerCase()}`,
          displayName: `${agg} ${baseName}`,
          description: `${agg} of ${baseName}`,
          type: 'metric',
          dataType: 'number',
          sourceTable: table.name,
          sourceColumn: column.name,
          aggregation: agg,
          category: this.getCategory(table.name),
          format: this.isPriceField(column.name) ? '$#,##0.00' : '#,##0.##'
        })
      })
    }

    return metrics
  }

  private createFilterField(column: any, table: DatabaseTable): FieldMetadata {
    return {
      id: `${table.name}_${column.name}_filter`,
      name: `${table.name}_${column.name}_filter`,
      displayName: `${this.formatDisplayName(table.name, column.name)} Filter`,
      description: `Filter by ${this.formatDisplayName(table.name, column.name)}`,
      type: 'filter',
      dataType: column.type,
      sourceTable: table.name,
      sourceColumn: column.name,
      category: this.getCategory(table.name)
    }
  }

  private isIdField(columnName: string): boolean {
    return columnName.toLowerCase().includes('id')
  }

  private isPriceField(columnName: string): boolean {
    const priceFields = ['price', 'cost', 'amount', 'total', 'revenue', 'value']
    return priceFields.some(field => columnName.toLowerCase().includes(field))
  }

  private isQuantityField(columnName: string): boolean {
    const quantityFields = ['quantity', 'qty', 'count', 'num', 'number']
    return quantityFields.some(field => columnName.toLowerCase().includes(field))
  }

  private isCommonFilterField(columnName: string): boolean {
    const filterFields = ['name', 'email', 'status', 'type', 'category', 'description']
    return filterFields.some(field => columnName.toLowerCase().includes(field))
  }

  private formatDisplayName(tableName: string, columnName: string): string {
    // Convert snake_case to Title Case
    const formatted = columnName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Add table context if not obvious
    if (!formatted.toLowerCase().includes(tableName.replace(/s$/, ''))) {
      const tableLabel = tableName.charAt(0).toUpperCase() + tableName.slice(1, -1) // Remove 's' from plural
      return `${tableLabel} ${formatted}`
    }
    
    return formatted
  }

  private getCategory(tableName: string): string {
    const categoryMap: Record<string, string> = {
      users: 'Customer',
      customers: 'Customer',
      orders: 'Sales',
      sales: 'Sales',
      products: 'Product',
      categories: 'Product',
      invoices: 'Finance',
      payments: 'Finance'
    }
    
    return categoryMap[tableName.toLowerCase()] || 
           tableName.charAt(0).toUpperCase() + tableName.slice(1)
  }

  private getFormat(dataType: string, columnName: string): string | undefined {
    if (dataType === 'date') {
      return 'YYYY-MM-DD'
    }
    
    if (this.isPriceField(columnName)) {
      return '$#,##0.00'
    }
    
    if (dataType === 'number' && this.isQuantityField(columnName)) {
      return '#,##0'
    }
    
    return undefined
  }
}

export const semanticLayerService = SemanticLayerService.getInstance()
export default semanticLayerService
