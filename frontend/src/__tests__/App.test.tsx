import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { api } from '../api';

vi.mock('../api');

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display backend validation error', async () => {
    const mockCategories = [{ id: 1, name: 'Work' }];
    const mockTodos: never[] = [];

    vi.mocked(api.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.getTodos).mockResolvedValue(mockTodos);
    vi.mocked(api.createTodo).mockRejectedValue({
      response: { data: { error: 'Category has reached maximum of 5 active tasks' } },
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /add task/i });

    await userEvent.type(input, 'Test task');
    await userEvent.selectOptions(select, '1');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/maximum/i)).toBeInTheDocument();
    });
  });

  it('should display empty state', async () => {
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getTodos).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });
});
