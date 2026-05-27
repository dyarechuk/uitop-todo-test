import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onUndo: (actionId: string) => void;
  onClose: () => void;
  actionId: string;
}

export function Toast({ message, onUndo, onClose, actionId }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <button
        onClick={() => {
          onUndo(actionId);
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
      >
        Undo
      </button>
    </div>
  );
}
