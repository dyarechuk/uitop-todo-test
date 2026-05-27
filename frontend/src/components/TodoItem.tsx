import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
  isPending?: boolean;
  pendingType?: 'delete' | 'complete';
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  bulkSelectionMode?: boolean;
}

export function TodoItem({ todo, onToggle, onDelete, disabled, isPending, pendingType, isSelected, onSelect, bulkSelectionMode }: TodoItemProps) {
  const categoryColors: Record<string, string> = {
    Work: 'bg-blue-100 text-blue-800 border-blue-200',
    Study: 'bg-green-100 text-green-800 border-green-200',
    Personal: 'bg-purple-100 text-purple-800 border-purple-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const categoryColor = categoryColors[todo.category_name] || categoryColors.Other;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
      todo.completed || isPending ? 'opacity-60' : ''
    } ${isPending ? 'ring-2 ring-yellow-300' : isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:border-gray-300'}`}>
      <div className="flex items-start gap-3">
        {bulkSelectionMode && onSelect && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onSelect(todo.id, e.target.checked)}
            disabled={disabled || isPending}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            aria-label="Select task for bulk actions"
          />
        )}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          disabled={disabled || isPending}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          aria-label="Mark task as complete"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-base font-medium mb-2 ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {todo.text}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${categoryColor}`}>
              {todo.category_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(todo.created_at)}
            </span>
            {isPending && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                {pendingType === 'delete' ? 'Deleting...' : 'Completing...'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(todo.id)}
          disabled={disabled || isPending}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
