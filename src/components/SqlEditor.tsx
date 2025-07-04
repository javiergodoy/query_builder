import React, { useState, useEffect } from 'react'
import { Code, Edit3, Eye, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'

interface SqlEditorProps {
  sql: string
  onSqlChange: (sql: string) => void
  onValidate?: (sql: string) => Promise<{ isValid: boolean; error?: string }>
  readOnly?: boolean
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  sql,
  onSqlChange,
  onValidate,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localSql, setLocalSql] = useState(sql)
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean
    error?: string
    isValidating: boolean
  }>({ isValid: true, isValidating: false })

  useEffect(() => {
    setLocalSql(sql)
  }, [sql])

  const handleEdit = () => {
    setIsEditing(true)
    setLocalSql(sql)
  }

  const handleSave = async () => {
    if (onValidate) {
      setValidationStatus({ isValid: true, isValidating: true })
      try {
        const result = await onValidate(localSql)
        setValidationStatus({ isValid: result.isValid, error: result.error, isValidating: false })
        
        if (result.isValid) {
          onSqlChange(localSql)
          setIsEditing(false)
        }
      } catch (error) {
        setValidationStatus({ 
          isValid: false, 
          error: error instanceof Error ? error.message : 'Validation failed',
          isValidating: false 
        })
      }
    } else {
      onSqlChange(localSql)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setLocalSql(sql)
    setIsEditing(false)
    setValidationStatus({ isValid: true, isValidating: false })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }
    
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = localSql.substring(0, start) + '  ' + localSql.substring(end)
      setLocalSql(newValue)
      
      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const formatSql = () => {
    // Basic SQL formatting
    const formatted = localSql
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',\n    ')
      .replace(/\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)\s+/gi, '\n$1 ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      .trim()
    
    setLocalSql(formatted)
  }

  return (
    <div className="sql-editor">
      <div className="editor-header">
        <div className="header-left">
          <Code size={20} />
          <h3>SQL Query</h3>
          {!isEditing && !readOnly && (
            <button onClick={handleEdit} className="edit-btn">
              <Edit3 size={16} />
              Edit SQL
            </button>
          )}
        </div>
        
        <div className="header-right">
          {isEditing && (
            <>
              <button onClick={formatSql} className="format-btn">
                <RotateCcw size={16} />
                Format
              </button>
              <button onClick={handleSave} className="save-btn" disabled={validationStatus.isValidating}>
                <CheckCircle size={16} />
                {validationStatus.isValidating ? 'Validating...' : 'Apply'}
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </>
          )}
          {!isEditing && (
            <div className="view-mode-indicator">
              <Eye size={16} />
              Read-only
            </div>
          )}
        </div>
      </div>

      {!validationStatus.isValid && validationStatus.error && (
        <div className="validation-error">
          <AlertCircle size={16} />
          <span>SQL Error: {validationStatus.error}</span>
        </div>
      )}

      <div className="editor-content">
        {isEditing ? (
          <textarea
            value={localSql}
            onChange={(e) => setLocalSql(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`sql-textarea ${!validationStatus.isValid ? 'error' : ''}`}
            placeholder="Enter your SQL query here..."
            autoFocus
            spellCheck={false}
          />
        ) : (
          <pre className="sql-display">
            <code>{sql || '-- Your generated SQL will appear here'}</code>
          </pre>
        )}
      </div>

      {isEditing && (
        <div className="editor-help">
          <div className="help-shortcuts">
            <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to apply changes</span>
            <span><kbd>Escape</kbd> to cancel</span>
            <span><kbd>Tab</kbd> for indentation</span>
          </div>
        </div>
      )}
    </div>
  )
}
