import { render, screen } from '@testing-library/react';
import { SqlPreview } from './SqlPreview';
import { describe, it, expect } from 'vitest';

describe('SqlPreview', () => {
  it('renders the SQL code', () => {
    const sql = 'SELECT * FROM users;';
    render(<SqlPreview sql={sql} />);
    expect(screen.getByText(sql)).toBeInTheDocument();
  });

  it('renders a placeholder when no SQL is provided', () => {
    render(<SqlPreview sql="" />);
    expect(screen.getByText('-- Your generated SQL will appear here')).toBeInTheDocument();
  });
});
