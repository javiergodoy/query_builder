import React, { useState } from 'react'
import { Download, Database, Clock } from 'lucide-react'
import Papa from 'papaparse'
import type { QueryResult } from '../types/query'

interface QueryResultsProps {
  results: QueryResult | null
  isExecuting: boolean
  error: string | null
  sql: string
  onCreateTable?: (tableName: string, sql: string) => Promise<void>
}

export const QueryResults: React.FC<QueryResultsProps> = ({ 
  results,
  isExecuting,
  error,
  sql,
  onCreateTable 
}) => {
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [tableName, setTableName] = useState('')

  const exportToCsv = () => {
    if (!results) return

    const csvData = Papa.unparse({
      fields: results.columns.map(col => col.name),
      data: results.rows
    })

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `query_results_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCreateTable = async () => {
    if (!tableName.trim() || !onCreateTable) return

    try {
      await onCreateTable(tableName.trim(), sql)
      setShowCreateTable(false)
      setTableName('')
    } catch (err) {
      console.error('Failed to create table:', err)
    }
  }

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="query-results">
      <div className="results-header">
        <div className="header-left">
          <h3>Query Results</h3>
          {results && (
            <div className="results-meta">
              <span className="row-count">
                {results.totalRows?.toLocaleString() || results.rows.length.toLocaleString()} row{(results.totalRows || results.rows.length) !== 1 ? 's' : ''}
              </span>
              <span className="execution-time">
                <Clock size={14} />
                {formatExecutionTime(results.executionTime)}
              </span>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          {results && (
            <>
              <button onClick={exportToCsv} className="export-btn">
                <Download size={16} />
                Export CSV
              </button>
              
              {onCreateTable && (
                <button 
                  onClick={() => setShowCreateTable(true)}
                  className="create-table-btn"
                >
                  <Database size={16} />
                  Create Table
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateTable && (
        <div className="create-table-modal">
          <div className="modal-content">
            <h4>Create Table from Results</h4>
            <div className="form-group">
              <label>Table Name:</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateTable} disabled={!tableName.trim()}>
                Create Table
              </button>
              <button onClick={() => setShowCreateTable(false)}>
                Cancel
              </button>
            </div>
          </div>
          <div className="modal-overlay" onClick={() => setShowCreateTable(false)} />
        </div>
      )}

      <div className="results-content">
        {isExecuting && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Executing query...</p>
          </div>
        )}

        {error && !isExecuting && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!results && !isExecuting && !error && (
          <div className="empty-state">
            <Database size={48} />
            <h4>No Results Yet</h4>
            <p>Execute a query to see results here.</p>
          </div>
        )}

        {results && !error && !isExecuting && (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  {results.columns.map((col, index) => (
                    <th key={index}>
                      <div className="column-header">
                        <span className="column-name">{col.name}</span>
                        <span className="column-type">{col.type}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.slice(0, 100).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {results.columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        {row[col.name] !== null && row[col.name] !== undefined 
                          ? String(row[col.name]) 
                          : <span className="null-value">NULL</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {results.rows.length > 100 && (
              <div className="table-footer">
                Showing first 100 rows of {results.totalRows.toLocaleString()} total rows.
                <button onClick={exportToCsv} className="show-all-btn">
                  Export all rows as CSV
                </button>
              </div>
            )}
          </div>
        )}

        {!results && !error && !isExecuting && (
          <div className="no-results">
            <div className="no-results-message">
              Click "Execute Query" to run your SQL and see results here.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
