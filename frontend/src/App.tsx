import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import type { Todo, Category } from './types';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { CategoryFilter } from './components/CategoryFilter';
import { Toast } from './components/Toast';
import { BulkActions } from './components/BulkActions';

interface ToastState {
  id: string;
  message: string;
  actionId: string;
  onUndo: (actionId: string) => void;
}

interface PendingActionState {
  id: number;
  type: 'delete' | 'complete';
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [, setRenderTrigger] = useState(0);

  const pendingActionsRef = useRef<Map<number, PendingActionState>>(new Map());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const bulkGroupsRef = useRef<Map<string, number[]>>(new Map());

  useEffect(() => {
    loadData();
    setSelectedIds(new Set());
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timersRef.current.clear();
      bulkGroupsRef.current.clear();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, todosData] = await Promise.all([
        api.getCategories(),
        api.getTodos(selectedCategory || undefined),
      ]);
      setCategories(categoriesData);
      setTodos(todosData);
      setSelectedIds((prev) => {
        const validIds = new Set(todosData.map((t) => t.id));
        return new Set([...prev].filter((id) => validIds.has(id)));
      });
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scheduleTodoAction = (todoId: number, type: 'delete' | 'complete') => {
    pendingActionsRef.current.set(todoId, { id: todoId, type });
    setRenderTrigger((prev) => prev + 1);

    const timeoutId = setTimeout(() => {
      finalizeTodoAction(todoId, type);
    }, 5000);

    timersRef.current.set(todoId, timeoutId);
  };

  const scheduleBulkAction = (todoIds: number[], type: 'delete' | 'complete') => {
    const groupId = `bulk-${type}-${Date.now()}`;
    bulkGroupsRef.current.set(groupId, todoIds);

    todoIds.forEach((id) => {
      pendingActionsRef.current.set(id, { id, type });
    });
    setRenderTrigger((prev) => prev + 1);

    todoIds.forEach((todoId) => {
      const timeoutId = setTimeout(() => {
        finalizeTodoAction(todoId, type);
      }, 5000);
      timersRef.current.set(todoId, timeoutId);
    });

    return groupId;
  };

  const finalizeTodoAction = async (todoId: number, type: 'delete' | 'complete') => {
    if (!pendingActionsRef.current.has(todoId)) return;

    try {
      if (type === 'delete') {
        await api.deleteTodo(todoId);
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
      } else if (type === 'complete') {
        await api.updateTodo(todoId, { completed: true });
        setTodos((prev) =>
          prev.map((t) => (t.id === todoId ? { ...t, completed: true } : t))
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${type} todo`);
    } finally {
      pendingActionsRef.current.delete(todoId);
      timersRef.current.delete(todoId);
      setRenderTrigger((prev) => prev + 1);
    }
  };

  const undoTodoAction = (todoId: number) => {
    const timeoutId = timersRef.current.get(todoId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timersRef.current.delete(todoId);
    }

    pendingActionsRef.current.delete(todoId);
    setRenderTrigger((prev) => prev + 1);
  };

  const undoBulkAction = (groupId: string) => {
    const todoIds = bulkGroupsRef.current.get(groupId);
    if (!todoIds) return;

    todoIds.forEach((todoId) => {
      const timeoutId = timersRef.current.get(todoId);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timersRef.current.delete(todoId);
      }
    });

    todoIds.forEach((id) => pendingActionsRef.current.delete(id));

    bulkGroupsRef.current.delete(groupId);
    setRenderTrigger((prev) => prev + 1);
  };

  const handleCreateTodo = async (text: string, categoryId: number) => {
    try {
      setError(null);
      const newTodo = await api.createTodo({ text, category_id: categoryId });
      if (selectedCategory === null || newTodo.category_id === selectedCategory) {
        setTodos((prev) => [newTodo, ...prev]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create todo');
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (completed) {
      scheduleTodoAction(id, 'complete');

      const actionId = `complete-${id}`;
      setToasts((prev) => [...prev, {
        id: `toast-${actionId}`,
        message: 'Task completed',
        actionId,
        onUndo: (actionId) => {
          undoTodoAction(id);
          setToasts((prev) => prev.filter((t) => t.actionId !== actionId));
        },
      }]);
    } else {
      try {
        setError(null);
        await api.updateTodo(id, { completed: false });
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: false } : t))
        );
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update todo');
      }
    }
  };

  const handleDeleteTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    scheduleTodoAction(id, 'delete');

    const actionId = `delete-${id}`;
    setToasts((prev) => [...prev, {
      id: `toast-${actionId}`,
      message: 'Task deleted',
      actionId,
      onUndo: (actionId) => {
        undoTodoAction(id);
        setToasts((prev) => prev.filter((t) => t.actionId !== actionId));
      },
    }]);
  };

  const handleSelectTodo = (id: number, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const selectableIds = todos
      .filter((t) => !t.completed && !pendingActionsRef.current.has(t.id))
      .map((t) => t.id);
    setSelectedIds(new Set(selectableIds));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkComplete = () => {
    const idsToComplete = [...selectedIds].filter((id) => {
      const todo = todos.find((t) => t.id === id);
      return todo && !todo.completed && !pendingActionsRef.current.has(id);
    });

    if (idsToComplete.length === 0) return;

    const groupId = scheduleBulkAction(idsToComplete, 'complete');

    const capturedIds = [...idsToComplete];

    setToasts((prev) => [...prev, {
      id: `toast-${groupId}`,
      message: `${capturedIds.length} task${capturedIds.length > 1 ? 's' : ''} completed`,
      actionId: groupId,
      onUndo: (actionId) => {
        undoBulkAction(actionId);
        setToasts((prev) => prev.filter((t) => t.actionId !== actionId));
      },
    }]);

    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    const idsToDelete = [...selectedIds].filter((id) => {
      const todo = todos.find((t) => t.id === id);
      return todo && !pendingActionsRef.current.has(id);
    });

    if (idsToDelete.length === 0) return;

    const groupId = scheduleBulkAction(idsToDelete, 'delete');

    const capturedIds = [...idsToDelete];

    setToasts((prev) => [...prev, {
      id: `toast-${groupId}`,
      message: `${capturedIds.length} task${capturedIds.length > 1 ? 's' : ''} deleted`,
      actionId: groupId,
      onUndo: (actionId) => {
        undoBulkAction(actionId);
        setToasts((prev) => prev.filter((t) => t.actionId !== actionId));
      },
    }]);

    setSelectedIds(new Set());
  };

  const activeTodos = todos.filter((t) => !t.completed && !pendingActionsRef.current.has(t.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and stay organized</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <TodoForm
            categories={categories}
            onSubmit={handleCreateTodo}
            disabled={loading}
          />
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">Loading tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTodos.length === 0 ? 'No tasks yet' : 'No tasks in this category'}
            </h3>
            <p className="text-gray-600">
              {activeTodos.length === 0 ? 'Create your first task to get started' : 'Try selecting a different category'}
            </p>
          </div>
        ) : (
          <>
            <BulkActions
              selectedCount={selectedIds.size}
              onCompleteSelected={handleBulkComplete}
              onDeleteSelected={handleBulkDelete}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              disabled={loading}
            />
            <div className="space-y-2">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  disabled={loading}
                  isPending={pendingActionsRef.current.has(todo.id)}
                  pendingType={pendingActionsRef.current.get(todo.id)?.type}
                  isSelected={selectedIds.has(todo.id)}
                  onSelect={handleSelectTodo}
                  bulkSelectionMode={selectedIds.size > 0}
                />
              ))}
            </div>
          </>
        )}

        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-auto space-y-2 z-50">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              actionId={toast.actionId}
              onUndo={toast.onUndo}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
