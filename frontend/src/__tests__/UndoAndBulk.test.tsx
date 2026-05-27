import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { api } from '../api';

vi.mock('../api');

describe('Undo and Bulk Actions', () => {
  const mockCategories = [{ id: 1, name: 'Work' }];
  const mockTodos = [
    { id: 1, text: 'Task 1', category_id: 1, category_name: 'Work', completed: false, created_at: '2026-05-27' },
    { id: 2, text: 'Task 2', category_id: 1, category_name: 'Work', completed: false, created_at: '2026-05-27' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show undo button when completing a task', async () => {
    vi.mocked(api.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.getTodos).mockResolvedValue(mockTodos);
    vi.mocked(api.updateTodo).mockResolvedValue({ ...mockTodos[0], completed: true });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const completeCheckbox = checkboxes[1]; // First is select, second is complete

    await userEvent.click(completeCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/task completed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });
  });

  it('should show bulk actions when selecting tasks', async () => {
    vi.mocked(api.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.getTodos).mockResolvedValue(mockTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    await userEvent.click(selectAllButton);

    await waitFor(() => {
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^complete$/i })).toBeInTheDocument();
      const bulkActions = screen.getByText(/2 selected/i).closest('.bg-white');
      expect(bulkActions).toBeInTheDocument();
    });
  });
});
