import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Database, BarChart3, Filter as FilterIcon } from 'lucide-react'
import { DraggableField } from './DraggableField'
import { DropZone } from './DropZone'
import { FieldSearch } from './FieldSearch'
import type { FieldMetadata } from '../types/semanticLayer'
import { canvasZones } from '../types/semanticLayer'
import type { AdvancedQuery, QueryField, QueryFilter } from '../types/query'

interface AdvancedQueryBuilderProps {
  dimensions: FieldMetadata[]
  metrics: FieldMetadata[]
  filters: FieldMetadata[]
  query: AdvancedQuery
  onQueryChange: (query: AdvancedQuery) => void
}

export const AdvancedQueryBuilder: React.FC<AdvancedQueryBuilderProps> = ({
  dimensions,
  metrics,
  filters,
  query,
  onQueryChange
}) => {
  const [filteredDimensions, setFilteredDimensions] = useState(dimensions)
  const [filteredMetrics, setFilteredMetrics] = useState(metrics)
  const [filteredFilters, setFilteredFilters] = useState(filters)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [activeField, setActiveField] = useState<FieldMetadata | null>(null)

  // Configure sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for more responsive dragging
      },
    })
  )

  // Cleanup dragging class on component unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('dragging')
    }
  }, [])

  const validateQuery = useCallback(() => {
    const errors: Record<string, string> = {}

    // Check if SELECT has fields
    if (query.select.length === 0) {
      errors.select = 'At least one dimension or metric is required'
    }

    // Check for GROUP BY validation when metrics are used
    const hasMetrics = query.select.some(field => field.field.type === 'metric')
    const hasDimensions = query.select.some(field => field.field.type === 'dimension')
    
    if (hasMetrics && hasDimensions && query.groupBy.length === 0) {
      errors.groupby = 'GROUP BY is required when using both dimensions and metrics'
    }

    // Check ORDER BY limit
    if (query.orderBy.length > 3) {
      errors.orderby = 'Maximum 3 fields allowed in ORDER BY'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [query])

  const handleDragStart = (event: DragStartEvent) => {
    const field = event.active.data.current?.field as FieldMetadata
    setActiveField(field)
    // Add dragging class to body for global cursor
    document.body.classList.add('dragging')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveField(null) // Clear active field when drag ends
    // Remove dragging class from body
    document.body.classList.remove('dragging')

    if (!over) return

    const draggedField = active.data.current?.field as FieldMetadata
    const targetZone = over.data.current?.zone
    const targetAcceptedTypes = over.data.current?.acceptedTypes as string[]

    if (!draggedField || !targetZone || !targetAcceptedTypes.includes(draggedField.type)) {
      return
    }

    // Check if item already exists in the zone
    const existsInZone = getZoneItems(targetZone.id).some(item => item.field.id === draggedField.id)
    if (existsInZone) return

    // Check zone limits
    if (targetZone.maxItems && getZoneItems(targetZone.id).length >= targetZone.maxItems) {
      return
    }

    const newItem = createQueryItem(draggedField, targetZone.id)
    addItemToZone(targetZone.id, newItem)
  }

  const getZoneItems = (zoneId: string): QueryField[] | QueryFilter[] => {
    switch (zoneId) {
      case 'select':
        return query.select
      case 'where':
        return query.where
      case 'groupby':
        return query.groupBy
      case 'orderby':
        return query.orderBy
      default:
        return []
    }
  }

  const createQueryItem = (field: FieldMetadata, zoneId: string): QueryField | QueryFilter => {
    const baseItem = {
      id: `${field.id}_${Date.now()}`,
      field: field
    }

    if (zoneId === 'where') {
      return {
        ...baseItem,
        operator: '=',
        value: ''
      } as QueryFilter
    }

    return baseItem as QueryField
  }

  const addItemToZone = (zoneId: string, item: QueryField | QueryFilter) => {
    const newQuery = { ...query }

    switch (zoneId) {
      case 'select':
        newQuery.select = [...newQuery.select, item as QueryField]
        break
      case 'where':
        newQuery.where = [...newQuery.where, item as QueryFilter]
        break
      case 'groupby':
        newQuery.groupBy = [...newQuery.groupBy, item as QueryField]
        break
      case 'orderby':
        newQuery.orderBy = [...newQuery.orderBy, item as QueryField]
        break
    }

    onQueryChange(newQuery)
    validateQuery()
  }

  const removeItemFromZone = (zoneId: string, itemId: string) => {
    const newQuery = { ...query }

    switch (zoneId) {
      case 'select':
        newQuery.select = newQuery.select.filter(item => item.id !== itemId)
        break
      case 'where':
        newQuery.where = newQuery.where.filter(item => item.id !== itemId)
        break
      case 'groupby':
        newQuery.groupBy = newQuery.groupBy.filter(item => item.id !== itemId)
        break
      case 'orderby':
        newQuery.orderBy = newQuery.orderBy.filter(item => item.id !== itemId)
        break
    }

    onQueryChange(newQuery)
    validateQuery()
  }

  const updateItemInZone = (zoneId: string, itemId: string, updates: Partial<QueryField | QueryFilter>) => {
    const newQuery = { ...query }

    switch (zoneId) {
      case 'select':
        newQuery.select = newQuery.select.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
        break
      case 'where':
        newQuery.where = newQuery.where.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
        break
      case 'groupby':
        newQuery.groupBy = newQuery.groupBy.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
        break
      case 'orderby':
        newQuery.orderBy = newQuery.orderBy.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
        break
    }

    onQueryChange(newQuery)
  }

  return (
    <div className="advanced-query-builder">
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="builder-layout">
          {/* Left Panel - Available Fields */}
          <div className="fields-panel">
            <div className="panel-section">
              <div className="section-header">
                <Database size={20} />
                <h3>Dimensions</h3>
                <span className="field-count">{filteredDimensions.length}</span>
              </div>
              <FieldSearch
                fields={dimensions}
                onFilter={setFilteredDimensions}
                placeholder="Search dimensions..."
              />
              <div className="fields-list">
                {filteredDimensions.map(field => (
                  <DraggableField key={field.id} field={field} />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">
                <BarChart3 size={20} />
                <h3>Metrics</h3>
                <span className="field-count">{filteredMetrics.length}</span>
              </div>
              <FieldSearch
                fields={metrics}
                onFilter={setFilteredMetrics}
                placeholder="Search metrics..."
              />
              <div className="fields-list">
                {filteredMetrics.map(field => (
                  <DraggableField key={field.id} field={field} />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">
                <FilterIcon size={20} />
                <h3>Filters</h3>
                <span className="field-count">{filteredFilters.length}</span>
              </div>
              <FieldSearch
                fields={filters}
                onFilter={setFilteredFilters}
                placeholder="Search filters..."
              />
              <div className="fields-list">
                {filteredFilters.map(field => (
                  <DraggableField key={field.id} field={field} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Query Canvas */}
          <div className="canvas-panel">
            <div className="canvas-header">
              <h3>Query Builder Canvas</h3>
              <div className="canvas-info">
                Drag fields from the left panel to build your query
              </div>
            </div>
            
            <div className="drop-zones">
              {canvasZones.map(zone => (
                <DropZone
                  key={zone.id}
                  zone={zone}
                  items={getZoneItems(zone.id)}
                  onRemoveItem={(itemId) => removeItemFromZone(zone.id, itemId)}
                  onUpdateItem={(itemId, updates) => updateItemInZone(zone.id, itemId, updates)}
                  error={validationErrors[zone.id]}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DragOverlay>
          {activeField ? (
            <div className={`drag-overlay ${activeField ? 'dragging' : ''}`}>
              <DraggableField 
                field={activeField} 
                showTooltip={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
