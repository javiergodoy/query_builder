import type { FieldMetadata } from './semanticLayer'

export interface QueryField {
  id: string
  field: FieldMetadata
  alias?: string
}

export interface QueryFilter {
  id: string
  field: FieldMetadata
  operator: string
  value: string | number | Date
  values?: (string | number | Date)[] // For IN operator
}

export interface AdvancedQuery {
  id?: string
  name?: string
  description?: string
  select: QueryField[]
  where: QueryFilter[]
  groupBy: QueryField[]
  orderBy: QueryField[]
  limit?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface QueryResult {
  columns: { name: string; type: string }[]
  rows: Record<string, any>[]
  totalRows?: number // Keep for backward compatibility
  rowCount?: number  // Add for PostgreSQL compatibility
  executionTime: number
  success?: boolean
  error?: string
}

export interface SavedQuery {
  id: string
  name: string
  description?: string
  query: AdvancedQuery
  sql: string
  createdAt: Date
  updatedAt: Date
}
