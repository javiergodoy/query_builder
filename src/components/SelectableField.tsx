import React, { useState } from 'react'
import { Info, Database, BarChart3, Filter, Plus, Check } from 'lucide-react'
import type { FieldMetadata } from '../types/semanticLayer'

interface SelectableFieldProps {
  field: FieldMetadata
  isSelected: boolean
  onToggle: (field: FieldMetadata, selected: boolean) => void
  showTooltip?: boolean
}

export const SelectableField: React.FC<SelectableFieldProps> = ({ 
  field, 
  isSelected, 
  onToggle, 
  showTooltip = true 
}) => {
  const [showInfo, setShowInfo] = useState(false)

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
    const baseClass = 'selectable-field'
    const typeClass = `field-${field.type}`
    const selectedClass = isSelected ? 'selected' : ''
    return `${baseClass} ${typeClass} ${selectedClass}`.trim()
  }

  const handleToggle = () => {
    onToggle(field, !isSelected)
  }

  return (
    <div
      className={getFieldClass()}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={handleToggle}
    >
      <div className="field-content">
        <div className="field-checkbox">
          <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
            {isSelected ? <Check size={12} /> : <Plus size={12} />}
          </div>
        </div>
        
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
