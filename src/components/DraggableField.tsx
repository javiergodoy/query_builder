import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Info, Database, BarChart3, Filter } from 'lucide-react'
import type { FieldMetadata } from '../types/semanticLayer'

interface DraggableFieldProps {
  field: FieldMetadata
  showTooltip?: boolean
}

export const DraggableField: React.FC<DraggableFieldProps> = ({ field, showTooltip = true }) => {
  const [showInfo, setShowInfo] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: field.id,
    data: {
      type: field.type,
      field: field
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const getFieldIcon = () => {
    switch (field.type) {
      case 'dimension':
        return <Database size={14} />
      case 'metric':
        return <BarChart3 size={14} />
      case 'filter':
        return <Filter size={14} />
      default:
        return <Database size={14} />
    }
  }

  const getFieldClass = () => {
    const baseClass = 'draggable-field'
    const typeClass = `field-${field.type}`
    const draggingClass = isDragging ? 'dragging' : ''
    return `${baseClass} ${typeClass} ${draggingClass}`.trim()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={getFieldClass()}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <div className="field-content">
        <div className="field-icon">
          {getFieldIcon()}
        </div>
        <div className="field-info">
          <div className="field-name">{field.displayName}</div>
          <div className="field-type">{field.dataType}</div>
        </div>
        {showTooltip && (
          <button 
            className="info-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo(!showInfo)
            }}
          >
            <Info size={12} />
          </button>
        )}
      </div>
      
      {showInfo && showTooltip && (
        <div className="field-tooltip">
          <div className="tooltip-header">
            <strong>{field.displayName}</strong>
            <span className="field-category">{field.category}</span>
          </div>
          <div className="tooltip-description">{field.description}</div>
          <div className="tooltip-details">
            <div><strong>Source:</strong> {field.sourceTable}.{field.sourceColumn}</div>
            <div><strong>Type:</strong> {field.dataType}</div>
            {field.aggregation && (
              <div><strong>Aggregation:</strong> {field.aggregation}</div>
            )}
            {field.format && (
              <div><strong>Format:</strong> {field.format}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
