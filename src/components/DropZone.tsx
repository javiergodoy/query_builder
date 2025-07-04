import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AlertCircle } from 'lucide-react'
import { SortableFieldItem } from './SortableFieldItem'
import type { CanvasZone } from '../types/semanticLayer'
import type { QueryField, QueryFilter } from '../types/query'

interface DropZoneProps {
  zone: CanvasZone
  items: QueryField[] | QueryFilter[]
  onRemoveItem: (itemId: string) => void
  onUpdateItem?: (itemId: string, updates: Partial<QueryField | QueryFilter>) => void
  isOver?: boolean
  error?: string
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  zone, 
  items, 
  onRemoveItem, 
  onUpdateItem,
  error 
}) => {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id: zone.id,
    data: {
      zone: zone,
      acceptedTypes: zone.acceptedTypes
    }
  })

  const style = {
    backgroundColor: isOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
    borderColor: isOver ? '#667eea' : error ? '#e53e3e' : '#e2e8f0',
  }

  return (
    <div className="drop-zone-container">
      <div className="zone-header">
        <h4 className="zone-title">{zone.name}</h4>
        <span className="zone-description">{zone.description}</span>
        {zone.maxItems && (
          <span className="zone-limit">
            {items.length}/{zone.maxItems}
          </span>
        )}
      </div>
      
      <div
        ref={setNodeRef}
        className={`drop-zone ${isOver ? 'drop-zone-over' : ''} ${error ? 'drop-zone-error' : ''}`}
        style={style}
      >
        {items.length === 0 ? (
          <div className="drop-zone-empty">
            <div className="empty-message">
              Drop {zone.acceptedTypes.join(', ')} fields here
            </div>
          </div>
        ) : (
          <SortableContext 
            items={items.map(item => item.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="dropped-items">
              {items.map((item) => (
                <SortableFieldItem
                  key={item.id}
                  item={item}
                  zone={zone}
                  onRemove={() => onRemoveItem(item.id)}
                  onUpdate={onUpdateItem ? (updates: Partial<QueryField | QueryFilter>) => onUpdateItem(item.id, updates) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        )}
        
        {error && (
          <div className="zone-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
