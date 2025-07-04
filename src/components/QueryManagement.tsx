import React, { useState, useEffect } from 'react'
import { Save, FolderOpen, Trash2, Calendar, Search } from 'lucide-react'
import type { SavedQuery, AdvancedQuery } from '../types/query'

interface QueryManagementProps {
  currentQuery: AdvancedQuery
  currentSql: string
  onSave: (name: string, description?: string) => Promise<void>
  onLoad: (query: SavedQuery) => void
  onDelete?: (queryId: string) => Promise<void>
}

export const QueryManagement: React.FC<QueryManagementProps> = ({
  currentQuery,
  currentSql,
  onSave,
  onLoad,
  onDelete
}) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [queryName, setQueryName] = useState('')
  const [queryDescription, setQueryDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load saved queries from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('queryBuilder_savedQueries')
    if (saved) {
      try {
        const queries = JSON.parse(saved).map((q: any) => ({
          ...q,
          createdAt: new Date(q.createdAt),
          updatedAt: new Date(q.updatedAt)
        }))
        setSavedQueries(queries)
      } catch (error) {
        console.error('Failed to load saved queries:', error)
      }
    }
  }, [])

  // Save queries to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('queryBuilder_savedQueries', JSON.stringify(savedQueries))
  }, [savedQueries])

  const handleSave = async () => {
    if (!queryName.trim()) return

    setIsSaving(true)
    try {
      const newQuery: SavedQuery = {
        id: Date.now().toString(),
        name: queryName.trim(),
        description: queryDescription.trim() || undefined,
        query: currentQuery,
        sql: currentSql,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await onSave(queryName.trim(), queryDescription.trim() || undefined)
      
      // Update local state
      setSavedQueries(prev => [newQuery, ...prev])
      
      // Reset form
      setQueryName('')
      setQueryDescription('')
      setShowSaveDialog(false)
    } catch (error) {
      console.error('Failed to save query:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (queryId: string) => {
    if (!onDelete) return
    
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await onDelete(queryId)
        setSavedQueries(prev => prev.filter(q => q.id !== queryId))
      } catch (error) {
        console.error('Failed to delete query:', error)
      }
    }
  }

  const filteredQueries = savedQueries.filter(query =>
    query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (query.description && query.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const hasValidQuery = currentQuery.select.length > 0

  return (
    <div className="query-management">
      <div className="management-actions">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!hasValidQuery}
          className="save-query-btn"
        >
          <Save size={16} />
          Save Query
        </button>
        
        <button
          onClick={() => setShowLoadDialog(true)}
          disabled={savedQueries.length === 0}
          className="load-query-btn"
        >
          <FolderOpen size={16} />
          Load Query
        </button>
        
        <span className="query-count">
          {savedQueries.length} saved quer{savedQueries.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal">
          <div className="modal-content save-dialog">
            <h3>
              <Save size={20} />
              Save Query
            </h3>
            
            <div className="form-group">
              <label>Query Name *</label>
              <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="Enter a descriptive name"
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={queryDescription}
                onChange={(e) => setQueryDescription(e.target.value)}
                placeholder="Optional description of what this query does"
                rows={3}
              />
            </div>
            
            <div className="modal-actions">
              <button
                onClick={handleSave}
                disabled={!queryName.trim() || isSaving}
                className="primary-btn"
              >
                {isSaving ? 'Saving...' : 'Save Query'}
              </button>
              <button onClick={() => setShowSaveDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-overlay" onClick={() => setShowSaveDialog(false)} />
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="modal">
          <div className="modal-content load-dialog">
            <h3>
              <FolderOpen size={20} />
              Load Saved Query
            </h3>
            
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved queries..."
              />
            </div>
            
            <div className="queries-list">
              {filteredQueries.length === 0 ? (
                <div className="no-queries">
                  {searchTerm ? 'No queries match your search.' : 'No saved queries found.'}
                </div>
              ) : (
                filteredQueries.map(query => (
                  <div key={query.id} className="query-item">
                    <div className="query-info">
                      <div className="query-name">{query.name}</div>
                      {query.description && (
                        <div className="query-description">{query.description}</div>
                      )}
                      <div className="query-meta">
                        <span className="query-date">
                          <Calendar size={12} />
                          {formatDate(query.updatedAt)}
                        </span>
                        <span className="query-fields">
                          {query.query.select.length} field{query.query.select.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="query-actions">
                      <button
                        onClick={() => {
                          onLoad(query)
                          setShowLoadDialog(false)
                          setSearchTerm('')
                        }}
                        className="load-btn"
                      >
                        Load
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(query.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowLoadDialog(false)}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-overlay" onClick={() => setShowLoadDialog(false)} />
        </div>
      )}
    </div>
  )
}
