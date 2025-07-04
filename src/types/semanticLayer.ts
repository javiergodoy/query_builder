// Semantic Layer - Field definitions with metadata
export interface FieldMetadata {
  id: string
  name: string
  displayName: string
  description: string
  type: 'dimension' | 'metric' | 'filter'
  dataType: 'string' | 'number' | 'date' | 'boolean'
  sourceTable: string
  sourceColumn: string
  aggregation?: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX' | 'COUNT_DISTINCT'
  format?: string
  category?: string
}

export interface SemanticLayer {
  dimensions: FieldMetadata[]
  metrics: FieldMetadata[]
  filters: FieldMetadata[]
}

// Mock semantic layer data
export const mockSemanticLayer: SemanticLayer = {
  dimensions: [
    {
      id: 'user_id',
      name: 'user_id',
      displayName: 'User ID',
      description: 'Unique identifier for users',
      type: 'dimension',
      dataType: 'number',
      sourceTable: 'users',
      sourceColumn: 'id',
      category: 'User'
    },
    {
      id: 'user_name',
      name: 'user_name',
      displayName: 'User Name',
      description: 'Full name of the user',
      type: 'dimension',
      dataType: 'string',
      sourceTable: 'users',
      sourceColumn: 'name',
      category: 'User'
    },
    {
      id: 'user_email',
      name: 'user_email',
      displayName: 'User Email',
      description: 'Email address of the user',
      type: 'dimension',
      dataType: 'string',
      sourceTable: 'users',
      sourceColumn: 'email',
      category: 'User'
    },
    {
      id: 'product_name',
      name: 'product_name',
      displayName: 'Product Name',
      description: 'Name of the product',
      type: 'dimension',
      dataType: 'string',
      sourceTable: 'products',
      sourceColumn: 'name',
      category: 'Product'
    },
    {
      id: 'product_category',
      name: 'product_category',
      displayName: 'Product Category',
      description: 'Category that the product belongs to',
      type: 'dimension',
      dataType: 'string',
      sourceTable: 'categories',
      sourceColumn: 'name',
      category: 'Product'
    },
    {
      id: 'order_date',
      name: 'order_date',
      displayName: 'Order Date',
      description: 'Date when the order was placed',
      type: 'dimension',
      dataType: 'date',
      sourceTable: 'orders',
      sourceColumn: 'order_date',
      category: 'Order',
      format: 'YYYY-MM-DD'
    }
  ],
  metrics: [
    {
      id: 'total_orders',
      name: 'total_orders',
      displayName: 'Total Orders',
      description: 'Total number of orders',
      type: 'metric',
      dataType: 'number',
      sourceTable: 'orders',
      sourceColumn: 'id',
      aggregation: 'COUNT',
      category: 'Sales'
    },
    {
      id: 'total_revenue',
      name: 'total_revenue',
      displayName: 'Total Revenue',
      description: 'Sum of all order totals',
      type: 'metric',
      dataType: 'number',
      sourceTable: 'orders',
      sourceColumn: 'total',
      aggregation: 'SUM',
      category: 'Sales',
      format: '$#,##0.00'
    },
    {
      id: 'avg_order_value',
      name: 'avg_order_value',
      displayName: 'Average Order Value',
      description: 'Average value of orders',
      type: 'metric',
      dataType: 'number',
      sourceTable: 'orders',
      sourceColumn: 'total',
      aggregation: 'AVG',
      category: 'Sales',
      format: '$#,##0.00'
    },
    {
      id: 'total_customers',
      name: 'total_customers',
      displayName: 'Total Customers',
      description: 'Total number of unique customers',
      type: 'metric',
      dataType: 'number',
      sourceTable: 'users',
      sourceColumn: 'id',
      aggregation: 'COUNT_DISTINCT',
      category: 'Customer'
    },
    {
      id: 'product_quantity',
      name: 'product_quantity',
      displayName: 'Product Quantity',
      description: 'Total quantity of products ordered',
      type: 'metric',
      dataType: 'number',
      sourceTable: 'orders',
      sourceColumn: 'quantity',
      aggregation: 'SUM',
      category: 'Product'
    }
  ],
  filters: [
    {
      id: 'user_email_filter',
      name: 'user_email_filter',
      displayName: 'User Email Filter',
      description: 'Filter orders by user email',
      type: 'filter',
      dataType: 'string',
      sourceTable: 'users',
      sourceColumn: 'email',
      category: 'User'
    },
    {
      id: 'order_date_filter',
      name: 'order_date_filter',
      displayName: 'Order Date Filter',
      description: 'Filter orders by date range',
      type: 'filter',
      dataType: 'date',
      sourceTable: 'orders',
      sourceColumn: 'order_date',
      category: 'Order'
    },
    {
      id: 'product_price_filter',
      name: 'product_price_filter',
      displayName: 'Product Price Filter',
      description: 'Filter products by price range',
      type: 'filter',
      dataType: 'number',
      sourceTable: 'products',
      sourceColumn: 'price',
      category: 'Product'
    },
    {
      id: 'category_filter',
      name: 'category_filter',
      displayName: 'Category Filter',
      description: 'Filter by product category',
      type: 'filter',
      dataType: 'string',
      sourceTable: 'categories',
      sourceColumn: 'name',
      category: 'Product'
    }
  ]
}

// Query canvas zones for drag and drop
export interface CanvasZone {
  id: string
  name: string
  description: string
  acceptedTypes: ('dimension' | 'metric' | 'filter')[]
  maxItems?: number
}

export const canvasZones: CanvasZone[] = [
  {
    id: 'select',
    name: 'SELECT',
    description: 'Drag dimensions and metrics here',
    acceptedTypes: ['dimension', 'metric'],
    maxItems: 10 // Allow up to 10 fields in SELECT
  },
  {
    id: 'where',
    name: 'WHERE',
    description: 'Drag filters here to add conditions',
    acceptedTypes: ['filter'],
    maxItems: 5 // Allow up to 5 filters
  },
  {
    id: 'groupby',
    name: 'GROUP BY',
    description: 'Drag dimensions here for grouping',
    acceptedTypes: ['dimension'],
    maxItems: 5 // Allow up to 5 group by fields
  },
  {
    id: 'orderby',
    name: 'ORDER BY',
    description: 'Drag fields here for sorting',
    acceptedTypes: ['dimension', 'metric'],
    maxItems: 3
  }
]
