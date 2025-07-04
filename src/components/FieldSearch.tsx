import React, { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import type { FieldMetadata } from '../types/semanticLayer'

interface FieldSearchProps {
  fields: FieldMetadata[]
  onFilter: (filteredFields: FieldMetadata[]) => void
  placeholder?: string
}

export const FieldSearch: React.FC<FieldSearchProps> = ({ 
  fields, 
  onFilter, 
  placeholder = "Search fields..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Get unique categories and types
  const categories = Array.from(new Set(fields.map(f => f.category).filter(Boolean))).sort()
  const types = Array.from(new Set(fields.map(f => f.type))).sort()

  const applyFilters = (term: string, category: string, type: string) => {
    let filtered = fields

    // Text search
    if (term.trim()) {
      const lowerTerm = term.toLowerCase()
      filtered = filtered.filter(field => 
        field.displayName.toLowerCase().includes(lowerTerm) ||
        field.description.toLowerCase().includes(lowerTerm) ||
        field.name.toLowerCase().includes(lowerTerm) ||
        field.sourceTable.toLowerCase().includes(lowerTerm) ||
        field.sourceColumn.toLowerCase().includes(lowerTerm)
      )
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(field => field.category === category)
    }

    // Type filter
    if (type !== 'all') {
      filtered = filtered.filter(field => field.type === type)
    }

    onFilter(filtered)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, selectedCategory, selectedType)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    applyFilters(searchTerm, category, selectedType)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    applyFilters(searchTerm, selectedCategory, type)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedType('all')
    onFilter(fields)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedType !== 'all'

  return (
    <div className="field-search">
      <div className="search-input-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="clear-search-btn"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <Filter size={14} />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="search-results-info">
        Showing {fields.length} field{fields.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
