import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoForm } from '../components/TodoForm';
import type { Category } from '../types';

describe('TodoForm', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Work' },
    { id: 2, name: 'Personal' },
  ];

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should submit form data', async () => {
    const user = userEvent.setup();
    render(<TodoForm categories={mockCategories} onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Test task');
    await user.selectOptions(select, '1');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test task', 1);
    });
  });
});
