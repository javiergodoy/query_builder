import { render, screen } from '@testing-library/react';
import { AdvancedQueryBuilder } from './AdvancedQueryBuilder';
import { describe, it, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';

const mockDimensions = [
  { id: 'dim1', name: 'Dimension 1', displayName: 'Dimension 1', type: 'dimension', table: 'table1', dataType: 'string', category: 'Category A', description: 'This is dimension 1', sourceTable: 'table1', sourceColumn: 'dim1' },
  { id: 'dim2', name: 'Dimension 2', displayName: 'Dimension 2', type: 'dimension', table: 'table1', dataType: 'string', category: 'Category B', description: 'This is dimension 2', sourceTable: 'table1', sourceColumn: 'dim2' },
];

const mockMetrics = [
  { id: 'met1', name: 'Metric 1', displayName: 'Metric 1', type: 'metric', table: 'table1', dataType: 'number', category: 'Category A', description: 'This is metric 1', sourceTable: 'table1', sourceColumn: 'met1' },
  { id: 'met2', name: 'Metric 2', displayName: 'Metric 2', type: 'metric', table: 'table1', dataType: 'number', category: 'Category B', description: 'This is metric 2', sourceTable: 'table1', sourceColumn: 'met2' },
];

const mockFilters = [
  { id: 'fil1', name: 'Filter 1', displayName: 'Filter 1', type: 'filter', table: 'table1', dataType: 'string', category: 'Category A', description: 'This is filter 1', sourceTable: 'table1', sourceColumn: 'fil1' },
  { id: 'fil2', name: 'Filter 2', displayName: 'Filter 2', type: 'filter', table: 'table1', dataType: 'string', category: 'Category B', description: 'This is filter 2', sourceTable: 'table1', sourceColumn: 'fil2' },
];

const mockQuery = {
  select: [],
  where: [],
  groupBy: [],
  orderBy: [],
};

const mockOnQueryChange = vi.fn();

describe('AdvancedQueryBuilder', () => {
  it('renders the dimensions, metrics, and filters', () => {
    render(
      <DndContext onDragEnd={() => {}}>
        <AdvancedQueryBuilder
          dimensions={mockDimensions}
          metrics={mockMetrics}
          filters={mockFilters}
          query={mockQuery}
          onQueryChange={mockOnQueryChange}
        />
      </DndContext>
    );

    expect(screen.getByRole('heading', { name: /dimensions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /metrics/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /filters/i })).toBeInTheDocument();

    mockDimensions.forEach((dim) => {
      expect(screen.getByText(dim.displayName)).toBeInTheDocument();
    });

    mockMetrics.forEach((met) => {
      expect(screen.getByText(met.displayName)).toBeInTheDocument();
    });

    mockFilters.forEach((fil) => {
      expect(screen.getByText(fil.displayName)).toBeInTheDocument();
    });
  });
});
