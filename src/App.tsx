import { useState, useCallback, useEffect } from 'react'
import { Database, Play, Code, Table, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react'
import './App.css'
import { AdvancedQueryBuilder } from './components/AdvancedQueryBuilder'
import { SqlEditor } from './components/SqlEditor'
import { QueryResults } from './components/QueryResults'
import { QueryManagement } from './components/QueryManagement'
import type { AdvancedQuery, SavedQuery, QueryResult } from './types/query'
import type { SemanticLayer } from './types/semanticLayer'
import { SqlGenerator } from './utils/sqlGenerator'
import { RealQueryExecutor } from './services/realQueryExecutor'
import { semanticLayerService } from './services/semanticLayerService'

function App() {
  const [query, setQuery] = useState<AdvancedQuery>({
    select: [],
    where: [],
    groupBy: [],
    orderBy: []
  })
  
  const [currentView, setCurrentView] = useState<'builder' | 'editor' | 'results' | 'management'>('builder')
  const [generatedSql, setGeneratedSql] = useState<string>('')
  const [editedSql, setEditedSql] = useState<string>('')
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState<string>('')
  const [semanticLayer, setSemanticLayer] = useState<SemanticLayer | null>(null)
  const [isLoadingSchema, setIsLoadingSchema] = useState(true)
  const [schemaError, setSchemaError] = useState<string>('')
  const [dbConnected, setDbConnected] = useState(false)

  // Load semantic layer from database schema
  useEffect(() => {
    loadSemanticLayer()
  }, [])

  const loadSemanticLayer = async () => {
    setIsLoadingSchema(true)
    setSchemaError('')
    
    try {
      // Test database connection first
      const isConnected = await RealQueryExecutor.testConnection()
      setDbConnected(isConnected)
      
      if (!isConnected) {
        throw new Error('Database connection failed. Please ensure PostgreSQL server is running and accessible.')
      }

      // Generate semantic layer from database schema
      const layer = await semanticLayerService.generateSemanticLayer()
      setSemanticLayer(layer)
      console.log('✅ Semantic layer loaded:', layer)
    } catch (error) {
      console.error('❌ Failed to load semantic layer:', error)
      setSchemaError(error instanceof Error ? error.message : 'Failed to load database schema')
    } finally {
      setIsLoadingSchema(false)
    }
  }

  const handleQueryChange = useCallback((newQuery: AdvancedQuery) => {
    console.log('🔄 Query changed:', newQuery) // Debug log
    setQuery(newQuery)
    const sql = SqlGenerator.generateSql(newQuery)
    setGeneratedSql(sql)
    setEditedSql(sql)
  }, [])

  const handleSqlChange = useCallback((newSql: string) => {
    setEditedSql(newSql)
  }, [])

  const handleExecuteQuery = async (sqlToExecute?: string) => {
    setIsExecuting(true)
    setExecutionError('')
    
    try {
      const sql = sqlToExecute || (currentView === 'editor' ? editedSql : generatedSql)
      console.log('🎯 About to execute SQL from App:', sql) // Debug log
      const result = await RealQueryExecutor.executeQuery(sql)
      
      if (result.success) {
        setQueryResults(result)
        setCurrentView('results')
      } else {
        setExecutionError(result.error || 'Query execution failed')
        setQueryResults(null)
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setExecutionError(errorMessage)
      throw error
    } finally {
      setIsExecuting(false)
    }
  }

  const handleSaveQuery = async (name: string, description?: string) => {
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]')
    const newQuery = {
      id: Date.now().toString(),
      name,
      description,
      query,
      sql: currentView === 'editor' ? editedSql : generatedSql,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    savedQueries.push(newQuery)
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries))
  }

  const handleLoadQuery = (savedQuery: SavedQuery) => {
    setQuery(savedQuery.query)
    const sql = SqlGenerator.generateSql(savedQuery.query)
    setGeneratedSql(sql)
    setEditedSql(savedQuery.sql || sql)
    setCurrentView('builder')
  }

  const handleCreateTable = async (tableName: string, sql: string): Promise<void> => {
    try {
      // Generate CREATE TABLE AS statement
      const createTableSql = `CREATE TABLE ${tableName} AS (${sql})`
      
      console.log(`Creating table ${tableName} with SQL:`, createTableSql)
      
      // Execute the CREATE TABLE statement
      const result = await RealQueryExecutor.executeQuery(createTableSql)
      
      if (result.success) {
        alert(`Table "${tableName}" created successfully!`)
        
        // Optionally reload the semantic layer to include the new table
        await loadSemanticLayer()
      } else {
        alert(`Failed to create table: ${result.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error creating table: ${errorMessage}`)
      throw error
    }
  }

  const renderCurrentView = () => {
    // Show loading screen while loading schema
    if (isLoadingSchema) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading Database Schema...</h3>
          <p>Connecting to PostgreSQL and generating semantic layer</p>
        </div>
      )
    }

    // Show error screen if schema loading failed
    if (schemaError || !semanticLayer) {
      return (
        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h3>Database Connection Error</h3>
          <p>{schemaError || 'Failed to load database schema'}</p>
          <div className="error-actions">
            <button onClick={loadSemanticLayer} className="retry-btn">
              Retry Connection
            </button>
            <div className="connection-help">
              <p><strong>To connect to PostgreSQL:</strong></p>
              <ol>
                <li>Start the backend server: <code>cd server && npm install && npm start</code></li>
                <li>Ensure PostgreSQL is running on localhost:5432</li>
                <li>Create database: <code>CREATE DATABASE query_builder;</code></li>
                <li>Run setup script: <code>psql -d query_builder -f setup.sql</code></li>
                <li>Copy .env.example to .env and configure your database credentials</li>
              </ol>
            </div>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'builder':
        return (
          <AdvancedQueryBuilder 
            dimensions={semanticLayer.dimensions}
            metrics={semanticLayer.metrics}
            filters={semanticLayer.filters}
            query={query} 
            onQueryChange={handleQueryChange}
          />
        )
      case 'editor':
        return (
          <SqlEditor 
            sql={editedSql}
            onSqlChange={handleSqlChange}
          />
        )
      case 'results':
        return (
          <QueryResults 
            results={queryResults}
            isExecuting={isExecuting}
            error={executionError}
            sql={editedSql || generatedSql}
            onCreateTable={handleCreateTable}
          />
        )
      case 'management':
        return (
          <QueryManagement 
            currentQuery={query}
            currentSql={editedSql || generatedSql}
            onSave={handleSaveQuery}
            onLoad={handleLoadQuery}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Database className="header-icon" />
          <h1>Visual Query Builder</h1>
          <p>Build SQL queries with an intuitive drag-and-drop interface</p>
          
          <div className="db-status">
            {dbConnected ? (
              <div className="status-connected">
                <CheckCircle size={16} />
                <span>PostgreSQL Connected</span>
                {semanticLayer && (
                  <span className="schema-info">
                    ({semanticLayer.dimensions.length + semanticLayer.metrics.length + semanticLayer.filters.length} fields loaded)
                  </span>
                )}
              </div>
            ) : (
              <div className="status-disconnected">
                <AlertCircle size={16} />
                <span>Database Disconnected</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentView === 'builder' ? 'active' : ''}`}
            onClick={() => setCurrentView('builder')}
          >
            <Database size={16} />
            Builder
          </button>
          <button 
            className={`nav-btn ${currentView === 'editor' ? 'active' : ''}`}
            onClick={() => setCurrentView('editor')}
          >
            <Code size={16} />
            SQL Editor
          </button>
          <button 
            className={`nav-btn ${currentView === 'results' ? 'active' : ''}`}
            onClick={() => setCurrentView('results')}
            disabled={!queryResults}
          >
            <Table size={16} />
            Results
          </button>
          <button 
            className={`nav-btn ${currentView === 'management' ? 'active' : ''}`}
            onClick={() => setCurrentView('management')}
          >
            <FolderOpen size={16} />
            Saved Queries
          </button>
        </nav>
      </header>

      <main className="app-main">
        <div className="query-workspace">
          {renderCurrentView()}
          
          <div className="query-actions">
            <button 
              className="execute-btn"
              onClick={() => handleExecuteQuery()}
              disabled={isExecuting || (!generatedSql && !editedSql)}
            >
              <Play size={16} />
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </button>
            
            {executionError && (
              <div className="error-message">
                {executionError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
