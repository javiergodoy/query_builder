import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X, GripVertical, Settings } from 'lucide-react'
import type { QueryField, QueryFilter } from '../types/query'
import type { CanvasZone } from '../types/semanticLayer'

interface SortableFieldItemProps {
  item: QueryField | QueryFilter
  zone: CanvasZone
  onRemove: () => void
  onUpdate?: (updates: Partial<QueryField | QueryFilter>) => void
}

const filterOperators = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater or Equal' },
  { value: '<=', label: 'Less or Equal' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'IN', label: 'In List' },
  { value: 'NOT IN', label: 'Not In List' },
  { value: 'BETWEEN', label: 'Between' },
  { value: 'IS NULL', label: 'Is Null' },
  { value: 'IS NOT NULL', label: 'Is Not Null' }
]

export const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  item,
  zone,
  onRemove,
  onUpdate
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [localAlias, setLocalAlias] = useState((item as QueryField).alias || '')
  const [localOperator, setLocalOperator] = useState((item as QueryFilter).operator || '=')
  const [localValue, setLocalValue] = useState((item as QueryFilter).value?.toString() || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isFilter = zone.id === 'where'

  const handleAliasChange = (alias: string) => {
    setLocalAlias(alias)
    if (onUpdate) {
      onUpdate({ alias } as Partial<QueryField>)
    }
  }

  const handleFilterChange = (operator: string, value: string) => {
    setLocalOperator(operator)
    setLocalValue(value)
    if (onUpdate) {
      onUpdate({ operator, value } as Partial<QueryFilter>)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`sortable-field-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="item-content">
        <div className="item-drag-handle" {...listeners}>
          <GripVertical size={14} />
        </div>
        
        <div className="item-info">
          <div className="item-name">
            {item.field.displayName}
            {(item as QueryField).alias && (
              <span className="item-alias"> as {(item as QueryField).alias}</span>
            )}
          </div>
          <div className="item-source">
            {item.field.sourceTable}.{item.field.sourceColumn}
            {item.field.aggregation && (
              <span className="item-aggregation"> ({item.field.aggregation})</span>
            )}
          </div>
        </div>

        <div className="item-actions">
          {(isFilter || zone.id === 'select') && (
            <button
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={14} />
            </button>
          )}
          <button className="remove-btn" onClick={onRemove}>
            <X size={14} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="item-settings">
          {zone.id === 'select' && (
            <div className="setting-group">
              <label>Alias:</label>
              <input
                type="text"
                value={localAlias}
                onChange={(e) => handleAliasChange(e.target.value)}
                placeholder="Optional alias"
              />
            </div>
          )}

          {isFilter && (
            <>
              <div className="setting-group">
                <label>Operator:</label>
                <select
                  value={localOperator}
                  onChange={(e) => handleFilterChange(e.target.value, localValue)}
                >
                  {filterOperators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {!['IS NULL', 'IS NOT NULL'].includes(localOperator) && (
                <div className="setting-group">
                  <label>Value:</label>
                  <input
                    type={item.field.dataType === 'number' ? 'number' : 
                          item.field.dataType === 'date' ? 'date' : 'text'}
                    value={localValue}
                    onChange={(e) => handleFilterChange(localOperator, e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
