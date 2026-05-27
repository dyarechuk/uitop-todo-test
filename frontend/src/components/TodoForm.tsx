import { useForm } from 'react-hook-form';
import type { Category } from '../types';

interface TodoFormProps {
  categories: Category[];
  onSubmit: (text: string, categoryId: number) => void;
  disabled?: boolean;
}

interface FormData {
  text: string;
  category_id: string;
}

export function TodoForm({ categories, onSubmit, disabled }: TodoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data.text, parseInt(data.category_id));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          {...register('text', { required: 'Task text is required' })}
          type="text"
          placeholder="What needs to be done?"
          disabled={disabled}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder:text-gray-400"
        />
        <select
          {...register('category_id', { required: 'Category is required' })}
          disabled={disabled}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 bg-white"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Add Task
        </button>
      </div>
      {(errors.text || errors.category_id) && (
        <p className="text-sm text-red-600">
          {errors.text?.message || errors.category_id?.message}
        </p>
      )}
    </form>
  );
}

