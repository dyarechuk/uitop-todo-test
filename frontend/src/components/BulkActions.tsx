interface BulkActionsProps {
  selectedCount: number;
  onCompleteSelected: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function BulkActions({
  selectedCount,
  onCompleteSelected,
  onDeleteSelected,
  onSelectAll,
  onClearSelection,
  disabled,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <button
          onClick={onSelectAll}
          disabled={disabled}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Select all
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-900">
          {selectedCount} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onCompleteSelected}
          disabled={disabled}
          className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Complete
        </button>
        <button
          onClick={onDeleteSelected}
          disabled={disabled}
          className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
