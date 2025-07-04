import React from 'react'
import { Code, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface SqlPreviewProps {
  sql: string
}

export const SqlPreview: React.FC<SqlPreviewProps> = ({ sql }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy SQL to clipboard:', err)
    }
  }

  return (
    <div className="sql-preview">
      <div className="preview-header">
        <div className="header-left">
          <Code size={20} />
          <h3>Generated SQL</h3>
        </div>
        <button 
          className="copy-btn"
          onClick={copyToClipboard}
          disabled={!sql || sql.startsWith('--')}
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="preview-content">
        <pre className="sql-code">
          <code>{sql || '-- Your generated SQL will appear here'}</code>
        </pre>
      </div>
    </div>
  )
}
